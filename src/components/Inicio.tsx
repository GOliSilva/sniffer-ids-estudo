import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code,
  Crosshair,
  Download,
  FileSearch,
  FlaskConical,
  Keyboard,
  Layers,
  ListChecks,
  Save,
  Search,
  Tag,
} from "lucide-react"
import { Copiar } from "~/components/Referencia"
import { CURTOS, MODULOS } from "~/lib/content"
import { useSalvo } from "~/lib/storage"

// Página de início (o antigo roteiro): o primeiro contato do aluno com o site.
// Ordem: o que é a prova e por onde começar; o trabalho na prova; a trilha de estudo com o
// progresso; a pasta de treino; como usar o site.

const PASSOS = [
  { Icone: Search, titulo: "Achar", texto: "a diferença em relação à linha de base, no Wireshark e no sensor" },
  { Icone: Code, titulo: "Escrever", texto: "uma regra no regras.py: recebe o ev e devolve True no problema" },
  { Icone: Crosshair, titulo: "Conferir", texto: "que a regra dispara só no caso dela, nunca na linha de base" },
  { Icone: Tag, titulo: "Classificar", texto: "falha de comunicação, fora da política ou diferente, mas permitido" },
  { Icone: FileSearch, titulo: "Provar", texto: "com o quadro, o campo e o valor que mostram o problema" },
]

const RECEBE = [
  ["linha_de_base.pcap", "a planta normal"],
  ["caso_01 a caso_10.pcap", "uma diferença em cada"],
  ["sensor.py e protocolos.py", "o sensor pronto"],
  ["regras.py", "com a lista REGRAS vazia"],
]

type Etapa = { titulo: string; nota?: string; destaque?: boolean; itens: { id: string; href: string; desc: string }[] }

const TRILHA: Etapa[] = [
  {
    titulo: "Base",
    itens: [
      { id: "01", href: "#/m/01", desc: "o que é normal: inventário, ritmo, mapa e as três classes" },
      { id: "02", href: "#/m/02", desc: "do pacote ao ev, e o que nunca vira ev" },
    ],
  },
  {
    titulo: "O ev campo a campo",
    nota: "o centro do site",
    destaque: true,
    itens: [
      { id: "03", href: "#/m/03", desc: "quem fala, quando e em que sentido" },
      { id: "04", href: "#/m/04", desc: "função, área, endereço, quantidade e valores" },
      { id: "05", href: "#/m/05", desc: "cabeçalho, erro, transação e tempo de resposta" },
    ],
  },
  {
    titulo: "Método",
    itens: [
      { id: "06", href: "#/m/06", desc: "regras precisas, regras com memória e o conferir.py" },
      { id: "07", href: "#/m/07", desc: "os seis passos no Wireshark e como classificar" },
    ],
  },
  {
    titulo: "Casos",
    itens: [
      { id: "08", href: "#/m/08", desc: "casos 1 a 5 da aula, resolvidos, com a regra de cada um" },
      { id: "09", href: "#/m/09", desc: "casos 6 a 10 da aula, resolvidos" },
      { id: "10", href: "#/m/10", desc: "TCP e IP perfeitos, só a mensagem errada" },
    ],
  },
  {
    titulo: "Treinar",
    itens: [
      { id: "11", href: "#/m/11", desc: "10 capturas novas no formato da prova, com gabarito" },
      { id: "q", href: "#/provas", desc: "todas as questões do site, uma por vez" },
      { id: "12", href: "#/m/12", desc: "as 22 propriedades e as condições prontas" },
    ],
  },
]

const PASTA = [
  ["captura.py, protocolos.py, sensor.py", "o sensor da prova"],
  ["regras.py", "onde você escreve as regras"],
  ["conferir.py", "roda as regras em todas as capturas"],
  ["capturas/", "linha de base e casos do simulado"],
  ["capturas_aula/", "linha de base e casos da aula"],
]

const PREPARO = [
  ["Criar o ambiente", "python -m venv .venv"],
  ["Ativar o ambiente", ".venv\\Scripts\\activate"],
  ["Instalar o Scapy", "pip install scapy"],
  ["Ver os ev de uma captura", "python sensor.py --arquivo capturas\\caso_01.pcap"],
  ["Conferir as suas regras", "python conferir.py"],
]

const CORES: [string, string][] = [
  ["Modbus", "var(--c-modbus)"],
  ["S7", "var(--c-s7)"],
  ["TCP e IP", "var(--c-rede)"],
  ["o ev e as regras", "var(--c-codigo)"],
  ["fora da política", "var(--c-ataque)"],
  ["falha", "var(--c-falha)"],
  ["permitido", "var(--c-permitido)"],
]

