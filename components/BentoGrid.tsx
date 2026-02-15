import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export const BentoGrid: React.FC<{
    className?: string;
    children?: React.ReactNode;
}> = ({ className, children }) => {
    return (
        <div className={clsx("grid md:auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto", className)}>
            {children}
        </div>
    );
};

export const BentoGridItem: React.FC<{
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    cols?: number;
    rows?: number;
}> = ({ className, title, description, header, icon, cols = 1, rows = 1 }) => {
    return (
        <motion.div
            className={clsx(
                "rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-0 bg-[#0A0A0B] border border-white/10 justify-between flex flex-col overflow-hidden relative",
                cols === 2 ? "md:col-span-2" : "md:col-span-1",
                rows === 2 ? "md:row-span-2" : "md:row-span-1",
                className
            )}
            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(45, 212, 191, 0.1)" }}
        >
            {/* Background glow on hover */}
            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10 p-6 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/95 to-transparent">
                {icon}
                <div className="font-display font-bold text-neutral-200 mb-3 mt-2 text-xl">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-300 text-sm leading-relaxed">
                    {description}
                </div>
            </div>
        </motion.div>
    );
};
