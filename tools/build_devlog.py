#!/usr/bin/env python3
"""Regenera data/prompts.js a partir dos prompts da vault (só leitura): raw/pixel_fantasy/05-prompts.md (os por
enviar e enviados) e arquivo/pixel_fantasy/historico-prompts.md (os implementados e fechados, desde 2026-10-29);
e data/commits.js a partir do git log do jogo (só leitura).
Dia de cada prompt: "Criado em", senão a data de "Enviado em", senão 2026-10-18.
Corre sozinho depois de cada commit do jogo (hook post-commit do repositório do jogo)."""
import re, json, sys, pathlib, subprocess
SRCS = [pathlib.Path(p) for p in sys.argv[1:]] or [
    pathlib.Path('/home/deck/vault/arquivo/pixel_fantasy/historico-prompts.md'),
    pathlib.Path('/home/deck/vault/raw/pixel_fantasy/05-prompts.md')]
OUT = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'prompts.js'
COMMITS_OUT = OUT.parent / 'commits.js'
GAME = pathlib.Path('/home/deck/Documents/pixel_fantasy')
DEFAULT_DAY = '2026-10-18'
text_all = '\n'.join(p.read_text(encoding='utf8') for p in SRCS if p.exists())
parts = re.split(r'^## (\d+)\. (.*)$', text_all, flags=re.M)
items = []
for i in range(1, len(parts), 3):
    n, title, body = int(parts[i]), parts[i + 1].strip(), parts[i + 2]
    def field(k):
        m = re.search(r'^- ' + k + r': (.*)$', body, re.M)
        return m.group(1).strip() if m else None
    day = None
    for k in ('Criado em', 'Enviado em'):
        m = re.match(r'(\d{4}-\d{2}-\d{2})', field(k) or '')
        if m: day = m.group(1); break
    text, started = [], False
    m = re.search(r'Texto a colar[^\n]*\n(.*)', body, re.S)
    for l in (m.group(1).split('\n') if m else []):
        if l.startswith('>'): started = True; text.append(re.sub(r'^> ?', '', l))
        elif started and l.strip(): break
        elif started: text.append('')
    res = field('Resultado')
    items.append(dict(n=n, title=title, day=day or DEFAULT_DAY, assumed=day is None,
                      status=(field('Estado') or '').strip('`'), text='\n'.join(text).strip(),
                      result=None if res in (None, '—') else res))
# an entry being moved may be in both files for a moment: keep the first (the history's), in number order
seen = {}
for it in items:
    seen.setdefault(it['n'], it)
items = [seen[n] for n in sorted(seen)]
OUT.write_text('window.PROMPTS = ' + json.dumps(items, ensure_ascii=False) + ';\n', encoding='utf8')
print(len(items), 'prompts ->', OUT)

# the game's commits, newest first: day, short hash, subject (the Co-Authored-By lines left out)
log = subprocess.run(['git', '-C', str(GAME), 'log', '--date=short', '--format=%ad%x09%h%x09%s'],
                     capture_output=True, text=True).stdout
commits = []
for line in log.splitlines():
    parts = line.split('\t', 2)
    if len(parts) == 3:
        commits.append(dict(day=parts[0], hash=parts[1], msg=parts[2]))
COMMITS_OUT.write_text('window.COMMITS = ' + json.dumps(commits, ensure_ascii=False) + ';\n', encoding='utf8')
print(len(commits), 'commits ->', COMMITS_OUT)
