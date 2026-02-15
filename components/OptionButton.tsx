
import React, { forwardRef } from 'react';

interface OptionButtonProps {
    text: string;
    onClick: (text: string) => void;
}

const formatOptionText = (text: string) => {
    // Unify casing: Start with uppercase, then rest follows
    const unified = text.charAt(0).toUpperCase() + text.slice(1);

    // Split on parentheses to style them differently
    const parts = unified.split(/(\(.*?\))/);
    return parts.map((part, i) => {
        if (part.startsWith('(') && part.endsWith(')')) {
            return (
                <span key={i} className="block text-xs md:text-sm text-brand-secondary/60 mt-0.5 font-normal">
                    {part}
                </span>
            );
        }
        return <span key={i} className="block leading-tight">{part}</span>;
    });
};

const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(({ text, onClick }, ref) => {
    return (
        <button
            onClick={() => onClick(text)}
            className="w-full flex flex-col items-center justify-center text-center p-4 md:p-6 bg-white/5 border border-white/10 text-brand-secondary rounded-2xl shadow-xl
                       hover:bg-white/10 hover:border-brand-primary/50 hover:text-white transition-all duration-300 
                       ease-out transform hover:-translate-y-1 text-base md:text-lg font-bold backdrop-blur-md min-h-[80px]"
            ref={ref}
        >
            {formatOptionText(text)}
        </button>
    );
});

OptionButton.displayName = 'OptionButton'; // Add display name for forwardRef

export default OptionButton;