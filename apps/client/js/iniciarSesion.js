document.addEventListener("DOMContentLoaded", () => {
  const enlaceAdmin = document.querySelector('a[href="#admin"]');
  const enlaceCliente = document.querySelector('a[href="#cliente"]');
  const seccionAdmin = document.getElementById("admin");
  const seccionCliente = document.getElementById("cliente");
  const colorOk = "#7C9A4A";

  const cambiarRol = (rolAMostrar) => {
    const esAdmin = rolAMostrar === "admin";
    seccionAdmin.style.display = esAdmin ? "block" : "none";
    seccionCliente.style.display = esAdmin ? "none" : "block";
    enlaceAdmin?.classList.toggle("active", esAdmin);
    enlaceCliente?.classList.toggle("active", !esAdmin);
  };

  cambiarRol("cliente");

  enlaceAdmin?.addEventListener("click", (e) => {
    e.preventDefault();
    cambiarRol("admin");
  });

  enlaceCliente?.addEventListener("click", (e) => {
    e.preventDefault();
    cambiarRol("cliente");
  });

  if (window.AgendaAuth) {
    AgendaAuth.mount();
    const s = AgendaAuth.sesion();
    if (s && AgendaAuth.esAdmin(s)) {
      window.location.replace(AgendaAuth.rutaPanelAdmin());
      return;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const avisar = (icon, title, text) =>
    Swal.fire({ icon, title, text, confirmButtonColor: colorOk });

  const entrar = (idCorreo, idPassword, rolPedido) => {
    const correo = (document.getElementById(idCorreo)?.value || "").trim().toLowerCase();
    const password = document.getElementById(idPassword)?.value || "";

    if (!correo || !password) {
      return avisar("warning", "Campos incompletos", "Ingresa tu correo y contraseña.");
    }
    if (!emailRegex.test(correo)) {
      return avisar("error", "Correo inválido", "Usa un correo con formato correcto.");
    }
    if (!window.AgendaAuth) {
      return avisar("error", "No se pudo entrar", "Recarga la página e inténtalo de nuevo.");
    }

    const resultado = AgendaAuth.autenticar(correo, password);
    if (resultado.error === "not_found") {
      return avisar("info", "Cuenta no encontrada", "No hay una cuenta con ese correo. Crea una desde Iniciar sesión.");
    }
    if (resultado.error === "bad_pass") {
      return avisar("error", "Contraseña incorrecta", "Revísalas e inténtalo de nuevo.");
    }

    const usuario = resultado.usuario;
    const esAdmin = AgendaAuth.esAdmin(usuario);

    if (rolPedido === "admin" && !esAdmin) {
      return avisar("warning", "No es administrador", "Esa cuenta es de usuario. Entra en la pestaña Cliente.");
    }

    AgendaAuth.completarLogin(usuario);

    if (esAdmin) {
      Swal.fire({
        icon: "success",
        title: "Bienvenido, admin",
        text: "Te llevamos al panel.",
        showConfirmButton: false,
        timer: 1200,
      }).then(() => {
        window.location.href = AgendaAuth.rutaPanelAdmin();
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: `Hola, ${usuario.nombre || "de nuevo"}`,
      text: "Inicio de sesión exitoso.",
      showConfirmButton: false,
      timer: 1200,
    }).then(() => {
      window.location.href = "index.html";
    });
  };

  document.getElementById("botonIniciar")?.addEventListener("click", (e) => {
    e.preventDefault();
    entrar("clienteCorreo", "clientePassword", "cliente");
  });

  document.getElementById("botonIniciarAdmin")?.addEventListener("click", (e) => {
    e.preventDefault();
    entrar("adminCorreo", "adminPassword", "admin");
  });
});
