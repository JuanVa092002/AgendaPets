import {
    buscarCitasPorTelefono,
    obtenerCitaPorId,
    cancelarCitaPorId,
    normalizarTelefono,
    formatearDinero,
    formatearFecha,
    formatearHora
} from "./citas-storage.js";


const elementos = {
    inputTelefono: document.getElementById("numeroCelular"),
    btnBuscar:  document.getElementById("btnBuscarCitas"),
    mensaje:   document.getElementById("mensajeCitas"),
    container: document.getElementById("citasContainer")
};


function iniciarPaginaCitas() {
    configurarEventos();
}


function configurarEventos() {
    elementos.btnBuscar.addEventListener("click", consultarCitas  );
    elementos.inputTelefono.addEventListener(  "keydown",manejarEnter );
    elementos.container.addEventListener( "click",   manejarAccionesCita  );
}

function manejarEnter(evento) {
    if (evento.key !== "Enter") 
        return;
    consultarCitas();
}


function consultarCitas() {
    const telefono = elementos.inputTelefono.value.trim();
    limpiarResultados();

    if (!validarTelefono(telefono)) {
        Swal.fire({
            title: "Número inválido",
            text: "Ingresa un número de celular válido de 10 dígitos.",
            icon: "warning",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#7C9A4A"
        });
        return;
    }

    const citasEncontradas = buscarCitasPorTelefono(telefono);
    if (!citasEncontradas.length) {
        Swal.fire({
            title: "Sin citas",
            text: "No encontramos reservas asociadas a este número.",
            icon: "info",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#7C9A4A"
        });

        mostrarSinCitas();
        return;

    }
    pintarCitas(citasEncontradas);
}


function validarTelefono(telefono) {
    return normalizarTelefono(telefono).length === 10;
}


function limpiarResultados() {
    elementos.mensaje.innerHTML = "";
    elementos.container.innerHTML = "";
}


function mostrarSinCitas() {
    elementos.mensaje.innerHTML = `
        <div class="sin-citas">
            <i class="bi bi-calendar-x"></i>
            <h2>No encontramos citas</h2>
            <p>     No existen reservas asociadas a este número.
            </p>
        </div>
    `;
}

function pintarCitas(citas) {
    const ordenadas =
        ordenarCitas(citas);
    elementos.container.innerHTML =ordenadas.map(crearCardCita).join("");
}

function ordenarCitas(citas) {
    return [...citas].sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}` );
        return fechaA - fechaB;
    });
}

function crearCardCita(cita) {
    const serviciosHTML = crearServiciosHTML(cita.servicios);
    const total = cita.precio ||calcularTotal(cita.servicios);
    return `
        <article
            class="cita-card"
            data-cita-id="${cita.id}">

            <div class="cita-info">
                <h2 class="cita-titulo">
                    CITA DE <span class="cita-mascota"> ${cita.mascota}</span>
                </h2>
                <p> <strong>Fecha:</strong>
                    <span class="cita-fecha"> ${formatearFecha(cita.fecha)}</span>
                </p>

                <p>
                    <strong>Hora:</strong>
                    <span class="cita-hora"> ${formatearHora(cita.hora)} </span>
                </p>

                <p>  <strong>Servicios:</strong> </p>
                <ul class="cita-servicios">
                    ${serviciosHTML}
                </ul>
            </div>

            <div class="cita-acciones">
                <button type="button" class="btn-cita btn-reprogramar"data-accion="reprogramar" data-cita-id="${cita.id}">
                    <i class="bi bi-pencil-square"></i>
                    Reprogramar
                </button>

                <button
                    type="button"  class="btn-cita btn-cancelar"  data-accion="cancelar"data-cita-id="${cita.id}" >
                    <i class="bi bi-trash"></i>
                    Cancelar cita
                </button>
            </div>

            <div class="cita-resumen">
                <span class="badge-cita"> Total:  <span class="cita-total"> ${formatearDinero(total)}   </span>   </span>
            </div>
        </article>
    `;
}


function crearServiciosHTML(servicios = []) {

    if (!Array.isArray(servicios) ||  !servicios.length ) {
        return `
            <li class="servicio-vacio">
                No hay servicios registrados.
            </li>`
            ;
    }
    return servicios.map((servicio) => `
        <li class="servicio-item">
            <div class="servicio-info">
                <span class="servicio-nombre">
                    ${servicio.nombre}
                </span>
                <small class="servicio-duracion">  ${servicio.duracion} </small>
            </div>

            <strong class="servicio-precio"> ${formatearDinero(servicio.precio)} </strong>
        </li>
    `).join("");
}


function calcularTotal(servicios = []) {
    if (!Array.isArray(servicios)) {
        return 0;
    }

    return servicios.reduce(
        (total, servicio) => {
            return (
                total +
                Number(
                    servicio.precio || 0
                )
            );
        },
        0
    );

}


function manejarAccionesCita(evento) {
    const boton =
        evento.target.closest(  "[data-accion]");
    if (!boton) return;
    const accion =boton.dataset.accion;
    const citaId =    Number(   boton.dataset.citaId    );

    if (accion === "cancelar") {
        cancelarCita(citaId);
    }
    if (accion === "reprogramar") {
        reprogramarCita(citaId);
    }
}


async function cancelarCita(citaId) {
    const cita =
        obtenerCitaPorId(citaId);
    if (!cita) {
        await Swal.fire({
            title: "Error",
            text: "No fue posible encontrar la cita.",
            icon: "error",
            confirmButtonColor: "#7C9A4A"
        });
        return;
    }
    const resultado =
        await Swal.fire({
            title: "¿Cancelar cita?",
            text: `Vas a cancelar la cita de ${cita.mascota}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No, conservar",
            confirmButtonColor: "#D98B7B",
            cancelButtonColor: "#7C9A4A"
        });

    if (!resultado.isConfirmed) return;
    cancelarCitaPorId(citaId);
    await Swal.fire({
        title: "Cita cancelada",
        text: "La cita fue cancelada correctamente.",
        icon: "success",
        confirmButtonColor: "#7C9A4A"
    });
    consultarCitas();

}

// PENDIENTE IMPLEMENTAR REPROGRAMAR CITA
/* async function reprogramarCita(citaId) {
    const cita =
        obtenerCitaPorId(citaId);
    if (!cita) {
        await Swal.fire({
            title: "Error",
            text: "No encontramos la cita seleccionada.",
            icon: "error",
            confirmButtonColor: "#7C9A4A"
        });
        return;
    }
    const resultado =
        await Swal.fire({
            title: "¿Reprogramar cita?",
            html: `
                <p>
                    Vas a modificar la cita de
                    <strong>${cita.mascota}</strong>.
                </p>
                <p>
                    Fecha actual:
                    <strong>
                        ${formatearFecha(cita.fecha)}
                    </strong>
                </p>
                <p>
                    Hora actual:
                    <strong>
                        ${formatearHora(cita.hora)}
                    </strong>
                </p>
            `,

            icon: "question",

            showCancelButton: true,
            confirmButtonText: "Reprogramar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#7C9A4A",
            cancelButtonColor: "#D98B7B"

        });

    if (!resultado.isConfirmed) return;
    window.location.href =
        `reservar.html?reprogramar=${citaId}`;

} */


iniciarPaginaCitas();