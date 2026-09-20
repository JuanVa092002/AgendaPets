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

function formatearHoraAMPM(hora24) {
    if (!hora24) return "";
    const [h, m] = hora24.split(":");
    const numH = parseInt(h, 10);
    const sufijo = numH >= 12 ? "pm" : "am";
    const h12 = numH % 12 || 12;
    return `${h12}:${m} ${sufijo}`;
}

function formatearHorariosAgrupados(horarios) {
    const ordenDias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const nombresCortos = { lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom" };
    
    const abiertos = ordenDias
        .filter(dia => horarios[dia] && horarios[dia].activo)
        .map(dia => ({
            dia,
            inicio: horarios[dia].inicio,
            fin: horarios[dia].fin,
            rango: `${formatearHoraAMPM(horarios[dia].inicio)} – ${formatearHoraAMPM(horarios[dia].fin)}`
        }));

    if (abiertos.length === 0) return [{ dias: "Todos los días", horas: "Cerrado" }];

    const grupos = [];
    let grupoActual = null;

    abiertos.forEach(item => {
        if (!grupoActual) {
            grupoActual = { inicioDia: item.dia, finDia: item.dia, rango: item.rango };
        } else if (grupoActual.rango === item.rango) {
            grupoActual.finDia = item.dia;
        } else {
            grupos.push(grupoActual);
            grupoActual = { inicioDia: item.dia, finDia: item.dia, rango: item.rango };
        }
    });
    if (grupoActual) grupos.push(grupoActual);

    return grupos.map(g => {
        const diaTexto = g.inicioDia === g.finDia 
            ? nombresCortos[g.inicioDia] 
            : `${nombresCortos[g.inicioDia]} – ${nombresCortos[g.finDia]}`;
        return {
            dias: diaTexto,
            horas: g.rango
        };
    });
}

function aplicarHorariosEnDOM(horariosJsonRaw) {
    if (!horariosJsonRaw) return;
    try {
        const horarios = typeof horariosJsonRaw === "string" ? JSON.parse(horariosJsonRaw) : horariosJsonRaw;
        const objetosHorario = formatearHorariosAgrupados(horarios);

        const contenedorFooter = document.querySelector(".footer-hours");
        if (contenedorFooter) {
            contenedorFooter.innerHTML = objetosHorario.map(item => {
                return `<li><span class="day">${item.dias}</span><span>${item.horas}</span></li>`;
            }).join("");
        }

        const listaUbicacion = document.querySelector(".mapa-split__lista");
        if (listaUbicacion) {
            listaUbicacion.querySelectorAll(".item-horario-dinamico").forEach(el => el.remove());
            const itemReloj = listaUbicacion.querySelector(".bi-clock-fill")?.closest("li");
            
            objetosHorario.forEach(item => {
                const li = document.createElement("li");
                li.className = "item-horario-dinamico";
                li.innerHTML = `<i class="bi bi-clock-fill"></i><span>${item.dias}: ${item.horas}</span>`;
                if (itemReloj) {
                    listaUbicacion.insertBefore(li, itemReloj);
                } else {
                    listaUbicacion.appendChild(li);
                }
            });
            if (itemReloj) itemReloj.remove();
        }
    } catch (e) {
        console.warn("Error al procesar JSON de horarios:", e);
    }
}

function aplicarEnDOM(info) {
    if (!info || !info.nombre) return;

    document.querySelectorAll(".brand-subtitulo, .footer-subtitulo, #admin-negocio-subtitulo, #admin-saludo, .admin-user__chip, .admin-brand small, .mapa-split__titulo").forEach(el => {
        el.textContent = info.nombre;
    });

    document.querySelectorAll(".footer-correo, .contacto-correo").forEach(el => {
        el.textContent = info.correo;
        if (el.tagName === "A" || el.parentElement.tagName === "A") {
            const anchor = el.tagName === "A" ? el : el.parentElement;
            anchor.href = `mailto:${info.correo}`;
        }
    });

    document.querySelectorAll(".footer-telefono, .contacto-telefono").forEach(el => {
        el.textContent = info.telefono;
        if (el.tagName === "A" || el.parentElement.tagName === "A") {
            const anchor = el.tagName === "A" ? el : el.parentElement;
            anchor.href = `tel:${info.telefono.replace(/\s+/g, '')}`;
        }
    });

    document.querySelectorAll(".footer-direccion, .contacto-direccion").forEach(el => {
        el.textContent = info.direccion;
    });

    if (info.direccion) {
        const direccionCodificada = encodeURIComponent(info.direccion);
        const mapaIframe = document.getElementById("mapa-iframe");
        if (mapaIframe) {
            mapaIframe.src = `https://maps.google.com/maps?q=${direccionCodificada}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }
        const mapaBtnLlegar = document.querySelector(".mapa-split__btn");
        if (mapaBtnLlegar) {
            mapaBtnLlegar.href = `https://maps.google.com/?q=${direccionCodificada}`;
        }
    }

    if (info.horariosJson) {
        aplicarHorariosEnDOM(info.horariosJson);
    }
}

function actualizarEstadoFilaHorario(checkbox) {
    const fila = checkbox.closest(".horario-fila");
    if (!fila) return;

    const horasWrap = fila.querySelector(".horas-wrap");
    const badgeCerrado = fila.querySelector(".badge-cerrado");
    const label = fila.querySelector(".dia-label");

    if (checkbox.checked) {
        fila.classList.add("horario-item--activo", "shadow-sm");
        fila.classList.remove("opacity-75");

        if (horasWrap) horasWrap.classList.remove("d-none");
        if (badgeCerrado) badgeCerrado.classList.add("d-none");

        if (label) {
            label.classList.remove("text-muted");
            label.style.color = "var(--ink)";
        }
    } else {
        fila.classList.remove("horario-item--activo", "shadow-sm");
        fila.classList.add("opacity-75");

        if (horasWrap) horasWrap.classList.add("d-none");
        if (badgeCerrado) badgeCerrado.classList.remove("d-none");

        if (label) {
            label.classList.add("text-muted");
            label.style.color = "";
        }
    }
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

    const formHorarios = document.getElementById("form-horarios");
    if (formHorarios) {
        obtenerInfoNegocio().then(info => {
            if (info && info.horariosJson) {
                try {
                    const h = typeof info.horariosJson === "string" ? JSON.parse(info.horariosJson) : info.horariosJson;
                    Object.keys(h).forEach(dia => {
                        const fila = formHorarios.querySelector(`[data-dia="${dia}"]`);
                        if (fila) {
                            const check = fila.querySelector(".check-horario");
                            const inputs = fila.querySelectorAll('input[type="time"]');
                            if (check) check.checked = h[dia].activo;
                            if (inputs[0]) inputs[0].value = h[dia].inicio;
                            if (inputs[1]) inputs[1].value = h[dia].fin;
                            actualizarEstadoFilaHorario(check);
                        }
                    });
                } catch (e) {
                    console.warn("No se pudo cargar la configuración de horarios guardada:", e);
                }
            }
        });

        formHorarios.querySelectorAll(".check-horario").forEach(checkbox => {
            actualizarEstadoFilaHorario(checkbox);

            checkbox.addEventListener("change", (e) => {
                actualizarEstadoFilaHorario(e.target);
            });
        });

        formHorarios.addEventListener("submit", async (e) => {
            e.preventDefault();

            const objetoHorarios = {};
            const filas = formHorarios.querySelectorAll(".horario-fila");

            filas.forEach(fila => {
                const dia = fila.dataset.dia;
                const activo = fila.querySelector(".check-horario").checked;
                const inputs = fila.querySelectorAll('input[type="time"]');
                objetoHorarios[dia] = {
                    activo: activo,
                    inicio: inputs[0] ? inputs[0].value : "08:00",
                    fin: inputs[1] ? inputs[1].value : "17:00"
                };
            });

            try {
                const infoActual = await obtenerInfoNegocio();
                const dtoActualizar = {
                    nombre: infoActual.nombre,
                    correo: infoActual.correo,
                    direccion: infoActual.direccion,
                    telefono: infoActual.telefono,
                    horariosJson: JSON.stringify(objetoHorarios)
                };

                let guardado = dtoActualizar;
                if (window.AgendaApi && typeof window.AgendaApi.actualizarNegocio === "function") {
                    guardado = await window.AgendaApi.actualizarNegocio(dtoActualizar);
                }

                localStorage.setItem(KEY_INFO, JSON.stringify(guardado));
                aplicarEnDOM(guardado);

                if (window.Swal) {
                    Swal.fire({
                        title: "¡Horarios actualizados!",
                        text: "La configuración de horarios ha sido guardada en la base de datos.",
                        icon: "success",
                        confirmButtonColor: "#7C9A4A"
                    });
                }
            } catch (err) {
                console.error("Error al guardar horarios:", err);
                if (window.Swal) {
                    Swal.fire({
                        title: "Error al guardar",
                        text: err.message || "No se pudieron actualizar los horarios.",
                        icon: "error"
                    });
                }
            }
        });
    }
});