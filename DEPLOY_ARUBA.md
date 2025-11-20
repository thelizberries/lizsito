# 🚀 Guida: Deploy Automatico GitHub → Aruba FTP

## 📋 Prerequisiti Completati

✅ Workflow GitHub Actions creato: `.github/workflows/deploy-to-aruba.yml`  
✅ Credenziali FTP raccolte  
✅ Branch di riferimento: `dev`

---

## 🔐 STEP 1: Configurare i GitHub Secrets

**IMPORTANTE**: Le credenziali FTP NON devono mai essere nel codice, ma come "Secrets" su GitHub.

### Procedura:

1. **Vai su GitHub**: https://github.com/alessandrolimonta90/lizsito
2. **Clicca su "Settings"** (in alto a destra)
3. **Nel menu laterale sinistro**: Clicca su "Secrets and variables" → "Actions"
4. **Clicca "New repository secret"** e aggiungi questi 3 secrets:

#### Secret #1: FTP_SERVER
- **Name**: `FTP_SERVER`
- **Value**: `ftp.thelizards.it`
- Clicca "Add secret"

#### Secret #2: FTP_USERNAME
- **Name**: `FTP_USERNAME`
- **Value**: `2231116@aruba.it`
- Clicca "Add secret"

#### Secret #3: FTP_PASSWORD
- **Name**: `FTP_PASSWORD`
- **Value**: `Liz11Berries90*`
- Clicca "Add secret"

✅ **Dopo questo step, avrai 3 secrets configurati**

---

## 📁 STEP 2: Verificare la Struttura FTP su Aruba

**DA FARE quando hai accesso FTP:**

1. **Connettiti ad Aruba con FileZilla**:
   - Host: `ftp.thelizards.it`
   - Username: `2231116@aruba.it`
   - Password: `Liz11Berries90*`
   - Porta: `21`

2. **Verifica il percorso di destinazione**:
   - Quando ti connetti, vedi la cartella root?
   - C'è una cartella `/htdocs/` o `/public_html/` o `/www/`?
   - Dove sono attualmente i file del sito?

3. **Annota il percorso completo**, esempio:
   - ✅ `/htdocs/` (se i file vanno qui)
   - ✅ `/public_html/lizsito/` (se c'è una sottocartella)
   - ✅ `/` (se vanno nella root)

4. **Verifica la struttura dei file**:
   - Su Aruba, `index.html` è nella root o in una sottocartella?
   - Le cartelle `css/`, `js/`, `lizberries/` sono allo stesso livello di `index.html`?

---

## ⚙️ STEP 3: Configurare il Percorso nel Workflow

**Dopo aver verificato il percorso su Aruba:**

1. **Apri il file**: `.github/workflows/deploy-to-aruba.yml`

2. **Trova questa riga** (circa riga 37):
   ```yaml
   server-dir: /htdocs/
   ```

3. **Modifica con il percorso corretto**, esempio:
   ```yaml
   server-dir: /htdocs/             # Se i file vanno in /htdocs/
   # OPPURE
   server-dir: /public_html/        # Se i file vanno in /public_html/
   # OPPURE
   server-dir: /                    # Se i file vanno nella root
   ```

4. **Salva il file**

---

## 🔓 STEP 4: Attivare il Workflow

**Quando sei pronto per attivarlo:**

1. **Apri il file**: `.github/workflows/deploy-to-aruba.yml`

2. **Rimuovi i commenti** dalle righe 4-9:

   **PRIMA** (disabilitato):
   ```yaml
   # on:
   #   push:
   #     branches:
   #       - dev
   #   workflow_dispatch:
   ```

   **DOPO** (attivo):
   ```yaml
   on:
     push:
       branches:
         - dev
     workflow_dispatch:
   ```

3. **Salva, commit e push**:
   ```bash
   git add .github/workflows/deploy-to-aruba.yml
   git commit -m "Attiva workflow deploy automatico su Aruba"
   git push origin dev
   ```

---

## 🧪 STEP 5: Test del Deploy

### Test Manuale (CONSIGLIATO per il primo test):

1. **Vai su GitHub**: https://github.com/alessandrolimonta90/lizsito/actions
2. **Clicca sul workflow "Deploy to Aruba FTP"**
3. **Clicca "Run workflow"** → Seleziona branch `dev` → "Run workflow"
4. **Monitora l'esecuzione**: Vedrai i log in tempo reale
5. **Verifica su Aruba**: Controlla che i file siano stati caricati correttamente

### Test Automatico:

Dopo il test manuale, **ogni push sul branch `dev`** triggererà automaticamente il deploy:

```bash
# Fai una modifica qualsiasi
echo "test" >> test.txt

# Commit e push
git add test.txt
git commit -m "Test deploy automatico"
git push origin dev

# Il deploy partirà automaticamente!
```

---

## 📊 Monitoraggio Deploy

**Vedere i log di deploy:**
- Vai su: https://github.com/alessandrolimonta90/lizsito/actions
- Clicca sul workflow più recente
- Espandi gli step per vedere cosa è stato caricato

**Cosa aspettarsi:**
- ✅ Checkout del codice
- ✅ Connessione FTP
- ✅ Upload dei file (vedrai la lista)
- ✅ Deploy completato

**Tempi:**
- Deploy completo: ~1-3 minuti (dipende dalla dimensione dei file)

---

## 🛡️ File Esclusi dal Deploy

Il workflow NON caricherà questi file/cartelle su Aruba:

❌ `.git/` e `.gitignore` (cartelle Git)  
❌ `node_modules/` (dipendenze npm)  
❌ `ImmaginiConversione/` (script locali)  
❌ `.husky/` (git hooks)  
❌ `package.json`, `package-lock.json`  
❌ `.vscode/` (configurazione editor)

**Tutto il resto verrà caricato** ✅

---

## ⚠️ Note Importanti

1. **Non committare mai le credenziali FTP** nel codice
2. **Testa sempre manualmente** prima di attivare il deploy automatico
3. **Backup**: Fai un backup completo di Aruba prima del primo deploy
4. **Percorso corretto**: Verifica 2 volte il `server-dir` prima di attivare
5. **Monitoraggio**: Controlla sempre i log del primo deploy

---

## 🆘 Troubleshooting

### Errore: "Failed to connect to FTP server"
- ✅ Verifica che i GitHub Secrets siano configurati correttamente
- ✅ Verifica che le credenziali siano corrette
- ✅ Verifica che la porta sia 21

### Errore: "Permission denied"
- ✅ Verifica che il percorso `server-dir` esista su Aruba
- ✅ Verifica che l'utente FTP abbia permessi di scrittura

### File non vengono caricati
- ✅ Verifica che non siano nella lista `exclude`
- ✅ Controlla i log del workflow per vedere cosa è stato fatto

---

## 📞 Prossimi Step

1. ⏳ **Attendi** di avere accesso FTP
2. 🔍 **Verifica** la struttura su Aruba (STEP 2)
3. ⚙️ **Configura** il percorso nel workflow (STEP 3)
4. 🔓 **Attiva** il workflow (STEP 4)
5. 🧪 **Testa** manualmente (STEP 5)
6. 🎉 **Deploy automatico** attivo!

---

**Creato il**: 20 Novembre 2025  
**Repository**: alessandrolimonta90/lizsito  
**Branch**: dev  
**FTP**: ftp.thelizards.it
