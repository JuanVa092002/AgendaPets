const KEY_CITAS = "citas";


export function obtenerTodasLasCitas() {
    return JSON.parse(localStorage.getItem(KEY_CITAS) || "[]"
    );
}

export function guardarCitas(citas) {
    localStorage.setItem(
        KEY_CITAS,
        JSON.stringify(citas)
    );
}


export function buscarCitasPorTelefono(telefono) {
    const telefonoNormalizado =
        normalizarTelefono(telefono);

    return obtenerTodasLasCitas().filter((cita) => {
        return (
            normalizarTelefono(cita.telefono) ===
            telefonoNormalizado
        );
    });
}


export function obtenerCitaPorId(citaId) {
    return obtenerTodasLasCitas().find(
        (cita) => Number(cita.id) === Number(citaId)
    );
}


export function cancelarCitaPorId(citaId) {
    const citasActualizadas =
        obtenerTodasLasCitas().filter(
            (cita) => Number(cita.id) !== Number(citaId)
        );

    guardarCitas(citasActualizadas);
}


export function actualizarCita(citaActualizada) {
    const citas = obtenerTodasLasCitas();

    const indice = citas.findIndex(
        (cita) =>
            Number(cita.id) ===
            Number(citaActualizada.id)
    );


    if (indice === -1) {
        throw new Error("La cita no existe.");
    }


    citas[indice] = citaActualizada;

    guardarCitas(citas);
}


export function normalizarTelefono(telefono) {
    return String(telefono || "")
        .replace(/\D/g, "")
        .slice(-10);
}


export function formatearDinero(valor) {
    return "$ " +
        Number(valor || 0).toLocaleString("es-CO");
}


export function formatearFecha(fecha) {
    if (!fecha) return "";

    const [year, month, day] =
        fecha.split("-");

    return `${day}/${month}/${year}`;
}


export function formatearHora(hora) {
    if (!hora) return "";

    const [horas, minutos] =
        hora.split(":");

    const numeroHora = Number(horas);

    return `${numeroHora % 12 || 12}:${minutos} ${
        numeroHora < 12 ? "AM" : "PM"
    }`;
}