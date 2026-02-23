import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const FAQS = {
    fr: [
        {
            q: "DermatoCheck est-il un diagnostic médical ?",
            a: "Non. DermatoCheck est un outil d'aide à l'analyse, pas un diagnostic. En cas de doute, consultez toujours un dermatologue qualifié."
        },
        {
            q: "Comment fonctionne l'analyse par IA ?",
            a: "Notre IA analyse vos symptômes (localisation, aspect, durée, antécédents) via une série de questions guidées et produit une analyse personnalisée en moins de 60 secondes."
        },
        {
            q: "Faut-il un compte pour utiliser DermatoCheck ?",
            a: "Non, l'analyse est accessible sans inscription. Un compte gratuit vous permet de sauvegarder votre historique et de suivre l'évolution de votre peau."
        },
        {
            q: "Quelles maladies de peau peut analyser DermatoCheck ?",
            a: "Acné, eczéma, psoriasis, dermatite, lésions pigmentées, éruptions, allergies cutanées et bien d'autres pathologies dermatologiques."
        },
        {
            q: "Mes données sont-elles confidentielles ?",
            a: "Oui. Vos données sont traitées selon le RGPD et ne sont jamais partagées avec des tiers sans votre consentement."
        },
        {
            q: "DermatoCheck est-il disponible en plusieurs langues ?",
            a: "Oui, en français, anglais, néerlandais et espagnol. Sélectionnez votre langue depuis l'interface."
        },
    ],
    en: [
        {
            q: "Is DermatoCheck a medical diagnosis?",
            a: "No. DermatoCheck is an analysis assistance tool, not a diagnosis. If in doubt, always consult a qualified dermatologist."
        },
        {
            q: "How does the AI analysis work?",
            a: "Our AI analyses your symptoms through guided questions and produces a personalised report in under 60 seconds."
        },
        {
            q: "Do I need an account to use DermatoCheck?",
            a: "No, analysis is available without registration. A free account lets you save your history and track your skin over time."
        },
        {
            q: "What skin conditions can DermatoCheck analyse?",
            a: "Acne, eczema, psoriasis, dermatitis, pigmented lesions, rashes, skin allergies and many other dermatological conditions."
        },
        {
            q: "Is my data confidential?",
            a: "Yes. Your data is processed in accordance with GDPR and never shared with third parties without your consent."
        },
        {
            q: "Is DermatoCheck available in multiple languages?",
            a: "Yes, in French, English, Dutch and Spanish. Select your language from the interface."
        },
    ],
    nl: [
        {
            q: "Is DermatoCheck een medische diagnose?",
            a: "Nee. DermatoCheck is een hulpmiddel voor huidanalyse, geen diagnose. Raadpleeg bij twijfel altijd een dermatoloog."
        },
        {
            q: "Hoe werkt de AI-analyse?",
            a: "Onze AI analyseert uw symptomen via gerichte vragen en geeft binnen 60 seconden een gepersonaliseerde analyse."
        },
        {
            q: "Heb ik een account nodig?",
            a: "Nee, de analyse is beschikbaar zonder registratie. Met een gratis account kunt u uw geschiedenis opslaan."
        },
        {
            q: "Welke huidaandoeningen kan DermatoCheck analyseren?",
            a: "Acne, eczeem, psoriasis, dermatitis, gepigmenteerde laesies, uitslag, huidallergieën en vele andere dermatologische aandoeningen."
        },
        {
            q: "Zijn mijn gegevens vertrouwelijk?",
            a: "Ja. Uw gegevens worden verwerkt conform de AVG en nooit gedeeld met derden zonder uw toestemming."
        },
        {
            q: "Is DermatoCheck beschikbaar in meerdere talen?",
            a: "Ja, in het Frans, Engels, Nederlands en Spaans. Selecteer uw taal via de interface."
        },
    ],
    es: [
        {
            q: "¿DermatoCheck es un diagnóstico médico?",
            a: "No. DermatoCheck es una herramienta de análisis de ayuda, no un diagnóstico. En caso de duda, consulte siempre a un dermatólogo."
        },
        {
            q: "¿Cómo funciona el análisis por IA?",
            a: "Nuestra IA analiza sus síntomas a través de preguntas guiadas y produce un análisis personalizado en menos de 60 segundos."
        },
        {
            q: "¿Necesito una cuenta para usar DermatoCheck?",
            a: "No, el análisis está disponible sin registro. Una cuenta gratuita le permite guardar su historial y seguir la evolución de su piel."
        },
        {
            q: "¿Qué enfermedades de la piel puede analizar DermatoCheck?",
            a: "Acné, eczema, psoriasis, dermatitis, lesiones pigmentadas, erupciones, alergias cutáneas y muchas otras patologías dermatológicas."
        },
        {
            q: "¿Son confidenciales mis datos?",
            a: "Sí. Sus datos se tratan conforme al RGPD y nunca se comparten con terceros sin su consentimiento."
        },
        {
            q: "¿Está DermatoCheck disponible en varios idiomas?",
            a: "Sí, en francés, inglés, neerlandés y español. Seleccione su idioma desde la interfaz."
        },
    ],
};

