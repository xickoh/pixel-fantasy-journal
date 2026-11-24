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
// versões do devlog: 0.001.000 é a primeira entrada; o último bloco sobe de 1 em 1 até 999 e depois passa ao do meio
const fmtVersion=i=>`0.${String(1+Math.floor(i/1000)).padStart(3,'0')}.${String(i%1000).padStart(3,'0')}`;
const DEV=(window.DEVLOG||[]).map((e,i)=>({...e,v:fmtVersion(i),i}));   // por ordem de escrita: do mais antigo ao mais recente
const DEV_BY_V=new Map(DEV.map(e=>[e.v,e]));
const shotUrl=f=>`img/${f}`;   // f já traz a extensão (png ou gif)
const dayLong=d=>{const[y,m,dd]=d.split('-');return `${+dd} de ${MONTH[m-1].toLowerCase()} de ${y}`};

