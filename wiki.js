// A wiki: lê WIKI (data/wiki_data.js, gerado a partir dos dados do jogo) e MECHANICS (data/wiki_mechanics.js, à mão).
(function () {
  const $ = (id) => document.getElementById(id);
  const out = $('out'), q = $('wq'), chips = $('chips'), count = $('count');
  const TABS = [
    ['itens', 'Itens'], ['inimigos', 'Inimigos'], ['aldeoes', 'Aldeões'],
    ['mecanicas', 'Mecânicas'], ['numeros', 'Números'],
  ];
  const LEVELS = ['1', '10', '20', '30', '40'];
  let tab = 'itens', cat = '';

  function h(tag, cls, kids) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    (Array.isArray(kids) ? kids : kids == null ? [] : [kids]).forEach((k) => {
      e.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
    });
    return e;
  }
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const fmt = (n) => (typeof n === 'number' ? (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)).replace('.', ',')) : String(n));

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

  function pill(text, cls) { return h('span', 'pill ' + (cls || ''), text); }

  // --- itens
  function itemCard(it) {
    const c = h('article', 'wcard ' + it.cat);
    const head = h('header', null, [h('h3', null, it.name), pill(WIKI.categories[it.cat] || it.cat)]);
    c.appendChild(head);
    if (it.name_en && it.name_en !== it.name) c.appendChild(h('p', 'en', it.name_en));
    if (it.desc) c.appendChild(h('p', 'desc', it.desc));
    if (it.stats.length) {
      const dl = h('dl', 'stats');
      it.stats.forEach(([k, v]) => dl.appendChild(h('div', 'srow', [h('dt', null, k), h('dd', null, fmt(v))])));
      c.appendChild(dl);
    }
    const info = h('ul', 'info');
    if (it.recipe) {
      const ing = it.recipe.ing.map(([n, k]) => k + '× ' + n).join(', ');
      info.appendChild(h('li', null, [h('b', null, it.recipe.hidden ? 'Fabrico (planta): ' : 'Fabrico: '),
        (it.recipe.amount > 1 ? it.recipe.amount + '× ← ' : '') + ing + ' · ' + it.recipe.station]));
    }
    if (it.sold) info.appendChild(h('li', null, [h('b', null, 'Compra: '),
      it.sold.map((s) => s.shop + ' ' + s.price + ' moedas' + (s.amount > 1 ? ' (' + s.amount + ')' : '')).join(' · ')]));
    if (it.drops) info.appendChild(h('li', null, [h('b', null, 'Largado por: '),
      it.drops.map((d) => d.enemy + ' (' + fmt(Math.round(d.chance * 100)) + '%' + (d.max > 1 ? ', ' + d.min + '–' + d.max : '') + ')').join(' · ')]));
    if (it.sell) info.appendChild(h('li', null, [h('b', null, 'Vende por: '), it.sell + ' moedas']));
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
  function enemyCard(e) {
    const c = h('article', 'wcard enemy' + (e.boss ? ' boss' : ''));
    c.appendChild(h('header', null, [h('h3', null, e.name), e.boss ? pill('Chefe', 'red') : pill(e.family)]));
    const tags = h('p', 'tags', [pill(e.biome, 'green'), e.ranged ? pill('À distância', 'blue') : pill('Corpo a corpo', 'blue')]);
    if (e.weapon) tags.appendChild(pill(e.weapon, 'gray'));
    c.appendChild(tags);
    const t = h('table', 'lv');
    t.appendChild(h('thead', null, h('tr', null, [h('th', null, 'Nível')].concat(['Vida', 'Dano', 'Defesa', 'Veloc.'].map((x) => h('th', null, x))))));
    const body = h('tbody');
    LEVELS.forEach((lv) => {
      const r = e.levels[lv];
      if (!r) return;
      body.appendChild(h('tr', null, [lv, r.health, r.damage, fmt(r.defense), fmt(r.speed)].map((x) => h('td', null, String(x)))));
    });
    t.appendChild(body);
    c.appendChild(t);
    const info = h('ul', 'info');
    info.appendChild(h('li', null, [h('b', null, 'Vê-te a: '), fmt(e.detection) + ' px · pausa antes do golpe ' + fmt(e.windup) + ' s']));
    if (e.shot_damage_l1) info.appendChild(h('li', null, [h('b', null, 'Disparo (nv 1): '), e.shot_damage_l1 + ' de dano']));
    if (e.knockback_reduction) info.appendChild(h('li', null, [h('b', null, 'Empurrão: '), 'resiste a ' + fmt(Math.round(e.knockback_reduction * 100)) + '%']));
    if (e.boss_health_x) info.appendChild(h('li', null, [h('b', null, 'Vida: '), '×' + fmt(e.boss_health_x) + ' a do tipo base']));
    if (e.crit) info.appendChild(h('li', null, [h('b', null, 'Crítico: '), fmt(Math.round(e.crit * 100)) + '%']));
    const loot = e.loot.map((l) => {
      const what = l.weapon ? 'a sua arma' : l.items.length > 3 ? l.items.slice(0, 3).join(', ') + '…' : l.items.join(', ');
      return what + ' (' + fmt(Math.round(l.chance * 100)) + '%' + (l.max > 1 ? ', ' + l.min + '–' + l.max : '') + ')';
    });
    if (loot.length) info.appendChild(h('li', null, [h('b', null, 'Larga: '), loot.join(' · ')]));
    c.appendChild(info);
    return c;
  }

  function renderEnemies(f) {
    const rows = WIKI.enemies.filter((e) => !f || norm(e.name + ' ' + e.family + ' ' + e.biome).includes(f));
    count.textContent = rows.length + ' inimigos · estatísticas por nível do inimigo (1, 10, 20, 30, 40)';
    const wrap = h('div');
    const g = h('div', 'wgrid');
    rows.forEach((e) => g.appendChild(enemyCard(e)));
    wrap.appendChild(g);
    if (!f && WIKI.spawn_rows.length) {
      const t = h('table', 'lv wide');
      t.appendChild(h('caption', null, 'Que inimigos aparecem em cada zona (peso relativo)'));
      t.appendChild(h('thead', null, h('tr', null, ['Níveis', 'Famílias'].map((x) => h('th', null, x)))));
      const body = h('tbody');
      WIKI.spawn_rows.forEach((r) => {
        const fams = Object.entries(r.families).map(([k, v]) => ({orc: 'Orcs', skeleton: 'Esqueletos', mummy: 'Múmias'}[k] || k) + ' ×' + fmt(v)).join(' · ');
        body.appendChild(h('tr', null, [(r.level_min || 1) + '–' + r.level_max, fams].map((x) => h('td', null, x))));
      });
      t.appendChild(body);
      wrap.appendChild(h('div', 'tablebox', t));
    }
    return wrap;
  }

  // --- aldeões
  function renderVillagers(f) {
    const wrap = h('div');
    const rows = WIKI.villagers.filter((v) => !f || norm(v.name + ' ' + v.where + ' ' + v.does + ' ' + v.sells.join(' ')).includes(f));
    count.textContent = rows.length + ' papéis · os aldeões não têm vida nem dano: não lutam, vendem, dão missões e conversam';
    const g = h('div', 'wgrid');
    rows.forEach((v) => {
      const c = h('article', 'wcard villager');
      c.appendChild(h('header', null, [h('h3', null, v.name), pill(v.where, 'gray')]));
      c.appendChild(h('p', 'desc', v.does));
      if (v.sells.length) c.appendChild(h('p', null, [h('b', null, 'Vende: '), v.sells.join(', ')]));
      g.appendChild(c);
    });
    wrap.appendChild(g);
    if (!f) {
      wrap.appendChild(h('h2', 'sub', 'Personalidades'));
      wrap.appendChild(h('p', 'note', 'Cada aldeão tem uma, escolhida pela semente do mundo e pelo nome. Define as falas.'));
      const pg = h('div', 'wgrid');
      WIKI.personalities.forEach((p) => {
        const c = h('article', 'wcard villager');
        c.appendChild(h('header', null, h('h3', null, p.name)));
        const ul = h('ul', 'info');
        p.greetings.forEach((s) => ul.appendChild(h('li', null, '“' + s + '”')));
        c.appendChild(ul);
        pg.appendChild(c);
      });
      wrap.appendChild(pg);
    }
    return wrap;
  }

  // --- mecânicas
  function renderMechanics(f) {
    const wrap = h('div');
    const rows = MECHANICS.filter((m) => !f || norm(m.title + ' ' + m.lead + ' ' + m.points.join(' ')).includes(f));
    count.textContent = rows.length + ' mecânicas';
    const g = h('div', 'wgrid mech');
    rows.forEach((m) => {
      const c = h('article', 'wcard mechanic');
      c.id = 'm-' + m.id;
      c.appendChild(h('header', null, [h('h3', null, m.icon + ' ' + m.title)]));
      c.appendChild(h('p', 'desc', m.lead));
      const ul = h('ul', 'info');
      m.points.forEach((p) => ul.appendChild(h('li', null, fill(p))));
      c.appendChild(ul);
      c.appendChild(h('p', 'src', 'Fonte: ' + m.src));
      g.appendChild(c);
    });
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

  function drawChips() {
    chips.textContent = '';
    if (tab !== 'itens') return;
    const cats = [['', 'Todos']].concat(Object.entries(WIKI.categories).filter(([k]) => WIKI.items.some((i) => i.cat === k)));
    cats.forEach(([k, label]) => {
      const b = h('button', 'chip' + (k === cat ? ' on' : ''), label);
      b.type = 'button';
      b.onclick = () => { cat = k; draw(); };
      chips.appendChild(b);
    });
  }

  function draw() {
    $('tabs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    drawChips();
    out.textContent = '';
    out.appendChild(VIEWS[tab](norm(q.value.trim())));
  }

  function go(t) {
    tab = VIEWS[t] ? t : 'itens';
    if (location.hash.slice(1) !== tab) history.replaceState(null, '', '#' + tab);
    draw();
  }

  TABS.forEach(([id, label]) => {
    const b = h('button', 'tab', label);
    b.type = 'button';
    b.dataset.tab = id;
    b.onclick = () => go(id);
    $('tabs').appendChild(b);
  });
  q.addEventListener('input', draw);
  window.addEventListener('hashchange', () => go(location.hash.slice(1)));
  $('stamp').textContent = 'Gerada a ' + WIKI.generated + ' a partir do jogo (commit ' + WIKI.game_commit + '). Os preços são os base: o mercado do dia mexe-lhes.';
  go(location.hash.slice(1) || 'itens');
})();
