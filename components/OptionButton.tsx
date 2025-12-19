
import React, { forwardRef } from 'react';

interface OptionButtonProps {
    text: string;
    onClick: (text: string) => void;
}

const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(({ text, onClick }, ref) => {
    return (
        <button
            onClick={() => onClick(text)}
            className="w-full p-4 md:p-5 bg-white/5 border border-white/10 text-brand-secondary rounded-2xl shadow-lg
                       hover:bg-white/10 hover:border-brand-primary/50 hover:text-white transition-all duration-200 
                       ease-in-out transform hover:-translate-y-1 text-base font-medium backdrop-blur-md"
            ref={ref}
        >
            {text}
        </button>
    );
});

OptionButton.displayName = 'OptionButton'; // Add display name for forwardRef

export default OptionButton;