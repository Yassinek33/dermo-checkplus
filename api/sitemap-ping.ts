// Vercel Serverless Function — Ping Google with Sitemap URL
// Route: GET /api/sitemap-ping
// Notifies Google that the sitemap has been updated.
// Can be called manually from the admin or via a post-deploy webhook.

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const sitemapUrl = 'https://www.dermatocheck.com/sitemap.xml';

    try {
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        const resp = await fetch(pingUrl, { method: 'GET' });

        res.status(200).json({
            success: resp.ok,
            status: resp.status,
            sitemap: sitemapUrl,
            message: resp.ok
                ? 'Google a bien été notifié du sitemap.'
                : `Google ping a échoué (HTTP ${resp.status}).`,
        });
    } catch (e: any) {
        res.status(500).json({
            success: false,
            sitemap: sitemapUrl,
            error: e.message,
        });
    }
}
