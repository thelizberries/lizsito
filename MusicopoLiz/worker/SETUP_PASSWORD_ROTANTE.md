# Setup Sistema Password Rotante per MusicopoLiz

Sistema di download protetto con password che cambia automaticamente ad ogni utilizzo e notifica via email tramite **Resend** (gratuito: 3000 email/mese).

---

## 🎯 Perché Resend?

Dopo vari test con altri servizi:
- ❌ **EmailJS**: Blocca chiamate da server-side (errore 403)
- ❌ **MailChannels**: Ora richiede autenticazione e configurazione DNS complessa

**Resend** è la soluzione definitiva:
- ✅ **3.000 email/mese gratis** (più che sufficiente!)
- ✅ **Funziona perfettamente** con Cloudflare Workers
- ✅ **Setup semplicissimo** (5 minuti totali)
- ✅ **API moderna e affidabile**
- ✅ **Nessuna configurazione DNS richiesta per iniziare**

---

## 📋 SETUP RESEND (5 minuti)

### STEP 0: Crea Account Resend

1. Vai su: https://resend.com/signup
2. Registrati con l'email **thelizband@gmail.com**
3. Verifica l'email (controlla inbox)
4. Una volta loggato, vai su **API Keys** (nel menu laterale)
5. Clicca **Create API Key**
   - Nome: `MusicopoLiz Worker`
   - Permessi: **Sending access**
   - Click **Add**
6. **COPIA LA CHIAVE API** (inizia con `re_ZHwbT2yQ_D4dxWVw9PjJi9TGfsbpZrGfu`) - la vedrai solo una volta!
7. Conserva questa chiave in un luogo sicuro

---

## 📋 CONFIGURAZIONE CLOUDFLARE

### STEP 1: Crea un KV Namespace per le Password
1. Vai su: https://dash.cloudflare.com/
2. Seleziona il tuo account
3. Vai su **Storage & databases** → **Workers KV**
4. Clicca su **Create Instance** → **Create a namespace**
5. Nome: `MUSICOPOLIZ_PASSWORDS`
6. Clicca **Add**
7. **Copia il Namespace ID** che appare (es: `3711186bab524c12b8576aed61c09fa6`)

