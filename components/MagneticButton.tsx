import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    secondary?: boolean;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ children, onClick, className = '', secondary = false }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.3, y: y * 0.3 }); // Magnetic pull strength
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="inline-block"
        >
            <motion.button
                onClick={onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    relative px-8 py-4 rounded-full font-medium text-lg tracking-wide transition-all duration-300
                    flex items-center gap-3 overflow-hidden group
                    ${secondary
                        ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 backdrop-blur-md'
                        : 'bg-brand-primary text-brand-deep shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_40px_rgba(45,212,191,0.5)]'
                    }
                    ${className}
                `}
            >
                <div className="relative z-10 flex items-center justify-center gap-2">
                    {children}
                </div>
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            </motion.button>
        </motion.div>
    );
};

export default MagneticButton;
