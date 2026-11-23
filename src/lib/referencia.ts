// Dados da página "Referência do ev" (src/components/Referencia.tsx).
// Cada propriedade: o que guarda, o tipo, o campo do Wireshark, o valor na linha de base e
// linhas extras (Modbus, S7, cuidado...). Os modelos de condição vêm agrupados por tema.

export type Prop = {
  nome: string
  resumo: string
  tipo: string
  wireshark?: string
  base?: string
  extra?: [string, string][]
}

export type Grupo = { id: string; titulo: string; props: Prop[] }

export const GRUPOS: Grupo[] = [
  {
    id: "quem",
    titulo: "Quem e quando",
    props: [
      { nome: "ts", resumo: "Hora da captura, em segundos desde 1/1/1970 (UTC). Serve para medir intervalos entre eventos.", tipo: "float", wireshark: "frame.time_epoch", base: "cresce cerca de 1 s por pergunta", extra: [["Cuidado", "a hora do dia sozinha não detecta nada: numa captura de madrugada, todo ev passa"]] },
      { nome: "origem", resumo: "IP de quem mandou a mensagem.", tipo: "texto", wireshark: "ip.src", base: ".29, .11 ou .12", extra: [["Na pergunta", "o cliente"], ["Na resposta", "o servidor"]] },
      { nome: "destino", resumo: "IP de quem recebe a mensagem.", tipo: "texto", wireshark: "ip.dst", base: ".29, .11 ou .12" },
      { nome: "porta_origem", resumo: "Porta TCP de quem mandou. A do cliente só muda quando ele abre uma conexão nova.", tipo: "int", wireshark: "tcp.srcport", base: "50101 (.29), 2001 (GET), 502, 102" },
      { nome: "porta_destino", resumo: "Porta TCP de quem recebe.", tipo: "int", wireshark: "tcp.dstport", base: "502, 102, 50101, 2001" },
      { nome: "protocolo", resumo: "Que protocolo foi decodificado, escolhido pela porta do servidor.", tipo: "texto", base: '"modbus" e "s7"', extra: [["Valores", '"modbus" (porta 502) ou "s7" (porta 102)']] },
      { nome: "direcao", resumo: "Se a mensagem é pergunta (do cliente) ou resposta (do servidor).", tipo: "texto", wireshark: "s7comm.header.rosctr (S7)", base: "as duas", extra: [["Valores", '"pergunta" ou "resposta"'], ["Modbus", "pergunta é o que vai para a porta 502"]] },
    ],
  },
  {
    id: "pedido",
    titulo: "O que se pede",
    props: [
      { nome: "operacao", resumo: "A função traduzida numa palavra.", tipo: "texto", base: '"leitura"', extra: [["Valores", '"leitura", "escrita", "controle", "outra"'], ["Cuidado", 'o Setup S7 (0xF0) é "outra": toda conexão S7 nova começa com ele']] },
      { nome: "funcao", resumo: "Código da função pedida, sem o 0x80 da exceção.", tipo: "int", wireshark: "modbus.func_code, s7comm.param.func", base: "Modbus 3; S7 0x04", extra: [["Modbus", "3 ler, 6 escrever um, 16 escrever vários, 43 identificação"], ["S7", "0x04 Read Var, 0x05 Write Var, 0x29 PLC Stop, 0xF0 Setup"]] },
      { nome: "area", resumo: "Que memória do CLP é acessada.", tipo: "texto", wireshark: "s7comm.param.item.area, .db", base: '"holding"; "DB1"', extra: [["Modbus", '"holding", "input", "coil", "discreta"'], ["S7", '"DB1", "M", "I", "Q"']] },
      { nome: "endereco", resumo: "Onde começa o acesso. A resposta não repete: o sensor copia da pergunta casada.", tipo: "int", wireshark: "modbus.reference_num", base: "0", extra: [["Modbus", "número do primeiro registrador"], ["S7", "byte dentro da área (o pacote traz em bits; o sensor divide por 8)"]] },
      { nome: "quantidade", resumo: "Quanto se pede a partir do endereço.", tipo: "int", wireshark: "modbus.word_cnt, s7comm.param.item.length", base: "10; 20", extra: [["Modbus", "registradores (1 na escrita simples)"], ["S7", "elementos do item, aqui bytes"]] },
      { nome: "valores", resumo: "Números de 16 bits: os lidos (na resposta) ou os escritos (na pergunta).", tipo: "lista de int", wireshark: "modbus.regval_uint16", base: "[247 a 253, 1, 0, ...]; [82, 0, ...]", extra: [["Vazia", "pergunta de leitura, resposta de escrita, resposta de erro"], ["Cuidado", "teste ev.valores and ... antes de usar ev.valores[0]"]] },
    ],
  },
  {
    id: "cabecalho",
    titulo: "Cabeçalho e resposta",
    props: [
      { nome: "status", resumo: "Código de erro que veio na resposta. 0 é sem erro; na pergunta é sempre 0.", tipo: "int", wireshark: "modbus.exception_code, s7comm.header.errcls/errcod, s7comm.data.returncode", base: "0", extra: [["Modbus", "1 função ilegal, 2 endereço ilegal, 3 valor ilegal"], ["S7", "0x8104 recusa (sem PUT/GET), 0x0A item não existe"]] },
      { nome: "transacao", resumo: "Número que o cliente põe na pergunta e o servidor repete na resposta.", tipo: "int", wireshark: "mbtcp.trans_id, s7comm.header.pduref", base: "sobe de 1 em 1", extra: [["Repetida", "retransmissão do TCP"]] },
      { nome: "id_protocolo", resumo: "Identificador do protocolo no cabeçalho.", tipo: "int", wireshark: "mbtcp.prot_id", base: "Modbus 0; S7 0x32", extra: [["Outro valor", "mensagem forjada: o ev vem malformado"]] },
      { nome: "unidade", resumo: "Unit ID do Modbus TCP. O S7-1200 ignora.", tipo: "int", wireshark: "mbtcp.unit_id", base: "1 (S7: 0)" },
      { nome: "tamanho", resumo: "O tamanho que o cabeçalho diz que a mensagem tem.", tipo: "int", wireshark: "mbtcp.len, tpkt.length", base: "Modbus 6 e 23; S7 31 e 45", extra: [["Modbus", "conta os bytes depois do Length: len(bruto) == 6 + tamanho"], ["S7", "conta a mensagem toda: len(bruto) == tamanho"]] },
      { nome: "malformado", resumo: "O cabeçalho não confere com o que chegou.", tipo: "bool", wireshark: "Expert Info: Invalid protocol ID, Invalid length", base: "False", extra: [["Modbus", "Protocol ID ≠ 0, Length errado ou menos de 8 bytes"], ["S7", "TPKT errado, protocolo ≠ 0x32 ou dados cortados"]] },
      { nome: "pareada", resumo: "A resposta achou a pergunta dela (pelo protocolo, IP do cliente e transação).", tipo: "bool", wireshark: "existe modbus.request_frame", base: "respostas True", extra: [["Na pergunta", "sempre False"], ["Sem par", "primeira resposta da captura, retransmissão ou injeção"]] },
      { nome: "tempo_resposta", resumo: "Segundos entre a pergunta e a resposta. 0 quando não há par.", tipo: "float", wireshark: "modbus.response_time", base: "Modbus 0,003 a 0,007; S7 0,002 a 0,005" },
      { nome: "bruto", resumo: "O payload TCP inteiro, exatamente como chegou.", tipo: "bytes", wireshark: "painel de bytes", base: "Modbus 12 e 29 bytes; S7 31 e 45", extra: [["Modbus", "bruto[0:2] transação, [2:4] protocolo, [4:6] Length, [6] Unit ID, [7] função"]] },
    ],
  },
]

