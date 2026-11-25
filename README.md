# pixel_fantasy_journal

Site estático (abrir `index.html`) com as funcionalidades do jogo Pixel Fantasy, capturas e o devlog dos prompts por mês e por dia.

- `data/features.js`: funcionalidades e lista de capturas (editar à mão, só as mais relevantes: 6 cartões de 3 pontos curtos; uma mecânica nova só reescreve um ponto se for das principais, nunca acrescenta pormenores; capturas em `img/`).
- `data/prompts.js` e `data/commits.js`: gerados por `python3 tools/build_devlog.py` a partir de `vault/raw/pixel_fantasy/05-prompts.md` (por enviar e enviados) e de `vault/arquivo/pixel_fantasy/historico-prompts.md` (implementados e fechados, desde 2026-10-29) e do `git log` do jogo (só leitura). Prompts sem dia contam como 18 de Outubro.
- Atualiza-se sozinho a cada commit do jogo: o hook `post-commit` do jogo (`tools/git_hooks/post-commit`) corre o `build_devlog.py` e faz commit aqui. As funcionalidades e as capturas continuam à mão, a cada mecânica nova.
- Banner (2026-11-15): a vila do jogo ao anoitecer, animada (`img/banner_vila.webp`, 960x300 mostrado a 2x, feito a partir da cena do jogo pelo `make_banner.py` da vault, `raw/pixel_fantasy/propostas/journal-banner/`) com o logo do jogo (`img/logo_pixel_fantasy.png`) e pirilampos em CSS. O dragão, o castelo e os slimes de `img/art/` já só aparecem na wiki e nas zonas mais abaixo.
- Aspeto (2026-11-24, pedido do utilizador: «torna o aspeto mais elegante, parece muito amador»): escuro e sóbrio, com títulos em Cinzel e texto em Inter, um só fundo, cartões de traço fino e o dourado como única cor de destaque. A pixel art fica para o banner, o logo, as capturas e um ornamento pequeno por secção (`img/art/`, gerada por `tools/art.html` + `tools/art.js`, desenhada de raiz: os sprites do jogo não podem ser redistribuídos). As cores e as fontes são variáveis no topo do `style.css` (partilhado com a wiki); nada de fontes pixel, tijolo, relva ou contornos grossos.
- Grimório: cada cartão é um `<details>` fechado por defeito (só o título), com «Abrir todos».
- Galeria: 9 capturas por página; a página muda com os botões, as setas do teclado ou um arrastar na horizontal. Tocar numa captura abre o visor, que ocupa a janela toda e trata dos gestos no `app.js` (sem a API de ecrã inteiro): dois dedos ampliam, um dedo arrasta a imagem ampliada, duplo toque amplia/repõe, a roda do rato também; sem zoom, arrastar para o lado ou as setas passam à captura seguinte/anterior. Fecha no ✕, no Esc, no botão de voltar do telemóvel ou num toque fora da imagem.
- Crónicas: por mês (o mais recente primeiro e aberto) e, dentro do mês, por dia. O conteúdo de um dia e o texto de um prompt só entram na página quando se abrem; a pesquisa ignora acentos.

## Wiki

`wiki.html` (+ `wiki.js`): itens, inimigos, aldeões, skills e feitiços, mecânicas e números do jogo. É a mesma informação do Compêndio dentro do jogo (prompt 649): os dois saem do mesmo construtor do jogo.

- Cada item, inimigo, aldeão e mecânica tem a sua página: `wiki.html#itens/<id>`, `#inimigos/<id>`, `#aldeoes/<id>`, `#habilidades/<id>`, `#mecanicas/<id>` (uma só página, rota pelo hash; as páginas nascem dos dados, não há ficheiros por entrada).
- `data/wiki_data.js`: **gerado**, não se edita. `python3 tools/build_wiki.py` corre o Godot em headless (`tools/export_wiki.gd` e `.tscn`), que chama o `CompendiumData.build()` do jogo (`systems/compendium/compendium_data.gd`) em português e grava o resultado: nada se calcula aqui. Precisa do flatpak `org.godotengine.Godot`; o jogo está em `PF_GAME` (por defeito `/home/deck/Documents/pixel_fantasy`).
- **História** (`wiki.html#historia`, 2026-11-25): o único separador que não vem do jogo. O texto está em `data/wiki_story.js`, **escrito à mão** a partir da nota `08-historia` da vault (`raw/pixel_fantasy/`); um cartão por capítulo, sempre aberto. Cada capítulo tem uma ilustração em `img/story/<id>.png` (campos `img`/`alt`), pixel art do PixelLab com recorte irregular e fundo transparente: feitas no PixelLab e recortadas pelo `make_recorte.py` da vault (`raw/pixel_fantasy/custom_assets/historia_ilustracoes/`). Quando a história muda na vault, atualiza-se este ficheiro.
- `python3 tools/build_wiki.py --check`: diz se a wiki está desatualizada em relação ao jogo (exit 1 se estiver).
- As mecânicas (morte, dormir, comércio...) escrevem-se **no jogo**, em `data/compendium/mechanics.json` (en e pt por texto); as marcas `{s.chave}`, `{r.chave}`, `{k.chave}`, `{u.chave}` e `{l.chave}` (com `|pct` e `|min`) são preenchidas pelo jogo a partir dos dados. Desde o prompt 649 já não há `wiki_mechanics.js` no journal.
- Em modo dev (vault `jarvis.md`), cada mudança no jogo que altere a informação da wiki atualiza-a na mesma mudança.

## Devlog, versões e páginas (2026-11-24)

- **Home** (`index.html`): grimório, galeria e crónicas. As crónicas são o devlog em linguagem simples (título + descrição), por mês; já não mostram prompts. A galeria mostra as entradas que têm imagem; cada cartão abre a página da entrada.
- **`entrada.html#0.X.Y`**: título, descrição, imagens (com zoom, `lightbox.js`) e a ligação ao prompt em `prompts.html#N`.
- **`prompts.html`**: a lista de prompts e commits por mês e dia (o que era a home).
- **`data/devlog.js`**: as entradas, da mais antiga à mais recente. Versão semver (semver.org) calculada pelo campo `t` de cada entrada: a primeira é 0.1.0; `"feat"` (novidade ou implementação nova) sobe o 2º número e zera o 3º; `"fix"` (correção de bug ou ajuste pequeno de valores) sobe o 3º. Por isso **só se acrescenta no fim**. `python3 tools/devlog_add.py "Título" "Descrição" --prompt N --shot ficheiro.png [--fix]` acrescenta uma e escreve a versão. Escrever sempre título e descrição em pt-PT, sem jargão.
- Preenchido de 2026-11-01 (prompt 559) a 2026-11-24 (prompt 921); Outubro fica por preencher. As capturas antigas de `SHOTS` já não aparecem na galeria (só as ligadas a entradas).
- `common.js` tem os auxiliares partilhados; `app.js` é só a home.
