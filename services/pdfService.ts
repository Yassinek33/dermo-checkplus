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
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/^- /gm, '• ')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
}

function getSeverity(text: string): { label: { fr: string; en: string; nl: string; es: string }; color: [number, number, number] } {
    const t = text.toLowerCase();
    if (t.includes('urgent') || t.includes('grave') || t.includes('malin'))
        return { label: { fr: 'URGENT', en: 'URGENT', nl: 'DRINGEND', es: 'URGENTE' }, color: [255, 80, 80] };
    if (t.includes('surveill') || t.includes('attention') || t.includes('follow'))
        return { label: { fr: 'À SURVEILLER', en: 'MONITOR', nl: 'CONTROLEER', es: 'VIGILAR' }, color: [255, 180, 0] };
    return { label: { fr: 'BÉNIN', en: 'BENIGN', nl: 'GOEDAARDIG', es: 'BENIGNO' }, color: [0, 212, 180] };
}

// ─── Color constants ────────────────────────────────────────────────────────────
const BG: [number, number, number]       = [6,   13,  15];   // #060D0F
const SURFACE: [number, number, number]  = [13,  26,  30];   // #0D1A1E
const SURFACE2: [number, number, number] = [18,  38,  45];   // #12262D
const TEAL: [number, number, number]     = [0,   212, 180];  // #00D4B4
const TEXT: [number, number, number]     = [232, 244, 243];  // #E8F4F3
const MUTED: [number, number, number]    = [138, 168, 165];  // #8AA8A5
const MUTED2: [number, number, number]   = [90,  128, 128];  // #5A8080
const BORDER: [number, number, number]   = [25,  55,  52];   // #193734

// ─── Page constants (A4 mm) ────────────────────────────────────────────────────
const PW = 210;
const PH = 297;
const ML = 22;   // margin left
const MR = 22;   // margin right
const CW = PW - ML - MR; // 166mm content width
const FOOTER_H = 28;
const LINE_H = 5.2;

// ─── Draw page background ──────────────────────────────────────────────────────
function drawPageBg(pdf: jsPDF) {
    pdf.setFillColor(...BG);
    pdf.rect(0, 0, PW, PH, 'F');
    // Subtle teal glow top-right
    for (let i = 6; i >= 1; i--) {
        pdf.setFillColor(
            Math.min(255, BG[0] + i * 2),
            Math.min(255, BG[1] + i * 5),
            Math.min(255, BG[2] + i * 6)
        );
        pdf.circle(PW + 10, -10, i * 22, 'F');
    }
    // Re-darken corners (keep glow only top-right)
    pdf.setFillColor(...BG);
    pdf.rect(0, 60, PW, PH - 60, 'F');
    pdf.rect(0, 0, PW - 80, 60, 'F');
}

// ─── Draw teal accent bar ──────────────────────────────────────────────────────
function drawAccentBar(pdf: jsPDF) {
    pdf.setFillColor(...TEAL);
    pdf.rect(0, 0, PW, 1.8, 'F');
    // Fade: draw slightly transparent strips
    pdf.setFillColor(0, 180, 150);
    pdf.rect(0, 1.8, PW, 0.6, 'F');
}

// ─── Rounded rect helper ──────────────────────────────────────────────────────
function rRect(pdf: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: [number,number,number], stroke?: [number,number,number], lw = 0.3) {
    pdf.setFillColor(...fill);
    if (stroke) {
        pdf.setDrawColor(...stroke);
        pdf.setLineWidth(lw);
        pdf.roundedRect(x, y, w, h, r, r, 'FD');
    } else {
        pdf.roundedRect(x, y, w, h, r, r, 'F');
    }
}

// ─── New page helper ───────────────────────────────────────────────────────────
function newPage(pdf: jsPDF): number {
    pdf.addPage();
    drawPageBg(pdf);
    drawAccentBar(pdf);
    // Small "continued" header
    pdf.setFillColor(...SURFACE);
    pdf.rect(0, 2.5, PW, 14, 'F');
    pdf.setTextColor(...TEAL);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DermatoCheck', ML, 11);
    pdf.setTextColor(...MUTED2);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text('— suite —', ML + 38, 11);
    return 24;
}

