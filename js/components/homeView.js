/**
 * homeView.js
 * Página de Inicio Oficial de Maps UABCS - DASC
 * Con identidad visual del logo (favicon.png), acceso directo a Horario SQL,
 * Mapa Google/Leaflet/MapLibre 2D/3D, Recorrido Virtual 360° Pannellum, Guía AR/GPS y Directorio.
 */

(function () {
  window.DASCHomeView = {
    render(container, state) {
      const home = state.homeInfo || window.DASC_MOCK_DATA.homeInfo;
      const sqlMeta = window.DASCStore.getSQLData();
      const totalSalones =
        (window.AULAS_DASC && (window.AULAS_DASC.salones || window.AULAS_DASC.aulas || []).length) ||
        (sqlMeta.salones || []).length ||
        23;
      const totalMaestros = (sqlMeta.maestros || []).length || 55;
      const totalMaterias = (sqlMeta.materias || []).length || 31;
      const totalHorarios =
        (state.sqlStats && state.sqlStats.horarios) ||
        (sqlMeta.horarios ? sqlMeta.horarios.length : 215);
      const totalEdificios = (window.CAMPUS && window.CAMPUS.edificios.filter((e) => !e.esVialidad).length) || 49;

      const isLoggedIn = Boolean(state.user);

      container.innerHTML = `
        <section class="view-section home-section">
          <!-- Hero Principal Institucional con Logo Maps UABCS -->
          <div class="home-hero-card">
            <div class="home-hero-content">
              <div class="home-brand-showcase">
                <div class="home-logo-medal">
                  <img src="./favicon.png" alt="Logo Oficial Maps UABCS" class="home-logo-img" />
                </div>
                <div class="home-eyebrow-stack">
                  <div class="home-eyebrow-row">
                    <span class="home-inst-badge">
                      <span class="eyebrow-dot gold"></span>
                      ${escapeHtml(home.institution)}
                    </span>
                    <span class="home-period-badge">${escapeHtml(home.period)}</span>
                  </div>
                  <span class="home-sub-kicker">SISTEMA INTEGRAL MAPS UABCS · GOOGLE SATÉLITE · MAPLIBRE 3D · GUÍA AR/GPS</span>
                </div>
              </div>

              <h1 class="home-hero-title">
                ${escapeHtml(home.department)}
              </h1>

              <p class="home-hero-desc">
                Bienvenido a <strong>Maps UABCS · Portal DASC</strong> (<em>"${escapeHtml(home.motto)}"</em>).
                Explora el nuevo <strong>Mapa Cartográfico Real (Google Satélite Híbrido, Google Calles, Leaflet y MapLibre 3D SIIA)</strong> con los <strong>${totalEdificios} edificios del Campus La Paz</strong> y las <strong>${totalSalones} aulas/laboratorios del DASC geolocalizadas</strong>, activa la <strong>Guía por Realidad Aumentada con GPS y Ruteo Peatonal</strong>, o consulta tu <strong>Horario Escolar SQL</strong>.
              </p>

              <div class="home-hero-actions">
                <button type="button" class="btn-primary home-cta-btn" data-go-view="mapa">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                  <span>Abrir Mapa Google / 3D SIIA</span>
                </button>

                <button type="button" class="btn-action-ar home-cta-btn" id="btn-home-open-ar">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  <span>Guía Realidad Aumentada + GPS</span>
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
                      ? `Mi Horario (${escapeHtml(state.user.semestre || state.user.semester)}° ${escapeHtml(state.user.turno)} ${escapeHtml(state.user.grupo)})`
                      : "Horario SQL (Iniciar Sesión)"
                  }</span>
                </button>
              </div>
            </div>

            <!-- Panel Derecho: Estado en Vivo de la Base de Datos SQL + Cartografía -->
            <div class="home-sql-status-card">
              <div class="sql-card-header">
                <div class="sql-status-pill">
                  <span class="sql-live-dot"></span>
                  <span>MOTOR SQL + GIS 3D CONECTADO</span>
                </div>
                <span class="sql-engine-tag">SQLite3 · GeoJSON · GPS</span>
              </div>

              <h3 class="sql-card-title">Infraestructura Digital DASC · Campus La Paz</h3>
              <p class="sql-card-desc">
                Base de datos relacional de horarios de <strong>Ingeniería en Desarrollo de Software</strong> vinculada con coordenadas GPS reales, polígonos 3D SIIA y ruteo peatonal:
              </p>

              <div class="sql-metrics-grid">
                <div class="sql-metric-box">
                  <span class="sql-metric-val">${totalEdificios}</span>
                  <span class="sql-metric-label">Edificios Campus</span>
                  <span class="sql-metric-sub">Geometría 3D SIIA</span>
                </div>
                <div class="sql-metric-box">
                  <span class="sql-metric-val">${totalSalones}</span>
                  <span class="sql-metric-label">Salones y Labs DASC</span>
                  <span class="sql-metric-sub">GPS + Ruteo DASC</span>
                </div>
                <div class="sql-metric-box">
                  <span class="sql-metric-val">${totalMaestros}</span>
                  <span class="sql-metric-label">Tabla <code>maestros</code></span>
                  <span class="sql-metric-sub">${totalMaterias} Materias IDS</span>
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
                  <span>Descargar <code>database/uabcs_dasc.sql</code></span>
                </a>
                <a href="./img/Mapa-Campus-La-Paz-2022.pdf" target="_blank" rel="noopener" class="sql-source-link">
                  Plano Oficial PDF 2022 ↗
                </a>
              </div>
            </div>
          </div>

          <!-- Apartados Principales del Portal (Mapa, AR/VR, Horario, Directorio) -->
          <div class="home-modules-grid home-modules-4col">
            <article class="home-module-card" data-go-view="mapa" role="button" tabindex="0">
              <div class="module-card-top">
                <span class="module-icon-box gold">
                  <i class="bi bi-globe-americas" style="font-size: 1.25rem;"></i>
                </span>
                <span class="module-badge-pill gold">Google Satélite · MapLibre 3D</span>
              </div>
              <h3>1. Mapa Google / Leaflet / 3D SIIA</h3>
              <p>
                Cambia entre <strong>Google Satélite Híbrido, Google Calles y Vector 3D</strong>, controla la profundidad 3D con la rueda del ratón, calcula rutas peatonales y explora los <strong>${totalEdificios} edificios y ${totalSalones} aulas del DASC</strong>.
              </p>
              <span class="module-link-cta">
                <span>Abrir Mapa Cartográfico</span>
                <span>→</span>
              </span>
            </article>

            <article class="home-module-card" id="card-home-ar" role="button" tabindex="0">
              <div class="module-card-top">
                <span class="module-icon-box blue">
                  <i class="bi bi-compass-fill" style="font-size: 1.25rem;"></i>
                </span>
                <span class="module-badge-pill">Cámara AR · GPS · Ruteo</span>
              </div>
              <h3>2. Realidad Aumentada + Ruteo GPS</h3>
              <p>
                Navegación peatonal con <strong>cámara en vivo, brújula magnética, flecha 3D direccional, cálculo Haversine y mapa de ruta Leaflet con cono de visión</strong> hacia cualquier salón o edificio.
              </p>
              <span class="module-link-cta">
                <span>Iniciar Guía AR</span>
                <span>→</span>
              </span>
            </article>

            <article class="home-module-card" data-go-view="horario" role="button" tabindex="0">
              <div class="module-card-top">
                <span class="module-icon-box emerald">
                  <i class="bi bi-calendar3-week" style="font-size: 1.25rem;"></i>
                </span>
                <span class="module-badge-pill emerald">Base de Datos SQLite3</span>
              </div>
              <h3>3. Horario Oficial IDS (SQL)</h3>
              <p>
                Consulta los horarios oficiales divididos en <strong>Salón, Maestro y Materia</strong>. Haz clic en cualquier clase para volar directamente a su aula en el mapa 3D o activar la guía AR.
              </p>
              <span class="module-link-cta">
                <span>${isLoggedIn ? "Abrir mi horario activo" : "Iniciar sesión institucional"}</span>
                <span>→</span>
              </span>
            </article>

            <article class="home-module-card" data-go-view="directorio" role="button" tabindex="0">
              <div class="module-card-top">
                <span class="module-icon-box blue">
                  <i class="bi bi-people-fill" style="font-size: 1.25rem;"></i>
                </span>
                <span class="module-badge-pill">Sandoval, Leyva y Eventos</span>
              </div>
              <h3>4. Directorio DASC y Eventos</h3>
              <p>
                Consulta a los representantes principales (<strong>Dr. Jesús Andrés Sandoval Bringas</strong> y <strong>M.T.I. Amado Alejandro Leyva Carrillo</strong>), oficinas, cubículos, talleres y eventos vigentes.
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

      const openArDirect = () => {
        window.DASCStore.openARGuide({
          buildingId: "dsc-39",
          destinationLabel: "LAB A · Laboratorio de Cómputo A (DSC-39)",
          aulaId: "LAB A"
        });
      };

      const btnHomeAr = container.querySelector("#btn-home-open-ar");
      if (btnHomeAr) btnHomeAr.addEventListener("click", openArDirect);

      const cardHomeAr = container.querySelector("#card-home-ar");
      if (cardHomeAr) {
        cardHomeAr.addEventListener("click", openArDirect);
        cardHomeAr.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openArDirect();
          }
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
