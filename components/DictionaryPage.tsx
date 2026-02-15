import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageConfig } from '../types';
import { appConfig } from '../config';

interface DictionaryPageProps {
    config: PageConfig;
}

interface DictionaryTerm {
    term: string;
    definition: string;
}

const DictionaryPage: React.FC<DictionaryPageProps> = ({ config }) => {
    const themeConfig = appConfig.app.theme;
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

    const dictionarySection = config.sections?.find(s => s.type === 'dictionary');
    const allTerms: DictionaryTerm[] = dictionarySection?.dictionaryTerms || [];

    // Group terms by first letter
    const groupedTerms = useMemo(() => {
        const groups: { [key: string]: DictionaryTerm[] } = {};
        allTerms.forEach(item => {
            const firstLetter = item.term.charAt(0).toUpperCase();
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter].push(item);
        });
        return groups;
    }, [allTerms]);

    const alphabet = useMemo(() => {
        return Object.keys(groupedTerms).sort();
    }, [groupedTerms]);

    const handleTermClick = (term: string) => {
        setSelectedTerm(prev => (prev === term ? null : term));
    };

    return (
        <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-12 text-left animate-fade-in shadow-2xl relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 text-center tracking-tight">{config.title}</h2>
            {config.description && <p className="text-base md:text-xl text-brand-secondary/70 mb-12 text-center leading-relaxed font-light">{config.description}</p>}

            {alphabet.length > 0 ? (
                <div className="flex flex-col gap-12">
                    {alphabet.map(letter => (
                        <div key={letter} className="relative">
                            <h3 className="text-4xl font-display font-black mb-6 text-brand-primary/20 absolute -top-10 -left-6 select-none">{letter}</h3>
                            <h3 className="text-2xl font-display font-bold mb-6 text-brand-primary border-b border-brand-primary/20 pb-2">{letter}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groupedTerms[letter].map((item, index) => (
                                    <div key={index} className="flex flex-col">
                                        <button
                                            onClick={() => handleTermClick(item.term)}
                                            className={`text-left text-lg font-bold transition-all duration-300 px-4 py-3 rounded-xl border ${selectedTerm === item.term
                                                ? "bg-brand-primary text-brand-deep border-brand-primary shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                                                : "bg-white/5 text-white border-white/10 hover:border-brand-primary/50 hover:bg-white/10"
                                                }`}
                                            aria-expanded={selectedTerm === item.term}
                                        >
                                            {item.term}
                                        </button>
                                        {selectedTerm === item.term && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-3 p-5 bg-black/40 border border-brand-primary/20 rounded-2xl backdrop-blur-md shadow-xl"
                                            >
                                                <p className="text-brand-secondary/90 text-base leading-relaxed font-light">
                                                    {item.definition}
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-brand-secondary/40 text-lg py-20 font-light italic">Aucun terme disponible pour le moment.</p>
            )}
        </div>
    );
};

export default DictionaryPage;