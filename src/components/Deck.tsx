import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Eye, FileText, Play, X } from "lucide-react"
import { Botao, CabecaQuestao, EnunciadoRecolhivel, Etiqueta, Passos, RespostaTreino, ResumoTreino, TIPO } from "~/components/Cartoes"
import { Md, OFFLINE } from "~/components/Md"
import { MODULOS, type Cartao, type Modulo } from "~/lib/content"
import { marcar } from "~/lib/rota"
import { gravar, ler, useSalvo } from "~/lib/storage"
import medidas from "~/content/imagens.json"

export type Modo = "treino" | "revisao"

// largura do conteúdo: a mesma em todos os cartões (só muda com o tamanho da tela), para nada tremer
export const LARGURA = "max-w-3xl xl:max-w-[1320px] 2xl:max-w-[1440px]"

// figuras (linhas "![...](img/...)") separadas do texto, para o computador pôr lado a lado
const RE_FIG = /^!\[[^\]]*\]\(img\/[^)]+\)\s*$/gm
const separar = (md: string) => ({ figs: md.match(RE_FIG) || [], texto: md.replace(RE_FIG, "").replace(/\n{3,}/g, "\n\n").trim() })

// figura bem mais larga que alta (gráfico ou esquema horizontal): na tela larga ganha a coluna maior
const MEDIDAS: Record<string, number[]> = medidas
const larga = (fig: string) => {
  const [w, h] = MEDIDAS[fig.match(/\(img\/([^)]+)\)/)?.[1] || ""] || []
  return !!w && w / h > 1.45
}

// painel lateral (tela larga): fundo sutil, fica parado enquanto o resto rola
const PAINEL = "xl:sticky xl:top-20 xl:max-h-[calc(100vh-10rem)] xl:self-start xl:overflow-y-auto xl:rounded-xl xl:bg-muted/50 xl:p-6"
const DUAS = "xl:grid xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:gap-10 2xl:gap-14"
const DUAS_FIG = "xl:grid xl:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] xl:gap-10 2xl:gap-14"

