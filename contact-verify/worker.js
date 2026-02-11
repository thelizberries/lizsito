// Cloudflare Worker for email verification + contact forwarding via Resend.
// Endpoints:
//   POST /request  -> sends verification email to user
//   GET  /verify   -> verifies token and forwards message to team

const DEFAULT_TTL_SECONDS = 60 * 60 * 24;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_MAX = 5;

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

function htmlResponse(html, status, headers) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...headers,
    },
  });
}

function getAllowedOrigins(env) {
  if (!env.ALLOWED_ORIGINS) {
    return [];
  }
  return env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean);
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = getAllowedOrigins(env);

  if (!origin || allowedOrigins.length === 0) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }

  if (allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
  }

  return {
    'Access-Control-Allow-Origin': 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function safeText(value, maxLen) {
  if (!value) {
    return '';
  }
  const trimmed = String(value).trim();
  if (trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen);
  }
  return trimmed;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSourceLabel(source) {
  switch (source) {
    case 'thelizards':
      return 'The Lizards';
    case '5cerealiz':
      return '5 Cerealiz';
    case 'lizberries':
      return 'The Lizberries';
    default:
      return source || 'Website';
  }
}

function getRecipientEmail(source, env) {
  switch (source) {
    case 'thelizards':
      return env.CONTACT_TO_EMAIL_THELIZARDS || env.CONTACT_TO_EMAIL;
    case '5cerealiz':
      return env.CONTACT_TO_EMAIL_5CEREALIZ || env.CONTACT_TO_EMAIL;
    case 'lizberries':
      return env.CONTACT_TO_EMAIL_LIZBERRIES || env.CONTACT_TO_EMAIL;
    default:
      return env.CONTACT_TO_EMAIL;
  }
}

function getVerifyTheme(source, env) {
  const logoBase = env.LOGO_BASE_URL || 'https://www.thelizards.it/images/verify';

  switch (source) {
    case 'thelizards':
      return {
        name: 'The Lizards',
        accent: '#f8174b',
        background: '#0f1b26',
        logoUrl: `${logoBase}/thelizards-logo.webp`,
        siteUrl: 'https://www.thelizards.it/'
      };
    case '5cerealiz':
      return {
        name: '5 Cerealiz',
        accent: '#ff6b1a',
        background: '#141414',
        logoUrl: `${logoBase}/5cerealiz-logo.webp`,
        siteUrl: 'https://www.thelizards.it/5cerealiz/'
      };
    case 'lizberries':
      return {
        name: 'The Lizberries',
        accent: '#2fb3ff',
        background: '#0f1f2a',
        logoUrl: `${logoBase}/lizberries-logo.webp`,
        siteUrl: 'https://www.thelizards.it/lizberries/'
      };
    default:
      return {
        name: 'The Lizards',
        accent: '#f8174b',
        background: '#0f1b26',
        logoUrl: `${logoBase}/thelizards-logo.webp`,
        siteUrl: 'https://www.thelizards.it/'
      };
  }
}

function getLocaleStrings(source, theme) {
  if (source === '5cerealiz') {
    return {
      verifySubject: `Conferma la tua email - ${theme.name}`,
      verifyEmailText: (firstName, verifyUrl) => (
        `Ciao ${firstName},\n\n` +
        `Per inviare il tuo messaggio a ${theme.name} conferma la tua email.\n\n` +
        `Conferma qui:\n${verifyUrl}\n\n` +
        `Se non hai richiesto tu, puoi ignorare questa email.\n`
      ),
      verifyEmailHtml: (firstName, verifyUrl) => (
        `<!DOCTYPE html>\n<html>\n<body style=\"font-family: Arial, sans-serif; color: #222;\">` +
        `<p>Ciao ${firstName},</p>` +
        `<p>Per inviare il tuo messaggio a ${theme.name} conferma la tua email.</p>` +
        `<p><a href=\"${verifyUrl}\">Conferma email</a></p>` +
        `<p>Se non hai richiesto tu, puoi ignorare questa email.</p>` +
        `</body>\n</html>`
      ),
      contactSubjectPrefix: 'Nuovo messaggio di contatto dal sito',
      contactTitle: `${theme.name} - Messaggio di contatto`,
      verifyPageTitle: 'Email verificata',
      verifyPageMessage: 'Il tuo messaggio e stato inviato. Grazie.',
      verifyPageButton: `Torna a ${theme.name}`,
      verifyMissingToken: 'Token di verifica mancante',
      verifyMissingTokenMsg: 'Usa il link ricevuto via email.',
      verifyInvalidToken: 'Link non valido o scaduto',
      verifyInvalidTokenMsg: 'Invia di nuovo il form per ricevere un nuovo link.',
      verifyPayloadInvalid: 'Dati di verifica non validi',
      verifyPayloadInvalidMsg: 'Invia di nuovo il form.',
      verifyDeliveryFailed: 'Invio non riuscito',
      verifyDeliveryFailedMsg: 'Non siamo riusciti a consegnare il messaggio. Riprova piu tardi.',
      serviceNotConfigured: 'Servizio non configurato',
      serviceNotConfiguredMsg: 'Riprova piu tardi.',
      emailServiceNotConfigured: 'Servizio email non configurato',
      recipientNotConfigured: 'Destinatario non configurato'
    };
  }

  return {
    verifySubject: `Confirm your email - ${theme.name}`,
    verifyEmailText: (firstName, verifyUrl) => (
      `Hello ${firstName},\n\n` +
      `Please confirm your email to send your message to ${theme.name}.\n\n` +
      `Confirm here:\n${verifyUrl}\n\n` +
      `If you did not request this, you can ignore this email.\n`
    ),
    verifyEmailHtml: (firstName, verifyUrl) => (
      `<!DOCTYPE html>\n<html>\n<body style=\"font-family: Arial, sans-serif; color: #222;\">` +
      `<p>Hello ${firstName},</p>` +
      `<p>Please confirm your email to send your message to ${theme.name}.</p>` +
      `<p><a href=\"${verifyUrl}\">Confirm email</a></p>` +
      `<p>If you did not request this, you can ignore this email.</p>` +
      `</body>\n</html>`
    ),
    contactSubjectPrefix: 'New contact message from website',
    contactTitle: `${theme.name} - Contact message`,
    verifyPageTitle: 'Email verified',
    verifyPageMessage: 'Your message has been delivered. Thank you.',
    verifyPageButton: `Back to ${theme.name}`,
    verifyMissingToken: 'Missing verification token',
    verifyMissingTokenMsg: 'Please use the link from your email.',
    verifyInvalidToken: 'Link invalid or expired',
    verifyInvalidTokenMsg: 'Please submit the form again to receive a new link.',
    verifyPayloadInvalid: 'Invalid verification payload',
    verifyPayloadInvalidMsg: 'Please submit the form again.',
    verifyDeliveryFailed: 'Delivery failed',
    verifyDeliveryFailedMsg: 'We could not deliver your message. Please try again later.',
    serviceNotConfigured: 'Service not configured',
    serviceNotConfiguredMsg: 'Please try again later.',
    emailServiceNotConfigured: 'Email service not configured',
    recipientNotConfigured: 'Recipient not configured'
  };
}

function renderVerifyPage(options, env) {
  const theme = getVerifyTheme(options.source, env);
  const title = options.title || 'Email verified';
  const message = options.message || 'Your message has been delivered. Thank you.';
  const buttonLabel = options.buttonLabel || `Back to ${theme.name}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - ${theme.name}</title>
  <style>
    :root {
      --accent: ${theme.accent};
      --background: ${theme.background};
      --card: #ffffff;
      --text: #1b1b1b;
      --muted: #5a5a5a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 55%), var(--background);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 520px;
      background: var(--card);
      border-radius: 18px;
      padding: 32px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
      text-align: center;
    }
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 1.8rem;
      margin: 0 0 12px;
      color: var(--accent);
    }
    p {
      margin: 0 0 20px;
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      padding: 12px 22px;
      border-radius: 999px;
      background: var(--accent);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .note {
      margin-top: 16px;
      font-size: 0.85rem;
      color: #7a7a7a;
    }
  </style>
</head>
<body>
  <div class="card">
    <img class="logo" src="${theme.logoUrl}" alt="${theme.name} logo" />
    <h1>${title}</h1>
    <p>${message}</p>
    <a class="button" href="${theme.siteUrl}">${buttonLabel}</a>
    <div class="note">You can close this page now.</div>
  </div>
</body>
</html>`;
}

async function sendResendEmail(env, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend error:', response.status, errorText);
    return { ok: false, status: response.status };
  }

  return { ok: true };
}

