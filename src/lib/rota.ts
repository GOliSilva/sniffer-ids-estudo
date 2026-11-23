import { useEffect, useState } from "react"

// rotas por hash (o site é publicado como arquivo estático):
//   #/                 início (roteiro)
//   #/m/03             módulo 03 (cartão salvo)
//   #/m/03/5           módulo 03, cartão 5
//   #/q/Lista 4 Q2     cartão da questão
//   #/provas/treino-m04/2   questão 2 de uma fonte (página de questões)
//   #/revisao          revisão (cartão salvo)
//   #/revisao/7        revisão, cartão 7
export type Rota =
  | { pag: "inicio" }
  | { pag: "modulo"; id: string; cartao?: number }
  | { pag: "questao"; chave: string }
  | { pag: "provas"; fonte?: string; q?: number }
  | { pag: "revisao"; cartao?: number }

export function lerRota(hash: string): Rota {
  const h = decodeURIComponent(hash.replace(/^#\/?/, ""))
  const p = h.split("/")
  if (p[0] === "m" && /^\d\d$/.test(p[1] || "")) return { pag: "modulo", id: p[1], cartao: p[2] ? Math.max(0, +p[2] - 1) : undefined }
  if (p[0] === "q" && p[1]) return { pag: "questao", chave: p.slice(1).join("/") }
  if (p[0] === "provas") return { pag: "provas", fonte: p[1], q: p[2] ? Math.max(0, +p[2] - 1) : undefined }
  if (p[0] === "revisao") return { pag: "revisao", cartao: p[1] ? Math.max(0, +p[1] - 1) : undefined }
  return { pag: "inicio" }
}

export function useRota() {
  const [rota, setRota] = useState(() => lerRota(location.hash))
  useEffect(() => {
    const f = () => setRota(lerRota(location.hash))
    window.addEventListener("hashchange", f)
    return () => window.removeEventListener("hashchange", f)
  }, [])
  return rota
}

export const ir = (h: string) => {
  location.hash = h
}

// troca o hash sem disparar navegação (posição do cartão)
export const marcar = (h: string) => {
  if (location.hash !== h) history.replaceState(null, "", h)
}
