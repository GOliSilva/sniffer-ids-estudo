import { useCallback, useEffect, useState } from "react"

// progresso salvo no navegador (pode falhar em aba anônima: aí só não salva)
const PREFIXO = "cee3v2-"

function ler<T>(k: string, padrao: T): T {
  try {
    const v = localStorage.getItem(PREFIXO + k)
    return v ? (JSON.parse(v) as T) : padrao
  } catch {
    return padrao
  }
}

function gravar<T>(k: string, v: T) {
  try {
    localStorage.setItem(PREFIXO + k, JSON.stringify(v))
  } catch {
    /* sem armazenamento */
  }
  window.dispatchEvent(new CustomEvent("cee3-salvo", { detail: k }))
}

export function useSalvo<T>(k: string, padrao: T) {
  const [v, setV] = useState<T>(() => ler(k, padrao))
  useEffect(() => {
    setV(ler(k, padrao))
    const ouvir = (e: Event) => {
      if ((e as CustomEvent).detail === k) setV(ler(k, padrao))
    }
    window.addEventListener("cee3-salvo", ouvir)
    return () => window.removeEventListener("cee3-salvo", ouvir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k])
  const salvar = useCallback((novo: T) => gravar(k, novo), [k])
  return [v, salvar] as const
}

export { ler, gravar }
