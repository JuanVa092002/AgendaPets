const KEY_CITAS = "citas";

const elementos = {
    container: document.getElementById("citasContainer"),
    mensaje: document.getElementById("mensajeCitas"),
    texto: document.getElementById("textoMisCitas")
};

function obtenerCitas() {
    return JSON.parse(
        localStorage.getItem(KEY_CITAS) || "[]"
    );
}

function obtenerSesion() {
    return window.AgendaAuth?.sesion() || null;
}

function obtenerMisCitas() {
    const usuario = obtenerSesion();
    if (!usuario) return [];
    return obtenerCitas().filter(cita => {   const telefono = cita.usuarioTelefono || cita.telefono;
        return normalizarTelefono(telefono) === normalizarTelefono(usuario.telefono);
    });
}


function normalizarTelefono(telefono) {
    return String(telefono || "").replace(/\D/g, "").slice(-10);
}

function iniciarMisCitas() {
    const usuario = obtenerSesion();

    if (!usuario) {
        mostrarNecesitaLogin();
        return;
    }

    pintarEncabezado(usuario);
    const citas = obtenerMisCitas();

    if (!citas.length) {
        mostrarSinCitas();
        return;
    }
    pintarCitas(citas);
}


function pintarEncabezado(usuario) {
    if (!elementos.texto) return;
///CORREGIR TRAER NOMBRE DE USUARIO
    elementos.texto.textContent = `Hola, ${usuario.nombre}. Aquí están tus reservas.`;
}

function mostrarNecesitaLogin() {
    elementos.mensaje.innerHTML = `
        <div class="sin-citas">
            <i class="bi bi-person-lock"></i>
            <h2>Inicia sesión</h2>
            <p>
                Debes iniciar sesión para consultar tus citas.
            </p>
            <button
                type="button"
                class="btnIniciarSesion"
                id="btnIniciarSesion">
                Iniciar sesión
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

function pintarCitas(citas) {
    elementos.mensaje.innerHTML = "";
    elementos.container.innerHTML =
        ordenarCitas(citas)
            .map(crearCardCita)
            .join("");
}

function ordenarCitas(citas) {
    return [...citas].sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);

        return fechaA - fechaB;
    });
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

function obtenerDuracionServicios(servicios = []) {
    if (!Array.isArray(servicios) || servicios.length === 0) {
        return "No especificada";
    }
    return servicios .map(servicio => servicio.duracion).filter(Boolean).join(" + ");
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
}

async function cancelarCita(id) {
    const usuario = obtenerSesion();
    if (!usuario) {
        mostrarNecesitaLogin();
        return;
    }
    const citas = obtenerCitas();
    const cita = citas.find(   c => Number(c.id) === id );

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

    const actualizadas = citas.filter(c => Number(c.id) !== id );
    localStorage.setItem(  KEY_CITAS,   JSON.stringify(actualizadas) );
    await Swal.fire({
        title: "Cita cancelada",
        text: "La cita fue cancelada correctamente.",
        icon: "success",
        confirmButtonColor: "#7C9A4A"
    });
    iniciarMisCitas();
}

//REVISAR FLUJO CON RESERVAR CITAS
function reprogramarCita(id) {
    const cita = obtenerCitas().find(
        c => Number(c.id) === id
    );
    if (!cita) return;
    const usuario = obtenerSesion();
    if (!usuario) {
        mostrarNecesitaLogin();
        return;
    }
    window.location.href =`reservar.html?reprogramar=${id}`;
}


iniciarMisCitas();