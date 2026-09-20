(function protegerDashboard() {
    const s = JSON.parse(localStorage.getItem("sesion") || "null");
    if (!s || !s.token || String(s.rol || "").toLowerCase() !== "admin") {
        window.location.replace("../index.html");
    }
})();

document.addEventListener("DOMContentLoaded", async () => {
    await cargarDashboard();
});

async function cargarDashboard() {
    try {
        const reservas = await AgendaApi.reservas();
        renderizarHistorialReservas(reservas);
        actualizarEstadisticas(reservas);
    } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
    }
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

        return `
            <div class="servicio" data-id="${r.id}">
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

let todasLasReservas = [];
let estadoFiltroActivo = "TODAS";

document.addEventListener("DOMContentLoaded", async () => {
    inicializarFechasFiltro();
    enlazarEventosFiltros();
    await cargarDashboard();
});

function inicializarFechasFiltro() {
    const hoyIso = new Date().toISOString().split("T")[0];
    const inputDesde = document.getElementById("filtro-fecha-desde");
    const inputHasta = document.getElementById("filtro-fecha-hasta");

    if (inputDesde) inputDesde.value = hoyIso;
    if (inputHasta) inputHasta.value = hoyIso;
}

async function cargarDashboard() {
    try {
        todasLasReservas = await AgendaApi.reservas();
        aplicarFiltrosConAnimacion();
        actualizarEstadisticas(todasLasReservas);
    } catch (err) {
        console.error("Error al cargar reservas:", err);
    }
}

function evaluarEstadoExpirado(reserva) {
    const hoyIso = new Date().toISOString().split("T")[0];
    const estadoUpper = String(reserva.estado || "").toUpperCase();
    const esFechaPasada = reserva.fecha < hoyIso;
    
    return esFechaPasada && estadoUpper !== "COMPLETADA" && estadoUpper !== "CANCELADA";
}

function obtenerReservasFiltradas() {
    const fechaDesde = document.getElementById("filtro-fecha-desde")?.value || "";
    const fechaHasta = document.getElementById("filtro-fecha-hasta")?.value || "";

    return todasLasReservas.filter(r => {
        if (fechaDesde && r.fecha < fechaDesde) return false;
        if (fechaHasta && r.fecha > fechaHasta) return false;

        const estadoUpper = String(r.estado || "").toUpperCase();
        const esExpirada = evaluarEstadoExpirado(r);

        if (estadoFiltroActivo === "PENDIENTES") return estadoUpper === "PENDIENTE" && !esExpirada;
        if (estadoFiltroActivo === "COMPLETADAS") return estadoUpper === "COMPLETADA";
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