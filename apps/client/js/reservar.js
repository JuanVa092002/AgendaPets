const KEY_S="servicios",KEY_C="citas",HORAS=["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"],DIAS=["LUN","MAR","MIÉ","JUE","VIE","SÁB"],DIA_NOM=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],MESES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const $ = (id) => document.getElementById(id);
const inicioSemana = (f) => { const d=new Date(f), n=d.getDay(); d.setDate(d.getDate()+(n===0?-6:1-n)); d.setHours(0,0,0,0); return d; };
const estado = { paso:1, ids:[], fecha:null, hora:null, mesVista:new Date(), semanaInicio:inicioSemana(new Date()) };
const money = (n) => "$ " + Number(n).toLocaleString("es-CO");
const ymd = (f) => { const d=new Date(f); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const hoy = ymd(new Date());
const avis = (t,x,i="warning") => Swal.fire({ title:t, text:x, icon:i, confirmButtonColor:"#7C9A4A" });
const servicios = () => JSON.parse(localStorage.getItem(KEY_S)||"[]").filter(s => s.visible!==false);
const elegidos = () => servicios().filter(s => estado.ids.includes(s.id));
const citas = () => JSON.parse(localStorage.getItem(KEY_C)||"[]");
const total = () => elegidos().reduce((a,s)=>a+Number(s.precio),0);
const etiqueta = () => { const e=elegidos(); return e.length>1?`${e[0].nombre} +${e.length-1}`:(e[0]?.nombre||""); };
const icono = (n) => { n=n.toLowerCase(); return n.includes("uña")?"bi-heart":n.includes("corte")?"bi-scissors":n.includes("spa")||n.includes("premium")?"bi-stars":n.includes("dental")?"bi-award":n.includes("baño")||n.includes("bano")?"bi-droplet":"bi-paw-fill"; };
const abierta = (iso,h) => { const d=new Date(iso+"T00:00:00").getDay(); return d!==0 && (d===6?h>="09:00"&&h<"16:00":true); };
const ocupada = (iso,h) => citas().find(c => c.fecha===iso && c.hora===h);
const clock = (h) => { const n=+h.slice(0,2); return `${String(n).padStart(2,"0")}.00 ${n<12?"AM":"PM"}`; };
const rango = (h) => { const n=+h.slice(0,2); return `${n%12||12} ${n<12?"AM":"PM"} - ${(n+1)%12||12} ${(n+1)<12?"AM":"PM"}`; };
const mascota = () => ({ nombre:$("mascota-nombre").value.trim(), tipo:$("mascota-tipo").value, raza:$("mascota-raza").value.trim(), tamano:$("mascota-tamano").value, dueno:$("dueno-nombre").value.trim(), telefono:$("dueno-telefono").value.trim(), notas:$("mascota-notas").value.trim() });
const ampm = (h) => { const [H,M]=h.split(":"); const n=+H; return `${n%12||12}:${M} ${n<12?"a. m.":"p. m."}`; };

function pintarPick(){
  const n=estado.ids.length, bits=[n?`${n} servicio${n>1?"s":""} · ${money(total())}`:"Elige un servicio"];
  if(estado.fecha&&estado.hora) bits.push(`${estado.fecha.slice(8)} ${MESES[+estado.fecha.slice(5,7)-1].slice(0,3)} · ${ampm(estado.hora)}`);
  $("reserva-pick").textContent=bits.join("  ·  ");
}

function pintarServicios(){
  const lista=servicios();
  $("lista-servicios").innerHTML = lista.length ? lista.map(s => `<button type="button" class="reserva-card ${estado.ids.includes(s.id)?"is-selected":""}" data-id="${s.id}"><i class="check"></i><span class="ico"><i class="bi ${icono(s.nombre)}"></i></span><span><h2>${s.nombre}</h2><p>${s.descripcion||""}</p></span><span><strong>${money(s.precio)}</strong><small>${s.duracion}</small></span></button>`).join("") : `<p class="lead">Aún no hay servicios en el panel de la peluquería.</p>`;
  pintarPick();
}

function pintarFecha(){
  const v=estado.mesVista, y=v.getFullYear(), m=v.getMonth(), off=new Date(y,m,1).getDay(), tot=new Date(y,m+1,0).getDate();
  let h=`<div class="cal-top"><button type="button" data-mes="-1"><i class="bi bi-chevron-left"></i></button><strong>${MESES[m]} ${y}</strong><button type="button" data-mes="1"><i class="bi bi-chevron-right"></i></button></div><table><thead><tr>${["D","L","M","M","J","V","S"].map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>`, d=1-off;
  for(let f=0;f<6;f++){ h+="<tr>"; for(let c=0;c<7;c++){ if(d<1||d>tot) h+="<td></td>"; else { const iso=ymd(new Date(y,m,d)), past=iso<hoy || new Date(iso+"T00:00:00").getDay()===0; h+=`<td><button type="button" class="${estado.fecha===iso?"is-on":""}" data-fecha="${iso}" ${past?"disabled":""}>${d}</button></td>`; } d++; } h+="</tr>"; }
  $("mini-calendario").innerHTML=h+"</tbody></table>";
  if(!estado.fecha){ $("dia-elegido").textContent="Selecciona un día"; $("lista-horas").innerHTML=""; pintarGrilla(); return; }
  const [yy,mm,dd]=estado.fecha.split("-");
  $("dia-elegido").textContent=`${dd} de ${MESES[mm-1]}`;
  const libres=HORAS.filter(hr => abierta(estado.fecha,hr) && !ocupada(estado.fecha,hr));
  const man=libres.filter(hr=>hr<"13:00"), tar=libres.filter(hr=>hr>="13:00");
  const grupo=(t,arr)=> arr.length?`<div class="hora-grupo"><small>${t}</small><div>${arr.map(hr=>`<button type="button" class="hora ${estado.hora===hr?"is-on":""}" data-hora="${hr}">${ampm(hr)}</button>`).join("")}</div></div>`:"";
  $("lista-horas").innerHTML = libres.length ? grupo("Mañana",man)+grupo("Tarde",tar) : `<p class="lead">No hay horarios libres este día.</p>`;
  pintarGrilla();
}

function pintarGrilla(){
  const ini=estado.semanaInicio, q=($("buscar-cita").value||"").trim().toLowerCase();
  const dias=[...Array(6)].map((_,i)=>{ const d=new Date(ini); d.setDate(ini.getDate()+i); return d; });
  $("semana-titulo").textContent=`${MESES[ini.getMonth()]} ${ini.getFullYear()}`;
  let h=`<div class="agenda-grid__cell is-head">GMT-5</div>`+dias.map(d=>`<div class="agenda-grid__cell is-head">${DIAS[d.getDay()===0?6:d.getDay()-1]} ${d.getDate()}</div>`).join("");
  HORAS.forEach((hora,i)=>{
    h+=`<div class="agenda-grid__cell is-time ${hora===estado.hora||(!estado.hora&&hora==="10:00")?"is-now":""}"><span>${clock(hora)}</span></div>`;
    dias.forEach(d=>{
      const iso=ymd(d), oc=ocupada(iso,hora), ok=abierta(iso,hora)&&iso>=hoy, sel=estado.fecha===iso&&estado.hora===hora;
      const hide=q && oc && !`${oc.servicio} ${oc.mascota||""}`.toLowerCase().includes(q);
      const cls=!ok||hide?"is-libre":oc?"is-ocupado":sel?"is-libre is-on":"is-libre";
      const txt=(!hide&&oc)?`${oc.servicio}<br>${rango(hora)}`:sel?`${etiqueta()}<br>${rango(hora)}`:"";
      h+=`<div class="agenda-grid__cell"><button type="button" class="agenda-slot ${cls}" data-fecha="${iso}" data-hora="${hora}" ${!ok||oc?"disabled":""}>${txt}</button></div>`;
    });
  });
  $("grilla-semana").innerHTML=h;
}

function pintarResumen(){
  const m=mascota(), [y,mo,d]=estado.fecha.split("-");
  $("resumen-cita").innerHTML=`<ul>${elegidos().map(s=>`<li><span>${s.nombre}<br><small>${s.duracion}</small></span><strong>${money(s.precio)}</strong></li>`).join("")}</ul><p class="meta">${m.nombre} · ${m.tipo} ${m.tamano}${m.raza?" · "+m.raza:""}<br>${m.dueno} · ${m.telefono}<br>${d} de ${MESES[mo-1]} · ${ampm(estado.hora)}${m.notas?"<br>"+m.notas:""}</p><p class="total">${money(total())}</p>`;
}

function mostrarPaso(p){
  estado.paso=p;
  document.querySelectorAll(".reserva-panel").forEach(el => el.classList.toggle("d-none", Number(el.dataset.panel)!==p));
  document.querySelectorAll(".reserva-stepper li").forEach(el => { const n=Number(el.dataset.paso); el.classList.toggle("is-active",n===p); el.classList.toggle("is-done",n<p); });
  $("btn-continuar").textContent = p===4 ? "Confirmar cita" : "Continuar";
  if(p===3) pintarFecha();
  if(p===4) pintarResumen();
  pintarPick();
}

function validar(){
  if(estado.paso===1 && !estado.ids.length) return "Selecciona uno o más servicios.";
  if(estado.paso===2){ const m=mascota(); if(m.nombre.length<2) return "Indica el nombre de tu mascota."; if(!m.tipo||!m.tamano) return "Completa tipo y tamaño."; if(m.dueno.length<3) return "Indica tu nombre."; if(!/^\d{10}$/.test(m.telefono)) return "El WhatsApp debe tener 10 dígitos."; }
  if(estado.paso===3 && (!estado.fecha||!estado.hora)) return "Elige un día y un horario libre.";
}

$("lista-servicios").onclick = (e) => { const c=e.target.closest(".reserva-card"); if(!c) return; const id=Number(c.dataset.id); estado.ids=estado.ids.includes(id)?estado.ids.filter(x=>x!==id):estado.ids.concat(id); pintarServicios(); };
$("btn-atras").onclick = () => estado.paso===1 ? location.href="index.html" : mostrarPaso(estado.paso-1);
$("btn-continuar").onclick = () => { const err=validar(); if(err) return avis("Falta un dato", err); if(estado.paso!==4) return mostrarPaso(estado.paso+1); const m=mascota(); localStorage.setItem(KEY_C, JSON.stringify(citas().concat({ id:Date.now(), servicios:elegidos(), servicio:etiqueta(), precio:total(), ...m, mascota:m.nombre, fecha:estado.fecha, hora:estado.hora }))); avis("Cita confirmada", `La cita de ${m.nombre} queda para el ${DIA_NOM[new Date(estado.fecha+"T00:00:00").getDay()]} ${estado.fecha} a las ${ampm(estado.hora)}.`, "success").then(()=> location.href="index.html"); };
$("mini-calendario").onclick = (e) => { const m=e.target.closest("[data-mes]"); if(m){ estado.mesVista=new Date(estado.mesVista.getFullYear(), estado.mesVista.getMonth()+Number(m.dataset.mes),1); pintarFecha(); return; } const d=e.target.closest("[data-fecha]"); if(!d||d.disabled) return; estado.fecha=d.dataset.fecha; estado.hora=null; estado.semanaInicio=inicioSemana(new Date(estado.fecha+"T00:00:00")); pintarFecha(); pintarPick(); };
$("lista-horas").onclick = (e) => { const b=e.target.closest("[data-hora]"); if(!b) return; estado.hora=b.dataset.hora; pintarFecha(); pintarPick(); };
$("grilla-semana").onclick = (e) => { const s=e.target.closest(".agenda-slot.is-libre"); if(!s) return; estado.fecha=s.dataset.fecha; estado.hora=s.dataset.hora; estado.mesVista=new Date(estado.fecha+"T00:00:00"); pintarFecha(); pintarPick(); };
$("semana-prev").onclick = () => { estado.semanaInicio.setDate(estado.semanaInicio.getDate()-7); pintarFecha(); };
$("semana-next").onclick = () => { estado.semanaInicio.setDate(estado.semanaInicio.getDate()+7); pintarFecha(); };
$("buscar-cita").oninput = pintarGrilla;
pintarServicios();
mostrarPaso(Number(new URLSearchParams(location.search).get("paso")) || 1);
