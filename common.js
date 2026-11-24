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
const MONTH=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAY=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
// versões do devlog (semver): a primeira entrada é 0.1.0; cada entrada nova (t:'feat') sobe o 2º número e zera o 3º; cada correção ou ajuste de valores (t:'fix') sobe o 3º
let _mi=0,_pa=-1;
const DEV=(window.DEVLOG||[]).map((e,i)=>{if(e.t==='fix')_pa++;else{_mi++;_pa=0}return{...e,v:`0.${_mi}.${_pa}`,i}});   // por ordem de escrita: do mais antigo ao mais recente
const DEV_BY_V=new Map(DEV.map(e=>[e.v,e]));
const shotUrl=f=>`img/${f}`;   // f já traz a extensão (png ou gif)
const dayLong=d=>{const[y,m,dd]=d.split('-');return `${+dd} de ${MONTH[m-1].toLowerCase()} de ${y}`};