// ─── Generate PDF (pure jsPDF, no html2canvas) ─────────────────────────────────
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

    // ── Page 1 background ────────────────────────────────────────────────────────
    drawPageBg(pdf);
    drawAccentBar(pdf);

    // ── Header band ──────────────────────────────────────────────────────────────
    pdf.setFillColor(...SURFACE);
    pdf.rect(0, 1.8, PW, 38, 'F');

    // Logo: "Dermato" white + "Check" teal
    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...TEXT);
    pdf.text('Dermato', ML, 22);
    const dermatoW = pdf.getTextWidth('Dermato');
    pdf.setTextColor(...TEAL);
    pdf.text('Check', ML + dermatoW, 22);

    // Subtitle
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...MUTED);
    const subtitle = lang === 'fr' ? 'RAPPORT CLINIQUE DIGITAL — ANALYSE PAR IA' :
        lang === 'nl' ? 'DIGITAAL KLINISCH RAPPORT — AI-ANALYSE' :
        lang === 'es' ? 'INFORME CLÍNICO DIGITAL — ANÁLISIS POR IA' :
        'DIGITAL CLINICAL REPORT — AI-POWERED ANALYSIS';
    pdf.text(subtitle, ML, 29);

    // REF + date (right-aligned)
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...TEXT);
    pdf.text(`REF #${idShort}`, PW - MR, 19, { align: 'right' });

    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...MUTED);
    pdf.text(date, PW - MR, 26, { align: 'right' });

    // Bottom header separator line
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.4);
    pdf.line(ML, 40.5, PW - MR, 40.5);

    let y = 50;

    // ── Severity badge ────────────────────────────────────────────────────────────
    const [sr, sg, sb] = sev.color;
    const sevLabel = sev.label[lang] || sev.label.fr;
    const badgeW = pdf.getTextWidth(sevLabel) / pdf.internal.scaleFactor * 2.83 + 16;

    // Badge background (semi-transparent simulation)
    pdf.setFillColor(
        Math.round(BG[0] + sr * 0.18),
        Math.round(BG[1] + sg * 0.18),
        Math.round(BG[2] + sb * 0.18)
    );
    pdf.setDrawColor(sr, sg, sb);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(ML, y, badgeW, 9, 2, 2, 'FD');

    // Badge text
    pdf.setTextColor(sr, sg, sb);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(sevLabel, ML + badgeW / 2, y + 6, { align: 'center' });

    // Severity dot
    pdf.setFillColor(sr, sg, sb);
    pdf.circle(ML + badgeW + 5, y + 4.5, 1.5, 'F');
    pdf.setTextColor(...MUTED);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    const statusLabel = lang === 'fr' ? 'Niveau de priorité détecté' :
        lang === 'nl' ? 'Gedetecteerd prioriteitsniveau' :
        lang === 'es' ? 'Nivel de prioridad detectado' :
        'Detected priority level';
    pdf.text(statusLabel, ML + badgeW + 10, y + 6);

    y += 18;

    // ── Patient info card ─────────────────────────────────────────────────────────
    const cardH = 26;
    rRect(pdf, ML, y, CW, cardH, 3, SURFACE, BORDER);

    // Left: accent bar
    pdf.setFillColor(...TEAL);
    pdf.roundedRect(ML, y, 3, cardH, 1.5, 1.5, 'F');

    // Patient name
    pdf.setTextColor(...TEAL);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(lang === 'fr' ? 'PATIENT' : 'PATIENT', ML + 9, y + 8);

    pdf.setTextColor(...TEXT);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(userName || '—', ML + 9, y + 18);

    // Divider
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.3);
    pdf.line(ML + CW / 2, y + 4, ML + CW / 2, y + cardH - 4);

    // Email
    pdf.setTextColor(...TEAL);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EMAIL', ML + CW / 2 + 8, y + 8);

    pdf.setTextColor(160, 192, 189);
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'normal');
    const emailDisplay = (userEmail || '—').length > 32
        ? (userEmail || '').substring(0, 30) + '...'
        : (userEmail || '—');
    pdf.text(emailDisplay, ML + CW / 2 + 8, y + 18);

    y += cardH + 12;

    // ── Analysis title ────────────────────────────────────────────────────────────
    const analysisTitle = lang === 'fr' ? "Résultat de l'Analyse Dermatologique" :
        lang === 'nl' ? 'Resultaat van de Dermatologische Analyse' :
        lang === 'es' ? 'Resultado del Análisis Dermatológico' :
        'Dermatological Analysis Result';

    pdf.setTextColor(...TEXT);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(analysisTitle, ML, y);

    // Teal underline
    pdf.setFillColor(...TEAL);
    pdf.rect(ML, y + 2.5, 40, 0.7, 'F');
    pdf.setFillColor(...BORDER);
    pdf.rect(ML + 40, y + 2.5, CW - 40, 0.7, 'F');

    y += 11;

    // ── Analysis body ─────────────────────────────────────────────────────────────
    const paragraphs = full.split('\n');

    for (const para of paragraphs) {
        if (!para.trim()) {
            y += 2.5;
            continue;
        }

        const isSection = /^\d+\./.test(para.trim()) || /^[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ\s]{5,}:/.test(para.trim());
        const isBullet = para.trim().startsWith('•');

        if (isSection) {
            y += 3;
            // Section header background
            rRect(pdf, ML, y - 3.5, CW, 8, 1.5, SURFACE2);
            pdf.setFillColor(...TEAL);
            pdf.rect(ML, y - 3.5, 2.5, 8, 'F');
            pdf.setTextColor(...TEAL);
            pdf.setFontSize(9.5);
            pdf.setFont('helvetica', 'bold');
        } else if (isBullet) {
            pdf.setTextColor(200, 224, 222);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
        } else {
            pdf.setTextColor(200, 224, 222);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
        }

        const indent = isBullet ? ML + 5 : isSection ? ML + 6 : ML;
        const maxW = isBullet ? CW - 5 : isSection ? CW - 6 : CW;
        const lines = pdf.splitTextToSize(para.trim(), maxW);

        for (const line of lines) {
            if (y > PH - FOOTER_H - 15) {
                y = newPage(pdf);
            }
            if (isBullet) {
                // Bullet dot
                pdf.setFillColor(...TEAL);
                pdf.circle(ML + 1.8, y - 1.2, 1, 'F');
            }
            pdf.text(line, indent, y);
            y += LINE_H;
        }

        if (isSection) y += 4;
    }

    // ── Footer ────────────────────────────────────────────────────────────────────
    const footerY = PH - FOOTER_H - 5;

    // Footer background band
    pdf.setFillColor(10, 20, 23);
    pdf.rect(0, footerY - 2, PW, FOOTER_H + 4, 'F');
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.3);
    pdf.line(ML, footerY - 2, PW - MR, footerY - 2);

    // Disclaimer
    const disclaimer = lang === 'fr'
        ? "Ce rapport est généré par intelligence artificielle à titre informatif uniquement. Il ne constitue en aucun cas un diagnostic médical ni une prescription thérapeutique. Seul un dermatologue qualifié peut établir un diagnostic différentiel. Consultez un professionnel de santé avant toute décision médicale."
        : lang === 'nl'
            ? "Dit rapport wordt gegenereerd door kunstmatige intelligentie en is uitsluitend informatief. Het vervangt in geen geval een medische diagnose of een therapeutisch recept. Alleen een gekwalificeerde dermatoloog kan een differentiële diagnose stellen. Raadpleeg een zorgprofessional voordat u medische beslissingen neemt."
            : lang === 'es'
                ? "Este informe es generado por inteligencia artificial con fines estrictamente informativos. No constituye diagnóstico médico ni prescripción terapéutica. Solo un dermatólogo cualificado puede establecer un diagnóstico diferencial. Consulte a un profesional sanitario antes de tomar cualquier decisión médica."
                : "This report is generated by artificial intelligence for informational purposes only. It does not constitute a medical diagnosis or therapeutic prescription. Only a qualified dermatologist can establish a differential diagnosis. Consult a healthcare professional before any medical decision.";

    pdf.setTextColor(...MUTED2);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    const disclaimerLines = pdf.splitTextToSize(disclaimer, CW);
    pdf.text(disclaimerLines, ML, footerY + 4);

    // Document ID
    const discH = disclaimerLines.length * 3.5;
    pdf.setTextColor(50, 90, 85);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
        `DERMATOCHECK SYSTEM  //  V9.0 CLINICAL PROTOCOL  //  DOC ID: ${item.id}`,
        PW / 2,
        footerY + discH + 8,
        { align: 'center' }
    );

    // Bottom teal line
    pdf.setFillColor(...TEAL);
    pdf.rect(0, PH - 1.5, PW, 1.5, 'F');

    // ── Save ──────────────────────────────────────────────────────────────────────
    pdf.save(`DermatoCheck_Rapport_${idShort}.pdf`);
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
