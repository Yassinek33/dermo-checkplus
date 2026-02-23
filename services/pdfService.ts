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

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W = 210; // A4 width mm
    const LM = 20;  // left margin
    const RM = 20;  // right margin
    const TW = W - LM - RM; // text width

    let y = 0;

    // ── Header background ──────────────────────────────────────────────────────
    pdf.setFillColor(6, 13, 15);
    pdf.rect(0, 0, W, 50, 'F');

    // ── Logo area ──────────────────────────────────────────────────────────────
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(0, 212, 180);
    pdf.text('DermatoCheck', LM, 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 180, 180);
    pdf.text(lang === 'fr' ? 'Analyse cutanée par intelligence artificielle'
        : lang === 'nl' ? 'Huidanalyse door kunstmatige intelligentie'
            : lang === 'es' ? 'Análisis cutáneo por inteligencia artificial'
                : 'AI-powered skin analysis', LM, 26);

    // ── Report ID + Date (right side) ──────────────────────────────────────────
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(180, 220, 220);
    pdf.text(`N° ${idShort}`, W - RM, 18, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 160, 160);
    pdf.text(date, W - RM, 24, { align: 'right' });

    // ── Severity badge ─────────────────────────────────────────────────────────
    const sevText = lang === 'fr' ? sev.label.fr : sev.label.en;
    const badgeX = W - RM - 5 - pdf.getStringUnitWidth(sevText) * 8 / pdf.internal.scaleFactor;
    pdf.setFillColor(...sev.color as [number, number, number]);
    pdf.setDrawColor(...sev.color as [number, number, number]);
    pdf.roundedRect(badgeX - 6, 30, pdf.getStringUnitWidth(sevText) * 8 / pdf.internal.scaleFactor + 12, 8, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(6, 13, 15);
    pdf.text(sevText, badgeX, 35.5);

    y = 50;

    // ── Divider ────────────────────────────────────────────────────────────────
    pdf.setDrawColor(0, 212, 180);
    pdf.setLineWidth(0.5);
    pdf.line(LM, y + 8, W - RM, y + 8);
    y += 18;

    // ── Patient section ────────────────────────────────────────────────────────
    pdf.setFillColor(13, 26, 30);
    pdf.roundedRect(LM, y, TW, 24, 3, 3, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 212, 180);
    pdf.text(lang === 'fr' ? 'PATIENT' : 'PATIENT', LM + 6, y + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(220, 240, 238);
    pdf.text(userName, LM + 6, y + 15);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 170, 170);
    pdf.text(userEmail, LM + 6, y + 21);

    y += 30;

    // ── Analysis section title ─────────────────────────────────────────────────
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(220, 240, 238);
    pdf.text(
        lang === 'fr' ? 'Résultat de l\'analyse' :
            lang === 'nl' ? 'Resultaat van de analyse' :
                lang === 'es' ? 'Resultado del análisis' :
                    'Analysis result',
        LM, y
    );
    y += 8;

    // Thin accent line under title
    pdf.setDrawColor(0, 212, 180);
    pdf.setLineWidth(0.3);
    pdf.line(LM, y, LM + 60, y);
    y += 8;

    // ── Full text ──────────────────────────────────────────────────────────────
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(200, 228, 225);
    const lineH = 5;

    // Split full text into paragraphs
    const paragraphs = full.split('\n').filter(l => l.trim() !== '');
    for (const para of paragraphs) {
        // Check for page overflow
        if (y > 265) {
            pdf.addPage();
            pdf.setFillColor(6, 13, 15);
            pdf.rect(0, 0, W, 297, 'F');
            y = 20;
        }

        // Section headings (lines ending with ':' or all-caps)
        if (para.endsWith(':') || /^\d+\./.test(para)) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.setTextColor(0, 212, 180);
        } else if (para.startsWith('•')) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(200, 228, 225);
        } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(200, 228, 225);
        }

        y = wrapText(pdf, para, LM, y, TW, lineH);
        y += 2; // paragraph gap
    }

    y += 10;

    // ── Disclaimer ─────────────────────────────────────────────────────────────
    if (y > 255) {
        pdf.addPage();
        pdf.setFillColor(6, 13, 15);
        pdf.rect(0, 0, W, 297, 'F');
        y = 20;
    }

    pdf.setFillColor(30, 40, 45);
    pdf.roundedRect(LM, y, TW, 20, 3, 3, 'F');
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(130, 170, 170);
    const disclaimer = lang === 'fr'
        ? 'Ce rapport est fourni à titre informatif uniquement. Il ne constitue pas un diagnostic médical et ne remplace pas une consultation avec un dermatologue qualifié.'
        : lang === 'nl'
            ? 'Dit rapport is alleen ter informatie. Het vormt geen medische diagnose en vervangt geen raadpleging met een gekwalificeerde dermatoloog.'
            : lang === 'es'
                ? 'Este informe se proporciona únicamente con fines informativos. No constituye un diagnóstico médico ni reemplaza una consulta con un dermatólogo calificado.'
                : 'This report is provided for informational purposes only. It does not constitute a medical diagnosis and does not replace a consultation with a qualified dermatologist.';
    y += 5;
    wrapText(pdf, disclaimer, LM + 4, y, TW - 8, 4.2);

    y += 22;

    // ── Footer ─────────────────────────────────────────────────────────────────
    const pages = pdf.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
        pdf.setPage(p);
        pdf.setFillColor(6, 13, 15);
        pdf.rect(0, 284, W, 13, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(80, 120, 120);
        pdf.text(`www.dermatocheck.com  ·  DermatoCheck © ${new Date().getFullYear()}`, LM, 291);
        pdf.text(`Page ${p} / ${pages}`, W - RM, 291, { align: 'right' });
    }

    // ── Save ───────────────────────────────────────────────────────────────────
    pdf.save(`DermatoCheck_analyse_${idShort}_${new Date().toISOString().slice(0, 10)}.pdf`);
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
