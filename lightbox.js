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
  const n=lbList.length;view.i=(i+n)%n;view.ready=false;
  const s=lbList[view.i];
  // um <img> novo por captura: um reaproveitado guardava as medidas da anterior até a nova acabar de carregar
  const img=new Image();img.draggable=false;img.alt=s.t;img.src=s.src;lbImg.replaceWith(img);lbImg=img;
  lbCap.querySelector('b').textContent=s.t;lbCap.querySelector('span').textContent=s.d;
  lbCap.querySelector('small').textContent=`${view.i+1} / ${n}`;
  lb.classList.remove('zoomed');
  // as medidas chegam antes do fim do carregamento (um GIF grande vai aparecendo)
  const me=view.i,wait=()=>{if(lb.hidden||view.i!==me)return;lbImg.naturalWidth?layoutView():requestAnimationFrame(wait)};wait();
  for(const d of[1,-1]){const o=lbList[(view.i+d+n)%n];new Image().src=o.src}
}
let lbList=[];
function openLightbox(list,i,from){
  lbList=list;lbFrom=from||null;lb.hidden=false;showInLightbox(i);
  history.pushState({lightbox:true},'');
  lb.querySelector('.lb-close').focus({preventScroll:true});
}
function hideLightbox(){lb.hidden=true;lbImg.removeAttribute('src');pts.clear();g=null;lbFrom?.isConnected&&lbFrom.focus({preventScroll:true})}
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
  if(lb.hidden)return;
  const[sw,sh]=stageSize();
  if(e.key==='Escape')closeLightbox();
  else if(e.key==='ArrowLeft')showInLightbox(view.i-1);
  else if(e.key==='ArrowRight')showInLightbox(view.i+1);
  else if(e.key==='+'||e.key==='=')zoomAt(sw/2,sh/2,view.s*1.5,true);
  else if(e.key==='-')zoomAt(sw/2,sh/2,view.s/1.5,true);
  else if(e.key==='0')zoomAt(sw/2,sh/2,1,true);
});
