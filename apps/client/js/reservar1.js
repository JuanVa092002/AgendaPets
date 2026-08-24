import {
  obtenerTodasLasCitas,
  guardarCitas,
  obtenerCitaPorId,
  actualizarCita,
  formatearDinero,
} from "./citas-storage";

//const KEY_S = "servicios";

const citas = () => obtenerTodasLasCitas();

const money = (n) => formatearDinero(n);


const KEY_S = "servicios", 
//KEY_C = "citas", 
HORAS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"], 
DIAS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"], DIA_NOM = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], 
MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const $ = (id) => document.getElementById(id);
const inicioSemana = (f) => { const d = new Date(f), n = d.getDay(); d.setDate(d.getDate() + (n === 0 ? -6 : 1 - n)); d.setHours(0, 0, 0, 0); return d; };
const estado = { paso: 1, ids: [], fecha: null, hora: null, mesVista: new Date(), semanaInicio: inicioSemana(new Date()), retornoRevision: null };
let snapshotRevision = null;
//const money = (n) => "$ " + Number(n).toLocaleString("es-CO");
const ymd = (f) => { const d = new Date(f); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const hoy = ymd(new Date());
const avis = (t, x, i = "warning") => Swal.fire({ title: t, text: x, icon: i, confirmButtonColor: "#7C9A4A" });
const servicios = () => JSON.parse(localStorage.getItem(KEY_S) || "[]").filter(s => s.visible !== false);
const elegidos = () => servicios().filter(s => estado.ids.includes(s.id));
//const citas = () => JSON.parse(localStorage.getItem(KEY_C) || "[]");
const total = () => elegidos().reduce((a, s) => a + Number(s.precio), 0);
const etiqueta = () => { const e = elegidos(); return e.length > 1 ? `${e[0].nombre} +${e.length - 1}` : (e[0]?.nombre || ""); };

const icono = (n) => { n = n.toLowerCase(); return n.includes("uña") ? "bi-heart" : n.includes("corte") ? "bi-scissors" : n.includes("spa") || n.includes("premium") ? "bi-stars" : n.includes("dental") ? "bi-award" : n.includes("baño") || n.includes("bano") ? "bi-droplet" : "bi-paw-fill"; };
const abierta = (iso, h) => { const d = new Date(iso + "T00:00:00").getDay(); return d !== 0 && (d === 6 ? h >= "09:00" && h < "16:00" : true); };
const ocupada = (iso, h) => citas().find(c => c.fecha === iso && c.hora === h);
const clock = (h) => { const n = +h.slice(0, 2); return `${String(n).padStart(2, "0")}.00 ${n < 12 ? "AM" : "PM"}`; };
const rango = (h) => { const n = +h.slice(0, 2); return `${n % 12 || 12} ${n < 12 ? "AM" : "PM"} - ${(n + 1) % 12 || 12} ${(n + 1) < 12 ? "AM" : "PM"}`; };
const mascota = () => ({ nombre: $("mascota-nombre").value.trim(), tipo: $("mascota-tipo").value, raza: $("mascota-raza").value.trim(), tamano: $("mascota-tamano").value, dueno: $("dueno-nombre").value.trim(), telefono: $("dueno-telefono").value.trim(), notas: $("mascota-notas").value.trim() });
const ampm = (h) => { const [H, M] = h.split(":"); const n = +H; return `${n % 12 || 12}:${M} ${n < 12 ? "a. m." : "p. m."}`; };

function pintarPick() {
  const n = estado.ids.length, bits = [n ? `${n} servicio${n > 1 ? "s" : ""} · ${money(total())}` : "Elige un servicio"];
  if (estado.fecha && estado.hora) bits.push(`${estado.fecha.slice(8)} ${MESES[+estado.fecha.slice(5, 7) - 1].slice(0, 3)} · ${ampm(estado.hora)}`);
  $("reserva-pick").textContent = bits.join("  ·  ");
}

function pintarServicios() {
  const lista = servicios();
  $("lista-servicios").innerHTML = lista.length ? lista.map(s => `<button type="button" class="reserva-card ${estado.ids.includes(s.id) ? "is-selected" : ""}" data-id="${s.id}"><i class="check"></i><span class="ico"><i class="bi ${icono(s.nombre)}"></i></span><span><h2>${s.nombre}</h2><p>${s.descripcion || ""}</p></span><span><strong>${money(s.precio)}</strong><small>${s.duracion}</small></span></button>`).join("") : `<p class="lead">Aún no hay servicios en el panel de la peluquería.</p>`;
  pintarPick();
}

function pintarFecha() {
  const v = estado.mesVista, y = v.getFullYear(), m = v.getMonth(), off = new Date(y, m, 1).getDay(), tot = new Date(y, m + 1, 0).getDate();
  let h = `<div class="cal-top"><button type="button" data-mes="-1"><i class="bi bi-chevron-left"></i></button><strong>${MESES[m]} ${y}</strong><button type="button" data-mes="1"><i class="bi bi-chevron-right"></i></button></div><table><thead><tr>${["D", "L", "M", "M", "J", "V", "S"].map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>`, d = 1 - off;
  for (let f = 0; f < 6; f++) { h += "<tr>"; for (let c = 0; c < 7; c++) { if (d < 1 || d > tot) h += "<td></td>"; else { const iso = ymd(new Date(y, m, d)), past = iso < hoy || new Date(iso + "T00:00:00").getDay() === 0; h += `<td><button type="button" class="${estado.fecha === iso ? "is-on" : ""}" data-fecha="${iso}" ${past ? "disabled" : ""}>${d}</button></td>`; } d++; } h += "</tr>"; }
  $("mini-calendario").innerHTML = h + "</tbody></table>";
  if (!estado.fecha) { $("dia-elegido").textContent = "Selecciona un día"; $("lista-horas").innerHTML = ""; pintarGrilla(); return; }
  const [yy, mm, dd] = estado.fecha.split("-");
  $("dia-elegido").textContent = `${dd} de ${MESES[mm - 1]}`;
  const libres = HORAS.filter(hr => abierta(estado.fecha, hr) && !ocupada(estado.fecha, hr));
  const man = libres.filter(hr => hr < "13:00"), tar = libres.filter(hr => hr >= "13:00");
  const grupo = (t, arr) => arr.length ? `<div class="hora-grupo"><small>${t}</small><div>${arr.map(hr => `<button type="button" class="hora ${estado.hora === hr ? "is-on" : ""}" data-hora="${hr}">${ampm(hr)}</button>`).join("")}</div></div>` : "";
  $("lista-horas").innerHTML = libres.length ? grupo("Mañana", man) + grupo("Tarde", tar) : `<p class="lead">No hay horarios libres este día.</p>`;
  pintarGrilla();
}

function pintarGrilla() {
  const ini = estado.semanaInicio, q = ($("buscar-cita").value || "").trim().toLowerCase();
  const dias = [...Array(6)].map((_, i) => { const d = new Date(ini); d.setDate(ini.getDate() + i); return d; });
  $("semana-titulo").textContent = `${MESES[ini.getMonth()]} ${ini.getFullYear()}`;
  let h = `<div class="agenda-grid__cell is-head">GMT-5</div>` + dias.map(d => `<div class="agenda-grid__cell is-head">${DIAS[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()}</div>`).join("");
  HORAS.forEach((hora, i) => {
    h += `<div class="agenda-grid__cell is-time ${hora === estado.hora || (!estado.hora && hora === "10:00") ? "is-now" : ""}"><span>${clock(hora)}</span></div>`;
    dias.forEach(d => {
      const iso = ymd(d), oc = ocupada(iso, hora), ok = abierta(iso, hora) && iso >= hoy, sel = estado.fecha === iso && estado.hora === hora;
      const hide = q && oc && !`${oc.servicio} ${oc.mascota || ""}`.toLowerCase().includes(q);
      const cls = !ok || hide ? "is-libre" : oc ? "is-ocupado" : sel ? "is-libre is-on" : "is-libre";
      const txt = (!hide && oc) ? `${oc.servicio}<br>${rango(hora)}` : sel ? `${etiqueta()}<br>${rango(hora)}` : "";
      h += `<div class="agenda-grid__cell"><button type="button" class="agenda-slot ${cls}" data-fecha="${iso}" data-hora="${hora}" ${!ok || oc ? "disabled" : ""}>${txt}</button></div>`;
    });
  });
  $("grilla-semana").innerHTML = h;
}

function guardarSnapshot() {
  snapshotRevision = {
    ids: [...estado.ids],
    fecha: estado.fecha,
    hora: estado.hora,
    mascota: mascota()
  };
}

function restaurarSnapshot() {
  if (!snapshotRevision) return;
  estado.ids = [...snapshotRevision.ids];
  estado.fecha = snapshotRevision.fecha;
  estado.hora = snapshotRevision.hora;
  const m = snapshotRevision.mascota;
  $("mascota-nombre").value = m.nombre;
  $("mascota-tipo").value = m.tipo;
  $("mascota-raza").value = m.raza;
  $("mascota-tamano").value = m.tamano;
  $("dueno-nombre").value = m.dueno;
  $("dueno-telefono").value = m.telefono;
  $("mascota-notas").value = m.notas;
  snapshotRevision = null;
}

function irAEditar(paso) {
  guardarSnapshot();
  estado.retornoRevision = 4;
  mostrarPaso(paso);
}

function btnContinuarTexto() {
  if (estado.retornoRevision) return "Guardar y volver";
  return estado.paso === 4 ? "Confirmar cita" : "Continuar";
}

function pintarResumen() {
  const m = mascota(), [y, mo, d] = estado.fecha.split("-");
  const diaNom = DIA_NOM[new Date(estado.fecha + "T00:00:00").getDay()];
  const inicial = (m.nombre || "?").charAt(0).toUpperCase();
  const serviciosHtml = elegidos().map(s => `<li><span class="revision-chip"><i class="bi ${icono(s.nombre)}"></i>${s.nombre}</span><span>${money(s.precio)}</span></li>`).join("");
  $("resumen-cita").innerHTML = `
    <p class="revision-hint"><i class="bi bi-pencil-square"></i> Puedes ajustar servicios, datos o fecha antes de confirmar.</p>
    <article class="revision-card" data-edit="1" role="button" tabindex="0" aria-label="Editar servicios">
      <div class="revision-card__head">
        <span class="revision-card__icon"><i class="bi bi-scissors"></i></span>
        <div class="revision-card__copy">
          <h2>Servicios</h2>
          <p>${elegidos().length} seleccionado${elegidos().length > 1 ? "s" : ""} · ${money(total())}</p>
        </div>
        <span class="revision-edit" aria-hidden="true"><i class="bi bi-pencil"></i> Cambiar</span>
      </div>
      <ul class="revision-list">${serviciosHtml}</ul>
    </article>
    <article class="revision-card" data-edit="2" role="button" tabindex="0" aria-label="Editar datos de mascota">
      <div class="revision-card__head">
        <span class="revision-card__avatar">${inicial}</span>
        <div class="revision-card__copy">
          <h2>${m.nombre}</h2>
          <p>${m.tipo}${m.tamano ? ` · ${m.tamano}` : ""}${m.raza ? ` · ${m.raza}` : ""}</p>
        </div>
        <span class="revision-edit" aria-hidden="true"><i class="bi bi-pencil"></i> Cambiar</span>
      </div>
      <div class="revision-meta">
        <span><i class="bi bi-person"></i>${m.dueno}</span>
        <span><i class="bi bi-whatsapp"></i>${m.telefono}</span>
        ${m.notas ? `<span class="revision-note"><i class="bi bi-chat-left-text"></i>${m.notas}</span>` : ""}
      </div>
    </article>
    <article class="revision-card revision-card--fecha" data-edit="3" role="button" tabindex="0" aria-label="Editar fecha y hora">
      <div class="revision-card__head">
        <span class="revision-card__icon revision-card__icon--cal"><i class="bi bi-calendar-check"></i></span>
        <div class="revision-card__copy">
          <h2>${diaNom}, ${d} de ${MESES[mo - 1]}</h2>
          <p>${ampm(estado.hora)} · GMT-5</p>
        </div>
        <span class="revision-edit" aria-hidden="true"><i class="bi bi-pencil"></i> Cambiar</span>
      </div>
      <div class="revision-fecha-badge">
        <strong>${ampm(estado.hora)}</strong>
        <small>${diaNom} ${d}/${mo}</small>
      </div>
    </article>
    <footer class="revision-total">
      <span>Total estimado</span>
      <strong>${money(total())}</strong>
    </footer>`;
}

function mostrarPaso(p) {
  estado.paso = p;
  if (p === 4 && estado.retornoRevision === 4) {
    estado.retornoRevision = null;
    snapshotRevision = null;
  }
  const enEdicion = estado.retornoRevision === 4;
  document.querySelectorAll(".reserva-panel").forEach(el => el.classList.toggle("d-none", Number(el.dataset.panel) !== p));
  document.querySelectorAll(".reserva-stepper li").forEach(el => {
    const n = Number(el.dataset.paso);
    el.classList.toggle("is-active", n === p);
    el.classList.toggle("is-done", enEdicion ? n < 4 && n !== p : n < p);
    el.classList.toggle("is-editing", enEdicion && n === p);
  });
  $("btn-continuar").textContent = btnContinuarTexto();
  $("btn-atras").textContent = enEdicion ? "Descartar cambios" : "Atrás";
  if (p === 3) pintarFecha();
  if (p === 4) pintarResumen();
  pintarPick();
}

function validar() {
  if (estado.paso === 1 && !estado.ids.length) return "Selecciona uno o más servicios.";
  if (estado.paso === 2 || estado.paso === 4) {
    const m = mascota();
    if (m.nombre.length < 2) return "Indica el nombre de tu mascota.";
    if (!m.tipo || !m.tamano) return "Completa tipo y tamaño.";
    if (m.dueno.length < 3) return "Indica tu nombre.";
    if (!/^\d{10}$/.test(m.telefono)) return "El WhatsApp debe tener 10 dígitos.";
  }
  if ((estado.paso === 3 || estado.paso === 4) && (!estado.fecha || !estado.hora)) return "Elige un día y un horario libre.";
  if (estado.paso === 4 && !estado.ids.length) return "Selecciona al menos un servicio.";
}

$("lista-servicios").onclick = (e) => { const c = e.target.closest(".reserva-card"); if (!c) return; const id = Number(c.dataset.id); estado.ids = estado.ids.includes(id) ? estado.ids.filter(x => x !== id) : estado.ids.concat(id); pintarServicios(); };
$("btn-atras").onclick = () => {
  if (estado.retornoRevision) {
    restaurarSnapshot();
    return mostrarPaso(estado.retornoRevision);
  }
  if (estado.paso === 1) return location.href = "index.html";
  mostrarPaso(estado.paso - 1);
};

$("btn-continuar").onclick = () => {
  const err = validar();
  if (err) return avis("Falta un dato", err);
  if (estado.retornoRevision) {
    snapshotRevision = null;
    return mostrarPaso(estado.retornoRevision);
  }
  if (estado.paso !== 4) {
    mostrarPaso(estado.paso + 1);
   return;
  }
  //const m = mascota();
  /* localStorage.setItem(KEY_C, JSON.stringify(citas().concat({ id:Date.now(), servicios:elegidos(), servicio:etiqueta(), precio:total(), ...m, mascota:m.nombre, fecha:estado.fecha, hora:estado.hora })));  //SE REEMPLAZA POR FUNCION GUARDAR RESERVA*
  avis("Cita confirmada", `La cita de ${m.nombre} queda para el ${DIA_NOM[new Date(estado.fecha + "T00:00:00").getDay()]} ${estado.fecha} a las ${ampm(estado.hora)}.`, "success").then(() => location.href = "index.html"); */
  guardarReserva();
};

function guardarReserva() {
  const m = mascota();
  const datosCita = {
    servicios: elegidos(),
    servicio: etiqueta(),
    precio: total(),...m, mascota: m.nombre, fecha: estado.fecha,hora: estado.hora};

  // REPROGRAMAR UNA CITA EXISTENTE
  if (citaReprogramadaId) {
    actualizarCita({...datosCita,id: citaReprogramadaId });
    Swal.fire({
      title: "Cita reprogramada",
      text: "Tu cita fue actualizada correctamente.",
      icon: "success",
      confirmButtonColor: "#7C9A4A"
    }).then(() => {
      window.location.href ="citas-usuario.html"; });
    return;
  }

  // CREAR UNA CITA NUEVA
  const nuevaCita = { ...datosCita, id: Date.now() };
  const citas = obtenerTodasLasCitas();
  guardarCitas([
        ...citas,
        nuevaCita
    ]);
  //localStorage.setItem("citas", JSON.stringify([ ...citas,  nuevaCita ]));

  Swal.fire({
    title: "Cita confirmada",
    text: `La cita de ${m.nombre} fue reservada correctamente.`,
    icon: "success",
    confirmButtonColor: "#7C9A4A"
  }).then(() => {  window.location.href ="index.html"; });
}



document.querySelector(".reserva-form")?.addEventListener("submit", (e) => e.preventDefault());
$("resumen-cita").onclick = (e) => { const b = e.target.closest("[data-edit]"); if (!b) return; irAEditar(Number(b.dataset.edit)); };
$("resumen-cita").onkeydown = (e) => { if (e.key !== "Enter" && e.key !== " ") return; const b = e.target.closest("[data-edit]"); if (!b) return; e.preventDefault(); irAEditar(Number(b.dataset.edit)); };
$("mini-calendario").onclick = (e) => { const m = e.target.closest("[data-mes]"); if (m) { estado.mesVista = new Date(estado.mesVista.getFullYear(), estado.mesVista.getMonth() + Number(m.dataset.mes), 1); pintarFecha(); return; } const d = e.target.closest("[data-fecha]"); if (!d || d.disabled) return; estado.fecha = d.dataset.fecha; estado.hora = null; estado.semanaInicio = inicioSemana(new Date(estado.fecha + "T00:00:00")); pintarFecha(); pintarPick(); };
$("lista-horas").onclick = (e) => { const b = e.target.closest("[data-hora]"); if (!b) return; estado.hora = b.dataset.hora; pintarFecha(); pintarPick(); };
$("grilla-semana").onclick = (e) => { const s = e.target.closest(".agenda-slot.is-libre"); if (!s) return; estado.fecha = s.dataset.fecha; estado.hora = s.dataset.hora; estado.mesVista = new Date(estado.fecha + "T00:00:00"); pintarFecha(); pintarPick(); };
$("semana-prev").onclick = () => { estado.semanaInicio.setDate(estado.semanaInicio.getDate() - 7); pintarFecha(); };
$("semana-next").onclick = () => { estado.semanaInicio.setDate(estado.semanaInicio.getDate() + 7); pintarFecha(); };
$("buscar-cita").oninput = pintarGrilla;
//pintarServicios();
//mostrarPaso(Number(new URLSearchParams(location.search).get("paso")) || 1);

function obtenerIdCitaReprogramada() {
  const parametros = new URLSearchParams(window.location.search);
  const citaId = parametros.get("reprogramar");

  return citaId ? Number(citaId) : null;
}



const citaReprogramadaId = obtenerIdCitaReprogramada();

function cargarCitaParaReprogramar() {
  if (!citaReprogramadaId) return;

  const cita = obtenerCitaPorId(citaReprogramadaId);

  if (!cita) return;

estado.ids = Array.isArray(cita.servicios)
    ? cita.servicios.map(servicio => Number(servicio.id))
    : [];
  estado.fecha = cita.fecha;
  estado.hora = cita.hora;

  estado.mesVista = new Date(`${cita.fecha}T00:00:00`);
  estado.semanaInicio = inicioSemana(
    new Date(`${cita.fecha}T00:00:00`)
  );

  $("mascota-nombre").value = cita.mascota || "";
  $("mascota-tipo").value = cita.tipo || "";
  $("mascota-raza").value = cita.raza || "";
  $("mascota-tamano").value = cita.tamano || "";
  $("dueno-nombre").value = cita.dueno || "";
  $("dueno-telefono").value = cita.telefono || "";
  $("mascota-notas").value = cita.notas || "";

  estado.paso = 1;
}

function iniciarReserva() {
  cargarCitaParaReprogramar();

  pintarServicios();

  const pasoURL = Number(
    new URLSearchParams(location.search).get("paso")
  );

  mostrarPaso(
    citaReprogramadaId
      ? 1
      : pasoURL || 1
  );
}

iniciarReserva();













