import { useState } from "react"
import { ArrowRight, Check, ChevronDown, Copy } from "lucide-react"
import { MODULOS } from "~/lib/content"
import { realcar } from "~/lib/realce"
import { GRUPOS, MEMORIA, MODELOS, NAO_VIRA_EV, type Prop } from "~/lib/referencia"
import { useSalvo } from "~/lib/storage"

// Referência do ev: abas por grupo. Em cada aba, a lista das propriedades e o detalhe da escolhida
// (tela larga: lado a lado; celular: o detalhe abre embaixo do nome). A última aba traz os modelos de
// condição por tema e as regras com memória.

const ABAS = [...GRUPOS.map((g) => ({ id: g.id, titulo: g.titulo })), { id: "modelos", titulo: "Modelos de condição" }]

// o cartão do módulo que explica a propriedade (títulos "ev.ts", "ev.origem e ev.destino"...)
function ondeExplica(nome: string) {
  const re = new RegExp(`\\bev\\.${nome}\\b`)
  for (const m of MODULOS)
    for (let i = 0; i < m.cartoes.length; i++) if (re.test(m.cartoes[i].titulo)) return { mod: m.id, cartao: i + 1 }
}

const COR = { color: "var(--c-codigo)" }

function Linha({ k, v, codigo }: { k: string; v: string; codigo?: boolean }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-t border-border py-2 text-[15px] first:border-t-0">
      <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
      <dd className={codigo ? "font-mono text-[13.5px] font-semibold break-words" : ""}>{codigo ? <Cores texto={v} /> : v}</dd>
    </div>
  )
}

function Detalhe({ p }: { p: Prop }) {
  const onde = ondeExplica(p.nome)
  return (
    <div className="surge rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <p className="font-mono text-xl font-semibold" style={COR}>
        ev.{p.nome}
      </p>
      <p className="mt-2 mb-3 leading-relaxed">{p.resumo}</p>
      <dl>
        <Linha k="Tipo" v={p.tipo} codigo />
        {p.wireshark && <Linha k="Wireshark" v={p.wireshark} codigo />}
        {p.base && <Linha k="Linha de base" v={p.base} />}
        {(p.extra || []).map(([k, v]) => (
          <Linha key={k} k={k} v={v} />
        ))}
      </dl>
      {onde && (
        <a href={`#/m/${onde.mod}/${onde.cartao}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          Explicação completa no módulo {onde.mod} <ArrowRight className="size-4" />
        </a>
      )}
    </div>
  )
}

function Propriedades({ props }: { props: Prop[] }) {
  const [sel, setSel] = useState(0)
  return (
    <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-6">
      <ul className="space-y-1.5">
        {props.map((p, i) => (
          <li key={p.nome}>
            <button
              type="button"
              aria-expanded={sel === i}
              onClick={() => setSel(sel === i ? -1 : i)}
              className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-left hover:bg-muted aria-expanded:border-primary aria-expanded:bg-muted"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[15px] font-semibold" style={COR}>
                  ev.{p.nome}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{p.tipo}</span>
              </span>
              <ChevronDown className={`size-4 shrink-0 transition-transform lg:-rotate-90 ${sel === i ? "rotate-180 lg:rotate-0" : ""}`} />
            </button>
            {/* celular: o detalhe abre logo abaixo do nome */}
            {sel === i && (
              <div className="mt-2 mb-3 lg:hidden">
                <Detalhe p={p} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {/* tela larga: o detalhe fica ao lado, parado enquanto a lista rola */}
      <div className="hidden lg:sticky lg:top-24 lg:block">{props[sel] ? <Detalhe p={props[sel]} /> : <p className="text-muted-foreground">Escolha uma propriedade.</p>}</div>
    </div>
  )
}

export function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      title="Copiar"
      aria-label="Copiar"
      className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto)
          setOk(true)
          setTimeout(() => setOk(false), 1200)
        } catch {
          /* sem permissão de copiar: nada a fazer */
        }
      }}
    >
      {ok ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  )
}

// código com as cores de sintaxe do site, sem caixa em volta
function Cores({ texto }: { texto: string }) {
  return (
    <>
      {realcar(texto).map((tk, k) => (tk.t ? <span key={k} className={`tk-${tk.t}`}>{tk.s}</span> : tk.s))}
    </>
  )
}

function Codigo({ texto }: { texto: string }) {
  return (
    <div className="flex items-start gap-2">
      <code className="min-w-0 flex-1 pt-1 font-mono text-[13.5px] leading-relaxed font-semibold break-words whitespace-pre-wrap">
        <Cores texto={texto} />
      </code>
      <Copiar texto={texto} />
    </div>
  )
}

function Modelos() {
  return (
    <div>
      <p className="mb-2 text-[15px] text-muted-foreground">Cada condição vira uma regra assim:</p>
      <Codigo texto={"def nome_da_regra(ev):\n    return <condição>"} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {MODELOS.map((t) => (
          <section key={t.titulo} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-semibold">{t.titulo}</h3>
            {t.nota && <p className="mt-0.5 text-sm text-muted-foreground">{t.nota}</p>}
            <ul className="mt-3 space-y-3">
              {t.modelos.map((m) => (
                <li key={m.pega}>
                  <p className="mb-1 text-sm font-semibold">{m.pega}</p>
                  <Codigo texto={m.cond} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h3 className="mt-8 text-lg font-semibold">Regras com memória</h3>
      <p className="mt-1 mb-3 text-[15px] text-muted-foreground">
        Não viram <code className="font-mono">ev</code>: {NAO_VIRA_EV.join(", ")}. Prove no Wireshark; na regra, pegue pelo efeito.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {MEMORIA.map((m) => (
          <section key={m.titulo} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h4 className="font-semibold">{m.titulo}</h4>
            <p className="mt-0.5 mb-3 text-sm text-muted-foreground">{m.pega}</p>
            <Codigo texto={m.codigo} />
          </section>
        ))}
      </div>
    </div>
  )
}

export function Referencia() {
  const [aba, setAba] = useSalvo<string>("ref-aba", ABAS[0].id)
  const grupo = GRUPOS.find((g) => g.id === aba)
  return (
    <div className="mx-auto max-w-5xl px-4 py-5 pb-20 lg:px-10 lg:py-8">
      <h1 className="text-2xl font-semibold lg:text-3xl">Referência do ev</h1>
      <p className="mt-1 mb-5 text-muted-foreground">As 22 propriedades que o regras.py recebe e as condições prontas para montar regras.</p>
      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className="shrink-0 rounded-xl border border-border px-3.5 py-2 text-sm font-semibold whitespace-nowrap hover:bg-muted aria-selected:border-primary aria-selected:bg-primary aria-selected:text-primary-foreground"
          >
            {a.titulo}
            {GRUPOS.find((g) => g.id === a.id) && <span className="ml-1.5 opacity-70">{GRUPOS.find((g) => g.id === a.id)!.props.length}</span>}
          </button>
        ))}
      </nav>
      {grupo ? <Propriedades key={grupo.id} props={grupo.props} /> : <Modelos />}
    </div>
  )
}
