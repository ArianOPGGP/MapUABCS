/* ==========================================================================
   Mapa UABCS – Catálogo Unificado de Salones, Laboratorios y Oficinas del DASC
   + Grafo de Rutas Peatonales del Campus La Paz (Dijkstra / A*)
   --------------------------------------------------------------------------
   Integra los 17 salones de la Base de Datos SQL (uabcs_dasc.sql) y las 19
   aulas/laboratorios geolocalizados del DASC (DSC-39, DSC-46 y DSC-46B),
   con coordenadas GPS exactas, escena interior 360° (Pannellum 1..23) y
   cálculo de ruta peatonal paso a paso para el Mapa 2D/3D y Guía AR.
   ========================================================================== */
window.AULAS_DASC = (function () {
  "use strict";

  const EDIFICIOS_DASC = {
    "dasc": {
      clave: "DSC-39",
      sqlId: "dsc-39",
      nombre: "Edificio Principal DASC (Sistemas Computacionales)"
    },
    "dasc-ii": {
      clave: "DSC-46",
      sqlId: "dsc-46",
      nombre: "Sistemas II / Macrocentro de Cómputo"
    },
    "nuevo-dasc": {
      clave: "DSC-46B",
      sqlId: "dsc-46b",
      nombre: "Nuevo Edificio DASC (Laboratorios de Innovación)"
    }
  };

  const aulas = [
    /* ==================== DSC-39 · EDIFICIO PRINCIPAL DASC (SQL + GEOLOCALIZACIÓN) ==================== */
    {
      id: "dsc39-lab-a",
      codigoSQL: "LAB A",
      nombreCorto: "LAB A · Programación",
      nombre: "LAB A — Laboratorio A de Cómputo y Programación",
      tipo: "laboratorio",
      edificioId: "dasc",
      planta: "Planta Baja",
      capacidad: 35,
      coords: [24.102725, -110.316395],
      escena360: 1,
      equipamiento: "35 PCs Dual-Boot Windows/Linux, Proyector HD, Red Gigabit RIUABCS, Aire Acondicionado. Sede de Taller de Programación y Concurso de Algoritmos."
    },
    {
      id: "dsc39-lab-f",
      codigoSQL: "LAB F",
      nombreCorto: "LAB F · Desarrollo SW",
      nombre: "LAB F — Laboratorio F de Desarrollo de Software",
      tipo: "laboratorio",
      edificioId: "dasc",
      planta: "Planta Baja",
      capacidad: 35,
      coords: [24.102725, -110.316310],
      escena360: 18,
      equipamiento: "35 Estaciones de trabajo, IDE Visual Studio / IntelliJ / VS Code, Proyector interactivo. Prácticas de POO, Metodología y Bases de Datos."
    },
    {
      id: "dsc39-lab-g",
      codigoSQL: "LAB G",
      nombreCorto: "LAB G · Ing. Web",
      nombre: "LAB G — Laboratorio G de Ingeniería Web y Multimedia",
      tipo: "laboratorio",
      edificioId: "dasc",
      planta: "Planta Alta",
      capacidad: 35,
      coords: [24.102795, -110.316395],
      escena360: 2,
      equipamiento: "35 Equipos de alto rendimiento, servidores locales de prueba y proyección HD. Especializado en Programación Web (5° IDS) y Programación II."
    },
    {
      id: "dsc39-lr",
      codigoSQL: "LR",
      nombreCorto: "LR · Lab de Redes",
      nombre: "LR — Laboratorio de Redes y Telecomunicaciones",
      tipo: "laboratorio",
      edificioId: "dasc",
      planta: "Planta Baja",
      capacidad: 30,
      coords: [24.102725, -110.316225],
      escena360: 3,
      equipamiento: "Racks de ruteadores y switches Cisco, cableado estructurado Cat 6A, analizadores de red y simuladores Packet Tracer para Redes I y Ciberseguridad."
    },
    {
      id: "dsc39-t1",
      codigoSQL: "T1",
      nombreCorto: "Taller T1 · Sistemas",
      nombre: "T1 — Taller 1 de Sistemas Computacionales",
      tipo: "taller",
      edificioId: "dasc",
      planta: "Planta Alta",
      capacidad: 36,
      coords: [24.102795, -110.316310],
      escena360: 19,
      equipamiento: "Mesas colaborativas con tomas eléctricas, proyector láser, pizarrón de cristal y Wi-Fi de alta densidad (5° IDS TM-A y 7° IDS)."
    },
    {
      id: "dsc39-t2",
      codigoSQL: "T2",
      nombreCorto: "Taller T2 · IA y Calidad",
      nombre: "T2 — Taller 2 de Inteligencia Artificial y Calidad",
      tipo: "taller",
      edificioId: "dasc",
      planta: "Planta Alta",
      capacidad: 36,
      coords: [24.102795, -110.316225],
      escena360: 7,
      equipamiento: "Mesas de trabajo grupal, conectividad de red para portátiles, pantalla inteligente y audio (7° IDS TM: IA, Calidad de SW y Sistemas Operativos)."
    },
    {
      id: "dsc39-sc2-java",
      codigoSQL: "SC2-JAVA",
      nombreCorto: "SC2 - JAVA",
      nombre: "SC2-JAVA — Salón SC2 - JAVA",
      tipo: "aula",
      edificioId: "dasc",
      planta: "Planta Baja",
      capacidad: 40,
      coords: [24.102685, -110.316350],
      escena360: 5,
      equipamiento: "Proyector multimedia, pizarrón blanco, climatización y nodos eléctricos para portátiles (5° Semestre IDS Turno Matutino Grupo B)."
    },
    {
      id: "dsc39-sc5-prolog",
      codigoSQL: "SC5-PROLOG",
      nombreCorto: "SC5 - PROLOG",
      nombre: "SC5-PROLOG — Salón SC5 - PROLOG",
      tipo: "aula",
      edificioId: "dasc",
      planta: "Planta Alta",
      capacidad: 40,
      coords: [24.102820, -110.316350],
      escena360: 11,
      equipamiento: "Proyector multimedia, pizarrón acrílico, climatización y cobertura Wi-Fi RIUABCS (3° Semestre IDS Turno Vespertino)."
    },
    {
      id: "dsc39-alan-turing",
      codigoSQL: "ALAN-TURING",
      nombreCorto: "Sala Alan Turing",
      nombre: "ALAN-TURING — Aula de Usos Múltiples «Alan Turing»",
      tipo: "sala",
      edificioId: "dasc",
      planta: "Planta Baja",
      capacidad: 75,
      coords: [24.102810, -110.316150],
      escena360: 9,
      equipamiento: "Sistema de videoconferencia, pantalla gigante, sonido envolvente y mesas modulares para Game Jam, Hackatón y defensas de tesis."
    },
    {
      id: "dsc39-jefatura",
      codigoSQL: "JEFATURA-DASC",
      nombreCorto: "Jefatura DASC (Dr. Sandoval)",
      nombre: "Oficina de la Jefatura del DASC — Dr. Jesús Andrés Sandoval Bringas",
      tipo: "oficina",
      edificioId: "dasc",
      planta: "Planta Alta",
      capacidad: 15,
      coords: [24.102760, -110.316140],
      escena360: 17,
      equipamiento: "Dirección Departamental del DASC, Sala de Juntas y Coordinación Académica · Tel. (612) 123-8800 Ext. 2000 · sandoval@uabcs.mx."
    },
    {
      id: "dsc39-coordinacion-ids",
      codigoSQL: "COORD-IDS",
      nombreCorto: "Coordinación IDS (M.T.I. Leyva)",
      nombre: "Coordinación IDS y Prácticas — M.T.I. Amado Alejandro Leyva Carrillo",
      tipo: "oficina",
      edificioId: "dasc",
      planta: "Planta Baja",
      capacidad: 12,
      coords: [24.102700, -110.316140],
      escena360: 6,
      equipamiento: "Responsable de Ingeniería en Desarrollo de Software, tutorías, carga académica y Prácticas Profesionales · Ext. 2014 · aleyva@uabcs.mx."
    },

    /* ==================== DSC-46 · SISTEMAS II / MACROCENTRO (SQL + GEOLOCALIZACIÓN) ==================== */
    {
      id: "dsc46-sc10-assembly",
      codigoSQL: "SC10-ASSEMBLY",
      nombreCorto: "SC10 - ASSEMBLY",
      nombre: "SC10-ASSEMBLY — Salón SC10 - ASSEMBLY",
      tipo: "aula",
      edificioId: "dasc-ii",
      planta: "Planta Baja",
      capacidad: 42,
      coords: [24.102410, -110.316395],
      escena360: 16,
      equipamiento: "Proyector HD, pizarrón panorámico, butacas ergonómicas y red inalámbrica (1° Semestre IDS Turno Matutino Grupo B)."
    },
    {
      id: "dsc46-sc12-delphi",
      codigoSQL: "SC12-DELPHI",
      nombreCorto: "SC12 - DELPHI",
      nombre: "SC12-DELPHI — Salón SC12 - DELPHI",
      tipo: "aula",
      edificioId: "dasc-ii",
      planta: "Planta Baja",
      capacidad: 40,
      coords: [24.102410, -110.316300],
      escena360: 16,
      equipamiento: "Pantalla de proyección, audio ambiental, contactos eléctricos y climatización (7° Semestre IDS Turno Vespertino)."
    },
    {
      id: "dsc46-sc13-algol",
      codigoSQL: "SC13-ALGOL",
      nombreCorto: "SC13 - ALGOL",
      nombre: "SC13-ALGOL — Salón SC13 - ALGOL",
      tipo: "aula",
      edificioId: "dasc-ii",
      planta: "Planta Baja",
      capacidad: 40,
      coords: [24.102410, -110.316190],
      escena360: 16,
      equipamiento: "Proyector digital, pizarrón doble, climatización y red RIUABCS (5° Semestre IDS Turno Vespertino)."
    },
    {
      id: "dsc46-sc15-fortran",
      codigoSQL: "SC15-FORTRAN",
      nombreCorto: "SC15 - FORTRAN",
      nombre: "SC15-FORTRAN — Salón SC15 - FORTRAN",
      tipo: "aula",
      edificioId: "dasc-ii",
      planta: "Planta Alta",
      capacidad: 42,
      coords: [24.102495, -110.316395],
      escena360: 15,
      equipamiento: "Proyector multimedia, pizarrón blanco, climatización e iluminación LED (1° Semestre IDS Turno Matutino Grupo A)."
    },
    {
      id: "dsc46-sc16-rust",
      codigoSQL: "SC16-RUST",
      nombreCorto: "SC16 - RUST",
      nombre: "SC16-RUST — Salón SC16 - RUST",
      tipo: "aula",
      edificioId: "dasc-ii",
      planta: "Planta Alta",
      capacidad: 42,
      coords: [24.102495, -110.316300],
      escena360: 15,
      equipamiento: "Proyector interactivo, conectores eléctricos, climatización y Wi-Fi institucional (3° IDS Matutino A y 1° IDS Vespertino A)."
    },
    {
      id: "dsc46-sc17-kotlin",
      codigoSQL: "SC17-KOTLIN",
      nombreCorto: "SC17 - KOTLIN",
      nombre: "SC17-KOTLIN — Salón SC17 - KOTLIN",
      tipo: "aula",
      edificioId: "dasc-ii",
      planta: "Planta Alta",
      capacidad: 42,
      coords: [24.102495, -110.316190],
      escena360: 15,
      equipamiento: "Proyector HD, pizarrón de gran formato, climatización y red RIUABCS (3° IDS Matutino B y 1° IDS Vespertino B)."
    },
    {
      id: "dsc46-mac",
      codigoSQL: "AULA-MAC",
      nombreCorto: "Aula MAC · Multimedia",
      nombre: "Aula MAC · Laboratorio Multimedia y Diseño UX/UI",
      tipo: "laboratorio",
      edificioId: "dasc-ii",
      planta: "Planta Baja",
      capacidad: 30,
      coords: [24.102450, -110.316260],
      escena360: 12,
      equipamiento: "Estaciones Apple iMac / Edición Multimedia, Producción Audiovisual e IA Generativa (Punto 1 de las Jornadas UABCS 2026)."
    },
    {
      id: "dsc46-lab-b",
      codigoSQL: "LAB B",
      nombreCorto: "Macrocentro · Lab B",
      nombre: "Macrocentro de Cómputo · Laboratorio B",
      tipo: "laboratorio",
      edificioId: "dasc-ii",
      planta: "Planta Baja",
      capacidad: 40,
      coords: [24.102450, -110.316360],
      escena360: 1,
      equipamiento: "40 equipos en red gigabit para prácticas intensivas de cómputo, bases de datos y talleres departamentales."
    },

    /* ==================== DSC-46B · NUEVO EDIFICIO DASC (INNOVACIÓN) ==================== */
    {
      id: "dsc46b-ia",
      codigoSQL: "LAB-IA",
      nombreCorto: "Lab Inteligencia Artificial",
      nombre: "Laboratorio de Inteligencia Artificial y Ciencia de Datos",
      tipo: "laboratorio",
      edificioId: "nuevo-dasc",
      planta: "Planta Alta",
      capacidad: 28,
      coords: [24.102200, -110.316400],
      escena360: 7,
      equipamiento: "Workstations con GPU para aprendizaje profundo, visión por computadora, PLN y robótica cognitiva (Robot NAO)."
    },
    {
      id: "dsc46b-emb",
      codigoSQL: "LAB-EMB",
      nombreCorto: "Lab Sistemas Embebidos",
      nombre: "Laboratorio de Sistemas Embebidos e IoT",
      tipo: "laboratorio",
      edificioId: "nuevo-dasc",
      planta: "Planta Baja",
      capacidad: 25,
      coords: [24.102130, -110.316380],
      escena360: 10,
      equipamiento: "Bancos de electrónica digital, microcontroladores ESP32/Arduino/Raspberry Pi, osciloscopios y sensores IoT."
    },
    {
      id: "dsc46b-hw",
      codigoSQL: "LAB-HW",
      nombreCorto: "Lab Hardware y Robótica",
      nombre: "Laboratorio de Hardware, Robótica y Automatización",
      tipo: "laboratorio",
      edificioId: "nuevo-dasc",
      planta: "Planta Baja",
      capacidad: 25,
      coords: [24.102120, -110.316280],
      escena360: 20,
      equipamiento: "Impresoras 3D, prototipado electrónico, brazos robóticos y bancos de mantenimiento de arquitectura de computadoras."
    },
    {
      id: "dsc46b-movil",
      codigoSQL: "LAB-MOVIL",
      nombreCorto: "Lab Cómputo Móvil",
      nombre: "Laboratorio de Cómputo Móvil y Realidad Aumentada",
      tipo: "laboratorio",
      edificioId: "nuevo-dasc",
      planta: "Planta Alta",
      capacidad: 28,
      coords: [24.102210, -110.316300],
      escena360: 4,
      equipamiento: "Desarrollo Android/iOS multiplataforma, pruebas de dispositivos móviles, sensores AR y diseño de experiencias interactivas."
    }
  ];

  aulas.forEach(function (a) {
    const ed = EDIFICIOS_DASC[a.edificioId] || EDIFICIOS_DASC["dasc"];
    const rawEquip = a.equipamiento;
    a.clave = ed.clave;
    a.claveEdificio = ed.clave;
    a.edificioCodigo = ed.clave;
    a.edificioSqlId = ed.sqlId;
    a.edificioLegacy = ed.sqlId;
    a.edificioNombre = ed.nombre;
    a.codigo = a.codigoSQL || a.nombreCorto || a.id.toUpperCase();
    a.scenePano = String(a.escena360 || 1);
    a.referenciaAcceso = typeof rawEquip === "string" ? rawEquip : ed.nombre;
    a.equipamientoTexto = typeof rawEquip === "string" ? rawEquip : "";
    a.equipamiento = Array.isArray(rawEquip)
      ? rawEquip
      : String(rawEquip || "")
          .split(",")
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
    a.color =
      a.tipo === "laboratorio"
        ? "#3B82F6"
        : a.tipo === "taller"
        ? "#10B981"
        : a.tipo === "aula"
        ? "#F59E0B"
        : a.tipo === "sala"
        ? "#8B5CF6"
        : "#EC4899";
    a.icono =
      a.tipo === "laboratorio"
        ? "bi-pc-display"
        : a.tipo === "taller"
        ? "bi-tools"
        : a.tipo === "aula"
        ? "bi-easel2-fill"
        : "bi-door-open-fill";
    a.etiqueta = (a.codigoSQL ? a.codigoSQL + " · " : "") + ed.clave;
  });

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  return {
    edificios: EDIFICIOS_DASC,
    aulas: aulas,
    salones: aulas,

    /** Busca un aula por su ID, código SQL (ej. "LAB A", "SC16-RUST", "T1") o texto parcial. */
    buscar: function (query) {
      if (!query) return null;
      const q = norm(query);
      // 1. Coincidencia exacta por id, codigoSQL o nombreCorto
      let found = aulas.find(function (a) {
        return (
          norm(a.id) === q ||
          norm(a.codigoSQL) === q ||
          norm(a.nombreCorto) === q ||
          norm(a.nombre) === q
        );
      });
      if (found) return found;

      // 2. Si el texto incluye el código SQL (ej. "SC16-RUST · Salón SC16 - RUST" o "LAB G (Laboratorio G)")
      found = aulas.find(function (a) {
        if (!a.codigoSQL) return false;
        const c = norm(a.codigoSQL);
        return q.indexOf(c) !== -1 || c.indexOf(q) !== -1;
      });
      if (found) return found;

      // 3. Coincidencia parcial en nombre
      return (
        aulas.find(function (a) {
          return norm(a.nombre).indexOf(q) !== -1 || norm(a.nombreCorto).indexOf(q) !== -1;
        }) || null
      );
    },

    /** Aulas de un edificio del DASC (acepta "dasc", "dsc-39", "dasc-ii", "dsc-46", "nuevo-dasc", "dsc-46b"). */
    porEdificio: function (edificioId) {
      const q = norm(edificioId);
      return aulas.filter(function (a) {
        return (
          norm(a.edificioId) === q ||
          norm(a.claveEdificio) === q ||
          norm(a.edificioSqlId) === q
        );
      });
    },

    /** Aulas de un tipo (aula | laboratorio | taller | sala | oficina). */
    porTipo: function (tipo) {
      return aulas.filter(function (a) {
        return a.tipo === tipo;
      });
    }
  };
})();

