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
document.getElementById('shotGrid').innerHTML=SHOTS.map(s=>`<figure class="shot" data-f="${s.f}"><img src="img/${s.f}.png" alt="${esc(s.t)}" loading="lazy"><figcaption><b>${esc(s.t)}</b><span>${esc(s.d)}</span></figcaption></figure>`).join('');
const lb=document.getElementById('lightbox');
document.getElementById('shotGrid').onclick=e=>{const f=e.target.closest('.shot');if(!f)return;lb.querySelector('img').src=f.querySelector('img').src;lb.querySelector('p').textContent=f.querySelector('b').textContent;lb.hidden=false};
lb.onclick=()=>lb.hidden=true;
const daysEl=document.getElementById('days');
function render(q=''){
  q=q.toLowerCase();
  const by={};
  for(const p of PROMPTS){
    if(q&&!(p.title+' '+p.text+' '+p.n).toLowerCase().includes(q))continue;
    (by[p.day]??=[]).push(p);
  }
  daysEl.innerHTML=Object.keys(by).sort().map(d=>{
    const ps=by[d].sort((a,b)=>a.n-b.n);
    return `<details class="day" ${q?'open':''}><summary><span>${dayLabel(d)}</span><span>${ps.length} prompts</span></summary><div class="entries">`+
    ps.map(p=>`<details class="entry"><summary><span class="num">#${p.n}</span> <b>${esc(p.title)}</b> <span class="tag ${p.status==='respondido'?'':'por'}">${p.status==='respondido'?'feito':'por enviar'}</span></summary><div class="body">${p.text?md(p.text):'<p><i>Sem texto de prompt registado.</i></p>'}${p.result?`<div class="res"><b>Resultado:</b> ${inline(p.result)}</div>`:''}</div></details>`).join('')+`</div></details>`;
  }).join('')||'<p>Nada encontrado.</p>';
}
document.getElementById('q').oninput=e=>render(e.target.value);
render();
