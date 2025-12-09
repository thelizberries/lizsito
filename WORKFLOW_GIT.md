# 🔄 Git Workflow - lizsito

## 📌 Configurazione Repository

### Remote configurati:
```bash
origin  → https://github.com/alessandrolimonta90/lizsito.git (collaborazione)
deploy  → https://github.com/thelizberries/lizsito.git (deploy automatico)
```

### Branch principale: `dev`

---

## 🚀 Workflow Quotidiano

### 1️⃣ **Sviluppo locale e commit**

```bash
# Modifica i file localmente
# Quando sei pronto per committare:

git add .
git commit -m "Descrizione modifiche"
```

---

### 2️⃣ **Deploy automatico su Aruba (thelizberries)**

```bash
# Push al TUO repository (triggera deploy automatico)
git push deploy dev
```

Questo comando:
- ✅ Pusha su `thelizberries/lizsito`
- ✅ Triggera GitHub Actions
- ✅ Deploy automatico su Aruba
- ✅ Mantiene il tuo repo aggiornato

---

### 3️⃣ **Condividere con Alessandro (opzionale)**

Quando hai modifiche che vuoi condividere con Alessandro:

```bash
# Push al repository di Alessandro
git push origin dev
```

⚠️ **Nota:** Fai questo solo quando sei sicuro delle modifiche e vuoi condividerle.

---

### 4️⃣ **Ricevere aggiornamenti da Alessandro**

Se Alessandro fa modifiche sul suo repository:

```bash
# Pull dal repository di Alessandro
git pull origin dev

# Poi sincronizza il tuo repository
git push deploy dev
```

---

## 📊 Workflow Completo Esempio

```bash
# 1. Modifiche locali
git add .
git commit -m "Ottimizzazioni performance LCP"

# 2. Deploy immediato su Aruba (via thelizberries)
git push deploy dev

# 3. Condividi con Alessandro (quando vuoi)
git push origin dev
```

---

## 🔧 Comandi Utili

### Verificare stato repository
```bash
git status
git remote -v
git branch -a
```

### Verificare differenze
```bash
# Differenze locali non committed
git diff

# Differenze tra branch
git diff origin/dev deploy/dev
```

### Sincronizzare tutto
```bash
# Aggiorna da Alessandro
git pull origin dev

# Pusha sia su thelizberries che su Alessandro
git push deploy dev
git push origin dev
```

---

## ⚙️ Configurazione Credenziali

### Credenziali locali (già configurate)
```bash
git config user.name "thelizberries"
git config user.email "thelizberries@thelizards.it"
```

### GitHub Personal Access Token

Per autenticazione HTTPS, usa:
- **Username:** `thelizberries`
- **Password:** Personal Access Token (da creare su GitHub)

Crea il token su: https://github.com/settings/tokens
- Scopes necessari: `repo` (Full control of private repositories)

---

## 🎯 Best Practices

### ✅ DO:
- Commit frequenti con messaggi descrittivi
- Push a `deploy` per ogni modifica importante (va in produzione)
- Pull da `origin` prima di iniziare nuove modifiche
- Testare localmente prima di pushare

### ❌ DON'T:
- NON fare force push (`git push -f`)
- NON modificare la history di commit condivisi
- NON pushare file sensibili (password, token)
- NON pushare file temporanei o di build

---

## 🚨 Risoluzione Problemi

### Conflitto durante pull da origin
```bash
# Vedi quali file hanno conflitti
git status

# Risolvi manualmente i conflitti, poi:
git add .
git commit -m "Risolti conflitti con origin"
git push deploy dev
```

### Reset a versione precedente
```bash
# Vedere lo storico
git log --oneline

# Tornare a un commit specifico (usa con cautela!)
git reset --hard <commit-hash>
git push deploy dev --force  # Solo se necessario!
```

### Credential helper cache (evitare di digitare password ogni volta)
```bash
# Windows
git config --global credential.helper wincred

# O usa credential store (salva in plain text)
git config --global credential.helper store
```

---

## 📝 Note Importanti

1. **Deploy automatico:** Ogni push a `deploy dev` triggera il deploy su Aruba (via GitHub Actions)
2. **Collaborazione:** I push a `origin` vanno sul repo di Alessandro, condividi solo quando pronto
3. **Branch unico:** Lavoriamo solo su `dev`, nessun branch aggiuntivo per ora
4. **Backup:** `thelizberries/lizsito` è anche il tuo backup ufficiale del progetto

---

## 🔗 Link Utili

- Repository thelizberries: https://github.com/thelizberries/lizsito
- Repository Alessandro: https://github.com/alessandrolimonta90/lizsito
- Sito produzione: https://www.thelizards.it
- Documentazione deploy: `DEPLOY_ARUBA.md`
