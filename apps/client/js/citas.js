const elementos = {
    container: document.getElementById("citasContainer"),
    mensaje: document.getElementById("mensajeCitas"),
    texto: document.getElementById("textoMisCitas")
};

function obtenerSesion() {
    if (window.AgendaAuth?.sesion) return AgendaAuth.sesion();
    try {
        return JSON.parse(localStorage.getItem("sesion") || "null");
    } catch {
        return null;
    }
}

async function obtenerMisCitas() {
    const usuario = obtenerSesion();
    if (!usuario || !usuario.token) return [];
    const citas = await AgendaApi.reservas();
    const correoUsuario = String(usuario.email || usuario.correo || "").toLowerCase();

    return (citas || []).filter(cita => {
        const est = String(cita.estado || "").toUpperCase();
        const correoCita = String(cita.correo || cita.duenoId || "").toLowerCase();
        const noCancelada = est !== "CANCELADA" && est !== "BORRADOR";

        if (usuario.rol !== "admin") {
            return noCancelada && correoCita === correoUsuario;
        }
        return noCancelada;
    });
}

async function obtenerBorradores() {
    const usuario = obtenerSesion();
    if (!usuario || !usuario.token) return [];
    try {
        return await AgendaApi.borradores();
    } catch {
        return [];
    }
}

async function iniciarMisCitas() {
    const usuario = obtenerSesion();

    if (!usuario || !usuario.token) {
        mostrarNecesitaLogin();
        return;
    }

    pintarEncabezado(usuario);
    let citas = [];
    let borradores = [];
    try {
        [citas, borradores] = await Promise.all([obtenerMisCitas(), obtenerBorradores()]);
    } catch (err) {
        elementos.mensaje.innerHTML = `
            <div class="sin-citas">
                <i class="bi bi-exclamation-triangle"></i>
                <h2>No se pudieron cargar tus citas</h2>
                <p>${err.message || "Recarga la página e inténtalo de nuevo."}</p>
            </div>
        `;
        if (elementos.container) elementos.container.innerHTML = "";
        return;
    }

    if (!citas.length && !borradores.length) {
        mostrarSinCitas();
        return;
    }
    pintarCitas(citas, borradores);
}


function pintarEncabezado(usuario) {
    if (!elementos.texto) return;
///CORREGIR TRAER NOMBRE DE USUARIO
    elementos.texto.textContent = `Hola, ${usuario.nombre}. Aquí están tus reservas.`;
}

function mostrarNecesitaLogin() {
    if (elementos.container) elementos.container.innerHTML = "";
    elementos.mensaje.innerHTML = `
        <div class="sin-citas">
            <i class="bi bi-person-lock"></i>
            <h2>Inicia sesión</h2>
            <p>
                Debes iniciar sesión para consultar tus citas.
            </p>
            <button type="button" class="sesion-chip sesion-chip--out" data-auth-open>
        <i class="bi bi-person-circle" aria-hidden="true"></i>
        <span>Iniciar sesión</span>
      </button>
        </div>
    `;

    document.getElementById("btnIniciarSesion")?.addEventListener("click", () => {
            window.AgendaAuth?.abrir({
                intent: "session",
                onSuccess: iniciarMisCitas
            });
        });
}

function mostrarSinCitas() {
    elementos.mensaje.innerHTML = `
        <div class="sin-citas">
            <i class="bi bi-calendar-x"></i>
            <h2>No tienes citas</h2>
            <p>
                Actualmente no tienes reservas registradas.
            </p>
        </div>
    `;
    elementos.container.innerHTML = "";
}

function ordenarCitas(citas) {
    return [...citas].sort((a, b) => {
        if (!a.fecha || !a.hora) return 1;
        if (!b.fecha || !b.hora) return -1;
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaA - fechaB;
    });
}

function pintarCitas(citas, borradores) {
    let html = "";
    if (borradores && borradores.length) {
        html += `<div class="citas-seccion"><h3 class="citas-seccion__titulo"><i class="bi bi-file-earmark-text"></i> Borradores <span class="citas-seccion__badge">${borradores.length}</span></h3><div class="citas-seccion__lista">${ordenarCitas(borradores).map(crearCardBorrador).join("")}</div></div>`;
    }
    if (citas.length) {
        html += `<div class="citas-seccion"><h3 class="citas-seccion__titulo"><i class="bi bi-check-circle"></i> Citas confirmadas <span class="citas-seccion__badge">${citas.length}</span></h3><div class="citas-seccion__lista">${ordenarCitas(citas).map(crearCardCita).join("")}</div></div>`;
    }
    elementos.mensaje.innerHTML = "";
    elementos.container.innerHTML = html;
}

