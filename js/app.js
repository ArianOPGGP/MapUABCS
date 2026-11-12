/**
 * app.js
 * Controlador principal de vistas para "Portal UABCS - DASC"
 * - Inicio: Página principal normal sin bloqueo de inicio de sesión
 * - Horario: Requiere iniciar sesión o registrarse con correo institucional (Base de Datos SQL)
 * - Mapa: Mapa 2D / Un poco 3D del Campus La Paz y Salones del DASC (Acceso Libre)
 * - Directorio: Representantes Sandoval y Leyva, Oficinas, Cubículos, Área de Servicio, Redes y Eventos (Acceso Libre)
 */

(function () {
  function initApp() {
    const navContainer = document.getElementById("app-navbar");
    const mainContainer = document.getElementById("app-main");
    const arContainer = document.getElementById("app-ar-overlay");

    if (!navContainer || !mainContainer || !arContainer) {
      console.error("Contenedores raíz no encontrados en index.html");
      return;
    }

    let lastView = null;
    let lastArStatus = false;

    function renderApp(state) {
      // 1. Renderizar siempre la barra de navegación principal
      window.DASCNavbar.render(navContainer, state);

      // 2. Renderizar la vista activa seleccionada
      switch (state.activeView) {
        case "inicio":
          window.DASCHomeView.render(mainContainer, state);
          break;
        case "horario":
          // Para acceder a Horario se pide iniciar sesión con correo institucional y contraseña
          if (!state.user) {
            window.DASCAuthView.render(mainContainer);
          } else {
            window.DASCScheduleView.render(mainContainer, state);
          }
          break;
        case "mapa":
          window.DASCMapView.render(mainContainer, state);
          break;
        case "directorio":
          window.DASCDirectoryView.render(mainContainer, state);
          break;
        case "admin":
          if (state.user && state.user.role === "admin") {
            window.DASCAdminView.render(mainContainer, state);
          } else {
            window.DASCHomeView.render(mainContainer, state);
          }
          break;
        default:
          window.DASCHomeView.render(mainContainer, state);
          break;
      }

      // 3. Si se cambió de vista, hacer scroll suave al inicio
      const currentViewKey =
        state.activeView === "horario" && !state.user
          ? "horario-auth"
          : state.activeView;
      if (lastView !== currentViewKey) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        lastView = currentViewKey;
      }

      // 4. Renderizar o cerrar el HUD de Realidad Aumentada
      if (state.arOverlayActive !== lastArStatus || state.arOverlayActive) {
        window.DASCARView.render(arContainer, state);
        lastArStatus = state.arOverlayActive;
      }
    }

    // Suscribirse a cambios de estado y ejecutar el primer renderizado
    window.DASCStore.subscribe(renderApp);
    renderApp(window.DASCStore.getState());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
