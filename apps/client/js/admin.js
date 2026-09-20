(function protegerAdmin() {
    const s = JSON.parse(localStorage.getItem("sesion") || "null");
    if (!s || !s.token || String(s.rol || "").toLowerCase() !== "admin") {
        window.location.replace("../index.html");
    }
})();

const formulario = document.getElementById("form-servicio");
const contenedorServicios = document.getElementById("contenedorServicios");
const inputId = document.getElementById("servicio-id");
const btnSubmit = document.getElementById("btn-submit");
const btnCancelar = document.getElementById("btn-cancelar");
const textoFormulario = document.getElementById("texto-formulario");
const iconoFormulario = document.getElementById("icono-formulario");

let servicios = [];

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const datos = leerFormulario();
    const error = validarServicio(datos);

    if (error) {
        avisar("Campos incompletos", error, "warning");
        return;
    }

    try {
        if (datos.id) {
            await actualizarServicio(datos);
        } else {
            await crearServicio(datos);
        }
    } catch (err) {
        avisar("No se pudo guardar", err.message || "Inténtalo de nuevo.", "error");
    }
});

btnCancelar.addEventListener("click", () => {
    salirModoEdicion();
});

contenedorServicios.addEventListener("click", (event) => {
    const boton = event.target.closest("button[data-accion]");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "editar") iniciarEdicion(id);
    if (accion === "ocultar") void alternarVisibilidad(id);
    if (accion === "eliminar") confirmarEliminacion(id);
});

function minutosDeDuracion(texto) {
    const valor = String(texto || "").toLowerCase();
    const horas = valor.match(/(\d+(?:[.,]\d+)?)\s*(hora|horas|h)\b/);
    const minutos = valor.match(/(\d+)\s*(min|minuto|minutos)\b/);
    let total = 0;
    if (horas) total += Math.round(Number(horas[1].replace(",", ".")) * 60);
    if (minutos) total += Number(minutos[1]);
    if (total) return total;
    const solo = valor.replace(/\D+/g, "");
    return solo ? Number(solo) : 30;
}

function payloadServicio(datos, extra) {
    return Object.assign({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        duracion: datos.duracion,
        duracionServicio: minutosDeDuracion(datos.duracion)
    }, extra || {});
}

async function cargarServicios() {
    servicios = await AgendaApi.servicios();
    mostrarServicios();
}

async function crearServicio({ nombre, duracion, precio, descripcion }) {
    await AgendaApi.crearServicio(payloadServicio({ nombre, duracion, precio, descripcion }, { visible: true }));
    await cargarServicios();
    formulario.reset();
    avisar("Servicio creado", `"${nombre}" ya está en la lista.`, "success");
}

async function actualizarServicio({ id, nombre, duracion, precio, descripcion }) {
    const actual = servicios.find((item) => item.id === id);
    await AgendaApi.actualizarServicio(id, payloadServicio(
        { nombre, duracion, precio, descripcion },
        { visible: actual ? actual.visible !== false : true }
    ));
    await cargarServicios();
    salirModoEdicion();
    avisar("Servicio actualizado", `"${nombre}" se guardó correctamente.`, "success");
}

function leerFormulario() {
    const id = inputId.value.trim();

    return {
        id: id ? Number(id) : null,
        nombre: document.getElementById("nombre").value.trim(),
        duracion: document.getElementById("duracion").value.trim(),
        precio: Number(document.getElementById("precio").value),
        descripcion: document.getElementById("descripcion").value.trim()
    };
}

function validarServicio({ nombre, duracion, precio, descripcion }) {
    if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (duracion.length < 2) return "Indica una duración válida.";
    if (!Number.isFinite(precio) || precio <= 0) return "El precio debe ser un número mayor a 0.";
    if (descripcion.length < 10) return "La descripción debe tener al menos 10 caracteres.";
    return "";
}

function iniciarEdicion(id) {
    const servicio = servicios.find((item) => item.id === id);
    if (!servicio) return;

    inputId.value = servicio.id;
    document.getElementById("nombre").value = servicio.nombre;
    document.getElementById("duracion").value = servicio.duracion;
    document.getElementById("precio").value = servicio.precio;
    document.getElementById("descripcion").value = servicio.descripcion;

    textoFormulario.textContent = "Editar servicio";
    const ayuda = document.getElementById("texto-formulario-ayuda");
    if (ayuda) ayuda.textContent = "Los cambios se ven al instante en la reserva.";
    iconoFormulario.className = "bi bi-pencil-square";
    btnSubmit.innerHTML = '<i class="bi bi-check2"></i> Guardar cambios';
    btnCancelar.classList.remove("d-none");

    formulario.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("nombre").focus();
}

function salirModoEdicion() {
    formulario.reset();
    inputId.value = "";
    textoFormulario.textContent = "Nuevo servicio";
    const ayuda = document.getElementById("texto-formulario-ayuda");
    if (ayuda) ayuda.textContent = "Se publica al instante en la reserva.";
    iconoFormulario.className = "bi bi-plus-lg";
    btnSubmit.innerHTML = '<i class="bi bi-check2"></i> Crear servicio';
    btnCancelar.classList.add("d-none");
}