function crearCardCita(cita) {
    const servicios = crearServiciosHTML(cita.servicios);

    return `
        <article class="cita-card" data-cita-id="${cita.id}">

            <div class="cita-perfil">
                <img
                    src="./assets/contactanos/huella.svg"
                    alt="Perfil del usuario"
                    class="cita-perfil-img">
            </div>

            <div class="cita-info">

                <h2 class="cita-titulo">
                    CITA DE
                    <span class="cita-mascota">
                        ${cita.mascota}
                    </span>
                </h2>

                <p>
                    <strong>Fecha:</strong>
                    <span>
                        ${formatearFecha(cita.fecha)}
                    </span>
                </p>

                <p>
                    <strong>Hora:</strong>
                    <span>
                        ${formatearHora(cita.hora)}
                    </span>
                </p>

                <p class="cita-servicio-titulo">
                    <strong>Servicio:</strong>
                </p>

                <ul class="cita-servicios">
                    ${servicios}
                </ul>

                <div class="cita-resumen">

                    <p class="cita-total">
                        Total:
                        <strong>
                            ${formatearDinero(cita.precio)}
                        </strong>
                    </p>

                    <p class="cita-duracion">
                        <i class="bi bi-clock"></i>
                        Duración servicio:
                        <strong>
                            ${obtenerDuracionServicios(cita.servicios)}
                        </strong>
                    </p>

                </div>

            </div>

            <div class="cita-acciones">

                <button
                    type="button"
                    class="btn-cita btn-reprogramar"
                    data-accion="reprogramar"
                    data-cita-id="${cita.id}">

                    <i class="bi bi-pencil-square"></i>
                    Reprogramar
                </button>

                <button
                    type="button"
                    class="btn-cita btn-cancelar"
                    data-accion="cancelar"
                    data-cita-id="${cita.id}">

                    <i class="bi bi-trash"></i>
                    Cancelar cita
                </button>

            </div>

        </article>
    `;
}

function crearCardBorrador(cita) {
    const servicios = crearServiciosHTML(cita.servicios);
    const fechaTxt = cita.fecha ? formatearFecha(cita.fecha) : "Sin fecha";
    const horaTxt = cita.hora ? formatearHora(cita.hora) : "Sin hora";

    return `
        <article class="cita-card cita-card--borrador" data-cita-id="${cita.id}">
            <div class="cita-perfil">
                <img src="./assets/contactanos/huella.svg" alt="Borrador" class="cita-perfil-img">
            </div>
            <div class="cita-info">
                <h2 class="cita-titulo">BORRADOR · <span class="cita-mascota">${cita.mascota || "Sin nombre"}</span></h2>
                <p><strong>Fecha:</strong> <span>${fechaTxt}</span></p>
                <p><strong>Hora:</strong> <span>${horaTxt}</span></p>
                <p class="cita-servicio-titulo"><strong>Servicio:</strong></p>
                <ul class="cita-servicios">${servicios || "<li>Sin servicios</li>"}</ul>
                <div class="cita-resumen">
                    <p class="cita-total">Total: <strong>${formatearDinero(cita.precio)}</strong></p>
                </div>
            </div>
            <div class="cita-acciones">
                <button type="button" class="btn-cita btn-continuar-borrador" data-accion="continuar-borrador" data-cita-id="${cita.id}">
                    <i class="bi bi-pencil-square"></i> Continuar
                </button>
                <button type="button" class="btn-cita btn-cancelar" data-accion="eliminar-borrador" data-cita-id="${cita.id}">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </div>
        </article>
    `;
}

function obtenerDuracionServicios(servicios = []) {
    if (!Array.isArray(servicios) || servicios.length === 0) {
        return "No especificada";
    }
    const total = servicios.reduce(
        (minutos, servicio) => minutos + convertirDuracionAMinutos(servicio.duracion),
        0
    );
    if (total) return formatearDuracionTotal(total);
    const textos = servicios.map(servicio => servicio.duracion).filter(Boolean);
    return textos.length ? textos.join(" · ") : "No especificada";
}

function convertirDuracionAMinutos(duracion) {
    if (!duracion) return 0;
    const texto = String(duracion).toLowerCase();
    const horasMatch = texto.match(/(\d+(?:[.,]\d+)?)\s*(hora|horas|h)\b/);
    const minutosMatch = texto.match(/(\d+)\s*(min|minuto|minutos)\b/);
    let minutos = 0;
    if (horasMatch) {
        minutos += Math.round(Number(horasMatch[1].replace(",", ".")) * 60);
    }
    if (minutosMatch) {
        minutos += Number(minutosMatch[1]);
    }
    return minutos;
}

function formatearDuracionTotal(minutosTotales) {
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;
    if (horas && minutos) return `${horas} h ${minutos} min`;
    if (horas) return `${horas} hora${horas > 1 ? "s" : ""}`;
    return `${minutos} min`;
}


