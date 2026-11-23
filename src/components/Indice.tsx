import { CheckCircle2 } from "lucide-react"
import { MODULOS } from "~/lib/content"
import { useSalvo } from "~/lib/storage"

// lista de módulos com progresso: gaveta no celular, barra fixa no computador
export function Indice({ atual, aoNavegar }: { atual?: string; aoNavegar?: () => void }) {
  const [feitos] = useSalvo<string[]>("feitos", [])
  const conta = MODULOS.filter((m) => m.id !== "00" && !m.corrido)
  const n = conta.filter((m) => feitos.includes(m.id)).length
  return (
    <>
      <div className="mb-4">
        <p className="font-semibold">Sniffer IDS: prova final</p>
        <p className="text-xs text-muted-foreground">Introdução às Redes de Comunicação</p>
      </div>
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>PROGRESSO</span>
          <span>
            {n}/{conta.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full origin-left bg-primary transition-transform" style={{ transform: `scaleX(${n / conta.length})` }} />
        </div>
      </div>
      <nav className="space-y-0.5">
        <a
          href="#/revisao"
          onClick={aoNavegar}
          aria-current={atual === "rv" ? "page" : undefined}
          className="block rounded-lg px-3 py-2 font-semibold text-sinal hover:bg-muted aria-[current=page]:bg-muted"
        >
          ↻ Revisão por tema
        </a>
        <a href="#/provas" onClick={aoNavegar} className="block rounded-lg px-3 py-2 hover:bg-muted">
          ★ Todas as questões
        </a>
        <p className="px-3 pt-3 pb-1 text-sm font-semibold text-muted-foreground">Módulos</p>
        {MODULOS.map((m) => (
          <a
            key={m.id}
            href={`#/m/${m.id}`}
            onClick={aoNavegar}
            aria-current={atual === m.id ? "page" : undefined}
            // o item escolhido não muda de peso de fonte (o negrito alargava o texto e às vezes
            // quebrava a linha, fazendo a lista tremer): o destaque é só fundo, cor e a barrinha
            className="relative flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-1.5 aria-[current=page]:before:left-0 aria-[current=page]:before:w-1 aria-[current=page]:before:rounded-full aria-[current=page]:before:bg-emerald-500"
          >
            <span className="w-6 font-mono text-xs text-muted-foreground">{m.corrido ? "∑" : m.id}</span>
            <span className="flex-1 leading-snug">{m.curto}</span>
            {feitos.includes(m.id) && <CheckCircle2 className="size-4 shrink-0 text-musgo" />}
          </a>
        ))}
      </nav>
    </>
  )
}
