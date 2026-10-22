# pixel_fantasy_journal

Site estático (abrir `index.html`) com as funcionalidades do jogo Pixel Fantasy, capturas e o devlog dos prompts por dia.

- `data/features.js`: funcionalidades e lista de capturas (editar à mão, só os pontos-chave: 3 por cartão; capturas em `img/`).
- `data/prompts.js` e `data/commits.js`: gerados por `python3 tools/build_devlog.py` a partir de `vault/raw/pixel_fantasy/05-prompts.md` e do `git log` do jogo (só leitura). Prompts sem dia contam como 18 de Outubro.
- Atualiza-se sozinho a cada commit do jogo: o hook `post-commit` do jogo (`tools/git_hooks/post-commit`) corre o `build_devlog.py` e faz commit aqui. As funcionalidades e as capturas continuam à mão, a cada mecânica nova.
