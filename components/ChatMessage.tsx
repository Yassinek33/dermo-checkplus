import React, { useMemo } from 'react';
import { Message } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessageProps {
    message: Message;
}

// A markdown parser and luxury UI renderer for the final report
const FinalReportRenderer: React.FC<{ text: string; userUploadedImageUrls?: string[] }> = ({ text, userUploadedImageUrls }) => {
    const { t, language } = useLanguage();
    const content = text.replace(/\[FINAL_REPORT\]/g, '').trim();

    // Parse sections and extraction of the medical warning block
    const sections = useMemo(() => {
        let all: { title: string, lines: string[], index: number }[] = [];
        let cur = { title: '', lines: [] as string[], index: 1 };
        let warningLines: string[] = [];
        let isWarn = false;
        let counter = 1;

        content.split('\n').forEach(line => {
            const trimmed = line.trim();

            // Detect the medical warning emoji flag
            if (trimmed.includes('⚠️')) {
                isWarn = true;
                const parts = trimmed.split('⚠️');
                const before = parts[0].trim();
                const after = parts.slice(1).join('⚠️').trim();
                if (before) cur.lines.push(before);
                if (after) warningLines.push(after.replace(/^\*\*/, '').replace(/\*\*$/, ''));
                return;
            }

            // Once inside the warning block, capture everything
            if (isWarn) {
                if (trimmed) warningLines.push(trimmed.replace(/^\*\*/, '').replace(/\*\*$/, ''));
                return;
            }

            // Detect section headers encapsulated by asterisks
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                if (cur.title || cur.lines.length > 0) all.push({ ...cur });
                cur = { title: trimmed.replace(/\*\*/g, ''), lines: [], index: counter++ };
            } else if (trimmed) {
                cur.lines.push(trimmed);
            }
        });

        if (cur.title || cur.lines.length > 0) all.push(cur);

        return { all, warningLines };
    }, [content]);

    // Check if a visual analysis section was found to inject images inside
    const hasVisualSection = sections.all.some(sec => sec.title.toLowerCase().includes('visuel') || sec.title.toLowerCase().includes('visual') || sec.title.toLowerCase().includes('visuele') || sec.title.toLowerCase().includes('photo') || sec.title.toLowerCase().includes('foto'));

    return (
        <div className="w-full max-w-[800px] mx-auto bg-[#060d0f] rounded-[2.5rem] p-6 md:p-12 text-left shadow-2xl animate-fade-in relative z-10 font-sans border-t border-t-white/5">

            {/* Report Header */}
            <div className="flex flex-col items-center justify-center mb-12 text-center relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full text-brand-primary font-bold text-sm md:text-base mb-6 font-display top-badge-animation">
                    <span className="text-lg">🔬</span> {t('report.header_badge')}
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight mb-4">{t('report.title')}</h2>
                <p className="text-white/40 text-sm md:text-base font-medium">
                    {new Intl.DateTimeFormat(language || 'fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}
                </p>
                <div className="w-24 h-[1px] bg-brand-primary/50 mt-8 rounded-full"></div>
            </div>

            {/* Content Sections */}
            <div className="flex flex-col gap-12">
                {sections.all.map((sec, idx) => {
                    const isConclusion = sec.title.toLowerCase().includes('conclusion') || sec.title.toLowerCase().includes('hipótesis') || sec.title.toLowerCase().includes('hypothesis');
                    const isVisual = sec.title.toLowerCase().includes('visuel') || sec.title.toLowerCase().includes('visual') || sec.title.toLowerCase().includes('visuele') || sec.title.toLowerCase().includes('photo') || sec.title.toLowerCase().includes('foto');

                    let hypCount = 0;
                    const badgeColors = [
                        { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: t('report.urgency_low') }, // Hypothesis 1
                        { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: t('report.urgency_med') },       // Hypothesis 2
                        { bg: 'bg-red-500/10 border-red-500/30 text-red-400', label: t('report.urgency_high') },             // Hypothesis 3
                        { bg: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary', label: '' }
                    ];

                    return (
                        <div key={idx} className="bg-[#0d1a1c] rounded-xl p-6 md:p-10 relative overflow-hidden shadow-lg group transition-all duration-300">
                            {/* Watermark Section Number */}
                            <div className="absolute text-[8rem] md:text-[12rem] font-black text-white/[0.02] -top-10 -right-4 z-0 pointer-events-none select-none transition-transform duration-700 group-hover:scale-110">
                                {String(sec.index).padStart(2, '0')}
                            </div>

                            {/* Accentuated Section Title */}
                            {sec.title && (
                                <h3 className="uppercase border-l-4 border-brand-primary pl-4 mb-8 text-xl md:text-2xl tracking-widest z-10 relative text-white font-display font-bold">
                                    {sec.title}
                                </h3>
                            )}

                            {/* Rich Content Render */}
                            <div className="z-10 relative text-white/90 leading-relaxed font-sans text-base md:text-lg flex flex-col gap-5">
                                {sec.lines.map((line, lIdx) => {
                                    const listMatch = line.match(/^(\*|-|\d+\.)\s*(.*)/);

                                    // Hypothesis Card Matching
                                    if (listMatch && isConclusion) {
                                        const content = listMatch[2];
                                        const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
                                        const badgeData = badgeColors[hypCount % badgeColors.length];
                                        hypCount++;
                                        return (
                                            <div key={lIdx} className={`rounded-xl p-5 border ${badgeData.bg} shadow-sm my-2`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-current bg-current/[0.15]">
                                                            {hypCount}
                                                        </div>
                                                        <div dangerouslySetInnerHTML={{ __html: formatted }} />
                                                    </div>
                                                    {badgeData.label && (
                                                        <div className="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-current/[0.05] border-current mt-2 sm:mt-0">
                                                            {badgeData.label}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    // Regular List Item
                                    else if (listMatch) {
                                        const content = listMatch[2];
                                        const formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
                                        return <li key={lIdx} className="ml-5 list-disc pl-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
                                    }
                                    // Regular Paragraph Text
                                    else {
                                        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
                                        return <p key={lIdx} dangerouslySetInnerHTML={{ __html: formatted }} />;
                                    }
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Dedicated Photo Bubble (Unnumbered) */}
                {userUploadedImageUrls && userUploadedImageUrls.length > 0 && (
                    <div className="bg-[#0d1a1c] rounded-xl p-6 md:p-10 relative overflow-hidden shadow-xl border border-white/5 transition-all duration-300 group hover:border-brand-primary/20 hover:shadow-[0_0_30px_rgba(45,212,191,0.05)]">
                        <div className="flex items-center gap-4 mb-8 z-10 relative">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                                <svg className="w-5 h-5 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <h3 className="uppercase text-xl md:text-2xl tracking-widest text-white font-display font-bold m-0">
                                {t('report.images_provided')}
                            </h3>
                        </div>

                        <div className="z-10 relative w-full max-w-sm mx-auto mt-4">
                            {userUploadedImageUrls.map((url, i) => (
                                <div key={i} className="mb-6">
                                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group/img hover:scale-[1.02] transition-transform duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#060d0f]/80 via-transparent to-transparent pointer-events-none z-10 transition-opacity duration-300 group-hover/img:opacity-0"></div>
                                        <div className="absolute inset-0 ring-1 ring-inset ring-brand-primary/20 rounded-2xl z-20 pointer-events-none"></div>
                                        <img src={url} alt={`Analyse ${i + 1}`} className="w-full h-auto object-cover aspect-4/3" />
                                    </div>
                                    <p className="text-white/40 text-sm mt-4 text-center tracking-wide font-medium relative z-10">{t('report.image_caption')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Medical Warning Box */}
            {sections.warningLines.length > 0 && (
                <div className="mt-12 bg-[#1a0f00] border border-orange-500/20 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 text-3xl">
                        ⚠️
                    </div>
                    <div>
                        <h4 className="text-orange-300 font-bold uppercase tracking-wider text-sm mb-2">{t('report.medical_warning_title')}</h4>
                        <div className="text-orange-200/80 text-sm md:text-base leading-relaxed space-y-2">
                            {sections.warningLines.map((wl, i) => (
                                <p key={i}>{wl}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Target Actions */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href="/dermatologists" className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-brand-deep rounded-full font-bold text-lg hover:bg-brand-primary/90 transition-all text-center shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] hover:scale-105 transform active:scale-95 flex items-center justify-center gap-2 font-display">
                    {t('report.find_derma')}
                </a>
                <button onClick={() => window.location.reload()} className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/5 transition-all text-center hover:border-white/20 active:scale-95 font-display flex items-center justify-center gap-2">
                    {t('report.new_analysis')}
                </button>
            </div>

        </div>
    );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    // This component is now primarily for displaying the final report in the new QCM-style UI.
    if (message.isFinalReport) {
        return <FinalReportRenderer text={message.text} userUploadedImageUrls={message.userUploadedImageUrls} />;
    }

    // Return null for any other message type as they are not displayed in a chat format anymore.
    return null;
};

export default ChatMessage;