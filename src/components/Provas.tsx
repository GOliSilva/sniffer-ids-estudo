import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Check, ChevronDown, X } from "lucide-react"
import { Md } from "~/components/Md"
import { CURTOS, MODULOS, slug, type Cartao } from "~/lib/content"
import { useSalvo } from "~/lib/storage"

// Página de questões: uma questão por vez. As questões vêm direto dos cartões "questao" e "treino"
// dos módulos, agrupadas pela fonte da chave ("Treino M04", "Simulado"), então enunciado e gabarito
// são sempre os do módulo. A nota de acerto é a mesma dos cartões (chave "treino").
type Questao = { chave: string; titulo: string; c: Cartao; gabarito: string; mod: string; cartao: number }
type Fonte = { nome: string; curto: string; desc: string; questoes: Questao[] }

function gabaritoDe(cartoes: Cartao[], i: number): string {
  const c = cartoes[i]
  if (c.tipo === "treino") return c.resposta || ""
  const r = cartoes[i + 1]
  if (r?.tipo !== "resolucao") return ""
  return (r.passos || []).map((p) => `**${p.pergunta}**\n\n${p.md}`).join("\n\n")
}

const FONTES: Fonte[] = []
for (const m of MODULOS) {
  if (m.corrido) continue
  m.cartoes.forEach((c, i) => {
    if ((c.tipo !== "questao" && c.tipo !== "treino") || !c.chaves[0]) return
    const chave = c.chaves[0]
    const nome = chave.replace(/ Q\d+$/, "")
    let f = FONTES.find((x) => x.nome === nome)
    if (!f) {
      const sim = nome === "Simulado"
      f = { nome, curto: sim ? "Simulado" : `M${m.id}`, desc: sim ? "10 capturas no formato da prova" : CURTOS[m.id] || m.titulo, questoes: [] }
      FONTES.push(f)
    }
    f.questoes.push({ chave, titulo: c.tituloQuestao || c.titulo, c, gabarito: gabaritoDe(m.cartoes, i), mod: m.id, cartao: i })
  })
}

const link = (f: Fonte, i: number) => `#/provas/${slug(f.nome)}/${i + 1}`

function Bolinha({ nota }: { nota?: number }) {
  if (nota === 1) return <span className="size-2.5 shrink-0 rounded-full bg-musgo" aria-label="acertou" />
  if (nota === 0) return <span className="size-2.5 shrink-0 rounded-full bg-erro" aria-label="errou" />
  return <span className="size-2.5 shrink-0 rounded-full border border-border" aria-label="sem resposta" />
}

