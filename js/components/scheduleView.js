/**
 * scheduleView.js
 * Apartado de Horario Escolar conectado a la Base de Datos SQL (uabcs_dasc.sql / uabcs_dasc.sqlite)
 * Muestra la información dividida en SALÓN, MAESTRO y MATERIA para todos los semestres y grupos oficiales de IDS.
 */

(function () {
  let activeDisplayTab = "both"; // 'both' | 'weekly' | 'cards' | 'sqltables'

  function getGroupOptionsForSemester(sem) {
    const s = Number(sem);
    if (s === 1) {
      return [
        { value: "Matutino|A", label: "Matutino · Grupo A (TM-A)" },
        { value: "Matutino|B", label: "Matutino · Grupo B (TM-B)" },
        { value: "Vespertino|A", label: "Vespertino · Grupo A (TV-A)" },
        { value: "Vespertino|B", label: "Vespertino · Grupo B (TV-B)" }
      ];
    }
    if (s === 3 || s === 5) {
      return [
        { value: "Matutino|A", label: "Matutino · Grupo A (TM-A)" },
        { value: "Matutino|B", label: "Matutino · Grupo B (TM-B)" },
        { value: "Vespertino|A", label: "Vespertino · Grupo Único (TV)" }
      ];
    }
    return [
      { value: "Matutino|A", label: "Matutino · Grupo Único (TM)" },
      { value: "Vespertino|A", label: "Vespertino · Grupo Único (TV)" }
    ];
  }

  window.DASCScheduleView = {
    render(container, state) {
      if (!state.user) {
        window.DASCAuthView.render(container);
        return;
      }

      const currentSem = Number(state.user.semestre || state.user.semester || 5);
      const currentTurno = state.user.turno || "Matutino";
      const currentGrupo = state.user.grupo || "A";
      const currentGroupKey = `${currentTurno}|${currentGrupo}`;
      const groupOptions = getGroupOptionsForSemester(currentSem);

      const scheduleData =
        state.currentScheduleData ||
        window.DASCStore.getScheduleFromSQL(currentSem, currentTurno, currentGrupo);

      const groupedSubjects = scheduleData.groupedSubjects || [];
      const rows = scheduleData.sessions || scheduleData.rows || [];

      const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
      const timeSlots = Array.from(
        new Set(rows.map((r) => `${r.hora_inicio} - ${r.hora_fin}`))
      ).sort((a, b) => {
        const toMin = (str) => {
          const [h, m] = str.split(" - ")[0].split(":").map(Number);
          return h * 60 + (m || 0);
        };
        return toMin(a) - toMin(b);
      });

      const uniqueSalones = new Set(rows.map((r) => r.salon_codigo)).size;
      const uniqueMaestros = new Set(rows.map((r) => r.maestro_nombre)).size;
      const uniqueMaterias = groupedSubjects.length;

      container.innerHTML = `
        <section class="view-section schedule-section">
          <div class="section-header-bar schedule-header-sql">
            <div class="section-title-group">
              <div class="section-eyebrow">
                <span class="eyebrow-dot"></span>
                <span>INGENIERÍA EN DESARROLLO DE SOFTWARE · BASE DE DATOS SQL</span>
              </div>
              <h2>
                Horario Oficial · ${escapeHtml(currentSem)}° Semestre · Turno ${escapeHtml(currentTurno)} · Grupo ${escapeHtml(currentGrupo)}
              </h2>
              <p>
                Sesión activa: <strong>${escapeHtml(state.user.correo || state.user.name)}</strong> ·
                Información consultada mediante <code>JOIN</code> entre las tablas SQL <code>salones</code>, <code>maestros</code>, <code>materias</code> y <code>horarios</code>.
              </p>
            </div>

            <div class="schedule-sql-filters">
              <div class="filter-field">
                <label for="schedule-semestre-select" class="control-label">Semestre:</label>
                <select id="schedule-semestre-select" class="select-control">
                  ${[1, 3, 5, 7, 9]
                    .map(
                      (sem) => `
                    <option value="${sem}" ${sem === currentSem ? "selected" : ""}>
                      ${sem}° Semestre IDS
                    </option>
                  `
                    )
                    .join("")}
                </select>
              </div>

              <div class="filter-field">
                <label for="schedule-grupo-select" class="control-label">Turno y Grupo:</label>
                <select id="schedule-grupo-select" class="select-control">
                  ${groupOptions
                    .map(
                      (opt) => `
                    <option value="${escapeHtml(opt.value)}" ${
                        opt.value === currentGroupKey ? "selected" : ""
                      }>
                      ${escapeHtml(opt.label)}
                    </option>
                  `
                    )
                    .join("")}
                </select>
              </div>
            </div>
          </div>

          <div class="sql-summary-strip">
            <div class="sql-entity-pills">
              <div class="sql-entity-pill">
                <span class="entity-tag blue">TABLA MATERIAS</span>
                <strong>${uniqueMaterias} Materias en el grupo</strong>
              </div>
              <div class="sql-entity-pill">
                <span class="entity-tag gold">TABLA MAESTROS</span>
                <strong>${uniqueMaestros} Maestros asignados</strong>
              </div>
              <div class="sql-entity-pill">
                <span class="entity-tag emerald">TABLA SALONES</span>
                <strong>${uniqueSalones} Salones / Labs utilizados</strong>
              </div>
            </div>

            <div class="schedule-view-switcher" role="tablist">
              <button
                type="button"
                class="view-switch-btn ${activeDisplayTab === "both" ? "active" : ""}"
                data-sched-tab="both"
              >
                Vista Completa
              </button>
              <button
                type="button"
                class="view-switch-btn ${activeDisplayTab === "weekly" ? "active" : ""}"
                data-sched-tab="weekly"
              >
                Tabla Semanal
              </button>
              <button
                type="button"
                class="view-switch-btn ${activeDisplayTab === "cards" ? "active" : ""}"
                data-sched-tab="cards"
              >
                Por Materia / Maestro / Salón
              </button>
              <button
                type="button"
                class="view-switch-btn ${activeDisplayTab === "sqltables" ? "active" : ""}"
                data-sched-tab="sqltables"
              >
                Catálogo SQL Completo
              </button>
            </div>
          </div>

          ${
            activeDisplayTab === "both" || activeDisplayTab === "weekly"
              ? renderWeeklyTimetable(timeSlots, diasSemana, rows)
              : ""
          }

          ${
            activeDisplayTab === "both" || activeDisplayTab === "cards"
              ? renderSubjectCardsGrid(groupedSubjects)
              : ""
          }

          ${activeDisplayTab === "sqltables" ? renderFullSQLCatalog() : ""}
        </section>
      `;

      const semSelect = container.querySelector("#schedule-semestre-select");
      if (semSelect) {
        semSelect.addEventListener("change", (e) => {
          const newSem = Number(e.target.value) || 5;
          const validOpts = getGroupOptionsForSemester(newSem);
          const [defTurno, defGrupo] = validOpts[0].value.split("|");
          window.DASCStore.updateStudentScheduleGroup({
            semestre: newSem,
            turno: defTurno,
            grupo: defGrupo
          });
        });
      }

      const grpSelect = container.querySelector("#schedule-grupo-select");
      if (grpSelect) {
        grpSelect.addEventListener("change", (e) => {
          const [newTurno, newGrupo] = String(e.target.value || "Matutino|A").split("|");
          window.DASCStore.updateStudentScheduleGroup({
            semestre: currentSem,
            turno: newTurno || "Matutino",
            grupo: newGrupo || "A"
          });
        });
      }

      container.querySelectorAll("[data-sched-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeDisplayTab = btn.getAttribute("data-sched-tab") || "both";
          window.DASCScheduleView.render(container, window.DASCStore.getState());
        });
      });

      container.querySelectorAll('[data-action="guide-ar"]').forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const buildingId = btn.getAttribute("data-building-id");
          const classroom = btn.getAttribute("data-classroom");
          const subject = btn.getAttribute("data-subject");
          const professor = btn.getAttribute("data-professor");
          window.DASCStore.openARGuide({
            buildingId,
            destinationLabel: classroom,
            subject,
            professor
          });
        });
      });

      container.querySelectorAll('[data-action="view-map"]').forEach((el) => {
        const triggerMap = (e) => {
          if (e.target.closest('[data-action="guide-ar"]')) return;
          const buildingId = el.getAttribute("data-building-id");
          const classroom = el.getAttribute("data-classroom");
          window.DASCStore.focusBuildingOnMap({
            buildingId: buildingId || "dsc-39",
            highlightRoom: classroom
          });
        };

        el.addEventListener("click", triggerMap);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (e.target.closest('[data-action="guide-ar"]')) return;
            e.preventDefault();
            triggerMap(e);
          }
        });
      });
    }
  };

  function renderWeeklyTimetable(timeSlots, diasSemana, rows) {
    return `
      <div class="schedule-block-container">
        <div class="schedule-subblock-header">
          <div>
            <h3>Tabla de Horario Semanal Oficial (Lunes a Viernes)</h3>
            <p>Haz clic en cualquier bloque para ubicar su <strong>Salón</strong> en el Mapa 2D/3D del Campus.</p>
          </div>
          <span class="sql-query-badge">SELECT * FROM horarios JOIN materias JOIN maestros JOIN salones</span>
        </div>

        <div class="weekly-table-scroll">
          <table class="weekly-schedule-table">
            <thead>
              <tr>
                <th class="col-hour">Hora</th>
                ${diasSemana.map((d) => `<th>${escapeHtml(d)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${timeSlots
                .map((slot) => {
                  const [start, end] = slot.split(" - ");
                  return `
                  <tr>
                    <td class="cell-hour">
                      <span class="hour-range">${escapeHtml(start)}</span>
                      <span class="hour-sep">a ${escapeHtml(end)}</span>
                    </td>
                    ${diasSemana
                      .map((dia) => {
                        const cellRow = rows.find(
                          (r) =>
                            (r.dia || r.dia_semana) === dia &&
                            `${r.hora_inicio} - ${r.hora_fin}` === slot
                        );
                        if (!cellRow) {
                          return `<td class="cell-empty">—</td>`;
                        }
                        const buildingId =
                          cellRow.edificio_id ||
                          (cellRow.edificio_codigo === "DSC-46" ? "dsc-46" : "dsc-39");
                        return `
                          <td
                            class="cell-class"
                            data-action="view-map"
                            data-building-id="${escapeHtml(buildingId)}"
                            data-classroom="${escapeHtml(cellRow.salon_codigo)} (${escapeHtml(cellRow.salon_nombre)})"
                            role="button"
                            tabindex="0"
                            title="Clic para ubicar ${escapeHtml(cellRow.salon_codigo)} en el mapa"
                          >
                            <div class="tt-subject">${escapeHtml(cellRow.materia_nombre)}</div>
                            <div class="tt-teacher">
                              <span class="tt-lbl">Maestro:</span> ${escapeHtml(cellRow.maestro_nombre)}
                            </div>
                            <div class="tt-room-row">
                              <span class="tt-room-badge">${escapeHtml(cellRow.salon_codigo)}</span>
                              <span class="tt-bldg-tag">${escapeHtml(cellRow.edificio_codigo)}</span>
                            </div>
                          </td>
                        `;
                      })
                      .join("")}
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSubjectCardsGrid(groupedSubjects) {
    return `
      <div class="schedule-block-container">
        <div class="schedule-subblock-header">
          <div>
            <h3>Desglose por Materia, Maestro y Salón (${groupedSubjects.length} Asignaturas)</h3>
            <p>Información normalizada desde la base de datos SQL para tu semestre y grupo.</p>
          </div>
        </div>

        <div class="schedule-grid">
          ${groupedSubjects
            .map((cls) => {
              const building = window.DASCStore.getBuildingById(cls.buildingId);
              const buildingCode = building ? building.code : cls.buildingCode || "DSC-39";
              const sessionsList = cls.sessions || cls.bloques || [];

              return `
                <article
                  class="class-card sql-divided-card"
                  data-class-id="${escapeHtml(cls.id)}"
                  data-action="view-map"
                  data-building-id="${escapeHtml(cls.buildingId)}"
                  data-classroom="${escapeHtml(cls.classroom)}"
                  role="button"
                  tabindex="0"
                  title="Ver ${escapeHtml(cls.classroom)} en el mapa 2D/3D"
                >
                  <div class="class-card-top">
                    <div class="class-meta-badges">
                      <span class="class-time-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ${escapeHtml(cls.time)}
                      </span>
                      <span class="class-code-badge">${escapeHtml(cls.code)}</span>
                    </div>

                    <button
                      type="button"
                      class="btn-action-ar btn-card-ar-quick"
                      data-action="guide-ar"
                      data-building-id="${escapeHtml(cls.buildingId)}"
                      data-classroom="${escapeHtml(cls.classroom)}"
                      data-subject="${escapeHtml(cls.subject)}"
                      data-professor="${escapeHtml(cls.professor)}"
                      title="Iniciar AR hacia ${escapeHtml(cls.classroom)}"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                      </svg>
                    </button>
                  </div>

                  <!-- División Explícita SQL: 1. MATERIA, 2. MAESTRO, 3. SALÓN -->
                  <div class="sql-triad-list">
                    <div class="sql-triad-item">
                      <span class="triad-tag blue">MATERIA</span>
                      <h4 class="class-subject">${escapeHtml(cls.subject)}</h4>
                    </div>

                    <div class="sql-triad-item">
                      <span class="triad-tag gold">MAESTRO</span>
                      <p class="class-professor">${escapeHtml(cls.professor)}</p>
                    </div>

                    <div class="sql-triad-item">
                      <span class="triad-tag emerald">SALÓN</span>
                      <p class="class-salon-detail">
                        <strong>${escapeHtml(cls.classroom)}</strong> · Edificio ${escapeHtml(buildingCode)}
                      </p>
                    </div>
                  </div>

                  <div class="class-days-pills">
                    ${sessionsList
                      .map(
                        (b) => `
                      <span class="day-slot-chip">
                        <strong>${escapeHtml(String(b.dia || "").slice(0, 3))}:</strong> ${escapeHtml(b.bloque || b.hora)} (${escapeHtml(b.salon_codigo || b.salon)})
                      </span>
                    `
                      )
                      .join("")}
                  </div>

                  <div class="class-card-footer">
                    <span class="detail-location class-room-badge">
                      ${escapeHtml(buildingCode)} • ${escapeHtml(cls.classroomCode || cls.salonCodigo || cls.classroom)}
                    </span>
                    <span class="class-map-hint">
                      <span>Ubicar salón en mapa</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function renderFullSQLCatalog() {
    const sqlData = window.DASCStore.getSQLData();
    const salones = sqlData.salones || [];
    const maestros = sqlData.maestros || [];
    const materias = sqlData.materias || [];

    return `
      <div class="sql-catalog-grid">
        <div class="sql-catalog-panel">
          <div class="sql-panel-head">
            <span class="entity-tag emerald">TABLA SQL 1</span>
            <h3><code>salones</code> (${salones.length} registros)</h3>
          </div>
          <div class="sql-table-wrap">
            <table class="sql-mini-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre del Salón / Lab</th>
                  <th>Edificio</th>
                </tr>
              </thead>
              <tbody>
                ${salones
                  .map(
                    (s) => `
                  <tr
                    class="clickable-sql-row"
                    data-action="view-map"
                    data-building-id="${escapeHtml(s.edificio_id || (s.edificio_codigo === "DSC-46" ? "dsc-46" : "dsc-39"))}"
                    data-classroom="${escapeHtml(s.codigo)} (${escapeHtml(s.nombre)})"
                    title="Clic para ubicar ${escapeHtml(s.codigo)} en el mapa"
                  >
                    <td><code>#${s.id || s.id_salon}</code></td>
                    <td><strong>${escapeHtml(s.codigo)}</strong></td>
                    <td>${escapeHtml(s.nombre)}</td>
                    <td><span class="tt-bldg-tag">${escapeHtml(s.edificio_codigo)}</span></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="sql-catalog-panel">
          <div class="sql-panel-head">
            <span class="entity-tag blue">TABLA SQL 2</span>
            <h3><code>materias</code> (${materias.length} registros)</h3>
          </div>
          <div class="sql-table-wrap">
            <table class="sql-mini-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Semestre</th>
                  <th>Nombre de la Materia</th>
                </tr>
              </thead>
              <tbody>
                ${materias
                  .map(
                    (m) => `
                  <tr>
                    <td><code>#${m.id || m.id_materia}</code></td>
                    <td><strong>${escapeHtml(m.semestre)}° Sem</strong></td>
                    <td>${escapeHtml(m.nombre)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="sql-catalog-panel full-span">
          <div class="sql-panel-head">
            <span class="entity-tag gold">TABLA SQL 3</span>
            <h3><code>maestros</code> (${maestros.length} docentes en horarios IDS)</h3>
          </div>
          <div class="sql-table-wrap">
            <table class="sql-mini-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Grado</th>
                  <th>Nombre Completo del Maestro</th>
                  <th>Correo Institucional</th>
                  <th>Ubicación / Cubículo</th>
                </tr>
              </thead>
              <tbody>
                ${maestros
                  .map(
                    (p) => `
                  <tr>
                    <td><code>#${p.id || p.id_maestro}</code></td>
                    <td>${escapeHtml(p.grado || p.titulo || "Prof.")}</td>
                    <td><strong>${escapeHtml(p.nombre || p.nombre_completo)}</strong></td>
                    <td><code>${escapeHtml(p.correo || "dasc@uabcs.mx")}</code></td>
                    <td>${escapeHtml(p.oficina || p.cubiculo || "Edificio DSC-39")}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
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
