(function (global) {
  function baseUrl() {
    var config = global.AGENDA_PETS_CONFIG || {};
    return String(config.apiUrl || "https://agendapets-api.onrender.com").replace(/\/$/, "");
  }

  function mensajeError(data, fallback) {
    if (!data) return fallback;
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
    var primero = Object.values(data).find(function (valor) {
      return typeof valor === "string";
    });
    return primero || fallback;
  }

  function token() {
    try {
      var sesion = JSON.parse(global.localStorage.getItem("sesion") || "null");
      return sesion && sesion.token ? sesion.token : "";
    } catch (e) {
      return "";
    }
  }

  async function request(path, options) {
    options = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    var t = token();
    if (t) headers.Authorization = "Bearer " + t;
    var respuesta;
    try {
      respuesta = await fetch(baseUrl() + path, Object.assign({}, options, { headers: headers }));
    } catch (e) {
      var red = new Error("No se pudo conectar con el servidor. Inténtalo de nuevo.");
      red.status = 0;
      throw red;
    }
    var data = {};
    try {
      data = await respuesta.json();
    } catch (e) {
      data = {};
    }
    if (!respuesta.ok) {
      var error = new Error(mensajeError(data, "No se pudo completar la petición."));
      error.status = respuesta.status;
      error.body = data;
      throw error;
    }
    return data;
  }

  function mapServicio(s) {
    var minutos = Number(s.duracionServicio || 0);
    var duracion = s.duracion;
    if (!duracion && minutos) duracion = minutos + " min";
    return {
      id: Number(s.servicioId || s.id),
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      precio: Number(s.precio || 0),
      duracion: duracion || "",
      duracionServicio: minutos,
      visible: s.visible !== false
    };
  }

  function mapReserva(r) {
    var hora = r.horaFormato || r.hora || "";
    if (hora && hora.length > 5) hora = String(hora).slice(0, 5);
    var servicios = (r.servicios || []).map(mapServicio);
    return {
      id: Number(r.reservaId || r.id),
      fecha: r.fecha,
      hora: hora,
      estado: r.estado,
      mascota: r.mascotaNombre || (r.mascota && r.mascota.nombre) || "",
      nombre: r.mascotaNombre || (r.mascota && r.mascota.nombre) || "",
      tipo: r.mascota && r.mascota.tipo,
      raza: r.mascota && r.mascota.raza,
      tamano: r.mascota && r.mascota.tamano,
      notas: r.mascota && r.mascota.notas,
      dueno: r.duenoNombre,
      correo: r.correoDueno,
      duenoId: r.correoDueno,
      servicios: servicios,
      servicio: r.servicio,
      precio: Number(r.precioTotal || 0)
    };
  }

  global.AgendaApi = {
    url: baseUrl,
    request: request,
    login: function (datos) {
      return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          correo: datos.correo || datos.email,
          contrasena: datos.contrasena || datos.password
        })
      });
    },
    registro: function (datos) {
      return request("/registro", {
        method: "POST",
        body: JSON.stringify({
          nombre: datos.nombre,
          correo: datos.correo || datos.email,
          contrasena: datos.contrasena || datos.password
        })
      });
    },
    servicios: async function () {
      var lista = await request("/api/servicios");
      return (lista || []).map(mapServicio);
    },
    crearServicio: function (datos) {
      return request("/api/servicios", { method: "POST", body: JSON.stringify(datos) }).then(mapServicio);
    },
    actualizarServicio: function (id, datos) {
      return request("/api/servicios/" + id, { method: "PUT", body: JSON.stringify(datos) }).then(mapServicio);
    },
    eliminarServicio: function (id) {
      return request("/api/servicios/" + id, { method: "DELETE" });
    },
    reservas: async function () {
      var lista = await request("/api/reservas");
      return (lista || []).map(mapReserva);
    },
    ocupadas: function () {
      return request("/api/reservas/ocupadas");
    },
    crearReserva: function (datos) {
      return request("/api/reservas", { method: "POST", body: JSON.stringify(datos) }).then(mapReserva);
    },
    actualizarReserva: function (id, datos) {
      return request("/api/reservas/" + id, { method: "PUT", body: JSON.stringify(datos) }).then(mapReserva);
    },
    cambiarEstadoReserva: function (id, estado) {
      return request("/api/reservas/" + id + "/estado", {
        method: "PATCH",
        body: JSON.stringify({ estado: estado })
      }).then(mapReserva);
    },
    obtenerNegocio: function () {
      return request("/api/negocio");
    },
    actualizarNegocio: function (datos) {
      return request("/api/negocio", {
        method: "PUT",
        body: JSON.stringify(datos)
      });
    },
    mapServicio: mapServicio,
    mapReserva: mapReserva
  };
})(window);
