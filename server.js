/**
 * server.js
 * Servidor HTTP + API REST conectada a la Base de Datos SQL (node:sqlite)
 * para "Portal UABCS - DASC: Inicio, Horario IDS, Mapa Campus 2D/3D y Directorio"
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DB_DIR = path.join(ROOT_DIR, "database");
const SQL_FILE = path.join(DB_DIR, "uabcs_dasc.sql");
const SQLITE_FILE = path.join(DB_DIR, "uabcs_dasc.sqlite");

// Inicializar conexión a la base de datos SQL
function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const needsInit = !fs.existsSync(SQLITE_FILE);
  const db = new DatabaseSync(SQLITE_FILE);
  db.exec("PRAGMA foreign_keys = ON;");

  if (needsInit && fs.existsSync(SQL_FILE)) {
    const sqlContent = fs.readFileSync(SQL_FILE, "utf8");
    db.exec(sqlContent);
    console.log("[SQL] Base de datos inicializada desde database/uabcs_dasc.sql");
  }
  return db;
}

const db = initDatabase();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".sql": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload demasiado grande"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function queryScheduleFromSql(semestre, turno, grupo) {
  const rows = db
    .prepare(
      `
      SELECT
        h.id,
        h.periodo,
        h.semestre,
        h.turno,
        h.grupo,
        h.dia,
        h.hora_inicio,
        h.hora_fin,
        h.bloque_horario,
        h.subgrupo,
        mat.id AS materia_id,
        mat.codigo AS materia_codigo,
        mat.nombre AS materia_nombre,
        mat.creditos AS materia_creditos,
        mat.area AS materia_area,
        mae.id AS maestro_id,
        mae.nombre AS maestro_nombre,
        mae.grado AS maestro_grado,
        mae.correo AS maestro_correo,
        mae.cargo AS maestro_cargo,
        mae.oficina AS maestro_oficina,
        sal.id AS salon_id,
        sal.codigo AS salon_codigo,
        sal.nombre AS salon_nombre,
        sal.edificio_id AS edificio_id,
        sal.edificio_codigo AS edificio_codigo,
        sal.planta AS salon_planta,
        sal.tipo AS salon_tipo,
        sal.descripcion AS salon_descripcion
      FROM horarios h
      INNER JOIN materias mat ON h.materia_id = mat.id
      INNER JOIN maestros mae ON h.maestro_id = mae.id
      INNER JOIN salones sal ON h.salon_id = sal.id
      WHERE h.semestre = ? AND LOWER(h.turno) = LOWER(?) AND UPPER(h.grupo) = UPPER(?)
      ORDER BY
        h.hora_inicio ASC,
        CASE h.dia
          WHEN 'Lunes' THEN 1
          WHEN 'Martes' THEN 2
          WHEN 'Miércoles' THEN 3
          WHEN 'Jueves' THEN 4
          WHEN 'Viernes' THEN 5
          ELSE 6
        END ASC,
        h.subgrupo ASC
    `
    )
    .all(Number(semestre), String(turno), String(grupo));

  // Agrupar también por Materia + Maestro + Subgrupo para tarjetas de resumen
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
      hora_inicio: r.hora_inicio,
      hora_fin: r.hora_fin,
      salon_codigo: r.salon_codigo,
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
      time: uniqueBlocks.join(" / "),
      days: uniqueDays.join(", "),
      allSalones: uniqueSalones.join(", ")
    };
  });

  return {
    periodo: "2026-II",
    semestre: Number(semestre),
    turno,
    grupo: String(grupo).toUpperCase(),
    sessions: rows,
    groupedSubjects
  };
}

async function handleApiRequest(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    // 1. Estado de la Base de Datos SQL
    if (pathname === "/api/status" && req.method === "GET") {
      const stats = {
        salones: db.prepare("SELECT COUNT(*) AS c FROM salones").get().c,
        maestros: db.prepare("SELECT COUNT(*) AS c FROM maestros").get().c,
        materias: db.prepare("SELECT COUNT(*) AS c FROM materias").get().c,
        horarios: db.prepare("SELECT COUNT(*) AS c FROM horarios").get().c,
        usuarios: db.prepare("SELECT COUNT(*) AS c FROM usuarios").get().c
      };
      sendJson(res, 200, {
        ok: true,
        engine: "SQLite Relational SQL (uabcs_dasc.sql / uabcs_dasc.sqlite)",
        sourceUrl: "https://www.uabcs.mx/dasc/estudiantes/horarios/horarios-ingenieria-en-desarrollo-de-software/",
        stats
      });
      return;
    }

    // 2. Grupos disponibles en la base de datos SQL
    if (pathname === "/api/grupos" && req.method === "GET") {
      const grupos = db
        .prepare(
          `
          SELECT
            semestre,
            turno,
            grupo,
            periodo,
            COUNT(*) AS total_bloques,
            COUNT(DISTINCT materia_id) AS total_materias
          FROM horarios
          GROUP BY semestre, turno, grupo, periodo
          ORDER BY semestre ASC, turno ASC, grupo ASC
        `
        )
        .all();
      sendJson(res, 200, { ok: true, grupos });
      return;
    }

    // 3. Consulta de Horarios dividida en Salón, Maestro y Materia
    if (pathname === "/api/horarios" && req.method === "GET") {
      const semestre = Number(parsedUrl.searchParams.get("semestre") || 5);
      const turno = parsedUrl.searchParams.get("turno") || "Matutino";
      const grupo = (parsedUrl.searchParams.get("grupo") || "A").toUpperCase();
      const result = queryScheduleFromSql(semestre, turno, grupo);
      sendJson(res, 200, { ok: true, ...result });
      return;
    }

    // 4. Catálogo completo de Salones con clases asignadas desde SQL
    if (pathname === "/api/salones" && req.method === "GET") {
      const salonesRows = db.prepare("SELECT * FROM salones ORDER BY id ASC").all();
      const usageRows = db
        .prepare(
          `
          SELECT
            h.salon_id,
            h.semestre,
            h.turno,
            h.grupo,
            mat.nombre AS materia_nombre,
            mae.nombre AS maestro_nombre,
            COUNT(*) AS sesiones_semana
          FROM horarios h
          INNER JOIN materias mat ON h.materia_id = mat.id
          INNER JOIN maestros mae ON h.maestro_id = mae.id
          GROUP BY h.salon_id, h.semestre, h.turno, h.grupo, mat.id, mae.id
          ORDER BY h.semestre ASC, h.turno ASC
        `
        )
        .all();

      const salones = salonesRows.map((s) => {
        const classesInSalon = usageRows.filter((u) => u.salon_id === s.id);
        return {
          ...s,
          classesAssigned: classesInSalon
        };
      });

      sendJson(res, 200, { ok: true, salones });
      return;
    }

    // 5. Catálogo de Maestros desde SQL
    if (pathname === "/api/maestros" && req.method === "GET") {
      const soloRep = parsedUrl.searchParams.get("representantes") === "1";
      const query = soloRep
        ? "SELECT * FROM maestros WHERE es_representante = 1 ORDER BY id ASC"
        : "SELECT * FROM maestros ORDER BY es_representante DESC, nombre ASC";
      const maestros = db.prepare(query).all();
      sendJson(res, 200, { ok: true, maestros });
      return;
    }

    // 6. Catálogo de Materias desde SQL
    if (pathname === "/api/materias" && req.method === "GET") {
      const materias = db.prepare("SELECT * FROM materias ORDER BY semestre ASC, id ASC").all();
      sendJson(res, 200, { ok: true, materias });
      return;
    }

    // 7. Registro de nueva sesión de estudiante en la Base de Datos SQL
    if (pathname === "/api/auth/register" && req.method === "POST") {
      const body = await readJsonBody(req);
      const correo = String(body.correo || "").trim().toLowerCase();
      const password = String(body.password || "").trim();
      const semestre = Number(body.semestre || 1);
      const turno = String(body.turno || "Matutino").trim();
      const grupo = String(body.grupo || "A").trim().toUpperCase();
      const rawNombre = String(body.nombre || "").trim();

      if (!correo || !correo.includes("@")) {
        sendJson(res, 400, {
          ok: false,
          error: "Ingresa un correo institucional válido (ej. usuario@alu.uabcs.mx o usuario@uabcs.mx)."
        });
        return;
      }

      if (password.length < 4) {
        sendJson(res, 400, {
          ok: false,
          error: "La contraseña debe tener al menos 4 caracteres."
        });
        return;
      }

      const existing = db
        .prepare("SELECT id FROM usuarios WHERE LOWER(correo) = LOWER(?)")
        .get(correo);
      if (existing) {
        sendJson(res, 409, {
          ok: false,
          error: "Este correo institucional ya está registrado. Por favor inicia sesión con tu contraseña."
        });
        return;
      }

      // Verificar si la combinación semestre/turno/grupo existe en horarios; si en 3°/5°/7°/9° TV eligió B y solo hay A, ajustar a A
      let validGrupo = grupo;
      const groupExists = db
        .prepare(
          "SELECT COUNT(*) AS c FROM horarios WHERE semestre = ? AND LOWER(turno) = LOWER(?) AND UPPER(grupo) = UPPER(?)"
        )
        .get(semestre, turno, validGrupo).c;
      if (!groupExists) {
        validGrupo = "A";
      }

      const derivedName =
        rawNombre ||
        correo
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

      const insertStmt = db.prepare(
        `
        INSERT INTO usuarios (correo, password_hash, nombre, semestre, turno, grupo, rol)
        VALUES (?, ?, ?, ?, ?, ?, 'student')
      `
      );
      const info = insertStmt.run(correo, password, derivedName, semestre, turno, validGrupo);

      const newUser = {
        id: Number(info.lastInsertRowid),
        correo,
        name: derivedName,
        semester: String(semestre),
        turno,
        grupo: validGrupo,
        role: "student"
      };

      sendJson(res, 201, {
        ok: true,
        message: "Cuenta institucional creada y guardada en la base de datos SQL.",
        user: newUser
      });
      return;
    }

    // 8. Inicio de sesión validado contra la tabla `usuarios` de la Base de Datos SQL
    if (pathname === "/api/auth/login" && req.method === "POST") {
      const body = await readJsonBody(req);
      const correo = String(body.correo || "").trim().toLowerCase();
      const password = String(body.password || "").trim();

      if (!correo || !password) {
        sendJson(res, 400, {
          ok: false,
          error: "Ingresa tu correo institucional y tu contraseña."
        });
        return;
      }

      const row = db
        .prepare(
          `
          SELECT id, correo, password_hash, nombre, semestre, turno, grupo, rol, fecha_registro
          FROM usuarios
          WHERE LOWER(correo) = LOWER(?)
        `
        )
        .get(correo);

      if (!row || row.password_hash !== password) {
        sendJson(res, 401, {
          ok: false,
          error: "Correo institucional o contraseña incorrectos. Si aún no tienes cuenta, regístrate en la pestaña 'Crear Cuenta'."
        });
        return;
      }

      const loggedUser = {
        id: row.id,
        correo: row.correo,
        name: row.nombre,
        semester: String(row.semestre),
        turno: row.turno || "Matutino",
        grupo: row.grupo || "A",
        role: row.rol || "student"
      };

      sendJson(res, 200, {
        ok: true,
        user: loggedUser
      });
      return;
    }

    // 9. Actualizar Semestre, Turno y Grupo del usuario en la Base de Datos SQL
    if (pathname === "/api/auth/user-group" && req.method === "PUT") {
      const body = await readJsonBody(req);
      const correo = String(body.correo || "").trim().toLowerCase();
      const semestre = Number(body.semestre || 5);
      const turno = String(body.turno || "Matutino").trim();
      let grupo = String(body.grupo || "A").trim().toUpperCase();

      const groupExists = db
        .prepare(
          "SELECT COUNT(*) AS c FROM horarios WHERE semestre = ? AND LOWER(turno) = LOWER(?) AND UPPER(grupo) = UPPER(?)"
        )
        .get(semestre, turno, grupo).c;
      if (!groupExists) {
        grupo = "A";
      }

      if (correo) {
        db.prepare(
          `
          UPDATE usuarios
          SET semestre = ?, turno = ?, grupo = ?
          WHERE LOWER(correo) = LOWER(?)
        `
        ).run(semestre, turno, grupo, correo);
      }

      sendJson(res, 200, {
        ok: true,
        semestre: String(semestre),
        turno,
        grupo
      });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Endpoint SQL no encontrado" });
  } catch (err) {
    console.error("[API Error]", err);
    sendJson(res, 500, { ok: false, error: "Error interno en el servidor SQL: " + err.message });
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (parsedUrl.pathname.startsWith("/api/")) {
    handleApiRequest(req, res, parsedUrl);
    return;
  }

  const safePath = decodeURIComponent(parsedUrl.pathname);
  const relPath = safePath === "/" ? "/index.html" : safePath;
  const filePath = path.join(ROOT_DIR, relPath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Acceso denegado");
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Archivo no encontrado");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`  Portal UABCS - DASC (Conectado a Base de Datos SQL)`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`=====================================================`);
});
