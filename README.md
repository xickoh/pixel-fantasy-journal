# pixel_fantasy_journal

Site estático (abrir `index.html`) com as funcionalidades do jogo Pixel Fantasy, capturas e o devlog dos prompts por dia.

- `data/features.js`: funcionalidades e lista de capturas (editar à mão, só os pontos-chave: 3 por cartão; capturas em `img/`).
- `data/prompts.js` e `data/commits.js`: gerados por `python3 tools/build_devlog.py` a partir de `vault/raw/pixel_fantasy/05-prompts.md` e do `git log` do jogo (só leitura). Prompts sem dia contam como 18 de Outubro.
- Atualiza-se sozinho a cada commit do jogo: o hook `post-commit` do jogo (`tools/git_hooks/post-commit`) corre o `build_devlog.py` e faz commit aqui. As funcionalidades e as capturas continuam à mão, a cada mecânica nova.
- Aspeto: fantasia medieval em pixel art, em três zonas: Grimório (magia, noite estrelada), Galeria do reino (prado) e Crónicas do dragão (covil, chamas). A arte estática (dragão vermelho, castelo, mago, slimes, relva, chamas, pedra) está em `img/art/` e é gerada por `tools/art.html` + `tools/art.js` (desenhada de raiz: os sprites do jogo não podem ser redistribuídos).

## Wiki

`wiki.html` (+ `wiki.js`): itens, inimigos, aldeões, mecânicas e números do jogo.

- `data/wiki_data.js`: **gerado**, não se edita. `python3 tools/build_wiki.py` corre o Godot em headless (`tools/export_wiki.gd` e `.tscn`, que leem os `.tres` do jogo pelas classes do jogo) e junta as traduções pt de `translations/strings.csv`. Precisa do flatpak `org.godotengine.Godot`; o jogo está em `PF_GAME` (por defeito `/home/deck/Documents/pixel_fantasy`).
- `python3 tools/build_wiki.py --check`: diz se a wiki está desatualizada em relação ao jogo (exit 1 se estiver).
- `data/wiki_mechanics.js`: as regras que não estão nos dados (morte, dormir, comércio...), à mão, em pt-PT. As marcas `{s.chave}` e `{r.chave}` (com `|pct` e `|min`) vão buscar o valor aos dados, por isso os números não envelhecem.
- Em modo dev (vault `jarvis.md`), cada mudança no jogo que altere a informação da wiki atualiza-a na mesma mudança.
