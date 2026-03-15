import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PageConfig } from '../types';
import MagneticButton from './MagneticButton';
import { useLanguage, Language } from '../context/LanguageContext';
import { ReviewSection } from './ReviewSection';

interface HomePageProps {
    config?: PageConfig;
    onStart: () => void;
    onNavigate: (page: string) => void;
    user?: any;
}

/* ────────── Animated Counter Hook ────────── */
function useAnimatedCounter(target: number, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const start = performance.now();
                    const animate = (now: number) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        setCount(Math.floor(progress * target));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}

/* ────────── Fade-in Section Wrapper ────────── */
const FadeInSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number; id?: string }> = ({ children, className = '', delay = 0, id }) => (
    <motion.section
        id={id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        className={className}
    >
        {children}
    </motion.section>
);

/* ────────── FAQ Accordion Item ────────── */
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-[16px] transition-colors hover:bg-white/[0.06]">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open}
            >
                <span className="text-base md:text-lg font-semibold text-[#F8FAFC]">{question}</span>
                <svg
                    className={`w-5 h-5 text-[#2DD4BF] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <p className="px-6 pb-5 text-[#94A3B8] text-sm leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   CONTENT MAP — FR + EN
   ══════════════════════════════════════════════════════════════ */
type HomeContent = {
    hero: {
        h1: string; h2: string; body: string;
        ctaPrimary: string; ctaSecondary: string;
        badge1: string; badge2: string; badge3: string;
        counterLabel: string;
    };
    howItWorks: {
        h2: string; intro: string;
        steps: { title: string; desc: string }[];
        cta: string;
    };
    skinConcerns: {
        h2: string; intro: string;
        cards: { title: string; desc: string }[];
        note: string; cta: string;
    };
    trust: {
        h2: string;
        blocks: { title: string; desc: string }[];
        disclaimerLabel: string; disclaimerText: string;
    };
    advantages: {
        h2: string;
        items: { title: string; desc: string }[];
    };
    faq: {
        h2: string;
        items: { q: string; a: string }[];
    };
    finalCta: {
        h2: string; body: string; cta: string; micro: string;
    };
};

const content: Record<'fr' | 'en' | 'es' | 'nl', HomeContent> = {
    fr: {
        hero: {
            h1: 'Analyse de peau en ligne par intelligence artificielle',
            h2: 'Votre peau vous inquiète ? Obtenez une évaluation en quelques minutes',
            body: 'Soumettez un questionnaire médical structuré et une photo de votre lésion cutanée. Notre IA génère une évaluation indicative, un niveau de risque, et une recommandation de consultation si nécessaire.',
            ctaPrimary: 'Démarrer mon analyse gratuite',
            ctaSecondary: 'Découvrir comment ça marche',
            badge1: 'Fondé par un médecin',
            badge2: 'Gratuit • Confidentiel • 24h/24',
            badge3: 'Conforme RGPD',
            counterLabel: 'analyses réalisées',
        },
        howItWorks: {
            h2: 'Comment fonctionne l\'analyse cutanée DermatoCheck',
            intro: 'En 3 étapes simples, obtenez une évaluation détaillée de votre problème de peau. Sans rendez-vous, sans déplacement, disponible 24h/24.',
            steps: [
                { title: 'Étape 1 — Répondez au questionnaire médical', desc: 'Décrivez vos symptômes cutanés : localisation, aspect, durée, évolution. 15 questions cliniques structurées.' },
                { title: 'Étape 2 — Ajoutez une photo de votre lésion', desc: 'Téléchargez une photo de la zone concernée pour enrichir l\'analyse. Optionnel mais recommandé pour plus de précision.' },
                { title: 'Étape 3 — Recevez votre évaluation détaillée', desc: 'Notre IA combine vos réponses et votre photo pour générer un rapport personnalisé : évaluation du risque, hypothèses dermatologiques, et recommandation de consultation si nécessaire.' },
            ],
            cta: 'Démarrer mon analyse maintenant',
        },
        skinConcerns: {
            h2: 'Quels problèmes de peau pouvez-vous analyser ?',
            intro: 'DermatoCheck analyse un large éventail de symptômes et lésions cutanées grâce à son intelligence artificielle entraînée en dermatologie.',
            cards: [
                { title: 'Grain de beauté suspect', desc: 'Un grain de beauté qui change de forme, de couleur ou de taille mérite une évaluation rapide.' },
                { title: 'Bouton ou éruption persistante', desc: 'Bouton rouge qui gratte, plaque qui ne disparaît pas : analysez la situation.' },
                { title: 'Taches et décolorations', desc: 'Taches brunes, blanches ou rouges sur la peau ? Vérifiez leur nature.' },
                { title: 'Démangeaisons et irritations', desc: 'Démangeaisons persistantes, rougeurs, peau qui pèle : identifiez la cause possible.' },
                { title: 'Acné et problèmes courants', desc: 'Acné adulte, eczéma, psoriasis : obtenez une première orientation.' },
                { title: 'Lésions et croûtes', desc: 'Croûte persistante, lésion qui saigne : évaluez le niveau d\'urgence.' },
            ],
            note: 'Cette liste n\'est pas exhaustive. Notre IA peut analyser tout symptôme cutané visible.',
            cta: 'Analyser mon symptôme',
        },
        trust: {
            h2: 'Pourquoi faire confiance à DermatoCheck ?',
            blocks: [
                { title: 'Fondé par un médecin spécialiste', desc: 'DermatoCheck a été créé par un médecin diplômé avec une expertise en dermatologie. Chaque algorithme est orienté par un professionnel de santé pour garantir la pertinence clinique des analyses.' },
                { title: 'Une IA entraînée sur des milliers de cas cliniques', desc: 'Notre intelligence artificielle combine l\'analyse de vos données déclaratives et de votre photo pour générer des hypothèses dermatologiques précises. Algorithme validé, transparence de la méthode.' },
                { title: 'Vos données sont protégées et conformes RGPD', desc: 'Données chiffrées, hébergement sécurisé, conforme au Règlement Général sur la Protection des Données. Vos photos et informations médicales ne sont jamais partagées.' },
            ],
            disclaimerLabel: 'Évaluation indicative',
            disclaimerText: 'DermatoCheck ne remplace pas un diagnostic médical. Notre outil vous oriente intelligemment vers une consultation dermatologique quand c\'est nécessaire.',
        },
        advantages: {
            h2: 'Télédermatologie sans rendez-vous, accessible 24h/24',
            items: [
                { title: 'Sans rendez-vous', desc: 'Accédez à une analyse cutanée quand vous le souhaitez, sans délai d\'attente.' },
                { title: 'Résultat en quelques minutes', desc: 'Votre évaluation est générée immédiatement après soumission.' },
                { title: 'Multilingue', desc: 'Disponible en français, anglais, espagnol et néerlandais.' },
                { title: 'Gratuit', desc: 'Aucun frais, aucun abonnement.' },
                { title: 'Sur tous les appareils', desc: 'Smartphone, tablette, ordinateur.' },
            ],
        },
        faq: {
            h2: 'Questions fréquentes sur l\'analyse de peau par IA',
            items: [
                { q: 'Comment savoir si un grain de beauté est dangereux ?', a: 'Un grain de beauté qui change de forme, de couleur, de taille ou qui saigne mérite une évaluation. DermatoCheck analyse ces critères et vous oriente vers un dermatologue si nécessaire.' },
                { q: 'DermatoCheck remplace-t-il un dermatologue ?', a: 'Non. DermatoCheck est un outil d\'aide à l\'auto-observation assistée. Il fournit une évaluation indicative et vous oriente vers un spécialiste quand c\'est nécessaire. Il ne remplace jamais un diagnostic médical.' },
                { q: 'L\'analyse de peau par IA est-elle fiable ?', a: 'Notre IA est entraînée sur des milliers de cas cliniques et combine vos réponses au questionnaire avec l\'analyse photo. Les résultats sont indicatifs et destinés à vous orienter, pas à se substituer à un médecin.' },
                { q: 'Combien coûte l\'analyse DermatoCheck ?', a: 'L\'analyse est entièrement gratuite. Aucun frais caché, aucun abonnement.' },
                { q: 'Mes données médicales sont-elles protégées ?', a: 'Oui. Vos données sont chiffrées et traitées conformément au RGPD. Elles ne sont jamais partagées avec des tiers.' },
                { q: 'Quel est le délai pour obtenir mon évaluation ?', a: 'Quelques minutes. Après avoir rempli le questionnaire et soumis votre photo, l\'IA génère immédiatement votre rapport.' },
                { q: 'Puis-je envoyer une photo de ma lésion cutanée ?', a: 'Oui. L\'ajout d\'une photo enrichit considérablement l\'analyse. L\'upload est sécurisé et optionnel.' },
                { q: 'Quand dois-je consulter un dermatologue en urgence ?', a: 'Si votre lésion saigne, grossit rapidement, change de couleur ou provoque une douleur intense, consultez un dermatologue sans délai. DermatoCheck peut vous aider à évaluer le niveau d\'urgence.' },
            ],
        },
        finalCta: {
            h2: 'Prêt à analyser votre peau ? C\'est gratuit et immédiat',
            body: 'Rejoignez les milliers d\'utilisateurs qui ont déjà fait confiance à DermatoCheck pour une première évaluation de leur peau.',
            cta: 'Démarrer mon analyse gratuite',
            micro: 'Gratuit • Confidentiel • Résultat en quelques minutes • Aucune inscription requise',
        },
    },
    en: {
        hero: {
            h1: 'Online Skin Analysis Powered by Artificial Intelligence',
            h2: 'Worried about your skin? Get an assessment in minutes',
            body: 'Submit a structured clinical questionnaire and a photo of your skin concern. Our AI generates an indicative assessment, a risk level, and a consultation recommendation if needed.',
            ctaPrimary: 'Start my free skin check',
            ctaSecondary: 'See how it works',
            badge1: 'Founded by a doctor',
            badge2: 'Free • Private • 24/7',
            badge3: 'GDPR compliant',
            counterLabel: 'analyses completed',
        },
        howItWorks: {
            h2: 'How DermatoCheck\'s AI skin analysis works',
            intro: 'In 3 simple steps, get a detailed assessment of your skin concern. No appointment, no travel, available 24/7.',
            steps: [
                { title: 'Step 1 — Complete the clinical questionnaire', desc: 'Describe your skin symptoms: location, appearance, duration, changes over time. 15 structured clinical questions.' },
                { title: 'Step 2 — Upload a photo of your skin concern', desc: 'Upload a photo of the affected area to enhance the analysis. Optional but recommended for greater precision.' },
                { title: 'Step 3 — Receive your detailed assessment', desc: 'Our AI combines your answers and photo to generate a personalised report: risk assessment, dermatological hypotheses, and a consultation recommendation if needed.' },
            ],
            cta: 'Start my analysis now',
        },
        skinConcerns: {
            h2: 'What skin concerns can you check?',
            intro: 'DermatoCheck analyses a wide range of skin symptoms and lesions using artificial intelligence trained in dermatology.',
            cards: [
                { title: 'Suspicious mole', desc: 'A mole that changes in shape, colour, or size deserves a prompt assessment.' },
                { title: 'Persistent spot or rash', desc: 'A red spot that itches, a patch that won\'t go away: get it analysed.' },
                { title: 'Patches and discolouration', desc: 'Brown, white, or red patches on your skin? Check what they could be.' },
                { title: 'Itching and irritation', desc: 'Persistent itching, redness, peeling skin: identify the possible cause.' },
                { title: 'Acne and common conditions', desc: 'Adult acne, eczema, psoriasis: get an initial indication.' },
                { title: 'Lesions and scabs', desc: 'A persistent scab, a lesion that bleeds: assess the level of urgency.' },
            ],
            note: 'This list is not exhaustive. Our AI can analyse any visible skin symptom.',
            cta: 'Check my skin concern',
        },
        trust: {
            h2: 'Why trust DermatoCheck?',
            blocks: [
                { title: 'Founded by a qualified physician', desc: 'DermatoCheck was created by a qualified doctor with expertise in dermatology. Every algorithm is guided by a healthcare professional to ensure the clinical relevance of each analysis.' },
                { title: 'AI trained on thousands of clinical cases', desc: 'Our artificial intelligence combines the analysis of your reported data and your photo to generate precise dermatological hypotheses. Validated algorithm, transparent methodology.' },
                { title: 'Your data is encrypted and GDPR-compliant', desc: 'Encrypted data, secure hosting, compliant with the General Data Protection Regulation. Your photos and medical information are never shared.' },
            ],
            disclaimerLabel: 'Indicative assessment',
            disclaimerText: 'DermatoCheck does not replace a medical diagnosis. Our tool intelligently guides you towards a dermatological consultation when needed.',
        },
        advantages: {
            h2: 'Skin guidance without the wait — available 24/7',
            items: [
                { title: 'No appointment needed', desc: 'Access a skin analysis whenever you want, with no waiting time.' },
                { title: 'Results in minutes', desc: 'Your assessment is generated immediately after submission.' },
                { title: 'Multilingual', desc: 'Available in English, French, Spanish, and Dutch.' },
                { title: 'Free', desc: 'No fees, no subscription. Analyse your skin freely.' },
                { title: 'On any device', desc: 'Smartphone, tablet, computer. Your digital skin guide follows you everywhere.' },
            ],
        },
        faq: {
            h2: 'Frequently asked questions about AI skin analysis',
            items: [
                { q: 'How do I know if a mole is dangerous?', a: 'A mole that changes in shape, colour, size, or that bleeds warrants an assessment. DermatoCheck analyses these criteria and guides you towards a dermatologist if needed.' },
                { q: 'Does DermatoCheck replace a dermatologist?', a: 'No. DermatoCheck is a tool that supports guided self-observation. It provides an indicative assessment and directs you to a specialist when necessary. It never replaces a medical diagnosis.' },
                { q: 'Is AI skin analysis reliable?', a: 'Our AI is trained on thousands of clinical cases and combines your questionnaire responses with photo analysis. Results are indicative and designed to guide you, not to substitute for a doctor.' },
                { q: 'How much does a DermatoCheck analysis cost?', a: 'The analysis is completely free. No hidden fees, no subscription.' },
                { q: 'Is my medical data protected?', a: 'Yes. Your data is encrypted and processed in compliance with GDPR. It is never shared with third parties.' },
                { q: 'How long does it take to get my assessment?', a: 'A few minutes. After completing the questionnaire and submitting your photo, the AI generates your report immediately.' },
                { q: 'Can I upload a photo of my skin concern?', a: 'Yes. Adding a photo significantly enriches the analysis. The upload is secure and optional.' },
                { q: 'When should I see a dermatologist urgently?', a: 'If your lesion bleeds, grows rapidly, changes colour, or causes intense pain, see a dermatologist without delay. DermatoCheck can help you assess the level of urgency.' },
            ],
        },
        finalCta: {
            h2: 'Ready to check your skin? It\'s free and takes minutes',
            body: 'Join the thousands of users who have already trusted DermatoCheck for an initial assessment of their skin.',
            cta: 'Start my free skin check',
            micro: 'Free • Private • Results in minutes • No sign-up required',
        },
    },
    es: {
        hero: {
            h1: 'Análisis de piel online con inteligencia artificial',
            h2: '¿Tu piel te preocupa? Obtén una evaluación en pocos minutos',
            body: 'Envía un cuestionario médico estructurado y una foto de tu lesión cutánea. Nuestra IA genera una evaluación orientativa, un nivel de riesgo y una recomendación de consulta si es necesario.',
            ctaPrimary: 'Iniciar mi análisis gratuito',
            ctaSecondary: 'Descubre cómo funciona',
            badge1: 'Fundado por un médico',
            badge2: 'Gratuito • Confidencial • 24/7',
            badge3: 'Conforme RGPD',
            counterLabel: 'análisis realizados',
        },
        howItWorks: {
            h2: 'Cómo funciona el análisis cutáneo de DermatoCheck',
            intro: 'En 3 sencillos pasos, obtén una evaluación detallada de tu problema de piel. Sin cita previa, sin desplazamiento, disponible 24/7.',
            steps: [
                { title: 'Paso 1 — Responde al cuestionario médico', desc: 'Describe tus síntomas cutáneos: localización, aspecto, duración y evolución. 15 preguntas clínicas estructuradas.' },
                { title: 'Paso 2 — Sube una foto de tu lesión', desc: 'Sube una foto de la zona afectada para enriquecer el análisis. Opcional pero recomendado para mayor precisión.' },
                { title: 'Paso 3 — Recibe tu evaluación detallada', desc: 'Nuestra IA combina tus respuestas y tu foto para generar un informe personalizado: evaluación de riesgo, hipótesis dermatológicas y recomendación de consulta si es necesario.' },
            ],
            cta: 'Iniciar mi análisis ahora',
        },
        skinConcerns: {
            h2: '¿Qué problemas de piel puedes analizar?',
            intro: 'DermatoCheck analiza una amplia variedad de síntomas y lesiones cutáneas gracias a su inteligencia artificial entrenada en dermatología.',
            cards: [
                { title: 'Lunar sospechoso', desc: 'Un lunar que cambia de forma, color o tamaño merece una evaluación rápida.' },
                { title: 'Grano o erupción persistente', desc: 'Un grano rojo que pica, una placa que no desaparece: analiza la situación.' },
                { title: 'Manchas y decoloraciones', desc: '¿Manchas marrones, blancas o rojas en la piel? Comprueba su naturaleza.' },
                { title: 'Picazón e irritaciones', desc: 'Picazón persistente, enrojecimiento, piel que se descama: identifica la causa posible.' },
                { title: 'Acné y problemas comunes', desc: 'Acné adulto, eczema, psoriasis: obtén una primera orientación.' },
                { title: 'Lesiones y costras', desc: 'Costra persistente, lesión que sangra: evalúa el nivel de urgencia.' },
            ],
            note: 'Esta lista no es exhaustiva. Nuestra IA puede analizar cualquier síntoma cutáneo visible.',
            cta: 'Analizar mi problema de piel',
        },
        trust: {
            h2: '¿Por qué confiar en DermatoCheck?',
            blocks: [
                { title: 'Fundado por un médico especialista', desc: 'DermatoCheck fue creado por un médico titulado con experiencia en dermatología. Cada algoritmo está orientado por un profesional sanitario para garantizar la relevancia clínica de los análisis.' },
                { title: 'Una IA entrenada con miles de casos clínicos', desc: 'Nuestra inteligencia artificial combina el análisis de tus datos declarativos y tu foto para generar hipótesis dermatológicas precisas. Algoritmo validado, transparencia del método.' },
                { title: 'Tus datos están protegidos y son conformes con el RGPD', desc: 'Datos cifrados, alojamiento seguro, conforme con el Reglamento General de Protección de Datos. Tus fotos e información médica nunca se comparten.' },
            ],
            disclaimerLabel: 'Evaluación orientativa',
            disclaimerText: 'DermatoCheck no sustituye un diagnóstico médico. Nuestra herramienta te orienta de forma inteligente hacia una consulta dermatológica cuando es necesario.',
        },
        advantages: {
            h2: 'Teledermatología sin cita previa, disponible 24/7',
            items: [
                { title: 'Sin cita previa', desc: 'Accede a un análisis cutáneo cuando quieras, sin tiempo de espera.' },
                { title: 'Resultado en pocos minutos', desc: 'Tu evaluación se genera de inmediato tras el envío.' },
                { title: 'Multilingüe', desc: 'Disponible en español, francés, inglés y neerlandés.' },
                { title: 'Gratuito', desc: 'Sin costes, sin suscripción. Analiza tu piel con total libertad.' },
                { title: 'En cualquier dispositivo', desc: 'Smartphone, tablet, ordenador. Tu guía dermatológica digital te acompaña en todo momento.' },
            ],
        },
        faq: {
            h2: 'Preguntas frecuentes sobre el análisis de piel con IA',
            items: [
                { q: '¿Cómo saber si un lunar es peligroso?', a: 'Un lunar que cambia de forma, color, tamaño o que sangra merece una evaluación. DermatoCheck analiza estos criterios y te orienta hacia un dermatólogo si es necesario.' },
                { q: '¿DermatoCheck sustituye a un dermatólogo?', a: 'No. DermatoCheck es una herramienta de apoyo a la autoobservación guiada. Proporciona una evaluación orientativa y te dirige hacia un especialista cuando es necesario. Nunca sustituye un diagnóstico médico.' },
                { q: '¿Es fiable el análisis de piel con IA?', a: 'Nuestra IA está entrenada con miles de casos clínicos y combina tus respuestas al cuestionario con el análisis fotográfico. Los resultados son orientativos y están pensados para guiarte, no para sustituir a un médico.' },
                { q: '¿Cuánto cuesta el análisis de DermatoCheck?', a: 'El análisis es completamente gratuito. Sin costes ocultos, sin suscripción.' },
                { q: '¿Están protegidos mis datos médicos?', a: 'Sí. Tus datos están cifrados y se tratan de acuerdo con el RGPD. Nunca se comparten con terceros.' },
                { q: '¿Cuánto tiempo tarda en llegar mi evaluación?', a: 'Unos pocos minutos. Tras completar el cuestionario y enviar tu foto, la IA genera tu informe de inmediato.' },
                { q: '¿Puedo subir una foto de mi lesión cutánea?', a: 'Sí. Añadir una foto enriquece considerablemente el análisis. La subida es segura y opcional.' },
                { q: '¿Cuándo debo consultar a un dermatólogo con urgencia?', a: 'Si tu lesión sangra, crece rápidamente, cambia de color o provoca un dolor intenso, consulta a un dermatólogo sin demora. DermatoCheck puede ayudarte a evaluar el nivel de urgencia.' },
            ],
        },
        finalCta: {
            h2: '¿Listo para analizar tu piel? Es gratuito e inmediato',
            body: 'Únete a los miles de usuarios que ya han confiado en DermatoCheck para una primera evaluación de su piel.',
            cta: 'Iniciar mi análisis gratuito',
            micro: 'Gratuito • Confidencial • Resultado en pocos minutos • Sin registro necesario',
        },
    },
    nl: {
        hero: {
            h1: 'Online huidanalyse met kunstmatige intelligentie',
            h2: 'Maak je je zorgen over je huid? Krijg binnen enkele minuten een beoordeling',
            body: 'Vul een gestructureerde klinische vragenlijst in en upload een foto van je huidklacht. Onze AI genereert een indicatieve beoordeling, een risiconiveau en een consultaanbeveling indien nodig.',
            ctaPrimary: 'Start mijn gratis huidcheck',
            ctaSecondary: 'Ontdek hoe het werkt',
            badge1: 'Opgericht door een arts',
            badge2: 'Gratis • Vertrouwelijk • 24/7',
            badge3: 'AVG-conform',
            counterLabel: 'analyses uitgevoerd',
        },
        howItWorks: {
            h2: 'Hoe werkt de huidanalyse van DermatoCheck',
            intro: 'In 3 eenvoudige stappen krijg je een uitgebreide beoordeling van je huidprobleem. Zonder afspraak, zonder verplaatsing, 24/7 beschikbaar.',
            steps: [
                { title: 'Stap 1 — Vul de klinische vragenlijst in', desc: 'Beschrijf je huidsymptomen: locatie, uiterlijk, duur en veranderingen. 15 gestructureerde klinische vragen.' },
                { title: 'Stap 2 — Upload een foto van je huidklacht', desc: 'Upload een foto van het aangedane gebied om de analyse te verrijken. Optioneel maar aanbevolen voor meer precisie.' },
                { title: 'Stap 3 — Ontvang je uitgebreide beoordeling', desc: 'Onze AI combineert je antwoorden en je foto om een gepersonaliseerd rapport te genereren: risicobeoordeling, dermatologische hypotheses en een consultaanbeveling indien nodig.' },
            ],
            cta: 'Start mijn analyse nu',
        },
        skinConcerns: {
            h2: 'Welke huidproblemen kun je laten checken?',
            intro: 'DermatoCheck analyseert een breed scala aan huidsymptomen en huidaandoeningen dankzij kunstmatige intelligentie getraind in de dermatologie.',
            cards: [
                { title: 'Verdachte moedervlek', desc: 'Een moedervlek die verandert van vorm, kleur of grootte verdient een snelle beoordeling.' },
                { title: 'Aanhoudende bult of uitslag', desc: 'Een rode plek die jeukt, een plek die niet weggaat: laat het analyseren.' },
                { title: 'Vlekken en verkleuring', desc: 'Bruine, witte of rode vlekken op je huid? Check wat ze kunnen zijn.' },
                { title: 'Jeuk en irritatie', desc: 'Aanhoudende jeuk, roodheid, schilferende huid: ontdek de mogelijke oorzaak.' },
                { title: 'Acne en veelvoorkomende aandoeningen', desc: 'Volwassen acne, eczeem, psoriasis: krijg een eerste indicatie.' },
                { title: 'Wondjes en korstjes', desc: 'Aanhoudend korstje, een wond die bloedt: beoordeel het urgentieniveau.' },
            ],
            note: 'Deze lijst is niet uitputtend. Onze AI kan elk zichtbaar huidsymptoom analyseren.',
            cta: 'Check mijn huidklacht',
        },
        trust: {
            h2: 'Waarom DermatoCheck vertrouwen?',
            blocks: [
                { title: 'Opgericht door een gekwalificeerde arts', desc: 'DermatoCheck is ontwikkeld door een gekwalificeerde arts met expertise in de dermatologie. Elk algoritme wordt begeleid door een medisch professional om de klinische relevantie van elke analyse te waarborgen.' },
                { title: 'AI getraind op duizenden klinische cases', desc: 'Onze kunstmatige intelligentie combineert de analyse van je ingevulde gegevens en je foto om nauwkeurige dermatologische hypotheses te genereren. Gevalideerd algoritme, transparante methodologie.' },
                { title: 'Je gegevens zijn versleuteld en AVG-conform', desc: 'Versleutelde gegevens, beveiligde hosting, conform de Algemene Verordening Gegevensbescherming. Je foto\'s en medische informatie worden nooit gedeeld.' },
            ],
            disclaimerLabel: 'Indicatieve beoordeling',
            disclaimerText: 'DermatoCheck vervangt geen medische diagnose. Onze tool wijst je op een intelligente manier naar een dermatologisch consult wanneer dat nodig is.',
        },
        advantages: {
            h2: 'Huidadvies zonder wachttijd — 24/7 beschikbaar',
            items: [
                { title: 'Zonder afspraak', desc: 'Doe een huidanalyse wanneer je wilt, zonder wachttijd.' },
                { title: 'Resultaat in enkele minuten', desc: 'Je beoordeling wordt direct na het indienen gegenereerd.' },
                { title: 'Meertalig', desc: 'Beschikbaar in het Nederlands, Frans, Engels en Spaans.' },
                { title: 'Gratis', desc: 'Geen kosten, geen abonnement. Analyseer je huid in alle vrijheid.' },
                { title: 'Op elk apparaat', desc: 'Smartphone, tablet, computer. Je digitale huidgids gaat overal mee.' },
            ],
        },
        faq: {
            h2: 'Veelgestelde vragen over huidanalyse met AI',
            items: [
                { q: 'Hoe weet ik of een moedervlek gevaarlijk is?', a: 'Een moedervlek die van vorm, kleur, grootte verandert of bloedt verdient een beoordeling. DermatoCheck analyseert deze criteria en wijst je naar een dermatoloog als dat nodig is.' },
                { q: 'Vervangt DermatoCheck een dermatoloog?', a: 'Nee. DermatoCheck is een hulpmiddel voor begeleide zelfobservatie. Het biedt een indicatieve beoordeling en wijst je naar een specialist wanneer dat nodig is. Het vervangt nooit een medische diagnose.' },
                { q: 'Is huidanalyse met AI betrouwbaar?', a: 'Onze AI is getraind op duizenden klinische cases en combineert je antwoorden op de vragenlijst met de foto-analyse. De resultaten zijn indicatief en bedoeld om je te begeleiden, niet om een arts te vervangen.' },
                { q: 'Hoeveel kost een analyse bij DermatoCheck?', a: 'De analyse is volledig gratis. Geen verborgen kosten, geen abonnement.' },
                { q: 'Zijn mijn medische gegevens beschermd?', a: 'Ja. Je gegevens zijn versleuteld en worden verwerkt conform de AVG. Ze worden nooit gedeeld met derden.' },
                { q: 'Hoe lang duurt het om mijn beoordeling te krijgen?', a: 'Enkele minuten. Na het invullen van de vragenlijst en het indienen van je foto genereert de AI direct je rapport.' },
                { q: 'Kan ik een foto van mijn huidklacht uploaden?', a: 'Ja. Het toevoegen van een foto verrijkt de analyse aanzienlijk. Het uploaden is beveiligd en optioneel.' },
                { q: 'Wanneer moet ik met spoed naar een dermatoloog?', a: 'Als je huidaandoening bloedt, snel groeit, van kleur verandert of hevige pijn veroorzaakt, raadpleeg dan onmiddellijk een dermatoloog. DermatoCheck kan je helpen het urgentieniveau in te schatten.' },
            ],
        },
        finalCta: {
            h2: 'Klaar om je huid te checken? Het is gratis en direct',
            body: 'Sluit je aan bij de duizenden gebruikers die DermatoCheck al hebben vertrouwd voor een eerste beoordeling van hun huid.',
            cta: 'Start mijn gratis huidcheck',
            micro: 'Gratis • Vertrouwelijk • Resultaat in enkele minuten • Geen registratie nodig',
        },
    },
};

/* ────────── SVG Icons (shared across languages) ────────── */
const STEP_ICONS = [
    <svg key="s1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>,
    <svg key="s2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>,
    <svg key="s3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
];

const TRUST_ICONS = [
    <svg key="t1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A12 12 0 0 0 2 8.5C2 14 6.5 19 12 22c5.5-3 10-8 10-13.5a12 12 0 0 0-2.8-6.2" /><circle cx="12" cy="10" r="3" /></svg>,
    <svg key="t2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /></svg>,
    <svg key="t3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
];

const ADV_ICONS = [
    <svg key="a1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    <svg key="a2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    <svg key="a3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>,
    <svg key="a4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    <svg key="a5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>,
];

/* ══════════════════════════════════════════════════════════════
   HOMEPAGE COMPONENT — FR + EN + ES + NL SEO-Optimized
   ══════════════════════════════════════════════════════════════ */
const HomePage: React.FC<HomePageProps> = ({ config, onStart, onNavigate, user }) => {
    const { language } = useLanguage();
    const counter = useAnimatedCounter(5000, 2500);

    // Resolve content: all 4 languages have dedicated content, others fallback to EN
    const lang: 'fr' | 'en' | 'es' | 'nl' = (language === 'fr' || language === 'en' || language === 'es' || language === 'nl') ? language : 'en';
    const c = content[lang];
    const locale = language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'nl' ? 'nl-NL' : 'en-GB';

    return (
        <div className="min-h-screen text-[#F8FAFC] space-y-0">

            {/* ══════════ SECTION 1 — HERO ══════════ */}
            <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-36 pb-16 md:pb-24 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 max-w-4xl"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight text-white">
                        {c.hero.h1}
                    </h1>
                    <h2 className="text-xl md:text-2xl text-[#94A3B8] font-light leading-relaxed max-w-3xl mx-auto">
                        {c.hero.h2}
                    </h2>
                    <p className="text-base md:text-lg text-[#94A3B8]/80 max-w-2xl mx-auto leading-relaxed">
                        {c.hero.body}
                    </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mt-10"
                >
                    <MagneticButton
                        onClick={onStart}
                        className="px-10 py-4 bg-[#2DD4BF] text-[#030305] font-bold rounded-2xl text-lg hover:bg-[#14B8A6] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all duration-300"
                    >
                        {c.hero.ctaPrimary}
                    </MagneticButton>
                    <button
                        onClick={() => {
                            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[#2DD4BF] hover:text-[#14B8A6] font-medium text-base transition-colors duration-200 flex items-center gap-2"
                    >
                        {c.hero.ctaSecondary}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                    </button>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-12"
                >
                    <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><path d="M4.8 2.3A12 12 0 0 0 2 8.5C2 14 6.5 19 12 22c5.5-3 10-8 10-13.5a12 12 0 0 0-2.8-6.2" /><circle cx="12" cy="10" r="3" /></svg>
                        {c.hero.badge1}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        {c.hero.badge2}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        {c.hero.badge3}
                    </div>
                </motion.div>

                {/* Animated Counter */}
                <div ref={counter.ref} className="mt-10">
                    <div className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#2DD4BF]">
                        {counter.count.toLocaleString(locale)}+
                    </div>
                    <div className="text-sm text-[#94A3B8] mt-1 uppercase tracking-widest">{c.hero.counterLabel}</div>
                </div>
            </section>

            {/* ══════════ SECTION 2 — HOW IT WORKS ══════════ */}
            <FadeInSection id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                        {c.howItWorks.h2}
                    </h2>
                    <p className="text-[#94A3B8] max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        {c.howItWorks.intro}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {c.howItWorks.steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            className="relative p-8 rounded-[2rem] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 hover:bg-white/[0.06] transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] mb-6 group-hover:bg-[#2DD4BF] group-hover:text-[#030305] transition-all duration-300">
                                {STEP_ICONS[i]}
                            </div>
                            <h3 className="text-lg md:text-xl font-display font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-[#94A3B8] text-sm leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button
                        onClick={onStart}
                        className="px-8 py-4 bg-[#2DD4BF] text-[#030305] font-bold rounded-2xl text-base hover:bg-[#14B8A6] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all duration-300"
                    >
                        {c.howItWorks.cta}
                    </button>
                </div>
            </FadeInSection>

            {/* ══════════ EXPERTISE IMAGE BANNER ══════════ */}
            <FadeInSection className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
                <div className="relative group">
                    {/* Outer glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#2DD4BF]/20 via-[#6366F1]/20 to-[#2DD4BF]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Image container */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 group-hover:border-[#2DD4BF]/30 transition-all duration-700">
                        {/* Gradient overlay for dark theme blending */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-[#030305]/40 z-10 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#030305]/50 via-transparent to-[#030305]/50 z-10 pointer-events-none" />

                        <img
                            src={lang === 'fr' ? '/clinical-expertise-fr.png' : '/clinical-expertise-en.png'}
                            alt={lang === 'fr'
                                ? 'Expertise dermatologique — analyse cutanée avec intelligence artificielle DermatoCheck'
                                : lang === 'es'
                                    ? 'Experiencia dermatológica — análisis cutáneo con inteligencia artificial DermatoCheck'
                                    : lang === 'nl'
                                        ? 'Dermatologische expertise — huidanalyse met kunstmatige intelligentie DermatoCheck'
                                        : 'Dermatological expertise — skin analysis with artificial intelligence DermatoCheck'}
                            className="w-full h-auto object-cover transform group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                            loading="lazy"
                        />

                        {/* Bottom teal accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2DD4BF]/60 to-transparent z-20" />
                    </div>
                </div>
            </FadeInSection>

            {/* ══════════ SECTION 3 — SKIN CONCERNS ══════════ */}
            <FadeInSection className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                        {c.skinConcerns.h2}
                    </h2>
                    <p className="text-[#94A3B8] max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        {c.skinConcerns.intro}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {c.skinConcerns.cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-[16px] border border-white/10 hover:bg-white/[0.06] hover:border-[#2DD4BF]/20 transition-all duration-300"
                        >
                            <h4 className="text-lg font-display font-bold text-white mb-2">{card.title}</h4>
                            <p className="text-[#94A3B8] text-sm leading-relaxed">{card.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center text-[#94A3B8] text-sm mt-8 italic">
                    {c.skinConcerns.note}
                </p>
                <div className="text-center mt-8">
                    <button
                        onClick={onStart}
                        className="px-8 py-4 bg-[#2DD4BF] text-[#030305] font-bold rounded-2xl text-base hover:bg-[#14B8A6] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all duration-300"
                    >
                        {c.skinConcerns.cta}
                    </button>
                </div>
            </FadeInSection>

            {/* ══════════ SECTION 4 — TRUST / E-E-A-T ══════════ */}
            <FadeInSection className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white text-center mb-16">
                    {c.trust.h2}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {c.trust.blocks.map((block, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            className="p-8 rounded-[2rem] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 hover:bg-white/[0.06] transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] mb-6 group-hover:bg-[#2DD4BF] group-hover:text-[#030305] transition-all duration-300">
                                {TRUST_ICONS[i]}
                            </div>
                            <h3 className="text-lg md:text-xl font-display font-bold text-white mb-3">{block.title}</h3>
                            <p className="text-[#94A3B8] text-sm leading-relaxed">{block.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div className="mt-12 border-l-4 border-[#2DD4BF] bg-white/[0.03] backdrop-blur-[16px] rounded-r-2xl p-6 max-w-3xl mx-auto">
                    <p className="text-[#94A3B8] text-sm leading-relaxed">
                        <strong className="text-[#2DD4BF]">{c.trust.disclaimerLabel}</strong> — {c.trust.disclaimerText}
                    </p>
                </div>
            </FadeInSection>

            {/* ══════════ SECTION 5 — ADVANTAGES ══════════ */}
            <FadeInSection className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white text-center mb-16">
                    {c.advantages.h2}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {c.advantages.items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-[16px] border border-white/10 hover:bg-white/[0.06] transition-all duration-300 text-center group"
                        >
                            <div className="w-12 h-12 mx-auto rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] mb-4 group-hover:bg-[#2DD4BF] group-hover:text-[#030305] transition-all duration-300">
                                {ADV_ICONS[i]}
                            </div>
                            <h4 className="text-base font-display font-bold text-white mb-2">{item.title}</h4>
                            <p className="text-[#94A3B8] text-xs leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </FadeInSection>

            {/* ══════════ SECTION 6 — USER REVIEWS (Supabase) ══════════ */}
            <ReviewSection onNavigateToAuth={() => onNavigate('auth')} />

            {/* ══════════ SECTION 7 — FAQ ══════════ */}
            <FadeInSection className="max-w-3xl mx-auto px-4 md:px-8 py-20 md:py-28">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white text-center mb-16">
                    {c.faq.h2}
                </h2>

                <div className="space-y-4">
                    {c.faq.items.map((item, i) => (
                        <FAQItem key={i} question={item.q} answer={item.a} />
                    ))}
                </div>
            </FadeInSection>

            {/* ══════════ SECTION 8 — FINAL CTA ══════════ */}
            <section className="relative w-full overflow-hidden py-24 md:py-32 text-center">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2DD4BF]/10 via-[#030305] to-[#6366F1]/10 pointer-events-none" />
                <div className="absolute inset-0 bg-[#030305]/60 pointer-events-none" />

                {/* Animated glows */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-[#2DD4BF] rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6366F1] rounded-full blur-[120px] pointer-events-none"
                />

                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
                        {c.finalCta.h2}
                    </h2>
                    <p className="text-[#94A3B8] text-lg mb-10 max-w-2xl mx-auto">
                        {c.finalCta.body}
                    </p>
                    <button
                        onClick={onStart}
                        className="px-12 py-5 bg-[#2DD4BF] text-[#030305] font-bold rounded-2xl text-lg shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_50px_rgba(45,212,191,0.5)] hover:-translate-y-1 hover:bg-[#14B8A6] transition-all duration-300"
                    >
                        {c.finalCta.cta}
                    </button>
                    <p className="text-xs text-[#94A3B8] mt-6">
                        {c.finalCta.micro}
                    </p>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