async function alternarVisibilidad(id) {
    const servicio = servicios.find((item) => item.id === id);
    if (!servicio) return;
    try {
        await AgendaApi.actualizarServicio(id, payloadServicio(servicio, { visible: servicio.visible === false }));
        await cargarServicios();
    } catch (err) {
        avisar("No se pudo actualizar", err.message || "Inténtalo de nuevo.", "error");
    }
}

function confirmarEliminacion(id) {
    const servicio = servicios.find((item) => item.id === id);
    if (!servicio) return;

    Swal.fire({
        title: "¿Eliminar servicio?",
        text: `"${servicio.nombre}" se quitará de forma permanente.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C25F5F",
        cancelButtonColor: "#7C9A4A",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(async (resultado) => {
        if (!resultado.isConfirmed) return;
        try {
            await eliminarServicio(id);
        } catch (err) {
            avisar("No se pudo eliminar", err.message || "Inténtalo de nuevo.", "error");
        }
    });
}

async function eliminarServicio(id) {
    const servicio = servicios.find((item) => item.id === id);
    await AgendaApi.eliminarServicio(id);

    if (Number(inputId.value) === id) {
        salirModoEdicion();
    }

    await cargarServicios();
    avisar("Servicio eliminado", `"${servicio.nombre}" ya no está en la lista.`, "success");
}

function iconoServicio(nombre) {
    const n = String(nombre || "").toLowerCase();
    if (n.includes("uña")) return "bi-heart";
    if (n.includes("corte")) return "bi-scissors";
    if (n.includes("spa") || n.includes("premium")) return "bi-stars";
    if (n.includes("dental")) return "bi-award";
    if (n.includes("baño") || n.includes("bano")) return "bi-droplet";
    return "bi-paw-fill";
}

function pintarResumen() {
    const total = servicios.length;
    const visibles = servicios.filter((s) => s.visible !== false).length;
    const set = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(valor);
    };
    set("stat-total", total);
    set("stat-visible", visibles);
    set("stat-ocultos", total - visibles);
    const copy = document.getElementById("texto-catalogo");
    if (copy) {
        copy.textContent = total
            ? `${visibles} visibles · ${total - visibles} ocultos`
            : "Aún no hay servicios";
    }
}

function mostrarServicios() {
    contenedorServicios.innerHTML = "";
    pintarResumen();

    const q = (document.getElementById("buscar-servicio")?.value || "").trim().toLowerCase();
    const lista = servicios.filter((servicio) => {
        if (!q) return true;
        return `${servicio.nombre} ${servicio.descripcion}`.toLowerCase().includes(q);
    });

    if (servicios.length === 0) {
        contenedorServicios.innerHTML = `
            <div class="servicios-vacio">
                <i class="bi bi-plus-circle"></i>
                <strong>Crea el primer servicio</strong>
                <p>El catálogo vacío no muestra nada al cliente en Reservar.</p>
            </div>
        `;
        return;
    }

    if (lista.length === 0) {
        contenedorServicios.innerHTML = `
            <div class="servicios-vacio">
                <i class="bi bi-search"></i>
                <strong>Sin coincidencias</strong>
                <p>Prueba con otro nombre o descripción.</p>
            </div>
        `;
        return;
    }

    lista.forEach((servicio) => {
        const oculto = !servicio.visible;
        const precio = Number(servicio.precio).toLocaleString("es-CO");

        contenedorServicios.insertAdjacentHTML("beforeend", `
            <article class="servicio ${oculto ? "servicio--oculto" : ""}">
                <div class="icono-servicio" aria-hidden="true">
                    <i class="bi ${iconoServicio(servicio.nombre)}"></i>
                </div>
                <div class="info-servicio">
                    <h3>
                        ${escaparHtml(servicio.nombre)}
                        <span class="etiqueta-estado ${oculto ? "etiqueta-estado--oculto" : ""}">
                            ${oculto ? "Oculto" : "Visible"}
                        </span>
                    </h3>
                    <p>${escaparHtml(servicio.descripcion)}</p>
                    <div class="datos-servicio">
                        <span>$ ${precio}</span>
                        <span><i class="bi bi-clock"></i>${escaparHtml(servicio.duracion)}</span>
                    </div>
                </div>
                <div class="acciones-servicio">
                    <button type="button" class="btn btn-sm btn-editar" data-accion="editar" data-id="${servicio.id}">
                        <i class="bi bi-pencil-square"></i>
                        Editar
                    </button>
                    <button type="button" class="btn btn-sm btn-ocultar" data-accion="ocultar" data-id="${servicio.id}">
                        <i class="bi ${oculto ? "bi-eye" : "bi-eye-slash"}"></i>
                        ${oculto ? "Mostrar" : "Ocultar"}
                    </button>
                    <button type="button" class="btn btn-sm btn-eliminar" data-accion="eliminar" data-id="${servicio.id}">
                        <i class="bi bi-trash3"></i>
                        Quitar
                    </button>
                </div>
            </article>
        `);
    });
}

function escaparHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function avisar(titulo, texto, icono) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonColor: "#7C9A4A"
    });
}

mostrarServicios();
cargarServicios().catch((err) => {
    avisar("No se pudieron cargar los servicios", err.message || "Recarga la página.", "error");
});

document.querySelector(".logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.AgendaAuth) AgendaAuth.cerrarSesion();
    else {
        localStorage.removeItem("sesion");
        window.location.href = "../index.html";
    }
});
