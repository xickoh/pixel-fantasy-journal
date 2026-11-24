#!/usr/bin/env python3
"""Acrescenta uma entrada ao fim de data/devlog.js (a versão sai do tipo: feat sobe o 2º número, fix o 3º) e escreve a versão.
Uso: devlog_add.py "Título" "Descrição" [--prompt N] [--shot ficheiro.png] [--day AAAA-MM-DD] [--extra a.png b.gif] [--fix]"""
import argparse, json, re, pathlib, datetime
p = argparse.ArgumentParser()
p.add_argument('title'); p.add_argument('desc')
p.add_argument('--prompt', type=int); p.add_argument('--shot'); p.add_argument('--extra', nargs='*', default=[])
p.add_argument('--fix', action='store_true', help='correção ou ajuste de valores (sobe o 3º número)')
p.add_argument('--day', default=datetime.date.today().isoformat())
a = p.parse_args()
f = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'devlog.js'
t = f.read_text(encoding='utf8'); i = t.index('window.DEVLOG = ') + 16
d = json.loads(t[i:].rstrip().rstrip(';'))
d.append(dict(day=a.day, prompt=a.prompt, t='fix' if a.fix else 'feat', title=a.title, desc=a.desc, shot=a.shot, extra=a.extra))
f.write_text(t[:i] + json.dumps(d, ensure_ascii=False).replace('},', '},\n') + ';\n', encoding='utf8')
mi = pa = 0
for e in d:
    if e.get('t') == 'fix': pa += 1
    else: mi += 1; pa = 0
print(f'0.{mi}.{pa}')
