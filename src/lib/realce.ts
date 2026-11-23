// Realce de sintaxe para os blocos ```python e para o código em linha: um tokenizador pequeno,
// sem biblioteca. Cada token recebe uma classe (tk-k palavra-chave, tk-s texto, tk-c comentário,
// tk-n número, tk-f nome de função, tk-b função embutida, tk-ev propriedade do ev, tk-ws campo do
// Wireshark, tk-err nome de erro, tk-ip endereço IP). As cores ficam em globals.css.

export type Token = { t: string; s: string }

const PADROES: [string, RegExp][] = [
  ["c", /#[^\n]*/y],
  ["s", /[bf]?("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y],
  ["ev", /\bev\.[A-Za-z_]\w*/y],
  ["ws", /\b(?:ip|tcp|mbtcp|modbus|s7comm|frame|tpkt|cotp|arp|_ws)\.[a-z_][\w.]*/y],
  ["err", /\b[A-Z][A-Za-z]*Error\b/y],
  ["ip", /(?:\b\d{1,3}(?:\.\d{1,3}){3}\b|(?<![\w.])\.\d{1,3}\b)/y],
  ["n", /\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/y],
  ["k", /\b(?:def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|break|continue|pass|lambda|class|with|try|except)\b/y],
  ["b", /\b(?:len|any|all|set|dict|list|print|int|range|str|bytes|sorted)\b(?=\()/y],
  ["f", /(?<=\bdef\s+)[A-Za-z_]\w*/y],
]

export function realcar(codigo: string): Token[] {
  const tokens: Token[] = []
  let texto = ""
  let i = 0
  while (i < codigo.length) {
    let achou = false
    for (const [t, re] of PADROES) {
      re.lastIndex = i
      const m = re.exec(codigo)
      if (m && m[0].length) {
        if (texto) tokens.push({ t: "", s: texto })
        texto = ""
        tokens.push({ t, s: m[0] })
        i += m[0].length
        achou = true
        break
      }
    }
    if (!achou) {
      texto += codigo[i]
      i++
    }
  }
  if (texto) tokens.push({ t: "", s: texto })
  return tokens
}

// quebra os tokens em linhas (para numerar)
export function linhas(tokens: Token[]): Token[][] {
  const saida: Token[][] = [[]]
  for (const tk of tokens) {
    const partes = tk.s.split("\n")
    partes.forEach((p, k) => {
      if (k > 0) saida.push([])
      if (p) saida[saida.length - 1].push({ t: tk.t, s: p })
    })
  }
  if (saida.length > 1 && saida[saida.length - 1].length === 0) saida.pop()
  return saida
}
