import React from 'react';
import { PageConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AboutPageProps {
    config: PageConfig;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-12">
        <h3 className="text-2xl font-display font-bold mb-6 text-brand-primary tracking-tight">{title}</h3>
        <div className="space-y-4 text-brand-secondary/80 text-lg leading-relaxed font-light">{children}</div>
    </div>
);

const AboutPage: React.FC<AboutPageProps> = () => {
    const { t, language } = useLanguage();

    // We use translations.ts instead of config.tsx for localized text
    const sections = t('about.sections') as unknown as any[];
    const title = t('about.title');
    const warning = t('about.warning');

    return (
        <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-16 text-left animate-fade-in shadow-2xl relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-12 text-center tracking-tight">
                {title.split(' ')[0]} <span className="text-brand-primary">{title.split(' ').slice(1).join(' ')}</span>
            </h2>

            <div className="space-y-2">
                {Array.isArray(sections) && sections.map((section: any, index: number) => (
                    <Section key={index} title={section.title || ''}>
                        <p className="whitespace-pre-line">{section.text}</p>
                    </Section>
                ))}

                <div className="mt-8 p-6 bg-red-500/5 border border-red-500/20 text-brand-secondary text-base rounded-2xl shadow-inner backdrop-blur-md">
                    <p className="font-bold mb-3 text-red-500 flex items-center gap-2 uppercase tracking-widest text-sm">
                        <span>⚠️</span> {language === 'fr' ? 'Avertissement Crucial' : 'Crucial Warning'}
                    </p>
                    <p className="font-light italic">{warning}</p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;