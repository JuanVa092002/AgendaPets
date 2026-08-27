(function () {
  const KEY_U = "usuarios";
  const KEY_SES = "sesion";
  let modo = "register";
  let intent = "session";
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
    localStorage.setItem(KEY_SES, JSON.stringify({ telefono: u.telefono, nombre: u.nombre }));
  }

  function cerrarSesion() {
    localStorage.removeItem(KEY_SES);
    pintar();
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
    return `<div class="sesion-chip sesion-chip--in" title="Sesión activa">
      <span class="sesion-chip__avatar">${inicial}</span>
      <span class="sesion-chip__copy">
        <strong>Hola, ${primerNombre(s.nombre)}</strong>
        <small>Sesión activa</small>
      </span>
      <span class="sesion-chip__dot" aria-hidden="true"></span>
      <button type="button" class="sesion-chip__salir" data-auth-out>Salir</button>
    </div>`;
  }

  function pintar() {
    document.querySelectorAll("[data-sesion-slot]").forEach((el) => {
      el.innerHTML = chipHTML();
    });
  }

  function authError(msg) {
    const el = $("auth-error");
    if (!el) return;
    if (!msg) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = msg;
  }

  function pintarModal() {
    const esRegistro = modo === "register";
    const confirmar = intent === "confirm";
    document.querySelectorAll(".auth-switch__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.auth === modo));
    $("auth-confirm-wrap").hidden = !esRegistro;
    $("auth-password").autocomplete = esRegistro ? "new-password" : "current-password";
    $("auth-title").textContent = esRegistro ? (confirmar ? "Guarda tu cita" : "Crea tu cuenta") : "Bienvenido de nuevo";
    $("auth-lead").textContent = esRegistro
      ? confirmar
        ? "Crea tu cuenta con el WhatsApp de la reserva. Solo te toma un momento."
        : "Regístrate con tu WhatsApp y una contraseña."
      : confirmar
        ? "Entra con tu WhatsApp y confirma la cita."
        : "Entra con tu WhatsApp para seguir tu reserva.";
    $("auth-submit").textContent = esRegistro
      ? confirmar
        ? "Crear cuenta y confirmar"
        : "Crear cuenta"
      : confirmar
        ? "Entrar y confirmar"
        : "Entrar";
    authError("");
  }

  function asegurarModal() {
    if ($("auth-modal")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div class="auth-overlay" id="auth-modal" hidden>
      <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" class="auth-modal__close" id="auth-cerrar" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        <img src="assets/logo.png" alt="" class="auth-modal__logo" width="48" height="48">
        <h2 id="auth-title">Guarda tu cita</h2>
        <p class="auth-modal__lead" id="auth-lead">Usa tu WhatsApp y una contraseña.</p>
        <div class="auth-switch" role="tablist" aria-label="Tipo de acceso">
          <button type="button" class="auth-switch__btn" data-auth="login" role="tab">Iniciar sesión</button>
          <button type="button" class="auth-switch__btn is-on" data-auth="register" role="tab">Crear cuenta</button>
        </div>
        <form class="auth-form" id="auth-form" novalidate>
          <label for="auth-telefono">WhatsApp</label>
          <div class="auth-phone"><span>+57</span><input id="auth-telefono" type="tel" inputmode="numeric" maxlength="10" placeholder="3001234567" autocomplete="tel"></div>
          <label for="auth-password">Contraseña</label>
          <div class="auth-pass">
            <input id="auth-password" type="password" placeholder="Mínimo 6 caracteres" autocomplete="current-password">
            <button type="button" class="auth-pass__toggle" id="auth-ver" aria-label="Mostrar contraseña"><i class="bi bi-eye"></i></button>
          </div>
          <div id="auth-confirm-wrap">
            <label for="auth-confirm">Confirmar contraseña</label>
            <input id="auth-confirm" type="password" placeholder="Repite la contraseña" autocomplete="new-password">
          </div>
          <p class="auth-error" id="auth-error" hidden></p>
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
    const tel = (opts.telefono || "").trim();
    const existe = tel && usuarios().some((u) => u.telefono === tel);
    modo = existe ? "login" : "register";
    $("auth-telefono").value = tel;
    $("auth-password").value = "";
    $("auth-confirm").value = "";
    pintarModal();
    $("auth-modal").hidden = false;
    document.body.style.overflow = "hidden";
    $("auth-password").focus();
  }

  function cerrar() {
    const modal = $("auth-modal");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
    onSuccess = null;
  }

  function enviar(e) {
    e.preventDefault();
    const tel = $("auth-telefono").value.trim();
    const pass = $("auth-password").value;
    const confirm = $("auth-confirm").value;
    if (!/^\d{10}$/.test(tel)) return authError("El WhatsApp debe tener 10 dígitos.");
    if (pass.length < 6) return authError("La contraseña debe tener al menos 6 caracteres.");
    const lista = usuarios();
    const hallado = lista.find((u) => u.telefono === tel);

    let usuario = hallado;
    if (modo === "register") {
      if (pass !== confirm) return authError("Las contraseñas no coinciden.");
      if (hallado) {
        modo = "login";
        pintarModal();
        return authError("Ese WhatsApp ya tiene cuenta. Inicia sesión.");
      }
      usuario = { telefono: tel, password: pass, nombre: nombreReserva || "Cliente", creado: Date.now() };
      guardarUsuarios(lista.concat(usuario));
    } else {
      if (!hallado) {
        modo = "register";
        pintarModal();
        return authError("No hay cuenta con este WhatsApp. Créala aquí.");
      }
      if (hallado.password !== pass) return authError("Contraseña incorrecta.");
    }

    guardarSesion(usuario);
    const telInput = document.getElementById("dueno-telefono");
    const nomInput = document.getElementById("dueno-nombre");
    if (telInput && !telInput.value) telInput.value = usuario.telefono;
    if (nomInput && !nomInput.value && usuario.nombre && usuario.nombre !== "Cliente") nomInput.value = usuario.nombre;
    pintar();
    const ok = onSuccess;
    cerrar();
    if (ok) ok(usuario);
  }

  function enlazarModal() {
    $("auth-form").onsubmit = enviar;
    $("auth-cerrar").onclick = cerrar;
    $("auth-modal").onclick = (e) => {
      if (e.target.id === "auth-modal") cerrar();
    };
    document.querySelector(".auth-switch").onclick = (e) => {
      const b = e.target.closest("[data-auth]");
      if (!b) return;
      modo = b.dataset.auth;
      pintarModal();
    };
    $("auth-ver").onclick = () => {
      const campo = $("auth-password");
      const ver = campo.type === "password";
      campo.type = ver ? "text" : "password";
      $("auth-ver").innerHTML = `<i class="bi bi-eye${ver ? "-slash" : ""}"></i>`;
    };
  }

  function onClick(e) {
    if (e.target.closest("[data-auth-open]")) {
      abrir({
        intent: "session",
        telefono: document.getElementById("dueno-telefono")?.value || "",
        nombre: document.getElementById("dueno-nombre")?.value || "",
      });
      return;
    }
    if (e.target.closest("[data-auth-out]")) cerrarSesion();
  }

  let mounted = false;
  function mount() {
    asegurarModal();
    pintar();
    if (mounted) return;
    mounted = true;
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("auth-modal") && !$("auth-modal").hidden) cerrar();
    });
  }

  window.AgendaAuth = { sesion, usuarios, abrir, cerrar, pintar, mount, cerrarSesion };
})();
