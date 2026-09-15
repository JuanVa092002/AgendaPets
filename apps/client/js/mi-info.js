const KEY_INFO = "info_negocio";

const infoInicial = {
    nombre: "Peluquería",
    correo: "admin@agendapets.com",
    direccion: "Chapinero, Bogotá",
    telefono: "+57 310 555 7890"
};

async function obtenerInfoNegocio() {
    try {
        if (window.AgendaApi && typeof AgendaApi.obtenerNegocio === "function") {
            const data = await AgendaApi.obtenerNegocio();
            if (data && data.nombre) {
                localStorage.setItem(KEY_INFO, JSON.stringify(data));
                return data;
            }
        }
    } catch (error) {
        console.warn("No se pudo conectar con la API de negocio, usando cache local:", error);
    }
    const guardada = localStorage.getItem(KEY_INFO);
    return guardada ? JSON.parse(guardada) : infoInicial;
}

async function actualizarInfoEnPantalla() {
    const info = await obtenerInfoNegocio();

    document.querySelectorAll(".brand-subtitulo, .footer-subtitulo, #admin-negocio-subtitulo").forEach(el => {
        el.textContent = info.nombre;
    });

    const chipAdmin = document.getElementById("admin-saludo");
    if (chipAdmin) {
        chipAdmin.textContent = info.nombre;
    }

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

document.addEventListener("DOMContentLoaded", async () => {
    await actualizarInfoEnPantalla();

    const formulario = document.getElementById("form-mi-info");
    if (formulario) {
        const info = await obtenerInfoNegocio();

        document.getElementById("negocio-nombre").value = info.nombre || "";
        document.getElementById("admin-correo").value = info.correo || "";
        document.getElementById("admin-direccion").value = info.direccion || "";
        document.getElementById("admin-telefono").value = info.telefono || "";

        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = formulario.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            const nuevosDatos = {
                nombre: document.getElementById("negocio-nombre").value.trim(),
                correo: document.getElementById("admin-correo").value.trim(),
                direccion: document.getElementById("admin-direccion").value.trim(),
                telefono: document.getElementById("admin-telefono").value.trim()
            };

            try {
                let guardado = nuevosDatos;
                if (window.AgendaApi && typeof AgendaApi.actualizarNegocio === "function") {
                    guardado = await AgendaApi.actualizarNegocio(nuevosDatos);
                }
                
                localStorage.setItem(KEY_INFO, JSON.stringify(guardado));
                await actualizarInfoEnPantalla();

                if (window.Swal) {
                    Swal.fire({
                        title: "Información actualizada",
                        text: "Los datos del negocio se han guardado en la base de datos.",
                        icon: "success",
                        confirmButtonColor: "#7C9A4A"
                    });
                }
            } catch (err) {
                console.error(err);
                if (window.Swal) {
                    Swal.fire({
                        title: "Error al guardar",
                        text: err.message || "No se pudo sincronizar la información con el servidor.",
                        icon: "error"
                    });
                }
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});