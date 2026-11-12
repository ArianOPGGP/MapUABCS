/**
 * adminView.js
 * Módulo 5 (Vista de Administrador - RF-09):
 * Gestión CRUD de Profesores del DASC y Eventos asignados a edificios del mapa
 * con persistencia directa en estado y localStorage.
 */

(function () {
  let editingProfessorId = null;
  let editingEventId = null;
  let statusBanner = "";

  window.DASCAdminView = {
    render(container, state) {
      if (!state.user || state.user.role !== "admin") {
        container.innerHTML = `
          <section class="view-section">
            <div class="empty-card">Acceso restringido exclusivamente al rol de Administrador del DASC.</div>
          </section>
        `;
        return;
      }

      const buildings = window.DASCStore.getBuildings();
      const profToEdit = editingProfessorId
        ? state.professors.find((p) => p.id === editingProfessorId)
        : null;
      const eventToEdit = editingEventId
        ? state.events.find((e) => e.id === editingEventId)
        : null;

      container.innerHTML = `
        <section class="view-section admin-section">
          <!-- Cabecera de Consola Administrativa -->
          <div class="section-header-bar admin-header-bar">
            <div class="section-title-group">
              <div class="section-eyebrow">
                <span class="eyebrow-dot gold"></span>
                <span>Consola Administrativa DASC · Persistencia Local</span>
              </div>
              <h2>Panel de Administración DASC</h2>
              <p>Gestión de directorio docente y programación de eventos vinculados a los edificios del campus.</p>
            </div>

            <div class="admin-top-tools">
              <span class="admin-privilege-badge">
                <span class="privilege-dot"></span>
                MODO EDICIÓN PRIVILEGIADA
              </span>
              <button type="button" class="btn-secondary-outline" id="btn-reset-defaults">
                Restaurar Datos Originales
              </button>
            </div>
          </div>

          <!-- Fila de 3 Mini-Tarjetas de Métricas Rápidas (KPI Banner) -->
          <div class="admin-kpi-grid" aria-label="Métricas del sistema">
            <div class="admin-kpi-card">
              <div class="kpi-card-top">
                <span class="kpi-label">TOTAL PROFESORES REGISTRADOS</span>
                <span class="kpi-tag">RF-02 / RF-03</span>
              </div>
              <div class="kpi-card-bottom">
                <strong class="kpi-counter">${state.professors.length}</strong>
                <span class="kpi-sub">Docentes activos en directorio</span>
              </div>
            </div>

            <div class="admin-kpi-card">
              <div class="kpi-card-top">
                <span class="kpi-label">EVENTOS ACTIVOS / PRÓXIMOS</span>
                <span class="kpi-tag">RF-04</span>
              </div>
              <div class="kpi-card-bottom">
                <strong class="kpi-counter">${state.events.length}</strong>
                <span class="kpi-sub">Talleres y conferencias en mapa</span>
              </div>
            </div>

            <div class="admin-kpi-card">
              <div class="kpi-card-top">
                <span class="kpi-label">EDIFICIOS VINCULADOS</span>
                <span class="kpi-sync-badge">
                  <span class="sync-dot"></span>
                  Sync Local Activa
                </span>
              </div>
              <div class="kpi-card-bottom">
                <strong class="kpi-counter">${buildings.length}</strong>
                <span class="kpi-sub">Nodos 2D/3D/360° sincronizados</span>
              </div>
            </div>
          </div>

          ${
            statusBanner
              ? `
            <div class="admin-toast-banner" role="status">
              <span>✓ ${escapeHtml(statusBanner)}</span>
              <button type="button" id="btn-dismiss-toast">✕</button>
            </div>
          `
              : ""
          }

          <div class="admin-modules-stack">
            <!-- MÓDULO ADMIN 1: GESTIÓN DE PROFESORES (Formulario + Data Table) -->
            <section class="admin-module-section" aria-label="Gestión de Profesores">
              <div class="admin-module-bar">
                <div class="admin-module-title">
                  <span class="module-index">01</span>
                  <div>
                    <h3>Directorio de Profesores del DASC</h3>
                    <p>Registro y asignación de cubículos docentes vinculados a edificios del mapa.</p>
                  </div>
                </div>
                <span class="module-count-pill">${state.professors.length} registros</span>
              </div>

              <div class="admin-module-workspace">
                <!-- Columna Izquierda: Formulario Compacto de Profesor -->
                <div class="admin-form-panel ${profToEdit ? "is-editing" : ""}">
                  <div class="admin-card-header">
                    <h3>${profToEdit ? "Editar Profesor del DASC" : "Registrar Profesor del DASC"}</h3>
                    ${
                      profToEdit
                        ? `<button type="button" class="btn-cancel-edit" id="btn-cancel-prof-edit">Cancelar edición</button>`
                        : `<span class="form-mode-tag">NUEVO REGISTRO</span>`
                    }
                  </div>

                  <form id="form-admin-professor" class="admin-form">
                    <input type="hidden" id="prof-id" value="${escapeHtml(profToEdit ? profToEdit.id : "")}" />

                    <div class="form-group">
                      <label for="prof-name">Nombre Completo y Grado Académico</label>
                      <input
                        type="text"
                        id="prof-name"
                        placeholder="Ej. Dr. Jesús Andrés Sandoval Bringas"
                        value="${escapeHtml(profToEdit ? profToEdit.name : "")}"
                        required
                      />
                    </div>

                    <div class="form-row-2">
                      <div class="form-group">
                        <label for="prof-email">Correo Institucional</label>
                        <input
                          type="email"
                          id="prof-email"
                          placeholder="docente@uabcs.mx"
                          value="${escapeHtml(profToEdit ? profToEdit.email : "")}"
                          required
                        />
                      </div>

                      <div class="form-group">
                        <label for="prof-building">Edificio Asignado en Mapa</label>
                        <select id="prof-building" required>
                          ${buildings
                            .map(
                              (b) => `
                            <option value="${escapeHtml(b.id)}" ${
                                profToEdit && profToEdit.buildingId === b.id ? "selected" : ""
                              }>
                              ${escapeHtml(b.code)} · ${escapeHtml(b.shortName)}
                            </option>
                          `
                            )
                            .join("")}
                        </select>
                      </div>
                    </div>

                    <div class="form-row-2">
                      <div class="form-group">
                        <label for="prof-cubicle">Cubículo / Ubicación</label>
                        <input
                          type="text"
                          id="prof-cubicle"
                          placeholder="Ej. Cubículo C-03 (Planta Alta)"
                          value="${escapeHtml(profToEdit ? profToEdit.cubicle : "")}"
                          required
                        />
                      </div>

                      <div class="form-group">
                        <label for="prof-hours">Horario de Atención</label>
                        <input
                          type="text"
                          id="prof-hours"
                          placeholder="Ej. Lunes a Viernes 10:00 - 13:00 hrs"
                          value="${escapeHtml(profToEdit ? profToEdit.officeHours : "Lunes a Viernes 10:00 - 13:00 hrs")}"
                          required
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="prof-role">Cargo / Área de Especialidad</label>
                      <input
                        type="text"
                        id="prof-role"
                        placeholder="Ej. Profesor Investigador · Ingeniería de Software"
                        value="${escapeHtml(profToEdit ? profToEdit.role : "Profesor Académico DASC")}"
                        required
                      />
                    </div>

                    <div class="form-group">
                      <label for="prof-subjects">Materias que imparte (separadas por coma)</label>
                      <input
                        type="text"
                        id="prof-subjects"
                        placeholder="Ej. Ingeniería de Software, Base de Datos Avanzadas"
                        value="${escapeHtml(profToEdit ? (profToEdit.subjects || []).join(", ") : "")}"
                        required
                      />
                    </div>

                    <button type="submit" class="btn-admin-submit">
                      ${profToEdit ? "Guardar Cambios del Profesor" : "+ Agregar Profesor al Directorio"}
                    </button>
                  </form>
                </div>

                <!-- Columna Derecha: Tabla CRUD de Alta Densidad (Profesores) -->
                <div class="admin-table-panel">
                  <div class="admin-table-header">
                    <h4> Catálogo de Profesores Registrados (${state.professors.length})</h4>
                    <span class="table-meta-hint">Cubículo · Correo · Edificio</span>
                  </div>

                  <div class="admin-data-table-wrap">
                    <table class="admin-data-table">
                      <thead>
                        <tr>
                          <th>Docente / Especialidad</th>
                          <th>Cubículo y Correo</th>
                          <th>Edificio</th>
                          <th class="col-actions">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${state.professors
                          .map((p) => {
                            const b = window.DASCStore.getBuildingById(p.buildingId);
                            const isCurrentEdit = editingProfessorId === p.id;
                            return `
                              <tr class="${isCurrentEdit ? "row-editing" : ""}">
                                <td class="cell-primary">
                                  <strong class="table-record-name">${escapeHtml(p.name)}</strong>
                                  <span class="table-record-sub">${escapeHtml(p.role)}</span>
                                </td>
                                <td class="cell-mono">
                                  <span class="mono-line">${escapeHtml(p.cubicle)}</span>
                                  <span class="mono-line muted">${escapeHtml(p.email)}</span>
                                </td>
                                <td class="cell-badge">
                                  <span class="table-building-badge" title="${escapeHtml(b ? b.name : "DASC")}">
                                    ${escapeHtml(b ? b.code : "DASC")}
                                  </span>
                                </td>
                                <td class="cell-actions">
                                  <div class="record-actions">
                                    <button type="button" class="btn-rec-edit" data-edit-prof="${escapeHtml(p.id)}">Editar</button>
                                    <button type="button" class="btn-rec-del" data-del-prof="${escapeHtml(p.id)}" title="Eliminar profesor">Eliminar</button>
                                  </div>
                                </td>
                              </tr>
                            `;
                          })
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <!-- MÓDULO ADMIN 2: GESTIÓN DE EVENTOS Y TALLERES (Formulario + Data Table) -->
            <section class="admin-module-section" aria-label="Gestión de Eventos">
              <div class="admin-module-bar">
                <div class="admin-module-title">
                  <span class="module-index">02</span>
                  <div>
                    <h3>Agenda de Eventos y Talleres Vinculados al Mapa</h3>
                    <p>Publicación de actividades académicas en edificios y laboratorios del DASC.</p>
                  </div>
                </div>
                <span class="module-count-pill">${state.events.length} activos</span>
              </div>

              <div class="admin-module-workspace">
                <!-- Columna Izquierda: Formulario Compacto de Evento -->
                <div class="admin-form-panel ${eventToEdit ? "is-editing" : ""}">
                  <div class="admin-card-header">
                    <h3>${eventToEdit ? "Editar Evento DASC" : "Publicar Nuevo Evento en Mapa"}</h3>
                    ${
                      eventToEdit
                        ? `<button type="button" class="btn-cancel-edit" id="btn-cancel-event-edit">Cancelar edición</button>`
                        : `<span class="form-mode-tag">NUEVO EVENTO</span>`
                    }
                  </div>

                  <form id="form-admin-event" class="admin-form">
                    <input type="hidden" id="evt-id" value="${escapeHtml(eventToEdit ? eventToEdit.id : "")}" />

                    <div class="form-group">
                      <label for="evt-title">Título del Evento o Taller</label>
                      <input
                        type="text"
                        id="evt-title"
                        placeholder="Ej. Taller de Seguridad en Redes y Cloud"
                        value="${escapeHtml(eventToEdit ? eventToEdit.title : "")}"
                        required
                      />
                    </div>

                    <div class="form-row-2">
                      <div class="form-group">
                        <label for="evt-category">Categoría</label>
                        <select id="evt-category" required>
                          ${[
                            "Taller Técnico",
                            "Conferencia DASC",
                            "Hackathon",
                            "Asesoría de Laboratorio",
                            "Seminario IDS"
                          ]
                            .map(
                              (cat) => `
                            <option value="${escapeHtml(cat)}" ${
                                eventToEdit && eventToEdit.category === cat ? "selected" : ""
                              }>
                              ${escapeHtml(cat)}
                            </option>
                          `
                            )
                            .join("")}
                        </select>
                      </div>

                      <div class="form-group">
                        <label for="evt-date">Fecha y Horario</label>
                        <input
                          type="text"
                          id="evt-date"
                          placeholder="Ej. Viernes · 11:00 - 13:00 hrs"
                          value="${escapeHtml(eventToEdit ? eventToEdit.date : "")}"
                          required
                        />
                      </div>
                    </div>

                    <div class="form-row-2">
                      <div class="form-group">
                        <label for="evt-building">Edificio Sede en el Mapa</label>
                        <select id="evt-building" required>
                          ${buildings
                            .map(
                              (b) => `
                            <option value="${escapeHtml(b.id)}" ${
                                eventToEdit && eventToEdit.buildingId === b.id ? "selected" : ""
                              }>
                              ${escapeHtml(b.code)} · ${escapeHtml(b.shortName)}
                            </option>
                          `
                            )
                            .join("")}
                        </select>
                      </div>

                      <div class="form-group">
                        <label for="evt-location">Aula / Laboratorio Específico</label>
                        <input
                          type="text"
                          id="evt-location"
                          placeholder="Ej. Lab C - Edificio DASC"
                          value="${escapeHtml(eventToEdit ? eventToEdit.locationDetail : "")}"
                          required
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="evt-speaker">Ponente / Responsable</label>
                      <input
                        type="text"
                        id="evt-speaker"
                        placeholder="Ej. Dr. Jonathan Giovanni Soto Muñoz"
                        value="${escapeHtml(eventToEdit ? eventToEdit.speaker : "")}"
                        required
                      />
                    </div>

                    <div class="form-group">
                      <label for="evt-desc">Descripción Breve</label>
                      <textarea
                        id="evt-desc"
                        rows="2"
                        placeholder="Describe las actividades y requisitos del evento..."
                        required
                      >${escapeHtml(eventToEdit ? eventToEdit.description : "")}</textarea>
                    </div>

                    <button type="submit" class="btn-admin-submit">
                      ${eventToEdit ? "Actualizar Evento en el Mapa" : "+ Añadir Evento y Vincular al Mapa"}
                    </button>
                  </form>
                </div>

                <!-- Columna Derecha: Tabla CRUD de Alta Densidad (Eventos) -->
                <div class="admin-table-panel">
                  <div class="admin-table-header">
                    <h4>Agenda de Eventos Activos (${state.events.length})</h4>
                    <span class="table-meta-hint">Horario · Sede · Edificio</span>
                  </div>

                  <div class="admin-data-table-wrap">
                    <table class="admin-data-table">
                      <thead>
                        <tr>
                          <th>Evento / Categoría</th>
                          <th>Horario y Aula</th>
                          <th>Edificio</th>
                          <th class="col-actions">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${state.events
                          .map((ev) => {
                            const b = window.DASCStore.getBuildingById(ev.buildingId);
                            const isCurrentEdit = editingEventId === ev.id;
                            return `
                              <tr class="${isCurrentEdit ? "row-editing" : ""}">
                                <td class="cell-primary">
                                  <strong class="table-record-name">${escapeHtml(ev.title)}</strong>
                                  <span class="table-record-sub">${escapeHtml(ev.category)} · ${escapeHtml(ev.speaker)}</span>
                                </td>
                                <td class="cell-mono">
                                  <span class="mono-line">${escapeHtml(ev.locationDetail)}</span>
                                  <span class="mono-line muted">${escapeHtml(ev.date)}</span>
                                </td>
                                <td class="cell-badge">
                                  <span class="table-building-badge" title="${escapeHtml(b ? b.name : "DASC")}">
                                    ${escapeHtml(b ? b.code : "DASC")}
                                  </span>
                                </td>
                                <td class="cell-actions">
                                  <div class="record-actions">
                                    <button type="button" class="btn-rec-edit" data-edit-evt="${escapeHtml(ev.id)}">Editar</button>
                                    <button type="button" class="btn-rec-del" data-del-evt="${escapeHtml(ev.id)}" title="Eliminar evento">Eliminar</button>
                                  </div>
                                </td>
                              </tr>
                            `;
                          })
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      `;

      // Cerrar notificación
      const dismissToast = container.querySelector("#btn-dismiss-toast");
      if (dismissToast) {
        dismissToast.addEventListener("click", () => {
          statusBanner = "";
          window.DASCAdminView.render(container, window.DASCStore.getState());
        });
      }

      // Restaurar valores por defecto
      const resetBtn = container.querySelector("#btn-reset-defaults");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          editingProfessorId = null;
          editingEventId = null;
          statusBanner = "Se restauraron los profesores y eventos originales del DASC.";
          window.DASCStore.resetCatalogsToDefault();
        });
      }

      // Formulario Profesor
      const profForm = container.querySelector("#form-admin-professor");
      if (profForm) {
        profForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const id = profForm.querySelector("#prof-id").value;
          const name = profForm.querySelector("#prof-name").value;
          const email = profForm.querySelector("#prof-email").value;
          const buildingId = profForm.querySelector("#prof-building").value;
          const cubicle = profForm.querySelector("#prof-cubicle").value;
          const officeHours = profForm.querySelector("#prof-hours").value;
          const role = profForm.querySelector("#prof-role").value;
          const subjects = profForm.querySelector("#prof-subjects").value;

          editingProfessorId = null;
          statusBanner = id
            ? `Profesor "${name}" actualizado correctamente.`
            : `Profesor "${name}" agregado al directorio del DASC.`;

          window.DASCStore.saveProfessor({
            id: id || null,
            name,
            email,
            buildingId,
            cubicle,
            officeHours,
            role,
            subjects
          });
        });
      }

      const cancelProfEdit = container.querySelector("#btn-cancel-prof-edit");
      if (cancelProfEdit) {
        cancelProfEdit.addEventListener("click", () => {
          editingProfessorId = null;
          window.DASCAdminView.render(container, window.DASCStore.getState());
        });
      }

      container.querySelectorAll("[data-edit-prof]").forEach((btn) => {
        btn.addEventListener("click", () => {
          editingProfessorId = btn.getAttribute("data-edit-prof");
          window.DASCAdminView.render(container, window.DASCStore.getState());
        });
      });

      container.querySelectorAll("[data-del-prof]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const profId = btn.getAttribute("data-del-prof");
          if (editingProfessorId === profId) editingProfessorId = null;
          statusBanner = "Profesor eliminado del directorio.";
          window.DASCStore.deleteProfessor(profId);
        });
      });

      // Formulario Evento
      const evtForm = container.querySelector("#form-admin-event");
      if (evtForm) {
        evtForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const id = evtForm.querySelector("#evt-id").value;
          const title = evtForm.querySelector("#evt-title").value;
          const category = evtForm.querySelector("#evt-category").value;
          const date = evtForm.querySelector("#evt-date").value;
          const buildingId = evtForm.querySelector("#evt-building").value;
          const locationDetail = evtForm.querySelector("#evt-location").value;
          const speaker = evtForm.querySelector("#evt-speaker").value;
          const description = evtForm.querySelector("#evt-desc").value;

          editingEventId = null;
          statusBanner = id
            ? `Evento "${title}" actualizado en el mapa.`
            : `Evento "${title}" publicado y vinculado al edificio.`;

          window.DASCStore.saveEvent({
            id: id || null,
            title,
            category,
            date,
            buildingId,
            locationDetail,
            speaker,
            description
          });
        });
      }

      const cancelEvtEdit = container.querySelector("#btn-cancel-event-edit");
      if (cancelEvtEdit) {
        cancelEvtEdit.addEventListener("click", () => {
          editingEventId = null;
          window.DASCAdminView.render(container, window.DASCStore.getState());
        });
      }

      container.querySelectorAll("[data-edit-evt]").forEach((btn) => {
        btn.addEventListener("click", () => {
          editingEventId = btn.getAttribute("data-edit-evt");
          window.DASCAdminView.render(container, window.DASCStore.getState());
        });
      });

      container.querySelectorAll("[data-del-evt]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const evtId = btn.getAttribute("data-del-evt");
          if (editingEventId === evtId) editingEventId = null;
          statusBanner = "Evento eliminado de la agenda del DASC.";
          window.DASCStore.deleteEvent(evtId);
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
