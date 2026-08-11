const servicios = [];

const formulario = document.getElementById("form-servicio");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    agregarServicio();
});

function agregarServicio() {

    const nombre = document.getElementById("nombre").value;
    const duracion = document.getElementById("duracion").value;
    const precio = document.getElementById("precio").value;
    const descripcion = document.getElementById("descripcion").value;

    const servicio = {
        nombre: nombre,
        duracion: duracion,
        precio: precio,
        descripcion: descripcion
    };

    servicios.push(servicio);

    console.log(JSON.stringify(servicios, null, 2));
}