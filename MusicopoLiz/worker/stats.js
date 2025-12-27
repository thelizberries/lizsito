// Script per visualizzare le statistiche dei download
// Da deployare come Worker separato o da aggiungere come route al Worker principale

export default {
  async fetch(request, env) {
    // Proteggi l'accesso alle statistiche con password
    const AUTH_PASSWORD = env.STATS_PASSWORD || 'admin123';
    
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    
    if (password !== AUTH_PASSWORD) {
      return new Response('Accesso negato', { status: 401 });
    }

    try {
      // Leggi il contatore totale
      const totalDownloads = await env.DOWNLOAD_STATS.get('total_downloads');
      
      // Leggi gli ultimi 50 download
      const list = await env.DOWNLOAD_STATS.list({ prefix: 'download_', limit: 50 });
      const recentDownloads = [];
      
      for (const key of list.keys) {
        const data = await env.DOWNLOAD_STATS.get(key.name);
        if (data) {
          recentDownloads.push(JSON.parse(data));
        }
      }
      
      // Ordina per timestamp decrescente
      recentDownloads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Statistiche per paese
      const countryStats = {};
      recentDownloads.forEach(download => {
        const country = download.country || 'unknown';
        countryStats[country] = (countryStats[country] || 0) + 1;
      });
      
      // Genera HTML con le statistiche
      const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Statistiche Download MusicopoLiz</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .card {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #f8174b; }
        h2 { color: #333; }
        .total {
            font-size: 48px;
            font-weight: bold;
            color: #f8174b;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8174b;
            color: white;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .country-stats {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
        }
        .country-item {
            background: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>📊 Statistiche Download MusicopoLiz.zip</h1>
    
    <div class="card">
        <h2>Download Totali</h2>
        <div class="total">${totalDownloads || 0}</div>
    </div>
    
    <div class="card">
        <h2>Download per Paese</h2>
        <div class="country-stats">
            ${Object.entries(countryStats)
              .sort((a, b) => b[1] - a[1])
              .map(([country, count]) => `
                <div class="country-item">
                    <strong>${country}</strong><br>
                    ${count} download
                </div>
              `).join('')}
        </div>
    </div>
    
    <div class="card">
        <h2>Ultimi Download (max 50)</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Data e Ora</th>
                    <th>Paese</th>
                    <th>IP</th>
                </tr>
            </thead>
            <tbody>
                ${recentDownloads.map(download => `
                    <tr>
                        <td>${download.count}</td>
                        <td>${new Date(download.timestamp).toLocaleString('it-IT')}</td>
                        <td>${download.country}</td>
                        <td>${download.ip}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="card">
        <p style="color: #666; font-size: 12px;">
            Ultimo aggiornamento: ${new Date().toLocaleString('it-IT')}
        </p>
    </div>
</body>
</html>
      `;
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        }
      });
      
    } catch (error) {
      return new Response(`Errore: ${error.message}`, { status: 500 });
    }
  }
};
