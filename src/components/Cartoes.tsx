import { BookMarked, Check, ChevronDown, Dumbbell, Eye, Footprints, Lightbulb, ListChecks, Target, Trophy, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Md, MdLinha } from "~/components/Md"
import type { Cartao } from "~/lib/content"
import { useSalvo } from "~/lib/storage"

// cor e ícone de cada tipo de cartão
export const TIPO: Record<string, { nome: string; cor: string; Icone: typeof Target }> = {
  questao: { nome: "Questão", cor: "text-sinal bg-sinal-suave", Icone: Target },
  ideia: { nome: "Ideia", cor: "text-musgo bg-musgo-suave", Icone: Lightbulb },
  resolucao: { nome: "Resolução", cor: "text-agua bg-agua-suave", Icone: Footprints },
  treino: { nome: "Treino", cor: "text-ameixa bg-ameixa-suave", Icone: Dumbbell },
  resumo: { nome: "Para levar", cor: "text-siena bg-siena-suave", Icone: Trophy },
  tema: { nome: "Tema", cor: "text-agua bg-agua-suave", Icone: BookMarked },
}

export function Etiqueta({ tipo, extra }: { tipo: string; extra?: string }) {
  const t = TIPO[tipo]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${t.cor}`}>
      <t.Icone className="size-3.5" strokeWidth={2.5} /> {t.nome}
      {extra ? ` ${extra}` : ""}
    </span>
  )
}

// botão: grande no celular (polegar), compacto no computador; só o principal tem cor forte
export function Botao({
  children,
  onClick,
  cor = "verde",
  className = "",
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  cor?: "verde" | "laranja" | "vermelho" | "neutro"
  className?: string
  disabled?: boolean
}) {
  const cores = {
    verde: "bg-sinal text-primary-foreground hover:bg-sinal/90",
    laranja: "bg-sinal text-primary-foreground hover:bg-sinal/90",
    vermelho: "bg-erro text-primary-foreground hover:bg-erro/90",
    neutro: "border border-border bg-transparent text-foreground hover:bg-muted",
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-colors select-none disabled:pointer-events-none disabled:opacity-40 xl:h-10 xl:rounded-lg xl:text-sm [&_svg]:size-5 xl:[&_svg]:size-4 ${cores[cor]} ${className}`}
    >
      {children}
    </button>
  )
}

export function CabecaQuestao({ c }: { c: Cartao }) {
  if (!c.chaves.length) return null
  return (
    <div className="mb-4">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {c.chaves.map((k) => (
          <span key={k} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
            {k}
          </span>
        ))}
      </div>
      {c.tituloQuestao && <h2 className="text-2xl leading-tight font-semibold text-balance first-letter:uppercase xl:text-xl">{c.tituloQuestao}</h2>}
    </div>
  )
}

// enunciado recolhível no topo da resolução (celular e telas médias)
export function EnunciadoRecolhivel({ q }: { q: Cartao }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="mb-5 rounded-xl bg-muted/60 xl:hidden">
      <button type="button" className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm font-bold" onClick={() => setAberto(!aberto)}>
        <ChevronDown className={`size-4 transition-transform ${aberto ? "" : "-rotate-90"}`} /> Rever o enunciado ({q.chaves[0]})
      </button>
      {aberto && (
        <div className="enunciado px-3 pb-3">
          <Md>{q.md}</Md>
        </div>
      )}
    </div>
  )
}

