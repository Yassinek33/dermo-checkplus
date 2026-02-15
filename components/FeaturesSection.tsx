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

        {/* Futuristic Analysis Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative w-full h-64 md:h-80 rounded-3xl overflow-hidden glass-card shadow-2xl group"
        >
          <img
            src="/hero-clinical-scan.png"
            alt="Clinical Analysis Visualization"
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2840] via-transparent to-transparent opacity-90" />

          <div className="absolute bottom-0 left-0 p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-brand-primary/20 border border-brand-primary/50 rounded-full text-xs font-mono text-brand-primary uppercase tracking-wider backdrop-blur-md">
                Technology 4.0
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Analyse Clinique Digitale</h3>
            <p className="text-slate-300 max-w-lg">
              Notre algorithme scanne et compare vos symptômes avec une base de données médicale certifiée pour une orientation précise.
            </p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
