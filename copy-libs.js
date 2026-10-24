const fs = require("fs"), p = require("path");
const src = p.join(__dirname, "..", "node_modules", "pdfjs-dist", "build");
const dst = p.join(__dirname, "..", "www", "lib");
fs.mkdirSync(dst, { recursive: true });
["pdf.min.js", "pdf.worker.min.js"].forEach(f => fs.copyFileSync(p.join(src, f), p.join(dst, f)));
console.log("pdf.js copiato in www/lib (l'app ora funziona offline)");
