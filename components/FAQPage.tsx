import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    questions: FAQItem[];
}

export const FAQPage: React.FC = () => {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    // Organize FAQ questions by category
    const categories: FAQCategory[] = [
        {
            title: t('faq.categories.usage'),
            questions: [
                t('faq.questions.q1'),
                t('faq.questions.q2'),
                t('faq.questions.q3'),
                t('faq.questions.q4')
            ]
        },
        {
            title: t('faq.categories.technology'),
            questions: [
                t('faq.questions.q5'),
                t('faq.questions.q6'),
                t('faq.questions.q7')
            ]
        },
        {
            title: t('faq.categories.security'),
            questions: [
                t('faq.questions.q8'),
                t('faq.questions.q9'),
                t('faq.questions.q10')
            ]
        },
        {
            title: t('faq.categories.accuracy'),
            questions: [
                t('faq.questions.q11'),
                t('faq.questions.q12'),
                t('faq.questions.q13')
            ]
        }
    ];

    const toggleQuestion = (index: string) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0b0d] via-[#0d0e10] to-black py-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
                    >
                        {t('faq.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-gray-400 text-lg"
                    >
                        {t('faq.subtitle')}
                    </motion.p>
                </div>

                {/* FAQ Categories */}
                {categories.map((category, categoryIndex) => (
                    <motion.div
                        key={categoryIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                        className="mb-12"
                    >
                        {/* Category Title */}
                        <h2 className="text-2xl font-display font-bold text-brand-primary mb-6">
                            {category.title}
                        </h2>

                        {/* Questions */}
                        <div className="space-y-4">
                            {category.questions.map((item, questionIndex) => {
                                const itemId = `${categoryIndex}-${questionIndex}`;
                                const isOpen = openIndex === itemId;

                                return (
                                    <div
                                        key={itemId}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-brand-primary/30 transition-all duration-300"
                                    >
                                        {/* Question Button */}
                                        <button
                                            onClick={() => toggleQuestion(itemId)}
                                            className="w-full px-6 py-5 flex items-center justify-between text-left group"
                                        >
                                            <span className="text-white font-medium text-lg pr-4 group-hover:text-brand-primary transition-colors">
                                                {item.question}
                                            </span>
                                            <motion.svg
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="w-5 h-5 text-brand-primary flex-shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </motion.svg>
                                        </button>

                                        {/* Answer */}
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-5 pt-2 text-gray-300 leading-relaxed border-t border-white/5">
                                                        {item.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16 text-center p-8 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-2xl"
                >
                    <h3 className="text-2xl font-display font-bold text-white mb-3">
                        {t('common.nav.analysis')}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {t('home.hero.subtitle')}
                    </p>
                    <button
                        onClick={() => window.location.href = '/analysis'}
                        className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-full hover:shadow-lg hover:shadow-brand-primary/50 transition-all duration-300"
                    >
                        {t('home.hero.cta_start')}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
