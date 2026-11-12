/**
 * arView.js
 * Sistema de Navegación Peatonal por Realidad Aumentada (AR), GPS Real, Brújula Magnética y Ruteo Leaflet
 * Basado en la arquitectura de uabcsMaps/MapaAR.html e integrado con:
 * - window.AULAS_DASC (23 salones y laboratorios del DASC geolocalizados)
 * - window.CAMPUS (49 edificios del Campus La Paz con polígonos reales)
 * - window.CAMPUS_RUTAS (Motor de ruteo peatonal Dijkstra por andadores de la UABCS)
 * - Horario SQL del estudiante (clases activas por semestre y grupo)
 */

(function () {
  let cameraStream = null;
  let cameraActive = false;
  let gpsWatchId = null;
  let gpsRealActive = false;
  let compassRealActive = false;
  let orientationHandler = null;
  let animFrameId = null;
  let walkSimInterval = null;

  // Coordenadas actuales del usuario (por defecto: Entrada Principal / Andador hacia Sistemas)
  let userLat = 24.10185;
  let userLng = -110.31605;
  let userAccuracy = 4;

  // Rumbo de la cámara (0 = Norte, 90 = Este, 180 = Sur, 270 = Oeste)
  let cameraHeading = 15;
  let cameraPitch = 0;

  // Destino actual resuelto
  let currentDestination = null;
  let currentRoute = null;

  // Instancia de mapa Leaflet en el visor AR
  let arLeafletMap = null;
  let arTileLayer = null;
  let arSatelliteMode = true;
  let userMarker = null;
  let visionConePolygon = null;
  let routePolyline = null;
  let routeWaypointsLayer = null;
  let destMarker = null;

  // Pestaña activa en el selector de destinos del panel derecho
  let activeDestTab = "sql"; // 'sql' | 'aulas' | 'edificios'
  let destSearchQuery = "";

  // Dragging en el canvas para girar brújula en PC
  let isDraggingCanvas = false;
  let dragStartX = 0;
  let dragStartHeading = 0;

  window.DASCARView = {
    render(container, state) {
      if (!state.arOverlayActive || !state.arTarget) {
        stopAllArResources();
        container.style.display = "none";
        container.innerHTML = "";
        return;
      }

      container.style.display = "block";
      resolveDestinationFromTarget(state.arTarget);

      // Si el shell AR ya está montado, sólo actualizamos destino y ruta sin reiniciar la cámara
      const existingShell = container.querySelector("#dasc-ar-pro-shell");
      if (existingShell) {
        recalculateArRoute();
        updateArDomMetadata(container);
        renderDestinationList(container, state);
        return;
      }

      const puntosAcceso = (window.CAMPUS_RUTAS && window.CAMPUS_RUTAS.puntosAcceso) || [];

      container.innerHTML = `
        <div class="ar-pro-overlay" id="dasc-ar-pro-shell" role="dialog" aria-modal="true" aria-label="Navegación AR Maps UABCS">
          <!-- Barra Superior AR con Logo Maps UABCS y Estado de Sensores -->
          <header class="ar-pro-topbar">
            <div class="ar-pro-brand">
              <img src="./favicon.png" alt="Logo Maps UABCS" class="ar-pro-logo" />
              <div>
                <div class="ar-pro-kicker">
                  <span class="ar-live-dot"></span>
                  <span>NAVEGACIÓN AR + GPS + RUTEO PEATONAL DIJKSTRA</span>
                </div>
                <h3 id="ar-top-dest-title">${escapeHtml(currentDestination.label)}</h3>
              </div>
            </div>

            <div class="ar-sensor-pills">
              <span class="ar-sensor-pill" id="ar-pill-gps">
                <i class="bi bi-geo-alt-fill"></i>
                <span>Modo Campus (Simulación / GPS)</span>
              </span>
              <span class="ar-sensor-pill" id="ar-pill-compass">
                <i class="bi bi-compass-fill"></i>
                <span id="ar-pill-compass-txt">Rumbo: ${Math.round(cameraHeading)}°</span>
              </span>
              <button type="button" class="btn-ar-activate-sensors" id="btn-ar-enable-sensors" title="Activar Cámara Trasera, GPS Real y Giroscopio/Brújula del celular">
                <i class="bi bi-broadcast-pin"></i>
                <span>Activar GPS + Brújula + Cámara</span>
              </button>
              <button type="button" class="btn-ar-close" id="btn-ar-close">
                <i class="bi bi-x-lg"></i>
                <span>Salir AR</span>
              </button>
            </div>
          </header>

          <!-- Cuerpo Principal Dividido: Izquierda (Cámara AR + Mapa de Ruta Leaflet) / Derecha (Controles + Destinos SQL/DASC/Campus) -->
          <div class="ar-pro-workspace">
            <!-- Columna Principal: Visor AR + Mapa de Ruta en Tiempo Real -->
            <div class="ar-pro-stage-col">
              <!-- Mitad Superior: Cámara en Vivo + Canvas HUD 3D (Brújula, Flecha 3D, Tarjeta Anclada al Acimut) -->
              <div class="ar-camera-viewport" id="ar-camera-viewport">
                <video id="ar-camera-video" class="ar-camera-video" autoplay playsinline muted></video>
                <canvas id="ar-hud-canvas" class="ar-hud-canvas"></canvas>

                <!-- Banner de Instrucción Paso a Paso Flotante -->
                <div class="ar-turn-banner" id="ar-turn-banner">
                  <div class="ar-turn-icon" id="ar-turn-icon">
                    <i class="bi bi-arrow-up-circle-fill"></i>
                  </div>
                  <div class="ar-turn-text">
                    <strong id="ar-turn-primary">Calculando ruta peatonal...</strong>
                    <span id="ar-turn-secondary">${escapeHtml(currentDestination.reference)}</span>
                  </div>
                  <div class="ar-turn-metrics">
                    <strong id="ar-metric-dist">-- m</strong>
                    <small id="ar-metric-time">~1 min</small>
                  </div>
                </div>

                <!-- Pie del Visor AR: Indicador de arrastre / giro -->
                <div class="ar-viewport-hint">
                  <span><i class="bi bi-arrows-move"></i> En celular mueve tu teléfono; en PC arrastra el visor para girar la brújula 360°</span>
                </div>
              </div>

              <!-- Mitad Inferior: Mapa de Ruta Peatonal en Vivo (Leaflet + Google Satélite + Cono de Visión) -->
              <div class="ar-minimap-dock">
                <div class="ar-minimap-toolbar">
                  <div class="minimap-title">
                    <i class="bi bi-map-fill"></i>
                    <span>Mapa de Ruta Peatonal en Vivo (Haz clic en cualquier punto del mapa para mover tu posición)</span>
                  </div>
                  <div class="minimap-actions">
                    <button type="button" class="btn-minimap-chip active" id="btn-ar-toggle-sat">
                      <i class="bi bi-globe-americas"></i> Satélite / Calles
                    </button>
                    <button type="button" class="btn-minimap-chip" id="btn-ar-center-route">
                      <i class="bi bi-bounding-box"></i> Encuadrar Ruta
                    </button>
                  </div>
                </div>
                <div id="ar-leaflet-map" class="ar-leaflet-map"></div>
              </div>
            </div>

            <!-- Columna Derecha: Controles de Posición/Simulación y Catálogo de Destinos (Horario SQL + 23 Aulas DASC + 49 Edificios) -->
            <aside class="ar-pro-sidebar">
              <!-- Bloque 1: Posición de Origen y Simulador de Recorrido -->
              <div class="ar-control-card">
                <div class="ar-card-head">
                  <span><i class="bi bi-crosshair2"></i> Tu Ubicación y Rumbo</span>
                  <button type="button" class="btn-ar-walk-sim" id="btn-ar-walk-sim">
                    <i class="bi bi-person-walking"></i> Caminar Ruta
                  </button>
                </div>

                <div class="ar-origin-row">
                  <label for="ar-select-origin">Punto de partida:</label>
                  <select id="ar-select-origin">
                    <option value="gps" selected>📍 Usar Mi GPS Real en Vivo</option>
                    ${puntosAcceso
                      .map(
                        (p) => `
                      <option value="${escapeHtml(p.id)}">
                        ${escapeHtml(p.nombre)}
                      </option>
                    `
                      )
                      .join("")}
                  </select>
                </div>

                <div class="ar-compass-slider-row">
                  <div class="slider-lbl-top">
                    <span>Orientación Brújula (Simulador PC):</span>
                    <strong id="ar-heading-val-lbl">${Math.round(cameraHeading)}°</strong>
                  </div>
                  <input type="range" id="ar-heading-slider" min="0" max="359" step="1" value="${Math.round(cameraHeading)}" />
                </div>
              </div>

              <!-- Bloque 2: Selector de Destino (Mis Clases SQL | 23 Aulas DASC | 49 Edificios Campus) -->
              <div class="ar-dest-selector-card">
                <div class="ar-dest-tabs" role="tablist">
                  <button type="button" class="ar-dest-tab ${activeDestTab === "sql" ? "active" : ""}" data-ar-tab="sql">
                    <i class="bi bi-calendar3"></i> Mis Clases SQL
                  </button>
                  <button type="button" class="ar-dest-tab ${activeDestTab === "aulas" ? "active" : ""}" data-ar-tab="aulas">
                    <i class="bi bi-cpu"></i> 23 Aulas DASC
                  </button>
                  <button type="button" class="ar-dest-tab ${activeDestTab === "edificios" ? "active" : ""}" data-ar-tab="edificios">
                    <i class="bi bi-buildings"></i> Campus (49)
                  </button>
                </div>

                <div class="ar-dest-search">
                  <i class="bi bi-search"></i>
                  <input
                    type="search"
                    id="ar-dest-search-input"
                    placeholder="Filtrar salón, materia o edificio..."
                    value="${escapeHtml(destSearchQuery)}"
                  />
                </div>

                <div id="ar-dest-list-container" class="ar-dest-list"></div>
              </div>
            </aside>
          </div>
        </div>
      `;

      bindArEvents(container, state);
      initArLeafletMap(container);
      recalculateArRoute();
      updateArDomMetadata(container);
      renderDestinationList(container, state);
      startCameraAndSensors(container);
      startHudRenderLoop(container);
    }
  };

  function resolveDestinationFromTarget(arTarget) {
    const aulaMatch =
      window.AULAS_DASC &&
      window.AULAS_DASC.buscar(
        arTarget.aulaId || arTarget.aulaCodigo || arTarget.destinationLabel
      );

    const bldgMatch =
      window.DASCStore.getBuildingById(
        aulaMatch ? aulaMatch.edificioLegacy : arTarget.buildingId || "dsc-39"
      ) || window.DASCStore.getBuildings()[0];

    const coords =
      arTarget.coords ||
      (aulaMatch && aulaMatch.coords) ||
      (bldgMatch && bldgMatch.centro) || [24.10275, -110.31602];

    currentDestination = {
      buildingId: bldgMatch.id,
      campusId: bldgMatch.campusId || "dasc",
      buildingCode: bldgMatch.code || "DSC-39",
      buildingName: bldgMatch.name,
      aulaId: aulaMatch ? aulaMatch.id : null,
      aulaCodigo: aulaMatch ? aulaMatch.codigo : null,
      planta: aulaMatch ? aulaMatch.planta : bldgMatch.levels || "Planta Baja",
      label:
        arTarget.destinationLabel ||
        (aulaMatch ? `${aulaMatch.codigo} · ${aulaMatch.nombre}` : bldgMatch.name),
      subject: arTarget.subject || "",
      professor: arTarget.professor || "",
      coords: [Number(coords[0]), Number(coords[1])],
      scenePano: aulaMatch && aulaMatch.scenePano ? aulaMatch.scenePano : arTarget.scenePano || "1",
      imagen: bldgMatch.imagen || "./img/recorrido/edificio-sistemas.jpg",
      reference: aulaMatch
        ? `${aulaMatch.referenciaAcceso} (${aulaMatch.edificioCodigo} · ${aulaMatch.planta})`
        : arTarget.arInstruction || `Dirígete hacia ${bldgMatch.name} (${bldgMatch.code}).`
    };
  }

  function recalculateArRoute() {
    if (!currentDestination || !window.CAMPUS_RUTAS) return;

    currentRoute = window.CAMPUS_RUTAS.calcularRuta(
      [userLat, userLng],
      currentDestination.coords
    );

    updateLeafletRouteVisuals();
  }

  function updateArDomMetadata(container) {
    if (!currentDestination || !currentRoute) return;

    const titleEl = container.querySelector("#ar-top-dest-title");
    if (titleEl) titleEl.textContent = currentDestination.label;

    const distEl = container.querySelector("#ar-metric-dist");
    const timeEl = container.querySelector("#ar-metric-time");
    const primaryEl = container.querySelector("#ar-turn-primary");
    const secondaryEl = container.querySelector("#ar-turn-secondary");
    const iconEl = container.querySelector("#ar-turn-icon");

    const distTxt =
      currentRoute.distanciaM >= 1000
        ? `${(currentRoute.distanciaM / 1000).toFixed(1)} km`
        : `${currentRoute.distanciaM} m`;

    if (distEl) distEl.textContent = distTxt;

    if (timeEl) {
      if (currentRoute.tiempoMin >= 60) {
        const hrs = Math.floor(currentRoute.tiempoMin / 60);
        const mins = currentRoute.tiempoMin % 60;
        timeEl.textContent = `~${hrs}h ${mins}m`;
      } else {
        timeEl.textContent = `~${currentRoute.tiempoMin} min`;
      }
    }

    const targetBearing = currentRoute.acimutInicial || 0;
    const delta = ((targetBearing - cameraHeading + 540) % 360) - 180;

    if (primaryEl && iconEl) {
      if (currentRoute.distanciaM <= 12) {
        primaryEl.textContent = `¡Has llegado a ${currentDestination.label}!`;
        iconEl.innerHTML = `<i class="bi bi-check-circle-fill" style="color:#10B981;"></i>`;
      } else if (Math.abs(delta) <= 18) {
        primaryEl.textContent = `Sigue de frente (${distTxt}) hacia tu destino`;
        iconEl.innerHTML = `<i class="bi bi-arrow-up-circle-fill" style="color:#10B981;"></i>`;
      } else if (delta > 18) {
        primaryEl.textContent = `Gira ${Math.round(Math.abs(delta))}° a la derecha hacia el andador`;
        iconEl.innerHTML = `<i class="bi bi-arrow-clockwise" style="color:#F59E0B;"></i>`;
      } else {
        primaryEl.textContent = `Gira ${Math.round(Math.abs(delta))}° a la izquierda hacia el andador`;
        iconEl.innerHTML = `<i class="bi bi-arrow-counterclockwise" style="color:#F59E0B;"></i>`;
      }
    }

    if (secondaryEl) {
      secondaryEl.textContent = currentDestination.subject
        ? `Clase: ${currentDestination.subject} · ${currentDestination.reference}`
        : currentDestination.reference;
    }
  }

  // =========================================================================
  // MAPA DE RUTA EN VIVO CON LEAFLET + POLÍGONOS DEL CAMPUS + CONO DE VISIÓN
  // =========================================================================
  function initArLeafletMap(container) {
    const mapDiv = container.querySelector("#ar-leaflet-map");
    if (!mapDiv || typeof L === "undefined") return;

    if (arLeafletMap) {
      try {
        arLeafletMap.remove();
      } catch (e) {}
      arLeafletMap = null;
    }

    arLeafletMap = L.map(mapDiv, {
      center: [userLat, userLng],
      zoom: 18,
      zoomControl: true
    });

    setArLeafletTiles(arSatelliteMode);

    // Dibujar polígonos de los edificios del Campus
    if (window.CAMPUS && Array.isArray(window.CAMPUS.edificios)) {
      window.CAMPUS.edificios.forEach((ed) => {
        if (ed.esVialidad || !ed.coords || ed.coords.length < 3) return;
        const poly = L.polygon(ed.coords, {
          color: ed.color || "#3B82F6",
          weight: 1.5,
          fillColor: ed.color || "#3B82F6",
          fillOpacity: 0.28
        }).addTo(arLeafletMap);

        poly.bindTooltip(`<strong>${ed.codigoMapa || ""}</strong> · ${ed.nombre}`, {
          direction: "top",
          sticky: true
        });
      });
    }

    // Clic sobre el mapa Leaflet para teletransportar al usuario a ese punto del campus
    arLeafletMap.on("click", (e) => {
      userLat = e.latlng.lat;
      userLng = e.latlng.lng;
      recalculateArRoute();
      updateArDomMetadata(container);
    });

    updateLeafletRouteVisuals(true);
  }

  function setArLeafletTiles(isSat) {
    if (!arLeafletMap || typeof L === "undefined") return;
    if (arTileLayer) {
      arLeafletMap.removeLayer(arTileLayer);
    }
    if (isSat) {
      arTileLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}", {
        maxZoom: 21,
        attribution: "© Google Maps Satélite · UABCS"
      }).addTo(arLeafletMap);
    } else {
      arTileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "© OpenStreetMap · UABCS"
      }).addTo(arLeafletMap);
    }
  }

  function updateLeafletRouteVisuals(fitBounds = false) {
    if (!arLeafletMap || typeof L === "undefined" || !currentDestination || !currentRoute) return;

    // 1. Marcador de posición del usuario
    const userIcon = L.divIcon({
      className: "ar-leaflet-user-dot",
      html: `<div class="user-gps-pulse"></div><div class="user-gps-core"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    if (!userMarker) {
      userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 900 }).addTo(
        arLeafletMap
      );
    } else {
      userMarker.setLatLng([userLat, userLng]);
    }

    // 2. Cono de visión de la cámara en el mapa
    updateVisionConeOnLeaflet();

    // 3. Polilínea de ruta peatonal Dijkstra
    if (routePolyline) {
      arLeafletMap.removeLayer(routePolyline);
    }
    if (routeWaypointsLayer) {
      arLeafletMap.removeLayer(routeWaypointsLayer);
    }

    const waypoints = currentRoute.waypoints || [
      [userLat, userLng],
      currentDestination.coords
    ];

    routePolyline = L.polyline(waypoints, {
      color: "#F59E0B",
      weight: 5,
      opacity: 0.95,
      dashArray: "8, 6"
    }).addTo(arLeafletMap);

    routeWaypointsLayer = L.layerGroup().addTo(arLeafletMap);
    waypoints.slice(1, -1).forEach((pt) => {
      L.circleMarker(pt, {
        radius: 4,
        color: "#0F172A",
        weight: 1.5,
        fillColor: "#38BDF8",
        fillOpacity: 1
      }).addTo(routeWaypointsLayer);
    });

    // 4. Marcador de destino
    const destIcon = L.divIcon({
      className: "ar-leaflet-dest-pin",
      html: `<div class="dest-pin-badge"><i class="bi bi-flag-fill"></i><span>${escapeHtml(
        currentDestination.aulaCodigo || currentDestination.buildingCode
      )}</span></div>`,
      iconSize: [84, 30],
      iconAnchor: [42, 28]
    });

    if (!destMarker) {
      destMarker = L.marker(currentDestination.coords, {
        icon: destIcon,
        zIndexOffset: 1000
      }).addTo(arLeafletMap);
    } else {
      destMarker.setLatLng(currentDestination.coords);
      destMarker.setIcon(destIcon);
    }

    if (fitBounds && waypoints.length >= 2) {
      arLeafletMap.fitBounds(L.latLngBounds(waypoints), { padding: [36, 36], maxZoom: 19 });
    }
  }

  function updateVisionConeOnLeaflet() {
    if (!arLeafletMap || typeof L === "undefined") return;
    const distCone = 0.00032; // ~35 metros en lat/lng
    const halfFov = 28;
    const a1 = ((cameraHeading - halfFov) * Math.PI) / 180;
    const a2 = ((cameraHeading + halfFov) * Math.PI) / 180;

    const p1 = [
      userLat + Math.cos(a1) * distCone,
      userLng + (Math.sin(a1) * distCone) / Math.cos((userLat * Math.PI) / 180)
    ];
    const p2 = [
      userLat + Math.cos(a2) * distCone,
      userLng + (Math.sin(a2) * distCone) / Math.cos((userLat * Math.PI) / 180)
    ];

    const coneCoords = [[userLat, userLng], p1, p2];
    if (!visionConePolygon) {
      visionConePolygon = L.polygon(coneCoords, {
        color: "#38BDF8",
        weight: 1,
        fillColor: "#38BDF8",
        fillOpacity: 0.25,
        interactive: false
      }).addTo(arLeafletMap);
    } else {
      visionConePolygon.setLatLngs(coneCoords);
    }
  }

  // =========================================================================
  // RENDERIZADO DEL HUD 3D EN EL CANVAS AR (60 FPS)
  // =========================================================================
  function startHudRenderLoop(container) {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const canvas = container.querySelector("#ar-hud-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let pulsePhase = 0;

    function drawFrame() {
      if (!document.body.contains(canvas)) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
        canvas.width = Math.floor(rect.width);
        canvas.height = Math.floor(rect.height);
      }

      const w = canvas.width;
      const h = canvas.height;
      pulsePhase += 0.05;

      ctx.clearRect(0, 0, w, h);

      // Si la cámara de video no está activa, dibujar cielo/horizonte sintético 3D del campus
      if (!cameraActive) {
        drawSyntheticArEnvironment(ctx, w, h);
      }

      if (currentDestination && currentRoute) {
        const targetBearing = currentRoute.acimutInicial || 0;
        const deltaAngle = ((targetBearing - cameraHeading + 540) % 360) - 180;

        // 1. Cinta de Brújula Superior (Compass Tape)
        drawCompassTape(ctx, w, cameraHeading, targetBearing);

        // 2. Flecha 3D en el Piso + Anillos de Radar hacia el siguiente nodo peatonal
        draw3DFloorArrow(ctx, w, h, deltaAngle, currentRoute.distanciaM, pulsePhase);

        // 3. Tarjeta 3D Flotante del Destino Anclada al Acimut Real
        drawFloatingTargetPin(ctx, w, h, deltaAngle, currentRoute.distanciaM, pulsePhase);
      }

      animFrameId = requestAnimationFrame(drawFrame);
    }

    animFrameId = requestAnimationFrame(drawFrame);
  }

  function drawSyntheticArEnvironment(ctx, w, h) {
    const horizonY = h * 0.52;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, "#060D1A");
    skyGrad.addColorStop(1, "#152C4F");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, "#0F1E36");
    groundGrad.addColorStop(1, "#070B14");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Malla de perspectiva en el piso que rota con el rumbo de la brújula
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.16)";
    ctx.lineWidth = 1;
    const shift = ((cameraHeading % 30) / 30) * 60;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + i * 25 - shift * 0.3, horizonY);
      ctx.lineTo(w / 2 + i * 135 - shift * 1.6, h);
      ctx.stroke();
    }
    for (let r = 1; r <= 5; r++) {
      const y = horizonY + Math.pow(r / 5, 1.7) * (h - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCompassTape(ctx, w, heading, targetBearing) {
    const tapeW = Math.min(480, w * 0.86);
    const tapeX = (w - tapeW) / 2;
    const tapeY = 14;
    const tapeH = 34;

    ctx.save();
    ctx.fillStyle = "rgba(11, 17, 32, 0.84)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tapeX, tapeY, tapeW, tapeH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(tapeX, tapeY, tapeW, tapeH, 10);
    ctx.clip();

    const pxPerDeg = tapeW / 110;
    const cardinals = {
      0: "N",
      45: "NE",
      90: "E",
      135: "SE",
      180: "S",
      225: "SO",
      270: "O",
      315: "NO"
    };

    const startDeg = Math.floor(heading - 55);
    const endDeg = Math.ceil(heading + 55);

    for (let d = startDeg; d <= endDeg; d++) {
      const norm = ((d % 360) + 360) % 360;
      const x = w / 2 + (d - heading) * pxPerDeg;

      if (norm % 15 === 0) {
        ctx.strokeStyle = norm % 45 === 0 ? "#F59E0B" : "rgba(203, 213, 225, 0.45)";
        ctx.lineWidth = norm % 45 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, tapeY + tapeH - (norm % 45 === 0 ? 11 : 7));
        ctx.lineTo(x, tapeY + tapeH);
        ctx.stroke();
      }

      if (cardinals[norm]) {
        ctx.fillStyle = norm === 0 ? "#EF4444" : "#F8FAFC";
        ctx.font = "700 11px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(cardinals[norm], x, tapeY + 15);
      }
    }

    // Marcador del objetivo sobre la cinta de brújula
    const delta = ((targetBearing - heading + 540) % 360) - 180;
    const targetX = Math.max(
      tapeX + 12,
      Math.min(tapeX + tapeW - 12, w / 2 + delta * pxPerDeg)
    );
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(targetX, tapeY + tapeH - 5, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Indicador central de rumbo
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.moveTo(w / 2 - 6, tapeY);
    ctx.lineTo(w / 2 + 6, tapeY);
    ctx.lineTo(w / 2, tapeY + 7);
    ctx.closePath();
    ctx.fill();
  }

  function draw3DFloorArrow(ctx, w, h, deltaAngle, distanceM, pulsePhase) {
    const cx = w / 2;
    const cy = h * 0.72;
    const rad = (deltaAngle * Math.PI) / 180;
    const isAligned = Math.abs(deltaAngle) <= 18;
    const mainColor = isAligned ? "#10B981" : "#F59E0B";

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.52); // Perspectiva 3D en el piso

    // Anillos de radar
    const pulseRadius = 52 + ((pulsePhase * 18) % 45);
    ctx.strokeStyle = isAligned
      ? "rgba(16, 185, 129, 0.45)"
      : "rgba(245, 158, 11, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.stroke();

    // Rotar flecha hacia el siguiente nodo peatonal
    ctx.rotate(rad);

    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = mainColor;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, -58);
    ctx.lineTo(36, 30);
    ctx.lineTo(12, 16);
    ctx.lineTo(12, 50);
    ctx.lineTo(-12, 50);
    ctx.lineTo(-12, 16);
    ctx.lineTo(-36, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawFloatingTargetPin(ctx, w, h, deltaAngle, distanceM, pulsePhase) {
    const fov = 72; // Campo de visión horizontal
    const clampedDelta = Math.max(-fov / 2, Math.min(fov / 2, deltaAngle));
    const pinX = w / 2 + (clampedDelta / (fov / 2)) * (w * 0.38);
    const pinY = h * 0.33 + Math.sin(pulsePhase) * 4;

    const isInsideFov = Math.abs(deltaAngle) <= fov / 2;
    const cardW = 240;
    const cardH = 68;
    const cardX = Math.max(12, Math.min(w - cardW - 12, pinX - cardW / 2));
    const cardY = pinY - cardH / 2;

    ctx.save();

    // Línea vertical de anclaje al piso
    ctx.strokeStyle = isInsideFov ? "rgba(16, 185, 129, 0.75)" : "rgba(245, 158, 11, 0.75)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pinX, cardY + cardH);
    ctx.lineTo(pinX, h * 0.56);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fondo de tarjeta flotante AR
    ctx.fillStyle = "rgba(11, 17, 32, 0.9)";
    ctx.strokeStyle = isInsideFov ? "#10B981" : "#F59E0B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    // Contenido de la tarjeta
    ctx.fillStyle = isInsideFov ? "#10B981" : "#F59E0B";
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      `${currentDestination.buildingCode} · ${currentDestination.planta} · ${distanceM >= 1000 ? (distanceM / 1000).toFixed(1) + " km" : distanceM + " m"}`,
      cardX + 12,
      cardY + 21
    );

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "700 13px Inter, system-ui, sans-serif";
    const shortTitle =
      currentDestination.label.length > 28
        ? currentDestination.label.slice(0, 26) + "…"
        : currentDestination.label;
    ctx.fillText(shortTitle, cardX + 12, cardY + 41);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 11px Inter, system-ui, sans-serif";
    ctx.fillText(
      isInsideFov
        ? "✓ En tu campo de visión · Sigue la flecha"
        : deltaAngle > 0
        ? `Gira ${Math.round(deltaAngle)}° a la derecha →`
        : `← Gira ${Math.round(Math.abs(deltaAngle))}° a la izquierda`,
      cardX + 12,
      cardY + 57
    );

    ctx.restore();
  }

  // =========================================================================
  // SENSORES REALES: CÁMARA TRASERA, GPS WATCHPOSITION Y BRÚJULA / GIROSCOPIO
  // =========================================================================
  function startCameraAndSensors(container) {
    // 1. Iniciar GPS Real de inmediato (sin esperar la cámara)
    startRealGpsTracking(container);

    // 2. Suscribir orientación si no requiere permiso explícito de iOS
    if (
      window.DeviceOrientationEvent &&
      typeof DeviceOrientationEvent.requestPermission !== "function"
    ) {
      attachDeviceOrientationListener(container);
    }

    // 3. Iniciar cámara trasera en segundo plano
    startCameraStream(container);
  }

  async function startCameraStream(container) {
    const videoEl = container.querySelector("#ar-camera-video");
    if (videoEl && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        videoEl.srcObject = cameraStream;
        cameraActive = true;
      } catch (e) {
        cameraActive = false;
      }
    }
  }

  async function requestExplicitMobileSensors(container) {
    // 1. Permiso explícito para iOS 13+ (Brújula / Giroscopio)
    if (
      window.DeviceOrientationEvent &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === "granted") {
          attachDeviceOrientationListener(container);
        }
      } catch (e) {}
    } else {
      attachDeviceOrientationListener(container);
    }

    // 2. Activar GPS Real con validación de geocerca del Campus La Paz UABCS
    startRealGpsTracking(container);

    // 3. Reintentar cámara si estaba apagada
    if (!cameraActive) {
      await startCameraAndSensors(container);
    }
  }

  function attachDeviceOrientationListener(container) {
    if (orientationHandler) {
      window.removeEventListener("deviceorientationabsolute", orientationHandler, true);
      window.removeEventListener("deviceorientation", orientationHandler, true);
    }

    orientationHandler = (e) => {
      let heading = null;
      if (typeof e.webkitCompassHeading === "number") {
        heading = e.webkitCompassHeading; // iOS brújula magnética real
      } else if (e.alpha !== null && typeof e.alpha === "number") {
        heading = (360 - e.alpha) % 360; // Android / estándar W3C
      }

      if (heading !== null && !isNaN(heading)) {
        compassRealActive = true;
        cameraHeading = (heading + 360) % 360;
        const compassTxt = container.querySelector("#ar-pill-compass-txt");
        if (compassTxt) compassTxt.textContent = `Brújula Real: ${Math.round(cameraHeading)}°`;
        const slider = container.querySelector("#ar-heading-slider");
        if (slider) slider.value = Math.round(cameraHeading);
        const lbl = container.querySelector("#ar-heading-val-lbl");
        if (lbl) lbl.textContent = `${Math.round(cameraHeading)}°`;
        updateVisionConeOnLeaflet();
        updateArDomMetadata(container);
      }
    };

    window.addEventListener("deviceorientationabsolute", orientationHandler, true);
    window.addEventListener("deviceorientation", orientationHandler, true);
  }

  function startRealGpsTracking(container) {
    const gpsPill = container.querySelector("#ar-pill-gps");
    if (!navigator.geolocation) {
      if (gpsPill) {
        gpsPill.innerHTML = `<i class="bi bi-exclamation-triangle-fill" style="color:#EF4444;"></i><span>GPS no soportado en este navegador</span>`;
      }
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      if (gpsPill) {
        gpsPill.innerHTML = `<i class="bi bi-shield-lock-fill" style="color:#F59E0B;"></i><span>IP sin HTTPS (Navegador bloquea GPS) · Clic en minimapa</span>`;
      }
      return;
    }

    if (gpsWatchId !== null) {
      navigator.geolocation.clearWatch(gpsWatchId);
      gpsWatchId = null;
    }

    if (gpsPill) {
      gpsPill.innerHTML = `<i class="bi bi-arrow-repeat spin"></i><span>Conectando a GPS...</span>`;
    }

    // 1. Obtención inmediata de ubicación (fix instantáneo)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyArGpsPosition(pos, container);
      },
      (err) => {
        applyArGpsError(err, container);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    // 2. Rastreo continuo en vivo
    gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        applyArGpsPosition(pos, container);
      },
      (err) => {
        applyArGpsError(err, container);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  function applyArGpsPosition(pos, container) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    userLat = lat;
    userLng = lng;
    userAccuracy = Math.round(pos.coords.accuracy || 5);
    gpsRealActive = true;

    const originSel = container.querySelector("#ar-select-origin");
    if (originSel && originSel.value !== "gps") {
      originSel.value = "gps";
    }

    const distToCampusM =
      window.CAMPUS_RUTAS &&
      window.CAMPUS_RUTAS.distanciaMetros([lat, lng], [24.10255, -110.31595]);

    const gpsPill = container.querySelector("#ar-pill-gps");
    if (gpsPill) {
      if (distToCampusM !== null && distToCampusM <= 2500) {
        gpsPill.innerHTML = `<i class="bi bi-geo-alt-fill" style="color:#10B981;"></i><span>GPS Real (Campus · ±${userAccuracy}m)</span>`;
      } else {
        const km = Math.round((distToCampusM || 3000) / 1000);
        gpsPill.innerHTML = `<i class="bi bi-geo-alt-fill" style="color:#38BDF8;"></i><span>GPS Real (a ${km}km · ±${userAccuracy}m)</span>`;
      }
    }

    recalculateArRoute();
    updateArDomMetadata(container);
    updateLeafletRouteVisuals(true);
  }

  function applyArGpsError(err, container) {
    const gpsPill = container.querySelector("#ar-pill-gps");
    if (!gpsPill) return;

    let errDesc = "Señal GPS no disponible";
    if (err && err.code === 1) {
      errDesc = "Permiso GPS bloqueado (Revisa 🔒)";
    } else if (err && err.code === 2) {
      errDesc = "Posición no disponible (Activa ubicación)";
    } else if (err && err.code === 3) {
      errDesc = "Tiempo de espera GPS agotado";
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      errDesc = "IP sin HTTPS (Navegador bloquea GPS)";
    }

    gpsPill.innerHTML = `<i class="bi bi-exclamation-triangle-fill" style="color:#EF4444;"></i><span>${errDesc} · Clic en minimapa</span>`;
  }

  // =========================================================================
  // EVENTOS Y LISTA DE DESTINOS (CLASES SQL, 23 AULAS DASC Y 49 EDIFICIOS)
  // =========================================================================
  function bindArEvents(container, state) {
    const closeBtn = container.querySelector("#btn-ar-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        stopAllArResources();
        window.DASCStore.closeARGuide();
      });
    }

    const sensorsBtn = container.querySelector("#btn-ar-enable-sensors");
    if (sensorsBtn) {
      sensorsBtn.addEventListener("click", () => {
        requestExplicitMobileSensors(container);
      });
    }

    // Toggle Satélite / Calles en el mapa de ruta
    const btnSat = container.querySelector("#btn-ar-toggle-sat");
    if (btnSat) {
      btnSat.addEventListener("click", () => {
        arSatelliteMode = !arSatelliteMode;
        btnSat.classList.toggle("active", arSatelliteMode);
        setArLeafletTiles(arSatelliteMode);
      });
    }

    const btnCenterRoute = container.querySelector("#btn-ar-center-route");
    if (btnCenterRoute) {
      btnCenterRoute.addEventListener("click", () => {
        updateLeafletRouteVisuals(true);
      });
    }

    // Selector de punto de partida
    const originSel = container.querySelector("#ar-select-origin");
    if (originSel) {
      originSel.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "gps") {
          startRealGpsTracking(container);
        } else {
          gpsRealActive = false;
          if (gpsWatchId !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(gpsWatchId);
            gpsWatchId = null;
          }
          const acceso = (window.CAMPUS_RUTAS.puntosAcceso || []).find((p) => p.id === val);
          if (acceso) {
            userLat = acceso.coords[0];
            userLng = acceso.coords[1];
            const gpsPill = container.querySelector("#ar-pill-gps");
            if (gpsPill) {
              gpsPill.innerHTML = `<i class="bi bi-geo-alt-fill" style="color:#F59E0B;"></i><span>Modo Simulación: ${escapeHtml(acceso.nombre.split("(")[0].trim())}</span>`;
            }
            recalculateArRoute();
            updateArDomMetadata(container);
            updateLeafletRouteVisuals(true);
          }
        }
      });
    }

    // Simulador de caminata paso a paso sobre los nodos de la ruta
    const walkBtn = container.querySelector("#btn-ar-walk-sim");
    if (walkBtn) {
      walkBtn.addEventListener("click", () => {
        if (walkSimInterval) {
          clearInterval(walkSimInterval);
          walkSimInterval = null;
          walkBtn.classList.remove("active");
          walkBtn.innerHTML = `<i class="bi bi-person-walking"></i> Caminar Ruta`;
          return;
        }
        walkBtn.classList.add("active");
        walkBtn.innerHTML = `<i class="bi bi-pause-fill"></i> Pausar Caminata`;

        walkSimInterval = setInterval(() => {
          if (!currentRoute || !currentRoute.waypoints || currentRoute.waypoints.length < 2) {
            clearInterval(walkSimInterval);
            walkSimInterval = null;
            return;
          }

          const nextPt = currentRoute.waypoints[1];
          const dLat = nextPt[0] - userLat;
          const dLng = nextPt[1] - userLng;
          const dist = Math.hypot(dLat, dLng);

          // Orientar la brújula automáticamente hacia el camino al caminar
          cameraHeading = currentRoute.acimutInicial || cameraHeading;
          const slider = container.querySelector("#ar-heading-slider");
          if (slider) slider.value = Math.round(cameraHeading);
          const lbl = container.querySelector("#ar-heading-val-lbl");
          if (lbl) lbl.textContent = `${Math.round(cameraHeading)}°`;

          if (dist < 0.00005) {
            userLat = nextPt[0];
            userLng = nextPt[1];
          } else {
            userLat += (dLat / dist) * 0.000045;
            userLng += (dLng / dist) * 0.000045;
          }

          recalculateArRoute();
          updateArDomMetadata(container);

          if (currentRoute.distanciaM <= 8) {
            clearInterval(walkSimInterval);
            walkSimInterval = null;
            walkBtn.classList.remove("active");
            walkBtn.innerHTML = `<i class="bi bi-check2-circle"></i> ¡Destino Alcanzado!`;
          }
        }, 260);
      });
    }

    // Slider de orientación de brújula
    const headingSlider = container.querySelector("#ar-heading-slider");
    if (headingSlider) {
      headingSlider.addEventListener("input", (e) => {
        cameraHeading = Number(e.target.value) || 0;
        const lbl = container.querySelector("#ar-heading-val-lbl");
        if (lbl) lbl.textContent = `${Math.round(cameraHeading)}°`;
        const compassTxt = container.querySelector("#ar-pill-compass-txt");
        if (compassTxt) compassTxt.textContent = `Rumbo: ${Math.round(cameraHeading)}°`;
        updateVisionConeOnLeaflet();
        updateArDomMetadata(container);
      });
    }

    // Arrastrar sobre el canvas para girar la brújula 360° en PC
    const viewport = container.querySelector("#ar-camera-viewport");
    if (viewport) {
      viewport.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button")) return;
        isDraggingCanvas = true;
        dragStartX = e.clientX;
        dragStartHeading = cameraHeading;
      });
      window.addEventListener("pointermove", (e) => {
        if (!isDraggingCanvas) return;
        const dx = e.clientX - dragStartX;
        cameraHeading = (dragStartHeading - dx * 0.35 + 360) % 360;
        const slider = container.querySelector("#ar-heading-slider");
        if (slider) slider.value = Math.round(cameraHeading);
        const lbl = container.querySelector("#ar-heading-val-lbl");
        if (lbl) lbl.textContent = `${Math.round(cameraHeading)}°`;
        const compassTxt = container.querySelector("#ar-pill-compass-txt");
        if (compassTxt) compassTxt.textContent = `Rumbo: ${Math.round(cameraHeading)}°`;
        updateVisionConeOnLeaflet();
        updateArDomMetadata(container);
      });
      window.addEventListener("pointerup", () => {
        isDraggingCanvas = false;
      });
    }

    // Pestañas de destino
    container.querySelectorAll("[data-ar-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDestTab = btn.getAttribute("data-ar-tab") || "sql";
        container.querySelectorAll("[data-ar-tab]").forEach((b) =>
          b.classList.toggle("active", b.getAttribute("data-ar-tab") === activeDestTab)
        );
        renderDestinationList(container, state);
      });
    });

    const searchInput = container.querySelector("#ar-dest-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        destSearchQuery = e.target.value || "";
        renderDestinationList(container, state);
      });
    }
  }

  function renderDestinationList(container, state) {
    const listEl = container.querySelector("#ar-dest-list-container");
    if (!listEl) return;

    const q = destSearchQuery.trim().toLowerCase();

    if (activeDestTab === "sql") {
      const sched = state.currentScheduleData || window.DASCStore.getCurrentScheduleData();
      const subjects = (sched && sched.groupedSubjects) || [];
      const filtered = subjects.filter(
        (s) =>
          !q ||
          s.subject.toLowerCase().includes(q) ||
          s.classroom.toLowerCase().includes(q) ||
          s.professor.toLowerCase().includes(q)
      );

      listEl.innerHTML = filtered
        .map((cls) => {
          const isCurrent =
            currentDestination &&
            currentDestination.aulaCodigo &&
            String(cls.classroomCode).toUpperCase() ===
              String(currentDestination.aulaCodigo).toUpperCase();

          return `
            <button
              type="button"
              class="ar-dest-item ${isCurrent ? "active" : ""}"
              data-ar-pick-aula="${escapeHtml(cls.classroomCode)}"
              data-ar-pick-subj="${escapeHtml(cls.subject)}"
              data-ar-pick-prof="${escapeHtml(cls.professor)}"
            >
              <div class="ar-dest-item-top">
                <span class="ar-dest-code">${escapeHtml(cls.classroomCode)}</span>
                <span class="ar-dest-meta">${escapeHtml(cls.days)} · ${escapeHtml(cls.time)}</span>
              </div>
              <strong>${escapeHtml(cls.subject)}</strong>
              <small>Prof. ${escapeHtml(cls.professor)} · ${escapeHtml(cls.classroom)}</small>
            </button>
          `;
        })
        .join("");
    } else if (activeDestTab === "aulas") {
      const aulas = (window.AULAS_DASC && window.AULAS_DASC.salones) || [];
      const filtered = aulas.filter(
        (a) =>
          !q ||
          a.codigo.toLowerCase().includes(q) ||
          a.nombre.toLowerCase().includes(q) ||
          a.edificioCodigo.toLowerCase().includes(q)
      );

      listEl.innerHTML = filtered
        .map((a) => {
          const isCurrent = currentDestination && currentDestination.aulaId === a.id;
          return `
            <button
              type="button"
              class="ar-dest-item ${isCurrent ? "active" : ""}"
              data-ar-pick-aula="${escapeHtml(a.id)}"
            >
              <div class="ar-dest-item-top">
                <span class="ar-dest-code" style="background:${escapeHtml(a.color)};">${escapeHtml(a.codigo)}</span>
                <span class="ar-dest-meta">${escapeHtml(a.edificioCodigo)} · ${escapeHtml(a.planta)}</span>
              </div>
              <strong>${escapeHtml(a.nombre)}</strong>
              <small>${escapeHtml(a.referenciaAcceso)}</small>
            </button>
          `;
        })
        .join("");
    } else {
      const edificios =
        (window.CAMPUS && window.CAMPUS.edificios.filter((e) => !e.esVialidad)) || [];
      const filtered = edificios.filter(
        (e) =>
          !q ||
          e.nombre.toLowerCase().includes(q) ||
          String(e.codigoMapa || "").toLowerCase().includes(q)
      );

      listEl.innerHTML = filtered
        .map((ed) => {
          const isCurrent = currentDestination && currentDestination.campusId === ed.id;
          return `
            <button
              type="button"
              class="ar-dest-item ${isCurrent ? "active" : ""}"
              data-ar-pick-bldg="${escapeHtml(ed.id)}"
            >
              <div class="ar-dest-item-top">
                <span class="ar-dest-code" style="background:${escapeHtml(ed.color)};">${escapeHtml(ed.codigoMapa || "UABCS")}</span>
                <span class="ar-dest-meta">${ed.pisos || 1} Niv.</span>
              </div>
              <strong>${escapeHtml(ed.nombre)}</strong>
              <small>${escapeHtml(String(ed.descripcion || "").slice(0, 75))}...</small>
            </button>
          `;
        })
        .join("");
    }

    listEl.querySelectorAll("[data-ar-pick-aula]").forEach((btn) => {
      btn.onclick = () => {
        const aulaKey = btn.getAttribute("data-ar-pick-aula");
        const subj = btn.getAttribute("data-ar-pick-subj") || "";
        const prof = btn.getAttribute("data-ar-pick-prof") || "";
        const aulaObj = window.AULAS_DASC && window.AULAS_DASC.buscar(aulaKey);
        if (aulaObj) {
          window.DASCStore.openARGuide({
            buildingId: aulaObj.edificioLegacy,
            destinationLabel: `${aulaObj.codigo} · ${aulaObj.nombre}`,
            subject: subj,
            professor: prof,
            aulaId: aulaObj.id,
            coords: aulaObj.coords
          });
          updateLeafletRouteVisuals(true);
        }
      };
    });

    listEl.querySelectorAll("[data-ar-pick-bldg]").forEach((btn) => {
      btn.onclick = () => {
        const bId = btn.getAttribute("data-ar-pick-bldg");
        const bldg = window.DASCStore.getBuildingById(bId);
        if (bldg) {
          window.DASCStore.openARGuide({
            buildingId: bldg.id,
            destinationLabel: `${bldg.name} (${bldg.code})`,
            coords: bldg.centro
          });
          updateLeafletRouteVisuals(true);
        }
      };
    });
  }

  function stopAllArResources() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (walkSimInterval) {
      clearInterval(walkSimInterval);
      walkSimInterval = null;
    }
    if (gpsWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchId);
      gpsWatchId = null;
    }
    if (orientationHandler) {
      window.removeEventListener("deviceorientationabsolute", orientationHandler, true);
      window.removeEventListener("deviceorientation", orientationHandler, true);
      orientationHandler = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      cameraStream = null;
    }
    cameraActive = false;
    if (arLeafletMap) {
      try {
        arLeafletMap.remove();
      } catch (e) {}
      arLeafletMap = null;
      userMarker = null;
      visionConePolygon = null;
      routePolyline = null;
      routeWaypointsLayer = null;
      destMarker = null;
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
