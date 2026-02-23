import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export const TestimonialSection: React.FC = () => {
    const { t } = useLanguage();

    // Attempt to get the translated cards array, but provide a safe fallback just in case
    const cards = t('home.testimonials.cards') || [];

    const isArray = Array.isArray(cards);
    const validCards = isArray ? cards : [
        { name: "Sophie M.", role: "Paris", text: "J'avais un doute sur une tache apparue récemment. L'analyse a été bluffante de précision et m'a encouragée à consulter rapidement." },
        { name: "Marc T.", role: "Lyon", text: "Application très professionnelle. Le rapport PDF généré m'a permis d'avoir un vrai support visuel lors de ma consultation médicale." },
        { name: "Élodie L.", role: "Nantes", text: "Interface soignée, questionnaire complet et aucune attente pour le résultat. Très rassurant pour faire un premier point." }
    ];

    return (
        <section className="py-20 relative w-full overflow-hidden">
            {/* Background elements for depth */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10 transform -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none" />

            <div className="mb-16 text-center">
                <p className="text-brand-secondary/40 font-mono text-xs uppercase tracking-[0.4em] mb-4">
                    {t('home.testimonials.subtitle', 'Avis Utilisateurs')}
                </p>
                <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white">
                    {t('home.testimonials.title', 'Ils nous font confiance')}
                </h2>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {validCards.map((card: any, index: number) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                        className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-brand-primary/20 transition-all duration-300 group flex flex-col h-full"
                    >
                        {/* Quote Icon */}
                        <div className="mb-6 opacity-30 group-hover:opacity-50 group-hover:text-brand-primary transition-all duration-300">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.017 21L16.41 12H9.006L9.006 3H21.01L21.01 12.01L14.017 21Z" />
                                <path d="M5.013 21L7.406 12H0.002L0.002 3H12.006L12.006 12.01L5.013 21Z" />
                            </svg>
                        </div>

                        {/* Text Content */}
                        <p className="text-white/80 font-light leading-relaxed mb-8 flex-grow">
                            "{card.text}"
                        </p>

                        {/* User Info */}
                        <div className="flex items-center gap-4 mt-auto">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-teal-500/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
                                {card.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{card.name}</h4>
                                <p className="text-white/40 text-sm">{card.role}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialSection;
