import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { X } from "lucide-react"

type Abrir = (src: string, alt: string) => void
const Ctx = createContext<Abrir>(() => {})
export const useZoom = () => useContext(Ctx)

// figura em tela cheia: abre ajustada à tela; um toque amplia (com rolagem) e outro volta
export function ZoomProvider({ children }: { children: ReactNode }) {
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null)
  const [grande, setGrande] = useState(false)
  const abrir = useCallback<Abrir>((src, alt) => {
    setGrande(false)
    setImg({ src, alt })
  }, [])
  useEffect(() => {
    if (!img) return
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setImg(null)
    document.addEventListener("keydown", esc)
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", esc)
      document.documentElement.style.overflow = ""
    }
  }, [img])
  return (
    <Ctx.Provider value={abrir}>
      {children}
      {img && (
        <div className="fixed inset-0 z-50 overflow-auto bg-[var(--color-ink)]/92 p-3 pt-16" onClick={(e) => e.target === e.currentTarget && setImg(null)}>
          <button
            type="button"
            onClick={() => setImg(null)}
            className="fixed top-3 right-3 z-50 inline-flex h-11 items-center gap-1 rounded-xl border border-[var(--color-sheet)]/60 px-4 text-sm font-semibold text-[var(--color-sheet)]"
          >
            Fechar <X className="size-4" />
          </button>
          <img
            src={img.src}
            alt={img.alt}
            onClick={() => setGrande(!grande)}
            className={
              grande
                ? "mx-auto w-[max(100%,900px)] max-w-none cursor-zoom-out rounded-lg bg-[var(--color-sheet)] p-2"
                : "mx-auto max-h-[calc(100dvh-9rem)] w-auto max-w-full cursor-zoom-in rounded-lg bg-[var(--color-sheet)] object-contain p-2"
            }
          />
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-[var(--color-sheet)]/80">
            {img.alt && <span className="block">{img.alt}</span>}
            <span className="text-[var(--color-sheet)]/60">toque na figura para {grande ? "ajustar à tela" : "ampliar"}</span>
          </p>
        </div>
      )}
    </Ctx.Provider>
  )
}
