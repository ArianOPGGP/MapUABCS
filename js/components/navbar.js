/**
 * navbar.js
 * Barra de navegación principal con el logo oficial "Maps UABCS" (favicon.png):
 * - Inicio (Página principal normal sin login)
 * - Horario (Con acceso mediante correo institucional y contraseña)
 * - Mapa 2D/3D/360° (Google Maps Satélite / Calles + MapLibre 3D + Pannellum 360°)
 * - Guía AR / GPS (Cámara en vivo + Brújula + Ruteo Peatonal Leaflet)
 * - Directorio (Representantes Sandoval y Leyva, Oficinas, Cubículos, Redes y Eventos)
 */

(function () {
  const THEME_STORAGE_KEY = "theme";

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === "light" ? "light" : "dark";
    } catch (e) {
      return "dark";
    }
  }

  function applyTheme(theme) {
    const normalized = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", normalized);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, normalized);
    } catch (e) {
      // Ignorar si localStorage no está disponible
    }
    return normalized;
  }

  function getThemeIconSvg(theme) {
    if (theme === "light") {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  }

  applyTheme(getSavedTheme());

  window.DASCNavbar = {
    render(container, state) {
      container.style.display = "block";
      const isLoggedIn = Boolean(state.user);
      const isAdmin = isLoggedIn && state.user.role === "admin";
      const currentView = state.activeView || "inicio";
      const currentTheme =
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : getSavedTheme();

      const navItems = [
        {
          id: "inicio",
          label: "Inicio",
          icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
        },
        {
          id: "horario",
          label: "Horario SQL",
          icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
        },
        {
          id: "mapa",
          label: "Mapa 2D/3D",
          icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`
        },
        {
          id: "directorio",
          label: "Directorio",
          icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        }
      ];

      if (isAdmin) {
        navItems.push({
          id: "admin",
          label: "Admin",
          icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`
        });
      }

      container.innerHTML = `
        <header class="dasc-navbar">
          <div class="navbar-inner">
            <div class="navbar-brand" id="nav-brand-home" title="Maps UABCS · Ir a la página de Inicio">
              <div class="brand-logo-wrap">
                <img src="./favicon.png" alt="Logo Maps UABCS" class="brand-logo-img" />
                <span class="brand-logo-pulse"></span>
              </div>
              <div class="brand-text">
                <div class="brand-title-line">
                  <h1>Maps UABCS</h1>
                  <span class="brand-dasc-pill">DASC · SIIA</span>
                </div>
                <p>Sistemas Computacionales · Campus La Paz</p>
              </div>
            </div>

            <nav class="navbar-links" aria-label="Navegación Principal">
              ${navItems
                .map(
                  (item) => `
                <button
                  type="button"
                  class="nav-tab-btn ${currentView === item.id && !state.arOverlayActive ? "active" : ""} ${item.id === "admin" ? "admin-tab" : ""}"
                  data-nav-view="${item.id}"
                >
                  ${item.icon}
                  <span>${item.label}</span>
                  ${
                    item.id === "horario" && !isLoggedIn
                      ? `<span class="nav-lock-pill" title="Requiere iniciar sesión">🔒</span>`
                      : ""
                  }
                </button>
              `
                )
                .join("")}

              <button
                type="button"
                class="nav-tab-btn nav-ar-direct-btn ${state.arOverlayActive ? "active" : ""}"
                id="btn-nav-open-ar"
                title="Abrir Navegación por Realidad Aumentada, GPS y Ruteo Peatonal"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                <span>Guía AR / GPS</span>
                <span class="nav-live-badge">LIVE</span>
              </button>
            </nav>

            <div class="navbar-user">
              ${
                isLoggedIn
                  ? `
                <div class="user-badge">
                  <span class="user-role-dot ${isAdmin ? "role-admin" : "role-student"}"></span>
                  <div class="user-meta">
                    <span class="user-name">${escapeHtml(state.user.correo || state.user.name)}</span>
                    <span class="user-sub">
                      ${
                        isAdmin
                          ? "Rol: Administrador"
                          : `${escapeHtml(state.user.semestre || state.user.semester || 5)}° Sem · ${escapeHtml(state.user.turno || "Matutino")} ${escapeHtml(state.user.grupo || "A")}`
                      }
                    </span>
                  </div>
                </div>
              `
                  : `
                <button type="button" class="btn-nav-login" id="btn-nav-login" title="Iniciar sesión institucional para ver Horario">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  <span>Iniciar Sesión</span>
                </button>
              `
              }

              <button
                type="button"
                class="btn-theme-toggle"
                id="btn-theme-toggle"
                title="${currentTheme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}"
                aria-label="${currentTheme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}"
              >
                ${getThemeIconSvg(currentTheme)}
              </button>

              ${
                isLoggedIn
                  ? `
                <button type="button" class="btn-logout" id="btn-logout" title="Cerrar sesión">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span class="logout-text">Salir</span>
                </button>
              `
                  : ""
              }
            </div>
          </div>
        </header>
      `;

      container.querySelectorAll("[data-nav-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetView = btn.getAttribute("data-nav-view");
          window.DASCStore.setView(targetView);
        });
      });

      const arBtn = container.querySelector("#btn-nav-open-ar");
      if (arBtn) {
        arBtn.addEventListener("click", () => {
          if (state.arOverlayActive) {
            window.DASCStore.closeARGuide();
          } else {
            const currentTarget = state.arTarget || {
              buildingId: "dsc-39",
              destinationLabel: "LAB A · Laboratorio de Cómputo A (DSC-39)",
              aulaId: "LAB A"
            };
            window.DASCStore.openARGuide(currentTarget);
          }
        });
      }

      const brandHome = container.querySelector("#nav-brand-home");
      if (brandHome) {
        brandHome.addEventListener("click", () => {
          window.DASCStore.setView("inicio");
        });
      }

      const loginBtn = container.querySelector("#btn-nav-login");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          window.DASCStore.setView("horario");
        });
      }

      const themeToggleBtn = container.querySelector("#btn-theme-toggle");
      if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
          const active =
            document.documentElement.getAttribute("data-theme") === "light"
              ? "light"
              : "dark";
          const next = applyTheme(active === "light" ? "dark" : "light");
          themeToggleBtn.innerHTML = getThemeIconSvg(next);
          const nextLabel =
            next === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
          themeToggleBtn.setAttribute("title", nextLabel);
          themeToggleBtn.setAttribute("aria-label", nextLabel);
        });
      }

      const logoutBtn = container.querySelector("#btn-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          window.DASCStore.logout();
        });
      }
    }
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
