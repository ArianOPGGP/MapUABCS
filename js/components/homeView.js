/**
 * homeView.js
 * Página de Inicio Normal (Sin bloqueo de inicio de sesión)
 * Portal Institucional UABCS - DASC con acceso directo a Horario (SQL), Mapa 2D/3D y Directorio/Eventos
 */

(function () {
  window.DASCHomeView = {
    render(container, state) {
      const home = state.homeInfo || window.DASC_MOCK_DATA.homeInfo;
      const sqlMeta = window.DASCStore.getSQLData();
      const totalSalones = (sqlMeta.salones || []).length || 17;
      const totalMaestros = (sqlMeta.maestros || []).length || 55;
      const totalMaterias = (sqlMeta.materias || []).length || 31;
      const totalHorarios =
        (state.sqlStats && state.sqlStats.horarios) ||
        (sqlMeta.horarios ? sqlMeta.horarios.length : 215);

      const isLoggedIn = Boolean(state.user);

      container.innerHTML = `
        <section class="view-section home-section">
          <!-- Hero Principal Institucional -->
          <div class="home-hero-card">
            <div class="home-hero-content">
              <div class="home-eyebrow-row">
                <span class="home-inst-badge">
                  <span class="eyebrow-dot gold"></span>
                  ${escapeHtml(home.institution)}
                </span>
                <span class="home-period-badge">${escapeHtml(home.period)}</span>
              </div>

              <h1 class="home-hero-title">
                ${escapeHtml(home.department)}
              </h1>

              <p class="home-hero-desc">
                Bienvenido al portal interactivo del <strong>DASC - UABCS</strong> (<em>"${escapeHtml(home.motto)}"</em>).
                Explora libremente el <strong>Mapa 2D / Un poco 3D del Campus La Paz</strong> con información de edificios y salones,
                consulta el <strong>Directorio de Representantes (Maestros Sandoval y Leyva), Oficinas, Cubículos, Área de Servicio, Redes y Eventos</strong>,
                o inicia sesión con tu correo institucional para acceder a tu <strong>Horario Escolar conectado a SQL</strong>.
              </p>

              <div class="home-hero-actions">
                <button type="button" class="btn-primary home-cta-btn" data-go-view="mapa">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                  <span>Explorar Mapa 2D / 3D</span>
                </button>

                <button type="button" class="btn-gold home-cta-btn" data-go-view="horario">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>${
                    isLoggedIn
                      ? `Ver Mi Horario (${escapeHtml(state.user.semestre || state.user.semester)}° ${escapeHtml(state.user.turno)} ${escapeHtml(state.user.grupo)})`
                      : "Acceder a Horario (Iniciar Sesión)"
                  }</span>
                </button>

                <button type="button" class="btn-secondary-tech home-cta-btn" data-go-view="directorio">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>Directorio y Eventos</span>
                </button>
              </div>
            </div>

            <!-- Panel Derecho: Estado en Vivo de la Base de Datos SQL -->
            <div class="home-sql-status-card">
              <div class="sql-card-header">
                <div class="sql-status-pill">
                  <span class="sql-live-dot"></span>
                  <span>BASE DE DATOS SQL CONECTADA</span>
                </div>
                <span class="sql-engine-tag">SQLite3 / SQL</span>
              </div>

              <h3 class="sql-card-title">Esquema Relacional Oficial IDS</h3>
              <p class="sql-card-desc">
                Datos extraídos de los horarios oficiales de <strong>Ingeniería en Desarrollo de Software</strong> de la página del DASC, divididos en tablas normalizadas:
              </p>

              <div class="sql-metrics-grid">
                <div class="sql-metric-box">
                  <span class="sql-metric-val">${totalSalones}</span>
                  <span class="sql-metric-label">Tabla <code>salones</code></span>
                  <span class="sql-metric-sub">Aulas y Labs DASC</span>
                </div>
                <div class="sql-metric-box">
                  <span class="sql-metric-val">${totalMaestros}</span>
                  <span class="sql-metric-label">Tabla <code>maestros</code></span>
                  <span class="sql-metric-sub">Docentes asignados</span>
                </div>
                <div class="sql-metric-box">
                  <span class="sql-metric-val">${totalMaterias}</span>
                  <span class="sql-metric-label">Tabla <code>materias</code></span>
                  <span class="sql-metric-sub">Asignaturas 1° a 9°</span>
                </div>
                <div class="sql-metric-box">
                  <span class="sql-metric-val">${totalHorarios}</span>
                  <span class="sql-metric-label">Tabla <code>horarios</code></span>
                  <span class="sql-metric-sub">12 Grupos TM y TV</span>
                </div>
              </div>

              <div class="sql-card-footer">
                <a href="./database/uabcs_dasc.sql" target="_blank" rel="noopener" class="sql-download-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Ver / Descargar <code>database/uabcs_dasc.sql</code></span>
                </a>
                <a href="https://www.uabcs.mx/dasc/estudiantes/horarios/horarios-ingenieria-en-desarrollo-de-software/" target="_blank" rel="noopener" class="sql-source-link">
                  Fuente oficial DASC ↗
                </a>
              </div>
            </div>
          </div>

          <!-- Apartados Principales del Portal (Horario, Mapa, Directorio) -->
          <div class="home-modules-grid">
            <article class="home-module-card" data-go-view="horario" role="button" tabindex="0">
              <div class="module-card-top">
                <span class="module-icon-box blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                <span class="module-badge-pill">Requiere Correo Institucional</span>
              </div>
              <h3>1. Apartado de Horario (Base de Datos SQL)</h3>
              <p>
                Consulta los horarios de Ingeniería en Desarrollo de Software divididos en <strong>Salón, Maestro y Materia</strong>.
                Inicia sesión con tu correo institucional y contraseña, o crea tu sesión eligiendo tu <strong>semestre y grupo</strong>.
              </p>
              <span class="module-link-cta">
                <span>${isLoggedIn ? "Abrir mi horario activo" : "Iniciar sesión o crear sesión"}</span>
                <span>→</span>
              </span>
            </article>

            <article class="home-module-card" data-go-view="mapa" role="button" tabindex="0">
              <div class="module-card-top">
                <span class="module-icon-box gold">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                </span>
                <span class="module-badge-pill gold">Acceso Libre · 2D y Un poco 3D</span>
              </div>
              <h3>2. Mapa Campus La Paz (2D / Un poco 3D)</h3>
              <p>
                Basado en el plano oficial <code>Mapa-Campus-La-Paz-2022.pdf</code>. Alterna entre vista 2D e inclinación 3D,
                haz clic en cualquier edificio para ver su referencia y explora los <strong>salones y laboratorios del DASC (DSC-39 y DSC-46)</strong>.
              </p>
              <span class="module-link-cta">
                <span>Abrir Mapa Interactivo</span>
                <span>→</span>
              </span>
            </article>

            <article class="home-module-card" data-go-view="directorio" role="button" tabindex="0">
              <div class="module-card-top">
                <span class="module-icon-box emerald">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                <span class="module-badge-pill emerald">Sandoval, Leyva, Áreas y Eventos</span>
              </div>
              <h3>3. Directorio DASC, Áreas Clave y Eventos</h3>
              <p>
                Consulta a los representantes principales (<strong>Dr. Jesús Andrés Sandoval Bringas</strong> y <strong>M.T.I. Amado Alejandro Leyva Carrillo</strong>),
                sus oficinas, cubículo de maestros, área de servicio, redes y los eventos oficiales vigentes del DASC.
              </p>
              <span class="module-link-cta">
                <span>Ver Directorio y Eventos</span>
                <span>→</span>
              </span>
            </article>
          </div>

          <!-- Misión, Visión y Oferta Educativa del DASC -->
          <div class="home-info-split">
            <div class="home-about-pane">
              <div class="section-eyebrow">
                <span class="eyebrow-dot"></span>
                <span>IDENTIDAD DEPARTAMENTAL · UABCS</span>
              </div>
              <h2>Sobre el Departamento Académico de Sistemas Computacionales</h2>
              <p class="home-about-lead">
                Ubicado en ${escapeHtml(home.address)} (${escapeHtml(home.phone)}), el DASC forma profesionales líderes en desarrollo de software, inteligencia artificial, ciberseguridad, redes y tecnologías computacionales en Baja California Sur.
              </p>

              <div class="mission-vision-grid">
                <div class="mv-card">
                  <h4>Misión DASC</h4>
                  <p>${escapeHtml(home.mision || home.mission)}</p>
                </div>
                <div class="mv-card">
                  <h4>Visión DASC</h4>
                  <p>${escapeHtml(home.vision)}</p>
                </div>
              </div>

              <div class="home-quicklinks-block">
                <h4>Enlaces y Documentos Oficiales UABCS</h4>
                <div class="home-quicklinks-row">
                  ${(home.quickLinks || [])
                    .map(
                      (lnk) => `
                    <a href="${escapeHtml(lnk.url)}" target="_blank" rel="noopener" class="home-ext-pill">
                      <strong>${escapeHtml(lnk.title)}</strong>
                      <span>${escapeHtml(lnk.subtitle)} ↗</span>
                    </a>
                  `
                    )
                    .join("")}
                </div>
              </div>
            </div>

            <div class="home-programs-pane">
              <div class="section-eyebrow">
                <span class="eyebrow-dot gold"></span>
                <span>OFERTA EDUCATIVA OFICIAL DASC</span>
              </div>
              <h3>Programas Académicos (${(home.programs || []).length})</h3>
              <div class="home-programs-list">
                ${(home.programs || [])
                  .map(
                    (prog) => `
                  <div class="program-item-card">
                    <div class="program-code-badge">${escapeHtml(prog.badge || prog.code || "DASC")}</div>
                    <div class="program-meta">
                      <div class="program-title-row">
                        <h4>${escapeHtml(prog.name)}</h4>
                        <span class="program-sem-tag">${escapeHtml(prog.plan || prog.semesters)}</span>
                      </div>
                      <p>${escapeHtml(prog.desc || prog.description)}</p>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </section>
      `;

      // Navegación hacia las secciones
      container.querySelectorAll("[data-go-view]").forEach((el) => {
        const go = () => {
          const target = el.getAttribute("data-go-view");
          if (target) {
            window.DASCStore.setView(target);
          }
        };
        el.addEventListener("click", go);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go();
          }
        });
      });
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
