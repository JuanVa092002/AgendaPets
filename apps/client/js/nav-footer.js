//INSERTAR FOOTER Y NAVBAR, pendiente refactorizar
async function cargarComponente(id, archivo) {
    try {
        const respuesta = await fetch(archivo);
        if (!respuesta.ok) throw new Error(`No se pudo cargar ${archivo}`);
        const contenido = await respuesta.text();
        document.getElementById(id).innerHTML = contenido;

        // 🌟 SOLUCIÓN: Si acabamos de cargar el navbar, activamos su lógica interna
        if (id === "navbar-container") {
            inicializarNavbar();
        }
    } catch (error) {
        console.log(error);
    }
}


// Arranca la carga de componentes al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarComponente("navbar-container", "./components/navbar.html");
    cargarComponente("footer-container", "./components/footer.html");
});