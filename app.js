const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const inline=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
// markdown mínimo dos prompts: parágrafos, listas com - ou *, tabelas com | e `código`/**negrito**
function md(t){
  const out=[];let list=null,table=null;
  const flush=()=>{
    if(list){out.push('<ul>'+list.join('')+'</ul>');list=null}
    if(table){
      const rows=table.filter(r=>!r.every(c=>/^:?-+:?$/.test(c))),head=rows.length<table.length?rows.shift():null;
      out.push('<div class="tbl"><table>'+(head?'<thead><tr>'+head.map(c=>'<th>'+inline(c)+'</th>').join('')+'</tr></thead>':'')+
        '<tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');
      table=null;
    }
  };
  for(const l of t.split('\n')){
    const m=l.match(/^\s*[-*] (.*)/),row=/^\s*\|.*\|\s*$/.test(l);
    if(m){if(table)flush();(list??=[]).push('<li>'+inline(m[1])+'</li>');continue}
    if(row){if(list)flush();(table??=[]).push(l.trim().slice(1,-1).split('|').map(c=>c.trim()));continue}
    flush();
    if(l.trim())out.push('<p>'+inline(l)+'</p>');
  }
  flush();
  return out.join('');
}
const plural=(n,one,many)=>`${n} ${n===1?one:many}`;

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

// ---------- Galeria: as capturas mais recentes primeiro (o SHOTS cresce no fim), 9 por página ----------
// A página só muda quando se interage: os botões, as setas do teclado ou um arrastar do dedo claramente na horizontal
// (o scroll vertical nunca vira a página; um arrastar não abre a captura). Tocar numa captura abre o visor.
const SHOTS_DESC=SHOTS.slice().reverse(),PER=9,PAGES=Math.ceil(SHOTS_DESC.length/PER);
const shotSrc=s=>`img/${s.f}.${s.ext||'png'}`;
let shotPage=0;
const shotsEl=$('shots'),shotGrid=$('shotGrid');
const shotCard=(s,i)=>`<figure class="shot" data-i="${i}" tabindex="0" role="button" aria-label="Ampliar: ${esc(s.t)}"><div class="thumb"><img src="${shotSrc(s)}" alt="${esc(s.t)}" loading="lazy">${s.ext==='gif'?'<span class="badge">GIF</span>':''}</div><figcaption><b>${esc(s.t)}</b><span>${esc(s.d)}</span></figcaption></figure>`;
function showShots(p){
  shotPage=(p+PAGES)%PAGES;
  const a=shotPage*PER;
  shotGrid.innerHTML=SHOTS_DESC.slice(a,a+PER).map((s,i)=>shotCard(s,a+i)).join('');
  $('shotInfo').textContent=`${a+1}–${Math.min(a+PER,SHOTS_DESC.length)} de ${SHOTS_DESC.length}`;
  $('shotPage').textContent=`Página ${shotPage+1} de ${PAGES}`;
}
shotsEl.addEventListener('click',e=>{
  const b=e.target.closest('.pg');
  if(b){showShots(shotPage+ +b.dataset.go);if(b.closest('.pager.end'))shotsEl.scrollIntoView();return}
  const f=e.target.closest('.shot');if(f&&!swiped)openLightbox(+f.dataset.i,f);
});
let touch=null,swiped=false;
shotGrid.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
shotGrid.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;
  if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy)){swiped=true;setTimeout(()=>swiped=false,400);showShots(shotPage+(dx<0?1:-1))}});
shotGrid.addEventListener('keydown',e=>{const f=e.target.closest('.shot');if(f&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openLightbox(+f.dataset.i,f)}});
showShots(0);

