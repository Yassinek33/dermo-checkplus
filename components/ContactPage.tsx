import React, { useState } from 'react';
import { PageConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ContactPageProps {
    config: PageConfig;
}

const ContactPage: React.FC<ContactPageProps> = ({ config }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Record<string, string>>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        const isMissing = !formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim();
        if (isMissing) {
            setSubmitError(t('contact.error_missing'));
            return;
        }

        console.log("Form data submitted:", formData);
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const fields = [
        { name: "name", label: t('contact.form.name'), type: "text", placeholder: t('contact.form.name_placeholder') },
        { name: "email", label: t('contact.form.email'), type: "email", placeholder: t('contact.form.email_placeholder') },
        { name: "subject", label: t('contact.form.subject'), type: "text", placeholder: t('contact.form.subject_placeholder') },
        { name: "message", label: t('contact.form.message'), type: "textarea", placeholder: t('contact.form.message_placeholder') },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-8 md:p-12 text-left animate-fade-in shadow-2xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 text-center tracking-tight">{t('contact.title')}</h2>
            <p className="text-base md:text-lg text-brand-secondary/70 mb-10 text-center leading-relaxed font-light">{t('contact.description')}</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {fields.map(field => (
                    <div key={field.name} className="flex flex-col group">
                        <label htmlFor={field.name} className="mb-3 text-sm font-bold text-brand-secondary/80 group-focus-within:text-brand-primary transition-colors uppercase tracking-widest ml-1">
                            {field.label} <span className="text-red-500">*</span>
                        </label>
                        {field.type === 'textarea' ? (
                            <>
                                <textarea
                                    id={field.name}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    maxLength={500}
                                    className="px-5 py-4 bg-white/5 border border-white/10 text-white text-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/40 transition-all shadow-inner backdrop-blur-sm placeholder-white/20"
                                    placeholder={field.placeholder}
                                />
                                <div className="mt-2 text-right text-[10px] uppercase tracking-widest text-brand-secondary/40 font-mono">
                                    {formData[field.name].length} / 500
                                </div>
                            </>
                        ) : (
                            <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required
                                className="px-5 py-4 bg-white/5 border border-white/10 text-white text-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/40 transition-all shadow-inner backdrop-blur-sm placeholder-white/20"
                                placeholder={field.placeholder}
                            />
                        )}
                    </div>
                ))}

                {submitError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium animate-shake" role="alert">
                        {submitError}
                    </div>
                )}

                {isSubmitted && !submitError && (
                    <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-sm font-medium animate-fade-in" role="status">
                        {t('contact.success')}
                    </div>
                )}

                <button
                    type="submit"
                    className="group relative w-full px-8 py-4 bg-gradient-to-r from-brand-primary to-[#2dd4bf] text-brand-deep text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)] overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {t('contact.form.submit')}
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </form>
        </div>
    );
};

export default ContactPage;
