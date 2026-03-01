import { Language } from '../context/LanguageContext';

export const LANGS: Language[] = ['fr', 'en', 'nl', 'es'];

// Map pageId → slug per language (empty string = root of that language)
export const PAGE_SLUGS: Record<string, Record<Language, string>> = {
    home:                  { fr: '',                              en: '',                          nl: '',                            es: '' },
    questionnaire:         { fr: 'questionnaire',                 en: 'questionnaire',              nl: 'vragenlijst',                 es: 'cuestionario' },
    blog:                  { fr: 'blog',                          en: 'blog',                       nl: 'blog',                        es: 'blog' },
    'find-dermatologist':  { fr: 'trouver-dermatologue',          en: 'find-dermatologist',          nl: 'dermatoloog-vinden',          es: 'encontrar-dermatologo' },
    about:                 { fr: 'a-propos',                      en: 'about',                      nl: 'over-ons',                    es: 'sobre-nosotros' },
    faq:                   { fr: 'faq',                           en: 'faq',                        nl: 'faq',                         es: 'faq' },
    contact:               { fr: 'contact',                       en: 'contact',                    nl: 'contact',                     es: 'contacto' },
    legal:                 { fr: 'legal',                         en: 'legal',                      nl: 'legal',                       es: 'legal' },
    dictionary:            { fr: 'dictionnaire',                  en: 'dictionary',                 nl: 'woordenboek',                 es: 'diccionario' },
    auth:                  { fr: 'connexion',                     en: 'auth',                       nl: 'inloggen',                    es: 'acceso' },
    'privacy-policy':      { fr: 'politique-de-confidentialite',  en: 'privacy-policy',             nl: 'privacybeleid',               es: 'politica-de-privacidad' },
    'terms-of-use':        { fr: 'conditions-utilisation',        en: 'terms-of-use',               nl: 'gebruiksvoorwaarden',         es: 'terminos-de-uso' },
    profile:               { fr: 'profil',                        en: 'profile',                    nl: 'profiel',                     es: 'perfil' },
    admin:                 { fr: 'admin',                         en: 'admin',                      nl: 'admin',                       es: 'admin' },
};

/** Build the canonical URL for a pageId + lang combo */
export function getUrl(lang: Language, pageId: string, articleSlug?: string): string {
    if ((pageId === 'blog-article' || pageId === 'blog') && articleSlug) {
        return `/${lang}/blog/${articleSlug}/`;
    }
    const slug = PAGE_SLUGS[pageId]?.[lang];
    if (slug === undefined) return `/${lang}/`;
    return slug ? `/${lang}/${slug}/` : `/${lang}/`;
}

/** Parse a pathname into { lang, pageId, articleSlug } */
export function parsePath(pathname: string): { lang: Language; pageId: string; articleSlug?: string } {
    const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);

    const maybeLang = parts[0] as Language;
    const lang: Language = LANGS.includes(maybeLang) ? maybeLang : 'fr';
    const rest = LANGS.includes(maybeLang) ? parts.slice(1) : parts;

    const seg0 = rest[0] || '';
    const seg1 = rest[1] || '';

    // blog/:slug
    if (seg0 === 'blog' && seg1) {
        return { lang, pageId: 'blog-article', articleSlug: seg1 };
    }

    // Find matching pageId for this lang's slug
    for (const [pageId, slugs] of Object.entries(PAGE_SLUGS)) {
        if (slugs[lang] === seg0) {
            return { lang, pageId };
        }
    }

    // Fallback: try all langs (handles old links or typos)
    if (seg0) {
        for (const [pageId, slugs] of Object.entries(PAGE_SLUGS)) {
            for (const l of LANGS) {
                if (slugs[l] === seg0) {
                    return { lang, pageId };
                }
            }
        }
    }

    return { lang, pageId: 'home' };
}

/** Detect browser preferred language */
export function detectBrowserLang(): Language {
    const nav = navigator.language || navigator.languages?.[0] || 'fr';
    const short = nav.slice(0, 2).toLowerCase() as Language;
    return LANGS.includes(short) ? short : 'fr';
}
