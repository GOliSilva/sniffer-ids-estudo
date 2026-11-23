"""Recorta os prints do Wireshark para o que interessa (a tela inteira fica ilegível no celular).

    python figuras/recortar_prints.py

- *_lista.png: barra de filtro + lista de pacotes (a evidência está nas linhas);
- prints de detalhe: árvore do pacote + bytes + barra de status (que mostra o nome do campo);
- janelas de estatística: ficam inteiras.
O original fica guardado em _prints_originais/ (fora do git) e o recorte é sempre feito a partir
dele, então dá para rodar de novo sem perder nada.
"""
import pathlib
import shutil

from PIL import Image

SITE = pathlib.Path(__file__).resolve().parent.parent
IMG = SITE / "public" / "img"
ORIG = SITE / "_prints_originais"
ORIG.mkdir(exist_ok=True)

# janela principal 1384 x 892, perfil site_prova (layout empilhado, zoom 2)
LISTA = (0, 98, 1384, 372)        # filtro + lista
DETALHE = (0, 372, 1190, 892)     # árvore + bytes + status (até 1190: a direita fica vazia)
ESTATISTICA = {"ws_conversas", "ws_endpoints", "ws_endpoints_eth", "ws_hierarquia", "ws_expert", "ws_io_graph"}

for png in sorted(IMG.glob("ws_*.png")):
    original = ORIG / png.name
    with Image.open(png) as atual:
        novo = atual.size == (1384, 892) or not original.exists()
    if novo:                       # print novo (ainda inteiro): ele vira o original
        shutil.copy(png, original)
    nome = png.stem
    if nome in ESTATISTICA:
        continue
    im = Image.open(original)
    if im.size != (1384, 892):
        print("tamanho inesperado, não recortei:", png.name, im.size)
        continue
    caixa = LISTA if nome.endswith("_lista") else DETALHE
    im.crop(caixa).save(png)
    print("recortado:", png.name)