const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg
        width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0,
        }}
    >
        <path d="M6 9l6 6 6-6" />
    </svg>
);

const NEON = '#2DD4BF';

export const FAQSection: React.FC = () => {
    const { language } = useLanguage();
    const lang = ((language as string) || 'fr').slice(0, 2).toLowerCase() as keyof typeof FAQS;
    const faqs = FAQS[lang] || FAQS.fr;
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const titles: Record<string, { heading: string; sub: string }> = {
        fr: { heading: 'Questions fréquentes', sub: 'Tout ce que vous devez savoir' },
        en: { heading: 'Frequently asked questions', sub: 'Everything you need to know' },
        nl: { heading: 'Veelgestelde vragen', sub: 'Alles wat u moet weten' },
        es: { heading: 'Preguntas frecuentes', sub: 'Todo lo que necesita saber' },
    };
    const title = titles[lang] || titles.fr;

    return (
        <section
            className="w-full pt-10 pb-20 md:pt-14 md:pb-28"
            aria-label={title.heading}
            itemScope
            itemType="https://schema.org/FAQPage"
        >
            {/* Section header */}
            <div className="text-center mb-14">
                <p className="text-xs font-mono uppercase tracking-[0.3em] mb-3" style={{ color: NEON }}>
                    FAQ
                </p>
                <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mb-3">
                    {title.heading}
                </h2>
                <p className="text-white/40 text-sm md:text-base font-light">{title.sub}</p>
            </div>

            {/* FAQ accordion */}
            <div className="max-w-3xl mx-auto space-y-3 px-4">
                {faqs.map((faq, i) => {
                    const isOpen = openIndex === i;
                    return (
                        <div
                            key={i}
                            itemScope
                            itemProp="mainEntity"
                            itemType="https://schema.org/Question"
                            className="rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: isOpen
                                    ? `1px solid rgba(45,212,191,0.3)`
                                    : '1px solid rgba(255,255,255,0.07)',
                                transition: 'border-color 0.2s',
                            }}
                        >
                            <button
                                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                                onClick={() => setOpenIndex(isOpen ? null : i)}
                                aria-expanded={isOpen}
                            >
                                <span
                                    className="text-[15px] md:text-[16px] font-medium leading-snug"
                                    style={{ color: isOpen ? NEON : 'rgba(255,255,255,0.88)' }}
                                    itemProp="name"
                                >
                                    {faq.q}
                                </span>
                                <span style={{ color: isOpen ? NEON : 'rgba(255,255,255,0.3)' }}>
                                    <ChevronIcon open={isOpen} />
                                </span>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        style={{ overflow: 'hidden' }}
                                        itemScope
                                        itemProp="acceptedAnswer"
                                        itemType="https://schema.org/Answer"
                                    >
                                        <p
                                            className="px-6 pb-5 text-[14px] md:text-[15px] leading-relaxed font-light"
                                            style={{ color: 'rgba(255,255,255,0.55)' }}
                                            itemProp="text"
                                        >
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default FAQSection;
