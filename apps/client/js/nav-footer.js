//INSERTAR FOOTER Y NAVBAR, pendiente refactorizar
async function cargarComponente(id, archivo) {
    try {
        const respuesta = await fetch(archivo);
        if (!respuesta.ok) throw new Error(`No se pudo cargar ${archivo}`);
        const contenido = await respuesta.text();
        document.getElementById(id).innerHTML = contenido;

   
    } catch (error) {
        console.log(error);
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const tareas = [];

    if (document.getElementById("navbar-container")) {
        tareas.push(cargarComponente("navbar-container", "./components/navbar.html"));
    }

    if (document.getElementById("footer-container")) {
        tareas.push(cargarComponente("footer-container", "./components/footer.html"));
    }

    await Promise.all(tareas);
    marcarPaginaActual();
});




function marcarPaginaActual() {

    let paginaActual = window.location.pathname.split("/").pop();

    if (paginaActual === "") {
        paginaActual = "index.html";
    }

    const enlaces = document.querySelectorAll(".navbar-nav .nav-link");

    enlaces.forEach(enlace => {

        const href = enlace.getAttribute("href");

        if (!href || href === "#") {
            return;
        }

        const paginaEnlace = href.split("/").pop();

        if (paginaActual === paginaEnlace) {

            enlace.classList.add("active");

            enlace.setAttribute("aria-current", "page");
        }
    });
}