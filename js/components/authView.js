/**
 * authView.js
 * Módulo de Acceso exclusivo para el apartado de HORARIO:
 * - Iniciar Sesión: Correo Institucional y Contraseña (validado contra tabla SQL `usuarios`)
 * - Crear Sesión (Registro): Correo Institucional, Crear Contraseña y Seleccionar Semestre y Grupo (guardado en SQL `usuarios`)
 */

(function () {
  let activeMode = "login"; // 'login' | 'register'
  let authError = "";
  let authSuccess = "";
  let isSubmitting = false;

  // Valores temporales del formulario de registro para conservar selección
  let regFormState = {
    correo: "",
    password: "",
    semestre: "5",
    grupoTurno: "Matutino|A"
  };

  window.DASCAuthView = {
    render(container) {
      container.innerHTML = `
        <section class="view-section auth-gate-section">
          <div class="auth-card auth-split-layout">
            <!-- Columna Izquierda: Formulario de Inicio de Sesión / Creación de Sesión SQL -->
            <div class="auth-form-pane">
              <div class="auth-brand-row">
                <div class="auth-brand-emblem">
                  <span class="emblem-top">UABCS</span>
                  <span class="emblem-bot">DASC</span>
                </div>
                <div class="auth-brand-meta">
                  <span class="brand-inst">Acceso al Apartado de Horario Escolar</span>
                  <span class="brand-dept">Ingeniería en Desarrollo de Software · Base SQL</span>
                </div>
              </div>

              <div class="auth-header">
                <h2>${
                  activeMode === "login"
                    ? "Iniciar Sesión en Horario"
                    : "Crear Sesión de Estudiante"
                }</h2>
                <p>${
                  activeMode === "login"
                    ? "Ingresa tu correo institucional y contraseña para consultar tu horario oficial dividido en Salón, Maestro y Materia."
                    : "Registra tu correo institucional, crea una contraseña y selecciona tu semestre y grupo. Tu cuenta quedará guardada en la base de datos SQL."
                }</p>
              </div>

              <div class="auth-role-switch" role="tablist" aria-label="Modo de autenticación">
                <button
                  type="button"
                  class="role-switch-btn ${activeMode === "login" ? "active" : ""}"
                  data-auth-mode="login"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  class="role-switch-btn ${activeMode === "register" ? "active" : ""}"
                  data-auth-mode="register"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  <span>Crear Sesión</span>
                </button>
              </div>

              ${
                authError
                  ? `<div class="auth-alert" role="alert">${escapeHtml(authError)}</div>`
                  : ""
              }
              ${
                authSuccess
                  ? `<div class="auth-success-banner" role="status">${escapeHtml(authSuccess)}</div>`
                  : ""
              }

              ${activeMode === "login" ? renderLoginForm() : renderRegisterForm()}

              <div class="auth-footer-meta">
                <button type="button" class="btn-link-back-home" id="btn-auth-back-home">
                  ← Volver a Página de Inicio
                </button>
                <span>TABLA SQL: <code>usuarios</code></span>
              </div>
            </div>

            <!-- Columna Derecha: Resumen de Base de Datos SQL de Horarios -->
            <div class="auth-visual-pane" aria-hidden="true">
              <div class="auth-visual-header">
                <span class="visual-coord-tag">CONEXIÓN SQL · HORARIOS OFICIALES IDS</span>
                <span class="visual-live-indicator">
                  <span class="live-dot"></span>
                  SQLITE3 ACTIVO
                </span>
              </div>

              <div class="auth-sql-preview-box">
                <div class="sql-schema-diagram">
                  <div class="sql-table-pill gold">
                    <strong>Tabla: <code>usuarios</code></strong>
                    <span>id_usuario · correo_institucional · password_hash · semestre · turno · grupo</span>
                  </div>

                  <div class="sql-join-arrow">↓ Consulta Relacional SQL (JOIN) ↓</div>

                  <div class="sql-tables-trio">
                    <div class="sql-table-mini">
                      <span class="mini-tag">Tabla 1</span>
                      <strong><code>salones</code></strong>
                      <small>LAB A, LAB F, LAB G, LR, T1, T2, SC2-JAVA, SC5-PROLOG, SC10..SC17</small>
                    </div>
                    <div class="sql-table-mini">
                      <span class="mini-tag">Tabla 2</span>
                      <strong><code>maestros</code></strong>
                      <small>55 Docentes oficiales del DASC asignados por materia</small>
                    </div>
                    <div class="sql-table-mini">
                      <span class="mini-tag">Tabla 3</span>
                      <strong><code>materias</code></strong>
                      <small>31 Asignaturas oficiales de 1°, 3°, 5°, 7° y 9° Semestre</small>
                    </div>
                  </div>

                  <div class="sql-join-arrow">↓ Resultado Automático ↓</div>

                  <div class="sql-table-pill blue">
                    <strong>Tabla: <code>horarios</code> (215 Bloques Oficiales)</strong>
                    <span>Horario personalizado por Semestre, Turno (Matutino/Vespertino) y Grupo (A/B)</span>
                  </div>
                </div>
              </div>

              <div class="auth-visual-footer">
                <div class="visual-status-badges">
                  <span class="visual-status-badge">
                    <span class="status-badge-dot blue"></span>
                    17 Salones · 55 Maestros · 31 Materias
                  </span>
                  <span class="visual-status-badge">
                    <span class="status-badge-dot gold"></span>
                    Persistencia SQL en Tiempo Real
                  </span>
                </div>
                <p class="visual-caption">
                  Los datos de tu cuenta (correo institucional, contraseña, semestre y grupo) se almacenan directamente en la base de datos SQL del servidor.
                </p>
              </div>
            </div>
          </div>
        </section>
      `;

      // Cambiar entre Iniciar Sesión y Crear Sesión
      container.querySelectorAll("[data-auth-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeMode = btn.getAttribute("data-auth-mode");
          authError = "";
          authSuccess = "";
          window.DASCAuthView.render(container);
        });
      });

      // Botón volver a Inicio
      const backHomeBtn = container.querySelector("#btn-auth-back-home");
      if (backHomeBtn) {
        backHomeBtn.addEventListener("click", () => {
          window.DASCStore.setView("inicio");
        });
      }

      // Eventos de Login
      const loginForm = container.querySelector("#form-sql-login");
      if (loginForm) {
        const fillDemoBtn = container.querySelector("#btn-fill-demo-student");
        if (fillDemoBtn) {
          fillDemoBtn.addEventListener("click", () => {
            loginForm.querySelector("#login-correo").value = "alumno@alu.uabcs.mx";
            loginForm.querySelector("#login-password").value = "uabcs2026";
          });
        }

        loginForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (isSubmitting) return;

          const correo = loginForm.querySelector("#login-correo").value.trim();
          const password = loginForm.querySelector("#login-password").value;

          if (!correo || !password) {
            authError = "Ingresa tu correo institucional y tu contraseña.";
            window.DASCAuthView.render(container);
            return;
          }

          isSubmitting = true;
          authError = "";
          const result = await window.DASCStore.loginWithInstitutionalEmail({
            correo,
            password
          });
          isSubmitting = false;

          if (!result.ok) {
            authError = result.error || "No fue posible iniciar sesión.";
            window.DASCAuthView.render(container);
          }
        });
      }

      // Eventos de Registro (Crear Sesión)
      const registerForm = container.querySelector("#form-sql-register");
      if (registerForm) {
        const semSelect = registerForm.querySelector("#reg-semestre");
        const grpSelect = registerForm.querySelector("#reg-grupo-turno");

        if (semSelect && grpSelect) {
          semSelect.addEventListener("change", () => {
            regFormState.correo = registerForm.querySelector("#reg-correo").value;
            regFormState.password = registerForm.querySelector("#reg-password").value;
            regFormState.semestre = semSelect.value;
            const validOptions = getAvailableGroupOptionsForSemester(semSelect.value);
            regFormState.grupoTurno = validOptions[0].value;
            window.DASCAuthView.render(container);
          });
        }

        registerForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          if (isSubmitting) return;

          const correo = registerForm.querySelector("#reg-correo").value.trim();
          const password = registerForm.querySelector("#reg-password").value;
          const semestre = Number(registerForm.querySelector("#reg-semestre").value) || 5;
          const rawGrupoTurno = registerForm.querySelector("#reg-grupo-turno").value || "Matutino|A";
          const [turno, grupo] = rawGrupoTurno.split("|");

          if (!correo || !correo.includes("@")) {
            authError = "Ingresa un correo institucional válido (ej. usuario@alu.uabcs.mx).";
            window.DASCAuthView.render(container);
            return;
          }
          if (!password || password.length < 4) {
            authError = "La contraseña debe tener al menos 4 caracteres.";
            window.DASCAuthView.render(container);
            return;
          }

          isSubmitting = true;
          authError = "";
          const result = await window.DASCStore.registerStudentAccount({
            correo,
            password,
            semestre,
            turno: turno || "Matutino",
            grupo: grupo || "A"
          });
          isSubmitting = false;

          if (!result.ok) {
            authError = result.error || "Error al crear la cuenta en la base de datos.";
            window.DASCAuthView.render(container);
          }
        });
      }
    }
  };

  function renderLoginForm() {
    return `
      <form id="form-sql-login" class="auth-form" autocomplete="on">
        <div class="form-group">
          <label for="login-correo">Correo Institucional UABCS</label>
          <input
            type="email"
            id="login-correo"
            name="correo"
            placeholder="ejemplo@alu.uabcs.mx"
            value="alumno@alu.uabcs.mx"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">Contraseña</label>
          <input
            type="password"
            id="login-password"
            name="password"
            placeholder="••••••••"
            value="uabcs2026"
            required
          />
        </div>

        <div class="admin-cred-hint">
          <span>Cuenta institucional demo: <strong>alumno@alu.uabcs.mx</strong> / <strong>uabcs2026</strong></span>
          <button type="button" class="btn-link-gold" id="btn-fill-demo-student">Autocompletar</button>
        </div>

        <button type="submit" class="btn-primary btn-block auth-submit-btn">
          <span>Iniciar Sesión y Ver Horario</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </form>
    `;
  }

  function getAvailableGroupOptionsForSemester(sem) {
    const s = Number(sem);
    if (s === 1) {
      return [
        { value: "Matutino|A", label: "Grupo A · Turno Matutino (1° TM-A)" },
        { value: "Matutino|B", label: "Grupo B · Turno Matutino (1° TM-B)" },
        { value: "Vespertino|A", label: "Grupo A · Turno Vespertino (1° TV-A)" },
        { value: "Vespertino|B", label: "Grupo B · Turno Vespertino (1° TV-B)" }
      ];
    }
    if (s === 3 || s === 5) {
      return [
        { value: "Matutino|A", label: `Grupo A · Turno Matutino (${s}° TM-A)` },
        { value: "Matutino|B", label: `Grupo B · Turno Matutino (${s}° TM-B)` },
        { value: "Vespertino|A", label: `Grupo A · Turno Vespertino (${s}° TV)` }
      ];
    }
    return [
      { value: "Matutino|A", label: `Grupo A · Turno Matutino (${s}° TM)` },
      { value: "Vespertino|A", label: `Grupo A · Turno Vespertino (${s}° TV)` }
    ];
  }

  function renderRegisterForm() {
    const groupOptions = getAvailableGroupOptionsForSemester(regFormState.semestre);

    return `
      <form id="form-sql-register" class="auth-form" autocomplete="on">
        <div class="form-group">
          <label for="reg-correo">Correo Institucional (@alu.uabcs.mx / @uabcs.mx)</label>
          <input
            type="email"
            id="reg-correo"
            name="correo"
            placeholder="tu.correo@alu.uabcs.mx"
            value="${escapeHtml(regFormState.correo)}"
            required
          />
        </div>

        <div class="form-group">
          <label for="reg-password">Crear Contraseña</label>
          <input
            type="password"
            id="reg-password"
            name="password"
            placeholder="Mínimo 4 caracteres"
            value="${escapeHtml(regFormState.password)}"
            required
          />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="reg-semestre">Seleccionar Semestre (IDS)</label>
            <select id="reg-semestre" name="semestre" required>
              <option value="1" ${regFormState.semestre === "1" ? "selected" : ""}>1° Semestre IDS</option>
              <option value="3" ${regFormState.semestre === "3" ? "selected" : ""}>3° Semestre IDS</option>
              <option value="5" ${regFormState.semestre === "5" ? "selected" : ""}>5° Semestre IDS</option>
              <option value="7" ${regFormState.semestre === "7" ? "selected" : ""}>7° Semestre IDS</option>
              <option value="9" ${regFormState.semestre === "9" ? "selected" : ""}>9° Semestre IDS</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reg-grupo-turno">Seleccionar Grupo y Turno</label>
            <select id="reg-grupo-turno" name="grupoTurno" required>
              ${groupOptions
                .map(
                  (opt) => `
                <option value="${escapeHtml(opt.value)}" ${
                    regFormState.grupoTurno === opt.value ? "selected" : ""
                  }>
                  ${escapeHtml(opt.label)}
                </option>
              `
                )
                .join("")}
            </select>
          </div>
        </div>

        <button type="submit" class="btn-primary btn-block auth-submit-btn">
          <span>Crear Sesión y Guardar en Base de Datos SQL</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </form>
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
