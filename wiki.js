// A wiki: lê WIKI (data/wiki_data.js, gerado a partir dos dados do jogo) e MECHANICS (data/wiki_mechanics.js, à mão).
// Cada item, inimigo, aldeão e mecânica tem a sua página: wiki.html#itens/sword, #inimigos/orc_axe, #aldeoes/ferreiro, #mecanicas/morte.
(function () {
  const $ = (id) => document.getElementById(id);
  const out = $('out'), q = $('wq'), chips = $('chips'), count = $('count'), bar = $('wikibar'), tabsEl = $('tabs');
  const TABS = [
    ['itens', 'Itens'], ['inimigos', 'Inimigos'], ['aldeoes', 'Aldeões'],
    ['mecanicas', 'Mecânicas'], ['numeros', 'Números'],
  ];
  const LEVELS = ['1', '10', '20', '30', '40'];
  const ARCH = {balanced: 'Equilibrado', tank: 'Resistente', fast: 'Rápido', armored: 'Blindado', brute: 'Bruto'};
  const FAM = {orc: 'Orcs', skeleton: 'Esqueletos', mummy: 'Múmias'};
  let tab = 'itens', cat = '';

  const ITEMS = {}; WIKI.items.forEach((i) => { ITEMS[i.id] = i; });
  const ENEMIES = {}; WIKI.enemies.forEach((e) => { ENEMIES[e.id] = e; });
  const VILLAGERS = {}; WIKI.villagers.forEach((v) => { VILLAGERS[v.id] = v; });
  const MECH = {}; MECHANICS.forEach((m) => { MECH[m.id] = m; });

  function h(tag, cls, kids) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    (Array.isArray(kids) ? kids : kids == null ? [] : [kids]).forEach((k) => {
      if (k == null) return;
      e.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
    });
    return e;
  }
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const fmt = (n) => (typeof n === 'number' ? (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)).replace('.', ',')) : String(n));
  const pct = (x) => fmt(Math.round(x * 100)) + '%';
  function link(kind, id, text) {
    const a = h('a', 'wl', text);
    a.href = '#' + kind + '/' + id;
    return a;
  }
  // "a, b, c" with each one a link when it has a page
  function list(pairs, kind, sep) {
    const span = h('span');
    pairs.forEach((p, i) => {
      if (i) span.appendChild(document.createTextNode(sep || ', '));
      const [name, id] = p;
      span.appendChild(id && (kind === 'itens' ? ITEMS[id] : ENEMIES[id]) ? link(kind, id, name) : document.createTextNode(name));
    });
    return span;
  }
  function pill(text, cls) { return h('span', 'pill ' + (cls || ''), text); }
  function row(label, content) { return h('li', null, [h('b', null, label + ': '), content]); }

  // {s.key} / {r.key}, with |pct (0.5 -> 50%) and |min (seconds -> minutes)
  function fill(text) {
    return text.replace(/\{([sr])\.(\w+)(?:\|(\w+))?\}/g, (m, set, key, f) => {
      const v = WIKI[set] && WIKI[set][key];
      if (v == null) return '?';
      if (f === 'pct') return fmt(Math.round(v * 1000) / 10) + '%';
      if (f === 'min') return fmt(v / 60);
      return fmt(v);
    });
  }

  // --- itens
  function itemCard(it, full) {
    const c = h('article', 'wcard ' + it.cat + (full ? ' detail' : ''));
    c.appendChild(h('header', null, [full ? h('h1', null, it.name) : h('h3', null, link('itens', it.id, it.name)),
      pill(WIKI.categories[it.cat] || it.cat)]));
    if (it.name_en && it.name_en !== it.name) c.appendChild(h('p', 'en', it.name_en));
    if (it.desc) c.appendChild(h('p', 'desc', it.desc));
    if (it.stats.length) {
      const dl = h('dl', 'stats');
      it.stats.forEach(([k, v]) => dl.appendChild(h('div', 'srow', [h('dt', null, k), h('dd', null, fmt(v))])));
      c.appendChild(dl);
    }
    const info = h('ul', 'info');
    if (it.recipe) {
      const ing = h('span');
      it.recipe.ing.forEach(([n, k, id], i) => {
        if (i) ing.appendChild(document.createTextNode(', '));
        ing.appendChild(document.createTextNode(k + '× '));
        ing.appendChild(ITEMS[id] ? link('itens', id, n) : document.createTextNode(n));
      });
      info.appendChild(row(it.recipe.hidden ? 'Fabrico (planta)' : 'Fabrico',
        h('span', null, [it.recipe.amount > 1 ? it.recipe.amount + '× ← ' : '', ing, ' · ' + it.recipe.station])));
    }
    if (it.sold) {
      const span = h('span');
      it.sold.forEach((s, i) => {
        if (i) span.appendChild(document.createTextNode(' · '));
        span.appendChild(s.who && VILLAGERS[s.who] ? link('aldeoes', s.who, s.shop) : document.createTextNode(s.shop));
        span.appendChild(document.createTextNode(' ' + s.price + ' moedas' + (s.amount > 1 ? ' (' + s.amount + ')' : '')));
      });
      info.appendChild(row('Compra', span));
    }
    if (it.drops) {
      const span = h('span');
      it.drops.forEach((d, i) => {
        if (i) span.appendChild(document.createTextNode(' · '));
        span.appendChild(link('inimigos', d.id, d.enemy));
        span.appendChild(document.createTextNode(' (' + pct(d.chance) + (d.max > 1 ? ', ' + d.min + '–' + d.max : '') + ')'));
      });
      info.appendChild(row('Largado por', span));
    }
    if (it.sell) info.appendChild(row('Vende por', it.sell + ' moedas'));
    if (full) {
      if (it.teaches && ITEMS[it.teaches]) info.appendChild(row('Ensina a fazer', link('itens', it.teaches, ITEMS[it.teaches].name)));
      const teachers = WIKI.items.filter((o) => o.teaches === it.id);
      if (teachers.length) info.appendChild(row('Ensinado por', list(teachers.map((o) => [o.name, o.id]), 'itens')));
      const uses = WIKI.items.filter((o) => o.recipe && o.recipe.ing.some((g) => g[2] === it.id));
      if (uses.length) info.appendChild(row('Usado para fazer', list(uses.map((o) => [o.name, o.id]), 'itens')));
      if (it.cat === 'weapon' || it.cat === 'tool' || it.cat === 'equipment') {
        const holders = WIKI.enemies.filter((e) => e.weapon_id === it.id);
        if (holders.length) info.appendChild(row('Usado por', list(holders.map((e) => [e.name, e.id]), 'inimigos')));
      }
    }
    if (info.children.length) c.appendChild(info);
    return c;
  }

  function renderItems(f) {
    const rows = WIKI.items.filter((it) => (!cat || it.cat === cat) && (!f || norm(it.name + ' ' + it.name_en + ' ' + it.desc).includes(f)));
    count.textContent = rows.length + ' itens';
    const g = h('div', 'wgrid');
    rows.forEach((it) => g.appendChild(itemCard(it)));
    return g;
  }

  // --- inimigos
  function levelTable(e) {
    const t = h('table', 'lv');
    t.appendChild(h('thead', null, h('tr', null, ['Nível', 'Vida', 'Dano', 'Defesa', 'Veloc.'].map((x) => h('th', null, x)))));
    const body = h('tbody');
    LEVELS.forEach((lv) => {
      const r = e.levels[lv];
      if (r) body.appendChild(h('tr', null, [lv, r.health, r.damage, fmt(r.defense), fmt(r.speed)].map((x) => h('td', null, String(x)))));
    });
    t.appendChild(body);
    return t;
  }

  function enemyCard(e, full) {
    const c = h('article', 'wcard enemy' + (e.boss ? ' boss' : '') + (full ? ' detail' : ''));
    c.appendChild(h('header', null, [full ? h('h1', null, e.name) : h('h3', null, link('inimigos', e.id, e.name)),
      e.boss ? pill('Chefe', 'red') : pill(e.family)]));
    const tags = h('p', 'tags', [pill(e.biome, 'green'), e.ranged ? pill('À distância', 'blue') : pill('Corpo a corpo', 'blue')]);
    if (e.weapon) tags.appendChild(e.weapon_id && ITEMS[e.weapon_id] ? h('span', 'pill gray', link('itens', e.weapon_id, e.weapon)) : pill(e.weapon, 'gray'));
    c.appendChild(tags);
    c.appendChild(levelTable(e));
    const info = h('ul', 'info');
    info.appendChild(row('Vê-te a', fmt(e.detection) + ' px · pausa antes do golpe ' + fmt(e.windup) + ' s'));
    if (e.shot_damage_l1) info.appendChild(row('Disparo (nv 1)', e.shot_damage_l1 + ' de dano'));
    if (e.knockback_reduction) info.appendChild(row('Empurrão', 'resiste a ' + pct(e.knockback_reduction)));
    if (e.boss_health_x) info.appendChild(row('Vida', '×' + fmt(e.boss_health_x) + ' a do tipo base'));
    if (e.crit) info.appendChild(row('Crítico', pct(e.crit)));
    if (full) {
      info.appendChild(row('Velocidade base', fmt(e.speed) + ' px/s'));
      info.appendChild(row('Aparece', 'peso ' + fmt(e.weight) + ' · ' + e.biome));
      if (e.archetype) info.appendChild(row('Tipo de crescimento', ARCH[e.archetype] || e.archetype));
    }
    if (e.loot.length) {
      const span = h('span');
      e.loot.forEach((l, i) => {
        if (i) span.appendChild(document.createTextNode(' · '));
        if (l.weapon) span.appendChild(document.createTextNode('a sua arma'));
        else span.appendChild(list(full ? l.items : l.items.slice(0, 3), 'itens'));
        if (!full && l.items.length > 3) span.appendChild(document.createTextNode('…'));
        span.appendChild(document.createTextNode(' (' + pct(l.chance) + (l.max > 1 ? ', ' + l.min + '–' + l.max : '') + ')'));
      });
      info.appendChild(row('Larga', span));
    }
    if (full) {
      const kin = WIKI.enemies.filter((o) => o.family === e.family && o.id !== e.id);
      if (kin.length) info.appendChild(row('Mesma família', list(kin.map((o) => [o.name, o.id]), 'inimigos')));
    }
    c.appendChild(info);
    return c;
  }

  function spawnTable() {
    const t = h('table', 'lv wide');
    t.appendChild(h('caption', null, 'Que inimigos aparecem em cada zona (peso relativo)'));
    t.appendChild(h('thead', null, h('tr', null, ['Níveis', 'Famílias'].map((x) => h('th', null, x)))));
    const body = h('tbody');
    WIKI.spawn_rows.forEach((r) => {
      const fams = Object.entries(r.families).map(([k, v]) => (FAM[k] || k) + ' ×' + fmt(v)).join(' · ');
      body.appendChild(h('tr', null, [(r.level_min || 1) + '–' + r.level_max, fams].map((x) => h('td', null, x))));
    });
    t.appendChild(body);
    return h('div', 'tablebox', t);
  }

  function renderEnemies(f) {
    const rows = WIKI.enemies.filter((e) => !f || norm(e.name + ' ' + e.family + ' ' + e.biome).includes(f));
    count.textContent = rows.length + ' inimigos · estatísticas por nível do inimigo (1, 10, 20, 30, 40)';
    const wrap = h('div');
    const g = h('div', 'wgrid');
    rows.forEach((e) => g.appendChild(enemyCard(e)));
    wrap.appendChild(g);
    if (!f && WIKI.spawn_rows.length) wrap.appendChild(spawnTable());
    return wrap;
  }

  // --- aldeões
  function villagerCard(v, full) {
    const c = h('article', 'wcard villager' + (full ? ' detail' : ''));
    c.appendChild(h('header', null, [full ? h('h1', null, v.name) : h('h3', null, link('aldeoes', v.id, v.name)), pill(v.where, 'gray')]));
    c.appendChild(h('p', 'desc', v.does));
    if (v.sells.length) c.appendChild(h('p', null, [h('b', null, 'Vende: '), list(v.sells, 'itens')]));
    return c;
  }

  function personalityCard(p) {
    const c = h('article', 'wcard villager');
    c.appendChild(h('header', null, h('h3', null, p.name)));
    const ul = h('ul', 'info');
    p.greetings.forEach((s) => ul.appendChild(h('li', null, '“' + s + '”')));
    c.appendChild(ul);
    return c;
  }

  function renderVillagers(f) {
    const wrap = h('div');
    const rows = WIKI.villagers.filter((v) => !f || norm(v.name + ' ' + v.where + ' ' + v.does + ' ' + v.sells.map((s) => s[0]).join(' ')).includes(f));
    count.textContent = rows.length + ' papéis · os aldeões não têm vida nem dano: não lutam, vendem, dão missões e conversam';
    const g = h('div', 'wgrid');
    rows.forEach((v) => g.appendChild(villagerCard(v)));
    wrap.appendChild(g);
    if (!f) {
      wrap.appendChild(h('h2', 'sub', 'Personalidades'));
      wrap.appendChild(h('p', 'note', 'Cada aldeão tem uma, escolhida pela semente do mundo e pelo nome. Define as falas.'));
      const pg = h('div', 'wgrid');
      WIKI.personalities.forEach((p) => pg.appendChild(personalityCard(p)));
      wrap.appendChild(pg);
    }
    return wrap;
  }

  // --- mecânicas
  function mechCard(m, full) {
    const c = h('article', 'wcard mechanic' + (full ? ' detail' : ''));
    const title = m.icon + ' ' + m.title;
    c.appendChild(h('header', null, [full ? h('h1', null, title) : h('h3', null, link('mecanicas', m.id, title))]));
    c.appendChild(h('p', 'desc', m.lead));
    const ul = h('ul', 'info');
    m.points.forEach((p) => ul.appendChild(h('li', null, fill(p))));
    c.appendChild(ul);
    c.appendChild(h('p', 'src', 'Fonte: ' + m.src));
    return c;
  }

  function renderMechanics(f) {
    const wrap = h('div');
    const rows = MECHANICS.filter((m) => !f || norm(m.title + ' ' + m.lead + ' ' + m.points.join(' ')).includes(f));
    count.textContent = rows.length + ' mecânicas';
    const g = h('div', 'wgrid mech');
    rows.forEach((m) => g.appendChild(mechCard(m)));
    wrap.appendChild(g);
    if (!f) {
      wrap.appendChild(h('h2', 'sub', 'Missões'));
      WIKI.quests.forEach((qd) => {
        const c = h('article', 'wcard');
        c.appendChild(h('header', null, [h('h3', null, qd.title), pill(qd.count + ' × ' + qd.target)]));
        c.appendChild(h('p', 'desc', qd.request));
        c.appendChild(h('p', 'desc', 'Ao acabar: ' + qd.done));
        wrap.appendChild(c);
      });
      wrap.appendChild(h('h2', 'sub', 'Bênçãos'));
      const bg = h('div', 'wgrid');
      WIKI.blessings.forEach((b) => {
        const c = h('article', 'wcard');
        c.appendChild(h('header', null, [h('h3', null, b.name), pill(fmt(b.minutes / 60) + ' h')]));
        c.appendChild(h('p', 'desc', b.desc));
        if (!b.shrine) c.appendChild(h('p', 'en', 'Não se pede no santuário.'));
        bg.appendChild(c);
      });
      wrap.appendChild(bg);
      wrap.appendChild(h('h2', 'sub', 'Encantamentos'));
      wrap.appendChild(h('p', 'note', 'Armas, ferramentas e armaduras saem com um destes; multiplicam os números da peça. “Peso” é a chance relativa de sair.'));
      const t = h('table', 'lv');
      t.appendChild(h('thead', null, h('tr', null, ['Nome', 'Multiplicador', 'Peso'].map((x) => h('th', null, x)))));
      const body = h('tbody');
      WIKI.enhancements.forEach((e) => body.appendChild(h('tr', null, [e.name, '×' + fmt(e.multiplier), fmt(e.weight)].map((x) => h('td', null, x)))));
      t.appendChild(body);
      wrap.appendChild(h('div', 'tablebox', t));
      wrap.appendChild(h('h2', 'sub', 'Poderes de arma'));
      const pg = h('div', 'wgrid');
      WIKI.powers.forEach((p) => {
        const c = h('article', 'wcard');
        c.appendChild(h('header', null, h('h3', null, p.name)));
        if (p.desc) c.appendChild(h('p', 'desc', p.desc));
        pg.appendChild(c);
      });
      wrap.appendChild(pg);
    }
    return wrap;
  }

  // --- números
  function renderNumbers(f) {
    const entries = Object.entries(WIKI.s).map(([k, v]) => ['s.' + k, v]).concat(Object.entries(WIKI.r).map(([k, v]) => ['r.' + k, v]));
    const rows = entries.filter(([k, v]) => !f || norm(k + ' ' + v).includes(f));
    count.textContent = rows.length + ' constantes · StatsConfig (s) e StoreRules (r) do jogo';
    const t = h('table', 'lv wide');
    t.appendChild(h('thead', null, h('tr', null, ['Chave', 'Valor'].map((x) => h('th', null, x)))));
    const body = h('tbody');
    rows.forEach(([k, v]) => body.appendChild(h('tr', null, [k, typeof v === 'object' ? JSON.stringify(v) : fmt(v)].map((x) => h('td', null, x)))));
    t.appendChild(body);
    return h('div', 'tablebox', t);
  }

  const VIEWS = {itens: renderItems, inimigos: renderEnemies, aldeoes: renderVillagers, mecanicas: renderMechanics, numeros: renderNumbers};
  const DETAIL = {
    itens: [ITEMS, itemCard, 'Itens'], inimigos: [ENEMIES, enemyCard, 'Inimigos'],
    aldeoes: [VILLAGERS, villagerCard, 'Aldeões'], mecanicas: [MECH, mechCard, 'Mecânicas'],
  };

  function drawChips() {
    chips.textContent = '';
    if (tab !== 'itens') return;
    const cats = [['', 'Todos']].concat(Object.entries(WIKI.categories).filter(([k]) => WIKI.items.some((i) => i.cat === k)));
    cats.forEach(([k, label]) => {
      const b = h('button', 'chip' + (k === cat ? ' on' : ''), label);
      b.type = 'button';
      b.onclick = () => { cat = k; drawList(); };
      chips.appendChild(b);
    });
  }

  function drawList() {
    drawChips();
    out.textContent = '';
    out.appendChild(VIEWS[tab](norm(q.value.trim())));
  }

  function drawDetail(kind, id) {
    const [table, build, label] = DETAIL[kind];
    const entry = table[id];
    out.textContent = '';
    count.textContent = '';
    chips.textContent = '';
    const back = link(kind, '', '');
    back.href = '#' + kind;
    back.className = 'wl back';
    back.textContent = '← ' + label;
    out.appendChild(back);
    if (!entry) {
      out.appendChild(h('p', 'note', 'Esta página não existe (já não está nos dados do jogo).'));
      return;
    }
    document.title = (entry.name || entry.title) + ' · Pixel Fantasy Wiki';
    const wrap = h('div', 'detailwrap');
    wrap.appendChild(build(entry, true));
    if (kind === 'inimigos' && !entry.boss && WIKI.spawn_rows.length) wrap.appendChild(spawnTable());
    out.appendChild(wrap);
    window.scrollTo(0, 0);
  }

  function route() {
    const [t, id] = location.hash.slice(1).split('/');
    tab = VIEWS[t] ? t : 'itens';
    tabsEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    document.title = 'Pixel Fantasy Wiki';
    if (id && DETAIL[tab]) {
      bar.hidden = true;
      drawDetail(tab, decodeURIComponent(id));
    } else {
      bar.hidden = false;
      count.hidden = false;
      drawList();
    }
  }

  TABS.forEach(([id, label]) => {
    const b = h('button', 'tab', label);
    b.type = 'button';
    b.dataset.tab = id;
    b.onclick = () => { q.value = ''; location.hash = '#' + id; if (location.hash === '#' + id) route(); };
    tabsEl.appendChild(b);
  });
  q.addEventListener('input', drawList);
  window.addEventListener('hashchange', route);
  $('stamp').textContent = 'Gerada a ' + WIKI.generated + ' a partir do jogo (commit ' + WIKI.game_commit + '). Os preços são os base: o mercado do dia mexe-lhes.';
  route();
})();
