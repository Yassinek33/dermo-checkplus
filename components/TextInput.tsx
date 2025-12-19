
import React, { useState, forwardRef } from 'react';

interface TextInputProps {
    onSubmit: (text: string) => void;
    placeholder?: string;
    showNoneButton?: boolean;
    onNoneClick?: (text: string) => void; // Changed to accept text, for consistency with generic none button
    noneButtonText?: string; // New: Text for the none button
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(({ onSubmit, placeholder, showNoneButton, onNoneClick, noneButtonText }, ref) => {
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
                placeholder={placeholder || "Ex: Apparu il y a 3 jours comme un point rouge, ça s'est étendu et démange surtout le soir..."}
                className="w-full px-4 py-3 md:px-5 md:py-4 border border-white/10 bg-white/5 text-white placeholder-white/30 text-base md:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-colors shadow-inner resize-none"
                rows={4}
                autoFocus
                ref={ref} // Forward the ref to the textarea
            />
            <button
                type="submit"
                className="w-full max-w-lg px-7 py-3 md:py-4 bg-brand-primary text-brand-deep text-base md:text-lg rounded-full hover:bg-brand-primary/90 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]"
                disabled={!inputValue.trim()}
            >
                Valider
            </button>
            {showNoneButton && onNoneClick && ( // Ensure onNoneClick is provided
                <button
                    type="button"
                    onClick={() => onNoneClick(noneButtonText || "Ignorer cette étape")} // Use noneButtonText if provided
                    className="w-full max-w-lg px-7 py-3 md:py-4 bg-white border border-emerald-500 text-emerald-600 text-base md:text-lg rounded-full hover:bg-emerald-50 transition-colors font-semibold shadow-lg"
                    aria-label={noneButtonText || "Ignorer cette étape"}
                >
                    {noneButtonText || "Ignorer cette étape"}
                </button>
            )}
        </form>
    );
});

TextInput.displayName = 'TextInput'; // Add display name for forwardRef

export default TextInput;