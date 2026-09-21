(function protegerDashboard() {
    const s = JSON.parse(localStorage.getItem("sesion") || "null");
    if (!s || !s.token || String(s.rol || "").toLowerCase() !== "admin") {
        window.location.replace("../index.html");
    }
})();

let todasLasReservas = [];
let estadoFiltroActivo = "TODAS";
let citaSeleccionadaId = null;

document.addEventListener("DOMContentLoaded", async () => {
    inicializarFechasFiltro();
    enlazarEventosFiltros();
    enlazarEventosSeleccionCita();
    await cargarDashboard();
});

async function cargarDashboard() {
    try {
        todasLasReservas = await AgendaApi.reservas();
        aplicarFiltrosConAnimacion();
    } catch (err) {
        console.error("Error al cargar reservas del dashboard:", err);
    }
}

function inicializarFechasFiltro() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const hoyLocalIso = `${yyyy}-${mm}-${dd}`;

    const inputDesde = document.getElementById("filtro-fecha-desde");
    const inputHasta = document.getElementById("filtro-fecha-hasta");

    if (inputDesde) inputDesde.value = hoyLocalIso;
    if (inputHasta) inputHasta.value = hoyLocalIso;
}

function ampm(horaStr) {
    if (!horaStr) return "";
    const [h, m] = horaStr.split(":");
    const numH = parseInt(h, 10);
    const sufijo = numH >= 12 ? "PM" : "AM";
    const h12 = numH % 12 || 12;
    return `${h12}:${m} ${sufijo}`;
}

