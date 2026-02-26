import jsPDF from 'jspdf';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface AnalysisData {
    id: string;
    created_at: string;
    prediction?: { full_text?: string };
    notes?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function cleanText(raw: string): string {
    return (raw || '')
        .replace(/\[FINAL_REPORT\]/g, '')
        .replace(/1\.\s*\*\*⚠️\s*IMPORTANT WARNING:\*\*.*?(?=\n\n|\n2)/s, '')
        .replace(/1\.\s*\*\*⚠️\s*AVERTISSEMENT MÉDICAL\s*\(.*?\):\*\*.*?(?=\n\n|\n2)/s, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')    // strip markdown bold
        .replace(/\*(.*?)\*/g, '$1')        // strip markdown italic
        .replace(/^- /gm, '• ')             // convert list dashes to bullets
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
}

function getSeverity(text: string): { label: { fr: string; en: string }; color: [number, number, number] } {
    const t = text.toLowerCase();
    if (t.includes('urgent') || t.includes('grave') || t.includes('malin')) {
        return { label: { fr: 'Urgent', en: 'Urgent' }, color: [255, 80, 80] };
    }
    if (t.includes('surveill') || t.includes('attention') || t.includes('follow')) {
        return { label: { fr: 'À surveiller', en: 'Monitor' }, color: [255, 180, 0] };
    }
    return { label: { fr: 'Bénin', en: 'Benign' }, color: [0, 200, 170] };
}

// ─── Wrap text helper ──────────────────────────────────────────────────────────
function wrapText(pdf: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lines.length * lineHeight;
}

// ─── Generate PDF ──────────────────────────────────────────────────────────────
export async function generateAnalysisPDF(
    item: AnalysisData,
    userEmail: string,
    userName: string,
    lang: 'fr' | 'en' | 'nl' | 'es' = 'fr'
): Promise<void> {
    const raw = item.prediction?.full_text || item.notes || '';
    const full = cleanText(raw);
    const sev = getSeverity(full);
    const date = new Date(item.created_at).toLocaleString(
        lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : lang === 'es' ? 'es-ES' : 'en-GB',
        { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
    const idShort = String(item.id).slice(-6).toUpperCase();

    // Dynamically load html2canvas to avoid SSR issues if this were a node env, 
    // but here it's purely client side. We rely on the module installed earlier.
    const html2canvas = (await import('html2canvas')).default;

    // A4 aspect ratio at 96 DPI: 794px width, 1123px height
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0px';
    container.style.width = '794px';       // Fixed width to simulate A4
    container.style.minHeight = '1123px';  // Min A4 height
    container.style.backgroundColor = '#060D0F'; // Dark theme bg
    container.style.color = '#E8F4F3';
    container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    container.style.padding = '0';
    container.style.boxSizing = 'border-box';

    // Add custom styled content
    container.innerHTML = `
        <div style="padding: 60px 50px; background: radial-gradient(circle at top right, rgba(0, 212, 180, 0.1), transparent 50%), #060D0F; min-height: 1123px; display: flex; flex-direction: column;">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(0, 212, 180, 0.4); padding-bottom: 25px; margin-bottom: 35px;">
                <div>
                    <h1 style="margin: 0; font-size: 38px; font-weight: 800; color: #00D4B4; letter-spacing: -1px; text-transform: uppercase;">DermatoCheck</h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #8BA8A5; letter-spacing: 0.5px; text-transform: uppercase;">
                        ${lang === 'fr' ? 'Rapport Clinique Digital' :
            lang === 'nl' ? 'Digitaal Klinisch Rapport' :
                lang === 'es' ? 'Informe Clínico Digital' :
                    'Digital Clinical Report'
        }
                    </p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #E8F4F3;">REF: #${idShort}</p>
                    <p style="margin: 0; font-size: 14px; color: #8BA8A5;">${date}</p>
                </div>
            </div>

            <!-- Warning Badge -->
            <div style="display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; background-color: rgba(${sev.color.join(',')}, 0.15); color: rgb(${sev.color.join(',')}); border: 1px solid rgba(${sev.color.join(',')}, 0.4); margin-bottom: 30px; align-self: flex-start;">
                ${lang === 'fr' ? sev.label.fr : sev.label.en}
            </div>

            <!-- Patient Info -->
            <div style="flex-shrink: 0; display: flex; gap: 40px; background: rgba(0, 212, 180, 0.03); border: 1px solid rgba(0, 212, 180, 0.1); border-radius: 12px; padding: 25px 30px; margin-bottom: 40px;">
                <div style="flex: 1;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #00D4B4; letter-spacing: 1px; text-transform: uppercase;">
                        ${lang === 'fr' ? 'PATIENT' : 'PATIENT'}
                    </p>
                    <p style="margin: 0; font-size: 20px; font-weight: 600; color: #fff;">${userName}</p>
                </div>
                <div style="flex: 1;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #00D4B4; letter-spacing: 1px; text-transform: uppercase;">
                        EMAIL
                    </p>
                    <p style="margin: 0; font-size: 18px; font-weight: 400; color: #A0C0BD;">${userEmail}</p>
                </div>
            </div>

            <!-- Analysis Header -->
            <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                ${lang === 'fr' ? "Résultat de l'analyse" :
            lang === 'nl' ? 'Resultaat van de analyse' :
                lang === 'es' ? 'Resultado del análisis' :
                    'Analysis result'
        }
            </h2>

            <!-- Analysis Body (Auto wrap) -->
            <div style="flex-grow: 1; font-size: 15px; line-height: 1.7; color: #C8E0DE; white-space: pre-wrap;">${full
            .replace(/^(\d+\.|[A-Z].*:)(\s.*)?$/gm, '<strong style="color: #00D4B4; font-size: 16px; display: block; margin-top: 15px; margin-bottom: 5px;">$1$2</strong>')
            .replace(/^•(.*)$/gm, '<div style="display:flex; margin-bottom: 4px;"><span style="color: #00D4B4; margin-right: 8px;">•</span><span>$1</span></div>')
        }</div>

            <!-- Footer / Disclaimer -->
            <div style="flex-shrink: 0; margin-top: 40px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #6A8A85; line-height: 1.5; font-style: italic; text-align: justify;">
                ${lang === 'fr'
            ? 'Ce rapport de synthèse est généré par un système automatisé d\'intelligence artificielle à des fins d\'information et de sensibilisation uniquement. Il ne constitue en aucun cas un diagnostic ou un acte médical validé. Seule une consultation physique avec un dermatologue qualifié permet un diagnostic différentiel et la prescription d\'un traitement adapté. Toute décision prise suite à ce rapport relève de la responsabilité du patient.'
            : lang === 'nl'
                ? 'Dit rapport wordt gegenereerd door een geautomatiseerd kunstmatig intelligentiesysteem en is uitsluitend bedoeld voor informatief en educatief gebruik. Het vervangt in geen geval een medische diagnose of een raadpleging bij een gekwalificeerde dermatoloog. Alleen een arts kan de juiste klinische procedures uitvoeren. Beslissingen genomen op basis van dit rapport zijn de verantwoordelijkheid van de patiënt.'
                : lang === 'es'
                    ? 'Este informe se genera mediante un sistema automatizado de inteligencia artificial con fines estrictamente informativos y educativos. En ningún caso constituye un diagnóstico médico válido ni sustituye una evaluación física por parte de un dermatólogo cualificado. Cualquier decisión médica tomada tras leer este documento es responsabilidad exclusiva del paciente.'
                    : 'This syntax report is generated by an automated artificial intelligence system for informative and educational purposes only. It does not constitute a certified medical diagnosis nor does it replace a physical consultation with a board-certified dermatologist. Any medical decision downstream of this document is solely the responsibility of the patient.'
        }
                <div style="margin-top: 15px; text-align: center; color: #4A6A65; font-family: monospace;">
                    DERMATOCHECK SYSTEM // V9.0 CLINICAL PROTOCOL // DOCUMENT ID: ${item.id}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    try {
        // Wait for fonts to load if any, though system fonts are instantaneous
        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(container, {
            scale: 2, // High resolution
            useCORS: true,
            backgroundColor: '#060D0F',
            logging: false
        });

        // Calculate aspect ratios for A4 pages
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pdfWidth / imgWidth;
        const scaledHeight = imgHeight * ratio;

        let heightLeft = scaledHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight, '', 'FAST');
        heightLeft -= pdfHeight;

        // Add subsequent pages if the content overflows A4
        while (heightLeft > 0) {
            position = heightLeft - scaledHeight; // Negative top position shifts image up
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight, '', 'FAST');
            heightLeft -= pdfHeight;
        }

        // Trigger download
        pdf.save(`DermatoCheck_Clinical_Report_${idShort}.pdf`);

    } catch (e) {
        console.error("Error generating PDF:", e);
        throw e;
    } finally {
        // Always clean up the DOM attached element
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
}

// ─── Email share via mailto: ───────────────────────────────────────────────────
export function shareByEmail(
    item: AnalysisData,
    userEmail: string,
    userName: string,
    lang: 'fr' | 'en' | 'nl' | 'es' = 'fr'
): void {
    const raw = item.prediction?.full_text || item.notes || '';
    const full = cleanText(raw);
    const idShort = String(item.id).slice(-6).toUpperCase();
    const date = new Date(item.created_at).toLocaleString(
        lang === 'fr' ? 'fr-FR' : 'en-GB',
        { day: '2-digit', month: 'long', year: 'numeric' }
    );

    const subject = lang === 'fr'
        ? `Mon analyse cutanée DermatoCheck — ${date} (Réf: ${idShort})`
        : lang === 'nl'
            ? `Mijn huidanalyse DermatoCheck — ${date} (Ref: ${idShort})`
            : lang === 'es'
                ? `Mi análisis cutáneo DermatoCheck — ${date} (Ref: ${idShort})`
                : `My DermatoCheck skin analysis — ${date} (Ref: ${idShort})`;

    const intro = lang === 'fr'
        ? `Bonjour,\n\nVoici les résultats de mon analyse cutanée réalisée le ${date} via DermatoCheck (réf: ${idShort}).\n\n`
        : lang === 'nl'
            ? `Hallo,\n\nHieronder vindt u de resultaten van mijn huidanalyse uitgevoerd op ${date} via DermatoCheck (ref: ${idShort}).\n\n`
            : lang === 'es'
                ? `Hola,\n\nA continuación encontrarás los resultados de mi análisis cutáneo realizado el ${date} a través de DermatoCheck (ref: ${idShort}).\n\n`
                : `Hello,\n\nHere are the results of my skin analysis performed on ${date} via DermatoCheck (ref: ${idShort}).\n\n`;

    const outro = lang === 'fr'
        ? `\n\n---\nCe rapport est fourni à titre informatif. Il ne remplace pas un diagnostic médical.\nDermatoCheck — www.dermatocheck.com`
        : `\n\n---\nThis report is for informational purposes only. It does not replace a medical diagnosis.\nDermatoCheck — www.dermatocheck.com`;

    const body = intro + full.substring(0, 1500) + (full.length > 1500 ? '...' : '') + outro;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
