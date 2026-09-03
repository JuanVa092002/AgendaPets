const STORAGE_KEY = "servicios";

(function protegerAdmin() {
    const s = JSON.parse(localStorage.getItem("sesion") || "null");
    if (!s || s.rol !== "admin") {
        window.location.replace("../index.html");
    }
})();

const serviciosIniciales = [
    {
        id: 1,
        nombre: "Baño básico",
        duracion: "1 hora",
        precio: 15000,
        descripcion: "Baño completo con shampoo especializado, secado y cepillado.",
        visible: true
    },
    {
        id: 2,
        nombre: "Corte de pelo",
        duracion: "1 hora y 30 minutos",
        precio: 25000,
        descripcion: "Corte personalizado según raza, con cepillado y limpieza del pelaje.",
        visible: true
    },
    {
        id: 3,
        nombre: "Corte de uñas",
        duracion: "30 minutos",
        precio: 10000,
        descripcion: "Corte de uñas seguro para mantener higiene y comodidad.",
        visible: true
    },
    {
        id: 4,
        nombre: "Limpieza dental",
        duracion: "45 minutos",
        precio: 20000,
        descripcion: "Limpieza bucal para reducir placa y cuidar dientes y encías.",
        visible: true
    },
    {
        id: 5,
        nombre: "Baño premium",
        duracion: "2 horas",
        precio: 35000,
        descripcion: "Baño premium con tratamiento del pelaje, secado y cepillado.",
        visible: true
    }
];

const formulario = document.getElementById("form-servicio");
const contenedorServicios = document.getElementById("contenedorServicios");
const inputId = document.getElementById("servicio-id");
const btnSubmit = document.getElementById("btn-submit");
const btnCancelar = document.getElementById("btn-cancelar");
const textoFormulario = document.getElementById("texto-formulario");
const iconoFormulario = document.getElementById("icono-formulario");

let servicios = cargarServicios();

formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const datos = leerFormulario();
    const error = validarServicio(datos);

    if (error) {
        avisar("Campos incompletos", error, "warning");
        return;
    }

    if (datos.id) {
        actualizarServicio(datos);
    } else {
        crearServicio(datos);
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
    if (accion === "ocultar") alternarVisibilidad(id);
    if (accion === "eliminar") confirmarEliminacion(id);
});

function cargarServicios() {
    const guardados = localStorage.getItem(STORAGE_KEY);

    if (!guardados) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serviciosIniciales));
        return [...serviciosIniciales];
    }

    return JSON.parse(guardados).map((servicio) => ({
        ...servicio,
        precio: Number(servicio.precio),
        visible: servicio.visible !== false
    }));
}

function guardarServicios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicios));
}

function siguienteId() {
    if (servicios.length === 0) return 1;
    return Math.max(...servicios.map((servicio) => servicio.id)) + 1;
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

function crearServicio({ nombre, duracion, precio, descripcion }) {
    servicios.push({
        id: siguienteId(),
        nombre,
        duracion,
        precio,
        descripcion,
        visible: true
    });

    guardarServicios();
    mostrarServicios();
    formulario.reset();
    avisar("Servicio creado", `"${nombre}" ya está en la lista.`, "success");
}

function actualizarServicio({ id, nombre, duracion, precio, descripcion }) {
    const servicio = servicios.find((item) => item.id === id);
    if (!servicio) return;

    servicio.nombre = nombre;
    servicio.duracion = duracion;
    servicio.precio = precio;
    servicio.descripcion = descripcion;

    guardarServicios();
    mostrarServicios();
    salirModoEdicion();
    avisar("Servicio actualizado", `"${nombre}" se guardó correctamente.`, "success");
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

function alternarVisibilidad(id) {
    const servicio = servicios.find((item) => item.id === id);
    if (!servicio) return;

    servicio.visible = !servicio.visible;
    guardarServicios();
    mostrarServicios();
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
    }).then((resultado) => {
        if (!resultado.isConfirmed) return;
        eliminarServicio(id);
    });
}

function eliminarServicio(id) {
    const servicio = servicios.find((item) => item.id === id);
    servicios = servicios.filter((item) => item.id !== id);
    guardarServicios();

    if (Number(inputId.value) === id) {
        salirModoEdicion();
    }

    mostrarServicios();
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

document.getElementById("buscar-servicio")?.addEventListener("input", mostrarServicios);

const saludo = document.getElementById("admin-saludo");
const sesion = JSON.parse(localStorage.getItem("sesion") || "null");
if (saludo && sesion?.nombre) {
    saludo.textContent = sesion.nombre.split(" ")[0];
}

document.querySelector(".logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.AgendaAuth) AgendaAuth.cerrarSesion();
    else localStorage.removeItem("sesion");
    window.location.href = "../index.html";
});