function formatearFechaEspanol(isoFecha) {
    if (!isoFecha) return "";
    const [y, m, d] = isoFecha.split("-");
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${d} de ${meses[parseInt(m, 10) - 1]}`;
}

function evaluarEstadoExpirado(reserva) {
    const hoyIso = new Date().toISOString().split("T")[0];
    const estadoUpper = String(reserva.estado || "").toUpperCase();
    const esFechaPasada = reserva.fecha < hoyIso;
    
    return esFechaPasada && estadoUpper !== "COMPLETADA" && estadoUpper !== "CANCELADA";
}

function renderizarHistorialReservas(reservas) {
    const contenedor = document.getElementById("contenedorReservas");
    if (!contenedor) return;

    if (!reservas || reservas.length === 0) {
        contenedor.innerHTML = `
            <div class="p-4 text-center text-muted">
                <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
                <p>No hay reservas registradas para este filtro.</p>
            </div>
        `;
        return;
    }

    const ordenadas = [...reservas].sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));

    contenedor.innerHTML = ordenadas.map(r => {
        const nombreMascota = r.mascotaNombre || (r.mascota && r.mascota.nombre) || r.mascota || r.nombre || "Mascota";
        const nombreDueno = r.duenoNombre || r.dueno || "Cliente";
        const servicioNombre = r.servicio || (r.servicios && r.servicios.map(s => s.nombre).join(" + ")) || "Servicio de peluquería";
        const esExpirada = evaluarEstadoExpirado(r);
        
        let textoEstado = (r.estado || "PENDIENTE").toUpperCase();
        let claseEstado = "etiqueta-estado";

        if (esExpirada) {
            textoEstado = "EXPIRADA";
            claseEstado = "etiqueta-estado etiqueta-estado--expirada";
        } else {
            if (textoEstado === "PENDIENTE") claseEstado += " etiqueta-estado--oculto";
            if (textoEstado === "CANCELADA") claseEstado += " bg-danger text-white";
            if (textoEstado === "CONFIRMADA") claseEstado += " bg-success text-white";
        }

        const esSeleccionada = Number(r.id) === Number(citaSeleccionadaId) ? "is-selected" : "";

        return `
            <div class="servicio ${esSeleccionada}" data-id="${r.id}" style="cursor: pointer;">
                <div class="icono-servicio">
                    <i class="bi bi-paw-fill"></i>
                </div>
                <div class="info-servicio">
                    <h3>${nombreMascota} <small class="text-muted fs-6">de ${nombreDueno}</small></h3>
                    <p class="mb-1">${servicioNombre} | ${formatearFechaEspanol(r.fecha)} ${ampm(r.hora)}</p>
                    <span class="small text-muted"><i class="bi bi-envelope me-1"></i>${r.correoDueno || r.correo || "Sin correo"}</span>
                </div>
                <div class="acciones-servicio">
                    <span class="${claseEstado} text-center">${textoEstado}</span>
                </div>
            </div>
        `;
    }).join("");
}

function actualizarEstadisticas(reservasEnRango) {
    if (!reservasEnRango) return;

    let completadas = 0;
    let pendientes = 0;
    let canceladas = 0;
    let expiradas = 0;

    reservasEnRango.forEach(r => {
        const esExpirada = evaluarEstadoExpirado(r);
        const estadoUpper = String(r.estado || "").toUpperCase();

        if (esExpirada) {
            expiradas++;
        } else if (estadoUpper === "COMPLETADA") {
            completadas++;
        } else if (estadoUpper === "CANCELADA") {
            canceladas++;
        } else if (estadoUpper === "PENDIENTE") {
            pendientes++;
        }
    });

    const totalCitas = reservasEnRango.length;

    const setTexto = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTexto("stat-total-citas", `${totalCitas} cita${totalCitas === 1 ? "" : "s"}`);
    setTexto("stat-completadas", completadas);
    setTexto("stat-pendientes", pendientes);
    setTexto("stat-canceladas", canceladas);
    setTexto("stat-expiradas", expiradas);
}

function obtenerReservasFiltradas() {
    const fechaDesde = document.getElementById("filtro-fecha-desde")?.value || "";
    const fechaHasta = document.getElementById("filtro-fecha-hasta")?.value || "";

    return todasLasReservas.filter(r => {
        if (fechaDesde && r.fecha < fechaDesde) return false;
        if (fechaHasta && r.fecha > fechaHasta) return false;

        const estadoUpper = String(r.estado || "").toUpperCase();
        const esExpirada = evaluarEstadoExpirado(r);

        if (estadoFiltroActivo === "COMPLETADAS") return estadoUpper === "COMPLETADA";
        if (estadoFiltroActivo === "PENDIENTES") return estadoUpper === "PENDIENTE" && !esExpirada;
        if (estadoFiltroActivo === "CANCELADAS") return estadoUpper === "CANCELADA";
        if (estadoFiltroActivo === "EXPIRADAS") return esExpirada;

        return true;
    });
}

function aplicarFiltrosConAnimacion() {
    const contenedor = document.getElementById("contenedorReservas");
    if (!contenedor) return;

    const fechaDesde = document.getElementById("filtro-fecha-desde")?.value || "";
    const fechaHasta = document.getElementById("filtro-fecha-hasta")?.value || "";

    const reservasEnRango = todasLasReservas.filter(r => {
        if (fechaDesde && r.fecha < fechaDesde) return false;
        if (fechaHasta && r.fecha > fechaHasta) return false;
        return true;
    });

    actualizarEstadisticas(reservasEnRango);

    contenedor.classList.add("filtrando");

    setTimeout(() => {
        const filtradas = obtenerReservasFiltradas();
        renderizarHistorialReservas(filtradas);
        contenedor.classList.remove("filtrando");
    }, 200);
}

function enlazarEventosFiltros() {
    document.getElementById("filtro-fecha-desde")?.addEventListener("change", aplicarFiltrosConAnimacion);
    document.getElementById("filtro-fecha-hasta")?.addEventListener("change", aplicarFiltrosConAnimacion);

    const contenedorFiltros = document.getElementById("filtros-estado");
    if (contenedorFiltros) {
        contenedorFiltros.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-estado]");
            if (!btn) return;

            contenedorFiltros.querySelectorAll("button").forEach(b => b.classList.remove("activo"));
            btn.classList.add("activo");

            estadoFiltroActivo = btn.dataset.estado;
            aplicarFiltrosConAnimacion();
        });
    }
}

function enlazarEventosSeleccionCita() {
    const contenedor = document.getElementById("contenedorReservas");
    if (!contenedor) return;

    contenedor.addEventListener("click", (e) => {
        const tarjeta = e.target.closest(".servicio[data-id]");
        if (!tarjeta) return;

        contenedor.querySelectorAll(".servicio").forEach(el => el.classList.remove("is-selected"));
        tarjeta.classList.add("is-selected");

        const id = Number(tarjeta.dataset.id);
        citaSeleccionadaId = id;
        renderizarDetalleCita(id);
    });
}

function renderizarDetalleCita(id) {
    const panel = document.getElementById("panelDetalleCita");
    if (!panel) return;

    const cita = todasLasReservas.find(r => Number(r.id) === id);
    if (!cita) {
        panel.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
                <p>No se encontró la información de la cita.</p>
            </div>`;
        return;
    }

    const objMascota = cita.mascota && typeof cita.mascota === "object" ? cita.mascota : {};

    const nombreMascota = cita.mascotaNombre || objMascota.nombre || (typeof cita.mascota === "string" ? cita.mascota : "") || cita.nombre || "Mascota";
    const razaMascota = (objMascota.raza || cita.raza || "").trim() || "Raza no especificada";
    const tamanoMascota = (objMascota.tamano || cita.tamano) ? `Tamaño: ${objMascota.tamano || cita.tamano}` : "Tamaño no especificado";
    
    const servicioNombre = cita.servicio || (cita.servicios && cita.servicios.map(s => s.nombre).join(" + ")) || "Servicio General";
    const nombreDueno = cita.duenoNombre || cita.dueno || "Cliente";
    const correoDueno = cita.correoDueno || cita.correo || "Sin correo";

    const celBruto = cita.celularDueno || cita.celular || objMascota.celularDueno || objMascota.celular || (objMascota.usuario && objMascota.usuario.celular);
    const celularDueno = (celBruto && String(celBruto).trim() !== "null") ? String(celBruto).trim() : "No especificado";

    const notasBrutas = objMascota.notas || cita.notas || cita.observaciones;
    const observacionesText = (notasBrutas && String(notasBrutas).trim() !== "null" && String(notasBrutas).trim() !== "EMPTY_STRING") 
        ? String(notasBrutas).trim() 
        : "Sin observaciones registradas.";

    const esExpirada = evaluarEstadoExpirado(cita);
    let textoEstado = (cita.estado || "PENDIENTE").toUpperCase();
    let claseEstado = "etiqueta-estado";

    if (esExpirada) {
        textoEstado = "EXPIRADA";
        claseEstado = "etiqueta-estado etiqueta-estado--expirada";
    } else {
        if (textoEstado === "PENDIENTE") claseEstado += " etiqueta-estado--oculto";
        if (textoEstado === "CANCELADA") claseEstado += " bg-danger text-white";
        if (textoEstado === "COMPLETADA") claseEstado += " bg-success text-white";
        if (textoEstado === "CONFIRMADA") claseEstado += " bg-success text-white";
    }

    const esPendiente = textoEstado === "PENDIENTE";
    const esCompletada = textoEstado === "COMPLETADA" || textoEstado === "CONFIRMADA";
    const esCancelada = textoEstado === "CANCELADA";

    const btnCompletarDisabled = (esExpirada || esCompletada) ? 'disabled' : '';
    const btnPendienteDisabled = (esExpirada || esPendiente) ? 'disabled' : '';
    const btnCancelarDisabled = (esExpirada || esCancelada) ? 'disabled' : '';

    panel.innerHTML = `
        <div class="detalle-reserva-content">
            <div class="p-3 mb-3 rounded-4" style="background-color: #F8F5EE; border: 1px solid #EBE5D8;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <h3 class="m-0 fw-bold fs-5" style="color: var(--ink, #2C3E50);">${nombreMascota} <small class="text-muted fw-normal">(${razaMascota})</small></h3>
                    <span class="${claseEstado} text-center">${textoEstado}</span>
                </div>
                
                <p class="small text-muted mb-3"><i class="bi bi-bounding-box-circles me-1"></i>${tamanoMascota}</p>

                <div class="d-flex flex-wrap gap-2">
                    <span class="bg-white px-2 py-1 rounded-3 border small text-dark d-flex align-items-center gap-1 shadow-sm">
                        <i class="bi bi-scissors text-success"></i> ${servicioNombre}
                    </span>
                    <span class="bg-white px-2 py-1 rounded-3 border small text-dark d-flex align-items-center gap-1 shadow-sm">
                        <i class="bi bi-calendar-event text-success"></i> ${formatearFechaEspanol(cita.fecha)}
                    </span>
                    <span class="bg-white px-2 py-1 rounded-3 border small text-dark d-flex align-items-center gap-1 shadow-sm">
                        <i class="bi bi-clock text-success"></i> ${ampm(cita.hora)}
                    </span>
                </div>
            </div>

            <div class="px-1 mb-3">
                <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Dueño:</span>
                    <strong class="text-end" style="color: var(--ink);">${nombreDueno}</strong>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Correo:</span>
                    <strong class="text-end" style="color: var(--ink);">${correoDueno}</strong>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom">
                    <span class="text-muted">Celular:</span>
                    <strong class="text-end" style="color: var(--ink);">${celularDueno}</strong>
                </div>
            </div>

            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted small fw-bold">Observaciones:</span>
                    <i class="bi bi-pencil-square text-muted small"></i>
                </div>
                <div class="p-3 rounded-3 text-muted small" style="background-color: #FAF8F5; border: 1px dashed #D3CBD2; line-height: 1.4;">
                    ${observacionesText}
                </div>
            </div>

            <div class="d-flex gap-2 pt-1">
                <button type="button" class="btn btn-success flex-fill rounded-pill py-2 px-1 small" ${btnCompletarDisabled} onclick="cambiarEstadoCita(${cita.id}, 'COMPLETADA')">
                    Completar
                </button>
                <button type="button" class="btn btn-outline-secondary flex-fill rounded-pill py-2 px-1 small" ${btnPendienteDisabled} onclick="cambiarEstadoCita(${cita.id}, 'PENDIENTE')">
                    Pendiente
                </button>
                <button type="button" class="btn btn-outline-danger flex-fill rounded-pill py-2 px-1 small" ${btnCancelarDisabled} onclick="cambiarEstadoCita(${cita.id}, 'CANCELADA')">
                    Cancelar
                </button>
            </div>
        </div>
    `;
}

async function cambiarEstadoCita(id, nuevoEstado) {
    const confirm = await Swal.fire({
        title: `¿Marcar cita como ${nuevoEstado.toLowerCase()}?`,
        text: "Se actualizará el estado en el sistema.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "No",
        confirmButtonColor: "#7C9A4A"
    });

    if (!confirm.isConfirmed) return;

    try {
        await AgendaApi.cambiarEstadoReserva(id, nuevoEstado);
        await Swal.fire({
            title: "Estado actualizado",
            text: `La cita ahora está ${nuevoEstado.toLowerCase()}.`,
            icon: "success",
            confirmButtonColor: "#7C9A4A"
        });

        todasLasReservas = await AgendaApi.reservas();
        aplicarFiltrosConAnimacion();
        renderizarDetalleCita(id);
    } catch (err) {
        Swal.fire({
            title: "Error",
            text: err.message || "No se pudo actualizar el estado.",
            icon: "error",
            confirmButtonColor: "#7C9A4A"
        });
    }
}