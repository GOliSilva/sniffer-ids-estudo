"""Prepara o dist/ para publicar como artefato do Claude (depois do npm run build).

    python scripts/artefato.py

Artefato não serve .zip: troca o link da pasta de treino por um aviso. Sem crases no texto
novo, porque o markdown dos módulos fica dentro de template strings do JavaScript.
Imprime os arquivos index-*.js e index-*.css, que são os que mudam a cada build.
"""
import pathlib
import subprocess

DIST = pathlib.Path(__file__).resolve().parent.parent / "dist"
TROCAS = {
    "[Baixar a pasta de treino (simulado_sniffer.zip)](downloads/simulado_sniffer.zip)":
        "**Pasta de treino (simulado_sniffer.zip):** baixe no site da disciplina ou peça ao monitor.",
    "[pasta de treino](downloads/simulado_sniffer.zip)":
        "pasta de treino (simulado_sniffer.zip, com o monitor)",
}

for js in DIST.glob("assets/index-*.js"):
    s = js.read_text(encoding="utf-8")
    for a, b in TROCAS.items():
        s = s.replace(a, b)
    js.write_text(s, encoding="utf-8")
    subprocess.run(["node", "--check", str(js)], check=True)
    print("assets/" + js.name)
for css in DIST.glob("assets/index-*.css"):
    print("assets/" + css.name)
