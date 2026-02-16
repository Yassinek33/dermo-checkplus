
import React, { useState, forwardRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface TextInputProps {
    onSubmit: (text: string) => void;
    placeholder?: string;
    showNoneButton?: boolean;
    onNoneClick?: (text: string) => void;
    noneButtonText?: string;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(({ onSubmit, placeholder, showNoneButton, onNoneClick, noneButtonText }, ref) => {
    const { t } = useLanguage();
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSubmit(inputValue.trim());
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder || t('questionnaire_ui.placeholder_text')}
                className="w-full px-4 py-3 md:px-5 md:py-4 border border-white/10 bg-white/5 text-white placeholder-white/30 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors shadow-inner resize-none"
                rows={4}
                autoFocus
                ref={ref}
            />
            <button
                type="submit"
                className="w-full max-w-lg px-7 py-3 md:py-4 bg-brand-primary text-brand-deep text-base md:text-lg rounded-full hover:bg-brand-primary/90 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]"
                disabled={!inputValue.trim()}
            >
                {t('questionnaire_ui.validate')}
            </button>
            {showNoneButton && onNoneClick && (
                <button
                    type="button"
                    onClick={() => onNoneClick(noneButtonText || t('questionnaire_ui.skip_step'))}
                    className="w-full max-w-lg px-7 py-3 md:py-4 bg-white border border-emerald-500 text-emerald-600 text-base md:text-lg rounded-full hover:bg-emerald-50 transition-colors font-semibold shadow-lg"
                    aria-label={noneButtonText || t('questionnaire_ui.skip_step')}
                >
                    {noneButtonText || t('questionnaire_ui.skip_step')}
                </button>
            )}
        </form>
    );
});

TextInput.displayName = 'TextInput';

export default TextInput;