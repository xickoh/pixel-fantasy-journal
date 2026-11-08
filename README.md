# pixel_fantasy_journal

Site estático (abrir `index.html`) com as funcionalidades do jogo Pixel Fantasy, capturas e o devlog dos prompts por dia.

- `data/features.js`: funcionalidades e lista de capturas (editar à mão, só as mais relevantes: 6 cartões de 3 pontos curtos; uma mecânica nova só reescreve um ponto se for das principais, nunca acrescenta pormenores; capturas em `img/`).
- `data/prompts.js` e `data/commits.js`: gerados por `python3 tools/build_devlog.py` a partir de `vault/raw/pixel_fantasy/05-prompts.md` (por enviar e enviados) e de `vault/arquivo/pixel_fantasy/historico-prompts.md` (implementados e fechados, desde 2026-10-29) e do `git log` do jogo (só leitura). Prompts sem dia contam como 18 de Outubro.
- Atualiza-se sozinho a cada commit do jogo: o hook `post-commit` do jogo (`tools/git_hooks/post-commit`) corre o `build_devlog.py` e faz commit aqui. As funcionalidades e as capturas continuam à mão, a cada mecânica nova.
- Aspeto: fantasia medieval em pixel art, em três zonas: Grimório (magia, noite estrelada), Galeria do reino (prado) e Crónicas do dragão (covil, chamas). A arte estática (dragão vermelho, castelo, mago, slimes, relva, chamas, pedra) está em `img/art/` e é gerada por `tools/art.html` + `tools/art.js` (desenhada de raiz: os sprites do jogo não podem ser redistribuídos).

## Wiki

`wiki.html` (+ `wiki.js`): itens, inimigos, aldeões, skills e feitiços, mecânicas e números do jogo. É a mesma informação do Compêndio dentro do jogo (prompt 649): os dois saem do mesmo construtor do jogo.

- Cada item, inimigo, aldeão e mecânica tem a sua página: `wiki.html#itens/<id>`, `#inimigos/<id>`, `#aldeoes/<id>`, `#habilidades/<id>`, `#mecanicas/<id>` (uma só página, rota pelo hash; as páginas nascem dos dados, não há ficheiros por entrada).
- `data/wiki_data.js`: **gerado**, não se edita. `python3 tools/build_wiki.py` corre o Godot em headless (`tools/export_wiki.gd` e `.tscn`), que chama o `CompendiumData.build()` do jogo (`systems/compendium/compendium_data.gd`) em português e grava o resultado: nada se calcula aqui. Precisa do flatpak `org.godotengine.Godot`; o jogo está em `PF_GAME` (por defeito `/home/deck/Documents/pixel_fantasy`).
- `python3 tools/build_wiki.py --check`: diz se a wiki está desatualizada em relação ao jogo (exit 1 se estiver).
- As mecânicas (morte, dormir, comércio...) escrevem-se **no jogo**, em `data/compendium/mechanics.json` (en e pt por texto); as marcas `{s.chave}`, `{r.chave}`, `{k.chave}`, `{u.chave}` e `{l.chave}` (com `|pct` e `|min`) são preenchidas pelo jogo a partir dos dados. Desde o prompt 649 já não há `wiki_mechanics.js` no journal.
- Em modo dev (vault `jarvis.md`), cada mudança no jogo que altere a informação da wiki atualiza-a na mesma mudança.
