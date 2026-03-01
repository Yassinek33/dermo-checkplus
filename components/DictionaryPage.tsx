import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { dictionaryTerms } from '../data/dictionaryTerms';

const DictionaryPage: React.FC<{ config: PageConfig }> = ({ config }) => {
    const { t, language } = useLanguage();
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const letterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const allTerms = dictionaryTerms[language] || dictionaryTerms['fr'];

    const filteredTerms = useMemo(() => {
        if (!searchQuery.trim()) return allTerms;
        const q = searchQuery.toLowerCase().trim();
        return allTerms.filter(term =>
            term.term.toLowerCase().includes(q) ||
            term.definition.toLowerCase().includes(q)
        );
    }, [allTerms, searchQuery]);

    const groupedTerms = useMemo(() => {
        const groups: { [key: string]: DictionaryTerm[] } = {};
        filteredTerms.forEach(item => {
            const firstLetter = item.term.charAt(0).toUpperCase();
            if (!groups[firstLetter]) groups[firstLetter] = [];
            groups[firstLetter].push(item);
        });
        return groups;
    }, [filteredTerms]);

    const alphabet = useMemo(() => Object.keys(groupedTerms).sort(), [groupedTerms]);

    const scrollToLetter = (letter: string) => {
        letterRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getTermsFoundText = (count: number) => {
        const label = count === 1
            ? t('dictionary.terms_found_one')
            : t('dictionary.terms_found_many');
        return `${count} ${label} « ${searchQuery} »`;
    };

    const getTermCountLabel = (count: number) => {
        return count === 1
            ? `${count} ${t('dictionary.terms_count_label')}`
            : `${count} ${t('dictionary.terms_count_label_plural')}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-10">

            {/* ── Header ── */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                        {t('dictionary.title')}
                    </h1>
                    <span className="px-3 py-1 text-xs font-mono font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 rounded-full tracking-widest uppercase">
                        {allTerms.length} {t('dictionary.terms_label')}
                    </span>
                </div>
                <p className="text-brand-secondary/60 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
                    {t('dictionary.description')}
                </p>
            </div>

            {/* ── Search bar ── */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-brand-primary/40 group-focus-within:text-brand-primary/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder={t('dictionary.search_placeholder')}
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSelectedTerm(null); }}
                    className="w-full pl-12 pr-12 py-4 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-white/25 focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.06] transition-all duration-300 text-base"
                />
                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedTerm(null); }}
                        className="absolute inset-y-0 right-4 flex items-center text-white/25 hover:text-white/60 transition-colors"
                        aria-label={t('dictionary.clear_search')}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Alphabet navigation ── */}
            {!searchQuery && (
                <div className="flex flex-wrap gap-1.5 justify-center px-4">
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                        const hasTerms = !!groupedTerms[letter];
                        return (
                            <button
                                key={letter}
                                onClick={() => hasTerms && scrollToLetter(letter)}
                                disabled={!hasTerms}
                                className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all duration-200 ${hasTerms
                                    ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 hover:scale-105 cursor-pointer'
                                    : 'text-white/15 bg-transparent border border-white/5 cursor-default'
                                    }`}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Search result count ── */}
            {searchQuery && (
                <p className="text-center text-brand-secondary/40 text-sm font-light">
                    {filteredTerms.length === 0
                        ? `${t('dictionary.no_results')} « ${searchQuery} »`
                        : getTermsFoundText(filteredTerms.length)
                    }
                </p>
            )}

            {/* ── Terms list ── */}
            {alphabet.length > 0 ? (
                <div className="space-y-14">
                    {alphabet.map((letter, sectionIndex) => (
                        <motion.div
                            key={letter}
                            ref={el => { letterRefs.current[letter] = el; }}
                            className="scroll-mt-36"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: sectionIndex * 0.04, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {/* Letter heading */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                                    <span className="text-xl font-display font-black text-brand-primary leading-none">
                                        {letter}
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-white/[0.06]" />
                                <span className="text-xs font-mono text-white/20 tabular-nums">
                                    {getTermCountLabel(groupedTerms[letter].length)}
                                </span>
                            </div>

                            {/* Terms grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {groupedTerms[letter].map((item, index) => (
                                    <div key={index}>
                                        <button
                                            onClick={() => setSelectedTerm(prev => prev === item.term ? null : item.term)}
                                            className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${selectedTerm === item.term
                                                ? 'bg-brand-primary/10 border-brand-primary/30 rounded-b-none border-b-transparent'
                                                : 'bg-white/[0.025] border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.05]'
                                                }`}
                                            aria-expanded={selectedTerm === item.term}
                                        >
                                            <span className={`font-semibold text-sm tracking-wide ${selectedTerm === item.term ? 'text-brand-primary' : 'text-white/90'}`}>
                                                {item.term}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${selectedTerm === item.term ? 'rotate-180 text-brand-primary' : 'text-white/20'}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <AnimatePresence>
                                            {selectedTerm === item.term && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 py-4 bg-brand-primary/[0.04] border border-brand-primary/20 border-t-0 rounded-b-xl">
                                                        <p className="text-brand-secondary/80 text-sm leading-relaxed font-light">
                                                            {item.definition}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 space-y-4">
                    <p className="text-5xl opacity-30">🔍</p>
                    <p className="text-white/35 text-base font-light">
                        {t('dictionary.no_results')} « {searchQuery} »
                    </p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-brand-primary/60 text-sm hover:text-brand-primary transition-colors duration-200"
                    >
                        {t('dictionary.clear_search')}
                    </button>
                </div>
            )}

            {/* ── Footer disclaimer ── */}
            <div className="border-t border-white/[0.05] pt-8 text-center">
                <p className="text-white/20 text-xs font-light leading-relaxed max-w-lg mx-auto">
                    {t('dictionary.disclaimer')}
                </p>
            </div>
        </div>
    );
};

export default DictionaryPage;
