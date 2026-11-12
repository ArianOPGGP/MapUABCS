/**
 * store.js
 * Gestor centralizado de estado y conexión a la Base de Datos SQL (API /api/* + Respaldo SQL Local)
 * Unifica los catálogos oficiales de Maps UABCS (window.CAMPUS, window.AULAS_DASC, window.CAMPUS_RUTAS, window.PANORAMAS, window.EVENTOS_UABCS)
 * con el sistema de Horarios SQL de Ingeniería en Desarrollo de Software.
 */

(function () {
  const STORAGE_KEYS = {
    USER: "dasc_uabcs_sql_user_v2",
    LOCAL_USERS: "dasc_uabcs_sql_registered_users_v2",
    PROFESSORS: "dasc_uabcs_professors_v2",
    EVENTS: "dasc_uabcs_events_v2"
  };

  // Mapeo bidireccional entre IDs legados (mockData / SQL) e IDs geográficos oficiales de CAMPUS (edificios.js)
  const LEGACY_TO_CAMPUS_ID = {
    "dsc-39": "dasc",
    "dsc39": "dasc",
    "dasc": "dasc",
    "dsc-46": "dasc-ii",
    "dsc46": "dasc-ii",
    "dasc-ii": "dasc-ii",
    "dsc-46b": "nuevo-dasc",
    "nuevo-dasc": "nuevo-dasc",
    "ad-20": "biblioteca",
    "biblioteca": "biblioteca",
    "ad-19": "rectoria",
    "rectoria": "rectoria",
    "ad-52": "poliforo",
    "poliforo": "poliforo",
    "ad-18": "dele",
    "dele": "dele",
    "ad-55": "servicios-escolares",
    "control-escolar": "control-escolar",
    "servicios-escolares": "servicios-escolares",
    "ad-65": "ctic",
    "ctic": "ctic",
    "ad-01": "gimnasio",
    "gimnasio": "gimnasio",
    "ad-58": "campo-uabcs",
    "campo-uabcs": "campo-uabcs",
    "ad-21": "centro-medico",
    "centro-medico": "centro-medico",
    "ad-10": "cafeteria",
    "cafeteria": "cafeteria",
    "ad-59": "caseta-vigilancia",
    "caseta-vigilancia": "caseta-vigilancia",
    "ad-40": "edificio-redes",
    "edificio-redes": "edificio-redes",
    "planta-tratamiento": "edificio-redes",
    "csh-02": "auditorio-ciencias-sociales",
    "cmt-03": "biologia-marina",
    "ca-04": "ciencias-agropecuarias-1"
  };

  function safeParse(jsonStr, fallback) {
    try {
      return jsonStr ? JSON.parse(jsonStr) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // Construir catálogo unificado de edificios combinando window.CAMPUS.edificios + window.DASC_MOCK_DATA.buildings
  function buildUnifiedBuildingsCatalog() {
    const mockBuildings = (window.DASC_MOCK_DATA && window.DASC_MOCK_DATA.buildings) || [];
    const campusEdificios = (window.CAMPUS && window.CAMPUS.edificios) || [];
    const aulasCatalog = (window.AULAS_DASC && window.AULAS_DASC.salones) || [];

    const mockByCampusId = new Map();
    mockBuildings.forEach((mb) => {
      const mappedCampusId = LEGACY_TO_CAMPUS_ID[String(mb.id).toLowerCase()] || String(mb.id).toLowerCase();
      mockByCampusId.set(mappedCampusId, mb);
    });

    const unified = [];
    const seenCampusIds = new Set();

    campusEdificios.forEach((ce) => {
      if (ce.esVialidad) return; // Ignorar vialidades en el listado de edificios
      seenCampusIds.add(ce.id);
      const mockMatch = mockByCampusId.get(ce.id) || null;
      const aulasInBuilding = aulasCatalog.filter(
        (a) => a.edificioId === ce.id || String(a.edificioLegacy || "").toLowerCase() === String(mockMatch?.id || "").toLowerCase()
      );

      const categoryMap = {
        sistemas: "dasc",
        administracion: "administrativo",
        escolar: "academico",
        cultura: "servicios",
        deportes: "deportivo",
        servicios: "servicios",
        pecuario: "academico"
      };

      const legacyId =
        ce.id === "dasc"
          ? "dsc-39"
          : ce.id === "dasc-ii"
          ? "dsc-46"
          : ce.id === "nuevo-dasc"
          ? "dsc-46b"
          : mockMatch
          ? mockMatch.id
          : ce.id;

      unified.push({
        id: legacyId,
        campusId: ce.id,
        code: ce.codigoMapa || (mockMatch && mockMatch.code) || ce.id.toUpperCase(),
        codigoMapa: ce.codigoMapa || (mockMatch && mockMatch.code) || "S/N",
        name: ce.nombre,
        shortName: (mockMatch && mockMatch.shortName) || ce.nombre,
        category: categoryMap[ce.categoria] || (mockMatch && mockMatch.category) || "academico",
        campusCategory: ce.categoria || "escolar",
        color: ce.color || "#3B82F6",
        icono: ce.icono || "bi-building",
        imagen: ce.imagen || "./img/uabcs.jpg",
        centro: ce.centro || [24.10275, -110.31602],
        coords: ce.coords || [],
        levels: ce.pisos ? `${ce.pisos} Nivel${ce.pisos > 1 ? "es" : ""}` : (mockMatch && mockMatch.levels) || "1 Nivel",
        pisos: ce.pisos || 1,
        alturaM: ce.alturaM || 5,
        estilo3D: ce.estilo3D || "admin",
        schedule: ce.horario || (mockMatch && mockMatch.schedule) || "07:00 - 21:00 hrs",
        description: ce.descripcion || (mockMatch && mockMatch.description) || "",
        services: ce.servicios || (mockMatch && mockMatch.services) || [],
        contacto: ce.contacto || null,
        enlaceWeb: ce.enlaceWeb || null,
        tourOficial: ce.tourOficial || null,
        salones:
          aulasInBuilding.length > 0
            ? aulasInBuilding.map((a) => ({
                code: a.codigo,
                name: a.nombre,
                floor: a.planta,
                type: a.tipo,
                id: a.id,
                coords: a.coords,
                capacidad: a.capacidad,
                equipamiento: a.equipamiento,
                scenePano: a.scenePano
              }))
            : (mockMatch && mockMatch.salones) || [],
        classrooms:
          aulasInBuilding.length > 0
            ? aulasInBuilding.map((a) => `${a.codigo} (${a.nombre})`)
            : (mockMatch && mockMatch.classrooms) || [],
        panorama360: (mockMatch && mockMatch.panorama360) || null
      });
    });

    // Agregar cualquier edificio de mockData que no estuviera en CAMPUS
    mockBuildings.forEach((mb) => {
      const mapped = LEGACY_TO_CAMPUS_ID[String(mb.id).toLowerCase()];
      if (!mapped || !seenCampusIds.has(mapped)) {
        unified.push({
          ...mb,
          campusId: mapped || mb.id,
          centro: [24.10275, -110.31602],
          imagen: "./img/uabcs.jpg"
        });
      }
    });

    return unified;
  }

  // Consulta relacional en memoria (espejo exacto del JOIN de server.js sobre las tablas SQL: horarios, materias, maestros, salones)
  function runRelationalJoinLocal(semestre, turno, grupo) {
    const tables = window.DASC_SQL_TABLES || { salones: [], maestros: [], materias: [], horarios: [] };
    const matMap = new Map(tables.materias.map((m) => [m.id, m]));
    const maeMap = new Map(tables.maestros.map((m) => [m.id, m]));
    const salMap = new Map(tables.salones.map((s) => [s.id, s]));

    const dayOrder = { Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5 };

    let filtered = tables.horarios.filter(
      (h) =>
        Number(h.semestre) === Number(semestre) &&
        String(h.turno).toLowerCase() === String(turno).toLowerCase() &&
        String(h.grupo).toUpperCase() === String(grupo).toUpperCase()
    );

    let effectiveGrupo = String(grupo).toUpperCase();
    if (filtered.length === 0 && effectiveGrupo !== "A") {
      effectiveGrupo = "A";
      filtered = tables.horarios.filter(
        (h) =>
          Number(h.semestre) === Number(semestre) &&
          String(h.turno).toLowerCase() === String(turno).toLowerCase() &&
          String(h.grupo).toUpperCase() === "A"
      );
    }

    const rows = filtered
      .map((h) => {
        const mat = matMap.get(h.materia_id) || {};
        const mae = maeMap.get(h.maestro_id) || {};
        const sal = salMap.get(h.salon_id) || {};
        return {
          id: h.id,
          periodo: h.periodo,
          semestre: h.semestre,
          turno: h.turno,
          grupo: h.grupo,
          dia: h.dia,
          dia_semana: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          bloque_horario: h.bloque_horario,
          subgrupo: h.subgrupo,
          materia_id: mat.id,
          materia_codigo: mat.codigo,
          materia_nombre: mat.nombre,
          materia_creditos: mat.creditos,
          materia_area: mat.area,
          maestro_id: mae.id,
          maestro_nombre: mae.nombre,
          maestro_grado: mae.grado,
          maestro_correo: mae.correo,
          maestro_cargo: mae.cargo,
          maestro_oficina: mae.oficina,
          salon_id: sal.id,
          salon_codigo: sal.codigo,
          salon_nombre: sal.nombre,
          edificio_id: sal.edificio_id || "dsc-39",
          edificio_codigo: sal.edificio_codigo || "DSC-39",
          salon_planta: sal.planta,
          salon_tipo: sal.tipo,
          salon_descripcion: sal.descripcion
        };
      })
      .sort((a, b) => {
        if (a.hora_inicio !== b.hora_inicio) return a.hora_inicio.localeCompare(b.hora_inicio);
        return (dayOrder[a.dia] || 9) - (dayOrder[b.dia] || 9);
      });

    const subjectMap = new Map();
    for (const r of rows) {
      const key = `${r.materia_id}::${r.maestro_id}::${r.subgrupo || ""}`;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          id: `subj-${r.materia_id}-${r.maestro_id}-${r.subgrupo || "general"}`,
          materia_id: r.materia_id,
          code: r.materia_codigo,
          subject: r.subgrupo ? `${r.materia_nombre} (${r.subgrupo})` : r.materia_nombre,
          rawSubject: r.materia_nombre,
          subgrupo: r.subgrupo,
          creditos: r.materia_creditos,
          area: r.materia_area,
          maestro_id: r.maestro_id,
          professor: r.maestro_nombre,
          professorEmail: r.maestro_correo,
          professorOffice: r.maestro_oficina,
          salon_id: r.salon_id,
          classroomCode: r.salon_codigo,
          salonCodigo: r.salon_codigo,
          classroom: `${r.salon_codigo} · ${r.salon_nombre}`,
          salonPlanta: r.salon_planta,
          salonTipo: r.salon_tipo,
          buildingId: r.edificio_id,
          buildingCode: r.edificio_codigo,
          semestre: r.semestre,
          turno: r.turno,
          grupo: r.grupo,
          sessions: []
        });
      }
      subjectMap.get(key).sessions.push({
        dia: r.dia,
        bloque: r.bloque_horario,
        hora: r.bloque_horario,
        hora_inicio: r.hora_inicio,
        hora_fin: r.hora_fin,
        salon_codigo: r.salon_codigo,
        salon: r.salon_codigo,
        edificio_id: r.edificio_id,
        edificio_codigo: r.edificio_codigo
      });
    }

    const groupedSubjects = Array.from(subjectMap.values()).map((item) => {
      const uniqueBlocks = [...new Set(item.sessions.map((s) => s.bloque))];
      const uniqueDays = [...new Set(item.sessions.map((s) => s.dia))];
      const uniqueSalones = [...new Set(item.sessions.map((s) => s.salon_codigo))];
      return {
        ...item,
        bloques: item.sessions,
        time: uniqueBlocks.join(" / "),
        days: uniqueDays.join(", "),
        allSalones: uniqueSalones.join(", ")
      };
    });

    return {
      periodo: "2026-II",
      semestre: Number(semestre),
      turno,
      grupo: effectiveGrupo,
      sessions: rows,
      rows: rows,
      groupedSubjects
    };
  }

  const savedUser = safeParse(localStorage.getItem(STORAGE_KEYS.USER), null);
  const defaultSem = savedUser ? Number(savedUser.semester || savedUser.semestre || 5) : 5;
  const defaultTurno = savedUser ? savedUser.turno || "Matutino" : "Matutino";
  const defaultGrupo = savedUser ? savedUser.grupo || "A" : "A";
  const unifiedBuildings = buildUnifiedBuildingsCatalog();

  const state = {
    user: savedUser,
    activeView: "inicio",
    arOverlayActive: false,
    arTarget: null,
    sqlConnected: true,
    sqlEngineLabel: "SQLite Relacional (database/uabcs_dasc.sql)",
    sqlStats: {
      salones: (window.DASC_SQL_TABLES && window.DASC_SQL_TABLES.salones.length) || 17,
      maestros: (window.DASC_SQL_TABLES && window.DASC_SQL_TABLES.maestros.length) || 55,
      materias: (window.DASC_SQL_TABLES && window.DASC_SQL_TABLES.materias.length) || 31,
      horarios: (window.DASC_SQL_TABLES && window.DASC_SQL_TABLES.horarios.length) || 215,
      usuarios: 2
    },
    currentScheduleData: runRelationalJoinLocal(defaultSem, defaultTurno, defaultGrupo),
    mapSelection: {
      buildingId: "dsc-39",
      campusId: "dasc",
      highlightRoom: null,
      aulaId: null,
      categoryFilter: "all",
      zoomLevel: 1.05,
      mode3D: true,
      tiltAngle: 52,
      mapSubMode: "interactive", // 'interactive' | '360' | 'sketchfab' | 'pdf'
      panoSceneId: "1",
      autoTriggered: false,
      showPdfModal: false
    },
    modal360: {
      isOpen: false,
      buildingId: null,
      sceneId: "1"
    },
    buildingsCatalog: unifiedBuildings,
    homeInfo: window.DASC_MOCK_DATA.homeInfo,
    professors: window.DASC_MOCK_DATA.professors,
    directoryPlaces: window.DASC_MOCK_DATA.directoryPlaces,
    events: safeParse(localStorage.getItem(STORAGE_KEYS.EVENTS), window.DASC_MOCK_DATA.events)
  };

  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => fn(state));
  }

  function saveCatalogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(state.events));
    } catch (e) {
      // Ignorar errores de almacenamiento
    }
  }

  async function syncWithSqlBackend() {
    try {
      const statusRes = await fetch("/api/status");
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.ok) {
          state.sqlConnected = true;
          state.sqlEngineLabel = statusData.engine;
          state.sqlStats = statusData.stats;
        }
      }
      if (state.user) {
        await fetchScheduleFromSql(
          state.user.semester || state.user.semestre,
          state.user.turno,
          state.user.grupo,
          false
        );
      }
      notify();
    } catch (e) {
      // Modo local con tablas SQL en memoria
    }
  }

  async function fetchScheduleFromSql(semestre, turno, grupo, shouldNotify = true) {
    const cleanSem = Number(semestre || 5);
    const cleanTurno = String(turno || "Matutino");
    const cleanGrupo = String(grupo || "A").toUpperCase();

    state.currentScheduleData = runRelationalJoinLocal(cleanSem, cleanTurno, cleanGrupo);
    if (shouldNotify) notify();

    try {
      const url = `/api/horarios?semestre=${encodeURIComponent(cleanSem)}&turno=${encodeURIComponent(cleanTurno)}&grupo=${encodeURIComponent(cleanGrupo)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.sessions && data.sessions.length > 0) {
          state.currentScheduleData = {
            ...data,
            rows: data.sessions
          };
          if (shouldNotify) notify();
        }
      }
    } catch (e) {
      // Respaldo relacional local ya activo
    }
  }

  window.DASCStore = {
    getState() {
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setView(viewName) {
      state.arOverlayActive = false;
      state.modal360.isOpen = false;
      state.activeView = viewName || "inicio";
      notify();
    },

    async loginWithInstitutionalEmail({ correo, password }) {
      const cleanEmail = String(correo || "").trim().toLowerCase();
      const cleanPass = String(password || "").trim();

      if (!cleanEmail || !cleanPass) {
        return { ok: false, error: "Por favor ingresa tu correo institucional y contraseña." };
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: cleanEmail, password: cleanPass })
        });
        const data = await res.json();
        if (res.ok && data.ok && data.user) {
          state.user = {
            ...data.user,
            semestre: data.user.semester || data.user.semestre || "5"
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
          await fetchScheduleFromSql(state.user.semester, state.user.turno, state.user.grupo, false);
          state.activeView = "horario";
          notify();
          return { ok: true };
        }
        if (res.status === 401 || res.status === 400) {
          const localResult = checkLocalFallbackLogin(cleanEmail, cleanPass);
          if (localResult.ok) {
            state.user = localResult.user;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
            await fetchScheduleFromSql(state.user.semester, state.user.turno, state.user.grupo, false);
            state.activeView = "horario";
            notify();
            return { ok: true };
          }
          return { ok: false, error: data.error || "Credenciales inválidas." };
        }
      } catch (err) {
        // Servidor offline
      }

      const fallback = checkLocalFallbackLogin(cleanEmail, cleanPass);
      if (fallback.ok) {
        state.user = fallback.user;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
        await fetchScheduleFromSql(state.user.semester, state.user.turno, state.user.grupo, false);
        state.activeView = "horario";
        notify();
        return { ok: true };
      }

      return {
        ok: false,
        error: "Correo institucional o contraseña incorrectos. Si eres nuevo, crea tu sesión en la pestaña 'Crear Sesión'."
      };
    },

    async registerStudentAccount({ correo, password, nombre, semestre, turno, grupo }) {
      const cleanEmail = String(correo || "").trim().toLowerCase();
      const cleanPass = String(password || "").trim();
      const cleanSem = Number(semestre || 1);
      const cleanTurno = String(turno || "Matutino").trim();
      let cleanGrupo = String(grupo || "A").trim().toUpperCase();

      if (!cleanEmail || !cleanEmail.includes("@")) {
        return {
          ok: false,
          error: "Ingresa un correo institucional válido (ej. alumno@alu.uabcs.mx o nombre@uabcs.mx)."
        };
      }

      if (cleanPass.length < 4) {
        return {
          ok: false,
          error: "La contraseña debe tener al menos 4 caracteres."
        };
      }

      const derivedName =
        String(nombre || "").trim() ||
        cleanEmail
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

      const localUsers = safeParse(localStorage.getItem(STORAGE_KEYS.LOCAL_USERS), []);

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: cleanEmail,
            password: cleanPass,
            nombre: derivedName,
            semestre: cleanSem,
            turno: cleanTurno,
            grupo: cleanGrupo
          })
        });
        const data = await res.json();
        if (res.ok && data.ok && data.user) {
          state.user = {
            ...data.user,
            semestre: data.user.semester || data.user.semestre || String(cleanSem)
          };
          state.sqlStats.usuarios = (state.sqlStats.usuarios || 2) + 1;
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
          localUsers.push({ ...state.user, password: cleanPass });
          localStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(localUsers));
          await fetchScheduleFromSql(state.user.semester, state.user.turno, state.user.grupo, false);
          state.activeView = "horario";
          notify();
          return { ok: true };
        }
        if (!res.ok && data.error) {
          return { ok: false, error: data.error };
        }
      } catch (err) {
        // Offline fallback
      }

      if (
        cleanEmail === "alumno@alu.uabcs.mx" ||
        cleanEmail === "admin@uabcs.mx" ||
        localUsers.some((u) => u.correo.toLowerCase() === cleanEmail)
      ) {
        return {
          ok: false,
          error: "Este correo institucional ya está registrado. Inicia sesión con tu contraseña."
        };
      }

      const checkJoin = runRelationalJoinLocal(cleanSem, cleanTurno, cleanGrupo);
      cleanGrupo = checkJoin.grupo;

      const newUser = {
        id: Date.now(),
        correo: cleanEmail,
        name: derivedName,
        semester: String(cleanSem),
        semestre: String(cleanSem),
        turno: cleanTurno,
        grupo: cleanGrupo,
        role: "student"
      };

      localUsers.push({ ...newUser, password: cleanPass });
      localStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(localUsers));
      state.user = newUser;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      await fetchScheduleFromSql(state.user.semester, state.user.turno, state.user.grupo, false);
      state.activeView = "horario";
      notify();
      return { ok: true };
    },

    async updateStudentScheduleGroup({ semestre, semester, turno, grupo }) {
      if (!state.user) return;
      const cleanSem = Number(semestre || semester || state.user.semester || state.user.semestre || 5);
      const cleanTurno = String(turno || state.user.turno || "Matutino");
      let cleanGrupo = String(grupo || state.user.grupo || "A").toUpperCase();

      const localCheck = runRelationalJoinLocal(cleanSem, cleanTurno, cleanGrupo);
      cleanGrupo = localCheck.grupo;

      state.user = {
        ...state.user,
        semester: String(cleanSem),
        semestre: String(cleanSem),
        turno: cleanTurno,
        grupo: cleanGrupo
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));

      try {
        await fetch("/api/auth/user-group", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: state.user.correo,
            semestre: cleanSem,
            turno: cleanTurno,
            grupo: cleanGrupo
          })
        });
      } catch (e) {
        // Ignorar si está offline
      }

      await fetchScheduleFromSql(cleanSem, cleanTurno, cleanGrupo, true);
    },

    logout() {
      state.user = null;
      state.arOverlayActive = false;
      state.modal360.isOpen = false;
      localStorage.removeItem(STORAGE_KEYS.USER);
      state.activeView = "inicio";
      notify();
    },

    focusBuildingOnMap({ buildingId, highlightRoom = null, aulaId = null, subMode = "interactive" }) {
      state.arOverlayActive = false;
      state.activeView = "mapa";

      // Resolver aula geolocalizada si se proporcionó salón o aulaId
      const matchedAula =
        window.AULAS_DASC && (highlightRoom || aulaId)
          ? window.AULAS_DASC.buscar(aulaId || highlightRoom)
          : null;

      const effectiveBuildingId = matchedAula
        ? matchedAula.edificioLegacy || matchedAula.edificioId
        : buildingId || "dsc-39";

      const matched = this.getBuildingById(effectiveBuildingId);
      state.mapSelection = {
        ...state.mapSelection,
        buildingId: matched ? matched.id : "dsc-39",
        campusId: matched ? matched.campusId : "dasc",
        highlightRoom: highlightRoom || (matchedAula ? `${matchedAula.codigo} (${matchedAula.nombre})` : null),
        aulaId: matchedAula ? matchedAula.id : aulaId,
        panoSceneId: matchedAula && matchedAula.scenePano ? matchedAula.scenePano : state.mapSelection.panoSceneId || "1",
        mapSubMode: subMode || "interactive",
        categoryFilter: "all",
        zoomLevel: 1.15,
        autoTriggered: true
      };
      notify();
    },

    selectBuildingInMap(buildingId, highlightRoom = null, aulaId = null) {
      const matchedAula =
        window.AULAS_DASC && (highlightRoom || aulaId)
          ? window.AULAS_DASC.buscar(aulaId || highlightRoom)
          : null;
      const matched = this.getBuildingById(buildingId);
      state.mapSelection = {
        ...state.mapSelection,
        buildingId: matched ? matched.id : "dsc-39",
        campusId: matched ? matched.campusId : "dasc",
        highlightRoom: highlightRoom,
        aulaId: matchedAula ? matchedAula.id : aulaId,
        autoTriggered: false
      };
      notify();
    },

    setMapSubMode(subMode, panoSceneId = null) {
      state.mapSelection = {
        ...state.mapSelection,
        mapSubMode: subMode || "interactive",
        panoSceneId: panoSceneId || state.mapSelection.panoSceneId || "1",
        autoTriggered: false
      };
      notify();
    },

    setMapCategoryFilter(category) {
      state.mapSelection = {
        ...state.mapSelection,
        categoryFilter: category || "all",
        autoTriggered: false
      };
      notify();
    },

    setMapMode3D(is3D) {
      state.mapSelection = {
        ...state.mapSelection,
        mode3D: Boolean(is3D),
        autoTriggered: false
      };
      notify();
    },

    setMapTilt(angle) {
      const clamped = Math.max(0, Math.min(60, Number(angle)));
      state.mapSelection = {
        ...state.mapSelection,
        tiltAngle: clamped,
        mode3D: clamped > 5,
        autoTriggered: false
      };
      notify();
    },

    setMapTiltAngle(angle) {
      this.setMapTilt(angle);
    },

    setMapZoom(zoomLevel) {
      const clamped = Math.max(0.7, Math.min(2.0, Number(zoomLevel)));
      state.mapSelection = {
        ...state.mapSelection,
        zoomLevel: clamped,
        autoTriggered: false
      };
      notify();
    },

    open360Modal(buildingId, sceneId = null) {
      this.focusBuilding(buildingId || "dsc-39", sceneId);
    },

    set360Scene(sceneId) {
      // Stub de compatibilidad
    },

    close360Modal() {
      // Stub de compatibilidad
    },

    openARGuide({ buildingId, destinationLabel, subject = "", professor = "", aulaId = null, coords = null }) {
      const matchedAula =
        window.AULAS_DASC && (aulaId || destinationLabel)
          ? window.AULAS_DASC.buscar(aulaId || destinationLabel)
          : null;

      const building =
        this.getBuildingById(matchedAula ? matchedAula.edificioId : buildingId) ||
        state.buildingsCatalog[0];

      const targetCoords =
        coords ||
        (matchedAula && matchedAula.coords) ||
        (building && building.centro) || [24.10275, -110.31602];

      state.arTarget = {
        buildingId: building.id,
        campusId: building.campusId || "dasc",
        buildingCode: building.code || "DSC-39",
        buildingName: building.name,
        aulaId: matchedAula ? matchedAula.id : null,
        aulaCodigo: matchedAula ? matchedAula.codigo : null,
        planta: matchedAula ? matchedAula.planta : building.levels || "Planta Baja",
        destinationLabel:
          destinationLabel ||
          (matchedAula ? `${matchedAula.codigo} · ${matchedAula.nombre}` : building.name),
        subject: subject,
        professor: professor,
        coords: targetCoords,
        scenePano: matchedAula && matchedAula.scenePano ? matchedAula.scenePano : "1",
        imagen: building.imagen || "./img/recorrido/edificio-sistemas.jpg",
        arInstruction: matchedAula
          ? `${matchedAula.referenciaAcceso}. Ubicado en ${matchedAula.edificioCodigo} (${matchedAula.planta}).`
          : `Dirígete hacia ${building.name} (${building.code}).`
      };
      state.arOverlayActive = true;
      notify();
    },

    closeARGuide() {
      state.arOverlayActive = false;
      notify();
    },

    getBuildings() {
      return state.buildingsCatalog;
    },

    getBuildingById(buildingId) {
      if (!buildingId) return null;
      const raw = String(buildingId).trim().toLowerCase();
      const mappedCampusId = LEGACY_TO_CAMPUS_ID[raw] || raw;

      return (
        state.buildingsCatalog.find(
          (b) =>
            String(b.id).toLowerCase() === raw ||
            String(b.campusId).toLowerCase() === raw ||
            String(b.campusId).toLowerCase() === mappedCampusId ||
            String(b.code).toLowerCase() === raw
        ) || null
      );
    },

    getCurrentScheduleData() {
      return state.currentScheduleData;
    },

    getScheduleFromSQL(semestre, turno, grupo) {
      return runRelationalJoinLocal(semestre, turno, grupo);
    },

    getSQLData() {
      return this.getSqlTablesSummary();
    },

    getSqlTablesSummary() {
      const tables = window.DASC_SQL_TABLES || { salones: [], maestros: [], materias: [], horarios: [] };
      return {
        salones: tables.salones,
        maestros: tables.maestros,
        materias: tables.materias,
        horarios: tables.horarios
      };
    },

    getClassesBySalonCodigo(salonCodigo) {
      const tables = window.DASC_SQL_TABLES || { salones: [], horarios: [], materias: [], maestros: [] };
      const targetCode = String(salonCodigo || "").trim().toUpperCase();
      const salonObj = tables.salones.find(
        (s) => String(s.codigo || "").trim().toUpperCase() === targetCode
      );
      if (!salonObj) return [];

      const matMap = new Map(tables.materias.map((m) => [m.id, m]));
      const maeMap = new Map(tables.maestros.map((m) => [m.id, m]));

      return tables.horarios
        .filter((h) => h.salon_id === salonObj.id)
        .map((h) => {
          const mat = matMap.get(h.materia_id) || {};
          const mae = maeMap.get(h.maestro_id) || {};
          return {
            semestre: h.semestre,
            turno: h.turno,
            grupo: h.grupo,
            dia: h.dia,
            bloque_horario: h.bloque_horario,
            materia_nombre: mat.nombre || "Asignatura IDS",
            maestro_nombre: mae.nombre || "Docente DASC"
          };
        });
    },

    getProfessors() {
      return state.professors;
    },

    getDirectoryPlaces() {
      return state.directoryPlaces;
    },

    getEvents() {
      return state.events;
    },

    saveEvent(eventData) {
      if (eventData.id) {
        state.events = state.events.map((ev) =>
          ev.id === eventData.id ? { ...ev, ...eventData } : ev
        );
      } else {
        state.events = [{ id: "evt-" + Date.now(), ...eventData }, ...state.events];
      }
      saveCatalogs();
      notify();
    },

    deleteEvent(eventId) {
      state.events = state.events.filter((ev) => ev.id !== eventId);
      saveCatalogs();
      notify();
    },

    resetCatalogsToDefault() {
      state.professors = [...window.DASC_MOCK_DATA.professors];
      state.events = [...window.DASC_MOCK_DATA.events];
      saveCatalogs();
      notify();
    }
  };

  function checkLocalFallbackLogin(correo, password) {
    if (correo === "alumno@alu.uabcs.mx" && password === "uabcs2026") {
      return {
        ok: true,
        user: {
          id: 1,
          correo: "alumno@alu.uabcs.mx",
          name: "Estudiante IDS DASC",
          semester: "5",
          semestre: "5",
          turno: "Matutino",
          grupo: "A",
          role: "student"
        }
      };
    }
    if (
      (correo === "admin@uabcs.mx" || correo === "admin@dasc.uabcs.mx" || correo === "admin") &&
      password === "admin123"
    ) {
      return {
        ok: true,
        user: {
          id: 2,
          correo: "admin@uabcs.mx",
          name: "Coordinación DASC - UABCS",
          semester: "5",
          semestre: "5",
          turno: "Matutino",
          grupo: "A",
          role: "admin"
        }
      };
    }

    const localUsers = safeParse(localStorage.getItem(STORAGE_KEYS.LOCAL_USERS), []);
    const found = localUsers.find(
      (u) => u.correo.toLowerCase() === correo && u.password === password
    );
    if (found) {
      const { password: _, ...cleanUser } = found;
      return { ok: true, user: cleanUser };
    }
    return { ok: false };
  }

  syncWithSqlBackend();
})();
