import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { blogArticlesFR, blogArticlesEN, BlogArticle } from '../data/blogArticles';
import { blogArticlesNL } from '../data/blogArticlesNL';
import { blogArticlesES } from '../data/blogArticlesES';

interface BlogArticlePageProps {
    slug: string;
    onNavigate: (pageId: string) => void;
}

export const BlogArticlePageComponent: React.FC<BlogArticlePageProps> = ({ slug, onNavigate }) => {
    const { language, t } = useLanguage();

    // Use specific articles based on language
    const articles = language === 'fr' ? blogArticlesFR : language === 'nl' ? blogArticlesNL : language === 'es' ? blogArticlesES : blogArticlesEN;
    const article = articles.find(a => a.slug === slug);

    if (!article) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-brand-deep via-[#0d1117] to-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">{t('blog.not_found')}</h1>
                    <button
                        onClick={() => onNavigate('blog')}
                        className="text-brand-primary hover:underline"
                    >
                        {t('blog.back')}
                    </button>
                </div>
            </div>
        );
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'skincare': return 'from-blue-500 to-cyan-500';
            case 'conditions': return 'from-purple-500 to-pink-500';
            case 'prevention': return 'from-green-500 to-emerald-500';
            default: return 'from-brand-primary to-cyan-500';
        }
    };

    const getLocale = (lang: string) => {
        switch (lang) {
            case 'en': return 'en-US';
            case 'nl': return 'nl-NL';
            case 'es': return 'es-ES';
            default: return 'fr-FR';
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-deep via-[#0d1117] to-black py-20">
            <div className="max-w-4xl mx-auto px-6">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => onNavigate('blog')}
                    className="flex items-center text-gray-400 hover:text-brand-primary transition-colors mb-8 group"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('blog.back')}
                </motion.button>

                {/* Article Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    {/* Category Badge */}
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(article.category)} text-white mb-6`}>
                        {t(`blog.categories.${article.category}`)}
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {article.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {article.author}
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(article.date).toLocaleDateString(getLocale(language), { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {article.readTime} {t('blog.read_time')}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <p className="text-xl text-gray-300 leading-relaxed">
                        {article.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-6">
                        {article.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Expert Quote */}
                {article.expertQuote && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-brand-primary/10 to-cyan-500/10 border-l-4 border-brand-primary rounded-r-2xl p-6 mb-12"
                    >
                        <div className="flex items-start">
                            <svg className="w-8 h-8 text-brand-primary flex-shrink-0 mr-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                            <div>
                                <p className="text-white text-lg italic mb-3">
                                    "{article.expertQuote.text}"
                                </p>
                                <p className="text-brand-primary font-semibold">
                                    — {article.expertQuote.author}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {article.expertQuote.credentials}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Article Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-invert prose-lg max-w-none
                        prose-headings:text-white prose-headings:font-bold
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-brand-primary
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                        prose-strong:text-white prose-strong:font-bold
                        prose-ul:text-gray-300 prose-ul:my-4
                        prose-li:my-2
                        prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />').replace(/##/g, '<h2>').replace(/###/g, '<h3>') }}
                />

                {/* Back to Blog Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 pt-8 border-t border-white/10"
                >
                    <button
                        onClick={() => onNavigate('blog')}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-brand-primary to-cyan-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-brand-primary/50 transition-all duration-300"
                    >
                        {t('blog.see_all')}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