// ---------- Visor das capturas: zoom com dois dedos, arrastar, duplo toque, roda do rato ----------
// O visor ocupa a janela toda (sem a API de ecrã inteiro, que bloqueia os gestos) e trata dos gestos ele próprio:
// dois dedos ampliam à volta do ponto entre eles, um dedo arrasta a imagem ampliada, um duplo toque amplia/repõe;
// sem zoom, arrastar para o lado passa à captura seguinte/anterior. Fecha no ✕, no Esc, no botão de voltar ou num toque fora da imagem.
const lb=$('lightbox'),lbStage=lb.querySelector('.lb-stage'),lbCap=lb.querySelector('.lb-cap');
let lbImg=lbStage.querySelector('img');
const view={i:0,s:1,x:0,y:0,bw:0,bh:0,max:4,ready:false};   // s: escala; x,y: canto da imagem no palco; bw,bh: tamanho sem zoom
let lbFrom=null;
const stageSize=()=>[lbStage.clientWidth,lbStage.clientHeight];
function clampView(){
  const[sw,sh]=stageSize(),w=view.bw*view.s,h=view.bh*view.s;
  view.x=w<=sw?(sw-w)/2:Math.min(0,Math.max(sw-w,view.x));
  view.y=h<=sh?(sh-h)/2:Math.min(0,Math.max(sh-h,view.y));
}
function applyView(anim,dx=0){
  lbImg.classList.toggle('anim',!!anim);
  lbImg.style.transform=`translate3d(${view.x+dx}px,${view.y}px,0) scale(${view.s})`;
  lb.classList.toggle('zoomed',view.s>1.01);
}
function zoomAt(px,py,s,anim){
  s=Math.min(view.max,Math.max(1,s));
  const r=s/view.s;
  view.x=px-(px-view.x)*r;view.y=py-(py-view.y)*r;view.s=s;
  clampView();applyView(anim);
}
// o tamanho sem zoom: a imagem inteira dentro do palco, com margem igual em cima e em baixo para a legenda e o ✕
function layoutView(){
  if(!lbImg.naturalWidth)return;
  const[sw,sh]=stageSize(),pad=Math.max(56,lbCap.offsetHeight)+8,side=sw>700?72:0;
  const k=Math.min((sw-2*side)/lbImg.naturalWidth,Math.max(80,sh-2*pad)/lbImg.naturalHeight);
  view.bw=lbImg.naturalWidth*k;view.bh=lbImg.naturalHeight*k;
  view.max=Math.max(5,3/k);   // até 3x o tamanho real da captura
  lbImg.style.width=view.bw+'px';lbImg.style.height=view.bh+'px';
  view.s=1;view.ready=true;clampView();applyView(false);
  lbImg.classList.add('on');
}
function showInLightbox(i){
  const n=SHOTS_DESC.length;view.i=(i+n)%n;view.ready=false;
  const s=SHOTS_DESC[view.i];
  // um <img> novo por captura: um reaproveitado guardava as medidas da anterior até a nova acabar de carregar
  const img=new Image();img.draggable=false;img.alt=s.t;img.src=shotSrc(s);lbImg.replaceWith(img);lbImg=img;
  lbCap.querySelector('b').textContent=s.t;lbCap.querySelector('span').textContent=s.d;
  lbCap.querySelector('small').textContent=`${view.i+1} / ${n}`;
  lb.classList.remove('zoomed');
  // as medidas chegam antes do fim do carregamento (um GIF grande vai aparecendo)
  const me=view.i,wait=()=>{if(lb.hidden||view.i!==me)return;lbImg.naturalWidth?layoutView():requestAnimationFrame(wait)};wait();
  for(const d of[1,-1]){const o=SHOTS_DESC[(view.i+d+n)%n];new Image().src=shotSrc(o)}
  const page=Math.floor(view.i/PER);if(page!==shotPage)showShots(page);   // a grelha acompanha, para se fechar na página certa
}
function openLightbox(i,from){
  lbFrom=from||null;lb.hidden=false;showInLightbox(i);
  history.pushState({lightbox:true},'');
  lb.querySelector('.lb-close').focus({preventScroll:true});
}
function hideLightbox(){lb.hidden=true;lbImg.removeAttribute('src');pts.clear();g=null;(lbFrom&&lbFrom.isConnected?lbFrom:shotGrid.querySelector(`[data-i="${view.i}"]`))?.focus({preventScroll:true})}
function closeLightbox(){if(lb.hidden)return;history.state?.lightbox?history.back():hideLightbox()}
addEventListener('popstate',()=>{if(!lb.hidden)hideLightbox()});
addEventListener('resize',()=>{if(!lb.hidden)layoutView()});
lb.querySelector('.lb-close').onclick=closeLightbox;
lb.querySelector('.lb-prev').onclick=()=>showInLightbox(view.i-1);
lb.querySelector('.lb-next').onclick=()=>showInLightbox(view.i+1);

