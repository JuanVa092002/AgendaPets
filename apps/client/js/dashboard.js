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
                <p>No hay reservas registradas en el sistema.</p>
            </div>
        `;
        return;
    }

    const ordenadas = [...reservas].sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));

    contenedor.innerHTML = ordenadas.map(r => {
        const nombreMascota = r.mascota || r.nombre || "Mascota";
        const nombreDueno = r.dueno || "Cliente";
        const servicioNombre = r.servicio || (r.servicios && r.servicios.map(s => s.nombre).join(" + ")) || "Servicio de peluquería";
        const estado = (r.estado || "PENDIENTE").toUpperCase();
        
        let claseEstado = "etiqueta-estado";
        if (estado === "PENDIENTE") claseEstado += " etiqueta-estado--oculto";
        if (estado === "CANCELADA") claseEstado += " bg-danger text-white";

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
                    <span class="${claseEstado} text-center">${estado}</span>
                </div>
            </div>
        `;
    }).join("");
}

function actualizarEstadisticas(reservas) {
    if (!reservas) return;
    
    const hoyIso = new Date().toISOString().split("T")[0];
    const deHoy = reservas.filter(r => r.fecha === hoyIso);

    const confirmadas = deHoy.filter(r => String(r.estado).toUpperCase() === "CONFIRMADA").length;
    const pendientes = deHoy.filter(r => String(r.estado).toUpperCase() === "PENDIENTE").length;
    const completadas = deHoy.filter(r => String(r.estado).toUpperCase() === "COMPLETADA").length;
    const canceladas = deHoy.filter(r => String(r.estado).toUpperCase() === "CANCELADA").length;

    const setTexto = (selector, val) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = val;
    };

    setTexto(".border-success strong", confirmadas);
    setTexto(".border-danger strong", canceladas);
}