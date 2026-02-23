import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export const StatsSection: React.FC = () => {
    const { t } = useLanguage();

    const stats = [
        {
            value: t('home.stats.analyses.value', '5 000+'),
            label: t('home.stats.analyses.label', 'Analyses réalisées')
        },
        {
            value: t('home.stats.languages.value', '4'),
            label: t('home.stats.languages.label', 'Langues disponibles')
        },
        {
            value: t('home.stats.satisfaction.value', '96%'),
            label: t('home.stats.satisfaction.label', 'Taux de satisfaction')
        }
    ];

    return (
        <section className="py-12 md:py-20 relative w-full overflow-hidden border-y border-white/5 bg-white/[0.01]">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="flex flex-col items-center justify-center py-8 md:py-4 px-4 group"
                        >
                            <div className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-brand-primary/80 mb-3 group-hover:scale-110 transition-transform duration-500">
                                {stat.value}
                            </div>
                            <div className="text-white/60 font-medium tracking-wide text-sm md:text-base uppercase">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
