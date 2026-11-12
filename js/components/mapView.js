/**
 * mapView.js
 * Sistema Cartográfico Integral Maps UABCS - DASC:
 * 1. Mapa Interactivo 2D / 3D (MapLibre GL + Google Maps Satélite Híbrido / Google Calles / Vector SIIA + Control de Profundidad 2D↔3D + Ruteo Peatonal Dijkstra)
 * 2. Plano Oficial Campus La Paz 2022 (PDF) y Croquis de Talleres DASC
 */

(function () {
  let mapInstance = null;
  let mapLoaded = false;
  let currentPopup = null;
  let activeBaseStyle = "satelite"; // 'satelite' | 'google_calles' | 'oscuro' | 'claro'
  let depthPct = 85; // 0 = 2D plano, 100 = 3D máximo
  let usePaletaSIIA = true;
  let showAulaPins = true;
  let showEventPins = true;
  let isRotating360 = false;
  let rotateAnimId = null;
  let aulaMarkers = [];
  let eventMarkers = [];
  let routeMarkers = [];
  let activeRouteOrigin = "entrada-principal";
  let userGpsCoords = null;
  let userLocationMarker = null;
  let gpsBannerTimeout = null;
  let currentRouteData = null;

  // Estado del panel lateral
  let activeSidebarTab = "dasc"; // 'dasc' | 'campus' | 'eventos'
  let searchQuery = "";
  let selectedPlantaFilter = "all";
  let selectedCampusCat = "todas";

  const BASE_STYLES = {
    satelite: {
      name: "Google Satélite + 3D",
      type: "raster",
      tiles: [
        "https://mt0.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}",
        "https://mt1.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}"
      ]
    },
    google_calles: {
      name: "Google Calles + 3D",
      type: "raster",
      tiles: [
        "https://mt0.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}",
        "https://mt1.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}"
      ]
    },
    oscuro: {
      name: "Vector 3D Oscuro",
      type: "vector",
      url: "https://tiles.openfreemap.org/styles/dark"
    },
    claro: {
      name: "Vector 3D Claro",
      type: "vector",
      url: "https://tiles.openfreemap.org/styles/positron"
    }
  };

  function getRasterStyleObject(tiles) {
    return {
      version: 8,
      glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
      sources: {
        "raster-tiles": {
          type: "raster",
          tiles: tiles,
          tileSize: 256,
          maxzoom: 20,
          attribution: "© Google Maps · UABCS Campus La Paz"
        }
      },
      layers: [
        {
          id: "raster-layer",
          type: "raster",
          source: "raster-tiles",
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };
  }

  window.DASCMapView = {
    render(container, state) {
      const sel = state.mapSelection || {};
      const subMode = sel.mapSubMode === "pdf" ? "pdf" : "interactive";

      // Si el shell ya existe y estamos en el mismo subModo, actualizamos dinámicamente sin destruir el WebGL
      const existingShell = container.querySelector("#dasc-map-pro-shell");
      if (existingShell && existingShell.getAttribute("data-submode") === subMode) {
        updateHeaderModeButtons(container, subMode);
        if (subMode === "interactive") {
          renderSidebarContent(container, state);
          renderDetailBottomCard(container, state);
          if (sel.autoTriggered) {
            focusSelectedTargetOnMap(state);
          }
          return;
        }
      }

      // Si estamos montando un contenedor nuevo o cambiando de subModo, limpiar instancias previas
      if (mapInstance) {
        stopRotation360();
        try {
          mapInstance.remove();
        } catch (e) {}
        mapInstance = null;
        mapLoaded = false;
      }

      const totalEdificios =
        (window.CAMPUS && window.CAMPUS.edificios.filter((e) => !e.esVialidad).length) || 49;
      const totalAulas =
        (window.AULAS_DASC && (window.AULAS_DASC.salones || window.AULAS_DASC.aulas || []).length) || 23;

      container.innerHTML = `
        <section class="view-section map-pro-section" id="dasc-map-pro-shell" data-submode="${escapeHtml(subMode)}">
          <!-- Cabecera Principal con Logo Maps UABCS con Alta Prioridad y Controles -->
          <div class="map-pro-topbar">
            <div class="map-pro-brand">
              <img src="./favicon.png" alt="Maps UABCS" class="map-pro-logo" />
              <div>
                <div class="map-pro-eyebrow">
                  <span class="eyebrow-dot gold"></span>
                  <span>CARTOGRAFÍA OFICIAL CAMPUS LA PAZ · GOOGLE MAPS + MAPLIBRE 3D + RUTEO PEATONAL</span>
                </div>
                <h2>Maps UABCS · ${totalEdificios} Edificios SIIA y ${totalAulas} Aulas/Labs DASC Geolocalizados</h2>
              </div>
            </div>

            <div class="map-pro-mode-tabs" role="tablist">
              <button
                type="button"
                class="map-mode-tab-btn ${subMode === "interactive" ? "active" : ""}"
                data-map-submode="interactive"
              >
                <i class="bi bi-globe-americas"></i>
                <span>Mapa Google / 3D SIIA</span>
              </button>
              <button
                type="button"
                class="map-mode-tab-btn ${subMode === "pdf" ? "active" : ""}"
                data-map-submode="pdf"
              >
                <i class="bi bi-file-earmark-pdf-fill"></i>
                <span>Plano Oficial PDF</span>
              </button>
              <button
                type="button"
                class="map-mode-tab-btn ar-launch-tab"
                id="btn-map-topbar-ar"
              >
                <i class="bi bi-compass-fill"></i>
                <span>Guía Cámara AR + GPS</span>
              </button>
            </div>
          </div>

          <!-- Cuerpo Dinámico según el Modo Seleccionado -->
          <div class="map-pro-body">
            ${
              subMode === "interactive"
                ? renderInteractiveMapLayout()
                : renderPdfLayout()
            }
          </div>
        </section>
      `;

      bindTopbarEvents(container, state);

      if (subMode === "interactive") {
        renderSidebarContent(container, state);
        renderDetailBottomCard(container, state);
        initMapLibreEngine(container, state);
      }
    }
  };

  function updateHeaderModeButtons(container, subMode) {
    container.querySelectorAll("[data-map-submode]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-map-submode") === subMode);
    });
  }

  function bindTopbarEvents(container, state) {
    container.querySelectorAll("[data-map-submode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetMode = btn.getAttribute("data-map-submode");
        window.DASCStore.setMapSubMode(targetMode);
      });
    });

    const arBtn = container.querySelector("#btn-map-topbar-ar");
    if (arBtn) {
      arBtn.addEventListener("click", () => {
        const sel = state.mapSelection || {};
        const bldg = window.DASCStore.getBuildingById(sel.buildingId || "dsc-39");
        window.DASCStore.openARGuide({
          buildingId: bldg ? bldg.id : "dsc-39",
          destinationLabel: sel.highlightRoom || (bldg ? bldg.name : "Edificio DSC-39"),
          aulaId: sel.aulaId || sel.highlightRoom
        });
      });
    }
  }

  // =========================================================================
  // MAPA INTERACTIVO 2D / 3D (GOOGLE SATÉLITE + MAPLIBRE 3D + RUTAS)
  // =========================================================================
  function renderInteractiveMapLayout() {
    const puntosAcceso = (window.CAMPUS_RUTAS && window.CAMPUS_RUTAS.puntosAcceso) || [];

    return `
      <div class="map-interactive-grid">
        <!-- Panel Lateral Izquierdo: Buscador, Salones DASC (23), Edificios Campus (49) y Eventos -->
        <aside class="map-pro-sidebar">
          <div class="map-sidebar-tabs" role="tablist">
            <button type="button" class="sidebar-tab-btn ${activeSidebarTab === "dasc" ? "active" : ""}" data-side-tab="dasc">
              <i class="bi bi-cpu-fill"></i>
              <span>Aulas DASC (23)</span>
            </button>
            <button type="button" class="sidebar-tab-btn ${activeSidebarTab === "campus" ? "active" : ""}" data-side-tab="campus">
              <i class="bi bi-buildings-fill"></i>
              <span>Campus (49)</span>
            </button>
            <button type="button" class="sidebar-tab-btn ${activeSidebarTab === "eventos" ? "active" : ""}" data-side-tab="eventos">
              <i class="bi bi-calendar-event-fill"></i>
              <span>Eventos</span>
            </button>
          </div>

          <!-- Buscador Inteligente -->
          <div class="map-sidebar-search">
            <i class="bi bi-search search-icon"></i>
            <input
              type="search"
              id="map-pro-search-input"
              placeholder="Buscar salón (LAB A, SC2-JAVA, LR), edificio o clave..."
              value="${escapeHtml(searchQuery)}"
            />
          </div>

          <!-- Calculadora de Ruta Peatonal en el Campus -->
          <div class="map-route-planner-box">
            <div class="route-planner-head">
              <span><i class="bi bi-sign-turn-right-fill"></i> Ruteo Peatonal Campus</span>
              <button type="button" class="btn-gps-origin" id="btn-use-real-gps" title="Usar mi ubicación GPS actual">
                <i class="bi bi-crosshair"></i> Mi GPS
              </button>
            </div>
            <div class="route-planner-controls">
              <label for="select-route-origin">Desde:</label>
              <select id="select-route-origin">
                <option value="gps" ${activeRouteOrigin === "gps" ? "selected" : ""}>📍 Mi Ubicación GPS en Vivo</option>
                <option value="click" ${activeRouteOrigin === "click" ? "selected" : ""}>🎯 Seleccionar en el mapa (Clic)</option>
                ${puntosAcceso
                  .map(
                    (p) => `
                  <option value="${escapeHtml(p.id)}" ${activeRouteOrigin === p.id ? "selected" : ""}>
                    ${escapeHtml(p.nombre)}
                  </option>
                `
                  )
                  .join("")}
              </select>
              <button type="button" class="btn-clear-route" id="btn-clear-map-route" title="Limpiar ruta trazada" style="${currentRouteData ? "" : "display:none;"}">
                ✕
              </button>
            </div>
            <div id="map-route-summary-banner" class="map-route-summary-banner" style="${currentRouteData ? "" : "display:none;"}">
              ${
                currentRouteData
                  ? `<strong>${currentRouteData.distanciaM} m</strong> · ~${currentRouteData.tiempoMin} min caminando hacia <span>${escapeHtml(currentRouteData.destinoNombre || "Destino")}</span>`
                  : ""
              }
            </div>
          </div>

          <!-- Lista Dinámica de Elementos -->
          <div id="map-sidebar-list-container" class="map-sidebar-list"></div>
        </aside>

        <!-- Columna Derecha: Viewport Cartográfico MapLibre GL + Controles Flotantes + Ficha Inferior -->
        <div class="map-pro-main-col">
          <div class="map-canvas-wrapper">
            <div id="dasc-maplibre-canvas" class="dasc-maplibre-canvas"></div>

            <!-- Banner Flotante de Estado GPS / Ubicación en Tiempo Real -->
            <div id="map-gps-banner" class="map-gps-banner" style="display: none;"></div>

            <!-- Barra Superior Flotante: Selector de Mapa Base (Google Satélite, Google Calles, Vector Oscuro/Claro) -->
            <div class="map-floating-basemaps">
              <button type="button" class="basemap-pill ${activeBaseStyle === "satelite" ? "active" : ""}" data-base-style="satelite">
                <i class="bi bi-globe-americas"></i> Google Satélite + 3D
              </button>
              <button type="button" class="basemap-pill ${activeBaseStyle === "google_calles" ? "active" : ""}" data-base-style="google_calles">
                <i class="bi bi-map-fill"></i> Google Calles + 3D
              </button>
              <button type="button" class="basemap-pill ${activeBaseStyle === "oscuro" ? "active" : ""}" data-base-style="oscuro">
                <i class="bi bi-moon-stars-fill"></i> Vector 3D Oscuro
              </button>
              <button type="button" class="basemap-pill ${activeBaseStyle === "claro" ? "active" : ""}" data-base-style="claro">
                <i class="bi bi-sun-fill"></i> Vector 3D Claro
              </button>
            </div>

            <!-- Barra Flotante Izquierda: Herramientas (Mi Ubicación GPS, Aulas DASC, Paleta SIIA, Eventos, Rotar, Centrar DASC) -->
            <div class="map-floating-tools">
              <button type="button" class="map-tool-chip btn-locate-chip" id="btn-map-locate-me" title="Localizar mi ubicación GPS en vivo en el mapa">
                <i class="bi bi-crosshair"></i> Mi Ubicación GPS
              </button>
              <button type="button" class="map-tool-chip ${showAulaPins ? "active" : ""}" id="btn-toggle-aula-pins" title="Mostrar/Ocultar los 23 pines de laboratorios y salones del DASC">
                <i class="bi bi-geo-alt-fill"></i> Aulas DASC (23)
              </button>
              <button type="button" class="map-tool-chip ${usePaletaSIIA ? "active" : ""}" id="btn-toggle-paleta-siia" title="Alternar entre Acabados Arquitectónicos SIIA y Colores por Área">
                <i class="bi bi-palette2"></i> ${usePaletaSIIA ? "Acabados SIIA" : "Color por Área"}
              </button>
              <button type="button" class="map-tool-chip ${showEventPins ? "active" : ""}" id="btn-toggle-event-pins" title="Mostrar/Ocultar pines de eventos y talleres">
                <i class="bi bi-stars"></i> Eventos
              </button>
              <button type="button" class="map-tool-chip" id="btn-fly-dasc-zone" title="Enfocar zona de edificios de Sistemas (DSC-39 y DSC-46)">
                <i class="bi bi-cpu"></i> Zona DASC
              </button>
              <button type="button" class="map-tool-chip" id="btn-fly-full-campus" title="Ver todo el Campus La Paz UABCS">
                <i class="bi bi-arrows-fullscreen"></i> Todo el Campus
              </button>
              <button type="button" class="map-tool-chip ${isRotating360 ? "active" : ""}" id="btn-rotate-360-map" title="Rotación orbital automática 360°">
                <i class="bi bi-arrow-repeat"></i> Girar 360°
              </button>
            </div>

            <!-- Control Flotante de Profundidad 2D ⟷ 3D (Scroll o Slider) -->
            <div class="map-depth-widget" id="map-depth-widget" title="Usa el deslizador o Alt + Rueda del ratón para controlar la extrusión e inclinación 3D">
              <div class="depth-widget-top">
                <span class="depth-widget-title">
                  <i class="bi bi-layers-half"></i> PROFUNDIDAD 2D ⟷ 3D
                </span>
                <span class="depth-widget-badge" id="map-depth-badge">${depthPct}% · ${depthPct === 0 ? "2D PLANO" : "3D SIIA"}</span>
              </div>
              <div class="depth-slider-line">
                <span class="depth-lbl">2D</span>
                <input type="range" id="dasc-depth-slider" min="0" max="100" step="1" value="${depthPct}" />
                <span class="depth-lbl">3D</span>
              </div>
              <div class="depth-presets">
                <button type="button" class="depth-preset-btn ${depthPct === 0 ? "active" : ""}" data-depth-val="0">2D Plano</button>
                <button type="button" class="depth-preset-btn ${depthPct > 0 && depthPct < 80 ? "active" : ""}" data-depth-val="50">Semi 3D</button>
                <button type="button" class="depth-preset-btn ${depthPct >= 80 ? "active" : ""}" data-depth-val="100">3D Máx</button>
              </div>
            </div>
          </div>

          <!-- Ficha Inferior de Detalle del Edificio / Salón Seleccionado + Clases SQL -->
          <div id="map-bottom-detail-card" class="map-bottom-detail-card"></div>
        </div>
      </div>
    `;
  }

  function renderSidebarContent(container, state) {
    const listEl = container.querySelector("#map-sidebar-list-container");
    if (!listEl) return;

    const sel = state.mapSelection || {};
    const q = searchQuery.trim().toLowerCase();

    if (activeSidebarTab === "dasc") {
      const aulas = (window.AULAS_DASC && window.AULAS_DASC.salones) || [];
      const filteredAulas = aulas.filter((a) => {
        const matchPlanta =
          selectedPlantaFilter === "all" ||
          String(a.planta).toLowerCase().includes(selectedPlantaFilter.toLowerCase()) ||
          String(a.edificioCodigo).toLowerCase() === selectedPlantaFilter.toLowerCase();
        const matchQ =
          !q ||
          a.codigo.toLowerCase().includes(q) ||
          a.nombre.toLowerCase().includes(q) ||
          a.edificioCodigo.toLowerCase().includes(q) ||
          a.tipo.toLowerCase().includes(q);
        return matchPlanta && matchQ;
      });

      listEl.innerHTML = `
        <div class="sidebar-filter-chips">
          <button type="button" class="mini-filter-chip ${selectedPlantaFilter === "all" ? "active" : ""}" data-planta-filter="all">Todos (${aulas.length})</button>
          <button type="button" class="mini-filter-chip ${selectedPlantaFilter === "DSC-39" ? "active" : ""}" data-planta-filter="DSC-39">DSC-39</button>
          <button type="button" class="mini-filter-chip ${selectedPlantaFilter === "DSC-46" ? "active" : ""}" data-planta-filter="DSC-46">DSC-46</button>
          <button type="button" class="mini-filter-chip ${selectedPlantaFilter === "Planta Baja" ? "active" : ""}" data-planta-filter="Planta Baja">P. Baja</button>
          <button type="button" class="mini-filter-chip ${selectedPlantaFilter === "Planta Alta" ? "active" : ""}" data-planta-filter="Planta Alta">P. Alta</button>
        </div>

        <div class="sidebar-items-stack">
          ${filteredAulas
            .map((aula) => {
              const isSelected =
                sel.aulaId === aula.id ||
                (sel.highlightRoom &&
                  String(sel.highlightRoom).toUpperCase().includes(aula.codigo.toUpperCase()));
              const classesInRoom = window.DASCStore.getClassesBySalonCodigo(aula.codigo);

              return `
                <article
                  class="map-side-card ${isSelected ? "active" : ""}"
                  data-select-aula="${escapeHtml(aula.id)}"
                  data-aula-bldg="${escapeHtml(aula.edificioLegacy)}"
                >
                  <div class="side-card-top">
                    <span class="side-code-badge" style="background:${escapeHtml(aula.color)};">${escapeHtml(aula.codigo)}</span>
                    <span class="side-meta-pill">${escapeHtml(aula.edificioCodigo)} · ${escapeHtml(aula.planta)}</span>
                  </div>
                  <h4>${escapeHtml(aula.nombre)}</h4>
                  <p>${escapeHtml(aula.tipo)} · Cap. ${aula.capacidad} alumnos · ${classesInRoom.length} bloques SQL</p>
                  <div class="side-card-actions">
                    <button type="button" class="btn-mini-map" data-route-aula="${escapeHtml(aula.id)}" title="Trazar ruta peatonal hasta este salón">
                      <i class="bi bi-sign-turn-right"></i> Ruta
                    </button>
                    <button type="button" class="btn-mini-map ar" data-ar-aula="${escapeHtml(aula.id)}" title="Guiarme con Cámara AR + GPS">
                      <i class="bi bi-compass"></i> AR
                    </button>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      `;
    } else if (activeSidebarTab === "campus") {
      const edificios =
        (window.CAMPUS && window.CAMPUS.edificios.filter((e) => !e.esVialidad)) || [];
      const cats = (window.CAMPUS && window.CAMPUS.categorias) || {};

      const filteredEd = edificios.filter((e) => {
        const matchCat = selectedCampusCat === "todas" || e.categoria === selectedCampusCat;
        const matchQ =
          !q ||
          e.nombre.toLowerCase().includes(q) ||
          String(e.codigoMapa || "").toLowerCase().includes(q) ||
          String(e.descripcion || "").toLowerCase().includes(q);
        return matchCat && matchQ;
      });

      listEl.innerHTML = `
        <div class="sidebar-filter-chips">
          ${Object.entries(cats)
            .map(
              ([key, info]) => `
            <button type="button" class="mini-filter-chip ${selectedCampusCat === key ? "active" : ""}" data-campus-cat="${escapeHtml(key)}">
              ${escapeHtml(info.label)}
            </button>
          `
            )
            .join("")}
        </div>

        <div class="sidebar-items-stack">
          ${filteredEd
            .map((ed) => {
              const isSelected = sel.campusId === ed.id || sel.buildingId === ed.id;
              return `
                <article
                  class="map-side-card with-thumb ${isSelected ? "active" : ""}"
                  data-select-campus-bldg="${escapeHtml(ed.id)}"
                >
                  <img src="${escapeHtml(ed.imagen || "./img/uabcs.jpg")}" alt="${escapeHtml(ed.nombre)}" class="side-card-thumb" loading="lazy" onerror="this.src='./img/uabcs.jpg'" />
                  <div class="side-card-body">
                    <div class="side-card-top">
                      <span class="side-code-badge" style="background:${escapeHtml(ed.color)};">${escapeHtml(ed.codigoMapa || "UABCS")}</span>
                      <span class="side-meta-pill">${ed.pisos || 1} Niv. · ${ed.alturaM || 5}m</span>
                    </div>
                    <h4>${escapeHtml(ed.nombre)}</h4>
                    <p>${escapeHtml(String(ed.descripcion || "").slice(0, 82))}...</p>
                    <div class="side-card-actions">
                      <button type="button" class="btn-mini-map" data-route-bldg="${escapeHtml(ed.id)}">
                        <i class="bi bi-sign-turn-right"></i> Ruta
                      </button>
                      <button type="button" class="btn-mini-map ar" data-ar-bldg="${escapeHtml(ed.id)}">
                        <i class="bi bi-compass"></i> AR
                      </button>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      `;
    } else {
      const eventos =
        (window.EVENTOS_UABCS && window.EVENTOS_UABCS.lista) || state.events || [];
      listEl.innerHTML = `
        <div class="sidebar-items-stack">
          ${eventos
            .map(
              (ev) => `
            <article class="map-side-card" data-select-event="${escapeHtml(ev.id)}" data-event-bldg="${escapeHtml(ev.edificioId || ev.buildingId || "dasc")}">
              <div class="side-card-top">
                <span class="side-code-badge" style="background:${escapeHtml(ev.colorBadge || "#F59E0B")};">${escapeHtml(ev.categoriaLabel || ev.category || "Evento")}</span>
                <span class="side-meta-pill">${escapeHtml(ev.horaTexto || ev.date || "")}</span>
              </div>
              <h4>${escapeHtml(ev.titulo || ev.title)}</h4>
              <p><i class="bi bi-geo-alt-fill"></i> ${escapeHtml(ev.lugarNombre || ev.locationDetail)}</p>
            </article>
          `
            )
            .join("")}
        </div>
      `;
    }

    bindSidebarDynamicEvents(container, state);
  }

  function bindSidebarDynamicEvents(container, state) {
    // Cambio de pestaña en sidebar
    container.querySelectorAll("[data-side-tab]").forEach((btn) => {
      btn.onclick = () => {
        activeSidebarTab = btn.getAttribute("data-side-tab") || "dasc";
        container.querySelectorAll("[data-side-tab]").forEach((b) =>
          b.classList.toggle("active", b.getAttribute("data-side-tab") === activeSidebarTab)
        );
        renderSidebarContent(container, state);
      };
    });

    // Buscador
    const searchInput = container.querySelector("#map-pro-search-input");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value || "";
        renderSidebarContent(container, state);
      };
    }

    // Selector de origen de ruta
    const originSel = container.querySelector("#select-route-origin");
    if (originSel) {
      originSel.onchange = (e) => {
        activeRouteOrigin = e.target.value;
        if (activeRouteOrigin === "gps") {
          requestUserGpsForMap(container, state);
        } else if (currentRouteData && currentRouteData.targetCoords) {
          drawPedestrianRouteOnMap(
            currentRouteData.targetCoords,
            currentRouteData.destinoNombre,
            container
          );
        }
      };
    }

    const btnGpsOrigin = container.querySelector("#btn-use-real-gps");
    if (btnGpsOrigin) {
      btnGpsOrigin.onclick = () => {
        activeRouteOrigin = "gps";
        if (originSel) originSel.value = "gps";
        requestUserGpsForMap(container, state);
      };
    }

    const btnClearRoute = container.querySelector("#btn-clear-map-route");
    if (btnClearRoute) {
      btnClearRoute.onclick = () => {
        clearPedestrianRouteOnMap(container);
      };
    }

    // Filtros de planta DASC
    container.querySelectorAll("[data-planta-filter]").forEach((btn) => {
      btn.onclick = () => {
        selectedPlantaFilter = btn.getAttribute("data-planta-filter") || "all";
        renderSidebarContent(container, state);
      };
    });

    // Filtros de categoría Campus
    container.querySelectorAll("[data-campus-cat]").forEach((btn) => {
      btn.onclick = () => {
        selectedCampusCat = btn.getAttribute("data-campus-cat") || "todas";
        renderSidebarContent(container, state);
      };
    });

    // Selección de Aula DASC
    container.querySelectorAll("[data-select-aula]").forEach((card) => {
      card.onclick = (e) => {
        if (e.target.closest("button")) return;
        const aulaId = card.getAttribute("data-select-aula");
        const aulaObj = window.AULAS_DASC && window.AULAS_DASC.buscar(aulaId);
        if (aulaObj) {
          window.DASCStore.focusBuildingOnMap({
            buildingId: aulaObj.edificioLegacy,
            highlightRoom: `${aulaObj.codigo} (${aulaObj.nombre})`,
            aulaId: aulaObj.id
          });
        }
      };
    });

    // Botones rápidos dentro de tarjeta de aula
    container.querySelectorAll("[data-route-aula]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const aulaObj = window.AULAS_DASC && window.AULAS_DASC.buscar(btn.getAttribute("data-route-aula"));
        if (aulaObj) {
          window.DASCStore.selectBuildingInMap(aulaObj.edificioLegacy, `${aulaObj.codigo} (${aulaObj.nombre})`, aulaObj.id);
          drawPedestrianRouteOnMap(aulaObj.coords, `${aulaObj.codigo} · ${aulaObj.nombre}`, container);
        }
      };
    });

    container.querySelectorAll("[data-ar-aula]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const aulaObj = window.AULAS_DASC && window.AULAS_DASC.buscar(btn.getAttribute("data-ar-aula"));
        if (aulaObj) {
          window.DASCStore.openARGuide({
            buildingId: aulaObj.edificioLegacy,
            destinationLabel: `${aulaObj.codigo} · ${aulaObj.nombre}`,
            aulaId: aulaObj.id,
            coords: aulaObj.coords
          });
        }
      };
    });

    // Selección de Edificio del Campus
    container.querySelectorAll("[data-select-campus-bldg]").forEach((card) => {
      card.onclick = (e) => {
        if (e.target.closest("button")) return;
        const bldgId = card.getAttribute("data-select-campus-bldg");
        window.DASCStore.focusBuildingOnMap({ buildingId: bldgId });
      };
    });

    container.querySelectorAll("[data-route-bldg]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const bldgId = btn.getAttribute("data-route-bldg");
        const bldg = window.DASCStore.getBuildingById(bldgId);
        if (bldg && bldg.centro) {
          window.DASCStore.selectBuildingInMap(bldg.id);
          drawPedestrianRouteOnMap(bldg.centro, `${bldg.name} (${bldg.code})`, container);
        }
      };
    });

    container.querySelectorAll("[data-ar-bldg]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const bldgId = btn.getAttribute("data-ar-bldg");
        const bldg = window.DASCStore.getBuildingById(bldgId);
        if (bldg) {
          window.DASCStore.openARGuide({
            buildingId: bldg.id,
            destinationLabel: `${bldg.name} (${bldg.code})`,
            coords: bldg.centro
          });
        }
      };
    });

    // Selección de Evento
    container.querySelectorAll("[data-select-event]").forEach((card) => {
      card.onclick = () => {
        const bldgId = card.getAttribute("data-event-bldg") || "dasc";
        window.DASCStore.focusBuildingOnMap({ buildingId: bldgId });
      };
    });
  }

  function renderDetailBottomCard(container, state) {
    const detailEl = container.querySelector("#map-bottom-detail-card");
    if (!detailEl) return;

    const sel = state.mapSelection || {};
    const selectedBldg =
      window.DASCStore.getBuildingById(sel.buildingId || sel.campusId || "dsc-39") ||
      window.DASCStore.getBuildings()[0];

    const matchedAula =
      window.AULAS_DASC && (sel.aulaId || sel.highlightRoom)
        ? window.AULAS_DASC.buscar(sel.aulaId || sel.highlightRoom)
        : null;

    const salonCodeForSql = matchedAula
      ? matchedAula.codigo
      : sel.highlightRoom
      ? String(sel.highlightRoom).split("(")[0].split("·")[0].trim()
      : null;

    const sqlClasses = salonCodeForSql
      ? window.DASCStore.getClassesBySalonCodigo(salonCodeForSql)
      : [];

    detailEl.innerHTML = `
      <div class="bottom-detail-inner">
        <img
          src="${escapeHtml(selectedBldg.imagen || "./img/recorrido/edificio-sistemas.jpg")}"
          alt="${escapeHtml(selectedBldg.name)}"
          class="bottom-detail-photo"
          onerror="this.src='./img/uabcs.jpg'"
        />

        <div class="bottom-detail-info">
          <div class="bottom-detail-badges">
            <span class="bldg-code-pill" style="background:${escapeHtml(selectedBldg.color || "#3B82F6")};">
              Clave SIIA: ${escapeHtml(selectedBldg.code)}
            </span>
            <span class="bldg-meta-pill">
              <i class="bi bi-layers"></i> ${escapeHtml(selectedBldg.levels)} (${selectedBldg.alturaM || 7}m)
            </span>
            <span class="bldg-meta-pill">
              <i class="bi bi-clock"></i> ${escapeHtml(selectedBldg.schedule)}
            </span>
            ${
              matchedAula
                ? `<span class="aula-highlight-pill"><i class="bi bi-geo-alt-fill"></i> Aula Activa: ${escapeHtml(matchedAula.codigo)} · ${escapeHtml(matchedAula.nombre)} (${escapeHtml(matchedAula.planta)})</span>`
                : ""
            }
          </div>

          <h3>${escapeHtml(selectedBldg.name)}</h3>
          <p>${escapeHtml(matchedAula ? matchedAula.referenciaAcceso : selectedBldg.description)}</p>

          ${
            sqlClasses.length > 0
              ? `
            <div class="bottom-sql-classes-strip">
              <span class="sql-strip-label"><i class="bi bi-database-check"></i> Clases SQL en ${escapeHtml(salonCodeForSql)} (${sqlClasses.length}):</span>
              <div class="sql-strip-chips">
                ${sqlClasses
                  .slice(0, 4)
                  .map(
                    (c) => `
                  <span class="sql-mini-chip">
                    <strong>${escapeHtml(c.materia_nombre)}</strong> (${c.semestre}° ${escapeHtml(c.turno.slice(0, 3))}-${escapeHtml(c.grupo)} · ${escapeHtml(c.dia.slice(0, 3))})
                  </span>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
        </div>

        <div class="bottom-detail-actions">
          <button type="button" class="btn-primary btn-sm-action" id="btn-detail-draw-route">
            <i class="bi bi-sign-turn-right-fill"></i>
            <span>Trazar Ruta Peatonal</span>
          </button>
          <button type="button" class="btn-action-ar btn-sm-action" id="btn-detail-open-ar">
            <i class="bi bi-compass-fill"></i>
            <span>Guía Cámara AR + GPS</span>
          </button>
        </div>
      </div>
    `;

    const targetCoords =
      (matchedAula && matchedAula.coords) || selectedBldg.centro || [24.10275, -110.31602];
    const targetLabel = matchedAula
      ? `${matchedAula.codigo} · ${matchedAula.nombre}`
      : `${selectedBldg.name} (${selectedBldg.code})`;

    const routeBtn = detailEl.querySelector("#btn-detail-draw-route");
    if (routeBtn) {
      routeBtn.onclick = () => {
        drawPedestrianRouteOnMap(targetCoords, targetLabel, container);
      };
    }

    const arBtn = detailEl.querySelector("#btn-detail-open-ar");
    if (arBtn) {
      arBtn.onclick = () => {
        window.DASCStore.openARGuide({
          buildingId: selectedBldg.id,
          destinationLabel: targetLabel,
          aulaId: matchedAula ? matchedAula.id : null,
          coords: targetCoords
        });
      };
    }
  }

  // =========================================================================
  // MOTOR MAPLIBRE GL 2D / 3D SIIA + CAPAS GOOGLE SATÉLITE / CALLES
  // =========================================================================
  function initMapLibreEngine(container, state) {
    const mapCanvas = container.querySelector("#dasc-maplibre-canvas");
    if (!mapCanvas || typeof maplibregl === "undefined") return;

    const sel = state.mapSelection || {};
    const initialBldg =
      window.DASCStore.getBuildingById(sel.buildingId || "dsc-39") ||
      window.DASCStore.getBuildings()[0];
    const initialCenter = initialBldg.centro
      ? [initialBldg.centro[1], initialBldg.centro[0]]
      : [-110.31595, 24.10255];

    const styleConf = BASE_STYLES[activeBaseStyle] || BASE_STYLES.satelite;
    const initialStyle =
      styleConf.type === "raster" ? getRasterStyleObject(styleConf.tiles) : styleConf.url;

    mapInstance = new maplibregl.Map({
      container: mapCanvas,
      style: initialStyle,
      center: initialCenter,
      zoom: 17.6,
      pitch: Math.round((depthPct / 100) * 58),
      bearing: -20,
      antialias: true,
      maxPitch: 65
    });

    mapInstance.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    const geolocateCtrl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true, timeout: 15000 },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true
    });
    mapInstance.addControl(geolocateCtrl, "bottom-right");

    geolocateCtrl.on("geolocate", (e) => {
      handleUserGpsSuccess(e.coords.latitude, e.coords.longitude, e.coords.accuracy, container);
    });

    geolocateCtrl.on("error", (err) => {
      handleUserGpsError(err, container);
    });

    mapInstance.on("load", () => {
      mapLoaded = true;
      addCampus3DLayers();
      renderAulaMarkersOnMap(container);
      renderEventMarkersOnMap(container);
      apply3DDepthFactor(depthPct, false, container);

      const latestState = window.DASCStore.getState();
      if (latestState.mapSelection && latestState.mapSelection.autoTriggered) {
        focusSelectedTargetOnMap(latestState);
      }
    });

    // Eventos de barra de estilos base
    container.querySelectorAll("[data-base-style]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const styleKey = btn.getAttribute("data-base-style");
        if (!BASE_STYLES[styleKey] || styleKey === activeBaseStyle) return;
        activeBaseStyle = styleKey;
        container.querySelectorAll("[data-base-style]").forEach((b) =>
          b.classList.toggle("active", b.getAttribute("data-base-style") === activeBaseStyle)
        );
        const nextStyle =
          BASE_STYLES[styleKey].type === "raster"
            ? getRasterStyleObject(BASE_STYLES[styleKey].tiles)
            : BASE_STYLES[styleKey].url;
        mapInstance.setStyle(nextStyle);
        mapInstance.once("styledata", () => {
          setTimeout(() => {
            addCampus3DLayers();
            apply3DDepthFactor(depthPct, false, container);
            if (currentRouteData) {
              renderRouteGeoJsonLayer(currentRouteData.waypoints);
            }
          }, 180);
        });
      });
    });

    // Eventos de herramientas flotantes
    const btnLocateMe = container.querySelector("#btn-map-locate-me");
    if (btnLocateMe) {
      btnLocateMe.addEventListener("click", () => {
        activeRouteOrigin = "gps";
        const originSel = container.querySelector("#select-route-origin");
        if (originSel) originSel.value = "gps";
        requestUserGpsForMap(container, window.DASCStore.getState());
      });
    }

    const btnAulaPins = container.querySelector("#btn-toggle-aula-pins");
    if (btnAulaPins) {
      btnAulaPins.addEventListener("click", () => {
        showAulaPins = !showAulaPins;
        btnAulaPins.classList.toggle("active", showAulaPins);
        renderAulaMarkersOnMap(container);
      });
    }

    const btnPaleta = container.querySelector("#btn-toggle-paleta-siia");
    if (btnPaleta) {
      btnPaleta.addEventListener("click", () => {
        usePaletaSIIA = !usePaletaSIIA;
        btnPaleta.classList.toggle("active", usePaletaSIIA);
        btnPaleta.innerHTML = `<i class="bi bi-palette2"></i> ${
          usePaletaSIIA ? "Acabados SIIA" : "Color por Área"
        }`;
        if (mapInstance && mapInstance.getLayer("uabcs-edificios-3d")) {
          mapInstance.setPaintProperty(
            "uabcs-edificios-3d",
            "fill-extrusion-color",
            usePaletaSIIA ? ["get", "colorSIIA"] : ["get", "color"]
          );
        }
      });
    }

    const btnEvents = container.querySelector("#btn-toggle-event-pins");
    if (btnEvents) {
      btnEvents.addEventListener("click", () => {
        showEventPins = !showEventPins;
        btnEvents.classList.toggle("active", showEventPins);
        renderEventMarkersOnMap(container);
      });
    }

    const btnFlyDasc = container.querySelector("#btn-fly-dasc-zone");
    if (btnFlyDasc) {
      btnFlyDasc.addEventListener("click", () => {
        stopRotation360();
        mapInstance.flyTo({
          center: [-110.31602, 24.10275],
          zoom: 18.8,
          pitch: Math.max(45, Math.round((depthPct / 100) * 58)),
          bearing: -18,
          duration: 1200
        });
      });
    }

    const btnFlyCampus = container.querySelector("#btn-fly-full-campus");
    if (btnFlyCampus) {
      btnFlyCampus.addEventListener("click", () => {
        stopRotation360();
        mapInstance.flyTo({
          center: [-110.31595, 24.10245],
          zoom: 16.5,
          pitch: Math.round((depthPct / 100) * 52),
          bearing: -15,
          duration: 1200
        });
      });
    }

    const btnRotate = container.querySelector("#btn-rotate-360-map");
    if (btnRotate) {
      btnRotate.addEventListener("click", () => {
        if (isRotating360) {
          stopRotation360();
          btnRotate.classList.remove("active");
        } else {
          isRotating360 = true;
          btnRotate.classList.add("active");
          const spin = () => {
            if (!isRotating360 || !mapInstance) return;
            mapInstance.rotateTo((mapInstance.getBearing() + 0.18) % 360, { duration: 0 });
            rotateAnimId = requestAnimationFrame(spin);
          };
          spin();
        }
      });
    }

    // Control de profundidad 2D <-> 3D (Slider, Presets y Rueda del Ratón)
    const depthSlider = container.querySelector("#dasc-depth-slider");
    if (depthSlider) {
      depthSlider.addEventListener("input", (e) => {
        apply3DDepthFactor(Number(e.target.value), true, container);
      });
    }

    container.querySelectorAll("[data-depth-val]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.getAttribute("data-depth-val"));
        apply3DDepthFactor(val, true, container);
      });
    });

    const depthWidget = container.querySelector("#map-depth-widget");
    if (depthWidget) {
      depthWidget.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          const step = e.deltaY < 0 ? 8 : -8;
          apply3DDepthFactor(depthPct + step, false, container);
        },
        { passive: false }
      );
    }

    mapCanvas.addEventListener(
      "wheel",
      (e) => {
        if (!e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        const step = e.deltaY < 0 ? 8 : -8;
        apply3DDepthFactor(depthPct + step, false, container);
      },
      { passive: false }
    );
  }

  function addCampus3DLayers() {
    if (!mapInstance || !window.CAMPUS) return;

    const geojsonArq = window.CAMPUS.geojsonArquitecturaSIIA();
    const geojsonUrb = window.CAMPUS.geojsonUrbanismoSIIA();
    const geojsonEdificios = window.CAMPUS.geojson();
    const geojsonLabels = window.CAMPUS.geojsonEtiquetas();

    if (!mapInstance.getSource("uabcs-urbanismo-siia")) {
      mapInstance.addSource("uabcs-urbanismo-siia", { type: "geojson", data: geojsonUrb });
    }
    if (!mapInstance.getSource("uabcs-campus")) {
      mapInstance.addSource("uabcs-campus", { type: "geojson", data: geojsonEdificios });
    }
    if (!mapInstance.getSource("uabcs-arquitectura-siia")) {
      mapInstance.addSource("uabcs-arquitectura-siia", { type: "geojson", data: geojsonArq });
    }
    if (!mapInstance.getSource("uabcs-labels")) {
      mapInstance.addSource("uabcs-labels", { type: "geojson", data: geojsonLabels });
    }

    // 1. Urbanismo SIIA
    if (!mapInstance.getLayer("uabcs-urbanismo-3d")) {
      mapInstance.addLayer({
        id: "uabcs-urbanismo-3d",
        type: "fill-extrusion",
        source: "uabcs-urbanismo-siia",
        paint: {
          "fill-extrusion-color": ["get", "colorSIIA"],
          "fill-extrusion-height": ["get", "alturaM"],
          "fill-extrusion-base": ["get", "baseM"],
          "fill-extrusion-opacity": 0.9
        }
      });
    }

    // 2. Huella base y contorno de edificios
    if (!mapInstance.getLayer("uabcs-edificios-footprint")) {
      mapInstance.addLayer({
        id: "uabcs-edificios-footprint",
        type: "fill",
        source: "uabcs-campus",
        filter: ["!=", ["get", "esVialidad"], true],
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.22
        }
      });
    }

    if (!mapInstance.getLayer("uabcs-edificios-outline")) {
      mapInstance.addLayer({
        id: "uabcs-edificios-outline",
        type: "line",
        source: "uabcs-campus",
        filter: ["!=", ["get", "esVialidad"], true],
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2.2,
          "line-opacity": 0.92
        }
      });
    }

    // 3. Volúmenes 3D SIIA Multi-cuerpo
    if (!mapInstance.getLayer("uabcs-edificios-3d")) {
      mapInstance.addLayer({
        id: "uabcs-edificios-3d",
        type: "fill-extrusion",
        source: "uabcs-arquitectura-siia",
        paint: {
          "fill-extrusion-color": usePaletaSIIA ? ["get", "colorSIIA"] : ["get", "color"],
          "fill-extrusion-height": ["get", "alturaM"],
          "fill-extrusion-base": ["get", "baseM"],
          "fill-extrusion-opacity": 0.94,
          "fill-extrusion-vertical-gradient": true
        }
      });
    }

    // 4. Etiquetas de edificios con Clave SIIA
    if (!mapInstance.getLayer("uabcs-edificios-labels")) {
      mapInstance.addLayer({
        id: "uabcs-edificios-labels",
        type: "symbol",
        source: "uabcs-labels",
        minzoom: 15.8,
        layout: {
          "text-field": [
            "format",
            ["concat", "[", ["get", "codigoMapa"], "] "],
            { "font-scale": 0.78 },
            ["get", "nombre"],
            { "font-scale": 0.9 }
          ],
          "text-size": ["interpolate", ["linear"], ["zoom"], 16, 10, 18.5, 13],
          "text-anchor": "center",
          "text-max-width": 11,
          "text-allow-overlap": false
        },
        paint: {
          "text-color": "#F8FAFC",
          "text-halo-color": "rgba(15, 23, 42, 0.95)",
          "text-halo-width": 2.2
        }
      });
    }

    // Clic sobre cualquier edificio 3D o huella 2D
    const handleBuildingClick = (e) => {
      if (!e.features || !e.features.length) return;
      const props = e.features[0].properties;
      if (props.esVialidad === true || props.esVialidad === "true") return;
      const edId = props.id;
      window.DASCStore.selectBuildingInMap(edId);
      openBuildingPopupOnMap(edId, e.lngLat);
    };

    mapInstance.on("click", "uabcs-edificios-3d", handleBuildingClick);
    mapInstance.on("click", "uabcs-edificios-footprint", handleBuildingClick);

    mapInstance.on("mouseenter", "uabcs-edificios-3d", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });
    mapInstance.on("mouseleave", "uabcs-edificios-3d", () => {
      mapInstance.getCanvas().style.cursor = "";
    });

    // Clic libre en el mapa para fijar ubicación cuando el origen es "click" o con Shift + Clic
    mapInstance.on("click", (e) => {
      if (activeRouteOrigin === "click" || e.originalEvent.shiftKey) {
        handleUserGpsSuccess(e.lngLat.lat, e.lngLat.lng, 2, container);
      }
    });
  }

  function apply3DDepthFactor(newPct, animatePitch = false, container = document) {
    depthPct = Math.max(0, Math.min(100, Math.round(Number(newPct) || 0)));
    const factor = depthPct / 100;

    const slider = container.querySelector("#dasc-depth-slider");
    if (slider && Number(slider.value) !== depthPct) {
      slider.value = depthPct;
    }

    const badge = container.querySelector("#map-depth-badge");
    if (badge) {
      badge.textContent = `${depthPct}% · ${
        depthPct === 0 ? "2D PLANO" : depthPct < 55 ? "SEMI 3D" : "3D SIIA"
      }`;
    }

    container.querySelectorAll("[data-depth-val]").forEach((btn) => {
      const v = Number(btn.getAttribute("data-depth-val"));
      const isMatch =
        (v === 0 && depthPct === 0) ||
        (v === 50 && depthPct > 0 && depthPct < 80) ||
        (v === 100 && depthPct >= 80);
      btn.classList.toggle("active", isMatch);
    });

    if (!mapInstance || !mapLoaded) return;

    const targetPitch = Math.round(factor * 58);
    if (animatePitch) {
      mapInstance.easeTo({ pitch: targetPitch, duration: 280 });
    } else {
      mapInstance.setPitch(targetPitch);
    }

    if (mapInstance.getLayer("uabcs-edificios-3d")) {
      mapInstance.setPaintProperty(
        "uabcs-edificios-3d",
        "fill-extrusion-height",
        factor <= 0.01 ? 0 : ["*", ["get", "alturaM"], factor]
      );
      mapInstance.setPaintProperty(
        "uabcs-edificios-3d",
        "fill-extrusion-base",
        factor <= 0.01 ? 0 : ["*", ["get", "baseM"], factor]
      );
      mapInstance.setPaintProperty(
        "uabcs-edificios-3d",
        "fill-extrusion-opacity",
        factor <= 0.02 ? 0.0 : Math.min(0.95, 0.35 + factor * 0.6)
      );
    }

    if (mapInstance.getLayer("uabcs-urbanismo-3d")) {
      mapInstance.setPaintProperty(
        "uabcs-urbanismo-3d",
        "fill-extrusion-height",
        factor <= 0.01 ? 0 : ["*", ["get", "alturaM"], factor]
      );
      mapInstance.setPaintProperty(
        "uabcs-urbanismo-3d",
        "fill-extrusion-base",
        factor <= 0.01 ? 0 : ["*", ["get", "baseM"], factor]
      );
    }

    if (mapInstance.getLayer("uabcs-edificios-footprint")) {
      mapInstance.setPaintProperty(
        "uabcs-edificios-footprint",
        "fill-opacity",
        factor <= 0.15 ? 0.58 : 0.22
      );
    }
  }

  function renderAulaMarkersOnMap(container) {
    aulaMarkers.forEach((m) => m.remove());
    aulaMarkers = [];

    if (!showAulaPins || !mapInstance || !window.AULAS_DASC) return;

    window.AULAS_DASC.salones.forEach((aula) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "dasc-aula-map-pin";
      el.style.setProperty("--pin-color", aula.color || "#3B82F6");
      el.innerHTML = `<i class="bi ${escapeHtml(aula.icono || "bi-pc-display")}"></i><span>${escapeHtml(aula.codigo)}</span>`;
      el.title = `${aula.codigo} · ${aula.nombre} (${aula.edificioCodigo} - ${aula.planta})`;

      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        window.DASCStore.focusBuildingOnMap({
          buildingId: aula.edificioLegacy,
          highlightRoom: `${aula.codigo} (${aula.nombre})`,
          aulaId: aula.id
        });
        openAulaPopupOnMap(aula, container);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([aula.coords[1], aula.coords[0]])
        .addTo(mapInstance);

      aulaMarkers.push(marker);
    });
  }

  function renderEventMarkersOnMap(container) {
    eventMarkers.forEach((m) => m.remove());
    eventMarkers = [];

    if (!showEventPins || !mapInstance || !window.EVENTOS_UABCS) return;

    window.EVENTOS_UABCS.lista.forEach((ev) => {
      if (!ev.coords) return;
      const el = document.createElement("button");
      el.type = "button";
      el.className = "dasc-event-map-pin";
      el.style.setProperty("--evt-color", ev.colorBadge || "#F59E0B");
      el.innerHTML = `<i class="bi ${escapeHtml(ev.icono || "bi-stars")}"></i>`;
      el.title = `${ev.titulo} · ${ev.lugarNombre}`;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentPopup) currentPopup.remove();
        currentPopup = new maplibregl.Popup({ maxWidth: "310px", offset: 16 })
          .setLngLat([ev.coords[1], ev.coords[0]])
          .setHTML(`
            <div class="dasc-map-popup">
              <div class="popup-head-badges">
                <span class="popup-code-tag" style="background:${escapeHtml(ev.colorBadge || "#F59E0B")};">${escapeHtml(ev.categoriaLabel)}</span>
                <span class="popup-floor-tag">${escapeHtml(ev.horaTexto)}</span>
              </div>
              <h4>${escapeHtml(ev.titulo)}</h4>
              <p><strong>Sede:</strong> ${escapeHtml(ev.lugarNombre)}</p>
              <p>${escapeHtml(ev.descripcion)}</p>
            </div>
          `)
          .addTo(mapInstance);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([ev.coords[1], ev.coords[0]])
        .addTo(mapInstance);

      eventMarkers.push(marker);
    });
  }

  function openAulaPopupOnMap(aula, container) {
    if (!mapInstance) return;
    if (currentPopup) currentPopup.remove();

    const classesInRoom = window.DASCStore.getClassesBySalonCodigo(aula.codigo);
    const popupHtml = `
      <div class="dasc-map-popup">
        <div class="popup-head-badges">
          <span class="popup-code-tag" style="background:${escapeHtml(aula.color)};">${escapeHtml(aula.codigo)}</span>
          <span class="popup-floor-tag">${escapeHtml(aula.edificioCodigo)} · ${escapeHtml(aula.planta)}</span>
        </div>
        <h4>${escapeHtml(aula.nombre)}</h4>
        <p>${escapeHtml(aula.referenciaAcceso)}</p>
        <div class="popup-equip-chips">
          ${(aula.equipamiento || [])
            .map((eq) => `<span>${escapeHtml(eq)}</span>`)
            .join("")}
        </div>
        <div class="popup-sql-count">
          <i class="bi bi-database-check"></i> ${classesInRoom.length} bloques de clase registrados en SQL
        </div>
        <div class="popup-btn-row-2">
          <button type="button" class="popup-action-btn route" id="popup-btn-route-aula">
            <i class="bi bi-sign-turn-right"></i> Ruta Peatonal
          </button>
          <button type="button" class="popup-action-btn ar" id="popup-btn-ar-aula">
            <i class="bi bi-compass"></i> Guía AR
          </button>
        </div>
      </div>
    `;

    currentPopup = new maplibregl.Popup({ maxWidth: "330px", offset: 18 })
      .setLngLat([aula.coords[1], aula.coords[0]])
      .setHTML(popupHtml)
      .addTo(mapInstance);

    setTimeout(() => {
      const btnR = document.getElementById("popup-btn-route-aula");
      if (btnR) {
        btnR.onclick = () => {
          drawPedestrianRouteOnMap(aula.coords, `${aula.codigo} · ${aula.nombre}`, container);
        };
      }
      const btnA = document.getElementById("popup-btn-ar-aula");
      if (btnA) {
        btnA.onclick = () => {
          window.DASCStore.openARGuide({
            buildingId: aula.edificioLegacy,
            destinationLabel: `${aula.codigo} · ${aula.nombre}`,
            aulaId: aula.id,
            coords: aula.coords
          });
        };
      }
    }, 40);
  }

  function openBuildingPopupOnMap(edId, lngLat) {
    if (!mapInstance) return;
    const bldg = window.DASCStore.getBuildingById(edId);
    if (!bldg) return;

    if (currentPopup) currentPopup.remove();
    const coords = lngLat || [bldg.centro[1], bldg.centro[0]];

    const popupHtml = `
      <div class="dasc-map-popup">
        <img src="${escapeHtml(bldg.imagen || "./img/uabcs.jpg")}" alt="${escapeHtml(bldg.name)}" class="popup-photo" onerror="this.src='./img/uabcs.jpg'" />
        <div class="popup-head-badges">
          <span class="popup-code-tag" style="background:${escapeHtml(bldg.color)};">Clave: ${escapeHtml(bldg.code)}</span>
          <span class="popup-floor-tag">${escapeHtml(bldg.levels)}</span>
        </div>
        <h4>${escapeHtml(bldg.name)}</h4>
        <p>${escapeHtml(String(bldg.description || "").slice(0, 120))}...</p>
        <div class="popup-btn-row-2">
          <button type="button" class="popup-action-btn route" id="popup-btn-route-bldg">
            <i class="bi bi-sign-turn-right"></i> Ruta Peatonal
          </button>
          <button type="button" class="popup-action-btn ar" id="popup-btn-ar-bldg">
            <i class="bi bi-compass"></i> Guía AR
          </button>
        </div>
      </div>
    `;

    currentPopup = new maplibregl.Popup({ maxWidth: "320px", offset: 16 })
      .setLngLat(coords)
      .setHTML(popupHtml)
      .addTo(mapInstance);

    setTimeout(() => {
      const container = document.getElementById("dasc-map-pro-shell") || document;
      const btnR = document.getElementById("popup-btn-route-bldg");
      if (btnR) {
        btnR.onclick = () => {
          drawPedestrianRouteOnMap(bldg.centro, `${bldg.name} (${bldg.code})`, container);
        };
      }
      const btnA = document.getElementById("popup-btn-ar-bldg");
      if (btnA) {
        btnA.onclick = () => {
          window.DASCStore.openARGuide({
            buildingId: bldg.id,
            destinationLabel: `${bldg.name} (${bldg.code})`,
            coords: bldg.centro
          });
        };
      }
    }, 40);
  }

  function focusSelectedTargetOnMap(state) {
    if (!mapInstance || !mapLoaded) return;
    stopRotation360();

    const sel = state.mapSelection || {};
    const matchedAula =
      window.AULAS_DASC && (sel.aulaId || sel.highlightRoom)
        ? window.AULAS_DASC.buscar(sel.aulaId || sel.highlightRoom)
        : null;

    if (matchedAula && matchedAula.coords) {
      mapInstance.flyTo({
        center: [matchedAula.coords[1], matchedAula.coords[0]],
        zoom: 19.1,
        pitch: Math.max(48, Math.round((depthPct / 100) * 58)),
        bearing: -15,
        duration: 1100
      });
      const container = document.getElementById("dasc-map-pro-shell") || document;
      openAulaPopupOnMap(matchedAula, container);
      return;
    }

    const bldg = window.DASCStore.getBuildingById(sel.buildingId || sel.campusId || "dsc-39");
    if (bldg && bldg.centro) {
      mapInstance.flyTo({
        center: [bldg.centro[1], bldg.centro[0]],
        zoom: 18.2,
        pitch: Math.max(42, Math.round((depthPct / 100) * 58)),
        bearing: -18,
        duration: 1100
      });
      openBuildingPopupOnMap(bldg.id, [bldg.centro[1], bldg.centro[0]]);
    }
  }

  // =========================================================================
  // GESTIÓN Y TRAZADO DE GEOLOCALIZACIÓN GPS EN TIEMPO REAL
  // =========================================================================
  function showMapGpsBanner(msg, type = "info", duration = 6000, container = document) {
    const banner = container.querySelector("#map-gps-banner");
    if (!banner) return;
    if (gpsBannerTimeout) clearTimeout(gpsBannerTimeout);
    banner.className = `map-gps-banner ${type}`;
    banner.innerHTML = msg;
    banner.style.display = "flex";
    if (duration > 0) {
      gpsBannerTimeout = setTimeout(() => {
        banner.style.display = "none";
      }, duration);
    }
  }

  function handleUserGpsSuccess(lat, lng, accuracy = 5, container = document) {
    userGpsCoords = [lat, lng];
    const acc = Math.round(accuracy || 5);
    const originSel = container.querySelector("#select-route-origin");

    // Actualizar o crear marcador azul de usuario en MapLibre
    if (mapInstance) {
      if (!userLocationMarker) {
        const el = document.createElement("div");
        el.className = "maplibre-user-marker";
        el.innerHTML = `<div class="maplibre-user-pulse"></div><div class="maplibre-user-dot"></div>`;
        userLocationMarker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapInstance);
      } else {
        userLocationMarker.setLngLat([lng, lat]);
      }

      mapInstance.flyTo({
        center: [lng, lat],
        zoom: 18.2,
        duration: 1200
      });
    }

    const distCampusM =
      window.CAMPUS_RUTAS &&
      window.CAMPUS_RUTAS.distanciaMetros([lat, lng], [24.10255, -110.31595]);

    if (distCampusM !== null && distCampusM <= 2500) {
      let closest = null, minD = 999999;
      (window.CAMPUS.edificios || []).forEach((e) => {
        if (e.centro) {
          const d = window.CAMPUS_RUTAS.distanciaMetros([lat, lng], e.centro);
          if (d < minD) { minD = d; closest = e; }
        }
      });
      showMapGpsBanner(
        `<i class="bi bi-geo-alt-fill" style="color:#10B981;"></i> <span>Ubicación detectada (±${acc}m): Cerca de <strong>${closest ? escapeHtml(closest.nombre) : "Campus UABCS"}</strong></span>`,
        "success",
        6000,
        container
      );
    } else {
      const km = Math.round((distCampusM || 3000) / 1000);
      showMapGpsBanner(
        `<i class="bi bi-info-circle-fill" style="color:#38BDF8;"></i> <span>Ubicación detectada (±${acc}m): Te encuentras a <strong>${km} km</strong> del Campus UABCS.</span> <button type="button" class="btn-snap-campus-pill" id="btn-snap-banner-campus">Colocarme en Entrada Principal</button>`,
        "info",
        10000,
        container
      );

      const snapBtn = container.querySelector("#btn-snap-banner-campus");
      if (snapBtn) {
        snapBtn.onclick = () => {
          userGpsCoords = [24.10112, -110.31618];
          activeRouteOrigin = "entrada-principal";
          if (originSel) originSel.value = "entrada-principal";
          if (userLocationMarker) userLocationMarker.setLngLat([-110.31618, 24.10112]);
          if (mapInstance) mapInstance.flyTo({ center: [-110.31618, 24.10112], zoom: 18 });
          showMapGpsBanner(`📍 Posición colocada en Entrada Principal UABCS (Simulación)`, "success", 4000, container);

          const sel = window.DASCStore.getState().mapSelection || {};
          const matchedAula = window.AULAS_DASC && (sel.aulaId || sel.highlightRoom) ? window.AULAS_DASC.buscar(sel.aulaId || sel.highlightRoom) : null;
          const bldg = window.DASCStore.getBuildingById(sel.buildingId || "dsc-39");
          const destCoords = (matchedAula && matchedAula.coords) || (bldg && bldg.centro) || [24.10275, -110.31602];
          const destName = matchedAula ? `${matchedAula.codigo} · ${matchedAula.nombre}` : (bldg ? bldg.name : "Edificio DSC-39");
          drawPedestrianRouteOnMap(destCoords, destName, container);
        };
      }
    }

    const sel = window.DASCStore.getState().mapSelection || {};
    const matchedAula =
      window.AULAS_DASC && (sel.aulaId || sel.highlightRoom)
        ? window.AULAS_DASC.buscar(sel.aulaId || sel.highlightRoom)
        : null;
    const bldg = window.DASCStore.getBuildingById(sel.buildingId || "dsc-39");
    const destCoords =
      (matchedAula && matchedAula.coords) ||
      (bldg && bldg.centro) || [24.10275, -110.31602];
    const destName = matchedAula
      ? `${matchedAula.codigo} · ${matchedAula.nombre}`
      : bldg
      ? bldg.name
      : "Edificio DSC-39";

    if (activeRouteOrigin === "gps" || activeRouteOrigin === "click") {
      drawPedestrianRouteOnMap(destCoords, destName, container);
    }
  }

  function handleUserGpsError(err, container = document) {
    let msg = "";
    if (err && err.code === 1) {
      msg = `<strong>Permiso denegado:</strong> Tu navegador tiene bloqueada la ubicación. Haz clic en el 🔒 o configuración junto a la URL y activa "Ubicación".`;
    } else if (err && err.code === 2) {
      msg = `<strong>Señal no disponible:</strong> Enciende la ubicación en tu dispositivo o Windows. O haz clic en cualquier lugar del mapa para colocarte.`;
    } else if (err && err.code === 3) {
      msg = `<strong>Tiempo de espera agotado:</strong> No se pudo conectar a los satélites GPS. Haz clic en el mapa para ubicarte manualmente.`;
    } else if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      msg = `<strong>Restricción del navegador (HTTP):</strong> Al abrir en celular por IP local (http://192.168...), el navegador bloquea el GPS por no ser HTTPS. En PC abre http://localhost:3000 o haz clic en el mapa para ubicarte.`;
    } else {
      msg = `<strong>Ubicación no detectada:</strong> (${err && err.message ? err.message : 'Error desconocido'}). Haz clic en cualquier andador para ubicarte.`;
    }
    showMapGpsBanner(`<i class="bi bi-exclamation-triangle-fill" style="color:#EF4444;"></i> <span>${msg}</span>`, "error", 9000, container);
  }

  function requestUserGpsForMap(container, state) {
    if (!navigator.geolocation) {
      handleUserGpsError({ code: 2, message: "Geolocalización no soportada en este navegador" }, container);
      return;
    }
    showMapGpsBanner(`<i class="bi bi-arrow-repeat spin"></i> <span>Detectando tu ubicación GPS con satélites en vivo...</span>`, "info", 0, container);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleUserGpsSuccess(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, container);
      },
      (err) => {
        handleUserGpsError(err, container);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  function drawPedestrianRouteOnMap(destCoords, destinoNombre, container = document) {
    if (!window.CAMPUS_RUTAS || !mapInstance) return;

    let originCoords = [24.10112, -110.31618]; // Entrada principal por defecto
    if ((activeRouteOrigin === "gps" || activeRouteOrigin === "click") && userGpsCoords) {
      originCoords = userGpsCoords;
    } else {
      const acceso = (window.CAMPUS_RUTAS.puntosAcceso || []).find(
        (p) => p.id === activeRouteOrigin
      );
      if (acceso) originCoords = acceso.coords;
    }

    const ruta = window.CAMPUS_RUTAS.calcularRuta(originCoords, destCoords);
    currentRouteData = {
      ...ruta,
      targetCoords: destCoords,
      destinoNombre: destinoNombre || "Destino"
    };

    renderRouteGeoJsonLayer(ruta.waypoints);

    const banner = container.querySelector("#map-route-summary-banner");
    if (banner) {
      banner.style.display = "block";
      banner.innerHTML = `<strong>${ruta.distanciaM} m</strong> · ~${ruta.tiempoMin} min caminando hacia <span>${escapeHtml(destinoNombre)}</span>`;
    }

    const clearBtn = container.querySelector("#btn-clear-map-route");
    if (clearBtn) clearBtn.style.display = "inline-flex";

    if (ruta.waypoints && ruta.waypoints.length >= 2) {
      const bounds = new maplibregl.LngLatBounds();
      ruta.waypoints.forEach((pt) => bounds.extend([pt[1], pt[0]]));
      mapInstance.fitBounds(bounds, {
        padding: { top: 70, bottom: 90, left: 70, right: 70 },
        pitch: Math.max(35, Math.round((depthPct / 100) * 52)),
        duration: 1000
      });
    }
  }

  function renderRouteGeoJsonLayer(waypoints) {
    if (!mapInstance || !waypoints || waypoints.length < 2) return;

    const coordsLngLat = waypoints.map((pt) => [pt[1], pt[0]]);
    const geojson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordsLngLat
      }
    };

    if (mapInstance.getSource("uabcs-pedestrian-route")) {
      mapInstance.getSource("uabcs-pedestrian-route").setData(geojson);
    } else {
      mapInstance.addSource("uabcs-pedestrian-route", {
        type: "geojson",
        data: geojson
      });

      mapInstance.addLayer({
        id: "uabcs-pedestrian-route-glow",
        type: "line",
        source: "uabcs-pedestrian-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#38BDF8",
          "line-width": 10,
          "line-opacity": 0.35
        }
      });

      mapInstance.addLayer({
        id: "uabcs-pedestrian-route-line",
        type: "line",
        source: "uabcs-pedestrian-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#F59E0B",
          "line-width": 4.5,
          "line-dasharray": [2, 1.5]
        }
      });
    }

    routeMarkers.forEach((m) => m.remove());
    routeMarkers = [];

    const startEl = document.createElement("div");
    startEl.className = "route-endpoint-pin start";
    startEl.innerHTML = `<i class="bi bi-person-walking"></i>`;
    const endEl = document.createElement("div");
    endEl.className = "route-endpoint-pin end";
    endEl.innerHTML = `<i class="bi bi-flag-fill"></i>`;

    routeMarkers.push(
      new maplibregl.Marker({ element: startEl })
        .setLngLat(coordsLngLat[0])
        .addTo(mapInstance),
      new maplibregl.Marker({ element: endEl })
        .setLngLat(coordsLngLat[coordsLngLat.length - 1])
        .addTo(mapInstance)
    );
  }

  function clearPedestrianRouteOnMap(container = document) {
    currentRouteData = null;
    routeMarkers.forEach((m) => m.remove());
    routeMarkers = [];
    if (mapInstance && mapInstance.getSource("uabcs-pedestrian-route")) {
      mapInstance.getSource("uabcs-pedestrian-route").setData({
        type: "FeatureCollection",
        features: []
      });
    }
    const banner = container.querySelector("#map-route-summary-banner");
    if (banner) banner.style.display = "none";
    const clearBtn = container.querySelector("#btn-clear-map-route");
    if (clearBtn) clearBtn.style.display = "none";
  }

  function stopRotation360() {
    isRotating360 = false;
    if (rotateAnimId) {
      cancelAnimationFrame(rotateAnimId);
      rotateAnimId = null;
    }
  }

  // =========================================================================
  // PLANO OFICIAL PDF 2022 + CROQUIS DE TALLERES
  // =========================================================================
  function renderPdfLayout() {
    return `
      <div class="pdf-official-layout">
        <div class="pdf-toolbar-strip">
          <div>
            <span class="vr-live-pill"><i class="bi bi-file-earmark-pdf-fill"></i> NOMENCLATURA OFICIAL SIIA 2022</span>
            <h3>Plano Oficial del Campus La Paz UABCS y Croquis de Talleres DASC</h3>
          </div>
          <div class="pdf-toolbar-btns">
            <a href="./img/Mapa-Campus-La-Paz-2022.pdf" download="Mapa-Campus-La-Paz-2022.pdf" class="btn-primary btn-sm-action">
              <i class="bi bi-download"></i> Descargar PDF Oficial
            </a>
            <a href="./img/eventos/mapa_talleres.jpg" target="_blank" rel="noopener" class="btn-secondary-tech btn-sm-action">
              <i class="bi bi-image"></i> Ver Mapa de Talleres DASC ↗
            </a>
          </div>
        </div>
        <div class="pdf-split-view">
          <iframe src="./img/Mapa-Campus-La-Paz-2022.pdf" class="pdf-embed-frame" title="Plano Oficial Campus La Paz 2022"></iframe>
          <div class="pdf-talleres-card">
            <h4>Croquis Oficial de Laboratorios y Talleres DASC</h4>
            <img src="./img/eventos/mapa_talleres.jpg" alt="Mapa de Talleres DASC" class="talleres-preview-img" />
          </div>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
