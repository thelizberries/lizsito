// Cloudflare Worker per gestire il download protetto di MusicopoLiz.zip
// Deploy su: https://dash.cloudflare.com/workers

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
      const { password } = requestData;

      // Verifica password (configurata come variabile d'ambiente su Cloudflare)
      // Vai su Worker Settings > Variables > Environment Variables
      // Aggiungi: MUSICOPOLIZ_PASSWORD = la tua password
      if (password !== env.MUSICOPOLIZ_PASSWORD) {
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

      // Password corretta - restituisci il file
      // Il file può essere:
      // 1. Caricato su Cloudflare R2 Storage
      // 2. Caricato su Cloudflare KV Storage  
      // 3. Hostato su GitHub e scaricato dal Worker
      
      // OPZIONE 1: Se usi R2 Storage (consigliato per file grandi)
      // Uncomment questo blocco e commenta l'opzione 2
      /*
      const object = await env.MUSICOPOLIZ_BUCKET.get('MusicopoLiz.zip');
      if (!object) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'File non trovato' 
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(object.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="MusicopoLiz.zip"'
        }
      });
      */

      // OPZIONE 2: Se usi GitHub come storage (più semplice per iniziare)
      // Il file deve essere caricato nel repo GitHub
      const GITHUB_TOKEN = env.GITHUB_TOKEN; // Token con permessi di lettura
      const GITHUB_OWNER = env.GITHUB_OWNER || 'tuousername'; // Imposta come variabile d'ambiente
      const GITHUB_REPO = env.GITHUB_REPO || 'LizHub'; // Imposta come variabile d'ambiente
      const FILE_PATH = 'lizsito/MusicopoLiz/MusicopoLiz.zip';
      
      const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
      
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
            details: `Verifica che il file esista su: ${GITHUB_OWNER}/${GITHUB_REPO}/${FILE_PATH}`
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Restituisci il file
      return new Response(githubResponse.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="MusicopoLiz.zip"'
        }
      });

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
