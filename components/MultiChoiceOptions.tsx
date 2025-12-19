
import React, { useState } from 'react';

interface MultiChoiceOptionsProps {
    options: string[];
    onSubmit: (selected: string[]) => void;
    hasNoneButton?: boolean;
    noneButtonText?: string;
    onNoneClick?: (text: string) => void;
    optionButtonRefs?: React.MutableRefObject<(HTMLButtonElement | null)[]>; // New prop for refs
}

// Define mutually exclusive options (these will be removed from options array in Questionnaire.tsx now)
const MUTUALLY_EXCLUSIVE_OPTIONS = [
    "Je ne sais pas",
    "Aucun symptôme notable",
    "Aucun antécédent",
    "Aucun",
    "Aucun de ces facteurs" // Added for consistency
];

const MultiChoiceOptions: React.FC<MultiChoiceOptionsProps> = ({ options, onSubmit, hasNoneButton, noneButtonText, onNoneClick, optionButtonRefs }) => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleOption = (option: string) => {
        setSelected(prev => {
            const isMutuallyExclusive = MUTUALLY_EXCLUSIVE_OPTIONS.includes(option);
            const isCurrentlySelected = prev.includes(option);

            if (isMutuallyExclusive) {
                if (isCurrentlySelected) {
                    // If it's a mutually exclusive option and it's currently selected, deselect it.
                    return prev.filter(item => item !== option);
                } else {
                    // If it's a mutually exclusive option and not selected, select ONLY it.
                    return [option];
                }
            } else {
                if (isCurrentlySelected) {
                    // If it's a regular option and currently selected, deselect it.
                    return prev.filter(item => item !== option);
                } else {
                    // If it's a regular option and not selected, add it and deselect any mutually exclusive options.
                    return [...prev.filter(item => !MUTUALLY_EXCLUSIVE_OPTIONS.includes(item)), option];
                }
            }
        });
    };

    const handleSubmit = () => {
        if (selected.length > 0) {
            onSubmit(selected);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
                {options.map((opt, index) => (
                    <button
                        key={opt}
                        onClick={() => toggleOption(opt)}
                        className={`p-3 md:p-4 text-center rounded-2xl border transition-all duration-200 ease-in-out transform hover:-translate-y-1 text-sm md:text-base font-medium backdrop-blur-md shadow-lg ${selected.includes(opt)
                                ? 'bg-brand-primary border-brand-primary text-brand-deep shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                                : 'bg-white/5 border-white/10 text-brand-secondary hover:bg-white/10 hover:border-brand-primary/40 hover:text-white'
                            }`}
                        aria-pressed={selected.includes(opt)}
                        // Fix: Explicitly type `el` as HTMLButtonElement | null to match RefCallback signature
                        ref={(el: HTMLButtonElement | null) => { if (optionButtonRefs && optionButtonRefs.current) optionButtonRefs.current[index] = el; }} // Assign ref
                    >
                        {opt}
                    </button>
                ))}
            </div>
            <button
                onClick={handleSubmit}
                disabled={selected.length === 0}
                className="mt-2 w-full max-w-lg px-7 py-3 md:py-4 bg-brand-primary text-brand-deep text-base md:text-lg rounded-full hover:bg-brand-primary/90 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]"
            >
                Valider
            </button>

            {hasNoneButton && noneButtonText && onNoneClick && (
                <button
                    type="button"
                    onClick={() => onNoneClick(noneButtonText)}
                    className="w-full max-w-lg p-4 md:p-5 bg-white/5 border border-white/10 text-brand-secondary rounded-2xl shadow-lg
                               hover:bg-white/10 hover:border-brand-primary/30 hover:text-white transition-all duration-200
                               ease-in-out transform hover:-translate-y-1 capitalize font-medium text-base md:text-lg mt-2 backdrop-blur-md"
                >
                    {noneButtonText}
                </button>
            )}
        </div>
    );
};

export default MultiChoiceOptions;