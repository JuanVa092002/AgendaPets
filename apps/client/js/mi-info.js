const KEY_INFO = "info_negocio";

const infoInicial = {
    nombre: "Huellitas",
    correo: "admin@agendapets.com",
    direccion: "Chapinero, Bogotá",
    telefono: "+57 310 555 7890"
};

function obtenerInfoNegocio() {
    const guardada = localStorage.getItem(KEY_INFO);
    return guardada ? JSON.parse(guardada) : infoInicial;
}

function guardarInfoNegocio(datos) {
    localStorage.setItem(KEY_INFO, JSON.stringify(datos));
    actualizarInfoEnPantalla();
}

function actualizarInfoEnPantalla() {
    const info = obtenerInfoNegocio();

    const subMarcaAdmin = document.getElementById("admin-negocio-subtitulo");
    if (subMarcaAdmin) {
        subMarcaAdmin.textContent = info.nombre;
    }

    const chipAdmin = document.getElementById("admin-saludo");
    if (chipAdmin) {
        chipAdmin.textContent = info.nombre;
    }

    document.querySelectorAll(".brand-subtitulo, .footer-subtitulo").forEach(el => {
        el.textContent = info.nombre;
    });

    const footerCorreo = document.querySelector(".footer-correo");
    if (footerCorreo) footerCorreo.textContent = info.correo;

    const footerTelefono = document.querySelector(".footer-telefono");
    if (footerTelefono) footerTelefono.textContent = info.telefono;

    const footerDireccion = document.querySelector(".footer-direccion");
    if (footerDireccion) footerDireccion.textContent = info.direccion;

    const contactoCorreo = document.querySelector(".mapa-split__lista .bi-envelope-fill + span");
    if (contactoCorreo) contactoCorreo.textContent = info.correo;

    const contactoTelefono = document.querySelector(".mapa-split__lista .bi-telephone-fill + span");
    if (contactoTelefono) contactoTelefono.textContent = info.telefono;

    const contactoDireccion = document.querySelector(".mapa-split__lista .bi-geo-alt-fill + span");
    if (contactoDireccion) contactoDireccion.textContent = info.direccion;
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarInfoEnPantalla();

    const formulario = document.getElementById("form-mi-info");
    if (formulario) {
        const info = obtenerInfoNegocio();

        document.getElementById("negocio-nombre").value = info.nombre;
        document.getElementById("admin-correo").value = info.correo;
        document.getElementById("admin-direccion").value = info.direccion;
        document.getElementById("admin-telefono").value = info.telefono;

        formulario.addEventListener("submit", (e) => {
            e.preventDefault();

            const nuevosDatos = {
                nombre: document.getElementById("negocio-nombre").value.trim(),
                correo: document.getElementById("admin-correo").value.trim(),
                direccion: document.getElementById("admin-direccion").value.trim(),
                telefono: document.getElementById("admin-telefono").value.trim()
            };

            guardarInfoNegocio(nuevosDatos);

            if (window.Swal) {
                Swal.fire({
                    title: "Información actualizada",
                    text: "Los datos del negocio se han guardado correctamente.",
                    icon: "success",
                    confirmButtonColor: "#7C9A4A"
                });
            }
        });
    }
});