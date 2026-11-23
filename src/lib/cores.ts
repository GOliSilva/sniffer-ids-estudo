// Cores por papel, as mesmas das figuras: o texto em negrito e o nome dos cartões de termo
// ganham a cor do assunto de que falam. A legenda está no roteiro (módulo 00).
// Para outra matéria, troque as palavras de cada papel (e as cores em globals.css, "cores por papel").

export type Papel = "ataque" | "falha" | "s7" | "modbus" | "rede" | "permitido" | "codigo"

const limpar = (s: string) =>
  s
    .toLowerCase()
    .replace(/[:.,;!?)]+$/, "")
    .trim()

// Só negritos curtos ganham cor. A ordem importa: o primeiro papel que casar vence.
export function papel(texto: string): Papel | undefined {
  const s = limpar(texto)
  if (!s || s.length > 60) return
  // diferente, mas permitido; linha de base (antes de "fora da política")
  if (/permitido|linha de base|saud[áa]vel|\bnormal\b/.test(s)) return "permitido"
  // ataque: fora da política, sondagem, intruso, injeção
  if (/ataque|fora da pol[íi]tica|sondagem|varredura|intruso|inje[çc]|forjad|malicios/.test(s)) return "ataque"
  // falha de comunicação ou de equipamento
  if (/falha|defeito|retransmiss|timeout|\blent|rompid|estour/.test(s)) return "falha"
  // código: o Evento e as regras
  if (/\bev\b|evento|\bregra|avaliar|conferir|python/.test(s)) return "codigo"
  // S7comm
  if (/\bs7|put\/get|\bget\b|tpkt|cotp|read var|write var|\bdb\d/.test(s)) return "s7"
  // Modbus TCP
  if (/modbus|mbap|unit id|holding|registrador|\bhr\d|transa[çc]/.test(s)) return "modbus"
  // rede: TCP, IP, ARP, Ethernet
  if (/\btcp\b|\bip\b|\barp\b|ethernet|\bmac\b|\back\b|\bsyn\b|\bfin\b|\bporta/.test(s)) return "rede"
}

// avisos (blockquotes) pelo rótulo em negrito que os abre
export type Aviso = "professor" | "erro" | "confere" | "nota"
export function aviso(rotulo: string): Aviso | undefined {
  const s = limpar(rotulo)
  if (!s) return
  if (/professor/.test(s) && !/confere/.test(s)) return "professor"
  if (/erro|cuidado|aten[çc][ãa]o|monitoria|enunciado/.test(s)) return "erro"
  if (/confere/.test(s)) return "confere"
  return "nota"
}
