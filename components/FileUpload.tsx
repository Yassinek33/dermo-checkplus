
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { PaperclipIcon } from './icons';
import { SelectedFilePreview } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    onSkip: () => void;
}

const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(({ onFileSelect, onSkip }, ref) => {
    const { t } = useLanguage();
    const [selectedFilePreviews, setSelectedFilePreviews] = useState<SelectedFilePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileObjectUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        return () => {
            fileObjectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
            fileObjectUrlsRef.current = [];
        };
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const newFiles: File[] = Array.from(event.target.files);

            const newPreviews: SelectedFilePreview[] = newFiles.map(file => {
                const url = URL.createObjectURL(file);
                fileObjectUrlsRef.current.push(url);
                return {
                    file,
                    url,
                    id: `${file.name}-${file.lastModified}-${Math.random()}`,
                    type: 'image',
                };
            });

            setSelectedFilePreviews(prev => [...prev, ...newPreviews]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = (idToRemove: string) => {
        setSelectedFilePreviews(prev => {
            const fileToRemove = prev.find(p => p.id === idToRemove);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.url);
                fileObjectUrlsRef.current = fileObjectUrlsRef.current.filter(url => url !== fileToRemove.url);
            }
            return prev.filter(p => p.id !== idToRemove);
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        if (selectedFilePreviews.length > 0) {
            onFileSelect(selectedFilePreviews.map(p => p.file));
            selectedFilePreviews.forEach(p => URL.revokeObjectURL(p.url));
            fileObjectUrlsRef.current = [];
            setSelectedFilePreviews([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const hasFiles = selectedFilePreviews.length > 0;

    return (
        <div ref={ref} className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-8 rounded-3xl animate-fade-in">
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('questionnaire_ui.photo_tips_title')}
                </h3>
                <ul className="text-sm md:text-base text-brand-secondary/80 list-disc list-inside text-left w-full space-y-2 font-light">
                    <li>{t('questionnaire_ui.photo_tip_1')}</li>
                    <li>{t('questionnaire_ui.photo_tip_2')}</li>
                    <li>{t('questionnaire_ui.photo_tip_3')}</li>
                    <li>{t('questionnaire_ui.photo_tip_4')}</li>
                </ul>
            </div>

            <div className="relative w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl overflow-hidden flex items-center justify-center bg-black/40 p-4 shadow-inner" aria-live="polite" aria-atomic="true">
                {hasFiles ? (
                    <img
                        src={selectedFilePreviews[0].url}
                        alt={t('questionnaire_ui.preview')}
                        className="w-full h-full object-contain rounded-lg"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-brand-secondary/60 text-base md:text-lg font-light leading-relaxed">
                            {t('questionnaire_ui.add_photo')}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 w-full max-w-lg">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                />
                <button
                    onClick={handleButtonClick}
                    className="w-full flex items-center justify-center gap-3 px-7 py-4 bg-white/5 border-2 border-brand-primary/40 text-brand-primary rounded-full hover:bg-brand-primary/10 transition-all duration-300 font-bold shadow-lg"
                    aria-label={hasFiles ? `${selectedFilePreviews.length} ${t('questionnaire_ui.images_selected')}` : t('questionnaire_ui.choose_images')}
                >
                    <PaperclipIcon />
                    <span className="truncate">
                        {hasFiles ? `${selectedFilePreviews.length} ${t('questionnaire_ui.images_selected')}` : t('questionnaire_ui.select_photos')}
                    </span>
                </button>

                {hasFiles ? (
                    <button
                        onClick={handleUploadClick}
                        className="w-full px-7 py-4 bg-brand-primary text-brand-deep text-lg rounded-full hover:bg-brand-primary/90 transition-all duration-300 font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] active:scale-95"
                    >
                        {t('questionnaire_ui.analyze_photo')}
                    </button>
                ) : (
                    <button
                        onClick={onSkip}
                        className="w-full px-7 py-4 bg-white border-2 border-emerald-500 text-emerald-600 text-lg rounded-full hover:bg-emerald-50 transition-all duration-300 font-bold shadow-xl active:scale-95"
                    >
                        {t('questionnaire_ui.skip_step')}
                    </button>
                )}
            </div>

            {hasFiles && selectedFilePreviews.length > 1 && (
                <div className="w-full grid grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                    {selectedFilePreviews.slice(1).map(preview => (
                        <div key={preview.id} className="relative aspect-square group">
                            <img
                                src={preview.url}
                                alt={t('questionnaire_ui.thumbnail')}
                                className="w-full h-full object-cover rounded-xl border border-white/10"
                            />
                            <button
                                onClick={() => handleRemoveFile(preview.id)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;