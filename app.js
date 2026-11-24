// ---------- Grimório: um cartão por funcionalidade, fechado por defeito (só o título) ----------
// ícones de traço para os emojis dos cartões (um emoji sem desenho aqui aparece tal como está)
const ICONS={
  '⚔️':'<path d="M4 20 20 4M20 4h-4.5M20 4v4.5M5.5 14.5l4 4M20 20 4 4M4 4h4.5M4 4v4.5M18.5 14.5l-4 4"/>',
  '🌲':'<path d="M12 3 6.5 10.5h3L5 17h14l-4.5-6.5h3zM12 17v4"/>',
  '🏘️':'<path d="M4 11.5 12 4l8 7.5M6 10v9.5h12V10M10 19.5v-5h4v5"/>',
  '🎒':'<path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9l-5.4 2.9 1.1-6.1-4.5-4.3 6.1-.8z"/>',
  '🤝':'<circle cx="8.5" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19.5c0-3 2.4-5 5.5-5s5.5 2 5.5 5M16 14.3c2.8 0 5 1.7 5 4.7"/>',
  '🛠️':'<path d="m14 4 6 6-2.5 2.5-6-6zM12.5 8.5 4 17l3 3 8.5-8.5"/>',
};
const featIcon=i=>ICONS[i]?`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i]}</svg>`:esc(i);
const featGrid=$('featureGrid'),featToggle=$('featToggle');
featGrid.innerHTML=FEATURES.map(f=>`<details class="card ${esc(f.color)}"><summary><span class="ico">${featIcon(f.icon)}</span><h3>${esc(f.title)}</h3><span class="chev" aria-hidden="true"></span></summary><ul>${f.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></details>`).join('');
const featCards=[...featGrid.children];
const syncFeatToggle=()=>featToggle.textContent=featCards.every(c=>c.open)?'Fechar todos':'Abrir todos';
featToggle.onclick=()=>{const open=!featCards.every(c=>c.open);featCards.forEach(c=>c.open=open);syncFeatToggle()};
featGrid.addEventListener('toggle',syncFeatToggle,true);

// ---------- Galeria: as entradas do devlog que têm imagem, as mais recentes primeiro, 9 por página ----------
// Cada cartão leva à página da entrada. A página só muda quando se interage: os botões, as setas do teclado
// ou um arrastar do dedo claramente na horizontal (o scroll vertical nunca vira a página).
const GAL=DEV.filter(e=>e.shot).reverse(),PER=9,PAGES=Math.max(1,Math.ceil(GAL.length/PER));
const entryHref=e=>`entrada.html#${e.v}`;
let shotPage=0;
const shotsEl=$('shots'),shotGrid=$('shotGrid');
const shotCard=e=>`<a class="shot" href="${entryHref(e)}"><div class="thumb"><img src="${shotUrl(e.shot)}" alt="${esc(e.title)}" loading="lazy">${e.shot.endsWith('.gif')?'<span class="badge">GIF</span>':''}<span class="ver">${e.v}</span></div><div class="cap"><b>${esc(e.title)}</b><span>${esc(e.desc)}</span></div></a>`;
function showShots(p){
  shotPage=(p+PAGES)%PAGES;
  const a=shotPage*PER;
  shotGrid.innerHTML=GAL.slice(a,a+PER).map(shotCard).join('');
  $('shotInfo').textContent=GAL.length?`${a+1}–${Math.min(a+PER,GAL.length)} de ${GAL.length}`:'';
  $('shotPage').textContent=`Página ${shotPage+1} de ${PAGES}`;
}
shotsEl.addEventListener('click',e=>{
  const b=e.target.closest('.pg');
  if(b){showShots(shotPage+ +b.dataset.go);if(b.closest('.pager.end'))shotsEl.scrollIntoView()}
});
let touch=null;
shotGrid.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
shotGrid.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;
  if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy))showShots(shotPage+(dx<0?1:-1))});
document.addEventListener('keydown',e=>{
  if(e.target.closest('input'))return;
  const r=shotsEl.getBoundingClientRect();
  if(r.bottom<0||r.top>innerHeight)return;
  if(e.key==='ArrowLeft')showShots(shotPage-1);if(e.key==='ArrowRight')showShots(shotPage+1);
});
showShots(0);

// ---------- Crónicas: o devlog, por mês (o mais recente primeiro e aberto) ----------
// Um título e uma descrição por entrada; cada uma abre a sua página. Os prompts têm página própria (prompts.html).
const daysEl=$('days'),qInfo=$('qInfo');
const entryRow=e=>`<a class="log" href="${entryHref(e)}"><span class="ver">${e.v}</span><span class="txt"><b>${esc(e.title)}</b><span>${esc(e.desc)}</span></span>${e.shot?`<img src="${shotUrl(e.shot)}" alt="" loading="lazy">`:''}</a>`;
function render(q=''){
  q=norm(q.trim());
  const list=DEV.filter(e=>!q||(e._h??=norm(e.title+' '+e.desc+' '+e.v)).includes(q)).reverse(),months=[];
  for(const e of list){const k=e.day.slice(0,7);if(months.at(-1)?.k!==k)months.push({k,list:[]});months.at(-1).list.push(e)}
  qInfo.hidden=!q;
  if(q)qInfo.textContent=list.length?plural(list.length,'entrada','entradas'):'';
  daysEl.innerHTML=months.map((m,i)=>{
    const[y,mm]=m.k.split('-');
    return `<details class="month"${q||i===0?' open':''}><summary><h3>${MONTH[mm-1]} <span>${y}</span></h3><span class="meta">${plural(m.list.length,'entrada','entradas')}</span><span class="chev" aria-hidden="true"></span></summary><div class="loglist">`+
      m.list.map((e,j)=>(j===0||e.day!==m.list[j-1].day?`<h4 class="logday">${dayLong(e.day)}</h4>`:'')+entryRow(e)).join('')+`</div></details>`;
  }).join('')||'<p class="none">Nada encontrado.</p>';
}
let qTimer=0;
$('q').oninput=e=>{clearTimeout(qTimer);const v=e.target.value;qTimer=setTimeout(()=>render(v),160)};
render();
