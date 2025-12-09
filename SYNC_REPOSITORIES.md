# 🔄 Sync Automatico tra thelizberries/lizsito ↔️ alessandrolimonta90/lizsito

## 📌 Scenario

Abbiamo due repository:
- **thelizberries/lizsito** → Repository principale con deploy automatico su Aruba
- **alessandrolimonta90/lizsito** → Repository di Alessandro (collaborazione)

**Account `thelizberries`** è collaboratore su ENTRAMBI i repository! ✅

---

## ⚙️ Come Funziona

### Deploy e Sync manuale (workflow attuale):
1. Modifiche locali → `git commit`
2. Push a `thelizberries/lizsito` → `git push deploy dev`
   - ✅ Deploy automatico su Aruba (via GitHub Actions)
3. Push a `alessandrolimonta90/lizsito` → `git push origin dev`
   - ✅ Sincronizza con Alessandro

### Quando Alessandro pusha modifiche:
1. Pull da Alessandro: `git pull origin dev`
2. Sincronizza il tuo repo: `git push deploy dev`

---

## 🚀 Workflow Quotidiano Semplificato

```bash
# 1. Modifiche locali
git add .
git commit -m "Descrizione modifiche"

# 2. Deploy su Aruba + sync thelizberries
git push deploy dev

# 3. Sync con Alessandro (quando vuoi condividere)
git push origin dev
```

**Tutto con un solo account `thelizberries`!** ✅

---

## 📝 Comandi Utili

### Sync completo (entrambi i repository)
```bash
# Push a entrambi i repository in un colpo solo
git push deploy dev; git push origin dev
```

### Solo deploy su Aruba (senza sync Alessandro)
```bash
git push deploy dev
```

### Solo sync con Alessandro (senza deploy)
```bash
git push origin dev
```

### Ricevere modifiche da Alessandro
```bash
git pull origin dev
git push deploy dev  # Sincronizza il tuo repo
```

---

## 🔑 GitHub Secrets da Configurare

Per il deploy automatico su Aruba, configura i secrets su:
https://github.com/thelizberries/lizsito/settings/secrets/actions

**Secrets necessari:**
1. **FTP_SERVER** → Server FTP Aruba (es: `ftp.thelizards.it`)
2. **FTP_USERNAME** → Username FTP Aruba
3. **FTP_PASSWORD** → Password FTP Aruba

---

## 🎯 Best Practices

### ✅ DO:
- Commit frequenti con messaggi descrittivi
- `git push deploy dev` per deploy in produzione
- `git push origin dev` per condividere con Alessandro
- Pull da `origin` prima di iniziare nuove modifiche

### ❌ DON'T:
- NON fare force push
- NON modificare la history di commit condivisi
- NON pushare file sensibili (password, token)

---

## 📊 Riepilogo Setup

```
Remote configurati:
├── deploy  → thelizberries/lizsito (deploy automatico Aruba)
└── origin  → alessandrolimonta90/lizsito (collaborazione)

Account usato: thelizberries (collaboratore su entrambi) ✅

Workflow:
1. git commit
2. git push deploy dev    → Deploy Aruba
3. git push origin dev    → Sync Alessandro (opzionale)
```

Tutto pronto! 🚀
