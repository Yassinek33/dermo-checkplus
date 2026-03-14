// Vercel Serverless Function — Dynamic Sitemap Generator
// Route: GET /sitemap.xml  (via vercel.json rewrite)
// Fetches published blog posts from Supabase + generates full multilingual sitemap
//
// SQL to run in Supabase if indexing_logs table does not exist:
//   CREATE TABLE indexing_logs (
//     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//     url text NOT NULL,
//     status text NOT NULL,
//     response jsonb,
//     created_at timestamptz DEFAULT now()
//   );

import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.dermatocheck.com';
const LANGS = ['fr', 'en', 'nl', 'es'] as const;

const PAGE_SLUGS: Record<string, Record<string, string>> = {
    home:                 { fr: '',                              en: '',                          nl: '',                            es: '' },
    questionnaire:        { fr: 'questionnaire',                 en: 'questionnaire',             nl: 'vragenlijst',                 es: 'cuestionario' },
    blog:                 { fr: 'blog',                          en: 'blog',                      nl: 'blog',                        es: 'blog' },
    'find-dermatologist': { fr: 'trouver-dermatologue',          en: 'find-dermatologist',         nl: 'dermatoloog-vinden',          es: 'encontrar-dermatologo' },
    about:                { fr: 'a-propos',                      en: 'about',                     nl: 'over-ons',                    es: 'sobre-nosotros' },
    faq:                  { fr: 'faq',                           en: 'faq',                       nl: 'faq',                         es: 'faq' },
    contact:              { fr: 'contact',                       en: 'contact',                   nl: 'contact',                     es: 'contacto' },
    dictionary:           { fr: 'dictionnaire',                  en: 'dictionary',                nl: 'woordenboek',                 es: 'diccionario' },
    'privacy-policy':     { fr: 'politique-de-confidentialite',  en: 'privacy-policy',            nl: 'privacybeleid',               es: 'politica-de-privacidad' },
    'terms-of-use':       { fr: 'conditions-utilisation',        en: 'terms-of-use',              nl: 'gebruiksvoorwaarden',         es: 'terminos-de-uso' },
};

const PAGE_META: Record<string, { priority: string; changefreq: string }> = {
    home:                 { priority: '1.0', changefreq: 'weekly' },
    questionnaire:        { priority: '0.9', changefreq: 'monthly' },
    blog:                 { priority: '0.8', changefreq: 'daily' },
    'find-dermatologist': { priority: '0.8', changefreq: 'monthly' },
    about:                { priority: '0.7', changefreq: 'monthly' },
    faq:                  { priority: '0.7', changefreq: 'monthly' },
    contact:              { priority: '0.6', changefreq: 'monthly' },
    dictionary:           { priority: '0.6', changefreq: 'monthly' },
    'privacy-policy':     { priority: '0.4', changefreq: 'yearly' },
    'terms-of-use':       { priority: '0.4', changefreq: 'yearly' },
};

function getPageUrl(lang: string, pageId: string): string {
    const slug = PAGE_SLUGS[pageId]?.[lang];
    if (slug === undefined) return `${SITE_URL}/${lang}/`;
    return slug ? `${SITE_URL}/${lang}/${slug}/` : `${SITE_URL}/${lang}/`;
}

function hreflangAlternates(langUrls: Record<string, string>, xDefaultUrl?: string): string {
    const links = Object.entries(langUrls)
        .map(([lang, url]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`)
        .join('\n');
    const defaultUrl = xDefaultUrl || langUrls['en'] || Object.values(langUrls)[0];
    return `${links}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>`;
}

function staticPageEntry(pageId: string, today: string): string {
    const meta = PAGE_META[pageId] || { priority: '0.5', changefreq: 'monthly' };
    const langUrls: Record<string, string> = {};
    for (const lang of LANGS) {
        langUrls[lang] = getPageUrl(lang, pageId);
    }
    // For homepage, x-default points to bare root; primary URL is the root
    const isHome = pageId === 'home';
    const primaryUrl = isHome ? `${SITE_URL}/` : langUrls['en'];
    const xDefault = isHome ? `${SITE_URL}/` : undefined;
    return `  <url>
    <loc>${primaryUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
${hreflangAlternates(langUrls, xDefault)}
  </url>`;
}

function blogArticleEntry(slug: string, langCode: string, updatedAt: string): string {
    const url = `${SITE_URL}/${langCode}/blog/${slug}/`;
    const lastmod = updatedAt ? updatedAt.split('T')[0] : new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="${langCode}" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>
  </url>`;
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        res.status(405).end('Method Not Allowed');
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Fetch published blog posts from Supabase
    let blogEntries = '';
    try {
        const supabase = createClient(
            'https://jsxvixqkkwqrsnsstclt.supabase.co',
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeHZpeHFra3dxcnNuc3N0Y2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTY5NDgsImV4cCI6MjA4NjczMjk0OH0.5O5vGDtEI2_0FLfGBs7fgtM82XUeRpl1ZJFcBBhS728'
        );
        const { data: posts } = await supabase
            .from('posts')
            .select('slug, updated_at, language')
            .eq('status', 'published');

        if (posts && posts.length > 0) {
            blogEntries = posts
                .map((p: any) => blogArticleEntry(p.slug, p.language || 'fr', p.updated_at))
                .join('\n');
        }
    } catch (_) {
        // Non-blocking: sitemap still generated without blog posts
    }

    const staticEntries = Object.keys(PAGE_SLUGS)
        .map(pageId => staticPageEntry(pageId, today))
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticEntries}
${blogEntries}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
}