### STEP 2: Apri il tuo Worker
1. Vai su **Workers & Pages**
2. Seleziona il worker `musicopoliz-download` (o come l'hai chiamato)
3. Clicca su **Settings** → **Variables**

### STEP 3: Configura le Variabili d'Ambiente

Nella sezione **Environment Variables**, aggiungi queste variabili:

| Nome Variabile | Valore | Descrizione |
|----------------|--------|-------------|
| `MUSICOPOLIZ_PASSWORD` | `TuaPasswordIniziale123!` | Password iniziale (solo primo utilizzo) |
| `NOTIFICATION_EMAIL` | `thelizband@gmail.com` | Email dove ricevere le notifiche |
| `RESEND_API_KEY` | `re_ZHwbT2yQ_D4dxWVw9PjJi9TGfsbpZrGfu` | API Key di Resend (copiata prima) |
| `GITHUB_TOKEN` | `ghp_...` | Token GitHub (se già configurato) |
| `GITHUB_OWNER` | `thelizberries` | Owner del repo |
| `GITHUB_REPO` | `lizsito` | Nome del repo |
| `GITHUB_BRANCH` | `dev` | Branch dove si trova il file |

**IMPORTANTE:** 
- ✅ **Clicca Encrypt** per ogni variabile sensibile (password, token, API key)
- ✅ Dopo aver aggiunto tutte le variabili, clicca **Save**

### STEP 4: Configura i KV Bindings
Nella stessa pagina Settings → **Variables**, scorri fino a **KV Namespace Bindings**:

1. Clicca **Add binding**
2. **Variable name:** `PASSWORD_KV`
3. **KV namespace:** Seleziona `MUSICOPOLIZ_PASSWORDS` (quello creato prima)
4. Clicca **Save**

5. Se hai già il binding `DOWNLOAD_STATS`, lascialo così com'è
6. Se non ce l'hai, creane uno:
   - Crea un altro namespace KV chiamato `MUSICOPOLIZ_STATS`
   - Aggiungi binding: **Variable name:** `DOWNLOAD_STATS`, **KV namespace:** `MUSICOPOLIZ_STATS`

### STEP 5: Deploy del nuovo codice
1. Copia il contenuto del file `download.js` aggiornato
2. Nel Worker, vai su **Quick Edit**
3. Sostituisci tutto il codice con quello nuovo
4. Clicca **Save and Deploy**

---

## 🧪 TEST DEL SISTEMA

### STEP 6: Primo Test
1. Vai sul sito dove hai il form di download
2. Inserisci la password iniziale che hai impostato in `MUSICOPOLIZ_PASSWORD`
3. Clicca su **Scarica MusicopoLiz**
4. Dovresti:
   - ✅ Ricevere il file zip
   - ✅ Ricevere un'email con la NUOVA password

### STEP 7: Secondo Test
1. Riprova a scaricare
2. Usa la VECCHIA password → dovrebbe dare errore ❌
3. Usa la NUOVA password (ricevuta via email) → dovrebbe funzionare ✅
4. Riceverai un'altra email con un'altra password diversa

### STEP 8: Verifica i Log
1. Nel Worker, vai su **Logs** → **Begin log stream**
2. Esegui un download
3. Dovresti vedere messaggi tipo:
   ```
   ✅ Password verificata con successo
   📊 Download #1 tracciato con successo
   🔐 Nuova password generata
   💾 Nuova password salvata nel KV Storage
   ✉️ Email inviata con successo via Resend - ID: xxxxx
   ```

---

## 🔍 VERIFICA KV STORAGE

Per verificare che le password vengano salvate correttamente:

1. Vai su **KV** → `MUSICOPOLIZ_PASSWORDS`
2. Dovresti vedere la chiave `current_password` con la password attuale
3. Ogni volta che fai un download, questo valore cambia automaticamente

---

## 🚨 Troubleshooting

### Email non arriva
- ✅ **Controlla lo spam** - le email automatiche finiscono spesso lì
- ✅ Verifica che `RESEND_API_KEY` e `NOTIFICATION_EMAIL` siano configurate su Cloudflare
- ✅ Controlla i log del worker per messaggi di errore
- ✅ Verifica che l'API key di Resend sia corretta e attiva
- ✅ Vai su Resend dashboard → **Logs** per vedere se l'email è stata inviata
- ✅ **Limite Resend**: 3000 email/mese (più che sufficiente)

### Password non cambia
- ✅ Verifica che `PASSWORD_KV` sia configurato correttamente nei bindings
- ✅ Controlla i permessi del KV namespace
- ✅ Guarda i log per errori di salvataggio

### Download fallisce
- ✅ Verifica il token GitHub
- ✅ Verifica che il file `MusicopoLiz.zip` sia presente nel repo
- ✅ Controlla che branch, owner e repo siano corretti

---

## 📊 Monitoraggio

### Visualizza statistiche download
Nel KV namespace `DOWNLOAD_STATS` puoi vedere:
- `total_downloads` → contatore totale
- `download_2026-01-09T...` → log di ogni singolo download con IP e paese

### Visualizza password corrente
Nel KV namespace `MUSICOPOLIZ_PASSWORDS`:
- `current_password` → la password attualmente valida

**NOTA:** Non condividere mai questa password pubblicamente!

---

## 🎯 Riepilogo Flusso

```
1. Utente inserisce password nel form
   ↓
2. Worker verifica password (da KV o da env se primo utilizzo)
   ↓
3. Password corretta → Scarica file da GitHub
   ↓
4. Genera nuova password casuale (16 caratteri)
   ↓
5. Salva nuova password nel KV Storage
   ↓
6. Invia email con nuova password via EmailJS
   ↓
7. Restituisce file zip all'utente
   ↓
8. Vecchia password non è più valida ❌
   Nuova password è pronta per il prossimo download ✅
```

---

## 💰 Costi

Tutto completamente **GRATUITO**:
- ✅ Cloudflare Workers: 100.000 richieste/giorno gratis
- ✅ Cloudflare KV: 100.000 letture/giorno + 1.000 scritture/giorno gratis
- ✅ **Resend: 3.000 email/mese gratis** (poi 100 email/giorno a pagamento)
- ✅ GitHub: hosting file gratuito

**Per questo uso** (pochi download al giorno), rimarrai sempre nel limite gratuito di Resend.

---

## 🔐 Sicurezza

- ✅ Password cambia ad ogni download (sicurezza massima)
- ✅ Solo chi ha l'ultima password può scaricare
- ✅ Tracking completo di chi scarica (IP, paese, timestamp)
- ✅ Notifica immediata via email ad ogni download
- ✅ Tutte le variabili sensibili sono criptate su Cloudflare

---

Fatto! Il sistema è pronto. Ogni download genererà automaticamente una nuova password e te la invierà via email. 🎉
