// Supabase Edge Function — send-welcome-email
// Triggered after OTP verification to send a satisfaction/feedback email.
//
// SETUP:
//   1. supabase secrets set RESEND_API_KEY=re_xxxxxxxx
//   2. supabase secrets set FROM_EMAIL=noreply@dermatocheck.com
//   3. supabase functions deploy send-welcome-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@dermatocheck.com';

// All translations per language
const i18n: Record<string, {
    subject: string;
    tagline: string;
    hello: string;
    greeting: string;
    body: string;
    ratingLabel: string;
    clickStar: string;
    cta: string;
    alsoComment: string;
    disclaimer: string;
}> = {
    fr: {
        subject: '🌟 Bienvenue chez DermatoCheck — Partagez votre expérience',
        tagline: 'Analyse Dermatologique par IA',
        hello: 'Bonjour',
        greeting: 'Bienvenue chez DermatoCheck !',
        body: 'Merci de nous rejoindre. Votre confiance nous touche profondément. Avez-vous 30 secondes pour partager votre première impression ? Votre avis aide d\'autres utilisateurs à nous découvrir et améliore notre service.',
        ratingLabel: '⭐ Votre note',
        clickStar: 'Cliquez sur une étoile pour noter',
        cta: 'Laisser mon avis →',
        alsoComment: 'Vous pouvez aussi laisser un commentaire détaillé sur le site',
        disclaimer: 'DermatoCheck ne remplace pas un avis médical professionnel',
    },
    nl: {
        subject: '🌟 Welkom bij DermatoCheck — Deel uw ervaring',
        tagline: 'Dermatologische AI-analyse',
        hello: 'Hallo',
        greeting: 'Welkom bij DermatoCheck!',
        body: 'Bedankt dat u lid bent geworden. Uw vertrouwen betekent veel voor ons. Heeft u 30 seconden om uw eerste indruk te delen? Uw beoordeling helpt anderen ons te ontdekken en verbetert onze dienst.',
        ratingLabel: '⭐ Uw beoordeling',
        clickStar: 'Klik op een ster om te beoordelen',
        cta: 'Mijn beoordeling achterlaten →',
        alsoComment: 'U kunt ook een gedetailleerde opmerking achterlaten op de website',
        disclaimer: 'DermatoCheck vervangt geen professioneel medisch advies',
    },
    en: {
        subject: '🌟 Welcome to DermatoCheck — Share your experience',
        tagline: 'AI Dermatological Analysis',
        hello: 'Hello',
        greeting: 'Welcome to DermatoCheck!',
        body: 'Thank you for joining us. Your trust means everything to us. Got 30 seconds to share your first impression? Your review helps others discover us and helps us improve our service.',
        ratingLabel: '⭐ Your rating',
        clickStar: 'Click a star to rate',
        cta: 'Leave my review →',
        alsoComment: 'You can also leave a detailed comment on the website',
        disclaimer: 'DermatoCheck is not a substitute for professional medical advice',
    },
    es: {
        subject: '🌟 Bienvenido a DermatoCheck — Comparte tu experiencia',
        tagline: 'Análisis Dermatológico por IA',
        hello: 'Hola',
        greeting: '¡Bienvenido a DermatoCheck!',
        body: 'Gracias por unirte a nosotros. Tu confianza es muy valiosa para nosotros. ¿Tienes 30 segundos para compartir tu primera impresión? Tu opinión ayuda a otros a descubrirnos y nos ayuda a mejorar nuestro servicio.',
        ratingLabel: '⭐ Tu valoración',
        clickStar: 'Haz clic en una estrella para valorar',
        cta: 'Dejar mi opinión →',
        alsoComment: 'También puedes dejar un comentario detallado en el sitio web',
        disclaimer: 'DermatoCheck no reemplaza el consejo médico profesional',
    },
};

