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
        console.warn("API de negocio no disponible, usando respaldo local:", error);
    }
    const guardada = localStorage.getItem(KEY_INFO);
    return guardada ? JSON.parse(guardada) : infoInicial;
}

async function actualizarInfoEnPantalla() {
    const local = localStorage.getItem(KEY_INFO);
    if (local) {
        const infoLocal = JSON.parse(local);
        aplicarEnDOM(infoLocal);
    }

    const infoServidor = await obtenerInfoNegocio();
    aplicarEnDOM(infoServidor);
}

function aplicarEnDOM(info) {
    if (!info || !info.nombre) return;

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
    const formulario = document.getElementById("form-mi-info");
    if (formulario) {
        const sesion = JSON.parse(localStorage.getItem("sesion") || "null");
        const esAdmin = sesion && sesion.token && String(sesion.rol || "").toLowerCase() === "admin";
        if (!esAdmin) {
            window.location.replace("../iniciarSesion.html");
            return;
        }
    }

    await actualizarInfoEnPantalla();

    if (formulario) {
        const info = await obtenerInfoNegocio();

        if (document.getElementById("negocio-nombre")) document.getElementById("negocio-nombre").value = info.nombre || "";
        if (document.getElementById("admin-correo")) document.getElementById("admin-correo").value = info.correo || "";
        if (document.getElementById("admin-direccion")) document.getElementById("admin-direccion").value = info.direccion || "";
        if (document.getElementById("admin-telefono")) document.getElementById("admin-telefono").value = info.telefono || "";

        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nuevosDatos = {
                nombre: document.getElementById("negocio-nombre").value.trim(),
                correo: document.getElementById("admin-correo").value.trim(),
                direccion: document.getElementById("admin-direccion").value.trim(),
                telefono: document.getElementById("admin-telefono").value.trim()
            };

            try {
                const sesion = JSON.parse(localStorage.getItem("sesion") || "null");
                if (!sesion || !sesion.token) {
                    throw new Error("No hay una sesión de administrador. Inicia sesión otra vez e inténtalo de nuevo.");
                }

                let guardado = nuevosDatos;
                if (window.AgendaApi && typeof window.AgendaApi.actualizarNegocio === "function") {
                    guardado = await window.AgendaApi.actualizarNegocio(nuevosDatos);
                }
                
                localStorage.setItem(KEY_INFO, JSON.stringify(guardado));
                aplicarEnDOM(guardado);

                if (window.Swal) {
                    Swal.fire({
                        title: "¡Guardado exitoso!",
                        text: "Los datos se han guardado en la base de datos.",
                        icon: "success",
                        confirmButtonColor: "#7C9A4A"
                    });
                }
            } catch (err) {
                console.error("Error al guardar:", err);
                if (window.Swal) {
                    Swal.fire({
                        title: "Error al guardar",
                        text: err.message || "No se pudo guardar la información en el servidor.",
                        icon: "error"
                    });
                }
            }
        });
    }
});