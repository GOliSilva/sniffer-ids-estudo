// Versão offline: um único .html com JS, CSS, fontes e figuras embutidos (abre direto do arquivo, sem internet).
// Rodar depois do build: node scripts/offline.mjs → offline/SnifferIDS.html
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const TIPOS = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf" }
const dataUri = (arquivo) => `data:${TIPOS[arquivo.split(".").pop()]};base64,${readFileSync(arquivo).toString("base64")}`

let html = readFileSync("dist/index.html", "utf8")
const js = html.match(/<script type="module" crossorigin src="\.\/(assets\/[^"]+)"><\/script>/)
const css = html.match(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+)">/)

// fontes do CSS (KaTeX e Geist): url(./arquivo) relativo à pasta assets
const estilo = readFileSync(join("dist", css[1]), "utf8").replace(/url\(\.?\/?([^)"']+\.(?:woff2|woff|ttf))\)/g, (_, f) => `url(${dataUri(join("dist/assets", f))})`)

// figuras: cada uma embutida uma vez em window.FIGURAS, que o componente Md consulta
const figuras = Object.fromEntries(readdirSync("dist/img").filter((f) => /.(png|jpe?g|svg)$/.test(f)).map((f) => [f, dataUri(join("dist/img", f))]))
const codigo = readFileSync(join("dist", js[1]), "utf8").replaceAll("</script", "<\\/script")

// substitutos em função: em texto, o replace interpretaria os $& e $' que existem no código
html = html
  .replace(js[0], () => "")
  .replace(css[0], () => `<style>${estilo}</style>`)
  .replace("</body>", () => `<script>window.FIGURAS=${JSON.stringify(figuras)}</script>\n<script type="module">${codigo}</script>\n</body>`)

const saida = "offline/SnifferIDS.html"
mkdirSync(dirname(saida), { recursive: true })
writeFileSync(saida, html)
console.log(`${saida}: ${(html.length / 1e6).toFixed(1)} MB`)
