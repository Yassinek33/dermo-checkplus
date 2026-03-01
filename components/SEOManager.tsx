import { useEffect } from 'react';
import { getUrl, LANGS } from '../utils/routes';
import { Language } from '../context/LanguageContext';

const BASE_URL = 'https://www.dermatocheck.com';

const seoData: Record<string, Record<Language, { title: string; description: string }>> = {
    home: {
        fr: { title: 'DermatoCheck — Analyse Dermatologique par IA | Diagnostic Cutané Gratuit', description: 'Analysez votre lésion cutanée par IA en 5 minutes. Questionnaire clinique en 15 étapes + analyse photo = rapport médical personnalisé. Disponible en FR, NL, EN, ES.' },
        en: { title: 'DermatoCheck — AI Skin Analysis | Free Dermatological Check', description: 'Analyse your skin lesion with AI in 5 minutes. 15-step clinical questionnaire + photo analysis = personalised medical report. Available in FR, NL, EN, ES.' },
        nl: { title: 'DermatoCheck — AI Huidanalyse | Gratis Dermatologisch Onderzoek', description: 'Analyseer uw huidlaesie met AI in 5 minuten. 15-staps klinische vragenlijst + foto-analyse = gepersonaliseerd medisch rapport. Beschikbaar in FR, NL, EN, ES.' },
        es: { title: 'DermatoCheck — Análisis Dermatológico por IA | Diagnóstico Cutáneo Gratis', description: 'Analiza tu lesión cutánea con IA en 5 minutos. Cuestionario clínico de 15 pasos + análisis de foto = informe médico personalizado. Disponible en FR, NL, EN, ES.' },
    },
    questionnaire: {
        fr: { title: 'Analyse Dermatologique Gratuite par IA — DermatoCheck', description: 'Démarrez votre analyse cutanée gratuite. Photo + 15 questions cliniques : âge, sexe, antécédents, symptômes, évolution. Rapport en moins de 5 minutes.' },
        en: { title: 'Free AI Skin Analysis — DermatoCheck', description: 'Start your free skin analysis. Photo + 15 clinical questions: age, sex, history, symptoms, evolution. Report in less than 5 minutes.' },
        nl: { title: 'Gratis AI Huidanalyse — DermatoCheck', description: 'Start uw gratis huidanalyse. Foto + 15 klinische vragen: leeftijd, geslacht, voorgeschiedenis, symptomen. Rapport in minder dan 5 minuten.' },
        es: { title: 'Análisis de Piel Gratuito por IA — DermatoCheck', description: 'Inicia tu análisis cutáneo gratuito. Foto + 15 preguntas clínicas: edad, sexo, antecedentes, síntomas. Informe en menos de 5 minutos.' },
    },
    'find-dermatologist': {
        fr: { title: 'Trouver un Dermatologue Près de Chez Vous | DermatoCheck', description: 'Trouvez un dermatologue qualifié près de chez vous. Annuaire dermatologues Belgique, France, Pays-Bas. Prise de rendez-vous rapide.' },
        en: { title: 'Find a Dermatologist Near You | DermatoCheck', description: 'Find a qualified dermatologist near you. Directory for Belgium, France, Netherlands. Quick appointment booking.' },
        nl: { title: 'Vind een Dermatoloog bij U in de Buurt | DermatoCheck', description: 'Vind een gekwalificeerde dermatoloog bij u in de buurt. Gids voor België, Frankrijk, Nederland. Snel afspraak maken.' },
        es: { title: 'Encontrar un Dermatólogo Cerca de Ti | DermatoCheck', description: 'Encuentra un dermatólogo cualificado cerca de ti. Directorio para Bélgica, Francia, Países Bajos. Cita rápida.' },
    },
    blog: {
        fr: { title: 'Blog Dermatologie — Conseils Peau & Maladies Cutanées | DermatoCheck', description: 'Guides dermatologiques, conseils peau, maladies cutanées expliquées. Eczéma, psoriasis, mélanome, acné. Rédigé avec expertise médicale.' },
        en: { title: 'Dermatology Blog — Skin Tips & Conditions | DermatoCheck', description: 'Dermatological guides, skin tips, skin conditions explained. Eczema, psoriasis, melanoma, acne. Written with medical expertise.' },
        nl: { title: 'Dermatologie Blog — Huidtips & Huidziekten | DermatoCheck', description: 'Dermatologische gidsen, huidtips, huidziekten uitgelegd. Eczeem, psoriasis, melanoom, acne. Geschreven met medische expertise.' },
        es: { title: 'Blog Dermatología — Consejos Piel & Enfermedades Cutáneas | DermatoCheck', description: 'Guías dermatológicas, consejos de piel, enfermedades cutáneas explicadas. Eccema, psoriasis, melanoma, acné.' },
    },
    about: {
        fr: { title: 'À Propos de DermatoCheck — IA Médicale & Dermatologie en Ligne', description: 'DermatoCheck est une plateforme d\'analyse dermatologique par IA. Notre mission : rendre le diagnostic cutané accessible, rapide et sécurisé.' },
        en: { title: 'About DermatoCheck — Medical AI & Online Dermatology', description: 'DermatoCheck is an AI-powered dermatological analysis platform. Our mission: make skin diagnosis accessible, fast and secure for everyone.' },
        nl: { title: 'Over DermatoCheck — Medische AI & Online Dermatologie', description: 'DermatoCheck is een AI-gestuurde dermatologische analyseplatform. Onze missie: huiddiagnose toegankelijk, snel en veilig maken voor iedereen.' },
        es: { title: 'Sobre DermatoCheck — IA Médica y Dermatología Online', description: 'DermatoCheck es una plataforma de análisis dermatológico por IA. Nuestra misión: hacer el diagnóstico cutáneo accesible, rápido y seguro.' },
    },
    faq: {
        fr: { title: 'FAQ — Questions Fréquentes sur DermatoCheck', description: 'Toutes vos questions sur DermatoCheck : fonctionnement IA, confidentialité des données, langues disponibles, maladies détectées.' },
        en: { title: 'FAQ — Frequently Asked Questions about DermatoCheck', description: 'All your questions about DermatoCheck: how AI works, data privacy, available languages, detected conditions.' },
        nl: { title: 'FAQ — Veelgestelde Vragen over DermatoCheck', description: 'Al uw vragen over DermatoCheck: hoe AI werkt, gegevensprivacy, beschikbare talen, gedetecteerde aandoeningen.' },
        es: { title: 'FAQ — Preguntas Frecuentes sobre DermatoCheck', description: 'Todas tus preguntas sobre DermatoCheck: funcionamiento IA, privacidad de datos, idiomas disponibles, enfermedades detectadas.' },
    },
    contact: {
        fr: { title: 'Contact DermatoCheck — Support & Assistance', description: 'Contactez l\'équipe DermatoCheck pour toute question. Réponse sous 24h.' },
        en: { title: 'Contact DermatoCheck — Support & Help', description: 'Contact the DermatoCheck team for any question. Response within 24 hours.' },
        nl: { title: 'Contact DermatoCheck — Ondersteuning & Hulp', description: 'Neem contact op met het DermatoCheck-team voor vragen. Reactie binnen 24 uur.' },
        es: { title: 'Contacto DermatoCheck — Soporte y Ayuda', description: 'Contacta al equipo DermatoCheck para cualquier pregunta. Respuesta en 24 horas.' },
    },
    legal: {
        fr: { title: 'Mentions Légales & Politique de Confidentialité | DermatoCheck', description: 'Mentions légales, conditions d\'utilisation et politique de confidentialité de DermatoCheck. Conformité RGPD.' },
        en: { title: 'Legal Notice & Privacy Policy | DermatoCheck', description: 'Legal notice, terms of use and privacy policy of DermatoCheck. GDPR compliant.' },
        nl: { title: 'Juridische Kennisgeving & Privacybeleid | DermatoCheck', description: 'Juridische kennisgeving, gebruiksvoorwaarden en privacybeleid van DermatoCheck. AVG-conform.' },
        es: { title: 'Aviso Legal & Política de Privacidad | DermatoCheck', description: 'Aviso legal, términos de uso y política de privacidad de DermatoCheck. Cumplimiento RGPD.' },
    },
};

