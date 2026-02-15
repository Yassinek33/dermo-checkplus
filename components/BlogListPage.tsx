import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { blogArticlesFR, blogArticlesEN } from '../data/blogArticles';

interface BlogListPageProps {
    onNavigate: (pageId: string, articleSlug?: string) => void;
}

export const BlogListPage: React.FC<BlogListPageProps> = ({ onNavigate }) => {
    const { language } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Use English or French articles based on language
    const articles = language === 'fr' ? blogArticlesFR : blogArticlesEN;

    const categories = ['all', 'Soins de la peau', 'Conditions cutanées', 'Prévention'];

    const filteredArticles = selectedCategory === 'all'
        ? articles
        : articles.filter(article => article.category === selectedCategory);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Soins de la peau': return 'from-blue-500 to-cyan-500';
            case 'Conditions cutanées': return 'from-purple-500 to-pink-500';
            case 'Prévention': return 'from-green-500 to-emerald-500';
            default: return 'from-brand-primary to-cyan-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-deep via-[#0d1117] to-black py-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Blog Dermatologique
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Conseils d'experts et informations scientifiques pour prendre soin de votre peau
                    </p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-4 mb-12"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                                ? 'bg-brand-primary text-brand-deep shadow-lg shadow-brand-primary/50'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {category === 'all' ? 'Tous les articles' : category}
                        </button>
                    ))}
                </motion.div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArticles.map((article, index) => (
                        <motion.article
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/20 cursor-pointer"
                            onClick={() => onNavigate('blog-article', article.slug)}
                        >
                            {/* Category Badge */}
                            <div className="p-6 pb-0">
                                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(article.category)} text-white`}>
                                    {article.category}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                                    {article.title}
                                </h2>

                                <p className="text-gray-400 mb-4 line-clamp-3">
                                    {article.excerpt}
                                </p>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span>{article.author.split(',')[0]}</span>
                                    <span>{article.readTime} min de lecture</span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Read More Arrow */}
                            <div className="px-6 pb-6">
                                <div className="flex items-center text-brand-primary group-hover:translate-x-2 transition-transform">
                                    <span className="font-medium">Lire l'article</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* No Articles Message */}
                {filteredArticles.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">Aucun article dans cette catégorie pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
