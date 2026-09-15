const KEY_INFO = "info_negocio";

const infoInicial = {
    nombre: "Peluquería",
    correo: "admin@agendapets.com",
    direccion: "Chapinero, Bogotá",
    telefono: "+57 310 555 7890"
};

async function obtenerInfoNegocio() {
    try {
        if (window.AgendaApi && typeof window.AgendaApi.obtenerNegocio === "function") {
            const data = await window.AgendaApi.obtenerNegocio();
            if (data && data.nombre) {
                localStorage.setItem(KEY_INFO, JSON.stringify(data));
                return data;
            }
        }
    } catch (error) {
        console.warn("No se pudo conectar con la API, usando respaldo local:", error);
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
    if (chipAdmin) chipAdmin.textContent = info.nombre;

    const footerCorreo = document.querySelector(".footer-correo");
    if (footerCorreo) footerCorreo.textContent = info.correo;

    const footerTelefono = document.querySelector(".footer-telefono");
    if (footerTelefono) footerTelefono.textContent = info.telefono;

    const footerDireccion = document.querySelector(".footer-direccion");
    if (footerDireccion) footerDireccion.textContent = info.direccion;
}

window.actualizarInfoEnPantalla = actualizarInfoEnPantalla;

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

            const nuevosDatos = {
                nombre: document.getElementById("negocio-nombre").value.trim(),
                correo: document.getElementById("admin-correo").value.trim(),
                direccion: document.getElementById("admin-direccion").value.trim(),
                telefono: document.getElementById("admin-telefono").value.trim()
            };

            try {
                let guardado = nuevosDatos;
                if (window.AgendaApi && typeof window.AgendaApi.actualizarNegocio === "function") {
                    guardado = await window.AgendaApi.actualizarNegocio(nuevosDatos);
                }
                
                localStorage.setItem(KEY_INFO, JSON.stringify(guardado));
                await actualizarInfoEnPantalla();

                if (window.Swal) {
                    Swal.fire({
                        title: "Guardado en la Base de Datos",
                        text: "Los cambios ahora son globales para cualquier navegador.",
                        icon: "success",
                        confirmButtonColor: "#7C9A4A"
                    });
                }
            } catch (err) {
                console.error(err);
                if (window.Swal) {
                    Swal.fire({
                        title: "Error al actualizar",
                        text: err.message || "No se pudo guardar la información.",
                        icon: "error"
                    });
                }
            }
        });
    }
});