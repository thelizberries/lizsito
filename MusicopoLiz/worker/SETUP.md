# Setup Cloudflare Worker per MusicopoLiz Download

## 1. Crea il Worker su Cloudflare

1. Vai su https://dash.cloudflare.com/
2. Seleziona il tuo account
3. Vai su "Workers & Pages"
4. Click su "Create Application"
5. Seleziona "Create Worker"
6. Dai un nome al worker, es: `musicopoliz-download`
7. Click su "Deploy"

## 2. Carica il codice

1. Una volta creato il worker, click su "Edit Code"
2. Copia tutto il contenuto del file `download.js`
3. Incollalo nell'editor del worker
4. Click su "Save and Deploy"

## 3. Configura le variabili d'ambiente

1. Vai nelle impostazioni del worker
2. Click su "Variables and Secrets"
3. Sotto "Environment Variables" aggiungi:
   - Nome: `MUSICOPOLIZ_PASSWORD`
   - Valore: `@LizXmas2025` (o la password che preferisci)
   - Click "Add variable"

4. Aggiungi anche il token GitHub per accedere al file:
   - Nome: `GITHUB_TOKEN`
   - Valore: Il tuo GitHub Personal Access Token
   - Tipo: "Secret" (encrypted)
   - Click "Add variable"

### Come creare un GitHub Personal Access Token:

1. Vai su https://github.com/settings/tokens
2. Click su "Generate new token" > "Generate new token (classic)"
3. Dai un nome al token: "MusicopoLiz Download"
4. Seleziona scopes: `repo` (Full control of private repositories)
5. Click su "Generate token"
6. Copia il token (lo vedrai solo una volta!)

## 4. Ottieni l'URL del Worker

Dopo il deploy, Cloudflare ti darà un URL del tipo:
```
https://musicopoliz-download.tuousername.workers.dev
```

Copia questo URL - ti servirà per aggiornare i file JavaScript del sito.

## 5. Opzioni per il Storage del File

### Opzione A: GitHub (Semplice, già configurato)
Il file `MusicopoLiz.zip` è già nel repository GitHub.
Il worker lo scarica direttamente da lì.
✅ Nessuna configurazione aggiuntiva necessaria!

### Opzione B: Cloudflare R2 Storage (Consigliato per file grandi)
Se il file è molto grande (>25MB), usa R2:

1. Vai su Cloudflare Dashboard > R2
2. Crea un bucket chiamato `musicopoliz-files`
3. Carica `MusicopoLiz.zip` nel bucket
4. Nel codice del worker, decommenta l'OPZIONE 1 e commenta l'OPZIONE 2
5. Nelle impostazioni del worker, aggiungi il binding R2:
   - Nome variabile: `MUSICOPOLIZ_BUCKET`
   - Bucket: `musicopoliz-files`

## 6. Testa il Worker

Puoi testare il worker con curl:

```bash
curl -X POST https://musicopoliz-download.tuousername.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"password":"@LizXmas2025"}' \
  --output test.zip
```

Se funziona, scaricherà il file `test.zip`.

## 7. Aggiorna i file JavaScript del sito

L'URL del worker deve essere inserito nei file JavaScript:
- `lizsito/index.js`
- `lizsito/5cerealiz/index.js`
- `lizsito/lizberries/index.js`

Sostituisci:
```javascript
const correctPassword = '@LizXmas2025';
```

Con la chiamata al worker che verrà aggiunta automaticamente.

## Note di Sicurezza

✅ La password è verificata sul server (Cloudflare)
✅ Non è visibile nel codice JavaScript del browser
✅ Il file è servito solo dopo validazione corretta
✅ Puoi cambiare la password dalle variabili d'ambiente senza modificare il codice

## Costi

- Cloudflare Workers: Gratuito fino a 100,000 richieste/giorno
- R2 Storage (opzionale): Gratuito fino a 10GB storage
- GitHub: Gratuito per repository pubblici

## Troubleshooting

**Errore 401 "Password errata"**
- Verifica che la variabile `MUSICOPOLIZ_PASSWORD` sia configurata correttamente

**Errore 404 "File non trovato"**
- Verifica che il file esista nel repository GitHub
- Controlla che il percorso `FILE_PATH` nel codice sia corretto
- Verifica che il `GITHUB_TOKEN` abbia i permessi corretti

**Errore CORS**
- Il worker ha già configurato CORS per accettare richieste dal tuo dominio
- Se necessario, puoi restringere `Access-Control-Allow-Origin` al tuo dominio specifico
