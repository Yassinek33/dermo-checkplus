// Vercel Serverless Function — Google Indexing API Proxy
// Route: POST /api/indexing
//
// Body: { url: string, type?: 'URL_UPDATED' | 'URL_DELETED' }
// Headers: Authorization: Bearer <VITE_INDEXING_SECRET>
//
// Required Vercel env vars:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL  — service account email
//   GOOGLE_PRIVATE_KEY            — RSA private key (PEM format, \n escaped)
//   VITE_INDEXING_SECRET          — shared secret to authorize calls from admin
//   SUPABASE_SERVICE_ROLE_KEY     — (optional) for logging; falls back to anon key
//
// SQL to run in Supabase:
//   CREATE TABLE indexing_logs (
//     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//     url text NOT NULL,
//     status text NOT NULL,
//     response jsonb,
//     created_at timestamptz DEFAULT now()
//   );
//   ALTER TABLE indexing_logs ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Service role full access" ON indexing_logs
//     FOR ALL TO service_role USING (true);

import { createClient } from '@supabase/supabase-js';
import { createSign } from 'crypto';

function base64url(input: string): string {
    return Buffer.from(input)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function createServiceAccountJWT(email: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = base64url(JSON.stringify({
        iss: email,
        scope: 'https://www.googleapis.com/auth/indexing',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    }));
    const signInput = `${header}.${payload}`;
    // Fix private key: env vars often have escaped newlines
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    const sign = createSign('RSA-SHA256');
    sign.update(signInput);
    const signature = sign.sign(formattedKey, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${signInput}.${signature}`;
}

async function getGoogleAccessToken(email: string, privateKey: string): Promise<string> {
    const jwt = createServiceAccountJWT(email, privateKey);
    const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });
    const data = await resp.json() as any;
    if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);
    return data.access_token;
}

export default async function handler(req: any, res: any) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // Authorization check
    const secret = process.env.VITE_INDEXING_SECRET || process.env.INDEXING_SECRET;
    if (secret) {
        const auth = req.headers['authorization'];
        if (auth !== `Bearer ${secret}`) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { url, type = 'URL_UPDATED' } = body || {};

    if (!url) {
        res.status(400).json({ error: 'Missing url parameter' });
        return;
    }

    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceEmail || !privateKey) {
        res.status(500).json({ error: 'Google credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in Vercel env vars.' });
        return;
    }

    let status = 'error';
    let responseData: any = null;

    try {
        const accessToken = await getGoogleAccessToken(serviceEmail, privateKey);
        const indexResp = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, type }),
        });
        responseData = await indexResp.json();
        status = indexResp.ok ? 'success' : 'error';
    } catch (e: any) {
        responseData = { error: e.message };
        status = 'error';
    }

    // Log to Supabase (non-blocking)
    try {
        const supabase = createClient(
            'https://jsxvixqkkwqrsnsstclt.supabase.co',
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeHZpeHFra3dxcnNuc3N0Y2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTY5NDgsImV4cCI6MjA4NjczMjk0OH0.5O5vGDtEI2_0FLfGBs7fgtM82XUeRpl1ZJFcBBhS728'
        );
        await supabase.from('indexing_logs').insert({ url, status, response: responseData });
    } catch (_) {}

    res.status(status === 'success' ? 200 : 500).json({ status, response: responseData });
}
