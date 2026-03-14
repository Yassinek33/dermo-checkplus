import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getUrl, LANGS, isRootPath } from '../utils/routes';
import { Language } from '../context/LanguageContext';

const BASE_URL = 'https://www.dermatocheck.com';

const seoData: Record<string, Record<Language, { title: string; description: string }>> = {
    home: {
        fr: { title: 'DermatoCheck — Analyse de Peau par IA Gratuite | Grain de beauté, Acné, Eczéma', description: 'Analysez vos problèmes de peau en ligne avec l\'IA médicale. Photo + questionnaire clinique = rapport dermatologique personnalisé en 5 min. Gratuit, confidentiel, fondé par un médecin.' },
        en: { title: 'DermatoCheck — Free AI Skin Analysis | Moles, Acne, Eczema Check', description: 'Check your skin concerns online with medical AI. Upload a photo + answer clinical questions = personalised dermatology report in 5 minutes. Free, private, doctor-founded.' },
        nl: { title: 'DermatoCheck — Gratis AI Huidanalyse | Moedervlekken, Acne, Eczeem', description: 'Controleer uw huidklachten online met medische AI. Foto + klinische vragenlijst = gepersonaliseerd dermatologisch rapport in 5 minuten. Gratis, vertrouwelijk, opgericht door een arts.' },
        es: { title: 'DermatoCheck — Análisis de Piel con IA Gratis | Lunares, Acné, Eccema', description: 'Analiza tus problemas de piel online con IA médica. Foto + cuestionario clínico = informe dermatológico personalizado en 5 min. Gratuito, confidencial, fundado por un médico.' },
    },
    questionnaire: {
        fr: { title: 'Questionnaire Dermatologique Gratuit par IA — DermatoCheck', description: 'Commencez votre analyse de peau gratuite : envoyez une photo, répondez à 15 questions cliniques et recevez un rapport dermatologique détaillé en moins de 5 minutes.' },
        en: { title: 'Free AI Skin Questionnaire — DermatoCheck', description: 'Start your free skin check now. Upload a photo, answer 15 clinical questions about your symptoms, and receive a detailed dermatology report in under 5 minutes.' },
        nl: { title: 'Gratis AI Huidvragenlijst — DermatoCheck', description: 'Start nu uw gratis huidcontrole. Upload een foto, beantwoord 15 klinische vragen over uw symptomen en ontvang een uitgebreid dermatologisch rapport in minder dan 5 minuten.' },
        es: { title: 'Cuestionario Dermatológico Gratuito con IA — DermatoCheck', description: 'Comienza tu análisis de piel gratuito. Sube una foto, responde 15 preguntas clínicas sobre tus síntomas y recibe un informe dermatológico detallado en menos de 5 minutos.' },
    },
    'find-dermatologist': {
        fr: { title: 'Trouver un Dermatologue Près de Chez Vous | DermatoCheck', description: 'Annuaire de dermatologues en Belgique, France et Pays-Bas. Trouvez un spécialiste de la peau qualifié près de chez vous et prenez rendez-vous rapidement.' },
        en: { title: 'Find a Dermatologist Near You | DermatoCheck', description: 'Search our directory of qualified dermatologists in Belgium, France and the Netherlands. Find a skin specialist nearby and book your appointment quickly.' },
        nl: { title: 'Vind een Dermatoloog bij U in de Buurt | DermatoCheck', description: 'Doorzoek onze gids van gekwalificeerde dermatologen in België, Frankrijk en Nederland. Vind een huidspecialist bij u in de buurt en maak snel een afspraak.' },
        es: { title: 'Encontrar un Dermatólogo Cerca de Ti | DermatoCheck', description: 'Directorio de dermatólogos cualificados en Bélgica, Francia y Países Bajos. Encuentra un especialista en piel cerca de ti y pide cita rápidamente.' },
    },
    blog: {
        fr: { title: 'Blog Dermatologie — Acné, Eczéma, Mélanome, Soins Peau | DermatoCheck', description: 'Guides et articles dermatologiques rédigés avec expertise médicale. Acné, eczéma, psoriasis, mélanome, rides, soins de la peau : tout comprendre pour mieux protéger votre peau.' },
        en: { title: 'Dermatology Blog — Acne, Eczema, Melanoma, Skincare | DermatoCheck', description: 'Expert dermatology guides and articles. Acne, eczema, psoriasis, melanoma, wrinkles, skincare routines — understand your skin conditions and learn how to protect your skin.' },
        nl: { title: 'Dermatologie Blog — Acne, Eczeem, Melanoom, Huidverzorging | DermatoCheck', description: 'Deskundige dermatologische gidsen en artikelen. Acne, eczeem, psoriasis, melanoom, rimpels, huidverzorging — begrijp uw huidaandoeningen en bescherm uw huid beter.' },
        es: { title: 'Blog Dermatología — Acné, Eccema, Melanoma, Cuidado de Piel | DermatoCheck', description: 'Guías y artículos dermatológicos con experiencia médica. Acné, eccema, psoriasis, melanoma, arrugas, rutinas de piel: comprende tus problemas cutáneos y protege tu piel.' },
    },
    about: {
        fr: { title: 'À Propos de DermatoCheck — IA Médicale au Service de la Dermatologie', description: 'DermatoCheck est une plateforme d\'analyse de peau par intelligence artificielle, fondée par un médecin. Notre mission : rendre l\'évaluation dermatologique accessible, rapide et gratuite.' },
        en: { title: 'About DermatoCheck — Medical AI for Skin Health', description: 'DermatoCheck is a doctor-founded AI skin analysis platform. Our mission: make dermatological assessment accessible, fast and free for everyone, anywhere.' },
        nl: { title: 'Over DermatoCheck — Medische AI voor Huidgezondheid', description: 'DermatoCheck is een door een arts opgericht AI-platform voor huidanalyse. Onze missie: dermatologische beoordeling toegankelijk, snel en gratis maken voor iedereen.' },
        es: { title: 'Sobre DermatoCheck — IA Médica para la Salud de tu Piel', description: 'DermatoCheck es una plataforma de análisis de piel con IA, fundada por un médico. Nuestra misión: hacer la evaluación dermatológica accesible, rápida y gratuita para todos.' },
    },
    faq: {
        fr: { title: 'FAQ DermatoCheck — Comment Fonctionne l\'Analyse de Peau par IA ?', description: 'Comment fonctionne DermatoCheck ? L\'IA est-elle fiable ? Mes données sont-elles protégées ? Réponses à toutes vos questions sur l\'analyse dermatologique en ligne gratuite.' },
        en: { title: 'FAQ DermatoCheck — How Does AI Skin Analysis Work?', description: 'How does DermatoCheck work? Is the AI reliable? Is my data protected? Answers to all your questions about free online dermatological analysis.' },
        nl: { title: 'FAQ DermatoCheck — Hoe Werkt AI Huidanalyse?', description: 'Hoe werkt DermatoCheck? Is de AI betrouwbaar? Zijn mijn gegevens beschermd? Antwoorden op al uw vragen over gratis online dermatologische analyse.' },
        es: { title: 'FAQ DermatoCheck — ¿Cómo Funciona el Análisis de Piel con IA?', description: '¿Cómo funciona DermatoCheck? ¿Es fiable la IA? ¿Están protegidos mis datos? Respuestas a todas tus preguntas sobre el análisis dermatológico online gratuito.' },
    },
    contact: {
        fr: { title: 'Contactez DermatoCheck — Questions, Support & Partenariats', description: 'Une question sur votre analyse de peau ou sur DermatoCheck ? Contactez notre équipe médicale. Réponse garantie sous 24h. Support disponible en français, anglais, néerlandais et espagnol.' },
        en: { title: 'Contact DermatoCheck — Questions, Support & Partnerships', description: 'Have a question about your skin analysis or DermatoCheck? Contact our medical team. Guaranteed response within 24 hours. Support available in English, French, Dutch and Spanish.' },
        nl: { title: 'Contact DermatoCheck — Vragen, Ondersteuning & Samenwerkingen', description: 'Een vraag over uw huidanalyse of DermatoCheck? Neem contact op met ons medisch team. Gegarandeerd antwoord binnen 24 uur. Ondersteuning in het Nederlands, Frans, Engels en Spaans.' },
        es: { title: 'Contacto DermatoCheck — Preguntas, Soporte y Colaboraciones', description: '¿Tienes una pregunta sobre tu análisis de piel o DermatoCheck? Contacta con nuestro equipo médico. Respuesta garantizada en 24h. Soporte en español, francés, inglés y neerlandés.' },
    },
    legal: {
        fr: { title: 'Mentions Légales & Politique de Confidentialité | DermatoCheck', description: 'Consultez les mentions légales, conditions d\'utilisation et la politique de confidentialité de DermatoCheck. Vos données médicales sont protégées conformément au RGPD.' },
        en: { title: 'Legal Notice & Privacy Policy | DermatoCheck', description: 'Read DermatoCheck\'s legal notice, terms of use and privacy policy. Your medical data is protected in full compliance with GDPR regulations.' },
        nl: { title: 'Juridische Kennisgeving & Privacybeleid | DermatoCheck', description: 'Lees de juridische kennisgeving, gebruiksvoorwaarden en het privacybeleid van DermatoCheck. Uw medische gegevens zijn beschermd conform de AVG-wetgeving.' },
        es: { title: 'Aviso Legal & Política de Privacidad | DermatoCheck', description: 'Consulta el aviso legal, los términos de uso y la política de privacidad de DermatoCheck. Tus datos médicos están protegidos conforme al RGPD.' },
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
            title: 'DermatoCheck — Analyse de Peau par IA Gratuite | Grain de beauté, Acné, Eczéma',
            description: 'Analysez vos problèmes de peau en ligne avec l\'IA médicale. Photo + questionnaire clinique = rapport dermatologique personnalisé en 5 min. Gratuit, confidentiel, fondé par un médecin.',
            locale: 'fr_FR',
            localeAlternate: ['en_GB', 'nl_NL', 'es_ES'],
        },
        en: {
            title: 'DermatoCheck — Free AI Skin Analysis | Moles, Acne, Eczema Check',
            description: 'Check your skin concerns online with medical AI. Upload a photo + answer clinical questions = personalised dermatology report in 5 minutes. Free, private, doctor-founded.',
            locale: 'en_GB',
            localeAlternate: ['fr_FR', 'nl_NL', 'es_ES'],
        },
        es: {
            title: 'DermatoCheck — Análisis de Piel con IA Gratis | Lunares, Acné, Eccema',
            description: 'Analiza tus problemas de piel online con IA médica. Foto + cuestionario clínico = informe dermatológico personalizado en 5 min. Gratuito, confidencial, fundado por un médico.',
            locale: 'es_ES',
            localeAlternate: ['fr_FR', 'en_GB', 'nl_NL'],
        },
        nl: {
            title: 'DermatoCheck — Gratis AI Huidanalyse | Moedervlekken, Acne, Eczeem',
            description: 'Controleer uw huidklachten online met medische AI. Foto + klinische vragenlijst = gepersonaliseerd dermatologisch rapport in 5 minuten. Gratis, vertrouwelijk, opgericht door een arts.',
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
