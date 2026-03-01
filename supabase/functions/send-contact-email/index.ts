// Supabase Edge Function — send-contact-email
// Triggered when a user submits the contact form.
//
// SETUP:
//   1. supabase secrets set RESEND_API_KEY=re_xxxxxxxx
//   2. supabase secrets set FROM_EMAIL=noreply@dermatocheck.com
//   3. supabase secrets set ADMIN_EMAIL=contact@dermatocheck.com
//   4. supabase functions deploy send-contact-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@dermatocheck.com';
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'contact@dermatocheck.com';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildAdminEmailHtml(name: string, email: string, subject: string, message: string): string {
    const escaped = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nouveau message — DermatoCheck</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0e1c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
</style>
</head>
<body>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0e1c;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">

  <!-- HEADER -->
  <tr><td>
    <table role="presentation" width="100%" style="border-radius:20px 20px 0 0;background:linear-gradient(135deg,#0f172a,#0a1628);border:1px solid rgba(255,255,255,0.08);border-bottom:none;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#2dd4bf,#06b6d4,#818cf8);padding:0;"></td></tr>
      <tr><td align="center" style="padding:28px 40px 24px;">
        <span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dermato<span style="color:#2dd4bf;">Check</span></span><br>
        <span style="font-size:11px;color:rgba(148,163,184,0.5);letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">Nouveau message de contact</span>
      </td></tr>
    </table>
  </td></tr>

  <!-- BODY -->
  <tr><td>
    <table role="presentation" width="100%" style="background:#0f172a;border:1px solid rgba(255,255,255,0.07);border-top:none;border-bottom:none;">
      <tr><td style="padding:36px 40px;">
        <div style="font-size:14px;color:rgba(148,163,184,0.6);margin-bottom:24px;">Vous avez reçu un nouveau message via le formulaire de contact.</div>

        <table role="presentation" width="100%" style="border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(45,212,191,0.6);font-weight:700;">Nom</span><br>
              <span style="font-size:15px;color:#fff;font-weight:600;margin-top:4px;display:block;">${escaped(name)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(45,212,191,0.6);font-weight:700;">Email</span><br>
              <a href="mailto:${escaped(email)}" style="font-size:15px;color:#2dd4bf;font-weight:600;margin-top:4px;display:block;">${escaped(email)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
              <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(45,212,191,0.6);font-weight:700;">Sujet</span><br>
              <span style="font-size:15px;color:#fff;font-weight:600;margin-top:4px;display:block;">${escaped(subject)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;">
              <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(45,212,191,0.6);font-weight:700;">Message</span><br>
              <p style="font-size:14px;color:rgba(148,163,184,0.85);line-height:1.7;margin-top:8px;white-space:pre-wrap;">${escaped(message)}</p>
            </td>
          </tr>
        </table>

        <div style="margin-top:28px;">
          <a href="mailto:${escaped(email)}?subject=Re: ${escaped(subject)}"
            style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#2dd4bf,#06b6d4);color:#030305;font-weight:800;font-size:14px;border-radius:999px;letter-spacing:0.02em;">
            Répondre →
          </a>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td>
    <table role="presentation" width="100%" style="border-radius:0 0 20px 20px;background:#0f172a;border:1px solid rgba(255,255,255,0.07);border-top:none;">
      <tr><td style="padding:20px 40px 24px;">
        <table role="presentation" width="100%" style="margin-bottom:12px;">
          <tr><td style="height:1px;background:rgba(255,255,255,0.05);"></td></tr>
        </table>
        <p style="font-size:11px;color:rgba(148,163,184,0.25);text-align:center;line-height:1.7;margin:0;">
          <a href="https://www.dermatocheck.com/" style="color:rgba(45,212,191,0.35);">dermatocheck.com</a>
          · Message reçu le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
          <span style="color:rgba(148,163,184,0.15);">© 2026 DermatoCheck</span>
        </p>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildConfirmationHtml(lang: string, name: string, subject: string): string {
    const texts: Record<string, { title: string; body: string; note: string; tagline: string }> = {
        fr: {
            tagline: 'Analyse Dermatologique par IA',
            title: 'Message reçu !',
            body: `Merci ${name}, nous avons bien reçu votre message concernant « ${subject} ». Notre équipe reviendra vers vous dans les plus brefs délais.`,
            note: 'DermatoCheck ne remplace pas un avis médical professionnel.',
        },
        en: {
            tagline: 'AI Dermatological Analysis',
            title: 'Message received!',
            body: `Thank you ${name}, we have received your message about "${subject}". Our team will get back to you as soon as possible.`,
            note: 'DermatoCheck is not a substitute for professional medical advice.',
        },
        nl: {
            tagline: 'Dermatologische AI-analyse',
            title: 'Bericht ontvangen!',
            body: `Bedankt ${name}, we hebben uw bericht over "${subject}" ontvangen. Ons team neemt zo snel mogelijk contact met u op.`,
            note: 'DermatoCheck vervangt geen professioneel medisch advies.',
        },
        es: {
            tagline: 'Análisis Dermatológico por IA',
            title: '¡Mensaje recibido!',
            body: `Gracias ${name}, hemos recibido tu mensaje sobre "${subject}". Nuestro equipo te responderá lo antes posible.`,
            note: 'DermatoCheck no reemplaza el consejo médico profesional.',
        },
    };
    const t = texts[lang] ?? texts.fr;

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DermatoCheck — ${t.title}</title>
<style>* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0a0e1c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }</style>
</head>
<body>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0e1c;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">
  <tr><td>
    <table role="presentation" width="100%" style="border-radius:20px 20px 0 0;background:linear-gradient(135deg,#0f172a,#0a1628);border:1px solid rgba(255,255,255,0.08);border-bottom:none;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#2dd4bf,#06b6d4,#818cf8);padding:0;"></td></tr>
      <tr><td align="center" style="padding:28px 40px 24px;">
        <span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dermato<span style="color:#2dd4bf;">Check</span></span><br>
        <span style="font-size:11px;color:rgba(148,163,184,0.5);letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">${t.tagline}</span>
      </td></tr>
    </table>
  </td></tr>
  <tr><td>
    <table role="presentation" width="100%" style="background:#0f172a;border:1px solid rgba(255,255,255,0.07);border-top:none;border-bottom:none;">
      <tr><td align="center" style="padding:40px 40px 36px;">
        <div style="font-size:48px;margin-bottom:16px;">✅</div>
        <h1 style="font-size:22px;font-weight:800;color:#fff;margin-bottom:12px;">${t.title}</h1>
        <p style="font-size:14px;color:rgba(148,163,184,0.75);line-height:1.7;max-width:420px;margin:0 auto;">${t.body}</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td>
    <table role="presentation" width="100%" style="border-radius:0 0 20px 20px;background:#0f172a;border:1px solid rgba(255,255,255,0.07);border-top:none;">
      <tr><td style="padding:20px 40px 24px;">
        <table role="presentation" width="100%" style="margin-bottom:12px;"><tr><td style="height:1px;background:rgba(255,255,255,0.05);"></td></tr></table>
        <p style="font-size:11px;color:rgba(148,163,184,0.25);text-align:center;line-height:1.7;margin:0;">
          <a href="https://www.dermatocheck.com/" style="color:rgba(45,212,191,0.35);">dermatocheck.com</a> · ${t.note}<br>
          <span style="color:rgba(148,163,184,0.15);">© 2026 DermatoCheck</span>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }

    const { name, email, subject, message, language = 'fr' } = await req.json();

    if (!name || !email || !subject || !message) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }

    const lang = ['fr', 'nl', 'en', 'es'].includes(language) ? language : 'fr';

    // Send notification to admin
    const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: `DermatoCheck <${FROM_EMAIL}>`,
            to: [ADMIN_EMAIL],
            reply_to: email,
            subject: `[Contact] ${subject} — ${name}`,
            html: buildAdminEmailHtml(name, email, subject, message),
        }),
    });

    if (!adminRes.ok) {
        const err = await adminRes.text();
        return new Response(JSON.stringify({ error: err }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }

    // Send confirmation to user (fire-and-forget)
    fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: `DermatoCheck <${FROM_EMAIL}>`,
            to: [email],
            subject: lang === 'en' ? 'We received your message — DermatoCheck'
                : lang === 'nl' ? 'We hebben uw bericht ontvangen — DermatoCheck'
                : lang === 'es' ? 'Hemos recibido tu mensaje — DermatoCheck'
                : 'Nous avons reçu votre message — DermatoCheck',
            html: buildConfirmationHtml(lang, name, subject),
        }),
    }).catch(() => { /* non-blocking */ });

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
});