export type Modelo = { pega: string; cond: string }
export type Tema = { titulo: string; nota?: string; modelos: Modelo[] }

export const MODELOS: Tema[] = [
  {
    titulo: "Quem fala",
    modelos: [
      { pega: "IP fora do inventário", cond: "ev.origem not in ATIVOS" },
      { pega: "pergunta Modbus que não é da engenharia", cond: 'ev.protocolo == "modbus" and ev.direcao == "pergunta" and ev.origem != "192.168.0.29"' },
      { pega: "S7 chegando no CLP A", cond: 'ev.protocolo == "s7" and ev.direcao == "pergunta" and ev.destino == "192.168.0.11"' },
    ],
  },
  {
    titulo: "O que se pede",
    modelos: [
      { pega: "qualquer escrita", cond: 'ev.direcao == "pergunta" and ev.operacao == "escrita"' },
      { pega: "comando de controle (stop, start)", cond: 'ev.direcao == "pergunta" and ev.operacao == "controle"' },
      { pega: "função que a planta não usa", cond: 'ev.protocolo == "modbus" and ev.direcao == "pergunta" and ev.operacao == "outra" and not ev.malformado' },
      { pega: "leitura fora do mapa (HR10 em diante)", cond: 'ev.direcao == "pergunta" and ev.endereco + ev.quantidade > 10' },
    ],
  },
  {
    titulo: "Valores",
    nota: "A faixa é por registrador: confira o endereço.",
    modelos: [
      { pega: "escrita fora da faixa no HR2", cond: 'ev.direcao == "pergunta" and ev.endereco == 2 and any(v > 400 for v in ev.valores)' },
      { pega: "valor lido estranho no HR0", cond: 'ev.direcao == "resposta" and ev.endereco == 0 and ev.valores and ev.valores[0] == 32767' },
    ],
  },
  {
    titulo: "Cabeçalho",
    modelos: [
      { pega: "Unit ID diferente", cond: 'ev.protocolo == "modbus" and ev.direcao == "pergunta" and ev.unidade != 1' },
      { pega: "cabeçalho que não confere", cond: 'ev.protocolo == "modbus" and ev.malformado' },
    ],
  },
  {
    titulo: "Resposta e tempo",
    modelos: [
      { pega: "resposta com erro", cond: 'ev.direcao == "resposta" and ev.status != 0' },
      { pega: "resposta sem pergunta", cond: 'ev.direcao == "resposta" and not ev.pareada' },
      { pega: "resposta lenta (mais de 50 ms)", cond: "ev.pareada and ev.tempo_resposta > 0.050" },
    ],
  },
]

