# 📊 Performance Testing - LizHub Websites

## Test da eseguire

### 🔗 PageSpeed Insights
**URL Test:** https://pagespeed.web.dev/

**Siti da testare:**
1. **The Lizards**: https://www.thelizards.it/
2. **5CereaLiz**: https://www.thelizards.it/5cerealiz/
3. **The Lizberries**: https://www.thelizards.it/lizberries/

---

## 📋 Metriche da Monitorare

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s (green)
- **FID (First Input Delay)**: < 100ms (green)  
- **CLS (Cumulative Layout Shift)**: < 0.1 (green)

### Performance Metrics
- **FCP (First Contentful Paint)**: < 1.8s
- **SI (Speed Index)**: < 3.4s
- **TBT (Total Blocking Time)**: < 200ms
- **TTI (Time to Interactive)**: < 3.8s

### Resource Analysis
- **Total Resources Size**: controllare dimensione totale
- **Number of Requests**: controllare numero richieste
- **Images**: dimensione e formato
- **JavaScript**: size e parsing time
- **CSS**: size e render-blocking

---

## ✅ Ottimizzazioni Implementate (da verificare impatto)

### 1. JavaScript Optimization
- ✅ jQuery 3.6.0 → 3.7.1
- ✅ CDN con fallback locale
- ✅ Minificazione JS (56-60% compression)
- ✅ Script defer applicato

### 2. CSS Optimization
- ✅ Minificazione CSS (32% compression)
- ✅ Critical CSS inline per FCP
- ✅ Non-critical CSS con media="print" + onload

### 3. Image Optimization
- ✅ Lazy loading (loading="lazy")
- ✅ Width/height attributes (CLS prevention)
- ✅ WebP format
- ✅ Preload per LCP images

### 4. Icons Optimization
- ✅ FontAwesome rimosso (~75 KB saved)
- ✅ Bootstrap Icons (già caricato, 0 KB extra)

### 5. Resource Hints
- ✅ preconnect per CDN critici
- ✅ dns-prefetch per CDN secondari
- ✅ preload per CSS e immagini LCP

### 6. EmailJS Fix
- ✅ Initialization timing con window.addEventListener('load')
- ✅ typeof check per safety

### 7. Other
- ✅ Duplicate scripts removed (popper.js, magnific-popup local)

**Total Savings:** ~108 KB (75 KB FontAwesome + 33 KB minification)

---

## 📝 Template Risultati Test

### The Lizards (https://www.thelizards.it/)

**Mobile:**
- Performance: 59/100
- LCP: 12,7 s (rosso)
- FID: 50 ms parametro TBT (verde)
- CLS: 0

**Desktop:**
- Performance: 97/100
- LCP: 0,9 s
- FID: 100 ms parametro TBT (verde)
- CLS: 0.005

**Opportunità principali:**
- [ ] ...
- [ ] ...

---

### 5CereaLiz (https://www.thelizards.it/5cerealiz/)

**Mobile:**
- Performance: 55/100
- LCP: 15,5 s (rosso)
- FID: 90 ms parametro TBT (verde)
- CLS: 0

**Desktop:**
- Performance: 95/100
- LCP: 1,2 s (rosso)
- FID: 80 ms parametro TBT (rosso)
- CLS: 0

**Opportunità principali:**
- [ ] ...
- [ ] ...

---

### The Lizberries (https://www.thelizards.it/lizberries/)

**Mobile:**
- Performance: 55/100
- LCP: 19,7 s (rosso)
- FID: 110 ms parametro TBT (verde)
- CLS: 0.001

**Desktop:**
- Performance: 84/100
- LCP: 2,3 s (rosso)
- FID: 130 ms ms parametro TBT (verde)
- CLS: 0.058

**Opportunità principali:**
- [ ] ...
- [ ] ...

---

## 🎯 Prossime Ottimizzazioni (in base ai risultati)

### Alta Priorità
- [ ] Service Worker / PWA (caching, offline)
- [ ] Font optimization (preload, display swap)
- [ ] Critical CSS expansion

### Media Priorità
- [ ] AVIF images support
- [ ] Responsive images srcset
- [ ] Prefetch per navigazione

### Bassa Priorità
- [ ] HTTP/2 Server Push
- [ ] WebP/AVIF con fallback automatico
- [ ] Code splitting

---

## 📌 Note

**Test Conditions:**
- Testa sempre sia Mobile che Desktop
- Usa "Throttling: Slow 4G" per Mobile
- Fai 2-3 test per ogni sito (media dei risultati)
- Testa in orari diversi per evitare cache CDN

**Confronto:**
Per vedere il miglioramento, confronta con test precedenti se disponibili.

**Tools Aggiuntivi (opzionali):**
- WebPageTest: https://www.webpagetest.org/
- GTmetrix: https://gtmetrix.com/
- Chrome DevTools Lighthouse (locale)

---

**Data ultimo test:** 19/01/2026
**Testato da:** Mattia
