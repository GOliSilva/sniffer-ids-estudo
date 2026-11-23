# Site de estudo: Sniffer IDS, prova final

Site de estudo em cartões para a prova final de Introdução às Redes de Comunicação (o sensor passivo do `Projeto_Sniffer_IDS`). React + Vite + Tailwind. Todo o conteúdo é markdown.

O site está publicado em https://GOliSilva.github.io/sniffer-ids-estudo/. O deploy é automático a cada push na `main` (workflow em `.github/workflows/pages.yml`). O conteúdo fica em `src/content/modulos/`.

## Rodar

Precisa de Node 24 ou mais.

```bash
npm install
npm run dev
```

`npm run build` gera `dist/` (o site, para a Vercel) e `offline/SnifferIDS.html` (um arquivo único que abre sem internet, bom para mandar pelo WhatsApp).

## Onde escrever

| Arquivo | O que vai nele |
|---|---|
| `src/content/modulos/NN.md` | Um arquivo por módulo. `00.md` é o roteiro; `12.md` é a referência do `ev` (página corrida) |
| (página de questões) | Montada sozinha a partir dos cartões `questao` e `treino` dos módulos (`src/components/Provas.tsx`) |
| `src/content/revisao.md` | A revisão por tema (formato abaixo) |
| `src/lib/content.ts` | O objeto `CURTOS`: o nome curto de cada módulo no menu. Uma linha por módulo |
| `src/components/Indice.tsx` e `index.html` | Nome do curso |
| `src/lib/cores.ts` e `src/styles/tokens.css` | As cores por papel (abaixo) |
| `public/img/` | Figuras e prints. No texto: `![descrição](img/nome.png)` |

Um módulo sem nenhum cartão (`===`) vira página corrida, como um formulário ou glossário, e vai para o fim do menu.

## Sintaxe dos cartões

```
=== tipo: título do cartão
```

O `tipo` é `ideia`, `questao`, `resolucao`, `treino` ou `resumo`.

- **Questão e treino:** o título leva a chave, `### ✍️ Questão de prova Fonte Q1: título curto`. A mesma chave liga o cartão à página de provas, ao gabarito e à revisão. Duas fontes para a mesma questão: `Prova 1 Q3 = Lista 2 Q1`.
- **Treino:** o enunciado vem primeiro, depois uma linha `??? resposta` e a resposta.
- **Resolução:** cada passo começa com `?? pergunta`. Numa questão discursiva, os passos montam a resposta: o que a questão pede, que conceito usar, que exemplo dar e a resposta montada.
- **Blocos:**
  - `:::chave` é a frase-chave do cartão;
  - `:::termo{nome="..."}` é a definição, com linhas `- **Rótulo** valor`;
  - `:::saiba{titulo="..."}` é um aprofundamento que fica recolhido.
- **Avisos (citação com rótulo em negrito):**
  - `> **Na aula, o professor disse:**` (amarelo)
  - `> **Na correção do professor:**` (amarelo)
  - `> **Erro comum:**` (vermelho)
  - `> **Confere com o gabarito do professor:**` (verde)
  - qualquer outro rótulo vira uma nota cinza.
- **Fórmulas** (se aparecerem): `$...$` no texto e `$$...$$` em bloco (KaTeX).

## Revisão por tema (`revisao.md`)

```
# Revisão por tema
Texto de abertura.

## Nome do tema
caiu: onde caiu (Prova 1 Q2, exercício do Classroom...)
questões: Fonte Q1; Fonte Q2; Fonte Q3

- o que lembrar, em poucas linhas

=== fim
Texto do cartão final (o placar de acertos aparece embaixo dele).
```

As questões listadas são os **mesmos cartões** dos módulos: a resposta e a nota de acerto são compartilhadas. Uma chave que não existe em nenhum módulo aparece como aviso no console do navegador.

## Cores por papel

| Papel | Palavras que ativam | Cor |
|---|---|---|
| `ataque` | ataque, fora da política, sondagem, varredura, intruso, injeção | vermelho |
| `falha` | falha, defeito, retransmissão, timeout, lento | laranja |
| `codigo` | ev, evento, regra, avaliar, conferir, python | roxo |
| `s7` | S7, PUT/GET, TPKT, COTP, Read Var, DB1 | ocre |
| `modbus` | Modbus, MBAP, Unit ID, registrador, HR0 | azul |
| `rede` | TCP, IP, ARP, MAC, ACK, SYN, FIN, porta | ardósia |
| `permitido` | permitido, linha de base, saudável, normal | verde |

As palavras estão em `src/lib/cores.ts`; as cores, em `src/styles/tokens.css`.

## Figuras e prints

- `figuras/figuras.py`: os diagramas que o Wireshark não mostra (planta, caminho do código), em matplotlib.
- `figuras/prints_lista.ps1`: prints de lista com filtro, tirados sozinhos (abre cada captura no perfil `site_prova` do Wireshark com `-Y` e `-g`).
- `figuras/prints_detalhe.md`: a lista dos prints que precisam de mouse (árvore aberta, campo selecionado, estatísticas).
- `figuras/print_janela.ps1`: salva o print de uma janela pelo título, em `public/img/`.
- `public/downloads/simulado_sniffer.zip`: a pasta de treino, montada por `../prova/montar_pasta_treino.py`.

## Como o site se comporta

- **Modos:** no topo, **Treino** esconde as respostas, e **Revisão** deixa tudo aberto para reler. A tecla M troca de modo.
- **Teclado:**
  - espaço revela; Shift+espaço revela tudo;
  - 1 marca errei e 2 marca acertei;
  - ← → passam os cartões;
  - E mostra a questão do módulo.
- **Celular:** arrastar o cartão para o lado passa para o próximo. O índice abre numa gaveta.
- **Progresso:** módulos concluídos, notas dos treinos e o último cartão visto ficam salvos no navegador.

## Cuidados

- **Não escreva LaTeX dentro de script Python nem de heredoc de shell.** A barra invertida dobrada vira caractere de controle (`\t`, `\f`, `\v`...) e o texto aparece quebrado, sem dar erro. Escreva direto nos `.md`.
- O `katex` está fixo em 0.16.47 (`package.json`) porque o `rehype-katex` usa essa versão. Não suba um sem o outro.
- **Figuras:** letra grande o bastante para o celular. Confira o site em 390 px de largura.
- **Prints do Wireshark:** sempre no perfil `site_prova` (layout empilhado, tema claro, zoom 2), pelo `print_janela.ps1`, que usa PrintWindow e não pega janela por cima.