/* ==========================================================================
   MOTOR DE RUTAS PEATONALES DEL CAMPUS LA PAZ UABCS (Dijkstra sobre Andadores)
   Permite trazar rutas reales sobre los pasillos y avenidas del campus hacia
   cualquier edificio o salón del DASC, tanto en el Mapa 2D/3D como en Guía AR.
   ========================================================================== */
window.CAMPUS_RUTAS = (function () {
  "use strict";

  // Nodos principales de los andadores y avenidas peatonales del Campus La Paz
  const NODOS = {
    "acceso-forjadores": { id: "acceso-forjadores", nombre: "Arco de Entrada Principal (Blvd. Forjadores · AD-59)", coords: [24.10395, -110.31265] },
    "bulevar-medio": { id: "bulevar-medio", nombre: "Bulevar Universitario de Acceso", coords: [24.10315, -110.31355] },
    "glorieta": { id: "glorieta", nombre: "Glorieta Principal UABCS", coords: [24.10234, -110.31456] },
    "parada-bus": { id: "parada-bus", nombre: "Parada de Camiones (AD-64)", coords: [24.10226, -110.31447] },
    "explanada-poliforo": { id: "explanada-poliforo", nombre: "Explanada del Poliforo Cultural (AD-52)", coords: [24.10305, -110.31585] },
    "corredor-control-escolar": { id: "corredor-control-escolar", nombre: "Andador Servicios Estudiantiles (AD-55)", coords: [24.10252, -110.31565] },
    "plaza-biblioteca": { id: "plaza-biblioteca", nombre: "Explanada de Biblioteca Central (AD-20)", coords: [24.10185, -110.31610] },
    "andador-rectoria": { id: "andador-rectoria", nombre: "Explanada de Rectoría (AD-19)", coords: [24.10128, -110.31645] },
    "andador-dele": { id: "andador-dele", nombre: "Andador Lenguas Extranjeras DELE (AD-18)", coords: [24.10055, -110.31650] },
    "plaza-cafeteria": { id: "plaza-cafeteria", nombre: "Plaza Cafetería Central y CSU (AD-10 / AD-63)", coords: [24.10085, -110.31570] },
    "plaza-roja-csh": { id: "plaza-roja-csh", nombre: "Plaza Central Ciencias Sociales y Mar (CSH-02 / CMT-03)", coords: [24.10125, -110.31495] },
    "andador-humanidades": { id: "andador-humanidades", nombre: "Andador Humanidades y Posgrado (CSH-43 / CSH-56)", coords: [24.10185, -110.31345] },
    "andador-agropecuarias": { id: "andador-agropecuarias", nombre: "Corredor Ciencias Agropecuarias (CA-04 / CA-51)", coords: [24.10035, -110.31485] },
    "andador-mar-sur": { id: "andador-mar-sur", nombre: "Corredor Sur Ciencias del Mar e Ingeniería Básica (CMT-26)", coords: [24.09935, -110.31580] },
    "andador-gimnasio": { id: "andador-gimnasio", nombre: "Andador Gimnasio Universitario (AD-01)", coords: [24.10195, -110.31445] },
    "andador-estadio": { id: "andador-estadio", nombre: "Acceso Unidad Deportiva y Estadio (AD-58)", coords: [24.10375, -110.31590] },
    "dasc-norte": { id: "dasc-norte", nombre: "Acceso Norte Edificio Principal DASC (DSC-39)", coords: [24.10275, -110.31627] },
    "dasc-centro": { id: "dasc-centro", nombre: "Corredor Techado DASC · Sistemas II (DSC-46)", coords: [24.10245, -110.31627] },
    "dasc-sur": { id: "dasc-sur", nombre: "Andador Nuevo Edificio DASC (DSC-46B)", coords: [24.10215, -110.31627] }
  };

  // Conexiones bidireccionales entre nodos de andadores
  const ARISTAS = [
    ["acceso-forjadores", "bulevar-medio"],
    ["bulevar-medio", "glorieta"],
    ["bulevar-medio", "andador-humanidades"],
    ["glorieta", "parada-bus"],
    ["glorieta", "andador-gimnasio"],
    ["glorieta", "corredor-control-escolar"],
    ["glorieta", "plaza-roja-csh"],
    ["andador-gimnasio", "andador-humanidades"],
    ["andador-gimnasio", "plaza-roja-csh"],
    ["corredor-control-escolar", "explanada-poliforo"],
    ["corredor-control-escolar", "dasc-norte"],
    ["corredor-control-escolar", "dasc-centro"],
    ["corredor-control-escolar", "plaza-biblioteca"],
    ["explanada-poliforo", "dasc-norte"],
    ["explanada-poliforo", "andador-estadio"],
    ["dasc-norte", "dasc-centro"],
    ["dasc-centro", "dasc-sur"],
    ["dasc-sur", "plaza-biblioteca"],
    ["plaza-biblioteca", "andador-rectoria"],
    ["plaza-biblioteca", "plaza-roja-csh"],
    ["plaza-biblioteca", "plaza-cafeteria"],
    ["andador-rectoria", "andador-dele"],
    ["andador-rectoria", "plaza-cafeteria"],
    ["andador-dele", "plaza-cafeteria"],
    ["andador-dele", "andador-mar-sur"],
    ["plaza-cafeteria", "plaza-roja-csh"],
    ["plaza-cafeteria", "andador-agropecuarias"],
    ["plaza-cafeteria", "andador-mar-sur"],
    ["plaza-roja-csh", "andador-agropecuarias"],
    ["plaza-roja-csh", "andador-humanidades"],
    ["andador-agropecuarias", "andador-mar-sur"]
  ];

  // Puntos de partida predefinidos para el selector de ruta y simulador AR
  const PUNTOS_ORIGEN = {
    "entrada-principal": { id: "entrada-principal", nombre: "Arco Entrada Principal (Blvd. Forjadores · AD-59)", coords: [24.10395, -110.31265] },
    "entrada": { id: "entrada", nombre: "Arco Entrada Principal (Blvd. Forjadores · AD-59)", coords: [24.10395, -110.31265] },
    "glorieta": { id: "glorieta", nombre: "Glorieta Principal / Parada de Camiones", coords: [24.10234, -110.31456] },
    "biblioteca": { id: "biblioteca", nombre: "Explanada Biblioteca Central (AD-20)", coords: [24.10185, -110.31610] },
    "poliforo": { id: "poliforo", nombre: "Explanada Poliforo Cultural (AD-52)", coords: [24.10305, -110.31585] },
    "rectoria": { id: "rectoria", nombre: "Explanada de Rectoría (AD-19)", coords: [24.10128, -110.31645] },
    "cafeteria": { id: "cafeteria", nombre: "Cafetería Central y CSU (AD-10)", coords: [24.10055, -110.31580] },
    "dasc": { id: "dasc", nombre: "Pasillo Central DASC (DSC-39 / DSC-46)", coords: [24.10260, -110.31627] },
    "humanidades": { id: "humanidades", nombre: "Plaza Humanidades y DACSJ (CSH-45)", coords: [24.10185, -110.31345] }
  };

  const PUNTOS_ACCESO_LISTA = [
    PUNTOS_ORIGEN["entrada-principal"],
    PUNTOS_ORIGEN["glorieta"],
    PUNTOS_ORIGEN["biblioteca"],
    PUNTOS_ORIGEN["poliforo"],
    PUNTOS_ORIGEN["dasc"],
    PUNTOS_ORIGEN["rectoria"],
    PUNTOS_ORIGEN["cafeteria"],
    PUNTOS_ORIGEN["humanidades"]
  ];

  function aRad(g) {
    return (g * Math.PI) / 180;
  }
  function aGrados(r) {
    return (r * 180) / Math.PI;
  }

  function distanciaMetros(a, b) {
    if (!a || !b) return 0;
    const R = 6371000;
    const dLat = aRad(b[0] - a[0]);
    const dLng = aRad(b[1] - a[1]);
    const lat1 = aRad(a[0]);
    const lat2 = aRad(b[0]);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function calcularRumbo(a, b) {
    if (!a || !b) return 0;
    const lat1 = aRad(a[0]);
    const lat2 = aRad(b[0]);
    const dLng = aRad(b[1] - a[1]);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (aGrados(Math.atan2(y, x)) + 360) % 360;
  }

  function puntoCardinal(grados) {
    const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
    const idx = Math.round(((grados % 360) + 360) % 360 / 45) % 8;
    return dirs[idx];
  }

  function nodoMasCercano(coords) {
    let mejorId = null;
    let mejorDist = Infinity;
    Object.keys(NODOS).forEach(function (k) {
      const d = distanciaMetros(coords, NODOS[k].coords);
      if (d < mejorDist) {
        mejorDist = d;
        mejorId = k;
      }
    });
    return { id: mejorId, dist: mejorDist, nodo: NODOS[mejorId] };
  }

  function calcularRuta(origenCoords, destinoCoords, nombreDestino) {
    const orig = Array.isArray(origenCoords) ? origenCoords : PUNTOS_ORIGEN.biblioteca.coords;
    const dest = Array.isArray(destinoCoords) ? destinoCoords : [24.10275, -110.31627];
    const distDirecta = distanciaMetros(orig, dest);

    // Si está muy cerca (< 55m), ir directo
    if (distDirecta <= 55) {
      const rumbo = Math.round(calcularRumbo(orig, dest));
      const dRed = Math.round(distDirecta);
      const tMin = Math.max(1, Math.ceil(distDirecta / 72));
      return {
        puntos: [orig, dest],
        waypoints: [orig, dest],
        distanciaTotal: dRed,
        distanciaM: dRed,
        tiempoMinutos: tMin,
        tiempoMin: tMin,
        rumboInicial: rumbo,
        acimutInicial: rumbo,
        cardinal: puntoCardinal(rumbo),
        siguientePunto: dest,
        pasos: [
          "Camina directamente " + dRed + " m en dirección " + puntoCardinal(rumbo) + " (" + rumbo + "°) hacia " + (nombreDestino || "tu destino") + "."
        ]
      };
    }

    const nIni = nodoMasCercano(orig).id;
    const nFin = nodoMasCercano(dest).id;

    // Dijkstra sobre el grafo de andadores
    const dist = {};
    const prev = {};
    const visitados = {};
    Object.keys(NODOS).forEach(function (k) {
      dist[k] = Infinity;
      prev[k] = null;
    });
    dist[nIni] = 0;

    while (true) {
      let u = null;
      let mejor = Infinity;
      Object.keys(NODOS).forEach(function (k) {
        if (!visitados[k] && dist[k] < mejor) {
          mejor = dist[k];
          u = k;
        }
      });
      if (u === null || u === nFin) break;
      visitados[u] = true;

      ARISTAS.forEach(function (par) {
        let v = null;
        if (par[0] === u) v = par[1];
        else if (par[1] === u) v = par[0];
        if (v && !visitados[v]) {
          const peso = distanciaMetros(NODOS[u].coords, NODOS[v].coords);
          if (dist[u] + peso < dist[v]) {
            dist[v] = dist[u] + peso;
            prev[v] = u;
          }
        }
      });
    }

    const secuenciaNodos = [];
    let actual = nFin;
    while (actual) {
      secuenciaNodos.unshift(NODOS[actual]);
      actual = prev[actual];
    }

    const puntos = [orig];
    const pasos = [];
    secuenciaNodos.forEach(function (n) {
      const dAlPrev = distanciaMetros(puntos[puntos.length - 1], n.coords);
      if (dAlPrev > 12) {
        puntos.push(n.coords);
        pasos.push("Pasa por " + n.nombre + " (" + Math.round(dAlPrev) + " m)");
      }
    });
    const dFinal = distanciaMetros(puntos[puntos.length - 1], dest);
    if (dFinal > 4) {
      puntos.push(dest);
    }
    pasos.push("Llega a " + (nombreDestino || "tu destino"));

    let totalM = 0;
    for (let i = 0; i < puntos.length - 1; i++) {
      totalM += distanciaMetros(puntos[i], puntos[i + 1]);
    }

    const sigPunto = puntos.length > 1 ? puntos[1] : dest;
    const rumboIni = Math.round(calcularRumbo(orig, sigPunto));
    const dRed = Math.round(totalM);
    const tMin = Math.max(1, Math.ceil(totalM / 72));

    return {
      puntos: puntos,
      waypoints: puntos,
      distanciaTotal: dRed,
      distanciaM: dRed,
      tiempoMinutos: tMin,
      tiempoMin: tMin,
      rumboInicial: rumboIni,
      acimutInicial: rumboIni,
      cardinal: puntoCardinal(rumboIni),
      siguientePunto: sigPunto,
      pasos: pasos
    };
  }

  return {
    nodos: NODOS,
    puntosOrigen: PUNTOS_ORIGEN,
    puntosAcceso: PUNTOS_ACCESO_LISTA,
    distanciaMetros: distanciaMetros,
    calcularRumbo: calcularRumbo,
    puntoCardinal: puntoCardinal,
    calcularRuta: calcularRuta
  };
})();
