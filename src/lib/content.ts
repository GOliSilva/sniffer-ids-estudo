// Conteúdo do curso: módulos em markdown (src/content/modulos/NN.md) divididos em cartões.
// Sintaxe:  "=== tipo: título" abre um cartão;  "?? pergunta" abre um passo da resolução;
//           "??? resposta" separa enunciado e resposta num cartão de treino.

// "tema" só existe na revisão: abre cada tema com o que lembrar antes das questões
export type TipoCartao = "questao" | "ideia" | "resolucao" | "treino" | "resumo" | "tema"

export type Passo = { pergunta: string; md: string }

export type Cartao = {
  tipo: TipoCartao
  titulo: string
  md: string // corpo sem o título da questão
  chaves: string[] // "Prova 1 Q3", "Exercício 2 Q1"... (questao/treino)
  tituloQuestao?: string // texto depois dos dois-pontos no título "Questão de prova ...: título"
  passos?: Passo[] // resolucao
  intro?: string // resolucao: texto antes do 1º passo
  resposta?: string // treino
}

export type Modulo = {
  id: string // "01"
  curto: string
  titulo: string
  cartoes: Cartao[]
  corrido: boolean // sem cartões: página corrida (formulário)
  md: string
}

const arquivos = import.meta.glob("../content/modulos/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>

// nome curto de cada módulo no menu: uma linha por arquivo de src/content/modulos
export const CURTOS: Record<string, string> = {
  "00": "Roteiro",
  "01": "A planta e a linha de base",
  "02": "Do pacote ao ev",
  "03": "ev: quem, quando, sentido",
  "04": "ev: o que se pede",
  "05": "ev: cabeçalho e resposta",
  "06": "Escrever regras",
  "07": "Investigar e classificar",
  "08": "Casos da aula 1 a 5",
  "09": "Casos da aula 6 a 10",
  "10": "Ataques no payload",
  "11": "Simulado",
  "12": "Referência do ev",
}

// título das questões: "### ✍️ Questão de prova Prova 1 Q3 = Lista 2 Q1: inselbergs..."
const RE_QUESTAO = /^#{2,3} ✍️ Questão de prova (.+?): (.+)$/m

function lerCartao(tipo: TipoCartao, titulo: string, corpo: string): Cartao {
  const c: Cartao = { tipo, titulo, md: corpo.trim(), chaves: [] }
  const q = c.md.match(RE_QUESTAO)
  if (q) {
    c.chaves = q[1].split(" = ").map((s) => s.trim())
    c.tituloQuestao = q[2].trim()
    c.md = c.md.replace(RE_QUESTAO, "").trim()
  }
  if (tipo === "resolucao") {
    const p = c.md.split(/^\?\? (.+)$/m)
    c.intro = p[0].trim()
    c.passos = []
    for (let i = 1; i < p.length; i += 2) c.passos.push({ pergunta: p[i].trim(), md: p[i + 1].trim() })
  }
  if (tipo === "treino") {
    const [enun, resp] = c.md.split(/^\?\?\? resposta\s*$/m)
    c.md = enun.trim()
    c.resposta = (resp || "").trim()
  }
  return c
}

function lerModulo(id: string, md: string): Modulo {
  const titulo = (md.match(/^# (.+)$/m) || [, ""])[1] as string
  const partes = md.split(/^=== (\w+): (.*)$/m)
  const cartoes: Cartao[] = []
  for (let i = 1; i < partes.length; i += 3) cartoes.push(lerCartao(partes[i] as TipoCartao, partes[i + 1].trim(), partes[i + 2]))
  return {
    id,
    curto: CURTOS[id] || titulo,
    titulo: titulo.replace(/^Módulo \d+:\s*/, ""),
    cartoes,
    corrido: cartoes.length === 0,
    md: md.replace(/^# .+$/m, "").trim(),
  }
}

// páginas corridas (o formulário) vão para o fim da lista, depois de todos os módulos de cartões;
// o id não muda, para os links e o progresso salvo continuarem valendo
export const MODULOS: Modulo[] = Object.entries(arquivos)
  .map(([caminho, md]) => lerModulo(caminho.match(/(\d\d)\.md$/)![1], md))
  .sort((a, b) => Number(a.corrido) - Number(b.corrido) || a.id.localeCompare(b.id))

export const porId = (id: string) => MODULOS.find((m) => m.id === id)

export const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

// onde está cada questão: chave -> módulo e cartão
export const ONDE: Record<string, { mod: string; cartao: number }> = {}
for (const m of MODULOS)
  m.cartoes.forEach((c, i) => c.chaves.forEach((k) => (ONDE[k] ??= { mod: m.id, cartao: i })))

// a questão de uma chave como cartão de treino, para usar fora do módulo (revisão).
// Treino: o próprio objeto do módulo (mesma resposta, mesma nota de acerto).
// Questão principal: o mesmo enunciado, com a resolução do cartão seguinte como resposta.
const comoTreino: Record<string, Cartao> = {}
export function cartaoDaQuestao(k: string): Cartao | undefined {
  const o = ONDE[k]
  if (!o) return
  const m = porId(o.mod)!
  const c = m.cartoes[o.cartao]
  if (c.tipo === "treino") return c
  if (c.tipo !== "questao") return
  if (!comoTreino[k]) {
    const r = m.cartoes.slice(o.cartao + 1).find((x) => x.tipo === "resolucao")
    const passos = (r?.passos || []).map((p) => `**${p.pergunta}**\n\n${p.md}`)
    comoTreino[k] = { ...c, tipo: "treino", resposta: [r?.intro || "", ...passos].filter(Boolean).join("\n\n") }
  }
  return comoTreino[k]
}
