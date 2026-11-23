# Prints do Wireshark que precisam de mouse

Pastas:
- AULA = `C:\Users\alfas\OneDrive\Documentos\GitHub\MonitoriasRedes\Projeto_Sniffer_IDS\aula_ids\capturas`
- SIM  = `C:\Users\alfas\OneDrive\Documentos\GitHub\MonitoriasRedes\Projeto_Sniffer_IDS\prova\codigo\capturas`
- SITE = `C:\Users\alfas\OneDrive\Documentos\GitHub\MonitoriasRedes\Projeto_Sniffer_IDS\site`

## Abrir uma captura já filtrada e com o pacote escolhido (PowerShell)

```powershell
$proc = Start-Process "C:\Program Files\Wireshark\Wireshark.exe" -ArgumentList '-C site_prova -r "<PASTA>\<captura>.pcap" -Y "<filtro>" -g <pacote>' -PassThru
Start-Sleep -Seconds 6
powershell -ExecutionPolicy Bypass -File "<SITE>\figuras\print_janela.ps1" -Titulo "<captura>.pcap" -Ajustar
```

## Salvar o print (PowerShell), depois de deixar a tela pronta

```powershell
powershell -ExecutionPolicy Bypass -File "<SITE>\figuras\print_janela.ps1" -Titulo "<trecho do título da janela>" -Nome <nome>
```

Depois de cada captura: `Stop-Process -Id $proc.Id` (feche só a janela que você abriu).

## Parte A: detalhes do pacote (payload expandido, campo selecionado)

Na janela: o painel do meio é a árvore do pacote. Clique na seta `>` à esquerda de uma linha para expandir.
Clicar numa linha a seleciona e pinta os bytes dela no painel de baixo. **Não expanda Frame, Ethernet, IP nem TCP.**

| nome | pasta | captura | filtro | pacote | expandir | clicar (selecionar) |
|---|---|---|---|---|---|---|
| ws_modbus_pergunta | SIM | linha_de_base | modbus | 1 | Modbus/TCP e Modbus | linha "Transaction Identifier" |
| ws_modbus_endereco | SIM | linha_de_base | modbus | 1 | Modbus/TCP e Modbus | linha "Reference Number" |
| ws_modbus_resposta | SIM | linha_de_base | modbus | 2 | Modbus/TCP e Modbus (e "Register 0", se tiver seta) | linha do "Register 0" |
| ws_modbus_excecao | AULA | caso_02 | modbus.exception_code | 4 | Modbus/TCP e Modbus | linha "Exception Code" |
| ws_unit_id | AULA | caso_09 | mbtcp.unit_id != 1 | 261 | Modbus/TCP | linha "Unit Identifier" |
| ws_escrita | AULA | caso_10 | modbus.func_code == 6 | 321 | Modbus/TCP e Modbus | linha do registrador escrito (Register 2 ou valor 300) |
| ws_s7_pergunta | SIM | linha_de_base | s7comm | 4 | S7 Communication, Header, Parameter, Item [1] | linha "DB number" |
| ws_s7_resposta | SIM | linha_de_base | s7comm | 5 | S7 Communication, Header, Data, Item [1] | linha "Return code" |
| ws_s7_tpkt | SIM | linha_de_base | s7comm | 4 | TPKT | linha "Length" do TPKT |
| ws_sim03_detalhe | SIM | caso_03 | modbus.func_code == 6 | 321 | Modbus/TCP e Modbus | linha do registrador escrito (valor 3000) |
| ws_sim04_detalhe | SIM | caso_04 | modbus.func_code == 16 | 228 | Modbus/TCP e Modbus | linha do registrador escrito (valor 265) |
| ws_sim06_detalhe | SIM | caso_06 | mbtcp.prot_id != 0 | 375 | Modbus/TCP | linha "Protocol Identifier" |
| ws_sim07_detalhe | SIM | caso_07 | modbus && ip.src==192.168.0.11 && !modbus.request_frame | 288 | Modbus/TCP e Modbus | linha "Transaction Identifier" |
| ws_sim09_detalhe | SIM | caso_09 | modbus.func_code == 43 | 358 | Modbus/TCP e Modbus | linha "Exception Code" |

O título da janela principal é o nome da captura, por exemplo `caso_02.pcap`.

## Parte B: janelas de estatística (sem filtro: use `-Y ""` e `-g 1`)

| nome | pasta | captura | menu | o que deixar na tela | -Titulo para o print |
|---|---|---|---|---|---|
| ws_endpoints | AULA | caso_01 | Statistics > Endpoints | aba IPv4 | Endpoints |
| ws_endpoints_eth | AULA | caso_01 | Statistics > Endpoints | aba Ethernet, caixa "Name resolution" marcada | Endpoints |
| ws_conversas | AULA | caso_01 | Statistics > Conversations | aba TCP | Conversations |
| ws_hierarquia | AULA | caso_05 | Statistics > Protocol Hierarchy | a árvore toda aberta | Protocol Hierarchy |
| ws_expert | AULA | caso_06 | Analyze > Expert Information | todos os grupos expandidos | Expert Information |
| ws_io_graph | AULA | caso_05 | Statistics > I/O Graphs | intervalo 1 s; uma linha com filtro `modbus` e outra com filtro `arp` (desmarque as outras) | I/O Graph |

Antes do print de uma janela de estatística, ajuste o tamanho dela:
`print_janela.ps1 -Titulo "<título>" -Ajustar -Largura 1200 -Altura 650`.
