import { useEffect, useState } from "react"
import { BookOpen, BookOpenCheck, Brain, Maximize, Menu, Minimize, Moon, Sun, X } from "lucide-react"
import { Deck, LARGURA, type Modo } from "~/components/Deck"
import { Indice } from "~/components/Indice"
import { Md, OFFLINE } from "~/components/Md"
import { Provas } from "~/components/Provas"
import { Referencia } from "~/components/Referencia"
import { Inicio } from "~/components/Inicio"
import { ZoomProvider } from "~/components/Zoom"
import { ONDE, porId } from "~/lib/content"
import { REVISAO } from "~/lib/revisao"
import { useRota } from "~/lib/rota"
import { useSalvo } from "~/lib/storage"
import medidas from "~/content/imagens.json"

// celular: índice numa gaveta
function Gaveta({ fechar, atual }: { fechar: () => void; atual?: string }) {
  return (
    <div className="fixed inset-0 z-40 flex 2xl:hidden" onClick={fechar}>
      <div className="absolute inset-0 bg-black/50" />
      <aside className="relative h-full w-[min(340px,88vw)] overflow-y-auto bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Fechar" className="absolute top-3 right-3 grid size-11 place-items-center" onClick={fechar}>
          <X className="size-5" />
        </button>
        <Indice atual={atual} aoNavegar={fechar} />
      </aside>
    </div>
  )
}

function useTema() {
  const [tema, setTema] = useSalvo<"claro" | "escuro">("tema", matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro")
  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "escuro")
  }, [tema])
  return [tema, () => setTema(tema === "escuro" ? "claro" : "escuro")] as const
}

// tela cheia: só aparece onde o navegador permite (no iPhone e em alguns apps não há)
type DocFs = Document & { webkitFullscreenEnabled?: boolean; webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
type ElFs = HTMLElement & { webkitRequestFullscreen?: () => void }
function useTelaCheia() {
  const d = document as DocFs
  const pode = !!(d.fullscreenEnabled || d.webkitFullscreenEnabled)
  const [cheia, setCheia] = useState(false)
  useEffect(() => {
    const at = () => setCheia(!!(d.fullscreenElement || d.webkitFullscreenElement))
    document.addEventListener("fullscreenchange", at)
    document.addEventListener("webkitfullscreenchange", at)
    return () => {
      document.removeEventListener("fullscreenchange", at)
      document.removeEventListener("webkitfullscreenchange", at)
    }
  }, [d])
  const trocar = () => {
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.())?.catch?.(() => {})
      else {
        const el = document.documentElement as ElFs
        ;(el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch?.(() => {})
      }
    } catch {
      /* recusado: segue sem tela cheia */
    }
  }
  return [pode, cheia, trocar] as const
}

// baixa todas as figuras logo depois de abrir: se a internet cair com o site aberto, elas já estão no cache
function usePreCarregar() {
  useEffect(() => {
    if (OFFLINE) return
    const t = setTimeout(() => {
      for (const nome of Object.keys(medidas)) new Image().src = `img/${nome}`
    }, 2000)
    return () => clearTimeout(t)
  }, [])
}

export default function App() {
  const rota = useRota()
  const [menu, setMenu] = useState(false)
  const [tema, trocarTema] = useTema()
  const [podeCheia, cheia, trocarCheia] = useTelaCheia()
  usePreCarregar()
  const [modo, salvarModo] = useSalvo<Modo>("modo", "treino")

  // #/q/chave → cartão da questão
  useEffect(() => {
    if (rota.pag === "questao") {
      const o = ONDE[rota.chave]
      location.replace(o ? `#/m/${o.mod}/${o.cartao + 1}` : "#/provas")
    }
  }, [rota])

  const mod = rota.pag === "modulo" ? porId(rota.id) : rota.pag === "inicio" ? porId("00") : undefined
  const titulo =
    rota.pag === "provas"
      ? "Todas as questões"
      : rota.pag === "revisao"
        ? "Revisão"
        : mod
          ? mod.id === "00" || mod.corrido
            ? mod.curto
            : `${mod.id}. ${mod.curto}`
          : ""
  const inicio = mod?.id === "00"
  const deck = (mod && !mod.corrido && !inicio) || rota.pag === "revisao"

  return (
    <ZoomProvider>
      {/* computador: índice fixo à esquerda */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 overflow-y-auto border-r border-border bg-background p-5 2xl:block">
        <Indice atual={rota.pag === "revisao" ? "rv" : mod?.id} />
      </aside>

      <div className="2xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className={`mx-auto flex h-16 items-center gap-2 px-2 lg:px-8 ${deck ? LARGURA : "max-w-5xl"}`}>
            <button type="button" aria-label="Abrir índice" className="grid size-11 place-items-center 2xl:hidden" onClick={() => setMenu(true)}>
              <Menu className="size-5" />
            </button>
            <p className="min-w-0 flex-1 truncate text-[17px] font-bold lg:text-xl">{titulo}</p>
            <a href="#/provas" aria-label="Todas as questões" title="Todas as questões" className="hidden size-11 place-items-center min-[430px]:grid 2xl:hidden">
              <BookOpen className="size-5" />
            </a>
            {deck && (
              // seletor de modo: Treino (resoluções escondidas) ou Revisão (tudo aberto); tecla M troca
              <div className="flex rounded-xl bg-muted p-1 text-sm font-bold" role="radiogroup" aria-label="Modo">
                {(
                  [
                    ["treino", "Treino", Brain],
                    ["revisao", "Revisão", BookOpenCheck],
                  ] as const
                ).map(([v, nome, Icone]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={modo === v}
                    title={v === "treino" ? "Resoluções escondidas, reveladas passo a passo (tecla M)" : "Tudo aberto, para reler (tecla M)"}
                    onClick={() => salvarModo(v)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-muted-foreground aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-sm"
                  >
                    <Icone className="size-4" />
                    <span className="hidden sm:inline">{nome}</span>
                  </button>
                ))}
              </div>
            )}
            {podeCheia && (
              <button type="button" aria-label={cheia ? "Sair da tela cheia" : "Tela cheia"} title={cheia ? "Sair da tela cheia" : "Tela cheia"} className="grid size-11 place-items-center" onClick={trocarCheia}>
                {cheia ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
              </button>
            )}
            <button type="button" aria-label="Trocar tema" title="Trocar tema" className="grid size-11 place-items-center" onClick={trocarTema}>
              {tema === "escuro" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>
        </header>
        {menu && <Gaveta fechar={() => setMenu(false)} atual={rota.pag === "revisao" ? "rv" : mod?.id} />}
        <main>
          {inicio && <Inicio />}
          {mod && !mod.corrido && !inicio && <Deck key={mod.id} m={mod} cartao={rota.pag === "modulo" ? rota.cartao : undefined} />}
          {rota.pag === "revisao" && <Deck key="rv" m={REVISAO} cartao={rota.cartao} base="#/revisao" />}
          {mod && mod.id === "12" && <Referencia />}
          {mod && mod.corrido && mod.id !== "12" && (
            <div className="mx-auto max-w-2xl px-4 py-5 pb-20 lg:max-w-4xl lg:px-10 lg:py-8">
              <h1 className="mb-4 text-2xl font-semibold lg:text-3xl">{mod.titulo}</h1>
              <Md>{mod.md}</Md>
            </div>
          )}
          {rota.pag === "provas" && <Provas fonte={rota.fonte} q={rota.q} />}
        </main>
      </div>
    </ZoomProvider>
  )
}
