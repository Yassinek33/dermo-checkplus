import React, { useState, ReactNode } from 'react';

interface TooltipProps {
    text: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowStyles = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[#1a1d23]',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[#1a1d23]',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[#1a1d23]',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[#1a1d23]'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {/* Tooltip content - always in DOM but conditionally visible */}
            <div
                className={`absolute ${positionStyles[position]} z-[9999] pointer-events-none transition-all duration-150 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                style={{
                    transform: isVisible
                        ? positionStyles[position].includes('translate') ? undefined : 'none'
                        : position === 'top' ? 'translateY(5px)' : 'translateY(-5px)'
                }}
            >
                {/* Tooltip content */}
                <div className="relative bg-[#1a1d23] text-white text-sm font-medium px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap backdrop-blur-sm">
                    <div className="relative z-10">{text}</div>

                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-lg pointer-events-none"></div>

                    {/* Arrow */}
                    <div className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`}></div>
                </div>
            </div>
        </div>
    );
};
