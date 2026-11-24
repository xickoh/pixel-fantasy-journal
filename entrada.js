// Página de uma entrada do devlog: entrada.html#0.001.003
const root=$('entry');
function show(){
  const e=DEV_BY_V.get(location.hash.slice(1));
  if(!e){root.innerHTML='<p class="none">Entrada não encontrada. <a href="index.html#devlog">Voltar às crónicas</a></p>';return}
  document.title=`${e.title} · Pixel Fantasy Journal`;
  const imgs=[e.shot,...(e.extra||[])].filter(Boolean),list=imgs.map(f=>({src:shotUrl(f),t:e.title,d:e.v}));
  const prev=DEV[e.i-1],next=DEV[e.i+1];
  root.innerHTML=`<p class="crumb"><a href="index.html#devlog">← Crónicas</a></p><p class="eyebrow">Versão ${e.v} · ${dayLong(e.day)}</p><h1>${esc(e.title)}</h1><p class="lead2">${esc(e.desc)}</p>`+
    imgs.map((f,i)=>`<button type="button" class="big" data-i="${i}" aria-label="Ampliar"><img src="${shotUrl(f)}" alt="${esc(e.title)}"></button>`).join('')+
    (e.prompt?`<p><a class="btn alt" href="prompts.html#${e.prompt}">Ver o prompt #${e.prompt} no histórico</a></p>`:'')+
    `<div class="nextprev">${prev?`<a href="#${prev.v}">← ${prev.v} ${esc(prev.title)}</a>`:'<span></span>'}${next?`<a href="#${next.v}">${next.v} ${esc(next.title)} →</a>`:''}</div>`;
  root.querySelectorAll('.big').forEach(b=>b.onclick=()=>openLightbox(list,+b.dataset.i,b));
  scrollTo(0,0);
}
addEventListener('hashchange',show);show();
