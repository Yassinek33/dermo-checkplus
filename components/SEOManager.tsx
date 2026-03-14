import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getUrl, LANGS, isRootPath } from '../utils/routes';
import { Language } from '../context/LanguageContext';

const BASE_URL = 'https://www.dermatocheck.com';

const seoData: Record<string, Record<Language, { title: string; description: string }>> = {
    home: {
        fr: { title: 'DermatoCheck — Analyse de Peau en Ligne par IA | Évaluation Cutanée Gratuite', description: 'Analysez votre peau en ligne grâce à l\'intelligence artificielle. Questionnaire médical + photo = évaluation cutanée détaillée en 5 minutes. Gratuit, confidentiel, 24h/24. Fondé par un médecin.' },
        en: { title: 'DermatoCheck — Online Skin Analysis by AI | Free Skin Assessment', description: 'Analyse your skin online with AI. Clinical questionnaire + photo = indicative assessment in minutes. Free, private, GDPR-compliant. Doctor-founded.' },
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

/* ══════════════════════════════════════════════════════════════
   JSON-LD SCHEMAS — Language-specific for homepage
   ══════════════════════════════════════════════════════════════ */
function getHomeJsonLd(language: Language): string[] {
    if (language === 'en') {
        return [
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MedicalWebPage",
                "name": "DermatoCheck — Online Skin Analysis by AI",
                "description": "Analyse your skin online with AI. Clinical questionnaire + photo = indicative assessment in minutes. Free, private, GDPR-compliant. Doctor-founded.",
                "url": "https://www.dermatocheck.com/en/",
                "inLanguage": "en",
                "specialty": "Dermatology",
                "lastReviewed": "2026-03-04",
                "reviewedBy": { "@type": "Person", "name": "Dr. Yassine Khafifi", "jobTitle": "Physician" }
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "DermatoCheck",
                "url": "https://www.dermatocheck.com",
                "logo": "https://www.dermatocheck.com/favicon.png",
                "founder": { "@type": "Person", "name": "Dr. Yassine Khafifi", "jobTitle": "Physician", "sameAs": "https://www.dermatocheck.com/en/about/" },
                "foundingDate": "2024",
                "areaServed": ["FR", "BE", "NL", "GB", "ES"]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "DermatoCheck",
                "url": "https://www.dermatocheck.com/en/",
                "applicationCategory": "HealthApplication",
                "inLanguage": "en",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "inLanguage": "en",
                "mainEntity": [
                    { "@type": "Question", "name": "How do I know if a mole is dangerous?", "acceptedAnswer": { "@type": "Answer", "text": "A mole that changes in shape, colour, size, or that bleeds warrants an assessment. DermatoCheck analyses these criteria and guides you towards a dermatologist if needed." } },
                    { "@type": "Question", "name": "Does DermatoCheck replace a dermatologist?", "acceptedAnswer": { "@type": "Answer", "text": "No. DermatoCheck is a tool that supports guided self-observation. It provides an indicative assessment and directs you to a specialist when necessary. It never replaces a medical diagnosis." } },
                    { "@type": "Question", "name": "Is AI skin analysis reliable?", "acceptedAnswer": { "@type": "Answer", "text": "Our AI is trained on thousands of clinical cases and combines your questionnaire responses with photo analysis. Results are indicative and designed to guide you, not to substitute for a doctor." } },
                    { "@type": "Question", "name": "How much does a DermatoCheck analysis cost?", "acceptedAnswer": { "@type": "Answer", "text": "The analysis is completely free. No hidden fees, no subscription." } },
                    { "@type": "Question", "name": "Is my medical data protected?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Your data is encrypted and processed in compliance with GDPR. It is never shared with third parties." } },
                    { "@type": "Question", "name": "How long does it take to get my assessment?", "acceptedAnswer": { "@type": "Answer", "text": "A few minutes. After completing the questionnaire and submitting your photo, the AI generates your report immediately." } },
                    { "@type": "Question", "name": "Can I upload a photo of my skin concern?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Adding a photo significantly enriches the analysis. The upload is secure and optional." } },
                    { "@type": "Question", "name": "When should I see a dermatologist urgently?", "acceptedAnswer": { "@type": "Answer", "text": "If your lesion bleeds, grows rapidly, changes colour, or causes intense pain, see a dermatologist without delay. DermatoCheck can help you assess the level of urgency." } }
                ]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dermatocheck.com/en/" },
                    { "@type": "ListItem", "position": 2, "name": "DermatoCheck", "item": "https://www.dermatocheck.com/en/" }
                ]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "How to analyse a skin concern with DermatoCheck",
                "description": "In 3 simple steps, get a detailed assessment of your skin concern.",
                "totalTime": "PT5M",
                "inLanguage": "en",
                "step": [
                    { "@type": "HowToStep", "name": "Complete the clinical questionnaire", "text": "Describe your skin symptoms: location, appearance, duration, changes over time. 15 structured clinical questions." },
                    { "@type": "HowToStep", "name": "Upload a photo of your skin concern", "text": "Upload a photo of the affected area to enhance the analysis. Optional but recommended for greater precision." },
                    { "@type": "HowToStep", "name": "Receive your detailed assessment", "text": "Our AI combines your answers and photo to generate a personalised report: risk assessment, dermatological hypotheses, and a consultation recommendation if needed." }
                ]
            })
        ];
    }
    if (language === 'es') {
        return [
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MedicalWebPage",
                "name": "DermatoCheck — Análisis de Piel Online con IA",
                "description": "Analiza tu piel online con inteligencia artificial. Cuestionario médico + foto = evaluación cutánea detallada en 5 minutos. Gratuito, confidencial, 24/7. Fundado por un médico.",
                "url": "https://www.dermatocheck.com/es/",
                "inLanguage": "es",
                "specialty": "Dermatology",
                "lastReviewed": "2026-03-04",
                "reviewedBy": { "@type": "Person", "name": "Dr. Yassine Khafifi", "jobTitle": "Médico" }
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "DermatoCheck",
                "url": "https://www.dermatocheck.com",
                "logo": "https://www.dermatocheck.com/favicon.png",
                "founder": { "@type": "Person", "name": "Dr. Yassine Khafifi", "jobTitle": "Médico", "sameAs": "https://www.dermatocheck.com/es/sobre-nosotros/" },
                "foundingDate": "2024",
                "areaServed": ["FR", "BE", "NL", "GB", "ES"]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "DermatoCheck",
                "url": "https://www.dermatocheck.com/es/",
                "applicationCategory": "HealthApplication",
                "inLanguage": "es",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "inLanguage": "es",
                "mainEntity": [
                    { "@type": "Question", "name": "¿Cómo saber si un lunar es peligroso?", "acceptedAnswer": { "@type": "Answer", "text": "Un lunar que cambia de forma, color, tamaño o que sangra merece una evaluación. DermatoCheck analiza estos criterios y te orienta hacia un dermatólogo si es necesario." } },
                    { "@type": "Question", "name": "¿DermatoCheck sustituye a un dermatólogo?", "acceptedAnswer": { "@type": "Answer", "text": "No. DermatoCheck es una herramienta de apoyo a la autoobservación guiada. Proporciona una evaluación orientativa y te dirige hacia un especialista cuando es necesario. Nunca sustituye un diagnóstico médico." } },
                    { "@type": "Question", "name": "¿Es fiable el análisis de piel con IA?", "acceptedAnswer": { "@type": "Answer", "text": "Nuestra IA está entrenada con miles de casos clínicos y combina tus respuestas al cuestionario con el análisis fotográfico. Los resultados son orientativos y están pensados para guiarte, no para sustituir a un médico." } },
                    { "@type": "Question", "name": "¿Cuánto cuesta el análisis de DermatoCheck?", "acceptedAnswer": { "@type": "Answer", "text": "El análisis es completamente gratuito. Sin costes ocultos, sin suscripción." } },
                    { "@type": "Question", "name": "¿Están protegidos mis datos médicos?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Tus datos están cifrados y se tratan de acuerdo con el RGPD. Nunca se comparten con terceros." } },
                    { "@type": "Question", "name": "¿Cuánto tiempo tarda en llegar mi evaluación?", "acceptedAnswer": { "@type": "Answer", "text": "Unos pocos minutos. Tras completar el cuestionario y enviar tu foto, la IA genera tu informe de inmediato." } },
                    { "@type": "Question", "name": "¿Puedo subir una foto de mi lesión cutánea?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. Añadir una foto enriquece considerablemente el análisis. La subida es segura y opcional." } },
                    { "@type": "Question", "name": "¿Cuándo debo consultar a un dermatólogo con urgencia?", "acceptedAnswer": { "@type": "Answer", "text": "Si tu lesión sangra, crece rápidamente, cambia de color o provoca un dolor intenso, consulta a un dermatólogo sin demora. DermatoCheck puede ayudarte a evaluar el nivel de urgencia." } }
                ]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.dermatocheck.com/es/" },
                    { "@type": "ListItem", "position": 2, "name": "DermatoCheck", "item": "https://www.dermatocheck.com/es/" }
                ]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "Cómo analizar un problema de piel con DermatoCheck",
                "description": "En 3 sencillos pasos, obtén una evaluación detallada de tu problema de piel.",
                "totalTime": "PT5M",
                "inLanguage": "es",
                "step": [
                    { "@type": "HowToStep", "name": "Responde al cuestionario médico", "text": "Describe tus síntomas cutáneos: localización, aspecto, duración y evolución. 15 preguntas clínicas estructuradas." },
                    { "@type": "HowToStep", "name": "Sube una foto de tu lesión", "text": "Sube una foto de la zona afectada para enriquecer el análisis. Opcional pero recomendado para mayor precisión." },
                    { "@type": "HowToStep", "name": "Recibe tu evaluación detallada", "text": "Nuestra IA combina tus respuestas y tu foto para generar un informe personalizado: evaluación de riesgo, hipótesis dermatológicas y recomendación de consulta si es necesario." }
                ]
            })
        ];
    }
    if (language === 'nl') {
        return [
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MedicalWebPage",
                "name": "DermatoCheck — Online Huidanalyse met AI",
                "description": "Analyseer je huid online met kunstmatige intelligentie. Klinische vragenlijst + foto = uitgebreide huidbeoordeling in 5 minuten. Gratis, vertrouwelijk, 24/7. Opgericht door een arts.",
                "url": "https://www.dermatocheck.com/nl/",
                "inLanguage": "nl",
                "specialty": "Dermatology",
                "lastReviewed": "2026-03-04",
                "reviewedBy": { "@type": "Person", "name": "Dr. Yassine Khafifi", "jobTitle": "Arts" }
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "DermatoCheck",
                "url": "https://www.dermatocheck.com",
                "logo": "https://www.dermatocheck.com/favicon.png",
                "founder": { "@type": "Person", "name": "Dr. Yassine Khafifi", "jobTitle": "Arts", "sameAs": "https://www.dermatocheck.com/nl/over-ons/" },
                "foundingDate": "2024",
                "areaServed": ["FR", "BE", "NL", "GB", "ES"]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "DermatoCheck",
                "url": "https://www.dermatocheck.com/nl/",
                "applicationCategory": "HealthApplication",
                "inLanguage": "nl",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "inLanguage": "nl",
                "mainEntity": [
                    { "@type": "Question", "name": "Hoe weet ik of een moedervlek gevaarlijk is?", "acceptedAnswer": { "@type": "Answer", "text": "Een moedervlek die van vorm, kleur, grootte verandert of bloedt verdient een beoordeling. DermatoCheck analyseert deze criteria en wijst je naar een dermatoloog als dat nodig is." } },
                    { "@type": "Question", "name": "Vervangt DermatoCheck een dermatoloog?", "acceptedAnswer": { "@type": "Answer", "text": "Nee. DermatoCheck is een hulpmiddel voor begeleide zelfobservatie. Het biedt een indicatieve beoordeling en wijst je naar een specialist wanneer dat nodig is. Het vervangt nooit een medische diagnose." } },
                    { "@type": "Question", "name": "Is huidanalyse met AI betrouwbaar?", "acceptedAnswer": { "@type": "Answer", "text": "Onze AI is getraind op duizenden klinische cases en combineert je antwoorden op de vragenlijst met de foto-analyse. De resultaten zijn indicatief en bedoeld om je te begeleiden, niet om een arts te vervangen." } },
                    { "@type": "Question", "name": "Hoeveel kost een analyse bij DermatoCheck?", "acceptedAnswer": { "@type": "Answer", "text": "De analyse is volledig gratis. Geen verborgen kosten, geen abonnement." } },
                    { "@type": "Question", "name": "Zijn mijn medische gegevens beschermd?", "acceptedAnswer": { "@type": "Answer", "text": "Ja. Je gegevens zijn versleuteld en worden verwerkt conform de AVG. Ze worden nooit gedeeld met derden." } },
                    { "@type": "Question", "name": "Hoe lang duurt het om mijn beoordeling te krijgen?", "acceptedAnswer": { "@type": "Answer", "text": "Enkele minuten. Na het invullen van de vragenlijst en het indienen van je foto genereert de AI direct je rapport." } },
                    { "@type": "Question", "name": "Kan ik een foto van mijn huidklacht uploaden?", "acceptedAnswer": { "@type": "Answer", "text": "Ja. Het toevoegen van een foto verrijkt de analyse aanzienlijk. Het uploaden is beveiligd en optioneel." } },
                    { "@type": "Question", "name": "Wanneer moet ik met spoed naar een dermatoloog?", "acceptedAnswer": { "@type": "Answer", "text": "Als je huidaandoening bloedt, snel groeit, van kleur verandert of hevige pijn veroorzaakt, raadpleeg dan onmiddellijk een dermatoloog. DermatoCheck kan je helpen het urgentieniveau in te schatten." } }
                ]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dermatocheck.com/nl/" },
                    { "@type": "ListItem", "position": 2, "name": "DermatoCheck", "item": "https://www.dermatocheck.com/nl/" }
                ]
            }),
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "Hoe analyseer je een huidprobleem met DermatoCheck",
                "description": "In 3 eenvoudige stappen krijg je een uitgebreide beoordeling van je huidprobleem.",
                "totalTime": "PT5M",
                "inLanguage": "nl",
                "step": [
                    { "@type": "HowToStep", "name": "Vul de klinische vragenlijst in", "text": "Beschrijf je huidsymptomen: locatie, uiterlijk, duur en veranderingen. 15 gestructureerde klinische vragen." },
                    { "@type": "HowToStep", "name": "Upload een foto van je huidklacht", "text": "Upload een foto van het aangedane gebied om de analyse te verrijken. Optioneel maar aanbevolen voor meer precisie." },
                    { "@type": "HowToStep", "name": "Ontvang je uitgebreide beoordeling", "text": "Onze AI combineert je antwoorden en je foto om een gepersonaliseerd rapport te genereren: risicobeoordeling, dermatologische hypotheses en een consultaanbeveling indien nodig." }
                ]
            })
        ];
    }
    // FR and other languages: return empty (FR JSON-LD is in index.html statically)
    return [];
}

