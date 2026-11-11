/**
 * mapView.js
 * Mapa Interactivo 2D que se puede poner "un poco 3D" (inclinación 2.5D/3D ajustable)
 * Basado en el plano oficial de la UABCS: Mapa-Campus-La-Paz-2022.pdf
 * Incluye todos los sectores del Campus La Paz y el detalle de SALONES en los edificios del DASC (DSC-39 y DSC-46).
 */

(function () {
  let panOffset = { x: 0, y: 0 };
  let isDraggingMap = false;
  let dragStart = { x: 0, y: 0 };
  let activeCategoryFilter = "all"; // 'all' | 'dasc' | 'admin' | 'services' | 'depts'
  let selectedSalonCodeInPanel = null;

  let panoYaw = 15;
  let panoPitch = 0;
  let isDraggingPano = false;
  let panoDragStart = { x: 0, y: 0, yaw: 0, pitch: 0 };
  let autoRotate360 = true;
  let panoAnimFrame = null;

  function stopPanoLoop() {
    if (panoAnimFrame) {
      cancelAnimationFrame(panoAnimFrame);
      panoAnimFrame = null;
    }
  }

  function filterBuildingsByCategory(buildings, filter) {
    if (filter === "dasc") {
      return buildings.filter((b) => b.isDascBuilding);
    }
    if (filter === "admin") {
      return buildings.filter((b) =>
        ["ad-19", "ad-20", "ad-52", "ad-55", "ad-65"].includes(b.id.toLowerCase())
      );
    }
    if (filter === "services") {
      return buildings.filter((b) =>
        ["ad-18", "ad-10", "ad-21", "ad-01", "ad-59"].includes(b.id.toLowerCase())
      );
    }
    if (filter === "depts") {
      return buildings.filter((b) =>
        ["cmt-03", "csh-02", "ca-04"].includes(b.id.toLowerCase())
      );
    }
    return buildings;
  }

  window.DASCMapView = {
    render(container, state) {
      stopPanoLoop();

      const allBuildings = window.DASCStore.getBuildings();
      const filteredBuildings = filterBuildingsByCategory(
        allBuildings,
        activeCategoryFilter
      );
      const mapSel = state.mapSelection;
      const selectedBuilding =
        window.DASCStore.getBuildingById(mapSel.buildingId) || allBuildings[0];

      if (mapSel.highlightRoom && selectedBuilding.salonesDasc) {
        const matchedSalon = selectedBuilding.salonesDasc.find((s) =>
          mapSel.highlightRoom.toUpperCase().includes(s.codigo.toUpperCase())
        );
        if (matchedSalon) {
          selectedSalonCodeInPanel = matchedSalon.codigo;
        }
      } else if (
        selectedBuilding.salonesDasc &&
        selectedBuilding.salonesDasc.length > 0 &&
        (!selectedSalonCodeInPanel ||
          !selectedBuilding.salonesDasc.some(
            (s) => s.codigo === selectedSalonCodeInPanel
          ))
      ) {
        selectedSalonCodeInPanel = selectedBuilding.salonesDasc[0].codigo;
      }

      const tiltDeg = mapSel.mode3D ? Number(mapSel.tiltAngle || 38) : 0;
      const rotZDeg = mapSel.mode3D ? -10 : 0;

      const buildingEvents = state.events.filter(
        (ev) => String(ev.buildingId).toLowerCase() === selectedBuilding.id.toLowerCase()
      );
      const buildingProfessors = state.professors.filter(
        (p) => String(p.buildingId).toLowerCase() === selectedBuilding.id.toLowerCase()
      );

      const originPoint = { x: 480, y: 745 };
      const targetCenter = {
        x: selectedBuilding.mapCoords.x + selectedBuilding.mapCoords.width / 2,
        y: selectedBuilding.mapCoords.y + selectedBuilding.mapCoords.height / 2
      };

      container.innerHTML = `
        <section class="view-section map-section">
          <div class="map-top-reference-bar">
            <div class="map-ref-title">
              <span class="section-eyebrow">
                <span class="eyebrow-dot gold"></span>
                <span>CARTOGRAFÍA OFICIAL CAMPUS LA PAZ · UABCS</span>
              </span>
              <h2>Mapa Campus UABCS 2D / Un poco 3D y Salones del DASC</h2>
              <p>
                Haz clic en cualquier edificio del campus para consultar su información oficial. En los edificios del DASC (<strong>DSC-39</strong> y <strong>DSC-46</strong>) puedes inspeccionar todos sus <strong>salones y laboratorios</strong> conectados a la base SQL.
              </p>
            </div>

            <div class="map-ref-actions">
              <a
                href="./assets/Mapa-Campus-La-Paz-2022.pdf"
                target="_blank"
                rel="noopener"
                class="btn-gold map-pdf-btn"
                title="Abrir plano oficial PDF de la UABCS"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>Plano Oficial PDF (2022)</span>
              </a>
            </div>
          </div>

          <div class="map-toolbar">
            <div class="map-category-filters" role="tablist" aria-label="Filtrar sectores del Campus UABCS">
              <button
                type="button"
                class="cat-filter-btn ${activeCategoryFilter === "all" ? "active" : ""}"
                data-map-cat="all"
              >
                Todo el Campus (${allBuildings.length})
              </button>
              <button
                type="button"
                class="cat-filter-btn cat-dasc ${activeCategoryFilter === "dasc" ? "active" : ""}"
                data-map-cat="dasc"
              >
                Edificios DASC y Salones (DSC-39 / DSC-46)
              </button>
              <button
                type="button"
                class="cat-filter-btn ${activeCategoryFilter === "admin" ? "active" : ""}"
                data-map-cat="admin"
              >
                Rectoría, Biblioteca y CTIC
              </button>
              <button
                type="button"
                class="cat-filter-btn ${activeCategoryFilter === "services" ? "active" : ""}"
                data-map-cat="services"
              >
                DELE, Cafetería, Servicios Médicos y Deportes
              </button>
              <button
                type="button"
                class="cat-filter-btn ${activeCategoryFilter === "depts" ? "active" : ""}"
                data-map-cat="depts"
              >
                Otros Departamentos Académicos
              </button>
            </div>

            <div class="map-controls-row">
              <div class="map-building-chips" role="tablist" aria-label="Edificios del Campus">
                ${filteredBuildings
                  .map(
                    (b) => `
                  <button
                    type="button"
                    class="building-chip ${b.id === selectedBuilding.id ? "active" : ""} ${b.isDascBuilding ? "is-dasc-chip" : ""}"
                    data-select-building="${escapeHtml(b.id)}"
                  >
                    <span class="chip-code">${escapeHtml(b.code)}</span>
                    <span>${escapeHtml(b.shortName)}</span>
                  </button>
                `
                  )
                  .join("")}
              </div>

              <div class="map-view-controls">
                <div class="mode-toggle-group" role="group" aria-label="Modo 2D o Un poco 3D">
                  <button
                    type="button"
                    class="btn-mode-toggle ${!mapSel.mode3D ? "active" : ""}"
                    data-map-mode="2d"
                  >
                    Mapa 2D Plano
                  </button>
                  <button
                    type="button"
                    class="btn-mode-toggle ${mapSel.mode3D ? "active" : ""}"
                    data-map-mode="3d"
                  >
                    Un poco 3D (${tiltDeg}°)
                  </button>
                </div>

                ${
                  mapSel.mode3D
                    ? `
                  <div class="tilt-slider-box" title="Ajustar inclinación 3D del mapa">
                    <label for="map-tilt-range">Inclinación 3D:</label>
                    <input
                      type="range"
                      id="map-tilt-range"
                      min="15"
                      max="52"
                      step="1"
                      value="${tiltDeg}"
                    />
                  </div>
                `
                    : ""
                }

                <div class="zoom-controls">
                  <button type="button" class="btn-icon-map" id="btn-zoom-out" title="Alejar mapa">−</button>
                  <span class="zoom-readout">${Math.round(mapSel.zoomLevel * 100)}%</span>
                  <button type="button" class="btn-icon-map" id="btn-zoom-in" title="Acercar mapa">+</button>
                  <button type="button" class="btn-icon-map" id="btn-zoom-reset" title="Centrar vista">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="map-workspace">
            <div class="map-viewport" id="dasc-map-viewport">
              <div class="map-compass" title="Orientación Campus La Paz UABCS">
                <span class="compass-n">N</span>
                <div class="compass-arrow"></div>
              </div>

              <div class="map-legend-pill">
                <span class="legend-item"><i class="dot-dasc"></i> DASC (DSC-39 / DSC-46)</span>
                <span class="legend-item"><i class="dot-origin"></i> Acceso Principal Forjadores</span>
                <span class="legend-item"><i class="dot-target"></i> ${escapeHtml(selectedBuilding.code)} (${escapeHtml(selectedBuilding.distanceMeters)} m)</span>
              </div>

              <div
                class="map-scene-plane ${mapSel.mode3D ? "is-3d" : "is-2d"}"
                id="dasc-map-plane"
                style="transform: translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${mapSel.zoomLevel}) ${
                  mapSel.mode3D
                    ? `rotateX(${tiltDeg}deg) rotateZ(${rotZDeg}deg)`
                    : "rotateX(0deg) rotateZ(0deg)"
                };"
              >
                <svg class="map-ground-svg" viewBox="0 0 1000 800" preserveAspectRatio="none">
                  <defs>
                    <pattern id="dascGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.1)" stroke-width="1"/>
                    </pattern>
                    <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#10B981"/>
                      <stop offset="50%" stop-color="#3B82F6"/>
                      <stop offset="100%" stop-color="#F59E0B"/>
                    </linearGradient>
                  </defs>

                  <rect width="1000" height="800" fill="url(#dascGrid)" />

                  <rect x="45" y="45" width="910" height="715" rx="30" fill="rgba(15, 23, 42, 0.68)" stroke="rgba(148, 163, 184, 0.22)" stroke-width="2"/>

                  <rect x="380" y="235" width="285" height="160" rx="20" fill="rgba(132, 204, 22, 0.08)" stroke="rgba(132, 204, 22, 0.45)" stroke-width="2" stroke-dasharray="8 5"/>
                  <text x="522" y="255" fill="rgba(163, 230, 53, 0.9)" font-size="11" text-anchor="middle" font-weight="700" letter-spacing="1">SECTOR DASC · DSC-39 Y DSC-46</text>

                  <path d="M 80 760 L 920 760" fill="none" stroke="rgba(71, 85, 105, 0.75)" stroke-width="28" stroke-linecap="round"/>
                  <text x="500" y="788" fill="rgba(148, 163, 184, 0.8)" font-size="12" text-anchor="middle" font-weight="700" letter-spacing="2">BLVD. FORJADORES DE SUDCALIFORNIA · ACCESO PRINCIPAL UABCS</text>

                  <path d="M 480 745 L 480 200" fill="none" stroke="rgba(51, 65, 85, 0.85)" stroke-width="22" stroke-linecap="round"/>
                  <path d="M 220 500 L 860 500" fill="none" stroke="rgba(51, 65, 85, 0.85)" stroke-width="20" stroke-linecap="round"/>
                  <path d="M 220 350 L 890 350" fill="none" stroke="rgba(51, 65, 85, 0.85)" stroke-width="18" stroke-linecap="round"/>
                  <path d="M 220 220 L 720 220" fill="none" stroke="rgba(51, 65, 85, 0.8)" stroke-width="16" stroke-linecap="round"/>

                  <path
                    d="M ${originPoint.x} ${originPoint.y} L ${originPoint.x} ${targetCenter.y} L ${targetCenter.x} ${targetCenter.y}"
                    fill="none"
                    stroke="url(#routeGrad)"
                    stroke-width="6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-dasharray="12 8"
                    class="animated-route-line"
                  />
                </svg>

                <div class="map-student-origin" style="left: ${originPoint.x}px; top: ${originPoint.y}px;">
                  <div class="origin-pulse"></div>
                  <div class="origin-dot"></div>
                  <span class="origin-label">Entrada UABCS</span>
                </div>

                ${allBuildings
                  .map((b) => {
                    const isSelected = b.id === selectedBuilding.id;
                    const isDimmed =
                      activeCategoryFilter !== "all" &&
                      !filteredBuildings.some((fb) => fb.id === b.id);
                    const { x, y, width, height, height3d } = b.mapCoords;
                    const salonesCount = (b.salonesDasc || []).length;

                    return `
                      <div
                        class="map-building-node ${isSelected ? "selected" : ""} ${b.isDascBuilding ? "dasc-node" : ""} ${isDimmed ? "dimmed-node" : ""}"
                        data-building-node="${escapeHtml(b.id)}"
                        style="left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px; --b-color: ${b.mapCoords.color}; --b-height: ${height3d}px;"
                        role="button"
                        tabindex="0"
                        aria-label="Seleccionar ${escapeHtml(b.name)}"
                      >
                        <div class="building-shadow"></div>
                        <div class="building-box-3d">
                          <div class="building-wall wall-front"></div>
                          <div class="building-wall wall-back"></div>
                          <div class="building-wall wall-left"></div>
                          <div class="building-wall wall-right"></div>
                          <div class="building-roof">
                            <span class="roof-code">${escapeHtml(b.code)}</span>
                            <span class="roof-name">${escapeHtml(b.shortName)}</span>
                            ${
                              salonesCount > 0
                                ? `<span class="roof-event-badge">${salonesCount} Salones</span>`
                                : ""
                            }
                          </div>
                        </div>

                        ${
                          isSelected
                            ? `
                          <div class="building-selected-ring"></div>
                          <div class="building-floating-pin">
                            <span class="pin-title">${escapeHtml(
                              mapSel.highlightRoom || b.shortName
                            )}</span>
                            <span class="pin-arrow">▼</span>
                          </div>
                        `
                            : ""
                        }
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>

            <aside class="building-floating-card" aria-live="polite">
              <div class="building-card-header">
                <div class="building-header-badges">
                  <span class="badge-code" style="border-color: ${escapeHtml(selectedBuilding.mapCoords.color)};">
                    ${escapeHtml(selectedBuilding.code)}
                  </span>
                  <span class="badge-category">${escapeHtml(selectedBuilding.category)}</span>
                  <span class="badge-distance">${escapeHtml(selectedBuilding.distanceMeters)} m</span>
                </div>
                <h3>${escapeHtml(selectedBuilding.name)}</h3>
                <p class="building-desc">${escapeHtml(selectedBuilding.description)}</p>
              </div>

              ${
                mapSel.highlightRoom
                  ? `
                <div class="highlighted-room-banner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <span class="hl-label">Ubicación seleccionada:</span>
                    <strong class="hl-value">${escapeHtml(mapSel.highlightRoom)}</strong>
                  </div>
                </div>
              `
                  : ""
              }

              <div class="building-primary-actions">
                ${
                  selectedBuilding.panorama360
                    ? `
                  <button
                    type="button"
                    class="btn-360-tour"
                    id="btn-open-360"
                    data-building-id="${escapeHtml(selectedBuilding.id)}"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <ellipse cx="12" cy="12" rx="10" ry="4"/>
                      <line x1="12" y1="2" x2="12" y2="22"/>
                    </svg>
                    <span>Vista Interior 360°</span>
                  </button>
                `
                    : ""
                }

                <button
                  type="button"
                  class="btn-ar-from-map"
                  id="btn-open-ar-map"
                  data-building-id="${escapeHtml(selectedBuilding.id)}"
                  data-destination="${escapeHtml(mapSel.highlightRoom || selectedBuilding.name)}"
                  title="Iniciar Guía AR"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  <span>Guía AR</span>
                </button>
              </div>

              ${
                selectedBuilding.isDascBuilding &&
                selectedBuilding.salonesDasc &&
                selectedBuilding.salonesDasc.length > 0
                  ? renderDascSalonesSection(selectedBuilding)
                  : renderGeneralFacilitiesSection(
                      selectedBuilding,
                      buildingEvents,
                      buildingProfessors
                    )
              }
            </aside>
          </div>

          ${state.modal360.isOpen ? render360Modal(state) : ""}
        </section>
      `;

      bindMapEvents(container, state);
      if (state.modal360.isOpen) {
        init360CanvasViewer(container, state);
      }
    }
  };

  function renderDascSalonesSection(building) {
    const salones = building.salonesDasc || [];
    const activeSalon =
      salones.find((s) => s.codigo === selectedSalonCodeInPanel) || salones[0];
    const sqlClassesInSalon = activeSalon
      ? window.DASCStore.getClassesBySalonCodigo(activeSalon.codigo)
      : [];

    const uniqueSubjectsMap = new Map();
    sqlClassesInSalon.forEach((row) => {
      const key = `${row.materia_nombre}|${row.maestro_nombre}|${row.semestre}${row.turno[0]}${row.grupo}`;
      if (!uniqueSubjectsMap.has(key)) {
        uniqueSubjectsMap.set(key, row);
      }
    });
    const assignedClasses = Array.from(uniqueSubjectsMap.values());

    return `
      <div class="dasc-salones-panel">
        <div class="salones-panel-header">
          <span class="entity-tag emerald">SALONES Y LABORATORIOS DASC (${salones.length})</span>
          <h4>Haz clic en un salón de ${escapeHtml(building.code)} para ver su info y clases SQL:</h4>
        </div>

        <div class="salones-Interactive-grid">
          ${salones
            .map((s) => {
              const isSelected = activeSalon && s.codigo === activeSalon.codigo;
              return `
                <button
                  type="button"
                  class="salon-pill-btn ${isSelected ? "active" : ""}"
                  data-select-salon="${escapeHtml(s.codigo)}"
                >
                  <span class="salon-pill-code">${escapeHtml(s.codigo)}</span>
                  <span class="salon-pill-type">${escapeHtml(s.tipo)}</span>
                </button>
              `;
            })
            .join("")}
        </div>

        ${
          activeSalon
            ? `
          <div class="salon-detail-card">
            <div class="salon-detail-top">
              <div>
                <span class="salon-floor-badge">${escapeHtml(activeSalon.planta)} · ${escapeHtml(activeSalon.tipo)}</span>
                <h5>${escapeHtml(activeSalon.codigo)} — ${escapeHtml(activeSalon.nombre)}</h5>
              </div>
            </div>
            <p class="salon-detail-desc">${escapeHtml(activeSalon.detalle)}</p>

            <div class="salon-sql-classes">
              <span class="salon-sql-title">
                Clases registradas en SQL en este salón (${assignedClasses.length} grupos/materias):
              </span>
              ${
                assignedClasses.length > 0
                  ? `
                <div class="salon-sql-list">
                  ${assignedClasses
                    .slice(0, 6)
                    .map(
                      (c) => `
                    <div class="salon-sql-item">
                      <strong>${escapeHtml(c.materia_nombre)} (${escapeHtml(c.semestre)}° ${escapeHtml(c.turno === "Matutino" ? "TM" : "TV")}-${escapeHtml(c.grupo)})</strong>
                      <span>Maestro: ${escapeHtml(c.maestro_nombre)}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : `<p class="salon-sql-empty">Espacio de uso general / eventos académicos del DASC.</p>`
              }
            </div>
          </div>
        `
            : ""
        }

        <div class="building-info-block" style="margin-top: 0.75rem;">
          <h4>Otros Espacios en ${escapeHtml(building.code)}</h4>
          <div class="facility-chips-grid">
            ${(building.facilities || [])
              .map(
                (fac) => `
              <span class="facility-chip" title="${escapeHtml(fac)}">
                ${escapeHtml(fac)}
              </span>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderGeneralFacilitiesSection(
    selectedBuilding,
    buildingEvents,
    buildingProfessors
  ) {
    return `
      <div class="building-info-block">
        <h4>Áreas y Referencias en ${escapeHtml(selectedBuilding.code)} (${selectedBuilding.facilities.length})</h4>
        <div class="facility-chips-grid">
          ${selectedBuilding.facilities
            .map(
              (fac) => `
            <span class="facility-chip" title="${escapeHtml(fac)}">
              ${escapeHtml(fac)}
            </span>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="building-compact-stats">
        <div class="compact-stat-pill">
          <span class="stat-num">${buildingEvents.length}</span>
          <span class="stat-lbl">${buildingEvents.length === 1 ? "Evento vinculado" : "Eventos vinculados"}</span>
        </div>
        <div class="compact-stat-pill">
          <span class="stat-num">${buildingProfessors.length}</span>
          <span class="stat-lbl">Representantes en sede</span>
        </div>
      </div>
    `;
  }

  function render360Modal(state) {
    const building =
      window.DASCStore.getBuildingById(state.modal360.buildingId) ||
      window.DASCStore.getBuildings()[0];
    const pano = building.panorama360;
    if (!pano) return "";
    const activeScene =
      pano.scenes.find((s) => s.id === state.modal360.sceneId) || pano.scenes[0];

    return `
      <div class="modal-360-backdrop" id="modal-360-backdrop" role="dialog" aria-modal="true" aria-label="${escapeHtml(pano.title)}">
        <div class="modal-360-dialog">
          <div class="modal-360-header">
            <div>
              <span class="badge-360-live">VISTA 360° INTERACTIVA · ${escapeHtml(building.code)}</span>
              <h3>${escapeHtml(activeScene.name)}</h3>
              <p>${escapeHtml(activeScene.subtitle)}</p>
            </div>
            <button type="button" class="btn-close-modal" id="btn-close-360" title="Cerrar recorrido 360°">✕</button>
          </div>

          <div class="pano-canvas-container" id="pano-viewport">
            <canvas id="pano-canvas-360" width="960" height="460"></canvas>
            <div class="pano-hotspots-layer" id="pano-hotspots-layer"></div>

            <div class="pano-hud-overlay">
              <span class="pano-hint">Arrastra hacia los lados para girar 360°</span>
              <div class="pano-controls-bar">
                <button type="button" class="btn-pano-ctrl" id="btn-pano-left">◀ Girar Izq</button>
                <button type="button" class="btn-pano-ctrl ${autoRotate360 ? "active" : ""}" id="btn-pano-autorotate">
                  ${autoRotate360 ? "⏸ Pausar Giro" : "▶ Giro Automático"}
                </button>
                <button type="button" class="btn-pano-ctrl" id="btn-pano-right">Girar Der ▶</button>
              </div>
            </div>
          </div>

          <div class="modal-360-footer">
            <span class="scene-selector-label">Espacios en ${escapeHtml(building.shortName)}:</span>
            <div class="scene-chips">
              ${pano.scenes
                .map(
                  (sc) => `
                <button
                  type="button"
                  class="scene-chip-btn ${sc.id === activeScene.id ? "active" : ""}"
                  data-scene-id="${escapeHtml(sc.id)}"
                >
                  ${escapeHtml(sc.name)}
                </button>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindMapEvents(container, state) {
    container.querySelectorAll("[data-map-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategoryFilter = btn.getAttribute("data-map-cat") || "all";
        if (activeCategoryFilter === "dasc") {
          window.DASCStore.selectBuildingInMap("dsc-39");
        } else {
          window.DASCMapView.render(container, window.DASCStore.getState());
        }
      });
    });

    container
      .querySelectorAll("[data-select-building], [data-building-node]")
      .forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const bId =
            el.getAttribute("data-select-building") ||
            el.getAttribute("data-building-node");
          if (bId) {
            selectedSalonCodeInPanel = null;
            window.DASCStore.selectBuildingInMap(bId);
          }
        });
      });

    container.querySelectorAll("[data-select-salon]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedSalonCodeInPanel = btn.getAttribute("data-select-salon");
        window.DASCMapView.render(container, window.DASCStore.getState());
      });
    });

    container.querySelectorAll("[data-map-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const is3D = btn.getAttribute("data-map-mode") === "3d";
        window.DASCStore.setMapMode3D(is3D);
      });
    });

    const tiltRange = container.querySelector("#map-tilt-range");
    if (tiltRange) {
      tiltRange.addEventListener("input", (e) => {
        const deg = Number(e.target.value) || 38;
        const plane = container.querySelector("#dasc-map-plane");
        if (plane) {
          plane.style.transform = `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${state.mapSelection.zoomLevel}) rotateX(${deg}deg) rotateZ(-10deg)`;
        }
      });
      tiltRange.addEventListener("change", (e) => {
        window.DASCStore.setMapTiltAngle(Number(e.target.value) || 38);
      });
    }

    const zoomIn = container.querySelector("#btn-zoom-in");
    const zoomOut = container.querySelector("#btn-zoom-out");
    const zoomReset = container.querySelector("#btn-zoom-reset");

    if (zoomIn) {
      zoomIn.addEventListener("click", () => {
        window.DASCStore.setMapZoom(state.mapSelection.zoomLevel + 0.15);
      });
    }
    if (zoomOut) {
      zoomOut.addEventListener("click", () => {
        window.DASCStore.setMapZoom(state.mapSelection.zoomLevel - 0.15);
      });
    }
    if (zoomReset) {
      zoomReset.addEventListener("click", () => {
        panOffset = { x: 0, y: 0 };
        window.DASCStore.setMapZoom(1.0);
      });
    }

    const viewport = container.querySelector("#dasc-map-viewport");
    const plane = container.querySelector("#dasc-map-plane");

    if (viewport && plane) {
      const startDrag = (clientX, clientY) => {
        isDraggingMap = true;
        dragStart = { x: clientX - panOffset.x, y: clientY - panOffset.y };
        viewport.classList.add("dragging");
      };

      const moveDrag = (clientX, clientY) => {
        if (!isDraggingMap) return;
        panOffset.x = Math.max(-280, Math.min(280, clientX - dragStart.x));
        panOffset.y = Math.max(-240, Math.min(240, clientY - dragStart.y));
        const tilt = state.mapSelection.mode3D
          ? Number(state.mapSelection.tiltAngle || 38)
          : 0;
        const modeTransform = state.mapSelection.mode3D
          ? `rotateX(${tilt}deg) rotateZ(-10deg)`
          : "rotateX(0deg) rotateZ(0deg)";
        plane.style.transform = `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${state.mapSelection.zoomLevel}) ${modeTransform}`;
      };

      const endDrag = () => {
        isDraggingMap = false;
        viewport.classList.remove("dragging");
      };

      viewport.addEventListener("mousedown", (e) => {
        if (e.target.closest("[data-building-node]")) return;
        startDrag(e.clientX, e.clientY);
      });
      window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
      window.addEventListener("mouseup", endDrag);

      viewport.addEventListener(
        "touchstart",
        (e) => {
          if (e.target.closest("[data-building-node]")) return;
          if (e.touches.length === 1) {
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
          }
        },
        { passive: true }
      );
      viewport.addEventListener(
        "touchmove",
        (e) => {
          if (e.touches.length === 1) {
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
          }
        },
        { passive: true }
      );
      viewport.addEventListener("touchend", endDrag);
    }

    const open360Btn = container.querySelector("#btn-open-360");
    if (open360Btn) {
      open360Btn.addEventListener("click", () => {
        const bId = open360Btn.getAttribute("data-building-id");
        window.DASCStore.open360Modal(bId);
      });
    }

    const openArBtn = container.querySelector("#btn-open-ar-map");
    if (openArBtn) {
      openArBtn.addEventListener("click", () => {
        const bId = openArBtn.getAttribute("data-building-id");
        const dest = openArBtn.getAttribute("data-destination");
        window.DASCStore.openARGuide({
          buildingId: bId,
          destinationLabel: dest
        });
      });
    }
  }

  function init360CanvasViewer(container, state) {
    const building =
      window.DASCStore.getBuildingById(state.modal360.buildingId) ||
      window.DASCStore.getBuildings()[0];
    const pano = building.panorama360;
    if (!pano) return;
    const activeScene =
      pano.scenes.find((s) => s.id === state.modal360.sceneId) || pano.scenes[0];

    const canvas = container.querySelector("#pano-canvas-360");
    const hotspotsLayer = container.querySelector("#pano-hotspots-layer");
    const panoViewport = container.querySelector("#pano-viewport");

    if (!canvas || !hotspotsLayer) return;
    const ctx = canvas.getContext("2d");

    const closeBtn = container.querySelector("#btn-close-360");
    const backdrop = container.querySelector("#modal-360-backdrop");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        stopPanoLoop();
        window.DASCStore.close360Modal();
      });
    }
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          stopPanoLoop();
          window.DASCStore.close360Modal();
        }
      });
    }

    container.querySelectorAll("[data-scene-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const scId = btn.getAttribute("data-scene-id");
        panoYaw = 0;
        window.DASCStore.set360Scene(scId);
      });
    });

    const btnLeft = container.querySelector("#btn-pano-left");
    const btnRight = container.querySelector("#btn-pano-right");
    const btnAuto = container.querySelector("#btn-pano-autorotate");

    if (btnLeft) {
      btnLeft.addEventListener("click", () => {
        autoRotate360 = false;
        panoYaw = (panoYaw - 30 + 360) % 360;
      });
    }
    if (btnRight) {
      btnRight.addEventListener("click", () => {
        autoRotate360 = false;
        panoYaw = (panoYaw + 30) % 360;
      });
    }
    if (btnAuto) {
      btnAuto.addEventListener("click", () => {
        autoRotate360 = !autoRotate360;
        btnAuto.textContent = autoRotate360 ? "⏸ Pausar Giro" : "▶ Giro Automático";
        btnAuto.classList.toggle("active", autoRotate360);
      });
    }

    const onPointerDown = (clientX, clientY) => {
      isDraggingPano = true;
      autoRotate360 = false;
      panoDragStart = { x: clientX, y: clientY, yaw: panoYaw, pitch: panoPitch };
    };

    const onPointerMove = (clientX, clientY) => {
      if (!isDraggingPano) return;
      const dx = clientX - panoDragStart.x;
      const dy = clientY - panoDragStart.y;
      panoYaw = (panoDragStart.yaw - dx * 0.35 + 360) % 360;
      panoPitch = Math.max(-25, Math.min(25, panoDragStart.pitch + dy * 0.18));
    };

    const onPointerUp = () => {
      isDraggingPano = false;
    };

    panoViewport.addEventListener("mousedown", (e) => {
      if (e.target.closest(".pano-hotspot-pin") || e.target.closest(".pano-controls-bar")) return;
      onPointerDown(e.clientX, e.clientY);
    });
    window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onPointerUp);

    hotspotsLayer.innerHTML = (activeScene.elements || [])
      .map(
        (el, idx) => `
        <button
          type="button"
          class="pano-hotspot-pin ${el.targetScene ? "is-portal" : ""}"
          data-hotspot-idx="${idx}"
          data-target-scene="${escapeHtml(el.targetScene || "")}"
        >
          <span class="hotspot-icon">${el.targetScene ? "🚪" : "📍"}</span>
          <span class="hotspot-text">${escapeHtml(el.label)}</span>
        </button>
      `
      )
      .join("");

    hotspotsLayer.querySelectorAll(".pano-hotspot-pin").forEach((pin) => {
      pin.addEventListener("click", () => {
        const targetScene = pin.getAttribute("data-target-scene");
        if (targetScene) {
          panoYaw = 0;
          window.DASCStore.set360Scene(targetScene);
        }
      });
    });

    const hotspotNodes = Array.from(hotspotsLayer.querySelectorAll(".pano-hotspot-pin"));

    function renderFrame() {
      if (autoRotate360 && !isDraggingPano) {
        panoYaw = (panoYaw + 0.18) % 360;
      }

      draw360Interior(ctx, canvas.width, canvas.height, activeScene, panoYaw, panoPitch);

      const fov = 110;
      (activeScene.elements || []).forEach((el, idx) => {
        const node = hotspotNodes[idx];
        if (!node) return;
        let deltaYaw = ((el.yaw - panoYaw + 540) % 360) - 180;
        if (Math.abs(deltaYaw) <= fov / 2) {
          const xPct = 50 + (deltaYaw / (fov / 2)) * 46;
          const yPct = 50 - ((el.pitch - panoPitch) / 45) * 35;
          node.style.display = "inline-flex";
          node.style.left = `${xPct}%`;
          node.style.top = `${yPct}%`;
        } else {
          node.style.display = "none";
        }
      });

      panoAnimFrame = requestAnimationFrame(renderFrame);
    }

    renderFrame();
  }

  function draw360Interior(ctx, w, h, scene, yaw, pitch) {
    ctx.clearRect(0, 0, w, h);
    const horizonY = h * 0.5 + pitch * 4.2;

    const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    ceilGrad.addColorStop(0, "#070b14");
    ceilGrad.addColorStop(1, "#111b2e");
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, w, horizonY);

    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    floorGrad.addColorStop(0, "#0f172a");
    floorGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    const wallTop = horizonY - 125;
    const wallBottom = horizonY + 95;
    const wallGrad = ctx.createLinearGradient(0, wallTop, 0, wallBottom);
    wallGrad.addColorStop(0, scene.themeColor || "#1e3a8a");
    wallGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, wallTop, w, wallBottom - wallTop);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1.5;
    const fov = 110;
    for (let deg = 0; deg < 360; deg += 30) {
      let delta = ((deg - yaw + 540) % 360) - 180;
      if (Math.abs(delta) <= fov / 1.6) {
        const x = w / 2 + (delta / (fov / 2)) * (w * 0.48);
        ctx.beginPath();
        ctx.moveTo(x, wallTop);
        ctx.lineTo(x, wallBottom);
        ctx.stroke();

        ctx.fillStyle = "rgba(245, 158, 11, 0.75)";
        ctx.font = "600 11px system-ui, sans-serif";
        ctx.fillText(`${deg}°`, x - 10, wallTop - 10);
      }
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
