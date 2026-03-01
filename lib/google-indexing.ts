// Client-side utilities for Google Indexing
// All Google API calls are proxied through /api/indexing (server-side)
// to keep credentials secure.

import { supabase } from '../services/supabaseClient';

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

/** Returns all static page URLs for all languages */
export function getAllStaticUrls(): string[] {
    const urls: string[] = [];
    for (const [pageId, slugs] of Object.entries(PAGE_SLUGS)) {
        for (const lang of LANGS) {
            const slug = slugs[lang];
            const url = slug ? `${SITE_URL}/${lang}/${slug}/` : `${SITE_URL}/${lang}/`;
            urls.push(url);
        }
    }
    return urls;
}

/** Returns blog article URLs from a list of published posts */
export function getBlogArticleUrls(posts: Array<{ slug: string; language?: string }>): string[] {
    return posts.map(p => `${SITE_URL}/${p.language || 'fr'}/blog/${p.slug}/`);
}

/** Notifies Google of a single URL update via /api/indexing */
export async function notifyGoogleIndexing(
    url: string,
    secret: string,
    type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: boolean; message: string }> {
    try {
        const resp = await fetch('/api/indexing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secret}`,
            },
            body: JSON.stringify({ url, type }),
        });
        const data = await resp.json() as any;
        return {
            success: data.status === 'success',
            message: data.status === 'success' ? 'Soumis avec succès' : (data.error || 'Erreur'),
        };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

/** Submits up to 100 URLs to Google in batch with 100ms delay between calls */
export async function notifyMultipleUrls(
    urls: string[],
    secret: string,
    onProgress?: (done: number, total: number, lastSuccess: boolean) => void
): Promise<{ success: number; error: number }> {
    let success = 0;
    let error = 0;
    const batch = urls.slice(0, 100); // Google limit: 100 per batch

    for (let i = 0; i < batch.length; i++) {
        const result = await notifyGoogleIndexing(batch[i], secret);
        if (result.success) success++; else error++;
        if (onProgress) onProgress(i + 1, batch.length, result.success);
        if (i < batch.length - 1) await new Promise(r => setTimeout(r, 100));
    }

    return { success, error };
}

/** Pings Google with the sitemap URL */
export async function pingSitemap(): Promise<{ success: boolean; message: string }> {
    try {
        const resp = await fetch('/api/sitemap-ping');
        const data = await resp.json() as any;
        return { success: data.success, message: data.message || data.error || 'Erreur' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

/** Fetches the last N indexing log entries from Supabase */
export async function getIndexingLogs(limit = 50): Promise<any[]> {
    const { data } = await supabase
        .from('indexing_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    return data || [];
}

/** Fetches published blog posts from Supabase */
export async function getPublishedPosts(): Promise<Array<{ slug: string; language: string; title?: string }>> {
    const { data } = await supabase
        .from('posts')
        .select('slug, language, title')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
    return (data || []) as any;
}