/* ══════════════════════════════════════════════════════════════
   OG / Twitter meta per language
   ══════════════════════════════════════════════════════════════ */
const ogData: Record<string, Record<'fr' | 'en' | 'es' | 'nl', { title: string; description: string; locale: string; localeAlternate: string[] }>> = {
    home: {
        fr: {
            title: 'DermatoCheck — Analyse de Peau en Ligne par IA | Évaluation Cutanée Gratuite',
            description: 'Analysez votre peau en ligne grâce à l\'intelligence artificielle. Questionnaire médical + photo = évaluation cutanée détaillée en 5 minutes. Gratuit, confidentiel, 24h/24.',
            locale: 'fr_FR',
            localeAlternate: ['en_GB', 'nl_NL', 'es_ES'],
        },
        en: {
            title: 'DermatoCheck — Online Skin Analysis by AI | Free Skin Assessment',
            description: 'Analyse your skin online with AI. Clinical questionnaire + photo = indicative assessment in minutes. Free, private, GDPR-compliant.',
            locale: 'en_GB',
            localeAlternate: ['fr_FR', 'nl_NL', 'es_ES'],
        },
        es: {
            title: 'DermatoCheck — Análisis de Piel Online con IA | Evaluación Cutánea Gratuita',
            description: 'Analiza tu piel online con inteligencia artificial. Cuestionario médico + foto = evaluación cutánea detallada en 5 minutos. Gratuito, confidencial, 24/7.',
            locale: 'es_ES',
            localeAlternate: ['fr_FR', 'en_GB', 'nl_NL'],
        },
        nl: {
            title: 'DermatoCheck — Online Huidanalyse met AI | Gratis Huidbeoordeling',
            description: 'Analyseer je huid online met kunstmatige intelligentie. Klinische vragenlijst + foto = uitgebreide huidbeoordeling in 5 minuten. Gratis, vertrouwelijk, 24/7.',
            locale: 'nl_NL',
            localeAlternate: ['fr_FR', 'en_GB', 'es_ES'],
        },
    },
};

