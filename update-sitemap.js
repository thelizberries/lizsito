const fs = require("fs");
const path = require("path");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");

const sitemapPath = "./sitemap.xml";
const basePath = "."; // root del progetto locale (dove carichi i file su Aruba)

// Mappa URL parziali ai percorsi locali dei file
const pathMap = {
  "https://www.thelizards.it/": "index.html",
  "https://www.thelizards.it/lizberries/": "lizberries/index.html",
  "https://www.thelizards.it/5cerealiz/": "5cerealiz/index.html",
};

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function updateSitemap() {
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const dom = new DOMParser().parseFromString(xml, "text/xml");
  const urls = dom.getElementsByTagName("url");

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const loc = url.getElementsByTagName("loc")[0].textContent.trim();

    if (pathMap[loc]) {
      const filePath = path.join(basePath, pathMap[loc]);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const lastMod = formatDate(stats.mtime);
        const lastmodTag = url.getElementsByTagName("lastmod")[0];
        if (lastmodTag) {
          lastmodTag.textContent = lastMod;
          console.log(`✔ Updated <lastmod> for ${loc} → ${lastMod}`);
        }
      } else {
        console.warn(`⚠ File not found for ${loc} → ${filePath}`);
      }
    }
  }

  const updatedXml = new XMLSerializer().serializeToString(dom);
  fs.writeFileSync(sitemapPath, updatedXml, "utf-8");
  console.log("\n✅ sitemap.xml aggiornato con successo.");
}

updateSitemap();
