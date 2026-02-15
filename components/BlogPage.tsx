import React, { useState, useMemo } from 'react';
import { PageConfig } from '../types';
import { appConfig } from '../config';
import { ArticleItem } from '../types'; // Import ArticleItem type

interface BlogPageProps {
    config: PageConfig;
}

const BlogPage: React.FC<BlogPageProps> = ({ config }) => {
    const themeConfig = appConfig.app.theme;
    const [searchTerm, setSearchTerm] = useState('');

    // Use articles from config if available
    const articlesSection = config.sections?.find(s => s.type === 'articles');
    // Fix: Explicitly cast rawArticles to ArticleItem[]
    const rawArticles: ArticleItem[] = (articlesSection?.items || []) as ArticleItem[];

    // Filter articles based on search term
    const filteredArticles = useMemo(() => {
        if (!searchTerm) {
            return rawArticles;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return rawArticles.filter(article =>
            article.title.toLowerCase().includes(lowercasedSearchTerm) ||
            article.excerpt.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [rawArticles, searchTerm]);

    // Determine what to display based on filteredArticles and searchTerm
    let contentToDisplay;
    if (filteredArticles.length > 0) {
        contentToDisplay = filteredArticles;
    } else if (searchTerm) {
        contentToDisplay = []; // No results for the current search term
    } else {
        // No search term, and no articles from config, so show placeholder
        contentToDisplay = [{
            title: config.autoUpdate?.placeholderArticle?.title || 'Titre par défaut',
            date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
            excerpt: config.autoUpdate?.placeholderArticle?.excerpt || 'Extrait de l\'article du blog sur la peau et la prévention...',
            tag: config.autoUpdate?.placeholderArticle?.tag || 'Prévention'
        }];
    }

    return (
        <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-12 text-left animate-fade-in shadow-2xl relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 text-center tracking-tight">{config.title}</h2>
            {config.description && <p className="text-base md:text-xl text-brand-secondary/70 mb-10 text-center leading-relaxed font-light">{config.description}</p>}

            <div className="mb-12 relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-brand-primary/50 group-focus-within:text-brand-primary transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input
                    type="text"
                    placeholder="Rechercher des articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 text-white text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all shadow-inner backdrop-blur-sm placeholder-white/20"
                    aria-label="Rechercher des articles"
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {contentToDisplay.length > 0 ? (
                    contentToDisplay.map((post, index) => (
                        <div key={index}
                            className="group glass-card p-6 md:p-8 rounded-2xl hover:border-brand-primary/40 transition-all duration-500 bg-white/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-lg uppercase tracking-widest border border-brand-primary/20">
                                        {post.tag}
                                    </span>
                                    <span className="text-brand-secondary/40 text-xs font-mono uppercase">
                                        {post.date || new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-brand-primary transition-colors leading-tight">
                                    {post.title}
                                </h3>

                                <p className="text-brand-secondary/80 text-lg leading-relaxed font-light">
                                    {post.excerpt}
                                </p>

                                <button className="flex items-center gap-2 text-brand-primary font-bold text-sm mt-2 group/btn">
                                    Lire la suite
                                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-brand-secondary/40 text-lg md:text-xl py-20 font-light italic">
                        Aucun article ne correspond à votre recherche.
                    </p>
                )}
            </div>
        </div>
    );
};

export default BlogPage;