(function (global) {
  var host = (global.location && global.location.hostname) || "";
  var local = host === "localhost" || host === "127.0.0.1";
  global.AGENDA_PETS_CONFIG = {
    apiUrl: local ? "http://localhost:8080" : "https://agendapets-api.onrender.com"
  };
})(window);
