// Blocos especiais do texto (remark-directive), convertidos em HTML com classe:
//   :::termo{nome="Dataset"}   cartão de um termo: definição + linhas "**Rótulo** valor"
//   :::chave                   frase-chave que abre o cartão
//   :::saiba{titulo="..."}     aprofundamento recolhido (<details>)
// Uma diretiva de texto que não é nossa (ex.: "db:50P1P" fora de código) volta a ser texto.

import { papel } from "~/lib/cores"

type No = {
  type: string
  name?: string
  value?: string
  attributes?: Record<string, string | null | undefined>
  children?: No[]
  data?: { hName?: string; hProperties?: Record<string, unknown> }
}

const texto = (n: No): string => (n.value ?? "") + (n.children || []).map(texto).join("")

// "**Na bancada** `goose_reles`" → <span class="k">Na bancada</span><span class="v">...</span>
function linhasChaveValor(lista: No) {
  lista.data = { hName: "ul", hProperties: { className: ["kv"] } }
  for (const item of lista.children || []) {
    const p = item.children?.[0]
    const [primeiro, ...resto] = p?.children || []
    if (!p || primeiro?.type !== "strong") continue
    primeiro.data = { hName: "span", hProperties: { className: ["k"], dataPapel: papel(texto(primeiro)) } }
    p.data = { hName: "div" }
    p.children = [primeiro, { type: "emphasis", data: { hName: "span", hProperties: { className: ["v"] } }, children: resto }]
  }
}

function visitar(n: No, pai?: No, i = 0) {
  if (n.type === "containerDirective") {
    const a = n.attributes || {}
    if (n.name === "termo") {
      n.data = { hName: "div", hProperties: { className: ["termo"], dataPapel: papel(a.nome || "") } }
      n.children = [
        { type: "paragraph", data: { hName: "p", hProperties: { className: ["termo-nome"] } }, children: [{ type: "text", value: a.nome || "" }] },
        ...(n.children || []),
      ]
      for (const c of n.children) if (c.type === "list") linhasChaveValor(c)
    } else if (n.name === "chave") {
      n.data = { hName: "div", hProperties: { className: ["chave"] } }
    } else if (n.name === "saiba") {
      n.data = { hName: "details", hProperties: { className: ["saiba"] } }
      n.children = [
        { type: "paragraph", data: { hName: "summary" }, children: [{ type: "text", value: a.titulo || "Saiba mais" }] },
        { type: "containerDirective", data: { hName: "div", hProperties: { className: ["saiba-corpo"] } }, children: n.children || [] },
      ]
    }
  } else if ((n.type === "textDirective" || n.type === "leafDirective") && pai) {
    pai.children!.splice(i, 1, { type: "text", value: ":" + (n.name || "") + texto(n) })
  }
  ;(n.children || []).forEach((c, k) => visitar(c, n, k))
}

// dois ou mais cartões de termo seguidos vão para um mesmo <div class="termos">, que os põe em grade
const eTermo = (n: No) => n.type === "containerDirective" && n.name === "termo"
function agrupar(n: No) {
  if (!n.children) return
  const novos: No[] = []
  for (const c of n.children) {
    agrupar(c)
    const ultimo = novos[novos.length - 1]
    if (eTermo(c) && ultimo?.data?.hProperties?.className?.toString() === "termos") ultimo.children!.push(c)
    else if (eTermo(c) && ultimo && eTermo(ultimo))
      novos[novos.length - 1] = { type: "containerDirective", data: { hName: "div", hProperties: { className: ["termos"] } }, children: [ultimo, c] }
    else novos.push(c)
  }
  n.children = novos
}

export function remarkDiretivas() {
  return (arvore: No) => {
    agrupar(arvore)
    visitar(arvore)
  }
}