const pts=new Map();let g=null,lastTap=null;   // g: o gesto em curso
const stagePos=e=>{const r=lbStage.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
const onImage=(x,y)=>x>=view.x&&x<=view.x+view.bw*view.s&&y>=view.y&&y<=view.y+view.bh*view.s;
const pinchOf=()=>{const[a,b]=[...pts.values()];return{d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,x:(a[0]+b[0])/2,y:(a[1]+b[1])/2}};
lbStage.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();lbStage.setPointerCapture(e.pointerId);
  const p=stagePos(e);pts.set(e.pointerId,p);
  if(pts.size===1)g={x0:p[0],y0:p[1],t:performance.now(),moved:false,multi:false,dx:0};
  else if(g){g.multi=true;g.dx=0;g.pinch=pinchOf()}
});
lbStage.addEventListener('pointermove',e=>{
  if(!pts.has(e.pointerId)||!g||!view.ready)return;
  const prev=pts.get(e.pointerId),p=stagePos(e);pts.set(e.pointerId,p);
  if(pts.size>=2){
    const now=pinchOf(),was=g.pinch;g.pinch=now;
    view.x+=now.x-was.x;view.y+=now.y-was.y;
    zoomAt(now.x,now.y,view.s*now.d/was.d);
  }else{
    if(Math.hypot(p[0]-g.x0,p[1]-g.y0)>8)g.moved=true;
    if(!g.moved)return;
    if(view.s>1.01){view.x+=p[0]-prev[0];view.y+=p[1]-prev[1];clampView();applyView()}
    else if(!g.multi){g.dx=p[0]-g.x0;applyView(false,g.dx)}   // sem zoom: a imagem acompanha o dedo para o lado
  }
});
function pointerEnd(e){
  if(!pts.has(e.pointerId))return;
  const p=pts.get(e.pointerId);pts.delete(e.pointerId);
  if(pts.size||!g)return;
  const was=g;g=null;
  if(e.type==='pointercancel'){applyView(true);return}
  if(was.multi){if(view.s<1.02)zoomAt(p[0],p[1],1,true);return}
  if(was.moved){
    if(view.s<=1.01){Math.abs(was.dx)>Math.min(90,stageSize()[0]/5)?showInLightbox(view.i+(was.dx<0?1:-1)):applyView(true)}
    return;
  }
  // um toque: fora da imagem fecha; dois seguidos na imagem ampliam ou repõem
  if(!onImage(p[0],p[1])){lastTap=null;closeLightbox();return}
  const t=performance.now();
  if(lastTap&&t-lastTap.t<320&&Math.hypot(p[0]-lastTap.x,p[1]-lastTap.y)<40){lastTap=null;zoomAt(p[0],p[1],view.s>1.01?1:Math.min(view.max,3),true)}
  else lastTap={t,x:p[0],y:p[1]};
}
lbStage.addEventListener('pointerup',pointerEnd);
lbStage.addEventListener('pointercancel',pointerEnd);
lb.addEventListener('wheel',e=>{e.preventDefault();if(!view.ready)return;const[x,y]=stagePos(e);zoomAt(x,y,view.s*Math.exp(-e.deltaY*(e.ctrlKey?.01:.002)))},{passive:false});
document.addEventListener('keydown',e=>{
  if(e.target.closest('input'))return;
  if(lb.hidden){   // as setas viram a página da galeria quando ela está à vista
    const r=shotsEl.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)return;
    if(e.key==='ArrowLeft')showShots(shotPage-1);if(e.key==='ArrowRight')showShots(shotPage+1);
    return;
  }
  const[sw,sh]=stageSize();
  if(e.key==='Escape')closeLightbox();
  else if(e.key==='ArrowLeft')showInLightbox(view.i-1);
  else if(e.key==='ArrowRight')showInLightbox(view.i+1);
  else if(e.key==='+'||e.key==='=')zoomAt(sw/2,sh/2,view.s*1.5,true);
  else if(e.key==='-')zoomAt(sw/2,sh/2,view.s/1.5,true);
  else if(e.key==='0')zoomAt(sw/2,sh/2,1,true);
});