// regras com memória: o que não vira ev se pega pelo efeito
export const MEMORIA: { titulo: string; pega: string; codigo: string }[] = [
  {
    titulo: "Silêncio",
    pega: "algo parou de chegar (ARP sem resposta, cabo solto)",
    codigo: `ultimo = {}

def modbus_calado(ev):
    ultimo[ev.protocolo] = ev.ts
    return (ev.protocolo == "s7" and "modbus" in ultimo
            and ev.ts - ultimo["modbus"] > 3)`,
  },
  {
    titulo: "Repetição",
    pega: "a mesma mensagem de novo (retransmissão)",
    codigo: `vistas = set()

def repetida(ev):
    chave = (ev.protocolo, ev.direcao, ev.origem, ev.transacao)
    ja_vi = chave in vistas
    vistas.add(chave)
    return ja_vi`,
  },
  {
    titulo: "Variedade",
    pega: "muitos valores diferentes rápido (varredura)",
    codigo: `enderecos = set()

def varredura(ev):
    if ev.protocolo != "modbus" or ev.direcao != "pergunta":
        return False
    enderecos.add(ev.endereco)
    return len(enderecos) > 3`,
  },
]

export const NAO_VIRA_EV = ["ARP", "SYN, FIN, RST", "ACK sem dados", "conexão COTP", "S7 userdata", "MAC", "TTL"]