function buildEmailHtml(lang: string, userName: string): string {
    const l = lang in i18n ? lang : 'fr';
    const txt = i18n[l];
    const baseUrl = 'https://www.dermatocheck.com/?review=';

    return `<!DOCTYPE html>
<html lang="${l}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DermatoCheck — ${txt.greeting}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; padding: 0; background: #0a0e1c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
  a { text-decoration: none; }
  @media (max-width: 600px) { .wrap { width: 100% !important; } .pad { padding: 24px 16px !important; } .star-size { font-size: 30px !important; } }
</style>
</head>
<body>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0a0e1c;padding:40px 16px;">
<tr><td align="center">
<table class="wrap" role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">

  <!-- HEADER -->
  <tr><td>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="border-radius:20px 20px 0 0;background:linear-gradient(135deg,#0f172a,#0a1628);border:1px solid rgba(255,255,255,0.08);border-bottom:none;">
      <tr><td style="height:4px;background:linear-gradient(90deg,#2dd4bf,#06b6d4,#818cf8);padding:0;"></td></tr>
      <tr><td align="center" class="pad" style="padding:28px 40px 24px;">
        <span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Dermato<span style="color:#2dd4bf;">Check</span></span><br>
        <span style="font-size:11px;color:rgba(148,163,184,0.5);letter-spacing:0.1em;text-transform:uppercase;font-weight:500;">${txt.tagline}</span>
      </td></tr>
    </table>
  </td></tr>

  <!-- GREETING -->
  <tr><td>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:#0f172a;border:1px solid rgba(255,255,255,0.07);border-top:none;border-bottom:none;">
      <tr><td align="center" class="pad" style="padding:36px 40px 28px;">
        <div style="font-size:48px;margin-bottom:16px;">🙏</div>
        ${userName ? `<p style="font-size:14px;color:rgba(45,212,191,0.8);font-weight:600;margin-bottom:8px;">${txt.hello} ${userName} !</p>` : ''}
        <h1 style="font-size:22px;font-weight:800;color:#fff;margin-bottom:12px;line-height:1.3;">${txt.greeting}</h1>
        <p style="font-size:14px;color:rgba(148,163,184,0.75);line-height:1.7;max-width:420px;margin:0 auto;">${txt.body}</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- STAR RATING -->
  <tr><td>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:linear-gradient(135deg,rgba(45,212,191,0.04),rgba(129,140,248,0.04));border:1px solid rgba(255,255,255,0.07);border-top:none;border-bottom:none;">
      <tr><td align="center" class="pad" style="padding:32px 40px 36px;">
        <p style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(45,212,191,0.7);margin-bottom:20px;">${txt.ratingLabel}</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 8px;">
          <tr>
            <td><a href="${baseUrl}1" class="star-size" style="font-size:38px;padding:6px;display:inline-block;">⭐</a></td>
            <td><a href="${baseUrl}2" class="star-size" style="font-size:38px;padding:6px;display:inline-block;">⭐</a></td>
            <td><a href="${baseUrl}3" class="star-size" style="font-size:38px;padding:6px;display:inline-block;">⭐</a></td>
            <td><a href="${baseUrl}4" class="star-size" style="font-size:38px;padding:6px;display:inline-block;">⭐</a></td>
            <td><a href="${baseUrl}5" class="star-size" style="font-size:38px;padding:6px;display:inline-block;">⭐</a></td>
          </tr>
          <tr>
            <td align="center"><a href="${baseUrl}1" style="font-size:11px;color:rgba(148,163,184,0.4);">1</a></td>
            <td align="center"><a href="${baseUrl}2" style="font-size:11px;color:rgba(148,163,184,0.4);">2</a></td>
            <td align="center"><a href="${baseUrl}3" style="font-size:11px;color:rgba(148,163,184,0.4);">3</a></td>
            <td align="center"><a href="${baseUrl}4" style="font-size:11px;color:rgba(148,163,184,0.4);">4</a></td>
            <td align="center"><a href="${baseUrl}5" style="font-size:11px;color:rgba(148,163,184,0.4);">5</a></td>
          </tr>
        </table>
        <p style="font-size:12px;color:rgba(148,163,184,0.35);margin-bottom:24px;">${txt.clickStar}</p>
        <a href="${baseUrl}5"
          style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#2dd4bf,#06b6d4);color:#030305;font-weight:800;font-size:15px;border-radius:999px;letter-spacing:0.02em;box-shadow:0 8px 24px rgba(45,212,191,0.3);">
          ${txt.cta}
        </a>
        <p style="font-size:11px;color:rgba(148,163,184,0.3);margin-top:14px;">
          ${txt.alsoComment}
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="border-radius:0 0 20px 20px;background:#0f172a;border:1px solid rgba(255,255,255,0.07);border-top:none;">
      <tr><td class="pad" style="padding:24px 40px 28px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:14px;">
          <tr><td style="height:1px;background:rgba(255,255,255,0.05);"></td></tr>
        </table>
        <p style="font-size:11px;color:rgba(148,163,184,0.25);text-align:center;line-height:1.7;margin:0;">
          <a href="https://www.dermatocheck.com/" style="color:rgba(45,212,191,0.35);">dermatocheck.com</a>
          · ${txt.disclaimer}<br>
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
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { email, name = '', language = 'fr' } = await req.json();

    if (!email) {
        return new Response(JSON.stringify({ error: 'email is required' }), { status: 400 });
    }

    const lang = ['fr', 'nl', 'en', 'es'].includes(language) ? language : 'fr';
    const subject = i18n[lang].subject;
    const html = buildEmailHtml(lang, name);

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: `DermatoCheck <${FROM_EMAIL}>`,
            to: [email],
            subject,
            html,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: err }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
});
