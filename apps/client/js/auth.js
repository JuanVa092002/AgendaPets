(function () {
  const KEY_U = "usuarios";
  const KEY_SES = "sesion";
  const ADMIN_EMAIL = "admin@agendapets.com";
  const ADMIN_PASS = "Admin123";
  let modo = "register";
  let intent = "session";
  let rolLogin = "cliente";
  let onSuccess = null;
  let nombreReserva = "";

  function $(id) {
    return document.getElementById(id);
  }

  function usuarios() {
    return JSON.parse(localStorage.getItem(KEY_U) || "[]");
  }

  function sesion() {
    return JSON.parse(localStorage.getItem(KEY_SES) || "null");
  }

  function guardarUsuarios(lista) {
    localStorage.setItem(KEY_U, JSON.stringify(lista));
  }

  function guardarSesion(u) {
    localStorage.setItem(KEY_SES, JSON.stringify({
      email: u.email,
      nombre: u.nombre,
      rol: esAdmin(u) ? "admin" : "cliente",
    }));
    localStorage.removeItem("usuarioSesion");
    avisarSesion();
  }

  function avisarSesion() {
    document.dispatchEvent(new CustomEvent("agenda:sesion", { detail: sesion() }));
  }

  function esAdmin(u) {
    return (u?.rol || "") === "admin";
  }

  function rutaPanelAdmin() {
    return /\/VAdmin\//i.test(location.pathname) ? "mis-servicios.html" : "VAdmin/mis-servicios.html";
  }

  function asegurarAdmin() {
    const lista = usuarios();
    const i = lista.findIndex((u) => (u.email || "").toLowerCase() === ADMIN_EMAIL);
    if (i >= 0) {
      if (lista[i].rol !== "admin") {
        lista[i] = { ...lista[i], rol: "admin" };
        guardarUsuarios(lista);
      }
      return;
    }
    guardarUsuarios(lista.concat({
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
      nombre: "Administrador",
      rol: "admin",
      creado: Date.now(),
    }));
  }

  function cerrarSesion() {
    localStorage.removeItem(KEY_SES);
    pintar();
    avisarSesion();
  }

  function primerNombre(nombre) {
    return (nombre || "tú").trim().split(" ")[0];
  }

  function chipHTML() {
    const s = sesion();
    if (!s) {
      return `<button type="button" class="sesion-chip sesion-chip--out" data-auth-open>
        <i class="bi bi-person-circle" aria-hidden="true"></i>
        <span>Iniciar sesión</span>
      </button>`;
    }
    const inicial = primerNombre(s.nombre).charAt(0).toUpperCase();
    const admin = esAdmin(s);
    return `<div class="sesion-chip sesion-chip--in" title="${admin ? "Administrador" : "Sesión activa"}">
      <span class="sesion-chip__avatar">${inicial}</span>
      <span class="sesion-chip__copy">
        <strong>Hola, ${primerNombre(s.nombre)}</strong>
        <small>${admin ? "Administrador" : "Sesión activa"}</small>
      </span>
      <span class="sesion-chip__dot" aria-hidden="true"></span>
      ${admin ? `<a class="sesion-chip__panel" href="${rutaPanelAdmin()}">Panel</a>` : ""}
      <button type="button" class="sesion-chip__salir" data-auth-out>Salir</button>
    </div>`;
  }

  function pintar() {
    document.querySelectorAll("[data-sesion-slot]").forEach((el) => {
      el.innerHTML = chipHTML();
    });
  }

  function mostrarAlerta(titulo, texto, tipo) {
    const el = $("auth-alerta");
    if (!el) return;
    const iconos = {
      error: "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
      success: "bi-check-circle-fill",
      info: "bi-info-circle-fill",
    };
    el.hidden = false;
    el.className = `auth-alerta auth-alerta--${tipo || "info"}`;
    el.querySelector("i").className = `bi ${iconos[tipo] || iconos.info}`;
    $("auth-alerta-titulo").textContent = titulo || "";
    $("auth-alerta-texto").textContent = texto || "";
  }

  function limpiarAlerta() {
    const el = $("auth-alerta");
    if (!el) return;
    el.hidden = true;
    $("auth-alerta-titulo").textContent = "";
    $("auth-alerta-texto").textContent = "";
  }

  function pintarModal() {
    const esRegistro = modo === "register";
    const confirmar = intent === "confirm";
    document.querySelectorAll(".auth-switch__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.auth === modo));
    $("auth-confirm-wrap").hidden = !esRegistro;
    $("auth-nombre-wrap").hidden = !esRegistro;
    $("auth-rol-wrap").hidden = esRegistro;
    $("auth-password").autocomplete = esRegistro ? "new-password" : "current-password";
    document.querySelectorAll(".auth-rol__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.rol === rolLogin));
    $("auth-title").textContent = esRegistro ? (confirmar ? "Guarda tu cita" : "Crea tu cuenta") : "Bienvenido de nuevo";
    $("auth-lead").textContent = esRegistro
      ? confirmar
        ? "Crea tu cuenta con tu correo. Solo te toma un momento."
        : "Regístrate con tu correo y una contraseña."
      : confirmar
        ? "Entra con tu correo y confirma la cita."
        : rolLogin === "admin"
          ? "Entra con la cuenta del administrador para abrir el panel."
          : "Entra con tu correo para seguir tu reserva.";
    $("auth-submit").textContent = esRegistro
      ? confirmar
        ? "Crear cuenta y confirmar"
        : "Crear cuenta"
      : confirmar
        ? "Entrar y confirmar"
        : "Entrar";
    limpiarAlerta();
  }

  function asegurarModal() {
    if ($("auth-modal")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div class="auth-overlay" id="auth-modal" hidden>
      <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" class="auth-modal__close" id="auth-cerrar" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        <div class="auth-alerta" id="auth-alerta" hidden>
          <i class="bi" aria-hidden="true"></i>
          <div>
            <strong id="auth-alerta-titulo"></strong>
            <span id="auth-alerta-texto"></span>
          </div>
        </div>
        <img src="assets/logo.png" alt="" class="auth-modal__logo" width="48" height="48">
        <h2 id="auth-title">Guarda tu cita</h2>
        <p class="auth-modal__lead" id="auth-lead">Usa tu correo y una contraseña.</p>
        <div class="auth-switch" role="tablist" aria-label="Tipo de acceso">
          <button type="button" class="auth-switch__btn" data-auth="login" role="tab">Iniciar sesión</button>
          <button type="button" class="auth-switch__btn is-on" data-auth="register" role="tab">Crear cuenta</button>
        </div>
        <div class="auth-rol" id="auth-rol-wrap" hidden>
          <button type="button" class="auth-rol__btn is-on" data-rol="cliente">Usuario</button>
          <button type="button" class="auth-rol__btn" data-rol="admin">Admin</button>
        </div>
        <form class="auth-form" id="auth-form" novalidate>
          <div id="auth-nombre-wrap">
            <label for="auth-nombre">Tu nombre</label>
            <input id="auth-nombre" placeholder="María Camila" autocomplete="name">
          </div>
          <label for="auth-email">Correo</label>
          <div class="auth-email">
            <span><i class="bi bi-envelope"></i></span>
            <input id="auth-email" type="email" inputmode="email" placeholder="tucorreo@email.com" autocomplete="email">
          </div>
          <label for="auth-password">Contraseña</label>
          <div class="auth-pass">
            <input id="auth-password" type="password" placeholder="Mínimo 6 caracteres" autocomplete="current-password">
            <button type="button" class="auth-pass__toggle" data-toggle-pass="auth-password" aria-label="Mostrar contraseña"><i class="bi bi-eye"></i></button>
          </div>
          <div id="auth-confirm-wrap">
            <label for="auth-confirm">Confirmar contraseña</label>
            <div class="auth-pass">
              <input id="auth-confirm" type="password" placeholder="Repite la contraseña" autocomplete="new-password">
              <button type="button" class="auth-pass__toggle" data-toggle-pass="auth-confirm" aria-label="Mostrar contraseña"><i class="bi bi-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="auth-form__submit" id="auth-submit">Crear cuenta</button>
        </form>
      </div>
    </div>`;
    document.body.appendChild(wrap.firstElementChild);
    enlazarModal();
  }

  function abrir(opts = {}) {
    asegurarModal();
    intent = opts.intent || "session";
    onSuccess = opts.onSuccess || null;
    nombreReserva = opts.nombre || "";
    rolLogin = opts.rol === "admin" ? "admin" : "cliente";
    const correo = (opts.email || "").trim().toLowerCase();
    const existe = correo && usuarios().some((u) => (u.email || "").toLowerCase() === correo);
    modo = existe ? "login" : "register";
    $("auth-email").value = correo;
    $("auth-password").value = "";
    $("auth-confirm").value = "";
    $("auth-nombre").value = nombreReserva;
    document.querySelectorAll("[data-toggle-pass]").forEach((btn) => {
      const campo = $(btn.dataset.togglePass);
      if (campo) campo.type = "password";
      btn.innerHTML = '<i class="bi bi-eye"></i>';
    });
    pintarModal();
    $("auth-modal").hidden = false;
    document.body.style.overflow = "hidden";
    ($("auth-email").value ? $("auth-password") : $("auth-email")).focus();
  }

  function cerrar() {
    const modal = $("auth-modal");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
    onSuccess = null;
  }

  function aplicarSesionEnFormulario(usuario) {
    const mailInput = document.getElementById("dueno-correo");
    const nomInput = document.getElementById("dueno-nombre");
    if (mailInput) mailInput.value = usuario.email || "";
    if (nomInput && usuario.nombre) nomInput.value = usuario.nombre;
  }

  function esCorreo(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  function enviar(e) {
    e.preventDefault();
    const email = $("auth-email").value.trim().toLowerCase();
    const pass = $("auth-password").value;
    const confirm = $("auth-confirm").value;
    const nombre = ($("auth-nombre")?.value || "").trim();
    if (modo === "register" && nombre.length < 3) {
      return mostrarAlerta("Falta tu nombre", "Escribe al menos 3 caracteres.", "warning");
    }
    if (!esCorreo(email)) {
      return mostrarAlerta("Correo inválido", "Escribe un correo válido, por ejemplo tucorreo@email.com.", "warning");
    }
    if (pass.length < 6) {
      return mostrarAlerta("Contraseña corta", "Usa mínimo 6 caracteres.", "warning");
    }
    const lista = usuarios();
    const hallado = lista.find((u) => (u.email || "").toLowerCase() === email);

    let usuario = hallado;
    if (modo === "register") {
      if (pass !== confirm) {
        return mostrarAlerta("No coinciden", "La confirmación debe ser igual a la contraseña.", "error");
      }
      if (hallado) {
        modo = "login";
        pintarModal();
        return mostrarAlerta("Ya tienes cuenta", "Ese correo ya está registrado. Entra con tu contraseña.", "info");
      }
      usuario = { email, password: pass, nombre: nombre || nombreReserva || "Cliente", rol: "cliente", creado: Date.now() };
      guardarUsuarios(lista.concat(usuario));
    } else {
      if (!hallado) {
        modo = "register";
        pintarModal();
        return mostrarAlerta("Cuenta no encontrada", "No hay una cuenta con ese correo. Crea una para continuar.", "info");
      }
      if (hallado.password !== pass) {
        return mostrarAlerta("Contraseña incorrecta", "Revísalas e inténtalo de nuevo.", "error");
      }
      if (rolLogin === "admin" && !esAdmin(hallado)) {
        return mostrarAlerta("No es administrador", "Esa cuenta es de usuario. Entra como Usuario o usa la cuenta del local.", "warning");
      }
      usuario = { ...hallado, rol: esAdmin(hallado) ? "admin" : "cliente" };
    }

    guardarSesion(usuario);
    aplicarSesionEnFormulario(usuario);
    pintar();
    const ok = onSuccess;
    const esRegistro = modo === "register";
    const confirmarCita = intent === "confirm";
    const listo = () => { if (ok) ok(usuario); };
    const titulo = esRegistro ? "Cuenta creada" : "Sesión iniciada";
    const vaAlPanel = esAdmin(usuario) && intent !== "confirm";
    const texto = esRegistro
      ? "Tu cuenta quedó lista. Ya puedes reservar."
      : vaAlPanel
        ? "Entrando al panel de administrador."
        : `Hola, ${primerNombre(usuario.nombre)}.`;
    mostrarAlerta(titulo, texto, "success");
    setTimeout(() => {
      cerrar();
      if (vaAlPanel) {
        window.location.href = rutaPanelAdmin();
        return;
      }
      listo();
    }, confirmarCita ? 700 : 1400);
  }

  function enlazarModal() {
    $("auth-form").onsubmit = enviar;
    $("auth-cerrar").onclick = cerrar;
    $("auth-modal").onclick = (e) => {
      if (e.target.id === "auth-modal") cerrar();
    };
    $("auth-modal").addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-toggle-pass]");
      if (!toggle) return;
      e.preventDefault();
      const campo = $(toggle.dataset.togglePass);
      if (!campo) return;
      const ver = campo.type === "password";
      campo.type = ver ? "text" : "password";
      toggle.innerHTML = `<i class="bi bi-eye${ver ? "-slash" : ""}"></i>`;
      toggle.setAttribute("aria-label", ver ? "Ocultar contraseña" : "Mostrar contraseña");
    });
    document.querySelector(".auth-switch").onclick = (e) => {
      const b = e.target.closest("[data-auth]");
      if (!b) return;
      modo = b.dataset.auth;
      if (modo === "register") rolLogin = "cliente";
      pintarModal();
    };
    $("auth-rol-wrap").onclick = (e) => {
      const b = e.target.closest("[data-rol]");
      if (!b) return;
      rolLogin = b.dataset.rol === "admin" ? "admin" : "cliente";
      pintarModal();
    };
  }

  function onClick(e) {
    if (e.target.closest("[data-auth-open]")) {
      abrir({
        intent: "session",
        email: document.getElementById("dueno-correo")?.value || "",
        nombre: document.getElementById("dueno-nombre")?.value || "",
      });
      return;
    }
    if (e.target.closest("[data-auth-out]")) cerrarSesion();
  }

  function autenticar(email, pass) {
    const correo = (email || "").trim().toLowerCase();
    const hallado = usuarios().find((u) => (u.email || "").toLowerCase() === correo);
    if (!hallado) return { error: "not_found" };
    if (hallado.password !== pass) return { error: "bad_pass" };
    return { usuario: { ...hallado, rol: esAdmin(hallado) ? "admin" : "cliente" } };
  }

  function completarLogin(usuario) {
    guardarSesion(usuario);
    pintar();
  }

  let mounted = false;
  function mount() {
    asegurarAdmin();
    asegurarModal();
    pintar();
    if (mounted) return;
    mounted = true;
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("auth-modal") && !$("auth-modal").hidden) cerrar();
    });
  }

  window.AgendaAuth = {
    sesion,
    usuarios,
    abrir,
    cerrar,
    pintar,
    mount,
    cerrarSesion,
    esAdmin,
    autenticar,
    completarLogin,
    rutaPanelAdmin,
  };
})();
