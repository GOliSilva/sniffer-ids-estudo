import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import remarkDirective from "remark-directive"
import { useZoom } from "~/components/Zoom"
import medidas from "~/content/imagens.json"
import { aviso, papel } from "~/lib/cores"
import { remarkDiretivas } from "~/lib/diretivas"
import { linhas, realcar } from "~/lib/realce"
import { GRUPOS } from "~/lib/referencia"

// nomes das propriedades do ev: em código em linha, sozinhos, ganham a cor do ev
const PROPS = new Set(["ev", ...GRUPOS.flatMap((g) => g.props.map((p) => p.nome))])

// bloco ```python: cores de sintaxe e uma linha por <span> (os números vêm do CSS)
function CodigoPython({ texto }: { texto: string }) {
  return (
    <code className="language-python com-linhas">
      {linhas(realcar(texto.replace(/\n$/, ""))).map((ln, i) => (
        <span key={i} className="ln">
          {ln.map((tk, k) => (tk.t ? <span key={k} className={`tk-${tk.t}`}>{tk.s}</span> : tk.s))}
          {"\n"}
        </span>
      ))}
    </code>
  )
}

const MEDIDAS: Record<string, number[]> = medidas

// texto puro de um nó (hast) e o primeiro negrito dentro dele: usados para escolher a cor
type No = { type?: string; tagName?: string; value?: string; children?: No[] }
const textoDe = (n?: No): string => (n ? (n.value ?? "") + (n.children || []).map(textoDe).join("") : "")
const primeiroForte = (n?: No): No | undefined => {
  if (!n) return
  if (n.tagName === "strong") return n
  for (const c of n.children || []) {
    const f = primeiroForte(c)
    if (f) return f
  }
}

// blocos :::termo, :::chave e :::saiba (src/lib/diretivas.ts)
const PLUGINS_LINHA = [remarkMath, remarkDirective, remarkDiretivas]
const PLUGINS = [remarkGfm, remarkMath, remarkDirective, remarkDiretivas]

// na versão offline (scripts/offline.mjs), as figuras vêm embutidas em window.FIGURAS como data URIs
const FIGURAS = (window as { FIGURAS?: Record<string, string> }).FIGURAS
export const OFFLINE = !!FIGURAS
export const fonte = (src: string) => FIGURAS?.[src.replace(/^img\//, "")] ?? src

// fórmula de bloco com várias equações separadas por \qquad ou \quad: no celular vira uma pilha
function empilhar(f: string): string {
  const partes: string[] = []
  let prof = 0
  let ini = 0
  let i = 0
  while (i < f.length) {
    if (f[i] === "\\") {
      const m = /^\\(left|right|begin|end|qquad|quad)(?![a-zA-Z])/.exec(f.slice(i))
      if (m) {
        if (m[1] === "left" || m[1] === "begin") prof++
        else if (m[1] === "right" || m[1] === "end") prof--
        else if (prof === 0) {
          partes.push(f.slice(ini, i))
          ini = i + m[0].length
        }
        i += m[0].length
        continue
      }
      i += 2
      continue
    }
    if (f[i] === "{") prof++
    else if (f[i] === "}") prof--
    i++
  }
  partes.push(f.slice(ini))
  // a seta que fica sozinha entre dois \quad vai junto com o que vem depois
  const itens: string[] = []
  let seta = ""
  for (const p of partes.map((x) => x.trim()).filter(Boolean)) {
    if (/^\\(Longrightarrow|Rightarrow|Longleftrightarrow|to)$/.test(p)) seta = p + " "
    else {
      itens.push(seta + p)
      seta = ""
    }
  }
  if (itens.length < 2) return f
  return "\\begin{gathered} " + itens.join(" \\\\[0.7em] ") + " \\end{gathered}"
}
const empilharBlocos = (md: string) => md.replace(/\$\$([\s\S]+?)\$\$/g, (_, f: string) => "$$" + empilhar(f) + "$$")

function useEstreito() {
  const q = "(max-width: 760px)"
  const [e, setE] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setE(m.matches)
    m.addEventListener("change", f)
    return () => m.removeEventListener("change", f)
  }, [])
  return e
}

// trecho curto dentro de uma linha (perguntas dos passos): sem parágrafo em volta
export function MdLinha({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={PLUGINS_LINHA}
      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
      components={{ p: ({ children }) => <>{children}</>, strong: ({ children, node }) => <strong data-papel={papel(textoDe(node))}>{children}</strong> }}
    >
      {children}
    </ReactMarkdown>
  )
}

// texto do curso: markdown + fórmulas ($...$ e $$...$$); figuras abrem em tela cheia ao tocar
export function Md({ children }: { children: string }) {
  const zoom = useZoom()
  const estreito = useEstreito()
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={PLUGINS}
        rehypePlugins={[rehypeRaw, [rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          code: ({ className, children }) => {
            const texto = String(children)
            if (/language-python/.test(className || "")) return <CodigoPython texto={texto} />
            // bloco sem linguagem (terminal, saída do sensor): sem cores
            if (className || texto.includes("\n")) return <code className={className}>{children}</code>
            // em linha: arquivo e comando ficam na cor do texto; o resto ganha cor por tipo
            if (/\.(py|pcap|zip|txt|csv|md|ps1)\b|^(python|pip|npm|cd) /.test(texto)) return <code className="ic-arq">{texto}</code>
            if (PROPS.has(texto)) return <code className="tk-ev">{texto}</code>
            return (
              <code>
                {realcar(texto).map((tk, k) => (tk.t ? <span key={k} className={`tk-${tk.t}`}>{tk.s}</span> : tk.s))}
              </code>
            )
          },
          strong: ({ children, node }) => <strong data-papel={papel(textoDe(node))}>{children}</strong>,
          blockquote: ({ children, node }) => <blockquote data-aviso={aviso(textoDe(primeiroForte(node)) || textoDe(node).slice(0, 80))}>{children}</blockquote>,
          img: ({ src, alt }) => {
            // largura e altura reais: o navegador reserva o espaço antes de a figura chegar
            const [w, h] = MEDIDAS[String(src).replace(/^img\//, "")] || []
            return (
              <figure className="fig">
                <img src={fonte(String(src))} alt={alt || ""} width={w} height={h} decoding="async" onClick={() => zoom(fonte(String(src)), alt || "")} />
                <figcaption>Toque para ampliar</figcaption>
              </figure>
            )
          },
          table: ({ children }) => (
            <div className="tabela">
              <table>{children}</table>
            </div>
          ),
          a: ({ href, children }) =>
            href?.startsWith("http") ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <a href={href}>{children}</a>
            ),
          // figura sozinha num parágrafo não pode ficar dentro de <p>
          p: ({ children, node, className }) => {
            const soImagem = node?.children?.length === 1 && (node.children[0] as { tagName?: string }).tagName === "img"
            return soImagem ? <>{children}</> : <p className={className}>{children}</p>
          },
        }}
      >
        {estreito ? empilharBlocos(children) : children}
      </ReactMarkdown>
    </div>
  )
}
