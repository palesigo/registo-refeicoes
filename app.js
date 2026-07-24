const KEY = "registo-refeicoes-v1";
const $ = s => document.querySelector(s);
let meals = read();
function read(){try{return JSON.parse(localStorage.getItem(KEY)) || []}catch{return []}}
function save(){localStorage.setItem(KEY, JSON.stringify(meals))}
function localDate(d=new Date()){const offset=d.getTimezoneOffset()*60000;return new Date(d-offset).toISOString().slice(0,10)}
function esc(s){return s.replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function displayDate(date){const today=localDate(), yesterday=localDate(new Date(Date.now()-86400000));if(date===today)return "Hoje";if(date===yesterday)return "Ontem";return new Intl.DateTimeFormat("pt-PT",{day:"numeric",month:"short"}).format(new Date(date+"T12:00:00"))}
function render(){const today=localDate();$("#todayCount").textContent=meals.filter(x=>x.date===today).length;$("#today").textContent=new Intl.DateTimeFormat("pt-PT",{weekday:"long",day:"numeric",month:"long"}).format(new Date());const items=[...meals].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));$("#mealList").innerHTML=items.length?items.map(m=>`<article class="meal"><div><h3>${esc(m.type)}</h3><p>${displayDate(m.date)}${m.notes?" · "+esc(m.notes):""}</p></div><time>${m.time}</time></article>`).join(""):`<div class="empty"><strong>Ainda não há refeições</strong>Toque em “Adicionar” para criar o primeiro registo.</div>`}
function defaults(){const now=new Date();$("#date").value=localDate(now);$("#time").value=now.toTimeString().slice(0,5)}
function open(){defaults();$("#sheet").classList.remove("hidden");$("#backdrop").classList.remove("hidden")}
function close(){$("#mealForm").reset();$("#sheet").classList.add("hidden");$("#backdrop").classList.add("hidden")}
function toast(message){$("#toast").textContent=message;$("#toast").classList.remove("hidden");setTimeout(()=>$("#toast").classList.add("hidden"),2200)}
$("#addButton").onclick=open;$("#closeButton").onclick=close;$("#backdrop").onclick=close;
$("#mealForm").onsubmit=e=>{e.preventDefault();const type=document.querySelector('input[name="type"]:checked').value;meals.push({id:crypto.randomUUID(),type,date:$("#date").value,time:$("#time").value,notes:$("#notes").value.trim()});save();render();close();toast("Refeição guardada")};
$("#exportButton").onclick=()=>{const blob=new Blob([JSON.stringify(meals,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`refeicoes-${localDate()}.json`;a.click();URL.revokeObjectURL(a.href)};
$("#importButton").onclick=()=>$("#importFile").click();$("#importFile").onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw Error();meals=data;save();render();toast("Backup importado")}catch{toast("Ficheiro de backup inválido")}};r.readAsText(file);e.target.value=""};
render();