
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface MultiChoiceOptionsProps {
    options: string[];
    onSubmit: (selected: string[]) => void;
    hasNoneButton?: boolean;
    noneButtonText?: string;
    onNoneClick?: (text: string) => void;
    optionButtonRefs?: React.MutableRefObject<(HTMLButtonElement | null)[]>;
    onError?: (message: string) => void;
}

// Define mutually exclusive options (these will be removed from options array in Questionnaire.tsx now)
const MUTUALLY_EXCLUSIVE_OPTIONS = [
    // French (default)
    "Je ne sais pas",
    "Aucun symptôme notable",
    "Aucun antécédent",
    "Aucun",
    "Aucun de ces facteurs",

    // English
    "I don't know",
    "No notable symptoms",
    "No history",
    "None",
    "None of these factors",

    // Dutch
    "Ik weet het niet",
    "Geen noemenswaardige symptomen",
    "Geen voorgeschiedenis",
    "Geen",
    "Geen van deze factoren",

    // Spanish
    "No lo sé",
    "Sin síntomas notables",
    "Sin antecedentes médicos",
    "Ninguno",
    "Ninguno de estos factores"
];

const formatOptionText = (text: string) => {
    const unified = text.charAt(0).toUpperCase() + text.slice(1);
    const parts = unified.split(/(\(.*?\))/);
    return parts.map((part, i) => {
        if (part.startsWith('(') && part.endsWith(')')) {
            return (
                <span key={i} className="block text-[10px] md:text-xs text-brand-secondary/60 mt-0.5 font-normal leading-tight">
                    {part}
                </span>
            );
        }
        return <span key={i} className="block leading-tight">{part}</span>;
    });
};

const MultiChoiceOptions: React.FC<MultiChoiceOptionsProps> = ({ options, onSubmit, hasNoneButton, noneButtonText, onNoneClick, optionButtonRefs, onError }) => {
    const { t } = useLanguage();
    const [selected, setSelected] = useState<string[]>([]);

    const toggleOption = (option: string) => {
        const isMutuallyExclusive = MUTUALLY_EXCLUSIVE_OPTIONS.includes(option);
        const isCurrentlySelected = selected.includes(option);

        if (isCurrentlySelected) {
            setSelected(prev => prev.filter(item => item !== option));
            return;
        }

        if (isMutuallyExclusive) {
            if (selected.length > 0) {
                onError?.(t('questionnaire_ui.error_exclusive'));
                return;
            }
            setSelected([option]);
        } else {
            const hasExclusive = selected.find(item => MUTUALLY_EXCLUSIVE_OPTIONS.includes(item));
            if (hasExclusive) {
                onError?.(t('questionnaire_ui.error_deselect'));
                return;
            }
            setSelected(prev => [...prev, option]);
        }
    };

    const handleSubmit = () => {
        if (selected.length > 0) {
            onSubmit(selected);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                {options.map((opt, index) => (
                    <button
                        key={opt}
                        onClick={() => toggleOption(opt)}
                        className={`flex flex-col items-center justify-center p-4 md:p-6 text-center rounded-2xl border transition-all duration-300 ease-out transform hover:-translate-y-1 text-sm md:text-base font-bold backdrop-blur-md shadow-xl min-h-[90px] ${selected.includes(opt)
                            ? 'bg-brand-primary border-brand-primary text-brand-deep shadow-[0_0_25px_rgba(45,212,191,0.5)] scale-[1.03] z-10'
                            : 'bg-white/5 border-white/10 text-brand-secondary hover:bg-white/10 hover:border-brand-primary/40 hover:text-white'
                            }`}
                        aria-pressed={selected.includes(opt)}
                        ref={(el: HTMLButtonElement | null) => { if (optionButtonRefs && optionButtonRefs.current) optionButtonRefs.current[index] = el; }}
                    >
                        {formatOptionText(opt)}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4 w-full max-w-lg mt-4">
                <button
                    onClick={handleSubmit}
                    disabled={selected.length === 0}
                    className="w-full px-7 py-4 bg-brand-primary text-brand-deep text-lg rounded-full hover:bg-brand-primary/90 disabled:bg-white/5 disabled:text-white/10 disabled:border-white/5 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] active:scale-95"
                >
                    {t('questionnaire_ui.validate_selection')}
                </button>

                {hasNoneButton && noneButtonText && onNoneClick && (
                    <button
                        type="button"
                        onClick={() => {
                            if (selected.length > 0) {
                                onError?.(t('questionnaire_ui.error_clear'));
                            } else {
                                onNoneClick(noneButtonText);
                            }
                        }}
                        className="w-full px-7 py-4 bg-white border-2 border-emerald-500 text-emerald-600 text-lg rounded-full hover:bg-emerald-50 transition-all duration-300 font-bold shadow-xl active:scale-95"
                    >
                        {noneButtonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MultiChoiceOptions;