const nome = (id: string) => (id === "q" ? "Todas as questões" : CURTOS[id])
const cartoes = (id: string) => MODULOS.find((m) => m.id === id)?.cartoes.length

function Secao({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 sm:mt-16">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{titulo}</h2>
      {sub && <p className="mt-1 max-w-2xl text-[15px] text-muted-foreground">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[0.9em] font-semibold">{children}</span>
}

export function Inicio() {
  const [feitos] = useSalvo<string[]>("feitos", [])
  const [aberto, setAberto] = useSalvo<boolean>("inicio-preparo", false)
  const contaveis = MODULOS.filter((m) => m.id !== "00" && !m.corrido)
  const n = contaveis.filter((m) => feitos.includes(m.id)).length
  const proximo = contaveis.find((m) => !feitos.includes(m.id))
  const comecou = n > 0

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-24 sm:pt-10 lg:px-10">
      {/* ---------------------------------------------------------------- abertura */}
      <header className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-wide text-primary">Introdução às Redes de Comunicação · Prova final</p>
        <h1 className="mt-3 max-w-3xl text-[28px] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          Detectar ataques numa rede industrial com o sensor em Python
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          Na prova você recebe a linha de base e 10 capturas. Para cada uma, escreve no <Mono>regras.py</Mono> uma regra que dispara só nela, diz o que aconteceu
          e prova com o quadro do Wireshark.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={proximo ? `#/m/${proximo.id}` : "#/m/11"}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            {comecou ? "Continuar" : "Começar"}: {proximo ? `módulo ${proximo.id}` : "simulado"} <ArrowRight className="size-4" />
          </a>
          <a
            href="downloads/simulado_sniffer.zip"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 font-semibold hover:bg-muted"
          >
            <Download className="size-4" /> Baixar a pasta de treino
          </a>
          <a href="#/m/11" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
            <FlaskConical className="size-4" /> Ir para o simulado
          </a>
        </div>

        <div className="mt-7 max-w-md">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Seu progresso</span>
            <span className="font-semibold">
              {n} de {contaveis.length} módulos
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-musgo transition-[width]" style={{ width: `${(100 * n) / contaveis.length}%` }} />
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- a prova */}
      <Secao titulo="O que você faz na prova" sub="Os mesmos cinco passos, para cada uma das 10 capturas.">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PASSOS.map(({ Icone, titulo, texto }, k) => (
            <li key={titulo} className="flex gap-3 rounded-2xl border border-border bg-card p-4 sm:block">
              <div className="flex shrink-0 items-center gap-2.5 self-start">
                <span className="grid size-9 place-items-center rounded-xl bg-sinal-suave text-primary">
                  <Icone className="size-[18px]" />
                </span>
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{k + 1}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold sm:mt-3">
                  <span className="mr-1.5 font-mono text-xs text-muted-foreground sm:hidden">{k + 1}</span>
                  {titulo}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground sm:mt-1">{texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="rounded-2xl border border-border p-4">
            <p className="mb-3 text-sm font-semibold">O que chega no computador</p>
            <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {RECEBE.map(([arq, o]) => (
                <li key={arq} className="text-sm">
                  <Mono>{arq}</Mono>
                  <span className="block text-muted-foreground">{o}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-sinal-suave p-4 text-sm leading-relaxed">
            <p className="font-semibold text-primary">Por que treinar o método</p>
            <p className="mt-1">Alguns casos da prova repetem os tipos da aula; outros são novos. Decorar respostas não basta: o site treina como achar e provar.</p>
          </div>
        </div>
      </Secao>

      {/* ---------------------------------------------------------------- trilha */}
      <Secao titulo="Trilha de estudo" sub="Na ordem. Cada módulo é uma sequência curta de cartões, com questões no fim. Marque como concluído e o progresso fica salvo neste navegador.">
        <div className="space-y-6">
          {TRILHA.map((etapa, e) => (
            <div key={etapa.titulo} className="lg:grid lg:grid-cols-[11rem_1fr] lg:gap-6">
              <div className="mb-2.5 flex items-baseline gap-2 lg:mb-0 lg:block lg:pt-3">
                <p className="text-sm font-semibold">
                  <span className="mr-1.5 font-mono text-muted-foreground">{e + 1}</span>
                  {etapa.titulo}
                </p>
                {etapa.nota && <p className="text-xs font-semibold text-primary">{etapa.nota}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {etapa.itens.map((it) => {
                  const feito = feitos.includes(it.id)
                  const n = cartoes(it.id)
                  return (
                    <a
                      key={it.id}
                      href={it.href}
                      className={`group flex flex-col rounded-2xl border bg-card p-4 transition-colors hover:border-primary ${etapa.destaque ? "border-primary/40" : "border-border"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                          {it.id === "q" ? "★" : it.id === "12" ? "ref" : it.id}
                        </span>
                        {feito && <CheckCircle2 className="size-4 text-musgo" aria-label="concluído" />}
                        <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                      <p className="mt-2.5 leading-snug font-semibold">{nome(it.id)}</p>
                      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
                      {n && it.id !== "12" ? <p className="mt-3 text-xs text-muted-foreground">{n} cartões</p> : null}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Secao>

      {/* ---------------------------------------------------------------- pasta de treino */}
      <Secao titulo="Pasta de treino" sub="O sensor da prova, o regras.py vazio, o checador e as capturas do simulado e da aula.">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <a
                href="downloads/simulado_sniffer.zip"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90"
              >
                <Download className="size-4" /> simulado_sniffer.zip
              </a>
              <ul className="mt-5 divide-y divide-border">
                {PASTA.map(([arq, o]) => (
                  <li key={arq} className="flex flex-col py-2 text-sm sm:flex-row sm:gap-3">
                    <span className="sm:w-56 sm:shrink-0">
                      <Mono>{arq}</Mono>
                    </span>
                    <span className="text-muted-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <button
                type="button"
                aria-expanded={aberto}
                onClick={() => setAberto(!aberto)}
                className="flex w-full items-center gap-2 text-left font-semibold lg:pointer-events-none"
              >
                <ChevronDown className={`size-4 transition-transform lg:hidden ${aberto ? "" : "-rotate-90"}`} />
                Preparar e rodar
                <span className="ml-auto text-xs font-normal text-muted-foreground">no terminal, dentro da pasta</span>
              </button>
              <ol className={`mt-3 space-y-2.5 ${aberto ? "" : "hidden lg:block"}`}>
                {PREPARO.map(([o, cmd], k) => (
                  <li key={cmd} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted font-mono text-xs font-semibold">{k + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">{o}</p>
                      <div className="flex items-center gap-1">
                        <code className="min-w-0 flex-1 font-mono text-[13.5px] font-semibold break-words">{cmd}</code>
                        <Copiar texto={cmd} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <p className={`mt-3 text-xs leading-relaxed text-muted-foreground ${aberto ? "" : "hidden lg:block"}`}>
                Os passos 1 a 3 são uma vez só. Se o PowerShell recusar o passo 2, rode antes{" "}
                <span className="font-mono">Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</span> (vale só para aquele terminal).
              </p>
            </div>
          </div>
        </div>
      </Secao>

      {/* ---------------------------------------------------------------- como usar */}
      <Secao titulo="Como usar o site">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icone: Layers, t: "Cartões", d: "Passe com os botões, deslizando para o lado ou com as setas do teclado." },
            { Icone: BookOpen, t: "Treino e Revisão", d: "No topo: Treino esconde as respostas, Revisão deixa tudo aberto. Tecla M troca." },
            { Icone: ListChecks, t: "Questões", d: "Abra a resposta só depois de tentar, e marque se acertou." },
            { Icone: Save, t: "Progresso salvo", d: "Módulos concluídos, notas e o último cartão ficam neste navegador." },
          ].map(({ Icone, t, d }) => (
            <div key={t} className="rounded-2xl border border-border p-4">
              <Icone className="size-5 text-primary" />
              <p className="mt-2.5 font-semibold">{t}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border p-4">
            <p className="text-sm font-semibold">As cores do texto</p>
            <p className="mt-1 text-sm text-muted-foreground">O negrito curto e o código ganham a cor do assunto. As figuras seguem as mesmas cores.</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {CORES.map(([t, c]) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: c }}>
                  <span className="size-2.5 rounded-full" style={{ background: c }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Keyboard className="size-4" /> Atalhos
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <Mono>← →</Mono> passar cartões e questões
              </li>
              <li>
                <Mono>espaço</Mono> revelar a resposta
              </li>
              <li>
                <Mono>1</Mono> errei · <Mono>2</Mono> acertei · <Mono>M</Mono> modo
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          De onde vem cada coisa: o código do sensor e as capturas da aula de diagnóstico; as resoluções dos casos 1 a 10 do guia da aula; o simulado foi gerado
          para este site com a mesma planta, IPs e ritmo da aula, e os quadros citados foram conferidos no tshark. Toda regra mostrada no site foi rodada nas
          capturas com o conferir.py.
        </p>
      </Secao>
    </div>
  )
}