export function Provas({ fonte, q }: { fonte?: string; q?: number }) {
  const fi = Math.max(0, FONTES.findIndex((x) => slug(x.nome) === fonte))
  const f = FONTES[fi]
  const i = Math.min(q ?? 0, f.questoes.length - 1)
  const atual = f.questoes[i]
  const [notas, salvar] = useSalvo<Record<string, number>>("treino", {})
  const [aberto, setAberto] = useState(false)

  // anterior e próxima atravessam de uma fonte para a outra
  const ant = i > 0 ? link(f, i - 1) : fi > 0 ? link(FONTES[fi - 1], FONTES[fi - 1].questoes.length - 1) : undefined
  const prox = i < f.questoes.length - 1 ? link(f, i + 1) : fi < FONTES.length - 1 ? link(FONTES[fi + 1], 0) : undefined

  useEffect(() => {
    setAberto(false)
    window.scrollTo({ top: 0 })
  }, [fi, i])

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return
      if (e.key === "ArrowLeft" && ant) location.hash = ant
      if (e.key === "ArrowRight" && prox) location.hash = prox
      if (e.key === " ") {
        e.preventDefault()
        setAberto((a) => !a)
      }
    }
    window.addEventListener("keydown", tecla)
    return () => window.removeEventListener("keydown", tecla)
  }, [ant, prox])

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 pb-24 lg:px-10 lg:py-8">
      {/* fontes: faixa que rola de lado no celular */}
      <nav className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Módulos">
        {FONTES.map((x) => {
          const feitas = x.questoes.filter((y) => notas[y.chave] !== undefined).length
          return (
            <a
              key={x.nome}
              href={link(x, 0)}
              aria-current={x === f ? "page" : undefined}
              className="shrink-0 rounded-xl border border-border px-3 py-1.5 hover:bg-muted aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
            >
              <b className="block text-sm whitespace-nowrap">{x.curto}</b>
              <small className="block text-xs whitespace-nowrap opacity-75">
                {feitas}/{x.questoes.length} feitas
              </small>
            </a>
          )
        })}
      </nav>

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:items-start lg:gap-8">
        {/* lista das questões da fonte: coluna no computador, números no celular */}
        <aside className="mb-4 lg:sticky lg:top-24 lg:mb-0">
          <p className="font-semibold">{f.nome === "Simulado" ? "Simulado" : `Módulo ${f.curto.slice(1)}`}</p>
          <p className="mb-3 text-sm text-muted-foreground">{f.desc}</p>
          <ol className="hidden space-y-1 lg:block">
            {f.questoes.map((x, k) => (
              <li key={x.chave}>
                <a
                  href={link(f, k)}
                  aria-current={k === i ? "true" : undefined}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted aria-[current=true]:bg-muted aria-[current=true]:font-semibold"
                >
                  <span className="w-5 font-mono text-xs text-muted-foreground">{k + 1}</span>
                  <span className="min-w-0 flex-1 leading-snug first-letter:uppercase">{x.titulo}</span>
                  <Bolinha nota={notas[x.chave]} />
                </a>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 lg:hidden">
            {f.questoes.map((x, k) => (
              <a
                key={x.chave}
                href={link(f, k)}
                aria-current={k === i ? "true" : undefined}
                aria-label={`Questão ${k + 1}`}
                className="flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg border border-border px-2 text-sm font-semibold aria-[current=true]:border-primary aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground"
              >
                {k + 1}
                <Bolinha nota={notas[x.chave]} />
              </a>
            ))}
          </div>
        </aside>

        <section key={atual.chave} className="enunciado surge rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">{atual.chave}</span>
            <span className="text-xs text-muted-foreground">
              {i + 1} de {f.questoes.length}
            </span>
          </div>
          <h2 className="mt-3 mb-3 text-xl leading-snug font-semibold text-balance first-letter:uppercase">{atual.titulo}</h2>
          <Md>{atual.c.md}</Md>

          <div className="mt-5 rounded-xl border border-border bg-background/40">
            <button type="button" className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-[15px] font-semibold" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
              <ChevronDown className={`size-4 shrink-0 transition-transform ${aberto ? "" : "-rotate-90"}`} />
              {aberto ? "Esconder o gabarito" : "Ver o gabarito"}
              <span className="ml-auto hidden text-xs font-normal text-muted-foreground sm:inline">espaço</span>
            </button>
            {aberto && (
              <div className="surge border-t border-border px-3 pt-3 pb-3">
                <Md>{atual.gabarito || "Gabarito no módulo."}</Md>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Você acertou?</span>
                  <button
                    type="button"
                    onClick={() => salvar({ ...notas, [atual.chave]: 0 })}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${notas[atual.chave] === 0 ? "border-erro bg-erro-suave text-erro" : "border-border"}`}
                  >
                    <X className="size-4" /> Errei
                  </button>
                  <button
                    type="button"
                    onClick={() => salvar({ ...notas, [atual.chave]: 1 })}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${notas[atual.chave] === 1 ? "border-musgo bg-musgo-suave text-musgo" : "border-border"}`}
                  >
                    <Check className="size-4" /> Acertei
                  </button>
                  <a href={`#/m/${atual.mod}/${atual.cartao + 1}`} className="ml-auto text-sm font-semibold text-primary hover:underline">
                    Abrir no módulo {atual.mod}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <a
              href={ant}
              aria-disabled={!ant}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border font-semibold hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              <ArrowLeft className="size-4" /> Anterior
            </a>
            <a
              href={prox}
              aria-disabled={!prox}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              Próxima <ArrowRight className="size-4" />
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
