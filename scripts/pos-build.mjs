// o publicador do artifact recusa o caractere U+FFFD literal; troca pelo escape equivalente
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const FFFD = String.fromCharCode(0xfffd)
const ESCAPE = "\\u" + "FFFD"

const dir = "dist/assets"
for (const f of readdirSync(dir).filter((f) => /\.(js|css)$/.test(f))) {
  const p = join(dir, f)
  const t = readFileSync(p, "utf8")
  if (t.includes(FFFD)) {
    writeFileSync(p, t.replaceAll(FFFD, ESCAPE))
    console.log("U+FFFD escapado em", f)
  }
}
