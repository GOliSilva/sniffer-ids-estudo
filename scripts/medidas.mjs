// largura e altura de cada figura (lidas do cabeçalho do PNG/JPG ou do viewBox do SVG), para a página
// reservar o espaço antes de a imagem chegar e o texto não pular quando ela carrega
import { readdirSync, readFileSync, writeFileSync } from "node:fs"

function medir(f, b) {
  if (f.endsWith(".png")) return [b.readUInt32BE(16), b.readUInt32BE(20)] // IHDR: largura, altura
  if (f.endsWith(".svg")) {
    const v = b.toString("utf8").match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/)
    return v ? [+v[1], +v[2]] : null
  }
  // JPG: percorre os segmentos até o SOF (C0..CF, menos C4, C8 e CC)
  for (let p = 2; p < b.length; ) {
    const m = b[p + 1]
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(p + 7), b.readUInt16BE(p + 5)]
    p += 2 + b.readUInt16BE(p + 2)
  }
  return null
}

const medidas = {}
for (const f of readdirSync("public/img").filter((f) => /\.(png|jpe?g|svg)$/.test(f)).sort()) {
  const m = medir(f, readFileSync(`public/img/${f}`))
  if (m) medidas[f] = m
}
writeFileSync("src/content/imagens.json", JSON.stringify(medidas, null, 1) + "\n")
console.log(Object.keys(medidas).length, "figuras medidas")