// um módulo = sequência de cartões, um por tela. A revisão usa o mesmo deck, com base "#/revisao".
export function Deck({ m, cartao, base = `#/m/${m.id}` }: { m: Modulo; cartao?: number; base?: string }) {
  const total = m.cartoes.length
  const i = Math.min(total - 1, Math.max(0, cartao ?? ler<number>("cartao-" + m.id, 0)))
  const [feitos, salvarFeitos] = useSalvo<string[]>("feitos", [])
  const [notas, salvarNotas] = useSalvo<Record<string, number>>("treino", {})
  const [modo, salvarModo] = useSalvo<Modo>("modo", "treino")
  const [gaveta, setGaveta] = useState(false)
  const idx = MODULOS.indexOf(m)
  const naLista = idx >= 0 // fora da lista: a revisão, que termina no formulário
  const ant = naLista ? MODULOS[idx - 1] : undefined
  const prox = naLista ? MODULOS[idx + 1] : MODULOS.find((x) => x.corrido)
  const nomeProx = prox ? (prox.corrido ? prox.curto : `Módulo ${prox.id}`) : "Todas as questões"
  const c = m.cartoes[i]
  const nIdeia = m.cartoes.slice(0, i + 1).filter((x) => x.tipo === "ideia").length
  // temas (revisão): a barra de progresso vira um trecho por tema, e o cartão de tema mostra "Tema 3/12"
  const inicios = m.cartoes.flatMap((x, k) => (x.tipo === "tema" ? [k] : []))
  const nTema = inicios.filter((k) => k <= i).length
  const questao = m.cartoes.find((x) => x.tipo === "questao")
  // o botão "Questão do módulo" só aparece onde o enunciado não está na tela
  const temBotaoQuestao = !!questao && (c.tipo === "ideia" || c.tipo === "resumo")

  // quanto do cartão atual está revelado (passos da resolução, ou a resposta do treino)
  const escondivel = c.tipo === "resolucao" ? (c.passos || []).length : c.tipo === "treino" && c.resposta ? 1 : 0
  // A contagem fica presa ao cartão (e ao modo): num cartão novo ela já nasce no valor inicial,
  // no mesmo desenho. Zerar num useEffect deixava o gabarito do cartão anterior aparecer por um instante.
  // cada visita a um cartão conta como nova: voltar a ele recomeça com tudo escondido
  const visita = useRef({ i, n: 0 })
  if (visita.current.i !== i) visita.current = { i, n: visita.current.n + 1 }
  const chaveCartao = `${m.id}-${i}-${modo}-${visita.current.n}`
  const inicial = modo === "revisao" ? escondivel : 0
  const [rev, setRev] = useState({ k: chaveCartao, n: inicial })
  const abertos = rev.k === chaveCartao ? rev.n : inicial
  const faltam = Math.max(0, escondivel - abertos)
  const revelar = (n = 1) => setRev((r) => ({ k: chaveCartao, n: Math.min(escondivel, (r.k === chaveCartao ? r.n : inicial) + n) }))

  // baixa já as figuras de todos os cartões do módulo: ao passar de cartão elas estão prontas
  useEffect(() => {
    if (OFFLINE) return
    const srcs = new Set<string>()
    for (const c of m.cartoes)
      for (const t of [c.md, c.intro, c.resposta, ...(c.passos || []).map((p) => p.md)])
        for (const x of (t || "").matchAll(/\]\((img\/[^)\s]+)\)/g)) srcs.add(x[1])
    srcs.forEach((s) => {
      const im = new Image()
      im.src = s
    })
  }, [m])

  useEffect(() => {
    gravar("cartao-" + m.id, i)
    marcar(`${base}/${i + 1}`)
    window.scrollTo(0, 0)
    setGaveta(false)
  }, [m.id, base, i])

  const irPara = (k: number) => {
    if (k < 0) location.hash = ant ? `#/m/${ant.id}` : "#/"
    else if (k >= total) location.hash = prox ? `#/m/${prox.id}/1` : "#/provas"
    else location.hash = `${base}/${k + 1}`
  }
  const avancar = () => (faltam > 0 ? revelar(1) : irPara(i + 1))
  const notar = (v: number) => {
    const k = c.chaves[0]
    if (c.tipo === "treino" && k && faltam === 0) salvarNotas({ ...notas, [k]: v })
  }

  // teclado no estilo Anki: Espaço revela (ou avança), Shift+Espaço revela tudo, 1/2 errei/acertei,
  // ← → cartões, M troca o modo, E mostra a questão do módulo
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || document.documentElement.style.overflow === "hidden") return
      const alvo = document.activeElement as HTMLElement | null
      if (alvo && /INPUT|TEXTAREA|SELECT/.test(alvo.tagName)) return
      if (e.key === "Escape") return setGaveta(false)
      if (e.key === " ") {
        e.preventDefault()
        alvo?.blur() // senão o Espaço também "clica" no último botão clicado
        if (e.shiftKey) revelar(escondivel)
        else avancar()
      } else if (e.key === "ArrowRight") irPara(i + 1)
      else if (e.key === "ArrowLeft") irPara(i - 1)
      else if (e.key === "1") notar(0)
      else if (e.key === "2") notar(1)
      else if (e.key === "m" || e.key === "M") salvarModo(modo === "treino" ? "revisao" : "treino")
      else if ((e.key === "e" || e.key === "E") && temBotaoQuestao) setGaveta((g) => !g)
    }
    document.addEventListener("keydown", tecla)
    return () => document.removeEventListener("keydown", tecla)
  })

  const feito = feitos.includes(m.id)
  const ultimo = i === total - 1
  const ideias = m.cartoes.filter((x) => x.tipo === "ideia")

  // de que lado o cartão novo entra: da direita ao avançar, da esquerda ao voltar
  const anterior = useRef<number | null>(null)
  const entrada = anterior.current === null || anterior.current === i ? "" : i > anterior.current ? "entra-dir" : "entra-esq"
  useEffect(() => {
    anterior.current = i
  }, [i])

  // ao revelar um passo ou a resposta, rola até ele se tiver ficado atrás da barra de baixo
  const ultimoRevelado = useRef(abertos)
  useEffect(() => {
    if (abertos > ultimoRevelado.current) {
      const novos = document.querySelectorAll("article .surge")
      const el = novos[novos.length - 1]
      if (el) {
        const fundo = el.getBoundingClientRect().bottom
        const limite = window.innerHeight - 110
        if (fundo > limite) window.scrollBy({ top: Math.min(fundo - limite, el.getBoundingClientRect().top - 90), behavior: "smooth" })
      }
    }
    ultimoRevelado.current = abertos
  }, [abertos, chaveCartao])

  // celular: o cartão acompanha o dedo; soltando depois de ~70 px, ele sai e o próximo entra
  const cartaoRef = useRef<HTMLElement>(null)
  const toque = useRef<{ x: number; y: number; lado?: boolean } | null>(null)
  const arrastar = {
    onTouchStart: (e: React.TouchEvent) => {
      const alvo = e.target as HTMLElement
      toque.current = alvo.closest(".katex-display, .tabela") ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY }
    },
    onTouchMove: (e: React.TouchEvent) => {
      const t = toque.current
      const el = cartaoRef.current
      if (!t || !el) return
      const dx = e.touches[0].clientX - t.x
      const dy = e.touches[0].clientY - t.y
      if (t.lado === undefined) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) t.lado = true
        else if (Math.abs(dy) > 10) t.lado = false
      }
      if (t.lado) {
        el.style.transition = "none"
        el.style.transform = `translateX(${dx}px)`
        el.style.opacity = String(1 - Math.min(0.5, Math.abs(dx) / 700))
      }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const t = toque.current
      const el = cartaoRef.current
      toque.current = null
      if (!t || !t.lado || !el) return
      const dx = e.changedTouches[0].clientX - t.x
      const destino = dx < 0 ? i + 1 : i - 1
      const pode = Math.abs(dx) > 70 && (destino >= 0 || !!ant)
      el.style.transition = "transform 150ms ease-out, opacity 150ms ease-out"
      if (pode) {
        el.style.transform = `translateX(${dx < 0 ? "-" : ""}${el.offsetWidth}px)`
        el.style.opacity = "0"
        setTimeout(() => irPara(destino), 140)
      } else {
        el.style.transform = ""
        el.style.opacity = ""
      }
    },
  }

  return (
    <div
      className={`mx-auto w-full px-4 pt-4 pb-36 lg:px-8 xl:pt-4 xl:pb-24 ${LARGURA}`}
    >
      {/* progresso do módulo */}
      <div className="mb-4 flex items-center gap-3 xl:mb-3">
        {inicios.length > 0 ? (
          <BarraTemas cartoes={m.cartoes} inicios={inicios} i={i} notas={notas} irPara={irPara} />
        ) : (
        <div className="flex flex-1 gap-1" aria-label="Cartões">
          {m.cartoes.map((x, k) => {
            const n = x.chaves[0] ? notas[x.chaves[0]] : undefined
            return (
              <button
                key={k}
                type="button"
                title={`${k + 1}. ${TIPO[x.tipo].nome}${x.tipo === "ideia" ? ": " + x.titulo : x.chaves[0] ? ": " + x.chaves[0] : ""}`}
                aria-label={`Cartão ${k + 1}`}
                aria-current={k === i}
                onClick={() => irPara(k)}
                className={`h-2.5 flex-1 rounded-full transition-colors xl:h-1.5 ${
                  k === i ? "bg-sinal" : n === 1 ? "bg-musgo" : n === 0 ? "bg-erro/70" : k < i ? "bg-musgo/70" : "bg-muted"
                }`}
              />
            )
          })}
        </div>
        )}
        <span className="shrink-0 font-mono text-xs font-semibold text-muted-foreground">
          {i + 1}/{total}
        </span>
      </div>

      {/* palco: só o cartão desliza; o que sai pelos lados é cortado, sem rolagem lateral */}
      <div className="palco" {...arrastar}>
      <article key={`${m.id}-${i}`} ref={cartaoRef} className={`${entrada} ${c.tipo === "ideia" || c.tipo === "tema" ? "xl:flex xl:min-h-[calc(100dvh-13.5rem)] xl:flex-col" : ""}`}>
      {/* cabeçalho do cartão: tipo, título e atalho para a questão */}
        <div className="mb-4 flex items-center gap-3 xl:mb-2">
          <Etiqueta
            tipo={c.tipo}
            extra={c.tipo === "ideia" && naLista ? String(nIdeia) : c.tipo === "tema" ? `${nTema} de ${inicios.length}` : undefined}
          />
          {!naLista && nTema > 0 && c.tipo !== "tema" && c.tipo !== "resumo" && (
            <span className="min-w-0 truncate text-sm font-semibold text-muted-foreground">{m.cartoes[inicios[nTema - 1]].titulo}</span>
          )}
          {temBotaoQuestao && (
            <button
              type="button"
              onClick={() => setGaveta(true)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FileText className="size-4" /> Questão do módulo <kbd className="hidden rounded border border-border px-1 font-mono text-[10px] xl:inline">E</kbd>
            </button>
          )}
        </div>
        <Conteudo c={c} questao={questao} ideias={ideias} abertos={abertos} revelar={revelar} irPara={irPara} i={i} />
        {ultimo && (
          <div className="xl:max-w-3xl">
            <ResumoTreino cartoes={m.cartoes} irPara={irPara} />
            {m.id !== "00" && naLista && (
              <Botao
                cor={feito ? "verde" : "neutro"}
                className="mt-5 w-full xl:w-auto xl:px-6"
                onClick={() => salvarFeitos(feito ? feitos.filter((x) => x !== m.id) : [...feitos, m.id])}
              >
                {feito ? <CheckCircle2 /> : <Circle />} {feito ? "Módulo concluído" : "Concluir módulo"}
              </Botao>
            )}
          </div>
        )}
      </article>
      </div>

      {/* gaveta com a questão do módulo */}
      {gaveta && questao && (
        <div className="fixed inset-0 z-40" onClick={() => setGaveta(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="absolute inset-y-0 right-0 w-[min(520px,92vw)] overflow-y-auto bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" aria-label="Fechar" className="absolute top-3 right-3 grid size-10 place-items-center rounded-lg hover:bg-muted" onClick={() => setGaveta(false)}>
              <X className="size-5" />
            </button>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Questão do módulo</p>
            <CabecaQuestao c={questao} />
            <Md>{questao.md}</Md>
          </aside>
        </div>
      )}

      {/* navegação: fixa embaixo; o botão principal revela enquanto houver algo escondido */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:px-8 xl:py-2 2xl:left-72">
        <div className={`mx-auto flex items-center gap-3 ${LARGURA}`}>
          <Botao cor="neutro" className="flex-1 xl:w-44 xl:flex-none" onClick={() => irPara(i - 1)} disabled={i === 0 && !ant}>
            <ArrowLeft /> {i === 0 ? (ant ? `Módulo ${ant.id}` : "Início") : "Voltar"}
          </Botao>
          <p className="hidden flex-1 justify-center gap-x-5 text-xs text-muted-foreground xl:flex">
            <span><b>Espaço</b> revela</span><span><b>← →</b> cartões</span><span><b>1</b> e <b>2</b> errei, acertei</span><span><b>M</b> modo</span>{temBotaoQuestao && <span><b>E</b> questão</span>}
          </p>
          {faltam > 0 ? (
            <Botao cor="laranja" className="flex-[1.5] xl:w-56 xl:flex-none" onClick={() => revelar(1)}>
              <Eye /> {c.tipo === "treino" ? "Ver resposta" : `Mostrar passo ${abertos + 1}`}
            </Botao>
          ) : (
            <Botao cor="verde" className="flex-[1.5] xl:w-56 xl:flex-none" onClick={() => irPara(i + 1)}>
              {ultimo ? nomeProx : "Continuar"} <ArrowRight />
            </Botao>
          )}
        </div>
      </nav>
    </div>
  )
}

// progresso por tema: um trecho por tema, que enche conforme as questões dele são feitas.
// Verde: todas acertadas; vermelho: alguma errada; toque leva ao começo do tema.
function BarraTemas({
  cartoes,
  inicios,
  i,
  notas,
  irPara,
}: {
  cartoes: Cartao[]
  inicios: number[]
  i: number
  notas: Record<string, number>
  irPara: (k: number) => void
}) {
  return (
    <div className="flex flex-1 gap-1" aria-label="Temas">
      {inicios.map((ini, t) => {
        const fimT = t + 1 < inicios.length ? inicios[t + 1] : cartoes.length
        const qs = cartoes.slice(ini, fimT).filter((x) => x.tipo === "treino" && x.chaves[0])
        const ns = qs.map((x) => notas[x.chaves[0]])
        const feitas = ns.filter((n) => n !== undefined).length
        const aqui = i >= ini && i < fimT
        const cor = ns.includes(0) ? "bg-erro/70" : feitas === qs.length && qs.length ? "bg-musgo/70" : "bg-musgo/45"
        return (
          <button
            key={ini}
            type="button"
            title={`${t + 1}. ${cartoes[ini].titulo} (${feitas} de ${qs.length} feitas)`}
            aria-label={`Tema ${t + 1}: ${cartoes[ini].titulo}`}
            aria-current={aqui}
            onClick={() => irPara(ini)}
            className={`relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted xl:h-1.5 ${aqui ? "ring-2 ring-sinal ring-offset-1 ring-offset-background" : ""}`}
          >
            <span className={`absolute inset-y-0 left-0 ${cor}`} style={{ width: `${qs.length ? (100 * feitas) / qs.length : 0}%` }} />
          </button>
        )
      })}
    </div>
  )
}

function Conteudo({
  c,
  questao,
  ideias,
  abertos,
  revelar,
  irPara,
  i,
}: {
  c: Cartao
  questao?: Cartao
  ideias: Cartao[]
  abertos: number
  revelar: (n?: number) => void
  irPara: (k: number) => void
  i: number
}) {
  if (c.tipo === "questao")
    return (
      <div className={DUAS}>
        <div className="enunciado">
          <CabecaQuestao c={c} />
          <Md>{c.md}</Md>
        </div>
        {ideias.length > 0 && (
          <div className={`mt-6 xl:mt-0 ${PAINEL}`}>
            <p className="mb-1 font-bold">Tente resolver no papel.</p>
            <p className="mb-4 text-sm text-muted-foreground">Você já viu tudo o que precisa nos cartões anteriores:</p>
            <ol className="mb-5 space-y-1.5">
              {ideias.map((x, k) => (
                <li key={k} className="flex items-center gap-3 text-[15px] font-medium">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-musgo-suave text-xs font-semibold text-musgo">
                    {k + 1}
                  </span>
                  {x.titulo}
                </li>
              ))}
            </ol>
            <Botao cor="verde" className="hidden xl:inline-flex" onClick={() => irPara(i + 1)}>
              <Play /> Ver a resolução
            </Botao>
          </div>
        )}
      </div>
    )

  if (c.tipo === "ideia" || c.tipo === "tema") {
    const { figs, texto } = separar(c.md)
    return (
      // tela larga: título e corpo formam um bloco centralizado na altura que sobra, como num slide
      <div className="xl:flex xl:flex-1 xl:flex-col xl:justify-center">
        <h2 className="mb-5 text-[26px] leading-tight font-semibold tracking-tight text-balance xl:mb-6 xl:text-[32px] 2xl:text-[34px]">{c.titulo}</h2>
        {/* celular e tela média: figura no meio do texto, como escrito */}
        <div className="xl:hidden">
          <Md>{c.md}</Md>
        </div>
        {/* tela larga: figura fixa à esquerda (enquanto o texto rola, ela continua à vista) e explicação à direita.
            Figura horizontal ganha a coluna maior; figura alta, a menor. */}
        <div className="hidden xl:block">
        <div className={figs.length ? (figs.length === 1 && larga(figs[0]) ? DUAS_FIG : DUAS) : ""}>
          {figs.length > 0 && (
            <div className={`xl:sticky xl:top-20 xl:self-start ideia-figs ${figs.length > 1 ? "varias" : ""}`}>
              <Md>{figs.join("\n\n")}</Md>
            </div>
          )}
          <div className="min-w-0">
            <Md>{texto}</Md>
          </div>
        </div>
        </div>
      </div>
    )
  }

  if (c.tipo === "resolucao")
    return (
      <div className={DUAS}>
        {questao && (
          <div className={`enunciado hidden xl:block ${PAINEL}`}>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Enunciado</p>
            <CabecaQuestao c={questao} />
            <Md>{questao.md}</Md>
          </div>
        )}
        <div>
          {questao && <EnunciadoRecolhivel q={questao} />}
          <Passos c={c} abertos={abertos} revelar={revelar} />
        </div>
      </div>
    )

  if (c.tipo === "treino")
    return (
      <div className={DUAS}>
        <div className={`enunciado ${PAINEL}`}>
          <CabecaQuestao c={c} />
          <Md>{c.md}</Md>
        </div>
        <div>
          <RespostaTreino c={c} ver={abertos > 0} revelar={revelar} />
        </div>
      </div>
    )

  return (
    // "Para levar" usa a largura toda da tela (os cartões se distribuem em colunas); os demais ficam numa coluna de leitura
    <div className={c.tipo === "resumo" ? "resumo" : "xl:max-w-3xl"}>
      <Md>{c.md}</Md>
    </div>
  )
}