interface SEOManagerProps {
    currentPageId: string;
    language?: Language;
}

export const SEOManager = ({ currentPageId, language = 'fr' }: SEOManagerProps) => {
    useEffect(() => {
        const pageSeo = seoData[currentPageId] || seoData['home'];
        const seo = pageSeo[language] || pageSeo['fr'];

        document.title = seo.title;

        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', seo.description);
        } else {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            metaDesc.setAttribute('content', seo.description);
            document.head.appendChild(metaDesc);
        }

        // Update <html lang>
        document.documentElement.lang = language;

        // Update canonical
        const canonicalHref = `${BASE_URL}${getUrl(language, currentPageId)}`;
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', canonicalHref);
        } else {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            canonical.setAttribute('href', canonicalHref);
            document.head.appendChild(canonical);
        }

        // Remove old hreflang tags
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

        // Inject fresh hreflang tags
        LANGS.forEach(lang => {
            const link = document.createElement('link');
            link.setAttribute('rel', 'alternate');
            link.setAttribute('hreflang', lang);
            link.setAttribute('href', `${BASE_URL}${getUrl(lang, currentPageId)}`);
            document.head.appendChild(link);
        });

        // x-default → /fr/
        const xDefault = document.createElement('link');
        xDefault.setAttribute('rel', 'alternate');
        xDefault.setAttribute('hreflang', 'x-default');
        xDefault.setAttribute('href', `${BASE_URL}${getUrl('fr', currentPageId)}`);
        document.head.appendChild(xDefault);
    }, [currentPageId, language]);

    return null;
};
