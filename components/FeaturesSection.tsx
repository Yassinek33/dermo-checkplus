import React from "react";
import { motion } from 'framer-motion';

const features = [
  {
    title: "Répondez aux questions",
    description: "Décrivez vos symptômes et l’historique de la lésion.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 72 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="8" width="48" height="60" rx="6" />
        <path d="M22 24h28M22 36h28M22 48h16" />
      </svg>
    ),
  },
  {
    title: "Ajoutez une photo",
    description: "Prenez une photo nette de la zone concernée.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="20" width="52" height="40" rx="6" />
        <circle cx="36" cy="40" r="12" />
        <path d="M52 20v-6h-6" />
      </svg>
    ),
  },
  {
    title: "Obtenez un rapport",
    description: "Recevez une synthèse, des hypothèses et des conseils.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 72 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 6h32l12 12v48a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" />
        <path d="M46 6v12h12" />
        <path d="M24 34h24M24 46h24M24 58h16" />
      </svg>
    ),
  },
  {
    title: "Consultez un pro",
    description: "Notre rapport ne remplace pas l’avis d’un médecin.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 72 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="36" cy="24" r="14" />
        <path d="M8 64c4-12 14-20 28-20s24 8 28 20" />
      </svg>
    ),
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function FeaturesSection() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="w-full bg-transparent py-4"
    >
      <div className="mx-auto max-w-6xl px-2">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="glass-card p-6 flex flex-col items-center text-center rounded-3xl"
            >
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-light text-brand-primary shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-brand-secondary mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
