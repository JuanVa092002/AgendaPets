import{obtenerTodasLasCitas,guardarCitas,formatearDinero,obtenerCitaPorId,actualizarCita}from"./citas-storage.js";

const KEY_S="servicios";
const HORAS=["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const DIAS=["LUN","MAR","MIÉ","JUE","VIE","SÁB"];
const DIA_NOM=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const MESES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const $=id=>document.getElementById(id);
const estado={paso:1,ids:[],fecha:null,hora:null,mesVista:new Date(),semanaInicio:inicioSemana(new Date()),reprogramarId:null,citaOriginal:null};
let snapshotRevision=null;

const citas=()=>obtenerTodasLasCitas();
const money=n=>formatearDinero(n);
const servicios=()=>JSON.parse(localStorage.getItem(KEY_S)||"[]").filter(s=>s.visible!==false).map(s=>({...s,id:Number(s.id),precio:Number(s.precio||0)}));
const elegidos=()=>servicios().filter(s=>estado.ids.includes(Number(s.id)));
const total=()=>elegidos().reduce((a,s)=>a+Number(s.precio||0),0);
const etiqueta=()=>{const e=elegidos();return e.length>1?`${e[0].nombre} +${e.length-1}`:(e[0]?.nombre||"");};
const icono=n=>{n=String(n).toLowerCase();if(n.includes("uña"))return"bi-heart";if(n.includes("corte"))return"bi-scissors";if(n.includes("spa")||n.includes("premium"))return"bi-stars";if(n.includes("dental"))return"bi-award";if(n.includes("baño")||n.includes("bano"))return"bi-droplet";return"bi-paw-fill";};
const ymd=f=>{const d=new Date(f);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
const hoy=ymd(new Date());
const avis=(titulo,texto,icon="warning")=>Swal.fire({title:titulo,text:texto,icon,confirmButtonColor:"#7C9A4A"});

function inicioSemana(f){const d=new Date(f),n=d.getDay();d.setDate(d.getDate()+(n===0?-6:1-n));d.setHours(0,0,0,0);return d;}

const abierta=(iso,h)=>{const d=new Date(iso+"T00:00:00").getDay();if(d===0)return false;if(d===6)return h>="09:00"&&h<"16:00";return true;};
const ocupada=(iso,h)=>citas().find(c=>c.fecha===iso&&c.hora===h&&Number(c.id)!==Number(estado.reprogramarId||0));
const clock=h=>{const n=Number(h.slice(0,2));return`${String(n).padStart(2,"0")}.00 ${n<12?"AM":"PM"}`;};
const rango=h=>{const n=Number(h.slice(0,2));return`${n%12||12} ${n<12?"AM":"PM"} - ${(n+1)%12||12} ${n+1<12?"AM":"PM"}`;};
const ampm=h=>{const[H,M]=h.split(":");const n=Number(H);return`${n%12||12}:${M} ${n<12?"a. m.":"p. m."}`;};

const mascota=()=>{
    const s=window.AgendaAuth?.sesion?.();
    return{nombre:$("mascota-nombre").value.trim(),tipo:$("mascota-tipo").value,raza:$("mascota-raza").value.trim(),tamano:$("mascota-tamano").value,dueno:($("dueno-nombre")?.value||"").trim()||s?.nombre||"",correo:($("dueno-correo")?.value||"").trim()||s?.email||"",notas:$("mascota-notas").value.trim()};
};

function pintarPick(){
    const n=estado.ids.length,bits=[n?`${n} servicio${n>1?"s":""} · ${money(total())}`:"Elige un servicio"];
    if(estado.fecha&&estado.hora)bits.push(`${estado.fecha.slice(8)} ${MESES[Number(estado.fecha.slice(5,7))-1].slice(0,3)} · ${ampm(estado.hora)}`);
    $("reserva-pick").textContent=bits.join(" · ");
}

function pintarServicios(){
    const lista=servicios();
    $("lista-servicios").innerHTML=lista.length?lista.map(s=>`
        <button type="button" class="reserva-card ${estado.ids.includes(Number(s.id))?"is-selected":""}" data-id="${s.id}">
            <i class="check"></i>
            <span class="ico"><i class="bi ${icono(s.nombre)}"></i></span>
            <span><h2>${s.nombre}</h2><p>${s.descripcion||""}</p></span>
            <span><strong>${money(s.precio)}</strong><small>${s.duracion||""}</small></span>
        </button>`).join(""):`<p class="lead">Aún no hay servicios en el panel de la peluquería.</p>`;
    pintarPick();
}

function pintarFecha(){
    const v=estado.mesVista,y=v.getFullYear(),m=v.getMonth(),off=new Date(y,m,1).getDay(),tot=new Date(y,m+1,0).getDate();
    let h=`<div class="cal-top"><button type="button" data-mes="-1"><i class="bi bi-chevron-left"></i></button><strong>${MESES[m]} ${y}</strong><button type="button" data-mes="1"><i class="bi bi-chevron-right"></i></button></div><table><thead><tr>${["D","L","M","M","J","V","S"].map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>`;
    let d=1-off;
    for(let f=0;f<6;f++){
        h+="<tr>";
        for(let c=0;c<7;c++){
            if(d<1||d>tot)h+="<td></td>";
            else{
                const iso=ymd(new Date(y,m,d)),past=iso<hoy||new Date(iso+"T00:00:00").getDay()===0;
                h+=`<td><button type="button" class="${estado.fecha===iso?"is-on":""}" data-fecha="${iso}" ${past?"disabled":""}>${d}</button></td>`;
            }
            d++;
        }
        h+="</tr>";
    }
    $("mini-calendario").innerHTML=h+"</tbody></table>";
    if(!estado.fecha){
        $("dia-elegido").textContent="Selecciona un día";
        $("lista-horas").innerHTML="";
        pintarGrilla();
        return;
    }
    const[yy,mm,dd]=estado.fecha.split("-");
    $("dia-elegido").textContent=`${dd} de ${MESES[Number(mm)-1]}`;
    const libres=HORAS.filter(hr=>abierta(estado.fecha,hr)&&!ocupada(estado.fecha,hr)),man=libres.filter(hr=>hr<"13:00"),tar=libres.filter(hr=>hr>="13:00");
    const grupo=(titulo,arr)=>arr.length?`<div class="hora-grupo"><small>${titulo}</small><div>${arr.map(hr=>`<button type="button" class="hora ${estado.hora===hr?"is-on":""}" data-hora="${hr}">${ampm(hr)}</button>`).join("")}</div></div>`:"";
    $("lista-horas").innerHTML=libres.length?grupo("Mañana",man)+grupo("Tarde",tar):`<p class="lead">No hay horarios libres este día.</p>`;
    pintarGrilla();
}

function pintarGrilla(){
    const ini=estado.semanaInicio,q=($("buscar-cita").value||"").trim().toLowerCase(),dias=[...Array(6)].map((_,i)=>{const d=new Date(ini);d.setDate(ini.getDate()+i);return d;});
    $("semana-titulo").textContent=`${MESES[ini.getMonth()]} ${ini.getFullYear()}`;
    let h=`<div class="agenda-grid__cell is-head">GMT-5</div>`;
    h+=dias.map(d=>`<div class="agenda-grid__cell is-head">${DIAS[d.getDay()===0?6:d.getDay()-1]} ${d.getDate()}</div>`).join("");
    HORAS.forEach(hora=>{
        h+=`<div class="agenda-grid__cell is-time ${hora===estado.hora||(!estado.hora&&hora==="10:00")?"is-now":""}"><span>${clock(hora)}</span></div>`;
        dias.forEach(d=>{
            const iso=ymd(d),oc=ocupada(iso,hora),ok=abierta(iso,hora)&&iso>=hoy,sel=estado.fecha===iso&&estado.hora===hora;
            const hide=q&&oc&&!`${oc.servicio||""} ${oc.mascota||""}`.toLowerCase().includes(q);
            const cls=!ok||hide?"is-libre":oc?"is-ocupado":sel?"is-libre is-on":"is-libre";
            const txt=!hide&&oc?`${oc.servicio||""}<br>${rango(hora)}`:sel?`${etiqueta()}<br>${rango(hora)}`:"";
            h+=`<div class="agenda-grid__cell"><button type="button" class="agenda-slot ${cls}" data-fecha="${iso}" data-hora="${hora}" ${!ok||oc?"disabled":""}>${txt}</button></div>`;
        });
    });
    $("grilla-semana").innerHTML=h;
}

function guardarSnapshot(){snapshotRevision={ids:[...estado.ids],fecha:estado.fecha,hora:estado.hora,mascota:mascota()};}

function restaurarSnapshot(){
    if(!snapshotRevision)return;
    estado.ids=[...snapshotRevision.ids];estado.fecha=snapshotRevision.fecha;estado.hora=snapshotRevision.hora;
    const m=snapshotRevision.mascota;
    $("mascota-nombre").value=m.nombre;$("mascota-tipo").value=m.tipo;$("mascota-raza").value=m.raza;$("mascota-tamano").value=m.tamano;
    if($("dueno-nombre"))$("dueno-nombre").value=m.dueno||"";
    if($("dueno-correo"))$("dueno-correo").value=m.correo||"";
    $("mascota-notas").value=m.notas;
    snapshotRevision=null;
}

function irAEditar(paso){guardarSnapshot();mostrarPaso(paso);}

function pintarResumen(){
    const m=mascota(),[y,mo,d]=estado.fecha.split("-"),diaNom=DIA_NOM[new Date(estado.fecha+"T00:00:00").getDay()],inicial=(m.nombre||"?").charAt(0).toUpperCase();
    const serviciosHtml=elegidos().map(s=>`<li><span class="revision-chip"><i class="bi ${icono(s.nombre)}"></i>${s.nombre}</span><span>${money(s.precio)}</span></li>`).join("");
    $("resumen-cita").innerHTML=`
        <p class="revision-hint"><i class="bi bi-pencil-square"></i>${esReprogramar()?"Revisa el nuevo horario. Si quieres, también puedes cambiar servicios o datos.":"Puedes ajustar servicios, datos o fecha antes de confirmar."}</p>
        <article class="revision-card" data-edit="1" role="button" tabindex="0">
            <div class="revision-card__head"><span class="revision-card__icon"><i class="bi bi-scissors"></i></span><div class="revision-card__copy"><h2>Servicios</h2><p>${elegidos().length} seleccionado${elegidos().length>1?"s":""} · ${money(total())}</p></div><span class="revision-edit"><i class="bi bi-pencil"></i>Cambiar</span></div>
            <ul class="revision-list">${serviciosHtml}</ul>
        </article>
        <article class="revision-card" data-edit="2" role="button" tabindex="0">
            <div class="revision-card__head"><span class="revision-card__avatar">${inicial}</span><div class="revision-card__copy"><h2>${m.nombre}</h2><p>${m.tipo}${m.tamano?` · ${m.tamano}`:""}${m.raza?` · ${m.raza}`:""}</p></div><span class="revision-edit"><i class="bi bi-pencil"></i>Cambiar</span></div>
            <div class="revision-meta"><span><i class="bi bi-person"></i>${m.dueno||"Se pide al confirmar"}</span><span><i class="bi bi-envelope"></i>${m.correo||"Se pide al confirmar"}</span>${m.notas?`<span class="revision-note"><i class="bi bi-chat-left-text"></i>${m.notas}</span>`:""}</div>
        </article>
        <article class="revision-card revision-card--fecha" data-edit="3" role="button" tabindex="0">
            <div class="revision-card__head"><span class="revision-card__icon revision-card__icon--cal"><i class="bi bi-calendar-check"></i></span><div class="revision-card__copy"><h2>${diaNom}, ${d} de ${MESES[Number(mo)-1]}</h2><p>${ampm(estado.hora)} · GMT-5</p></div><span class="revision-edit"><i class="bi bi-pencil"></i>Cambiar</span></div>
            <div class="revision-fecha-badge"><strong>${ampm(estado.hora)}</strong><small>${diaNom} ${d}/${mo}</small></div>
        </article>
        <footer class="revision-total"><span>Total estimado</span><strong>${money(total())}</strong></footer>`;
}

function esReprogramar(){return Boolean(estado.reprogramarId);}

function btnContinuarTexto(){
    if(estado.paso===4)return esReprogramar()?"Guardar nueva fecha":"Confirmar cita";
    return"Continuar";
}

function mostrarPaso(p){
    estado.paso=p;
    document.querySelectorAll(".reserva-panel").forEach(el=>el.classList.toggle("d-none",Number(el.dataset.panel)!==p));
    document.querySelectorAll(".reserva-stepper li").forEach(el=>{const n=Number(el.dataset.paso);el.classList.toggle("is-active",n===p);el.classList.toggle("is-done",n<p);});
    $("btn-continuar").textContent=btnContinuarTexto();
    $("btn-atras").textContent=esReprogramar()&&(p===3||p===1)?"Mis citas":"Atrás";
    if(p===1)pintarServicios();
    if(p===3)pintarFecha();
    if(p===4)pintarResumen();
    pintarPick();
}

function validar(){
    if(estado.paso===1&&!estado.ids.length)return"Selecciona uno o más servicios.";
    if(estado.paso===2||estado.paso===4){
        const m=mascota();
        if(m.nombre.length<2)return"Indica el nombre de tu mascota.";
        if(!m.tipo||!m.tamano)return"Completa tipo y tamaño.";
    }
    if((estado.paso===3||estado.paso===4)&&(!estado.fecha||!estado.hora))return esReprogramar()?"Elige el nuevo día y un horario libre.":"Elige un día y un horario libre.";
    if(estado.paso===4&&!estado.ids.length)return"Selecciona al menos un servicio.";
}

$("lista-servicios").onclick=e=>{
    const c=e.target.closest(".reserva-card");if(!c)return;
    const id=Number(c.dataset.id);
    estado.ids=estado.ids.includes(id)?estado.ids.filter(x=>x!==id):estado.ids.concat(id);
    pintarServicios();
};

$("btn-atras").onclick=()=>{
    if(snapshotRevision){
        restaurarSnapshot();
        mostrarPaso(4);
        return;
    }
    if(estado.paso===1||(esReprogramar()&&estado.paso===3)){
        location.href=esReprogramar()?"citas-usuario.html":"index.html";
        return;
    }
    mostrarPaso(estado.paso-1);
};

$("btn-continuar").onclick=()=>{
    const err=validar();
    if(err){avis("Falta un dato",err);return;}
    if(estado.paso!==4){mostrarPaso(estado.paso+1);return;}
    if(window.AgendaAuth&&AgendaAuth.sesion()){guardarReserva(AgendaAuth.sesion());return;}
    if(window.AgendaAuth){AgendaAuth.abrir({intent:"confirm",email:mascota().correo,nombre:mascota().dueno,onSuccess:guardarReserva});return;}
    guardarReserva();
};

function guardarReserva(usuario){
    const m=mascota(),correo=usuario?.email||m.correo;
    if(correo&&$("dueno-correo")&&correo!==m.correo)$("dueno-correo").value=correo;
    const datosCita={servicios:elegidos(),servicio:etiqueta(),precio:total(),...m,correo,mascota:m.nombre,fecha:estado.fecha,hora:estado.hora,duenoId:correo};
    if(window.AgendaAuth)AgendaAuth.pintar();
    if(esReprogramar()){
        const actual=obtenerCitaPorId(estado.reprogramarId);
        if(!actual){
            avis("No encontramos la cita","Es posible que ya no esté disponible.","error");
            return;
        }
        actualizarCita({...actual,...datosCita,id:actual.id});
        Swal.fire({title:"Cita reprogramada",text:`El nuevo horario de ${m.nombre} quedó guardado.`,icon:"success",confirmButtonColor:"#7C9A4A"}).then(()=>{window.location.href="citas-usuario.html";});
        return;
    }
    const nuevaCita={...datosCita,id:Date.now()},citasActuales=obtenerTodasLasCitas();
    guardarCitas([...citasActuales,nuevaCita]);
    Swal.fire({title:"Cita confirmada",text:`La cita de ${m.nombre} fue reservada correctamente.`,icon:"success",confirmButtonColor:"#7C9A4A"}).then(()=>{window.location.href="index.html";});
}

document.querySelector(".reserva-form")?.addEventListener("submit",e=>e.preventDefault());

$("resumen-cita").onclick=e=>{
    const b=e.target.closest("[data-edit]");if(!b)return;
    irAEditar(Number(b.dataset.edit));
};

$("resumen-cita").onkeydown=e=>{
    if(e.key!=="Enter"&&e.key!==" ")return;
    const b=e.target.closest("[data-edit]");if(!b)return;
    e.preventDefault();irAEditar(Number(b.dataset.edit));
};

$("mini-calendario").onclick=e=>{
    const m=e.target.closest("[data-mes]");
    if(m){
        estado.mesVista=new Date(estado.mesVista.getFullYear(),estado.mesVista.getMonth()+Number(m.dataset.mes),1);
        pintarFecha();return;
    }
    const d=e.target.closest("[data-fecha]");
    if(!d||d.disabled)return;
    estado.fecha=d.dataset.fecha;estado.hora=null;
    estado.semanaInicio=inicioSemana(new Date(estado.fecha+"T00:00:00"));
    pintarFecha();pintarPick();
};

$("lista-horas").onclick=e=>{
    const b=e.target.closest("[data-hora]");if(!b)return;
    estado.hora=b.dataset.hora;pintarFecha();pintarPick();
};

$("grilla-semana").onclick=e=>{
    const s=e.target.closest(".agenda-slot.is-libre");if(!s)return;
    estado.fecha=s.dataset.fecha;estado.hora=s.dataset.hora;
    estado.mesVista=new Date(estado.fecha+"T00:00:00");
    pintarFecha();pintarPick();
};

$("semana-prev").onclick=()=>{
    estado.semanaInicio.setDate(estado.semanaInicio.getDate()-7);
    pintarFecha();
};

$("semana-next").onclick=()=>{
    estado.semanaInicio.setDate(estado.semanaInicio.getDate()+7);
    pintarFecha();
};

$("buscar-cita").oninput=pintarGrilla;

function idsDeCita(cita){
    const deServicios=(cita.servicios||[]).map(s=>Number(s.id)).filter(Boolean);
    if(deServicios.length)return deServicios;
    const nombre=cita.servicio||"";
    const hallado=servicios().find(s=>s.nombre===nombre);
    return hallado?[Number(hallado.id)]:[];
}

function aplicarCita(cita){
    estado.ids=idsDeCita(cita);
    if($("mascota-nombre"))$("mascota-nombre").value=cita.nombre||cita.mascota||"";
    if($("mascota-tipo"))$("mascota-tipo").value=cita.tipo||"";
    if($("mascota-raza"))$("mascota-raza").value=cita.raza||"";
    if($("mascota-tamano"))$("mascota-tamano").value=cita.tamano||"";
    if($("mascota-notas"))$("mascota-notas").value=cita.notas||"";
    if($("dueno-nombre"))$("dueno-nombre").value=cita.dueno||"";
    if($("dueno-correo"))$("dueno-correo").value=cita.correo||cita.duenoId||"";
}

function pintarModoReprogramar(cita){
    document.title="Reprogramar cita | AgendaPets";
    document.body.classList.add("is-reprogramar");
    const cierre=document.querySelector(".reserva-brand__close");
    if(cierre)cierre.setAttribute("href","citas-usuario.html");
    if($("titulo-fecha"))$("titulo-fecha").textContent="Elige un nuevo horario";
    const fechaTxt=formatearFechaCita(cita.fecha);
    const horaTxt=cita.hora?ampm(cita.hora):"";
    if($("lead-fecha"))$("lead-fecha").textContent=`La cita de ${cita.mascota||cita.nombre||"tu mascota"} está el ${fechaTxt}${horaTxt?` a las ${horaTxt}`:""}. Escoge otro día u hora libre.`;
    if($("titulo-confirma"))$("titulo-confirma").textContent="Confirma el cambio";
    if($("lead-confirma"))$("lead-confirma").textContent="Si el nuevo horario se ve bien, guárdalo. Puedes tocar Cambiar si quieres ajustar algo más.";
    const aviso=$("aviso-reprogramar");
    if(aviso){
        aviso.hidden=false;
        const etiqueta=aviso.querySelector("span");
        if(etiqueta)etiqueta.textContent=`Horario actual: ${fechaTxt}${horaTxt?` · ${horaTxt}`:""}`;
    }
}

function formatearFechaCita(iso){
    if(!iso)return"";
    const[y,mo,d]=iso.split("-");
    const diaNom=DIA_NOM[new Date(iso+"T00:00:00").getDay()];
    return `${diaNom} ${d} de ${MESES[Number(mo)-1]}`;
}

function iniciarReprogramacion(id){
    const cita=obtenerCitaPorId(id);
    if(!cita){
        avis("No encontramos la cita","Te devolvemos a Mis citas.","error");
        setTimeout(()=>{location.href="citas-usuario.html";},1400);
        return false;
    }
    const sesion=window.AgendaAuth?.sesion?.();
    const correoSesion=(sesion?.email||"").toLowerCase();
    const correoCita=(cita.correo||cita.duenoId||"").toLowerCase();
    if(correoSesion&&correoCita&&correoSesion!==correoCita){
        avis("Esa cita no es tuya","Abre Mis citas e inicia sesión con tu correo.","warning");
        setTimeout(()=>{location.href="citas-usuario.html";},1400);
        return false;
    }
    estado.reprogramarId=Number(cita.id);
    estado.citaOriginal=cita;
    aplicarCita(cita);
    if(sesion){
        if($("dueno-nombre")&&sesion.nombre)$("dueno-nombre").value=sesion.nombre;
        if($("dueno-correo")&&sesion.email)$("dueno-correo").value=sesion.email;
    }
    if(cita.fecha&&cita.fecha>=hoy){
        estado.fecha=cita.fecha;
        estado.hora=null;
        estado.mesVista=new Date(cita.fecha+"T00:00:00");
        estado.semanaInicio=inicioSemana(estado.mesVista);
    }
    pintarModoReprogramar(cita);
    return true;
}

function iniciarReserva(){
    if(window.AgendaAuth){
        AgendaAuth.mount();
        const s=AgendaAuth.sesion();
        if(s){
            if($("dueno-nombre"))$("dueno-nombre").value=s.nombre||"";
            if($("dueno-correo"))$("dueno-correo").value=s.email||"";
        }
    }
    pintarServicios();
    const params=new URLSearchParams(location.search);
    const reprogramarId=Number(params.get("reprogramar"));
    if(reprogramarId){
        if(!iniciarReprogramacion(reprogramarId))return;
        mostrarPaso(3);
        return;
    }
    const pasoURL=Number(params.get("paso"));
    mostrarPaso(pasoURL||1);
}

iniciarReserva();