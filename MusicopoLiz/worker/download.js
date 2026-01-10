// Cloudflare Worker per gestire il download protetto di MusicopoLiz.zip con password rotanti
// Deploy su: https://dash.cloudflare.com/workers
// IMPORTANTE: Configurare prima le variabili d'ambiente e il KV Storage (vedi SETUP_PASSWORD_ROTANTE.md)
// Email inviata tramite Resend (gratuito: 3000 email/mese)

// Funzione per generare password sicure
function generateSecurePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

// Funzione per inviare email con Resend (gratuito: 3000 email/mese)
async function sendPasswordEmail(env, newPassword, downloadCount, siteName, referer, source) {
  try {
    const downloadDate = new Date().toLocaleString('it-IT', { 
      timeZone: 'Europe/Rome',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .password-box { background: white; border: 3px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; word-break: break-all; }
        .info-box { background: #e8f4f8; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 MusicopoLiz</h1>
            <p>Sistema di Download Protetto</p>
        </div>
        
        <div class="content">
            <h2>✅ Download Completato!</h2>
            
            <div class="info-box">
                <p><strong>📅 Data e ora:</strong> ${downloadDate}</p>
                <p><strong>📊 Numero download:</strong> #${downloadCount}</p>
                <p><strong>🌐 Sito di origine:</strong> ${siteName}</p>
            </div>
            
            <h3>🔐 Nuova Password Generata</h3>
            <p>Per il prossimo download, utilizza questa password:</p>
            
            <div class="password-box">
                ${newPassword}
            </div>
            
            <div class="warning">
                <p><strong>⚠️ IMPORTANTE:</strong></p>
                <ul>
                    <li>Questa è la NUOVA password per il prossimo download</li>
                    <li>La password precedente NON è più valida</li>
                    <li>Conserva questa password in un luogo sicuro</li>
                    <li>Ogni download genererà una nuova password</li>
                </ul>
            </div>
            
            <p style="margin-top: 30px;">Grazie per aver scaricato MusicopoLiz! 🎲🎵</p>
        </div>
        
        <div class="footer">
            <p>Questo è un messaggio automatico generato dal sistema MusicopoLiz.</p>
            <p>Non rispondere a questa email.</p>
        </div>
    </div>
</body>
</html>`;

    const emailText = `
MusicopoLiz - Sistema di Download Protetto

✅ Download Completato!

📅 Data e ora: ${downloadDate}
📊 Numero download: #${downloadCount}
🌐 Sito di origine: ${siteName}


�🔐 NUOVA PASSWORD GENERATA
Per il prossimo download, utilizza questa password:

${newPassword}

⚠️ IMPORTANTE:
- Questa è la NUOVA password per il prossimo download
- La password precedente NON è più valida
- Conserva questa password in un luogo sicuro
- Ogni download genererà una nuova password

Grazie per aver scaricato MusicopoLiz! 🎲🎵

---
Questo è un messaggio automatico. Non rispondere a questa email.
`;

    // Usa Resend API (3000 email/mese gratis)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MusicopoLiz <onboarding@resend.dev>',
        to: [env.NOTIFICATION_EMAIL],
        subject: `🔑 Nuova Password MusicopoLiz - Download #${downloadCount}`,
        text: emailText,
        html: emailHTML
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Errore Resend:', response.status, JSON.stringify(errorData));
      return false;
    }

    const result = await response.json();
    console.log('✉️ Email inviata con successo via Resend - ID:', result.id);
    return true;
  } catch (error) {
    console.error('❌ Errore invio email:', error.message);
    return false;
  }
}

export default {
  async fetch(request, env) {
    // Abilita CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Gestisci preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Accetta solo POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const requestData = await request.json();
      const { password, source } = requestData;

      // Recupera la password corrente dal KV Storage
      // Se non esiste (primo utilizzo), usa quella dalle variabili d'ambiente
      let currentPassword = env.MUSICOPOLIZ_PASSWORD; // Default fallback
      
      if (env.PASSWORD_KV) {
        const storedPassword = await env.PASSWORD_KV.get('current_password');
        if (storedPassword) {
          currentPassword = storedPassword;
          console.log('🔑 Password recuperata dal KV Storage');
        } else {
          console.log('🔑 Primo utilizzo: uso password da variabile d\'ambiente');
        }
      } else {
        console.warn('⚠️ PASSWORD_KV non configurato, uso solo variabile d\'ambiente');
      }

      // Verifica se la password fornita è corretta
      if (password !== currentPassword) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Password errata! Riprova.' 
          }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('✅ Password verificata con successo');

      // Determina il sito di origine dalla richiesta o dal referer
      const referer = request.headers.get('Referer') || request.headers.get('Origin') || 'Sconosciuto';
      let siteName = 'Sconosciuto';
      
      // Priorità 1: usa il parametro 'source' inviato dal frontend
      if (source) {
        if (source === '5cerealiz') {
          siteName = '5 Cerealiz (www.thelizards.it/5cerealiz)';
        } else if (source === 'lizberries') {
          siteName = 'Lizberries (www.thelizards.it/lizberries)';
        } else if (source === 'thelizards') {
          siteName = 'The Lizards (www.thelizards.it)';
        } else {
          siteName = source;
        }
      } 
      // Priorità 2: fallback al referer (se il frontend non invia source)
      else if (referer && referer !== 'Sconosciuto') {
        if (referer.includes('5cerealiz')) {
          siteName = '5 Cerealiz (www.thelizards.it/5cerealiz)';
        } else if (referer.includes('lizberries')) {
          siteName = 'Lizberries (www.thelizards.it/lizberries)';
        } else if (referer.includes('thelizards')) {
          siteName = 'The Lizards (www.thelizards.it)';
        } else {
          siteName = referer;
        }
      }
      
      console.log('🌐 Source:', source || 'non fornito');
      console.log('🌐 Referer:', referer);
      console.log('🌐 Sito riconosciuto:', siteName);

      // === SCARICA IL FILE DA GITHUB ===
      const GITHUB_TOKEN = env.GITHUB_TOKEN; // Token con permessi di lettura
      const GITHUB_OWNER = env.GITHUB_OWNER || 'thelizberries'; // Imposta come variabile d'ambiente
      const GITHUB_REPO = env.GITHUB_REPO || 'lizsito'; // Imposta come variabile d'ambiente
      const GITHUB_BRANCH = env.GITHUB_BRANCH || 'dev'; // Branch dove si trova il file
      const FILE_PATH = 'MusicopoLiz/MusicopoLiz.zip';
      
      const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`;
      
      console.log('Tentativo di fetch da:', githubUrl);
      
      const githubResponse = await fetch(githubUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw', // Scarica il file raw
          'User-Agent': 'Cloudflare-Worker'
        }
      });

      if (!githubResponse.ok) {
        const errorText = await githubResponse.text();
        console.error('GitHub API error:', githubResponse.status, errorText);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `File non trovato sul server (${githubResponse.status})`,
            details: `Verifica che il file esista su: ${GITHUB_OWNER}/${GITHUB_REPO}/${FILE_PATH} (branch: ${GITHUB_BRANCH})`
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Restituisci il file (senza return, dobbiamo prima generare la nuova password)
      const fileResponse = new Response(githubResponse.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="MusicopoLiz.zip"'
        }
      });

      // === POST-DOWNLOAD: GENERA NUOVA PASSWORD E INVIA EMAIL ===
      let downloadCount = 0;

      // Traccia il download e recupera il contatore
      if (env.DOWNLOAD_STATS) {
        try {
          // Incrementa contatore totale
          const currentCount = await env.DOWNLOAD_STATS.get('total_downloads');
          downloadCount = (parseInt(currentCount) || 0) + 1;
          await env.DOWNLOAD_STATS.put('total_downloads', downloadCount.toString());
          
          // Salva anche un log con timestamp
          const timestamp = new Date().toISOString();
          const logKey = `download_${timestamp}`;
          await env.DOWNLOAD_STATS.put(logKey, JSON.stringify({
            timestamp: timestamp,
            count: downloadCount,
            ip: request.headers.get('CF-Connecting-IP') || 'unknown',
            country: request.headers.get('CF-IPCountry') || 'unknown',
            referer: referer,
            source: source || 'non fornito',
            siteName: siteName
          }), {
            expirationTtl: 31536000 // Mantieni per 1 anno
          });
          
          console.log(`📊 Download #${downloadCount} tracciato con successo`);
        } catch (statsError) {
          console.error('❌ Errore nel tracciamento:', statsError);
          // Non bloccare il download se il tracciamento fallisce
        }
      }

      // === GENERA NUOVA PASSWORD ===
      const newPassword = generateSecurePassword(16);
      console.log('🔐 Nuova password generata');

      // Salva la nuova password nel KV Storage
      if (env.PASSWORD_KV) {
        try {
          await env.PASSWORD_KV.put('current_password', newPassword);
          console.log('💾 Nuova password salvata nel KV Storage');
        } catch (kvError) {
          console.error('❌ Errore salvataggio password:', kvError);
          // Continua comunque, ma logga l'errore
        }
      } else {
        console.warn('⚠️ PASSWORD_KV non configurato, la password NON verrà aggiornata!');
      }

      // Invia email con la nuova password
      if (env.RESEND_API_KEY && env.NOTIFICATION_EMAIL) {
        await sendPasswordEmail(env, newPassword, downloadCount, siteName, referer, source);
      } else {
        console.warn('⚠️ Resend non configurato, email NON inviata');
        console.warn('   Verifica: RESEND_API_KEY, NOTIFICATION_EMAIL');
      }

      // Restituisci il file
      return fileResponse;

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Errore del server',
          details: error.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