// ---------- Crónicas: o devlog por mês e, dentro do mês, por dia ----------
// Os meses e os dias mais recentes primeiro; só o mês mais recente abre. O conteúdo de um dia e o texto de um prompt
// só entram na página quando se abrem (os prompts são ~4 MB de texto).
const MONTH=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAY=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const STATUS={respondido:['feito','done'],fechado:['fechado','closed'],enviado:['enviado','sent']};
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const daysEl=$('days'),qInfo=$('qInfo');
const COMMIT_LIST=window.COMMITS||[];
const PROMPT_BY_N=new Map(PROMPTS.map(p=>[p.n,p]));
let shown={};   // dia -> {ps, cm}: o que a pesquisa atual deixa ver
const counts=(p,c)=>[p?plural(p,'prompt','prompts'):'',c?plural(c,'commit','commits'):''].filter(Boolean).join(' · ');
const promptRow=p=>{const[label,cls]=STATUS[p.status]||['por enviar','todo'];
  return `<details class="entry" data-n="${p.n}"><summary><span class="num">#${p.n}</span><b>${esc(p.title)}</b><span class="tag ${cls}">${label}</span></summary><div class="body"></div></details>`};
const promptBody=p=>(p.text?md(p.text):'<p class="none">Sem texto de prompt registado.</p>')+(p.result?`<div class="res"><b>Resultado</b>${inline(p.result)}</div>`:'');
const dayBody=(d,open)=>{const{ps,cm}=shown[d];
  return ps.map(promptRow).join('')+(cm.length?`<details class="entry commits"${open?' open':''}><summary><span class="num">git</span><b>Commits do dia</b><span class="tag plain">${cm.length}</span></summary><div class="body"><ul class="commit-list">${cm.map(c=>`<li><code>${esc(c.hash)}</code><span>${inline(c.msg)}</span></li>`).join('')}</ul></div></details>`:'')};
function render(q=''){
  q=norm(q.trim());shown={};
  let np=0,nc=0;
  for(const p of PROMPTS){
    if(q&&!(p._h??=norm(p.title+' '+p.text+' #'+p.n)).includes(q))continue;
    (shown[p.day]??={ps:[],cm:[]}).ps.push(p);np++;
  }
  for(const c of COMMIT_LIST){
    if(q&&!(c._h??=norm(c.msg+' '+c.hash)).includes(q))continue;
    (shown[c.day]??={ps:[],cm:[]}).cm.push(c);nc++;
  }
  const days=Object.keys(shown).sort().reverse(),months=[];
  for(const d of days){
    shown[d].ps.sort((a,b)=>a.n-b.n);
    const k=d.slice(0,7);
    if(months.at(-1)?.k!==k)months.push({k,days:[],p:0,c:0});
    const m=months.at(-1);m.days.push(d);m.p+=shown[d].ps.length;m.c+=shown[d].cm.length;
  }
  qInfo.hidden=!q;
  if(q)qInfo.textContent=days.length?`${counts(np,nc)} em ${plural(days.length,'dia','dias')}`:'';
  daysEl.innerHTML=months.map((m,i)=>{
    const[y,mm]=m.k.split('-');
    return `<details class="month"${q||i===0?' open':''}><summary><h3>${MONTH[mm-1]} <span>${y}</span></h3><span class="meta">${counts(m.p,m.c)} · ${plural(m.days.length,'dia','dias')}</span><span class="chev" aria-hidden="true"></span></summary><div class="daylist">`+
      m.days.map(d=>{const[yy,mo,dd]=d.split('-'),{ps,cm}=shown[d];
        return `<details class="day" data-day="${d}"${q?' open':''}><summary><span class="date"><b>${+dd}</b><span>${WEEKDAY[new Date(yy,mo-1,dd).getDay()]}</span></span><span class="meta">${counts(ps.length,cm.length)}</span><span class="chev" aria-hidden="true"></span></summary><div class="entries">${q?dayBody(d,true):''}</div></details>`}).join('')+
      `</div></details>`;
  }).join('')||'<p class="none">Nada encontrado.</p>';
}
// abrir um dia ou um prompt preenche-o (uma vez)
daysEl.addEventListener('toggle',e=>{
  const el=e.target;if(!el.open)return;
  if(el.classList.contains('day')){const box=el.lastElementChild;if(!box.childElementCount)box.innerHTML=dayBody(el.dataset.day,false)}
  else if(el.dataset.n){const box=el.lastElementChild;if(!box.childElementCount)box.innerHTML=promptBody(PROMPT_BY_N.get(+el.dataset.n))}
},true);
let qTimer=0;
$('q').oninput=e=>{clearTimeout(qTimer);const v=e.target.value;qTimer=setTimeout(()=>render(v),160)};
render();