async function handleRequest(request, env, corsHeaders) {
  if (!env.CONTACT_KV) {
    return jsonResponse({ success: false, error: 'Server not configured' }, 500, corsHeaders);
  }
  if (!env.RESEND_API_KEY) {
    return jsonResponse({ success: false, error: 'Email service not configured' }, 500, corsHeaders);
  }
  if (!env.FROM_EMAIL) {
    return jsonResponse({ success: false, error: 'Sender not configured' }, 500, corsHeaders);
  }

  let data;
  try {
    data = await request.json();
  } catch (error) {
    return jsonResponse({ success: false, error: 'Invalid JSON' }, 400, corsHeaders);
  }

  const firstName = safeText(data.first_name, 80);
  const lastName = safeText(data.last_name, 80);
  const email = safeText(data.e_mail || data.email, 160).toLowerCase();
  const subject = safeText(data.subject, 160);
  const message = safeText(data.message, 4000);
  const source = safeText(data.source, 40);

  if (!firstName || !lastName || !email || !subject || !message) {
    return jsonResponse({ success: false, error: 'Missing required fields' }, 400, corsHeaders);
  }

  if (!isValidEmail(email)) {
    return jsonResponse({ success: false, error: 'Invalid email' }, 400, corsHeaders);
  }

  if (env.SKIP_RATE_LIMIT !== 'true') {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const limitKey = `rl:${ip}`;
    const existingCount = await env.CONTACT_KV.get(limitKey);
    const count = existingCount ? parseInt(existingCount, 10) : 0;

    if (count >= RATE_LIMIT_MAX) {
      return jsonResponse({ success: false, error: 'Too many requests' }, 429, corsHeaders);
    }

    await env.CONTACT_KV.put(limitKey, String(count + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    });
  }

  const token = crypto.randomUUID().replace(/-/g, '');
  const createdAt = new Date().toISOString();
  const payload = {
    firstName,
    lastName,
    email,
    subject,
    message,
    source,
    createdAt,
  };

  await env.CONTACT_KV.put(`token:${token}`, JSON.stringify(payload), {
    expirationTtl: DEFAULT_TTL_SECONDS,
  });

  const url = new URL(request.url);
  const baseUrl = env.PUBLIC_BASE_URL || url.origin;
  const verifyUrl = `${baseUrl}/verify?token=${token}`;
  const theme = getVerifyTheme(source, env);
  const locale = getLocaleStrings(source, theme);

  const verifySubject = env.VERIFY_SUBJECT || locale.verifySubject;
  const emailText = locale.verifyEmailText(firstName, verifyUrl);
  const emailHtml = locale.verifyEmailHtml(firstName, verifyUrl);

  const sendResult = await sendResendEmail(env, {
    from: env.FROM_EMAIL,
    to: [email],
    subject: verifySubject,
    text: emailText,
    html: emailHtml,
  });

  if (!sendResult.ok) {
    return jsonResponse({ success: false, error: 'Unable to send verification email' }, 502, corsHeaders);
  }

  return jsonResponse({ success: true }, 200, corsHeaders);
}

async function handleVerify(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const stored = token ? await env.CONTACT_KV.get(`token:${token}`) : null;
  const payloadFromToken = stored ? JSON.parse(stored) : null;
  const theme = getVerifyTheme(payloadFromToken ? payloadFromToken.source : 'thelizards', env);
  const locale = getLocaleStrings(payloadFromToken ? payloadFromToken.source : 'thelizards', theme);

  if (!env.CONTACT_KV) {
    return htmlResponse(renderVerifyPage({
      title: locale.serviceNotConfigured,
      message: locale.serviceNotConfiguredMsg,
      source: payloadFromToken ? payloadFromToken.source : 'thelizards'
    }, env), 500, {});
  }
  if (!env.RESEND_API_KEY) {
    return htmlResponse(renderVerifyPage({
      title: locale.emailServiceNotConfigured,
      message: locale.serviceNotConfiguredMsg,
      source: payloadFromToken ? payloadFromToken.source : 'thelizards'
    }, env), 500, {});
  }
  if (!token) {
    return htmlResponse(renderVerifyPage({
      title: locale.verifyMissingToken,
      message: locale.verifyMissingTokenMsg,
      source: payloadFromToken ? payloadFromToken.source : 'thelizards'
    }, env), 400, {});
  }
  if (!stored) {
    return htmlResponse(renderVerifyPage({
      title: locale.verifyInvalidToken,
      message: locale.verifyInvalidTokenMsg,
      source: payloadFromToken ? payloadFromToken.source : 'thelizards'
    }, env), 410, {});
  }

  let payload;
  try {
    payload = JSON.parse(stored);
  } catch (error) {
    return htmlResponse(renderVerifyPage({
      title: locale.verifyPayloadInvalid,
      message: locale.verifyPayloadInvalidMsg,
      source: payloadFromToken ? payloadFromToken.source : 'thelizards'
    }, env), 400, {});
  }

  const sourceLabel = getSourceLabel(payload.source);
  const verifyTheme = getVerifyTheme(payload.source, env);
  const verifyLocale = getLocaleStrings(payload.source, verifyTheme);
  const recipientEmail = getRecipientEmail(payload.source, env);

  if (!recipientEmail) {
    return htmlResponse(renderVerifyPage({
      title: verifyLocale.recipientNotConfigured,
      message: verifyLocale.serviceNotConfiguredMsg,
      source: payload.source
    }, env), 500, {});
  }
  const subjectPrefix = env.CONTACT_SUBJECT_PREFIX || verifyLocale.contactSubjectPrefix;
  const contactSubject = `${subjectPrefix} - ${sourceLabel}`;

  const contactText = `From: ${payload.firstName} ${payload.lastName}\nEmail: ${payload.email}\nSource: ${sourceLabel}\nSubject: ${payload.subject}\n\n${payload.message}`;
  const contactHtml = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #222;">
  <h2>${verifyLocale.contactTitle}</h2>
  <p><strong>From:</strong> ${payload.firstName} ${payload.lastName}</p>
  <p><strong>Email:</strong> ${payload.email}</p>
  <p><strong>Subject:</strong> ${payload.subject}</p>
  <p><strong>Message:</strong></p>
  <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${payload.message}</pre>
</body>
</html>`;

  const resendPayload = {
    from: env.FROM_EMAIL,
    to: [recipientEmail],
    subject: contactSubject,
    text: contactText,
    html: contactHtml,
  };

  if (env.USE_REPLY_TO === 'true') {
    resendPayload.reply_to = payload.email;
  }

  const sendResult = await sendResendEmail(env, resendPayload);
  if (!sendResult.ok) {
    return htmlResponse(renderVerifyPage({
      title: verifyLocale.verifyDeliveryFailed,
      message: verifyLocale.verifyDeliveryFailedMsg,
      source: payload.source
    }, env), 502, {});
  }

  await env.CONTACT_KV.delete(`token:${token}`);

  return htmlResponse(renderVerifyPage({
    title: verifyLocale.verifyPageTitle,
    message: verifyLocale.verifyPageMessage,
    buttonLabel: verifyLocale.verifyPageButton,
    source: payload.source
  }, env), 200, {});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'POST' && url.pathname === '/request') {
      return handleRequest(request, env, corsHeaders);
    }

    if (request.method === 'GET' && url.pathname === '/verify') {
      return handleVerify(request, env);
    }

    return jsonResponse({ success: false, error: 'Not found' }, 404, corsHeaders);
  },
};
