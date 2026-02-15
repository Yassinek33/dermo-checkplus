
import React from 'react';
import { PageConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { appConfig } from '../config';

interface InfoPageProps {
    config: PageConfig;
}

const Section: React.FC<{ title?: string; text?: string; type: string }> = ({ title, text, type }) => {
    if (type === 'text' && text) {
        const formattedText = text.split('\n').map((paragraph, idx) => {
            const html = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
            return <p key={idx} className="my-4" dangerouslySetInnerHTML={{ __html: html }} />;
        });

        return (
            <div className="mb-10 last:mb-0">
                {title && <h3 className="text-2xl font-display font-bold mb-4 text-brand-primary tracking-tight">{title}</h3>}
                <div className="space-y-4 text-brand-secondary/80 text-lg leading-relaxed font-light">
                    {formattedText}
                </div>
            </div>
        );
    }
    return null;
};

const InfoPage: React.FC<InfoPageProps> = ({ config }) => {
    const { t } = useLanguage();

    // Attempt to get translated content based on config.id
    // We assume the translation key matches the config.id (e.g., 'legal', 'privacy-policy', 'terms-of-use', 'faq')
    // We cast to any because the type of t return is string, but for objects we get the object if we implemented it that way in LanguageContext
    // or if we access directly translations[lang][key]. 
    // However, the standard t function usually returns string. 
    // Let's check how useLanguage is implemented if possible, or assume t returns the object if the key points to an object in the implementation.
    // If t only returns string, we might need to access the translation object directly if exposed, or t('key.title') etc.
    // User's existing code in AboutPage.tsx used: "const sections = t('about.sections') as unknown as any[];"
    // So t() DOES return objects/arrays in this codebase.

    const translatedContent = t(config.id) as any;

    // Check if we have valid translated content (it should be an object with sections)
    // Sometimes t returns the key if missing, so we check if it looks like our data
    const hasTranslation = translatedContent && (translatedContent.sections || translatedContent.title) && typeof translatedContent !== 'string';

    const title = hasTranslation ? translatedContent.title : config.title;
    const sections = hasTranslation ? translatedContent.sections : config.sections;

    return (
        <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-12 text-left animate-fade-in shadow-2xl relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-8 text-center tracking-tight">{title}</h2>

            <div className="divide-y divide-white/10">
                {sections?.map((section: any, index: number) => (
                    <div key={index} className="py-6 first:pt-0 last:pb-0">
                        <Section
                            title={section.title}
                            text={section.text}
                            type={section.type || 'text'}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfoPage;