"""Figuras do site da prova do sniffer. Gera os PNGs em public/img/.

    python figuras/figuras.py        (na pasta site; usa o Python com matplotlib)

Só os diagramas que o Wireshark não mostra (a planta e o caminho do código). As telas do
Wireshark são prints: figuras/prints_lista.ps1 e figuras/prints_detalhe.md.
As cores são as do site (src/styles/tokens.css, "cores por papel").
"""

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

SITE = Path(__file__).resolve().parent.parent

SAIDA = SITE / "public" / "img"
SAIDA.mkdir(parents=True, exist_ok=True)

FUNDO = "#fbf8f2"
TINTA = "#2b2118"
APAGADO = "#6b5e52"
LINHA = "#d9cfbf"
COR = {"modbus": "#2b65a6", "s7": "#7d6a1c", "rede": "#3f5873", "codigo": "#8a3d86",
       "ataque": "#b23a2c", "falha": "#a95a1f", "permitido": "#3d7334"}
SUAVE = {"modbus": "#e3ecf6", "s7": "#f1ecd9", "rede": "#e5e9ee", "codigo": "#f1e4f0",
         "ataque": "#f6e2df", "falha": "#f6e8dc", "permitido": "#e3eee0"}
MONO = "DejaVu Sans Mono"
plt.rcParams["font.family"] = "DejaVu Sans"


# ---------------------------------------------------------------- peças

def nova(largura, altura, escala=0.62):
    fig, ax = plt.subplots(figsize=(largura * escala, altura * escala))
    fig.patch.set_facecolor(FUNDO)
    ax.set_facecolor(FUNDO)
    ax.set_xlim(0, largura)
    ax.set_ylim(0, altura)
    ax.set_aspect("equal")
    ax.axis("off")
    return fig, ax


def caixa(ax, x, y, w, h, titulo, sub="", papel="rede", tam=12):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.18",
                                facecolor=SUAVE[papel], edgecolor=COR[papel], linewidth=2, zorder=2))
    if sub:
        ax.text(x + w / 2, y + h * 0.66, titulo, ha="center", va="center", fontsize=tam,
                fontweight="bold", color=TINTA, zorder=3)
        ax.text(x + w / 2, y + h * 0.3, sub, ha="center", va="center", fontsize=tam - 2.5,
                color=APAGADO, zorder=3, linespacing=1.25)
    else:
        ax.text(x + w / 2, y + h / 2, titulo, ha="center", va="center", fontsize=tam,
                fontweight="bold", color=TINTA, zorder=3)


def seta(ax, x1, y1, x2, y2, cor=TINTA, texto="", lado=0.25, estilo="-|>", tam=10, traco="-"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=estilo, mutation_scale=16,
                                 color=cor, linewidth=1.8, linestyle=traco, zorder=1))
    if texto:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 + lado, texto, ha="center", va="bottom",
                fontsize=tam, color=cor, fontweight="bold")


def salvar(fig, nome):
    fig.savefig(SAIDA / nome, dpi=170, bbox_inches="tight", pad_inches=0.12, facecolor=FUNDO)
    plt.close(fig)
    print("gerado:", SAIDA / nome)


# ---------------------------------------------------------------- a planta

def planta():
    fig, ax = nova(16, 8.6)
    caixa(ax, 0.4, 4.6, 4.2, 2.1, "CLP A", "192.168.0.11\nservidor Modbus (502)", "rede")
    caixa(ax, 5.9, 4.6, 4.2, 2.1, "CLP B", "192.168.0.12\nservidor S7 (102)", "rede")
    caixa(ax, 11.4, 4.6, 4.2, 2.1, "Engenharia", "192.168.0.29\ncliente Modbus", "rede")
    ax.add_patch(FancyBboxPatch((0.4, 1.0), 15.2, 0.9, boxstyle="round,pad=0,rounding_size=0.15",
                                facecolor="white", edgecolor=LINHA, linewidth=1.6))
    ax.text(8, 1.45, "switch com porta espelhada  →  Wireshark e sensor", ha="center", va="center",
            fontsize=11.5, color=APAGADO)
    for x in (2.5, 8.0, 13.5):
        ax.plot([x, x], [4.6, 1.9], color=LINHA, linewidth=2, zorder=0)
    ax.plot([13.5, 13.5, 2.5], [6.7, 7.5, 7.5], color=COR["modbus"], linewidth=1.8)
    seta(ax, 2.5, 7.5, 2.5, 6.7, COR["modbus"])
    ax.text(8.0, 7.65, "Modbus: a engenharia lê HR0 a HR9 do CLP A, 1 vez por segundo", ha="center",
            va="bottom", fontsize=10.5, color=COR["modbus"], fontweight="bold")
    seta(ax, 4.6, 5.05, 5.9, 5.05, COR["s7"])
    ax.text(5.25, 4.25, "S7 (GET): lê DB1,\n20 bytes, 1 vez/s", ha="center", va="top", fontsize=10,
            color=COR["s7"], fontweight="bold")
    salvar(fig, "planta.png")


# ---------------------------------------------------------------- do pacote ao ev

def caminho():
    fig, ax = nova(17, 9.2)
    caixa(ax, 0.3, 5.6, 3.4, 2.2, "pacote", "da rede ou\ndo .pcap", "rede")
    caixa(ax, 4.7, 5.6, 3.6, 2.2, "Segmento", "captura.py\nIPs, portas, payload", "rede")
    caixa(ax, 9.3, 5.6, 3.4, 2.2, "ev (Evento)", "protocolos.py\ndecodificar()", "codigo")
    caixa(ax, 13.6, 7.6, 3.2, 1.3, "avaliar(ev)", "", "codigo", 11.5)
    caixa(ax, 13.6, 4.4, 3.2, 1.3, "Janela", "", "codigo", 11.5)
    seta(ax, 3.7, 6.7, 4.7, 6.7)
    seta(ax, 8.3, 6.7, 9.3, 6.7)
    seta(ax, 12.7, 7.2, 13.6, 8.1)
    seta(ax, 12.7, 6.2, 13.6, 5.2)
    ax.text(15.2, 7.45, "suas regras: R01 a R10", ha="center", va="top", fontsize=9.5, color=COR["codigo"])
    ax.text(15.2, 4.25, "comparar(): LB1, LB2", ha="center", va="top", fontsize=9.5, color=COR["codigo"])
    # o que fica pelo caminho
    seta(ax, 2.0, 5.6, 2.0, 3.4, COR["falha"], traco="--")
    seta(ax, 6.5, 5.6, 6.5, 3.4, COR["falha"], traco="--")
    ax.text(2.0, 3.2, "fica para trás:\nARP, SYN, FIN,\nACK sem dados,\noutras portas", ha="center", va="top",
            fontsize=9.5, color=COR["falha"])
    ax.text(6.5, 3.2, "fica para trás:\nconexão COTP,\nS7 userdata,\npayload curto", ha="center", va="top",
            fontsize=9.5, color=COR["falha"])
    ax.text(11.0, 4.9, "1 ev = 1 mensagem\nModbus ou S7\n(pergunta OU resposta)", ha="center", va="top",
            fontsize=10, color=COR["codigo"], fontweight="bold")
    salvar(fig, "caminho.png")


if __name__ == "__main__":
    planta()
    caminho()
