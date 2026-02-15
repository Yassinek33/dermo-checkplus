import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'enter' | 'glow' | 'hold' | 'dissolve' | 'done'>('enter');

    useEffect(() => {
        const glowTimer = setTimeout(() => setPhase('glow'), 1200);
        const holdTimer = setTimeout(() => setPhase('hold'), 2500);
        const dissolveTimer = setTimeout(() => setPhase('dissolve'), 3800);
        const doneTimer = setTimeout(() => {
            setPhase('done');
            onComplete();
        }, 5000);

        return () => {
            clearTimeout(glowTimer);
            clearTimeout(holdTimer);
            clearTimeout(dissolveTimer);
            clearTimeout(doneTimer);
        };
    }, [onComplete]);

    const isDissolving = phase === 'dissolve';

    // Generate random particles for the evaporation effect
    const particles = Array.from({ length: 60 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 500;
        const size = 2 + Math.random() * 6;
        const delay = Math.random() * 0.4;
        const duration = 0.6 + Math.random() * 0.6;
        return { id: i, angle, distance, size, delay, duration };
    });

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    key="splash"
                    className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: '#050508' }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* === BACKGROUND AMBIENT GLOWS === */}
                    <motion.div
                        className="absolute rounded-full"
                        style={{
                            width: 800,
                            height: 800,
                            background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 65%)',
                            top: '10%',
                            left: '-10%',
                        }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute rounded-full"
                        style={{
                            width: 700,
                            height: 700,
                            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)',
                            bottom: '5%',
                            right: '-5%',
                        }}
                        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* === CENTRAL GLOW === */}
                    <motion.div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width: 600,
                            height: 600,
                            background: 'radial-gradient(circle, rgba(45,212,191,0.25) 0%, rgba(45,212,191,0.08) 40%, transparent 65%)',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                            isDissolving
                                ? { scale: 2.5, opacity: 0 }
                                : phase === 'enter'
                                    ? { scale: [0, 0.8], opacity: [0, 0.5] }
                                    : { scale: [0.9, 1.15, 0.95, 0.9], opacity: [0.5, 0.75, 0.55, 0.5] }
                        }
                        transition={
                            isDissolving
                                ? { duration: 1, ease: 'easeOut' }
                                : phase === 'enter'
                                    ? { duration: 1, ease: [0.16, 1, 0.3, 1] }
                                    : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                        }
                    />

                    {/* === LOGO === */}
                    <motion.div
                        className="absolute flex items-center justify-center"
                        initial={{ scale: 0.15, opacity: 0 }}
                        animate={
                            isDissolving
                                ? { scale: 1.15, opacity: 0, filter: 'blur(20px) brightness(2)' }
                                : phase === 'enter'
                                    ? { scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)' }
                                    : phase === 'glow'
                                        ? { scale: [1, 1.04, 1], opacity: 1, filter: 'blur(0px) brightness(1)' }
                                        : { scale: [1, 1.02, 1], opacity: 1, filter: 'blur(0px) brightness(1)' }
                        }
                        transition={
                            isDissolving
                                ? { duration: 1.0, ease: [0.4, 0, 1, 1] }
                                : phase === 'enter'
                                    ? { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                                    : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                        }
                    >
                        <img
                            src="/nouveau-logo.png"
                            alt="DermoCheck"
                            style={{
                                width: 'min(60vw, 60vh)',
                                maxWidth: 600,
                                height: 'auto',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 0 60px rgba(45,212,191,0.5)) drop-shadow(0 0 120px rgba(45,212,191,0.2))',
                            }}
                        />
                    </motion.div>

                    {/* === EVAPORATION PARTICLES (appear only during dissolve) === */}
                    {isDissolving &&
                        particles.map((p) => (
                            <motion.div
                                key={p.id}
                                className="absolute rounded-full"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    background: `rgba(45,212,191,${0.4 + Math.random() * 0.5})`,
                                    boxShadow: `0 0 ${p.size * 2}px rgba(45,212,191,0.4)`,
                                }}
                                initial={{
                                    x: (Math.random() - 0.5) * 200,
                                    y: (Math.random() - 0.5) * 250,
                                    opacity: 0.9,
                                    scale: 1,
                                }}
                                animate={{
                                    x: Math.cos(p.angle) * p.distance,
                                    y: Math.sin(p.angle) * p.distance - 150,
                                    opacity: 0,
                                    scale: 0,
                                }}
                                transition={{
                                    duration: p.duration,
                                    delay: p.delay,
                                    ease: [0.4, 0, 0.2, 1],
                                }}
                            />
                        ))}

                    {/* === PARTICLE RING (before dissolve) === */}
                    {!isDissolving &&
                        [...Array(12)].map((_, i) => {
                            const angle = (i / 12) * Math.PI * 2;
                            const radius = 280;
                            return (
                                <motion.div
                                    key={`ring-${i}`}
                                    className="absolute rounded-full"
                                    style={{
                                        width: i % 3 === 0 ? 5 : 3,
                                        height: i % 3 === 0 ? 5 : 3,
                                        backgroundColor:
                                            i % 2 === 0
                                                ? 'rgba(45,212,191,0.7)'
                                                : 'rgba(59,130,246,0.5)',
                                        boxShadow: `0 0 ${i % 3 === 0 ? 10 : 5}px ${i % 2 === 0
                                                ? 'rgba(45,212,191,0.4)'
                                                : 'rgba(59,130,246,0.3)'
                                            }`,
                                    }}
                                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                    animate={
                                        phase === 'enter'
                                            ? { opacity: 0, scale: 0, x: 0, y: 0 }
                                            : {
                                                x: [0, Math.cos(angle) * radius],
                                                y: [0, Math.sin(angle) * radius],
                                                opacity: [0, 0.8, 0.4],
                                                scale: [0, 1.3, 1],
                                            }
                                    }
                                    transition={
                                        phase === 'enter'
                                            ? {}
                                            : {
                                                duration: 1,
                                                delay: i * 0.05,
                                                ease: [0.16, 1, 0.3, 1],
                                            }
                                    }
                                />
                            );
                        })}

                    {/* === ORBITING RING === */}
                    {(phase === 'glow' || phase === 'hold') && (
                        <motion.div
                            className="absolute rounded-full border pointer-events-none"
                            style={{
                                width: 450,
                                height: 450,
                                borderColor: 'rgba(45,212,191,0.12)',
                                borderWidth: 1,
                            }}
                            initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
                            animate={{ scale: 1, opacity: [0, 0.5, 0.2], rotate: 360 }}
                            transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
