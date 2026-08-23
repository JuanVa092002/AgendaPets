const numeroCelular = document.getElementById("numeroCelular");

const btnBuscarCitas = document.getElementById("btnBuscarCitas");

const citasContainer = document.getElementById("citas-container");

const mensajeCitas = document.getElementById("mensaje-citas");


btnBuscarCitas.addEventListener("click", buscarCitas);


async function buscarCitas() {

    const telefono = numeroCelular.value.trim();


    if (!telefono) {

        mensajeCitas.innerHTML = `
            <p class="mensaje-error">
                Por favor ingresa tu número de celular.
            </p>
        `;

        citasContainer.innerHTML = "";

        return;
    }


    try {

        mensajeCitas.innerHTML = `
            <p class="mensaje-cargando">
                Buscando tus citas...
            </p>
        `;


        const respuesta = await fetch(
            `/api/citas?telefono=${encodeURIComponent(telefono)}`
        );


        if (!respuesta.ok) {
            throw new Error("Error consultando citas");
        }


        const citas = await respuesta.json();


        citasContainer.innerHTML = "";

        mensajeCitas.innerHTML = "";


        if (!citas || citas.length === 0) {

            mensajeCitas.innerHTML = `

                <div class="sin-citas">

                    <i class="bi bi-calendar-x"></i>

                    <h2>No encontramos citas</h2>

                    <p>
                        No existen reservas asociadas a este número.
                    </p>

                </div>

            `;

            return;
        }


        citas.forEach(cita => {

            pintarCita(cita);

        });


    } catch (error) {

        console.error(error);


        mensajeCitas.innerHTML = `

            <p class="mensaje-error">

                Ocurrió un error al consultar tus citas.
                Intenta nuevamente.

            </p>

        `;

    }

}


function pintarCita(cita) {

    citasContainer.innerHTML += `

        <article class="cita-card">

            <div class="cita-info">

                <h2 class="cita-titulo">

                    CITA DE

                    <span>
                        ${cita.mascota.nombre}
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
                        ${ampm(cita.hora)}
                    </span>

                </p>


                <p>
                    <strong>Servicios:</strong>
                </p>


                <ul class="cita-servicios">

                    ${cita.servicios.map(s => `

                        <li>

                            <span>

                                ${s.nombre}

                                <br>

                                <small>
                                    ${s.duracion}
                                </small>

                            </span>


                            <strong>
                                ${money(s.precio)}
                            </strong>

                        </li>

                    `).join("")}

                </ul>

            </div>


            <div class="cita-acciones">

                <button
                    class="btn-cita btn-reprogramar"
                    data-id="${cita.id}"
                >

                    <i class="bi bi-pencil-square"></i>

                    Reprogramar

                </button>


                <button
                    class="btn-cita btn-cancelar"
                    data-id="${cita.id}"
                >

                    <i class="bi bi-trash"></i>

                    Cancelar cita

                </button>

            </div>


            <div class="cita-resumen">

                <span class="badge-cita">

                    Total:
                    ${money(cita.total)}

                </span>


                <span class="badge-cita">

                    Duración:
                    ${cita.duracion}

                </span>

            </div>

        </article>

    `;

}


function money(valor) {

    return new Intl.NumberFormat(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }
    ).format(valor);

}


function formatearFecha(fecha) {

    const [year, month, day] = fecha.split("-");

    return `${day}/${month}/${year}`;

}


function ampm(hora) {

    const [h, m] = hora.split(":");

    let horaNumero = Number(h);

    const periodo = horaNumero >= 12
        ? "PM"
        : "AM";

    horaNumero = horaNumero % 12 || 12;

    return `${horaNumero}:${m} ${periodo}`;

}