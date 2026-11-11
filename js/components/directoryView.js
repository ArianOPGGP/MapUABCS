/**
 * directoryView.js
 * Apartado de Directorio y Eventos Oficiales DASC / UABCS:
 * 1. Representantes Principales: Únicamente Dr. Jesús Andrés Sandoval Bringas y M.T.I. Amado Alejandro Leyva Carrillo
 * 2. Oficinas, Cubículo de Maestros, Área de Servicio, Redes y Otros Lugares Importantes
 * 3. Eventos y Convocatorias Oficiales extraídos de la página del DASC (uabcs.mx/dasc)
 */

(function () {
  let activePlaceCategory = "all";

  window.DASCDirectoryView = {
    render(container, state) {
      const representatives = state.professors || [];
      const allPlaces = state.directoryPlaces || [];
      const events = state.events || [];

      const filteredPlaces =
        activePlaceCategory === "all"
          ? allPlaces
          : allPlaces.filter((pl) => pl.category === activePlaceCategory);

      container.innerHTML = `
        <section class="view-section directory-section">
          <div class="section-header-bar">
            <div class="section-title-group">
              <div class="section-eyebrow">
                <span class="eyebrow-dot gold"></span>
                <span>DIRECTORIO INSTITUCIONAL Y AGENDA OFICIAL · DASC UABCS</span>
              </div>
              <h2>Representantes Principales, Oficinas, Áreas Clave y Eventos DASC</h2>
              <p>
                Consulta la información y oficinas de los representantes principales (<strong>Dr. Jesús Andrés Sandoval Bringas</strong> y <strong>M.T.I. Amado Alejandro Leyva Carrillo</strong>), el cubículo de maestros, área de servicio, redes, lugares importantes y los eventos oficiales vigentes del DASC.
              </p>
            </div>
          </div>

          <!-- SECCIÓN 1: Representantes Principales (Maestros Sandoval y Leyva) -->
          <div class="dir-block-section">
            <div class="dir-block-header">
              <div>
                <span class="section-tag">REPRESENTANTES PRINCIPALES DEL DASC</span>
                <h3>Jefatura Departamental y Coordinación Académica IDS (${representatives.length})</h3>
              </div>
            </div>

            <div class="representatives-grid">
              ${representatives
                .map((prof) => {
                  const building = window.DASCStore.getBuildingById(prof.buildingId);
                  const bName = building
                    ? `${building.name} (${building.code})`
                    : "Edificio DSC-39";
                  const respList = Array.isArray(prof.responsibilities)
                    ? prof.responsibilities
                    : prof.responsibilities
                    ? [prof.responsibilities]
                    : [];

                  return `
                    <article class="rep-highlight-card">
                      <div class="rep-card-top">
                        <div class="rep-avatar-large">${getInitials(prof.name)}</div>
                        <div class="rep-title-meta">
                          <span class="rep-badge-main">REPRESENTANTE PRINCIPAL DASC</span>
                          <h3>${escapeHtml(prof.name)}</h3>
                          <p class="rep-role-text">${escapeHtml(prof.role)}</p>
                        </div>
                      </div>

                      <div class="rep-details-grid">
                        <div class="rep-detail-box">
                          <span class="info-label">Oficina Asignada:</span>
                          <strong class="info-val-gold">${escapeHtml(prof.cubicle)}</strong>
                        </div>
                        <div class="rep-detail-box">
                          <span class="info-label">Edificio Oficial:</span>
                          <span>${escapeHtml(bName)}</span>
                        </div>
                        <div class="rep-detail-box">
                          <span class="info-label">Correo Institucional:</span>
                          <a href="mailto:${escapeHtml(prof.email)}" class="info-link">${escapeHtml(prof.email)}</a>
                        </div>
                        <div class="rep-detail-box">
                          <span class="info-label">Teléfono / Extensión:</span>
                          <span>${escapeHtml(prof.phone || "(612) 123-8800")}</span>
                        </div>
                        <div class="rep-detail-box full-col">
                          <span class="info-label">Horario de Atención:</span>
                          <span>${escapeHtml(prof.officeHours)}</span>
                        </div>
                      </div>

                      ${
                        respList.length > 0
                          ? `
                        <div class="rep-resp-block">
                          <span class="info-label">Funciones y Atención Principal:</span>
                          <ul class="rep-resp-list">
                            ${respList.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
                          </ul>
                        </div>
                      `
                          : ""
                      }

                      <div class="prof-subjects-row">
                        ${(prof.subjects || [])
                          .map(
                            (sub) =>
                              `<span class="subject-pill">${escapeHtml(sub)}</span>`
                          )
                          .join("")}
                      </div>

                      <div class="prof-actions-row">
                        <button
                          type="button"
                          class="btn-action-map"
                          data-locate-building="${escapeHtml(prof.buildingId)}"
                          data-locate-room="${escapeHtml(prof.cubicle)}"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>Ubicar Oficina en Mapa 2D/3D</span>
                        </button>

                        <button
                          type="button"
                          class="btn-action-ar btn-icon-ar-secondary"
                          data-ar-building="${escapeHtml(prof.buildingId)}"
                          data-ar-room="${escapeHtml(prof.cubicle)}"
                          data-ar-title="${escapeHtml(prof.name)}"
                          data-ar-sub="${escapeHtml(prof.role)}"
                          title="Iniciar Guía AR hacia oficina"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                          </svg>
                        </button>
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>
          </div>

          <!-- SECCIÓN 2: Oficinas, Cubículos de Maestros, Área de Servicio, Redes y Otros Lugares Importantes -->
          <div class="dir-block-section">
            <div class="dir-block-header">
              <div>
                <span class="section-tag tag-emerald">INFRAESTRUCTURA Y SERVICIOS CLAVE</span>
                <h3>Oficinas, Cubículo de Maestros, Área de Servicio, Redes y Lugares Importantes (${allPlaces.length})</h3>
                <p>Selecciona cualquier área para ver su referencia y ubicarla directamente en el Mapa 2D/3D del Campus La Paz.</p>
              </div>

              <div class="places-filter-pills" role="tablist">
                <button
                  type="button"
                  class="place-filter-btn ${activePlaceCategory === "all" ? "active" : ""}"
                  data-place-cat="all"
                >
                  Todas las Áreas (${allPlaces.length})
                </button>
                <button
                  type="button"
                  class="place-filter-btn ${activePlaceCategory === "Oficina Representante" ? "active" : ""}"
                  data-place-cat="Oficina Representante"
                >
                  Oficinas Sandoval y Leyva
                </button>
                <button
                  type="button"
                  class="place-filter-btn ${activePlaceCategory === "Cubículos de Maestros" ? "active" : ""}"
                  data-place-cat="Cubículos de Maestros"
                >
                  Cubículo de Maestros
                </button>
                <button
                  type="button"
                  class="place-filter-btn ${activePlaceCategory === "Área de Servicio" ? "active" : ""}"
                  data-place-cat="Área de Servicio"
                >
                  Área de Servicio
                </button>
                <button
                  type="button"
                  class="place-filter-btn ${activePlaceCategory === "Redes y Telecomunicaciones" ? "active" : ""}"
                  data-place-cat="Redes y Telecomunicaciones"
                >
                  Redes y Servidores
                </button>
                <button
                  type="button"
                  class="place-filter-btn ${activePlaceCategory === "Laboratorios y Salones" ? "active" : ""}"
                  data-place-cat="Laboratorios y Salones"
                >
                  Labs y Salones DASC
                </button>
                <button
                  type="button"
                  class="place-filter-btn ${activePlaceCategory === "Lugar Importante UABCS" ? "active" : ""}"
                  data-place-cat="Lugar Importante UABCS"
                >
                  Otros Lugares UABCS
                </button>
              </div>
            </div>

            <div class="places-cards-grid">
              ${filteredPlaces
                .map((place) => {
                  const building = window.DASCStore.getBuildingById(place.buildingId);
                  const bCode = place.buildingCode || (building ? building.code : place.buildingId);
                  const locText = place.location || place.locationDetail || "Edificio DSC-39";

                  return `
                    <article class="place-directory-card">
                      <div class="place-card-top">
                        <span class="place-cat-badge">${escapeHtml(place.category)}</span>
                        <span class="place-bldg-code">${escapeHtml(bCode)}</span>
                      </div>

                      <h4 class="place-card-title">${escapeHtml(place.name)}</h4>
                      <p class="place-card-desc">${escapeHtml(place.description)}</p>

                      <div class="place-meta-list">
                        <div class="place-meta-row">
                          <strong>Ubicación:</strong>
                          <span class="text-gold">${escapeHtml(locText)}</span>
                        </div>
                        <div class="place-meta-row">
                          <strong>Horario / Contacto:</strong>
                          <span>${escapeHtml(place.schedule)} · ${escapeHtml(place.contact)}</span>
                        </div>
                      </div>

                      <div class="prof-actions-row">
                        <button
                          type="button"
                          class="btn-action-map"
                          data-locate-building="${escapeHtml(place.buildingId)}"
                          data-locate-room="${escapeHtml(place.name)}"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                          </svg>
                          <span>Ubicar en Mapa 2D/3D</span>
                        </button>

                        <button
                          type="button"
                          class="btn-action-ar btn-icon-ar-secondary"
                          data-ar-building="${escapeHtml(place.buildingId)}"
                          data-ar-room="${escapeHtml(locText)}"
                          data-ar-title="${escapeHtml(place.name)}"
                          data-ar-sub="${escapeHtml(place.contact)}"
                          title="Iniciar Guía AR"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                          </svg>
                        </button>
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>
          </div>

          <!-- SECCIÓN 3: Eventos y Convocatorias Oficiales del DASC y la UABCS -->
          <div class="dir-block-section">
            <div class="dir-block-header">
              <div>
                <span class="section-tag tag-gold">EVENTOS OFICIALES EXTRAÍDOS DE UABCS.MX/DASC</span>
                <h3>Eventos, Concursos y Convocatorias del DASC (${events.length})</h3>
                <p>Actividades académicas, torneos y certámenes oficiales del XVIII Encuentro de Sistemas Computacionales y la agenda DASC.</p>
              </div>
              <a
                href="https://www.uabcs.mx/dasc/"
                target="_blank"
                rel="noopener"
                class="btn-secondary-tech"
              >
                <span>Portal Oficial DASC ↗</span>
              </a>
            </div>

            <div class="events-grid-3col">
              ${events
                .map((ev) => {
                  const building = window.DASCStore.getBuildingById(ev.buildingId);
                  const bName = building
                    ? `${building.shortName} (${building.code})`
                    : "Edificio DSC-39";

                  return `
                    <article class="event-card">
                      <div class="event-card-top">
                        <span class="event-category-badge">${escapeHtml(ev.category)}</span>
                        <span class="event-date-badge">${escapeHtml(ev.date)}</span>
                      </div>

                      <h3 class="event-title">${escapeHtml(ev.title)}</h3>
                      <p class="event-desc">${escapeHtml(ev.description)}</p>

                      <div class="event-meta-box">
                        <div class="event-meta-line">
                          <strong>Organiza / Comité:</strong>
                          <span>${escapeHtml(ev.speaker)}</span>
                        </div>
                        <div class="event-meta-line">
                          <strong>Sede / Salón:</strong>
                          <span class="text-gold">${escapeHtml(ev.locationDetail)} · ${escapeHtml(bName)}</span>
                        </div>
                      </div>

                      <div class="event-card-actions">
                        <button
                          type="button"
                          class="btn-action-map"
                          data-locate-building="${escapeHtml(ev.buildingId)}"
                          data-locate-room="${escapeHtml(ev.locationDetail)}"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                          </svg>
                          <span>Ver sede en mapa</span>
                        </button>

                        ${
                          ev.officialUrl
                            ? `
                          <a
                            href="${escapeHtml(ev.officialUrl)}"
                            target="_blank"
                            rel="noopener"
                            class="btn-event-pdf"
                            title="Ver convocatoria oficial en uabcs.mx/dasc"
                          >
                            <span>Convocatoria ↗</span>
                          </a>
                        `
                            : ""
                        }

                        <button
                          type="button"
                          class="btn-action-ar btn-icon-ar-secondary"
                          data-ar-building="${escapeHtml(ev.buildingId)}"
                          data-ar-room="${escapeHtml(ev.locationDetail)}"
                          data-ar-title="${escapeHtml(ev.title)}"
                          data-ar-sub="${escapeHtml(ev.speaker)}"
                          title="Iniciar AR hacia la sede"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                          </svg>
                        </button>
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>
          </div>
        </section>
      `;

      container.querySelectorAll("[data-place-cat]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activePlaceCategory = btn.getAttribute("data-place-cat") || "all";
          window.DASCDirectoryView.render(container, window.DASCStore.getState());
        });
      });

      container.querySelectorAll("[data-locate-building]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const buildingId = btn.getAttribute("data-locate-building");
          const room = btn.getAttribute("data-locate-room");
          window.DASCStore.focusBuildingOnMap({
            buildingId,
            highlightRoom: room
          });
        });
      });

      container.querySelectorAll("[data-ar-building]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const buildingId = btn.getAttribute("data-ar-building");
          const room = btn.getAttribute("data-ar-room");
          const title = btn.getAttribute("data-ar-title");
          const sub = btn.getAttribute("data-ar-sub");
          window.DASCStore.openARGuide({
            buildingId,
            destinationLabel: room,
            subject: title,
            professor: sub
          });
        });
      });
    }
  };

  function getInitials(fullName) {
    const clean = String(fullName || "")
      .replace(/^(Dr\.|M\.C\.|M\.T\.I\.|Lic\.|Ing\.)\s*/i, "")
      .trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
