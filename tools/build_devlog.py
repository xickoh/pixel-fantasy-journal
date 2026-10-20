#!/usr/bin/env python3
"""Regenera data/prompts.js a partir de squire/05-prompts.md (só leitura).
Dia de cada prompt: "Criado em", senão a data de "Enviado em", senão 2026-10-18."""
import re, json, sys, pathlib
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/home/deck/vault/raw/squire/05-prompts.md')
OUT = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'prompts.js'
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
