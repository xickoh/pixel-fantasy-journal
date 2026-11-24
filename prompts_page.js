// ---------- Crónicas: o devlog por mês e, dentro do mês, por dia ----------
// Os meses e os dias mais recentes primeiro; só o mês mais recente abre. O conteúdo de um dia e o texto de um prompt
// só entram na página quando se abrem (os prompts são ~4 MB de texto).
//const MONTH=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
//const WEEKDAY=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const STATUS={respondido:['feito','done'],fechado:['fechado','closed'],enviado:['enviado','sent']};
//const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
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

// ligação direta: prompts.html#123 abre o dia e o prompt 123
function openPrompt(){
  const n=+location.hash.slice(1);const p=PROMPT_BY_N.get(n);if(!p)return;
  $('q').value='';render();
  const day=daysEl.querySelector(`.day[data-day="${p.day}"]`);if(!day)return;
  day.closest('.month').open=true;day.open=true;
  const row=day.querySelector(`.entry[data-n="${n}"]`);if(!row)return;
  row.open=true;row.scrollIntoView({block:'center'});row.classList.add('hit');
}
addEventListener('hashchange',openPrompt);openPrompt();
