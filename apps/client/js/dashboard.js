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
    enlazarEventosSeleccionCita(); // Escuchador de clics para Detalles de Cita
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
    const hoyIso = new Date().toISOString().split("T")[0];
    const inputDesde = document.getElementById("filtro-fecha-desde");
    const inputHasta = document.getElementById("filtro-fecha-hasta");

    if (inputDesde) inputDesde.value = hoyIso;
    if (inputHasta) inputHasta.value = hoyIso;
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
        const nombreMascota = r.mascota || r.nombre || "Mascota";
        const nombreDueno = r.dueno || "Cliente";
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
                    <span class="small text-muted"><i class="bi bi-envelope me-1"></i>${r.correo || "Sin correo"}</span>
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

    const nombreMascota = cita.mascota || cita.nombre || "Mascota";
    const tipoMascota = cita.tipo || "Perro";
    const razaMascota = (cita.raza && cita.raza.trim()) ? cita.raza : "Raza no especificada";
    const tamanoMascota = cita.tamano ? `Tamaño: ${cita.tamano}` : "Tamaño no especificado";
    
    const nombreDueno = cita.dueno || "Cliente";
    const correoDueno = cita.correo || "Sin correo";
    const celularDueno = (cita.celularDueno || cita.celular || "").trim() || "No especificado";
    
    const esExpirada = evaluarEstadoExpirado(cita);
    let textoEstado = (cita.estado || "PENDIENTE").toUpperCase();
    let claseEstado = "etiqueta-estado";

    if (esExpirada) {
        textoEstado = "EXPIRADA";
        claseEstado = "etiqueta-estado etiqueta-estado--expirada";
    } else if (textoEstado === "PENDIENTE") {
        claseEstado += " bg-warning text-dark";
    } else if (textoEstado === "CANCELADA") {
        claseEstado += " bg-danger text-white";
    } else if (textoEstado === "COMPLETADA") {
        claseEstado += " bg-success text-white";
    }

    const serviciosList = (cita.servicios && cita.servicios.length > 0) 
        ? cita.servicios.map(s => `<li>${s.nombre} (${s.duracion || '30 min'}) - $${Number(s.precio || 0).toLocaleString('es-CO')}</li>`).join('')
        : `<li>${cita.servicio || 'Servicio General'}</li>`;

    panel.innerHTML = `
        <div class="detalle-reserva-content">
            <!-- Encabezado: Mascota y Estado -->
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h3 class="m-0 fw-bold" style="color: var(--ink);">${nombreMascota} <small class="fs-6 text-muted">(${tipoMascota})</small></h3>
                    <p class="text-muted small m-0">${razaMascota}</p>
                    <p class="text-muted small m-0"><i class="bi bi-bounding-box-circles"></i> ${tamanoMascota}</p>
                </div>
                <span class="${claseEstado} px-3 py-1 rounded-pill">${textoEstado}</span>
            </div>

            <hr class="my-2">

            <!-- Información del Cliente -->
            <div class="mb-3">
                <span class="d-block fw-bold text-muted small mb-1">DATOS DEL CLIENTE</span>
                <p class="mb-1"><strong>Dueño:</strong> ${nombreDueno}</p>
                <p class="mb-1 small text-muted"><i class="bi bi-envelope me-1"></i>${correoDueno}</p>
                <p class="mb-1 small text-muted"><i class="bi bi-telephone me-1"></i>${celularDueno}</p>
            </div>

            <hr class="my-2">

            <!-- Detalles del Servicio y Fecha -->
            <div class="mb-3">
                <span class="d-block fw-bold text-muted small mb-1">RESERVA</span>
                <p class="mb-1"><i class="bi bi-calendar-event me-1"></i>${formatearFechaEspanol(cita.fecha)} a las ${ampm(cita.hora)}</p>
                <ul class="small ps-3 mb-2">${serviciosList}</ul>
                <p class="fw-bold mb-0" style="color: var(--green);">Total: $${Number(cita.precioTotal || cita.precio || 0).toLocaleString('es-CO')}</p>
            </div>

            <!-- Botones de Acción Rápida -->
            <div class="d-flex gap-2 pt-2">
                <button type="button" class="btn btn-success flex-fill rounded-pill" onclick="cambiarEstadoCita(${cita.id}, 'COMPLETADA')">
                    <i class="bi bi-check-circle me-1"></i> Completar
                </button>
                <button type="button" class="btn btn-outline-danger flex-fill rounded-pill" onclick="cambiarEstadoCita(${cita.id}, 'CANCELADA')">
                    <i class="bi bi-x-circle me-1"></i> Cancelar
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