interface SEOManagerProps {
    currentPageId: string;
    language?: Language;
}

export const SEOManager = ({ currentPageId, language = 'en' }: SEOManagerProps) => {
    const location = useLocation();

    useEffect(() => {
        const onRoot = isRootPath(location.pathname);
        // For SEO content, root "/" uses English
        const effectiveLang = language;

        const pageSeo = seoData[currentPageId] || seoData['home'];
        const seo = pageSeo[effectiveLang] || pageSeo['en'];

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
        document.documentElement.lang = effectiveLang;

        // Update canonical — root "/" gets bare domain, others get /{lang}/...
        const canonicalHref = onRoot
            ? `${BASE_URL}/`
            : `${BASE_URL}${getUrl(effectiveLang, currentPageId)}`;
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

        // Inject fresh hreflang tags for each language
        LANGS.forEach(lang => {
            const link = document.createElement('link');
            link.setAttribute('rel', 'alternate');
            link.setAttribute('hreflang', lang);
            link.setAttribute('href', `${BASE_URL}${getUrl(lang, currentPageId)}`);
            document.head.appendChild(link);
        });

        // x-default → bare root https://www.dermatocheck.com/
        const xDefault = document.createElement('link');
        xDefault.setAttribute('rel', 'alternate');
        xDefault.setAttribute('hreflang', 'x-default');
        xDefault.setAttribute('href', currentPageId === 'home' ? `${BASE_URL}/` : `${BASE_URL}${getUrl('en', currentPageId)}`);
        document.head.appendChild(xDefault);

        // ── Dynamic JSON-LD injection for homepage ──
        // Remove all dynamically injected JSON-LD (identified by data attr)
        document.querySelectorAll('script[data-seo-dynamic="true"]').forEach(el => el.remove());

        if (currentPageId === 'home') {
            const schemas = getHomeJsonLd(language);
            schemas.forEach(schema => {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.setAttribute('data-seo-dynamic', 'true');
                script.textContent = schema;
                document.head.appendChild(script);
            });
        }

        // ── OG / Twitter meta tags ──
        const langKey: 'fr' | 'en' | 'es' | 'nl' = (language === 'fr' || language === 'en' || language === 'es' || language === 'nl') ? language : 'en';
        const pageOg = ogData[currentPageId]?.[langKey];
        if (pageOg) {
            const setMeta = (property: string, content: string) => {
                let el = document.querySelector(`meta[property="${property}"]`);
                if (el) {
                    el.setAttribute('content', content);
                } else {
                    el = document.createElement('meta');
                    el.setAttribute('property', property);
                    el.setAttribute('content', content);
                    document.head.appendChild(el);
                }
            };
            const setMetaName = (name: string, content: string) => {
                let el = document.querySelector(`meta[name="${name}"]`);
                if (el) {
                    el.setAttribute('content', content);
                } else {
                    el = document.createElement('meta');
                    el.setAttribute('name', name);
                    el.setAttribute('content', content);
                    document.head.appendChild(el);
                }
            };

            setMeta('og:title', pageOg.title);
            setMeta('og:description', pageOg.description);
            setMeta('og:url', canonicalHref);
            setMeta('og:locale', pageOg.locale);

            // Remove old og:locale:alternate
            document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
            pageOg.localeAlternate.forEach(alt => {
                const el = document.createElement('meta');
                el.setAttribute('property', 'og:locale:alternate');
                el.setAttribute('content', alt);
                document.head.appendChild(el);
            });

            // Twitter cards
            setMetaName('twitter:title', pageOg.title);
            setMetaName('twitter:description', pageOg.description);
        }
    }, [currentPageId, language]);

    return null;
};
