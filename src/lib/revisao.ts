// Revisão: um deck como os módulos, montado de src/content/revisao.md.
//   "# título" e a introdução           → cartão de abertura
//   "## Tema" + "caiu: ..." + "questões: chave; chave" + o que lembrar → cartão de tema e um cartão por questão
//   "=== fim" e o texto depois dele      → cartão final (o placar de acertos aparece embaixo dele)
// As questões são os mesmos cartões dos módulos (cartaoDaQuestao): a resposta e a nota de acerto são as mesmas.
import { cartaoDaQuestao, type Cartao, type Modulo } from "~/lib/content"
import revisaoMd from "~/content/revisao.md?raw"

const texto = revisaoMd.replace(/\r/g, "")
const [corpo, fim = ""] = texto.split(/^=== fim\s*$/m)
const [cabeca, ...secoes] = corpo.split(/^## /m)
const TITULO = (cabeca.match(/^# (.+)$/m) || [, "Revisão"])[1] as string

const cartoes: Cartao[] = [{ tipo: "ideia", titulo: TITULO, md: cabeca.replace(/^# .+$/m, "").trim(), chaves: [] }]
export const FALTANDO: string[] = [] // chaves sem cartão em nenhum módulo (aviso no console)

for (const s of secoes) {
  const [titulo, ...linhas] = s.split("\n")
  let caiu = ""
  let chaves: string[] = []
  const resto: string[] = []
  for (const l of linhas) {
    const m = l.match(/^(caiu|questões):\s*(.*)$/)
    if (!m) resto.push(l)
    else if (m[1] === "caiu") caiu = m[2].trim()
    else chaves = m[2].split(";").map((x) => x.trim()).filter(Boolean)
  }
  const md = (caiu ? `**Caiu em:** ${caiu}\n\n` : "") + resto.join("\n").trim()
  cartoes.push({ tipo: "tema", titulo: titulo.trim(), md, chaves: [] })
  for (const k of chaves) {
    const c = cartaoDaQuestao(k)
    if (!c) FALTANDO.push(k)
    else if (cartoes.includes(c)) console.warn("Revisão: questão repetida (outro nome do mesmo cartão):", k)
    else cartoes.push(c)
  }
}
cartoes.push({ tipo: "resumo", titulo: "Fim da revisão", md: fim.trim(), chaves: [] })
if (FALTANDO.length) console.warn("Revisão: questões sem cartão nos módulos:", FALTANDO)

export const REVISAO: Modulo = { id: "rv", curto: "Revisão", titulo: TITULO, cartoes, corrido: false, md: "" }
