# Revisão por tema

Um tema por assunto da prova. Cada tema abre com o que lembrar e segue com as questões dele.

Responda cada questão de cabeça (ou no papel) antes de abrir a resposta, e marque se acertou. A nota é a mesma do módulo. A barra no topo tem um trecho por tema, que fica vermelho quando você erra alguma questão dele.

## A planta e o que é normal
questões: Treino M01 Q1; Treino M01 Q3; Treino M02 Q1; Treino M02 Q2

- **Inventário:** `.11` e `.12` CLPs, `.29` engenharia. Duas conversas: Modbus `.29 → .11:502`, S7 `.11 → .12:102`.
- **Normal:** função 3, HR0 a HR9, Unit ID 1, 3 a 7 ms; Read Var no DB1. Nenhum SYN, FIN, erro.
- **ev = uma mensagem** Modbus ou S7. ARP, SYN, FIN e ACK puro não viram `ev`.

## O ev campo a campo
questões: Treino M03 Q1; Treino M04 Q2; Treino M04 Q3; Treino M05 Q2; Treino M05 Q3

- **Quem e sentido:** `origem`, `destino`, `porta_origem`, `porta_destino`, `protocolo`, `direcao`.
- **O pedido:** `operacao`, `funcao`, `area`, `endereco`, `quantidade`, `valores` (`[]` na pergunta de leitura).
- **Cabeçalho e resposta:** `status`, `transacao`, `id_protocolo`, `unidade`, `tamanho`, `malformado`, `pareada`, `tempo_resposta`, `bruto`.

## Escrever regras precisas
questões: Treino M04 Q1; Treino M05 Q1; Treino M06 Q1; Treino M06 Q2; Treino M06 Q3

- **Precisa:** número só na coluna do seu caso; nada na base.
- **Estreite** com protocolo e direção. Limite **acima** do maior valor da base.
- **Memória:** silêncio, repetição, variedade.

## Investigar e classificar
questões: Treino M07 Q1; Treino M07 Q2; Treino M07 Q3; Treino M08 Q1; Treino M09 Q1

- **Seis passos:** inventário, TCP, aplicação, o que se pede, tempo, quadro.
- **Três perguntas:** quem, quantas vezes, quando.
- **ACK presente sem resposta** = aplicação; **sem ACK, retransmissão, ARP** = rede.

## Ataques no payload
questões: Treino M10 Q1; Treino M10 Q2; Treino M10 Q3

- TCP e IP perfeitos; a diferença está no valor, no cabeçalho, na função, no endereço ou no casamento.
- Valor estranho **sem escrita** e com a rede saudável = instrumento.
- Varredura (muitos valores rápido) = sondagem; um valor fixo = configuração.

## Simulado
questões: Simulado Q1; Simulado Q2; Simulado Q3; Simulado Q4; Simulado Q5; Simulado Q6; Simulado Q7; Simulado Q8; Simulado Q9; Simulado Q10

- Faça com o Wireshark e o `conferir.py` antes de abrir cada gabarito.

=== fim
Na prova: uma regra por caso, cada uma só no seu pcap; a classe pelas três perguntas; e a evidência com quadro, campo e valor. Boa prova.
