const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const inline=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
function md(t){
  const out=[];let list=null;
  for(const l of t.split('\n')){
    const m=l.match(/^\s*[-*] (.*)/);
    if(m){(list??=[]).push('<li>'+inline(m[1])+'</li>');continue}
    if(list){out.push('<ul>'+list.join('')+'</ul>');list=null}
    if(l.trim())out.push('<p>'+inline(l)+'</p>');
  }
  if(list)out.push('<ul>'+list.join('')+'</ul>');
  return out.join('');
}
const MONTH=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const dayLabel=d=>{const[y,m,x]=d.split('-');return `${+x} de ${MONTH[m-1]} de ${y}`};
document.getElementById('featureGrid').innerHTML=FEATURES.map(f=>`<div class="card ${f.color}"><h3>${f.icon} ${f.title}</h3><ul>${f.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
// Galeria: as capturas mais recentes primeiro (o SHOTS cresce no fim), 9 por página num carrossel
const SHOTS_DESC=SHOTS.slice().reverse(),PER=9,PAGES=Math.ceil(SHOTS_DESC.length/PER);
let shotPage=0;
const shotEl=document.getElementById('shotGrid'),shotInfo=document.getElementById('shotInfo'),shotDots=document.getElementById('shotDots');
const shotCard=s=>`<figure class="shot" data-f="${s.f}"><img src="img/${s.f}.${s.ext||"png"}" alt="${esc(s.t)}" loading="lazy"><figcaption><b>${esc(s.t)}</b><span>${esc(s.d)}</span></figcaption></figure>`;
function showShots(p){
  shotPage=(p+PAGES)%PAGES;
  shotEl.innerHTML=SHOTS_DESC.slice(shotPage*PER,shotPage*PER+PER).map(shotCard).join('');
  const a=shotPage*PER+1,b=Math.min(a+PER-1,SHOTS_DESC.length);
  shotInfo.textContent=`${a}–${b} de ${SHOTS_DESC.length}`;
  shotDots.innerHTML=Array.from({length:PAGES},(_,i)=>`<button type="button" class="dot${i===shotPage?' on':''}" data-p="${i}" aria-label="Página ${i+1}"></button>`).join('');
}
document.getElementById('shotPrev').onclick=()=>showShots(shotPage-1);
document.getElementById('shotNext').onclick=()=>showShots(shotPage+1);
shotDots.onclick=e=>{const d=e.target.closest('.dot');if(d)showShots(+d.dataset.p)};
document.addEventListener('keydown',e=>{if(!lb.hidden||e.target.closest('input'))return;const r=document.getElementById('shots').getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;if(e.key==='ArrowLeft')showShots(shotPage-1);if(e.key==='ArrowRight')showShots(shotPage+1)});
// A página só muda quando se interage: os botões, os pontos, as setas ou um arrastar do dedo claramente na horizontal
// (o scroll vertical da página nunca vira a página; um arrastar não abre a imagem)
let touch=null,swiped=false;
shotEl.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
shotEl.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;
  if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy)){swiped=true;setTimeout(()=>swiped=false,400);showShots(shotPage+(dx<0?1:-1))}});
const lb=document.getElementById('lightbox');
showShots(0);
// Ampliar: num telemóvel (ecrã tátil) a imagem abre em ecrã inteiro; tocar de novo (ou voltar atrás) fecha
const touchScreen=matchMedia('(pointer:coarse)').matches;
function closeLightbox(){lb.hidden=true;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}
document.getElementById('shotGrid').onclick=e=>{const f=e.target.closest('.shot');if(!f||swiped)return;lb.querySelector('img').src=f.querySelector('img').src;lb.querySelector('p').textContent=f.querySelector('b').textContent;lb.hidden=false;
  if(touchScreen){lb.classList.add('full');lb.requestFullscreen?.().catch(()=>{})}else lb.classList.remove('full')};
lb.onclick=closeLightbox;
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&!lb.hidden&&lb.classList.contains('full'))lb.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden)closeLightbox()});
const daysEl=document.getElementById('days');
const COMMIT_LIST=window.COMMITS||[];
function render(q=''){
  q=q.toLowerCase();
  const by={},cs={};
  for(const p of PROMPTS){
    if(q&&!(p.title+' '+p.text+' '+p.n).toLowerCase().includes(q))continue;
    (by[p.day]??=[]).push(p);
  }
  for(const c of COMMIT_LIST){
    if(q&&!(c.msg+' '+c.hash).toLowerCase().includes(q))continue;
    (cs[c.day]??=[]).push(c);
  }
  const days=[...new Set([...Object.keys(by),...Object.keys(cs)])].sort();
  daysEl.innerHTML=days.map(d=>{
    const ps=(by[d]||[]).sort((a,b)=>a.n-b.n),cm=cs[d]||[];
    const counts=[ps.length?`${ps.length} prompts`:'',cm.length?`${cm.length} commits`:''].filter(Boolean).join(' · ');
    return `<details class="day" ${q?'open':''}><summary><span>${dayLabel(d)}</span><span>${counts}</span></summary><div class="entries">`+
    ps.map(p=>`<details class="entry"><summary><span class="num">#${p.n}</span> <b>${esc(p.title)}</b> <span class="tag ${p.status==='respondido'?'':'por'}">${p.status==='respondido'?'feito':'por enviar'}</span></summary><div class="body">${p.text?md(p.text):'<p><i>Sem texto de prompt registado.</i></p>'}${p.result?`<div class="res"><b>Resultado:</b> ${inline(p.result)}</div>`:''}</div></details>`).join('')+
    (cm.length?`<details class="entry commits" ${q?'open':''}><summary><span class="num">git</span> <b>Commits do dia</b> <span class="tag">${cm.length}</span></summary><div class="body"><ul class="commit-list">${cm.map(c=>`<li><code>${esc(c.hash)}</code> ${inline(c.msg)}</li>`).join('')}</ul></div></details>`:'')+
    `</div></details>`;
  }).join('')||'<p>Nada encontrado.</p>';
}
document.getElementById('q').oninput=e=>render(e.target.value);
render();
