#!/usr/bin/env python3
"""Regenera data/prompts.js a partir de pixel_fantasy/05-prompts.md (só leitura) e data/commits.js
a partir do git log do jogo (só leitura).
Dia de cada prompt: "Criado em", senão a data de "Enviado em", senão 2026-10-18.
Corre sozinho depois de cada commit do jogo (hook post-commit do repositório do jogo)."""
import re, json, sys, pathlib, subprocess
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/home/deck/vault/raw/pixel_fantasy/05-prompts.md')
OUT = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'prompts.js'
COMMITS_OUT = OUT.parent / 'commits.js'
GAME = pathlib.Path('/home/deck/Documents/pixel_fantasy')
DEFAULT_DAY = '2026-10-18'
parts = re.split(r'^## (\d+)\. (.*)$', SRC.read_text(encoding='utf8'), flags=re.M)
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
