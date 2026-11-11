/**
 * arView.js
 * Módulo 4: Guía de Realidad Aumentada (RF-08)
 * Solicita cámara trasera (navigator.mediaDevices.getUserMedia) y superpone HUD AR,
 * flecha 3D/CSS flotante, distancia estimada y minimapa de ruta en tiempo real.
 */

(function () {
  let activeStream = null;
  let walkProgress = 0; // 0 a 100% del recorrido hacia el aula
  let headingOffset = 0; // Desviación en grados respecto al objetivo
  let orientationHandler = null;

  window.DASCARView = {
    async render(container, state) {
      if (!state.arOverlayActive || !state.arTarget) {
        this.stopCamera();
        container.innerHTML = "";
        container.style.display = "none";
        return;
      }

      container.style.display = "block";
      const target = state.arTarget;
      const building =
        window.DASCStore.getBuildingById(target.buildingId) ||
        window.DASCStore.getBuildings()[0];

      walkProgress = 0;
      headingOffset = 0;

      const remainingDistance = Math.max(
        0,
        Math.round(target.distanceMeters * (1 - walkProgress / 100))
      );

      container.innerHTML = `
        <div class="ar-fullscreen-overlay" role="dialog" aria-modal="true" aria-label="Guía de Realidad Aumentada DASC">
          <!-- Flujo de video de cámara trasera -->
          <video
            id="ar-camera-video"
            class="ar-camera-video"
            autoplay
            playsinline
            muted
          ></video>

          <!-- Fondo de respaldo visual cuando el dispositivo no tiene cámara o se usa en escritorio -->
          <div class="ar-fallback-environment" id="ar-fallback-bg">
            <div class="ar-horizon-grid"></div>
          </div>

          <!-- Capa HUD de Realidad Aumentada -->
          <div class="ar-hud-layer">
            <!-- Barra Superior HUD -->
            <header class="ar-hud-top">
              <div class="ar-destination-box">
                <div class="ar-live-status">
                  <span class="ar-status-dot" id="ar-cam-dot"></span>
                  <span id="ar-cam-status-text">Iniciando cámara trasera...</span>
                </div>
                <h2 class="ar-target-title">Hacia: ${escapeHtml(target.destinationLabel)}</h2>
                <p class="ar-target-sub">
                  ${
                    target.subject
                      ? `<strong>${escapeHtml(target.subject)}</strong> · ${escapeHtml(target.professor)}`
                      : `${escapeHtml(building.name)} (${escapeHtml(building.code)})`
                  }
                </p>
              </div>

              <div class="ar-top-actions">
                <button type="button" class="btn-ar-switch-map" id="btn-ar-to-map" title="Ver en Mapa 2D/3D">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                  </svg>
                  <span>Mapa</span>
                </button>
                <button type="button" class="btn-ar-close" id="btn-ar-close" title="Cerrar Guía AR">
                  ✕ Cerrar AR
                </button>
              </div>
            </header>

            <!-- Retícula Central + Marcador Flotante + Flecha 3D Direccional -->
            <div class="ar-Stage-center">
              <!-- Pin AR Flotante del Edificio/Salón -->
              <div class="ar-spatial-beacon" id="ar-spatial-beacon">
                <div class="beacon-pulse"></div>
                <div class="beacon-card">
                  <span class="beacon-code">${escapeHtml(building.code)}</span>
                  <div class="beacon-info">
                    <strong>${escapeHtml(target.destinationLabel)}</strong>
                    <span id="ar-beacon-dist">${remainingDistance} m al frente</span>
                  </div>
                </div>
                <div class="beacon-stem"></div>
              </div>

              <!-- Flecha 3D/CSS Flotante de Dirección -->
              <div class="ar-arrow-3d-scene">
                <div
                  class="ar-arrow-3d-object"
                  id="ar-arrow-3d"
                  style="transform: rotateX(58deg) rotateZ(${headingOffset}deg);"
                >
                  <div class="arrow-ring-outer"></div>
                  <div class="arrow-ring-inner"></div>
                  <div class="arrow-chevron chevron-1"></div>
                  <div class="arrow-chevron chevron-2"></div>
                  <div class="arrow-body-3d">
                    <div class="arrow-head"></div>
                    <div class="arrow-shaft"></div>
                  </div>
                </div>
              </div>

              <!-- Indicador de Rumbo /Instrucción -->
              <div class="ar-instruction-toast" id="ar-instruction-toast">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                <span id="ar-instruction-text">${escapeHtml(target.arInstruction)}</span>
              </div>
            </div>

            <!-- Panel Inferior HUD: Métricas de Distancia + Controles de Simulación + Minimapa de Ruta -->
            <footer class="ar-hud-bottom">
              <div class="ar-metrics-panel">
                <div class="ar-metric-cards">
                  <div class="ar-metric-box">
                    <span class="metric-label">DISTANCIA ESTIMADA</span>
                    <strong class="metric-value" id="ar-dist-value">${remainingDistance} m</strong>
                  </div>
                  <div class="ar-metric-box">
                    <span class="metric-label">TIEMPO CAMINANDO</span>
                    <strong class="metric-value" id="ar-time-value">${Math.max(1, Math.ceil(remainingDistance / 65))} min</strong>
                  </div>
                  <div class="ar-metric-box">
                    <span class="metric-label">RUMBO DASC</span>
                    <strong class="metric-value" id="ar-bearing-value">${target.arBearing}° NE</strong>
                  </div>
                </div>

                <!-- Control interactivo para simular caminata / orientación durante pruebas -->
                <div class="ar-walk-simulator">
                  <div class="sim-row">
                    <label for="ar-walk-slider">Simular avance caminando hacia el salón:</label>
                    <span id="ar-walk-pct">0%</span>
                  </div>
                  <input
                    type="range"
                    id="ar-walk-slider"
                    min="0"
                    max="100"
                    value="0"
                    class="ar-range-slider"
                  />
                  <div class="sim-turn-btns">
                    <button type="button" class="btn-ar-turn" data-turn="-25">↺ Girar -25°</button>
                    <button type="button" class="btn-ar-turn" data-turn="0">Centrar Rumbo</button>
                    <button type="button" class="btn-ar-turn" data-turn="25">Girar +25° ↻</button>
                    <button type="button" class="btn-ar-turn" id="btn-retry-cam">📷 Reintentar Cámara</button>
                  </div>
                </div>
              </div>

              <!-- Minimapa de Ruta en Vivo -->
              <div class="ar-minimap-card" title="Minimapa de ruta DASC">
                <div class="minimap-header">
                  <span>MINIMAPA DE RUTA</span>
                  <span class="minimap-code">${escapeHtml(building.code)}</span>
                </div>
                <svg class="ar-minimap-svg" viewBox="0 0 1000 800">
                  <rect width="1000" height="800" fill="#090f1d"/>
                  <!-- Edificios del DASC en el minimapa -->
                  ${window.DASCStore.getBuildings()
                    .map((b) => {
                      const isTarget = b.id === building.id;
                      return `
                        <rect
                          x="${b.mapCoords.x}"
                          y="${b.mapCoords.y}"
                          width="${b.mapCoords.width}"
                          height="${b.mapCoords.height}"
                          rx="10"
                          fill="${isTarget ? "#F59E0B" : "#1e293b"}"
                          stroke="${isTarget ? "#FEF08A" : "#3B82F6"}"
                          stroke-width="${isTarget ? "8" : "4"}"
                        />
                        <text
                          x="${b.mapCoords.x + b.mapCoords.width / 2}"
                          y="${b.mapCoords.y + b.mapCoords.height / 2 + 8}"
                          fill="#ffffff"
                          font-size="26"
                          font-weight="bold"
                          text-anchor="middle"
                        >${escapeHtml(b.code)}</text>
                      `;
                    })
                    .join("")}

                  <!-- Línea de ruta desde acceso DASC hasta el edificio destino -->
                  <polyline
                    points="525,700 525,${building.mapCoords.y + building.mapCoords.height / 2} ${building.mapCoords.x + building.mapCoords.width / 2},${building.mapCoords.y + building.mapCoords.height / 2}"
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="14"
                    stroke-dasharray="22 14"
                    stroke-linecap="round"
                  />

                  <!-- Punto móvil del alumno sobre la ruta -->
                  <circle
                    id="ar-minimap-user-dot"
                    cx="525"
                    cy="700"
                    r="24"
                    fill="#10B981"
                    stroke="#ffffff"
                    stroke-width="7"
                  />
                </svg>
              </div>
            </footer>
          </div>
        </div>
      `;

      // Eventos de cierre y cambio a mapa
      const closeBtn = container.querySelector("#btn-ar-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          this.stopCamera();
          window.DASCStore.closeARGuide();
        });
      }

      const toMapBtn = container.querySelector("#btn-ar-to-map");
      if (toMapBtn) {
        toMapBtn.addEventListener("click", () => {
          this.stopCamera();
          window.DASCStore.focusBuildingOnMap({
            buildingId: building.id,
            highlightRoom: target.destinationLabel
          });
        });
      }

      // Control deslizante de simulación de caminata
      const walkSlider = container.querySelector("#ar-walk-slider");
      if (walkSlider) {
        walkSlider.addEventListener("input", (e) => {
          walkProgress = Number(e.target.value);
          updateARTelemetry(container, target, building);
        });
      }

      // Botones de giro de flecha 3D
      container.querySelectorAll("[data-turn]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = Number(btn.getAttribute("data-turn"));
          headingOffset = val === 0 ? 0 : headingOffset + val;
          updateARTelemetry(container, target, building);
        });
      });

      const retryCamBtn = container.querySelector("#btn-retry-cam");
      if (retryCamBtn) {
        retryCamBtn.addEventListener("click", () => {
          this.startCamera(container);
        });
      }

      // Escuchar brújula / giroscopio del teléfono si está disponible
      if (window.DeviceOrientationEvent) {
        orientationHandler = (ev) => {
          if (typeof ev.alpha === "number") {
            const rawHeading = ev.alpha;
            headingOffset = ((target.arBearing - rawHeading + 540) % 360) - 180;
            updateARTelemetry(container, target, building);
          }
        };
        window.addEventListener("deviceorientation", orientationHandler);
      }

      // Iniciar flujo de cámara trasera real
      await this.startCamera(container);
    },

    async startCamera(container) {
      this.stopCamera();
      const videoEl = container.querySelector("#ar-camera-video");
      const statusText = container.querySelector("#ar-cam-status-text");
      const statusDot = container.querySelector("#ar-cam-dot");
      const fallbackBg = container.querySelector("#ar-fallback-bg");

      if (!videoEl) return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (statusText) {
          statusText.textContent = "Modo AR Simulado (Navegador sin API getUserMedia)";
        }
        if (statusDot) statusDot.className = "ar-status-dot simulated";
        return;
      }

      try {
        // Intentar primero cámara trasera (environment) y respaldar con cualquier cámara de video
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false
          });
        } catch (errEnv) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        activeStream = stream;
        videoEl.srcObject = stream;
        await videoEl.play();

        if (fallbackBg) fallbackBg.style.opacity = "0.15";
        if (statusText) statusText.textContent = "Cámara AR Activa · Guía en Tiempo Real";
        if (statusDot) statusDot.className = "ar-status-dot live";
      } catch (err) {
        if (statusText) {
          statusText.textContent =
            "HUD AR Activo (Permiso de cámara no concedido o sin cámara física)";
        }
        if (statusDot) statusDot.className = "ar-status-dot simulated";
      }
    },

    stopCamera() {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
        activeStream = null;
      }
      if (orientationHandler) {
        window.removeEventListener("deviceorientation", orientationHandler);
        orientationHandler = null;
      }
    }
  };

  function updateARTelemetry(container, target, building) {
    const remainingDistance = Math.max(
      0,
      Math.round(target.distanceMeters * (1 - walkProgress / 100))
    );

    const distVal = container.querySelector("#ar-dist-value");
    const beaconDist = container.querySelector("#ar-beacon-dist");
    const timeVal = container.querySelector("#ar-time-value");
    const walkPct = container.querySelector("#ar-walk-pct");
    const arrow3D = container.querySelector("#ar-arrow-3d");
    const instructionText = container.querySelector("#ar-instruction-text");
    const userDot = container.querySelector("#ar-minimap-user-dot");

    if (distVal) distVal.textContent = `${remainingDistance} m`;
    if (beaconDist) {
      beaconDist.textContent =
        remainingDistance === 0 ? "¡Destino alcanzado!" : `${remainingDistance} m al frente`;
    }
    if (timeVal) {
      timeVal.textContent =
        remainingDistance === 0
          ? "0 min"
          : `${Math.max(1, Math.ceil(remainingDistance / 65))} min`;
    }
    if (walkPct) walkPct.textContent = `${walkProgress}%`;

    if (arrow3D) {
      arrow3D.style.transform = `rotateX(58deg) rotateZ(${headingOffset}deg) scale(${
        1 + (walkProgress / 100) * 0.15
      })`;
    }

    if (instructionText) {
      if (remainingDistance === 0) {
        instructionText.textContent = `¡Has llegado a ${target.destinationLabel} (${building.name})!`;
      } else if (remainingDistance <= 15) {
        instructionText.textContent = `Estás frente a ${building.name}. Ingresa y dirígete a ${target.destinationLabel}.`;
      } else {
        instructionText.textContent = target.arInstruction;
      }
    }

    // Interpolar posición del usuario en el minimapa SVG a lo largo de los dos segmentos de la ruta
    if (userDot) {
      const startX = 525;
      const startY = 700;
      const midX = 525;
      const midY = building.mapCoords.y + building.mapCoords.height / 2;
      const endX = building.mapCoords.x + building.mapCoords.width / 2;
      const endY = midY;

      const t = walkProgress / 100;
      let curX, curY;
      if (t < 0.5) {
        const segT = t * 2;
        curX = startX + (midX - startX) * segT;
        curY = startY + (midY - startY) * segT;
      } else {
        const segT = (t - 0.5) * 2;
        curX = midX + (endX - midX) * segT;
        curY = midY + (endY - midY) * segT;
      }
      userDot.setAttribute("cx", String(Math.round(curX)));
      userDot.setAttribute("cy", String(Math.round(curY)));
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