// resolução como trilha: passos numerados ligados por uma linha
export function Passos({ c, abertos, revelar }: { c: Cartao; abertos: number; revelar: (n?: number) => void }) {
  const passos = c.passos || []
  return (
    <div>
      {c.intro && (
        <div className="passos-intro mb-5">
          <Md>{c.intro}</Md>
        </div>
      )}
      <ol className="passos relative ml-4 space-y-7 border-l-2 border-agua/30 pl-7">
        {passos.slice(0, abertos + 1).map((p, i) => {
          const aberto = i < abertos
          return (
            <li key={i} className="relative">
              <span
                className={`absolute top-0 -left-[45px] grid size-8 place-items-center rounded-full text-sm font-bold ${
                  aberto ? "bg-agua text-primary-foreground" : "border-2 border-agua bg-background text-agua"
                }`}
              >
                {i + 1}
              </span>
              <p className="pergunta mb-2 pt-1 leading-snug font-semibold">
                <MdLinha>{p.pergunta}</MdLinha>
              </p>
              {aberto ? (
                <div className="surge">
                  <Md>{p.md}</Md>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-agua/40 p-4">
                  <p className="mb-3 text-sm text-muted-foreground">Pense na resposta deste passo antes de abrir.</p>
                  <Botao cor="laranja" onClick={() => revelar(1)} className="w-full">
                    <Eye /> Mostrar o passo {i + 1}
                  </Botao>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      {abertos < passos.length && (
        <button type="button" className="mt-5 ml-11 text-sm font-semibold text-muted-foreground underline underline-offset-4" onClick={() => revelar(passos.length)}>
          Mostrar todos os passos
        </button>
      )}
    </div>
  )
}

// resposta do treino e marcação de acerto
export function RespostaTreino({ c, ver, revelar }: { c: Cartao; ver: boolean; revelar: (n?: number) => void }) {
  const [notas, salvar] = useSalvo<Record<string, number>>("treino", {})
  const k = c.chaves[0]
  const nota = k ? notas[k] : undefined
  const marcar = (v: number) => k && salvar({ ...notas, [k]: v })
  if (!c.resposta) return null
  if (!ver)
    return (
      <div className="mt-6 rounded-2xl border-2 border-dashed border-ameixa/40 p-5 text-center xl:mt-0">
        <p className="mb-1 text-lg font-bold">Sua vez</p>
        <p className="mb-4 text-muted-foreground">Resolva no papel. Quando terminar, confira a resposta.</p>
        <Botao cor="laranja" onClick={() => revelar(1)} className="w-full sm:w-auto sm:px-8">
          <Eye /> Ver resposta
        </Botao>
      </div>
    )
  return (
    <div className="surge mt-6 xl:mt-0">
      <p className="mb-2 text-sm font-semibold text-ameixa">Resposta</p>
      <div className="resposta enunciado">
        <Md>{c.resposta}</Md>
      </div>
      <div className="mt-6 rounded-2xl bg-muted/60 p-4">
        <p className="mb-3 text-center font-bold">Você acertou?</p>
        <div className="grid grid-cols-2 gap-3">
          <Botao cor={nota === 0 ? "vermelho" : "neutro"} onClick={() => marcar(0)}>
            <X /> Errei
          </Botao>
          <Botao cor={nota === 1 ? "verde" : "neutro"} onClick={() => marcar(1)}>
            <Check /> Acertei
          </Botao>
        </div>
        {nota !== undefined && (
          <div key={nota} className="surge mt-3 flex items-center justify-center gap-2.5">
            <p className="text-[15px] font-semibold">{nota === 1 ? "Isso aí! Mais uma no bolso." : "Tudo bem. Ela fica na lista para refazer."}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ResumoTreino({ cartoes, irPara }: { cartoes: Cartao[]; irPara: (i: number) => void }) {
  const [notas] = useSalvo<Record<string, number>>("treino", {})
  const treinos = cartoes.map((c, i) => ({ c, i })).filter((x) => x.c.tipo === "treino" && x.c.chaves[0])
  if (!treinos.length) return null
  const certas = treinos.filter((x) => notas[x.c.chaves[0]] === 1).length
  const erradas = treinos.filter((x) => notas[x.c.chaves[0]] === 0)
  const faltam = treinos.filter((x) => notas[x.c.chaves[0]] === undefined)
  const lista = (titulo: string, itens: typeof treinos, cor: string) =>
    itens.length > 0 && (
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-muted-foreground">{titulo}</span>
        {itens.map((x) => (
          <button key={x.i} type="button" className={`rounded-lg px-2.5 py-1 font-semibold ${cor}`} onClick={() => irPara(x.i)}>
            {x.c.chaves[0]}
          </button>
        ))}
      </div>
    )
  return (
    <div className="mt-6 rounded-2xl bg-muted/60 p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-bold">
            <ListChecks className="size-5" /> {certas} de {treinos.length} acertadas
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {treinos.length - faltam.length} de {treinos.length} questões respondidas
          </p>
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-musgo" style={{ width: `${(100 * certas) / treinos.length}%` }} />
      </div>
      {lista("Refazer:", erradas, "bg-erro-suave text-erro")}
      {lista("Faltam:", faltam, "bg-background text-foreground")}
    </div>
  )
}