function crearServiciosHTML(servicios = []) {
    return servicios.map(servicio => `
        <li class="servicio-item">
            <div class="servicio-info">
                <span class="servicio-nombre">
                    ${servicio.nombre}
                </span>

                <small class="servicio-duracion">
                    ${servicio.duracion}
                </small>
            </div>

            <strong class="servicio-precio">
                ${formatearDinero(servicio.precio)}
            </strong>
        </li>
    `).join("");
}

function formatearDinero(valor) {
    return "$ " + Number(valor || 0).toLocaleString("es-CO");
}

function formatearFecha(fecha) {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
}


function formatearHora(hora) {
    if (!hora) return "";

    const [horas, minutos] = hora.split(":");
    const numeroHora = Number(horas);

    return `${numeroHora % 12 || 12}:${minutos} ${
        numeroHora < 12 ? "AM" : "PM"
    }`;
}

elementos.container?.addEventListener("click",   manejarAccionCita);

async function manejarAccionCita(evento) {
    const boton =evento.target.closest("[data-accion]");

    if (!boton) return;

    const id =  Number(boton.dataset.citaId);

    if (boton.dataset.accion === "cancelar") {
        await cancelarCita(id); }

    if (boton.dataset.accion === "reprogramar") {
        reprogramarCita(id);  }

    if (boton.dataset.accion === "continuar-borrador") {
        window.location.href = `reservar.html?borrador=${id}`;  }

    if (boton.dataset.accion === "eliminar-borrador") {
        await eliminarBorrador(id);  }
}

async function cancelarCita(id) {
    const usuario = obtenerSesion();
    if (!usuario) {
        mostrarNecesitaLogin();
        return;
    }
    const citas = await obtenerMisCitas();
    const cita = citas.find(c => Number(c.id) === id );

    if (!cita) {
        Swal.fire({
            title: "Error",
            text: "No encontramos la cita.",
            icon: "error",
            confirmButtonColor: "#7C9A4A"
        });
        return;
    }

    const resultado = await Swal.fire({
        title: "¿Cancelar cita?",
        text: `Se cancelará la cita de ${cita.mascota}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
        confirmButtonColor: "#D98B7B",
        cancelButtonColor: "#7C9A4A"
    });

    if (!resultado.isConfirmed) return;

    try {
        await AgendaApi.cambiarEstadoReserva(id, "CANCELADA");
    } catch (err) {
        await Swal.fire({
            title: "No se pudo cancelar",
            text: err.message || "Inténtalo de nuevo.",
            icon: "error",
            confirmButtonColor: "#7C9A4A"
        });
        return;
    }
    await Swal.fire({
        title: "Cita cancelada",
        text: "La cita fue cancelada correctamente.",
        icon: "success",
        confirmButtonColor: "#7C9A4A"
    });
    iniciarMisCitas();
}

async function reprogramarCita(id) {
    const usuario = obtenerSesion();
    if (!usuario) {
        mostrarNecesitaLogin();
        return;
    }

    const cita = (await obtenerMisCitas()).find(
        c => Number(c.id) === id
    );

    if (!cita) {
        Swal.fire({
            title: "No encontramos la cita",
            text: "Es posible que ya no esté disponible.",
            icon: "error",
            confirmButtonColor: "#7C9A4A"
        });
        return;
    }

    const resultado = await Swal.fire({
        title: `Reprogramar a ${cita.mascota || cita.nombre || "tu mascota"}`,
        text: `Horario actual: ${formatearFecha(cita.fecha)} · ${formatearHora(cita.hora)}. Te llevamos al calendario para elegir uno nuevo.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ir al calendario",
        cancelButtonText: "Volver",
        confirmButtonColor: "#7C9A4A",
        cancelButtonColor: "#D98B7B"
    });

    if (!resultado.isConfirmed) return;

    window.location.href = `reservar.html?reprogramar=${id}`;
}

async function eliminarBorrador(id) {
    const usuario = obtenerSesion();
    if (!usuario) {
        mostrarNecesitaLogin();
        return;
    }

    const resultado = await Swal.fire({
        title: "¿Eliminar borrador?",
        text: "Se eliminará este borrador de reserva.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No",
        confirmButtonColor: "#D98B7B",
        cancelButtonColor: "#7C9A4A"
    });

    if (!resultado.isConfirmed) return;

    try {
        await AgendaApi.cambiarEstadoReserva(id, "CANCELADA");
    } catch (err) {
        await Swal.fire({
            title: "No se pudo eliminar",
            text: err.message || "Inténtalo de nuevo.",
            icon: "error",
            confirmButtonColor: "#7C9A4A"
        });
        return;
    }
    await Swal.fire({
        title: "Borrador eliminado",
        text: "El borrador fue eliminado correctamente.",
        icon: "success",
        confirmButtonColor: "#7C9A4A"
    });
    iniciarMisCitas();
}

function arrancarMisCitas() {
    iniciarMisCitas();
    document.addEventListener("agenda:sesion", iniciarMisCitas);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancarMisCitas);
} else {
    arrancarMisCitas();
}