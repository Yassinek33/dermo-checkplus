
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
    message: Message;
}

// A markdown parser for the final report
const FinalReportRenderer: React.FC<{ text: string; userUploadedImageUrls?: string[] }> = ({ text, userUploadedImageUrls }) => {
    const content = text.replace('[FINAL_REPORT]', '').trim();

    const renderContent = () => {
        let parts: React.ReactNode[] = [];
        let currentSection: string | null = null;
        let imageSectionHandled = false;

        content.split('\n').forEach((line, index) => {
            const trimmedLine = line.trim();

            // Handle section titles for final report
            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                currentSection = trimmedLine.replace(/\*\*/g, '');
                parts.push(<h3 key={`h3-${index}`} className="text-xl md:text-2xl font-display font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 leading-tight">{currentSection}</h3>);

                // Insert images right after "Analyse visuelle" or "Analyse photo" section if available
                if ((currentSection === 'Analyse visuelle' || currentSection === 'Analyse photo') && userUploadedImageUrls && userUploadedImageUrls.length > 0 && !imageSectionHandled) {
                    parts.push(
                        <div key="user-images" className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                            {userUploadedImageUrls.map((url, imgIndex) => (
                                <img
                                    key={`uploaded-img-${imgIndex}`}
                                    src={url}
                                    alt={`Image utilisateur ${imgIndex + 1}`}
                                    className="w-full h-auto object-cover rounded-2xl shadow-2xl border border-white/10 grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                                />
                            ))}
                        </div>
                    );
                    imageSectionHandled = true; // Ensure images are only added once
                }
                return;
            }

            // Handle list items starting with *
            if (trimmedLine.startsWith('*')) {
                const cleanLine = trimmedLine.replace(/^\s*\*/, '').trim();
                // Support bolding within list items - use brand primary for bold parts
                const formattedLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-primary font-bold">$1</span>');
                parts.push(
                    <li key={`li-${index}`} className="ml-5 list-disc text-brand-secondary/80 text-base leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                );
            } else if (trimmedLine) {
                // Render paragraphs, supporting bolding within them
                const formattedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<span class="text-brand-primary font-bold">$1</span>');
                parts.push(<p key={`p-${index}`} className="my-3 text-brand-secondary/90 text-base leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: formattedLine }} />);
            } else {
                // Keep empty lines as spacing
                parts.push(<p key={`empty-${index}`} className="my-1 text-base leading-relaxed"><br /></p>);
            }
        });

        // If 'Analyse visuelle' section wasn't explicitly present but images exist, add them at the end.
        if (userUploadedImageUrls && userUploadedImageUrls.length > 0 && !imageSectionHandled) {
            parts.push(<h3 key="h3-images-fallback" className="text-xl md:text-2xl font-display font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 leading-tight">Images fournies</h3>);
            parts.push(
                <div key="user-images-fallback" className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {userUploadedImageUrls.map((url, imgIndex) => (
                        <img
                            key={`uploaded-img-fallback-${imgIndex}`}
                            src={url}
                            alt={`Image utilisateur ${imgIndex + 1}`}
                            className="w-full h-auto object-cover rounded-2xl shadow-2xl border border-white/10"
                        />
                    ))}
                </div>
            );
        }

        return parts;
    };

    return (
        <div className="prose prose-invert max-w-none bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 text-left shadow-2xl animate-fade-in ring-1 ring-white/5">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">Rapport de Synthèse</h2>
            </div>
            {renderContent()}
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