document.addEventListener("DOMContentLoaded", () => {
  // Logica de cambio de rol
  const enlaceAdmin = document.querySelector('a[href="#admin"]');
  const enlaceCliente = document.querySelector('a[href="#cliente"]');
  const seccionAdmin = document.getElementById("admin");
  const seccionCliente = document.getElementById("cliente");

  // Función para cambiar de vista entre Cliente y Admin
  const cambiarRol = (rolAMostrar) => {
    if (rolAMostrar === "admin") {
      seccionAdmin.style.display = "block";
      seccionCliente.style.display = "none";
      enlaceAdmin.classList.add("active");
      enlaceCliente.classList.remove("active");
    } else {
      seccionCliente.style.display = "block";
      seccionAdmin.style.display = "none";
      enlaceCliente.classList.add("active");
      enlaceAdmin.classList.remove("active");
    }
  };

  // Por defecto iniciamos mostrando la vista Cliente y ocultando Admin
  cambiarRol("cliente");

  // Escuchar clics en los enlaces de la barra superior de roles
  if (enlaceAdmin) {
    enlaceAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      cambiarRol("admin");
    });
  }

  if (enlaceCliente) {
    enlaceCliente.addEventListener("click", (e) => {
      e.preventDefault();
      cambiarRol("cliente");
    });
  }
  
  // Validacion y localStorage
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validarYGuardar = (idCorreo, idPassword, tipoRol) => {
    const inputCorreo = document.getElementById(idCorreo);
    const inputPassword = document.getElementById(idPassword);

    const correo = inputCorreo ? inputCorreo.value.trim() : "";
    const password = inputPassword ? inputPassword.value.trim() : "";

    // Validación de campos vacíos
    if (!correo || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, ingresa tu correo y contraseña.",
        confirmButtonColor: "#0d6efd"
      });
      return;
    }

    // Validación de formato de correo
    if (!emailRegex.test(correo)) {
      Swal.fire({
        icon: "error",
        title: "Correo inválido",
        text: "Ingresa un correo con formato correcto (ej: usuario@dominio.com).",
        confirmButtonColor: "#0d6efd"
      });
      return;
    }

    // Guardar en LocalStorage
    const sesion = {
      correo: correo,
      rol: tipoRol,
      activo: true,
      fechaLogin: new Date().toLocaleString()
    };

    localStorage.setItem("usuarioSesion", JSON.stringify(sesion));
    console.log("Sesión guardada:", JSON.parse(localStorage.getItem("usuarioSesion")));

    // Alerta de éxito
    Swal.fire({
      icon: "success",
      title: `¡Bienvenido ${tipoRol}!`,
      text: "Inicio de sesión exitoso.",
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Botón enviar de Cliente
  const btnCliente = document.getElementById("botonIniciar");
  if (btnCliente) {
    btnCliente.addEventListener("click", (e) => {
      e.preventDefault();
      validarYGuardar("clienteCorreo", "clientePassword", "Cliente");
    });
  }

  // Botón enviar de Admin
  const btnAdmin = document.getElementById("botonIniciarAdmin");
  if (btnAdmin) {
    btnAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      validarYGuardar("adminCorreo", "adminPassword", "Administrador");
    });
  }
});