const serviciosIniciales = [
    {
        id: 1,
        nombre: "Baño básico",
        duracion: "1 hora",
        precio: 15000,
        descripcion: "Baño completo para mascotas utilizando shampoo especializado, limpieza profunda del pelaje, secado y cepillado para dejar a tu mascota limpia, fresca y con un aspecto saludable."
    },
    {
        id: 2,
        nombre: "Corte de pelo",
        duracion: "1 hora y 30 minutos",
        precio: 25000,
        descripcion: "Corte de pelo personalizado según la raza y las características de cada mascota, acompañado de cepillado, limpieza del pelaje y cuidados especiales para mantenerla cómoda."
    },
    {
        id: 3,
        nombre: "Corte de uñas",
        duracion: "30 minutos",
        precio: 10000,
        descripcion: "Corte y cuidado de las uñas de tu mascota realizado de manera segura y cuidadosa, evitando molestias y ayudando a mantener una buena higiene y comodidad durante sus actividades."
    },
    {
        id: 4,
        nombre: "Limpieza dental",
        duracion: "45 minutos",
        precio: 20000,
        descripcion: "Limpieza dental especializada para ayudar a mantener una buena higiene bucal, reducir la acumulación de placa y cuidar la salud de los dientes y encías de tu mascota."
    },
    {
        id: 5,
        nombre: "Baño premium",
        duracion: "2 horas",
        precio: 35000,
        descripcion: "Servicio completo que incluye baño con productos premium, tratamiento del pelaje, secado, cepillado y cuidados adicionales para brindar una experiencia cómoda y mantener a tu mascota limpia."
    }
];

const STORAGE_KEY = "servicios";


// Solo la primera vez se cargan los datos iniciales
if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serviciosIniciales));
}

// A partir de aquí SIEMPRE trabajamos con localStorage
const servicios = JSON.parse(localStorage.getItem(STORAGE_KEY));


const formulario = document.getElementById("form-servicio");
const contenedorServicios = document.getElementById("contenedorServicios");


formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    agregarServicio();
    formulario.reset();
});

// Calcula el último id existente
let contador = Math.max(...servicios.map(servicio => servicio.id));

//let contador = 5;

function guardarServicios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servicios));
}

function agregarServicio() {

    contador++;

    const nombre = document.getElementById("nombre").value;
    const duracion = document.getElementById("duracion").value;
    const precio = document.getElementById("precio").value;
    const descripcion = document.getElementById("descripcion").value;

    const servicio = {
        id: contador,
        nombre: nombre,
        duracion: duracion,
        precio: precio,
        descripcion: descripcion
    };

    servicios.push(servicio);
    guardarServicios();
    mostrarServicios();

//    console.log(JSON.stringify(servicios, null, 2));
}

function mostrarServicios() {
    contenedorServicios.innerHTML = "";
    servicios.forEach(servicio => {
        contenedorServicios.innerHTML += `
            <article class="servicio">

                                <div class="icono-servicio">
                                    <i class="bi bi-paw-fill"></i>
                                </div>

                                <div class="info-servicio">

                                    <h5>${servicio.nombre}</h5>

                                    <p>
                                        ${servicio.descripcion}
                                    </p>

                                    <div class="datos-servicio">
                                        <span>$ ${servicio.precio}</span>
                                        <span>
                                            <i class="bi bi-clock"></i>
                                            ${servicio.duracion}
                                        </span>
                                    </div>

                                </div>

                                <div class="acciones-servicio">

                                    <button class="btn btn-sm btn-editar">
                                        <i class="bi bi-pencil-square"></i>
                                        Editar
                                    </button>

                                    <button class="btn btn-sm btn-ocultar">
                                        <i class="bi bi-eye-slash"></i>
                                        Ocultar
                                    </button>

                                    <button class="btn btn-sm btn-eliminar">
                                        <i class="bi bi-trash3"></i>
                                        Eliminar
                                    </button>

                                </div>

                            </article>`;
    })
}

mostrarServicios();