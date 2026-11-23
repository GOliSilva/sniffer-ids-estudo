import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "katex/dist/katex.min.css"
import "~/styles/globals.css"

// As fontes das fórmulas (KaTeX) e do texto só seriam baixadas quando aparecessem na tela;
// até chegarem, a fórmula é desenhada com outra fonte e muda de largura, empurrando o texto.
// Aqui elas são pedidas logo no início, e a página só aparece com elas prontas (no máximo 1,5 s).
const FONTES = [
  '1em "Geist Variable"',
  "600 1em \"Geist Variable\"",
  "1em KaTeX_Main",
  "bold 1em KaTeX_Main",
  "italic 1em KaTeX_Main",
  "italic 1em KaTeX_Math",
  "1em KaTeX_Size1",
  "1em KaTeX_Size2",
  "1em KaTeX_Size3",
  "1em KaTeX_Size4",
  "1em KaTeX_AMS",
]

const prontas = Promise.all(FONTES.map((f) => document.fonts.load(f).catch(() => null)))
const limite = new Promise((ok) => setTimeout(ok, 1500))

Promise.race([prontas, limite]).then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
