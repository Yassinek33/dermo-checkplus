import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface HoloCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const HoloCard: React.FC<HoloCardProps> = ({ children, className = '', onClick }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for tilt
    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

    // Transform mouse values to rotation degrees
    // Range: -15deg to 15deg
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    // Dynamic Shine/Glare Gradient
    // Moves opposite to mouse to simulate reflection
    const shineX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
    const shineY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        // Normalize coordinates (-0.5 to 0.5)
        // 0 is center
        const xPct = (mouseXPos / width) - 0.5;
        const yPct = (mouseYPos / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000,
            }}
            className={`relative transition-all duration-200 ease-out will-change-transform ${className}`}
        >
            {/* Glossy Overlay (The Glare) */}
            <motion.div
                className="absolute inset-0 w-full h-full z-20 pointer-events-none rounded-[inherit]"
                style={{
                    background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.0) 50%)`,
                    backgroundSize: '200% 200%',
                    backgroundPositionX: useTransform(shineX, v => `${v}%`),
                    backgroundPositionY: useTransform(shineY, v => `${v}%`),
                    opacity: useTransform(mouseX, [-0.5, 0, 0.5], [0.6, 0, 0.6]), // Only visible when tilted
                    mixBlendMode: 'overlay',
                }}
            />

            {/* Content */}
            <div style={{ transform: "translateZ(20px)" }} className="relative z-10 h-full">
                {children}
            </div>
        </motion.div>
    );
};

export default HoloCard;
