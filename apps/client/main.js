// INICIO FORMULARIO CONTACTENOS
const form = document.getElementById("formulario");


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  // Validaciones
  if (nombre.length < 3) {
    return Swal.fire("Error", "Nombre inválido", "error");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return Swal.fire("Error", "Correo inválido", "error");
  }

  if (!/^\d{10}$/.test(telefono)) {
    return Swal.fire("Error", "Teléfono debe tener 10 números", "error");
  }

  // Envío a Formspree
  try {
    const response = await fetch("https://formspree.io/f/mgoggjbr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        correo,
        telefono: telefono
      })
    });

    if (response.ok) {
      Swal.fire("Éxito", "Formulario enviado", "success");
      form.reset();
    } else {
      throw new Error();
    }

  } catch {
    Swal.fire("Error", "No se pudo enviar", "error");
  }
});
// FIN FORMULARIO CONTACTENOS///////////////////////////



