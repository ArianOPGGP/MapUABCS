/**
 * mockData.js
 * Datos oficiales del Campus La Paz de la UABCS y del Departamento Académico de Sistemas Computacionales (DASC).
 * Referencias oficiales:
 * - Horarios IDS: https://www.uabcs.mx/dasc/estudiantes/horarios/horarios-ingenieria-en-desarrollo-de-software/
 * - Mapa Campus La Paz: https://www.uabcs.mx/dasc/wp-content/uploads/2022/10/Mapa-Campus-La-Paz-2022.pdf
 * - Portal DASC y Eventos: https://www.uabcs.mx/dasc/
 */

window.DASC_MOCK_DATA = {
  // Información institucional para la Página de Inicio Normal
  homeInfo: {
    institution: "Universidad Autónoma de Baja California Sur",
    department: "Departamento Académico de Sistemas Computacionales (DASC)",
    motto: "Sabiduría como meta, patria como destino",
    period: "Periodo Escolar 2026-II",
    address: "Boulevard Forjadores S/N entre Av. Universidad y Félix Agramont Cota, Col. Universitario, C.P. 23080, La Paz, B.C.S.",
    phone: "(612) 123-8800",
    mision:
      "Formar recursos humanos profesionales, innovadores y participativos, con un alto sentido ético y con capacidad crítica, de análisis, de investigación y dirección, que con responsabilidad, honestidad y solidaridad aporten soluciones mediante el diseño, desarrollo y aplicación de tecnologías computacionales.",
    vision:
      "Ser un Departamento Académico que ofrece programas educativos de licenciatura y posgrado de alta calidad y pertinentes, vinculados al sector productivo, público y social, reconocidos a nivel nacional e internacional por su sólida formación académica y desarrollo de investigación.",
    stats: [
      { value: "600+", label: "Alumnos Activos DASC" },
      { value: "69", label: "Docentes e Investigadores" },
      { value: "6", label: "Ingenierías y Licenciaturas" },
      { value: "17", label: "Salones y Labs en SQL" }
    ],
    programs: [
      {
        name: "Ingeniería en Desarrollo de Software (IDS)",
        plan: "Plan 2022 · Acreditado CONAIC",
        badge: "Carrera Principal",
        url: "https://www.uabcs.mx/dasc/ingenieria-en-desarrollo-de-software-plan-2022/",
        desc: "Formación especializada en arquitectura de software, desarrollo web full-stack, aplicaciones móviles, bases de datos, calidad de software y cómputo en la nube."
      },
      {
        name: "Ingeniería en Inteligencia Artificial (IIA)",
        plan: "Plan 2026",
        badge: "Nuevo Programa",
        url: "https://www.uabcs.mx/dasc/ingenieria-en-inteligencia-artificial-plan-2026/",
        desc: "Diseño de modelos de aprendizaje automático, visión por computadora, procesamiento de lenguaje natural y sistemas autónomos inteligentes."
      },
      {
        name: "Ingeniería en Ciberseguridad (IC)",
        plan: "Plan 2024",
        badge: "Seguridad TI",
        url: "https://www.uabcs.mx/dasc/ingenieria-en-ciberseguridad-plan-2024/",
        desc: "Protección de infraestructura crítica, auditoría forense digital, criptografía, seguridad en redes y respuesta a incidentes."
      },
      {
        name: "Ingeniería en Redes y Telecomunicaciones (IRT)",
        plan: "Plan 2026",
        badge: "Infraestructura",
        url: "https://www.uabcs.mx/dasc/ingenieria-en-redes-y-telecomunicaciones-plan-2026/",
        desc: "Diseño, implementación y administración de redes empresariales, telecomunicaciones, fibra óptica, IoT y servicios en la nube."
      },
      {
        name: "Ingeniería en Tecnología Computacional (ITC)",
        plan: "Plan 2018",
        badge: "Hardware y Sistemas",
        url: "https://www.uabcs.mx/dasc/index.php/ingenieria-en-tecnologia-computacional-plan-2018/",
        desc: "Integración de sistemas embebidos, automatización, robótica, sistemas operativos y cómputo científico."
      },
      {
        name: "Lic. en Administración de Tecnologías de la Información (LATI / LITI)",
        plan: "Plan 2017 / 2022",
        badge: "Gestión TI",
        url: "https://www.uabcs.mx/dasc/index.php/licenciatura-en-administracion-en-tecnologias-de-la-informacion-plan-2017/",
        desc: "Dirección estratégica de proyectos tecnológicos, gobierno de TI, transformación digital y consultoría empresarial."
      }
    ],
    quickLinks: [
      {
        title: "SIIA UABCS",
        subtitle: "Portal Estudiantil y Kárdex",
        url: "https://siia.uabcs.mx/"
      },
      {
        title: "UABCS en Línea",
        subtitle: "Aulas Virtuales Moodle",
        url: "https://enlinea.uabcs.mx"
      },
      {
        title: "Biblioteca Universitaria",
        subtitle: "Catálogo y Acervo Digital",
        url: "https://biblio.uabcs.mx"
      },
      {
        title: "Horarios Oficiales IDS",
        subtitle: "Fuente Web DASC 2026-II",
        url: "https://www.uabcs.mx/dasc/estudiantes/horarios/horarios-ingenieria-en-desarrollo-de-software/"
      },
      {
        title: "Calendario Escolar 2026",
        subtitle: "Documento Oficial CGU",
        url: "https://www.uabcs.mx/dasc/wp-content/uploads/2026/02/Calendario-Escolar-2026-CGU-F.pdf"
      },
      {
        title: "Mapa Oficial PDF",
        subtitle: "Plano Campus La Paz",
        url: "./assets/Mapa-Campus-La-Paz-2022.pdf"
      }
    ]
  },

  // Credenciales de acceso administrativo
  adminCredentials: {
    username: "admin",
    email: "admin@uabcs.mx",
    password: "admin123",
    name: "Coordinación DASC - UABCS"
  },

  // =========================================================================
  // EDIFICIOS DEL CAMPUS LA PAZ UABCS (Basado en Mapa-Campus-La-Paz-2022.pdf)
  // Incluye información detallada de todos los salones en los edificios del DASC
  // =========================================================================
  buildings: [
    {
      id: "dsc-39",
      code: "DSC-39",
      name: "Departamento Académico de Sistemas Computacionales (Edificio Principal DASC)",
      shortName: "Edificio DASC",
      zone: "Sistemas Computacionales",
      category: "Sistemas Computacionales (DASC)",
      isDascBuilding: true,
      description:
        "Sede principal del DASC en el Campus La Paz (DSC-39). Alberga la Jefatura del Departamento (Dr. Jesús Andrés Sandoval Bringas), la Coordinación de IDS (M.T.I. Amado Alejandro Leyva Carrillo), cubículos de maestros, área de servicio social, laboratorio de redes (LR), talleres T1/T2, laboratorios de cómputo (LAB A, LAB F, LAB G), los salones SC2-JAVA y SC5-PROLOG, y la Sala Alan Turing.",
      floors: 2,
      mapCoords: { x: 525, y: 295, width: 118, height: 78, height3d: 48, color: "#2563EB" },
      gps: { lat: 24.10285, lng: -110.31612 },
      distanceMeters: 45,
      arBearing: 35,
      arInstruction: "Avanza por el andador central hacia la zona norte-central del campus hasta el edificio DSC-39 (DASC).",
      salonesDasc: [
        {
          codigo: "LAB A",
          nombre: "Laboratorio A de Cómputo y Programación",
          planta: "Planta Baja",
          tipo: "Laboratorio de Cómputo",
          capacidad: "35 equipos",
          detalle: "Prácticas de Taller de Programación (A), Metodología de la Programación, Programación 2 (A) y sede del Concurso de Algoritmos y Programación."
        },
        {
          codigo: "LAB F",
          nombre: "Laboratorio F de Desarrollo de Software",
          planta: "Planta Baja",
          tipo: "Laboratorio de Cómputo",
          capacidad: "35 equipos",
          detalle: "Clases prácticas de Taller de Programación (A), Metodología de la Programación y Programación 2 (A) para 1° y 3° semestre de IDS."
        },
        {
          codigo: "LAB G",
          nombre: "Laboratorio G de Ingeniería Web y Multimedia",
          planta: "Planta Alta",
          tipo: "Laboratorio de Cómputo",
          capacidad: "35 equipos",
          detalle: "Especializado en Programación Web (5° IDS Matutino y Vespertino) y Programación 2 (3° IDS)."
        },
        {
          codigo: "LR",
          nombre: "Laboratorio de Redes y Telecomunicaciones (LR)",
          planta: "Planta Baja",
          tipo: "Laboratorio de Redes",
          capacidad: "30 estaciones + Racks Cisco",
          detalle: "Equipado con switches, routers, cableado estructurado y servidores para la materia de Redes 1 (A) de 5° semestre IDS."
        },
        {
          codigo: "T1",
          nombre: "Taller 1 de Sistemas Computacionales (T1)",
          planta: "Planta Alta",
          tipo: "Taller Especializado",
          capacidad: "36 alumnos",
          detalle: "Sede de 5° IDS TM Grupo A (Base de Datos 2, Ingeniería de Software 1, Diseño de Interfaces, Teoría de la Computación) y 7° IDS (Formación Disciplinaria 2)."
        },
        {
          codigo: "T2",
          nombre: "Taller 2 de Inteligencia Artificial y Calidad (T2)",
          planta: "Planta Alta",
          tipo: "Taller Especializado",
          capacidad: "36 alumnos",
          detalle: "Sede de 7° IDS Turno Matutino (Inteligencia Artificial, Calidad del Software, Sistemas Operativos y Formación Disciplinaria 1)."
        },
        {
          codigo: "SC2-JAVA",
          nombre: "Salón SC2 - JAVA",
          planta: "Planta Baja",
          tipo: "Aula de Clase DASC",
          capacidad: "40 alumnos",
          detalle: "Aula oficial de 5° Semestre IDS Turno Matutino Grupo B (Ingeniería de Software 1, Base de Datos 2, Teoría de la Computación y Diseño de Interfaces)."
        },
        {
          codigo: "SC5-PROLOG",
          nombre: "Salón SC5 - PROLOG",
          planta: "Planta Alta",
          tipo: "Aula de Clase DASC",
          capacidad: "40 alumnos",
          detalle: "Aula oficial de 3° Semestre IDS Turno Vespertino (Estructura de Datos 1, Álgebra Lineal, Probabilidad y Estadística, Paradigmas Tecnológicos, RSU e Inglés 3)."
        },
        {
          codigo: "ALAN-TURING",
          nombre: "Aula de Usos Múltiples 'Alan Turing'",
          planta: "Planta Baja",
          tipo: "Auditorio / Sala DASC",
          capacidad: "75 personas",
          detalle: "Sala audiovisual del DASC para inauguración del Game Jam, defensas de proyectos integradores, seminarios y talleres."
        }
      ],
      facilities: [
        "Jefatura del DASC — Oficina Dr. Jesús Andrés Sandoval Bringas (Planta Alta)",
        "Coordinación IDS — Oficina M.T.I. Amado Alejandro Leyva Carrillo (Planta Baja)",
        "Cubículos de Maestros e Investigadores del DASC",
        "Área de Servicio Social, Prácticas Profesionales y Recepción Administrativa",
        "Área de Redes, Telecomunicaciones y Site de Servidores DASC (LR)",
        "Laboratorios LAB A, LAB F, LAB G y Talleres T1, T2",
        "Salones SC2-JAVA, SC5-PROLOG y Sala Alan Turing"
      ],
      panorama360: {
        title: "Interior 360° - Edificio DASC (DSC-39)",
        defaultScene: "lab-g",
        scenes: [
          {
            id: "lab-g",
            name: "LAB G y Talleres T1/T2 (Planta Alta DSC-39)",
            subtitle: "Planta Alta · Programación Web, Ingeniería de Software e Inteligencia Artificial",
            themeColor: "#1d4ed8",
            accentColor: "#F59E0B",
            elements: [
              { yaw: 0, pitch: 0, label: "Pizarrón y Proyección HD - LAB G (Programación Web)", type: "board" },
              { yaw: 90, pitch: -8, label: "Estaciones de Cómputo de Desarrollo (Equipos 01-35)", type: "workstations" },
              { yaw: 180, pitch: -5, label: "Acceso a Talleres T1 y T2 (5° y 7° IDS)", type: "door", targetScene: "pasillo-dasc" },
              { yaw: 270, pitch: 0, label: "Pasillo hacia Jefatura DASC y Cubículos Docentes", type: "door", targetScene: "pasillo-dasc" }
            ]
          },
          {
            id: "lab-redes",
            name: "LR - Laboratorio de Redes y LAB A / LAB F (Planta Baja)",
            subtitle: "Planta Baja · Racks de Telecomunicaciones, Redes 1 y Programación",
            themeColor: "#0f766e",
            accentColor: "#38bdf8",
            elements: [
              { yaw: 0, pitch: 0, label: "Racks de Enrutamiento y Conmutación - Lab de Redes (LR)", type: "server" },
              { yaw: 115, pitch: -6, label: "Bancos de Trabajo de LAB A y LAB F", type: "workstations" },
              { yaw: 240, pitch: 0, label: "Salida a Pasillo Central y Coordinación IDS", type: "door", targetScene: "pasillo-dasc" }
            ]
          },
          {
            id: "pasillo-dasc",
            name: "Jefatura DASC, Coordinación IDS y Cubículos de Maestros",
            subtitle: "Oficinas Dr. Jesús Andrés Sandoval Bringas y M.T.I. Alejandro Leyva Carrillo",
            themeColor: "#1e293b",
            accentColor: "#F59E0B",
            elements: [
              { yaw: 15, pitch: 0, label: "Jefatura DASC (Dr. Jesús Andrés Sandoval Bringas)", type: "office" },
              { yaw: 110, pitch: 0, label: "Coordinación IDS y Prácticas (M.T.I. Alejandro Leyva)", type: "office" },
              { yaw: 205, pitch: 0, label: "Ingresar a LAB G y Talleres T1/T2", type: "door", targetScene: "lab-g" },
              { yaw: 300, pitch: 0, label: "Ingresar a Laboratorio de Redes (LR) y LAB A", type: "door", targetScene: "lab-redes" }
            ]
          }
        ]
      }
    },
    {
      id: "dsc-46",
      code: "DSC-46",
      name: "Sistemas II — Aulas de Ingeniería en Desarrollo de Software",
      shortName: "Sistemas II (DSC-46)",
      zone: "Sistemas Computacionales",
      category: "Sistemas Computacionales (DASC)",
      isDascBuilding: true,
      description:
        "Segundo edificio oficial del Departamento Académico de Sistemas Computacionales (DSC-46 en el Mapa Campus La Paz). Cuenta con las aulas temáticas nombradas en honor a lenguajes de programación históricos y modernos (SC10-ASSEMBLY, SC12-DELPHI, SC13-ALGOL, SC15-FORTRAN, SC16-RUST, SC17-KOTLIN), además de cubículos de profesores e infraestructura de red RIUABCS.",
      floors: 2,
      mapCoords: { x: 405, y: 265, width: 108, height: 72, height3d: 42, color: "#3B82F6" },
      gps: { lat: 24.1031, lng: -110.31645 },
      distanceMeters: 68,
      arBearing: 315,
      arInstruction: "Camina 68 m al noroeste del edificio principal DSC-39 para llegar al edificio Sistemas II (DSC-46).",
      salonesDasc: [
        {
          codigo: "SC10-ASSEMBLY",
          nombre: "Salón SC10 - ASSEMBLY",
          planta: "Planta Baja",
          tipo: "Aula de Clase DASC",
          capacidad: "42 alumnos",
          detalle: "Sede de 1° Semestre IDS Turno Matutino Grupo B (Introducción a las TI, Matemáticas 1, Expresión Oral y Escrita, Física e Inglés I)."
        },
        {
          codigo: "SC12-DELPHI",
          nombre: "Salón SC12 - DELPHI",
          planta: "Planta Baja",
          tipo: "Aula de Clase DASC",
          capacidad: "40 alumnos",
          detalle: "Sede de 7° Semestre IDS Turno Vespertino (Calidad del Software, Inteligencia Artificial, Ciberseguridad y Formación Disciplinaria 2)."
        },
        {
          codigo: "SC13-ALGOL",
          nombre: "Salón SC13 - ALGOL",
          planta: "Planta Baja",
          tipo: "Aula de Clase DASC",
          capacidad: "40 alumnos",
          detalle: "Sede de 5° Semestre IDS Turno Vespertino (Base de Datos 2, Ingeniería de Software 1, Teoría de la Computación y Diseño de Interfaces)."
        },
        {
          codigo: "SC15-FORTRAN",
          nombre: "Salón SC15 - FORTRAN",
          planta: "Planta Alta",
          tipo: "Aula de Clase DASC",
          capacidad: "42 alumnos",
          detalle: "Sede de 1° Semestre IDS Turno Matutino Grupo A (Matemáticas 1, Introducción a las TI, Expresión Oral y Escrita, Inglés I y Física)."
        },
        {
          codigo: "SC16-RUST",
          nombre: "Salón SC16 - RUST",
          planta: "Planta Alta",
          tipo: "Aula de Clase DASC",
          capacidad: "42 alumnos",
          detalle: "Sede de 3° Semestre IDS Matutino Grupo A (Estructura de Datos 1, Probabilidad, Álgebra Lineal, Paradigmas, RSU, Inglés 3) y 1° IDS Vespertino Grupo A."
        },
        {
          codigo: "SC17-KOTLIN",
          nombre: "Salón SC17 - KOTLIN",
          planta: "Planta Alta",
          tipo: "Aula de Clase DASC",
          capacidad: "42 alumnos",
          detalle: "Sede de 3° Semestre IDS Matutino Grupo B (Álgebra Lineal, Estructura de Datos 1, Probabilidad, Paradigmas, RSU, Inglés 3) y 1° IDS Vespertino Grupo B."
        }
      ],
      facilities: [
        "Salón SC10-ASSEMBLY (Planta Baja — 1° IDS TM-B)",
        "Salón SC12-DELPHI (Planta Baja — 7° IDS TV)",
        "Salón SC13-ALGOL (Planta Baja — 5° IDS TV)",
        "Salón SC15-FORTRAN (Planta Alta — 1° IDS TM-A)",
        "Salón SC16-RUST (Planta Alta — 3° IDS TM-A y 1° IDS TV-A)",
        "Salón SC17-KOTLIN (Planta Alta — 3° IDS TM-B y 1° IDS TV-B)",
        "Cubículos de Maestros Anexo Sistemas II y Red Wi-Fi RIUABCS"
      ],
      panorama360: {
        title: "Interior 360° - Edificio Sistemas II (DSC-46)",
        defaultScene: "aulas-altas",
        scenes: [
          {
            id: "aulas-altas",
            name: "Planta Alta: Salones SC15-FORTRAN, SC16-RUST y SC17-KOTLIN",
            subtitle: "Aulas climatizadas con proyección multimedia para 1° y 3° Semestre IDS",
            themeColor: "#1e3a8a",
            accentColor: "#F59E0B",
            elements: [
              { yaw: 0, pitch: 0, label: "Salón SC15-FORTRAN (1° IDS Matutino A)", type: "board" },
              { yaw: 120, pitch: -5, label: "Salón SC16-RUST (3° IDS Matutino A / 1° TV A)", type: "workstations" },
              { yaw: 240, pitch: 0, label: "Salón SC17-KOTLIN y Escalera a Planta Baja", type: "door", targetScene: "aulas-bajas" }
            ]
          },
          {
            id: "aulas-bajas",
            name: "Planta Baja: Salones SC10-ASSEMBLY, SC12-DELPHI y SC13-ALGOL",
            subtitle: "Aulas de 1°, 5° y 7° Semestre de Ingeniería en Desarrollo de Software",
            themeColor: "#312e81",
            accentColor: "#38bdf8",
            elements: [
              { yaw: 0, pitch: 0, label: "Salón SC10-ASSEMBLY (1° IDS Matutino B)", type: "board" },
              { yaw: 130, pitch: -6, label: "Salones SC12-DELPHI (7° TV) y SC13-ALGOL (5° TV)", type: "workstations" },
              { yaw: 260, pitch: 0, label: "Subir a Planta Alta (SC15, SC16, SC17)", type: "door", targetScene: "aulas-altas" }
            ]
          }
        ]
      }
    },
    {
      id: "ad-65",
      code: "AD-65",
      name: "CTIC — Centro de Tecnologías de la Información y Comunicaciones",
      shortName: "CTIC / Redes (AD-65)",
      zone: "Administrativos",
      category: "Administrativos",
      isDascBuilding: false,
      description:
        "Centro responsable de la infraestructura tecnológica institucional de la UABCS, administración de la red inalámbrica RIUABCS, servidores centrales, cuentas de correo institucional (@uabcs.mx y @alu.uabcs.mx), plataforma SIIA y campus virtual UABCS en Línea.",
      floors: 1,
      mapCoords: { x: 470, y: 175, width: 95, height: 58, height3d: 32, color: "#EAB308" },
      gps: { lat: 24.10335, lng: -110.3162 },
      distanceMeters: 85,
      arBearing: 15,
      arInstruction: "Dirígete al norte del edificio DSC-39 hacia el Centro de Tecnologías de la Información y Comunicaciones (AD-65).",
      facilities: [
        "Nodo Central de Red Institucional RIUABCS y Telecomunicaciones",
        "Soporte de Cuentas de Correo Institucional (@alu.uabcs.mx)",
        "Administración de Servidores SIIA y Plataforma UABCS en Línea",
        "Atención Técnica a Usuarios y Conectividad Universitaria"
      ]
    },
    {
      id: "ad-19",
      code: "AD-19",
      name: "Rectoría y Administración Central UABCS",
      shortName: "Rectoría (AD-19)",
      zone: "Administrativos",
      category: "Administrativos",
      isDascBuilding: false,
      description:
        "Edificio sede de la Rectoría, Secretaría General, Secretaría de Administración y Finanzas, y oficinas centrales de gobierno de la Universidad Autónoma de Baja California Sur.",
      floors: 2,
      mapCoords: { x: 705, y: 405, width: 105, height: 68, height3d: 44, color: "#EAB308" },
      gps: { lat: 24.1023, lng: -110.3151 },
      distanceMeters: 140,
      arBearing: 120,
      arInstruction: "Avanza hacia la explanada principal sureste frente a la glorieta de entrada hasta el edificio de Rectoría (AD-19).",
      facilities: [
        "Oficina del Rector y Secretaría General UABCS",
        "Dirección de Finanzas y Cajas de Pago Institucional",
        "Sala de Consejo General Universitario (CGU)",
        "Departamento de Recursos Humanos y Tesorería"
      ]
    },
    {
      id: "ad-55",
      code: "AD-55",
      name: "Centro de Atención a Estudiantes (CAE / Servicios Escolares)",
      shortName: "Atención a Estudiantes (AD-55)",
      zone: "Administrativos",
      category: "Administrativos",
      isDascBuilding: false,
      description:
        "Módulo integral de Servicios Escolares para alumnos de la UABCS: trámites de ingreso, reinscripción, constancias de estudios, kárdex oficial, credencialización, becas, servicio social y titulación.",
      floors: 1,
      mapCoords: { x: 765, y: 315, width: 100, height: 60, height3d: 30, color: "#EAB308" },
      gps: { lat: 24.10265, lng: -110.31485 },
      distanceMeters: 155,
      arBearing: 95,
      arInstruction: "Camina hacia el sector este del campus, junto al área administrativa, hasta el edificio AD-55 (Centro de Atención a Estudiantes).",
      facilities: [
        "Ventanillas de Servicios Escolares y Constancias",
        "Módulo de Credencial Estudiantil y Seguro Facultativo IMSS",
        "Coordinación de Becas, Movilidad Estudiantil y Servicio Social",
        "Departamento de Titulación y Egreso"
      ]
    },
    {
      id: "ad-20",
      code: "AD-20",
      name: "Biblioteca Central Universitaria 'Dr. Rubén Cardoza Macías'",
      shortName: "Biblioteca Central (AD-20)",
      zone: "Servicios",
      category: "Servicios",
      isDascBuilding: false,
      description:
        "Recinto bibliotecario principal del Campus La Paz. Ofrece préstamo de libros especializados en ingeniería de software, ciencias computacionales y matemáticas, hemeroteca, cubículos de estudio grupal y acceso a bases de datos científicas.",
      floors: 2,
      mapCoords: { x: 585, y: 410, width: 105, height: 68, height3d: 42, color: "#F59E0B" },
      gps: { lat: 24.10242, lng: -110.31575 },
      distanceMeters: 90,
      arBearing: 145,
      arInstruction: "Camina 90 m al sur del Edificio DASC por el andador principal hasta la Biblioteca Central (AD-20).",
      facilities: [
        "Acervo General y Especializado en Ingeniería y Tecnologías",
        "Salas de Lectura Silenciosa y Cubículos de Estudio Grupal",
        "Sala de Consulta Digital (biblio.uabcs.mx) y Tesis",
        "Préstamo Externo e Interbibliotecario"
      ]
    },
    {
      id: "ad-18",
      code: "AD-18",
      name: "Departamento de Lenguas Extranjeras (DELE - Idiomas)",
      shortName: "Lenguas Extranjeras (AD-18)",
      zone: "Servicios",
      category: "Servicios",
      isDascBuilding: false,
      description:
        "Sede del Departamento de Lenguas Extranjeras (DELE), donde se coordinan e imparten los niveles de Inglés I a VI requeridos en el plan de estudios de Ingeniería en Desarrollo de Software, así como exámenes de acreditación y cursos de otros idiomas.",
      floors: 2,
      mapCoords: { x: 590, y: 185, width: 96, height: 60, height3d: 36, color: "#F59E0B" },
      gps: { lat: 24.10328, lng: -110.31565 },
      distanceMeters: 80,
      arBearing: 40,
      arInstruction: "Dirígete 80 m al noreste del Edificio DASC hacia el edificio de Lenguas Extranjeras DELE (AD-18).",
      facilities: [
        "Coordinación Académica del DELE e Inscripciones de Idiomas",
        "Aulas Multimedia de Inglés, Francés, Alemán, Japonés e Italiano",
        "Centro de Autoacceso y Laboratorio de Conversación",
        "Aplicación de Exámenes de Ubicación y Liberación de Idioma"
      ]
    },
    {
      id: "ad-52",
      code: "AD-52",
      name: "Poliforo Cultural Universitario 'Lic. Ángel César Mendoza Arámburo'",
      shortName: "Poliforo Cultural (AD-52)",
      zone: "Espacios Culturales",
      category: "Espacios Comerciales y Culturales",
      isDascBuilding: false,
      description:
        "Magno recinto cultural y académico de la UABCS. Es la sede oficial de las conferencias magistrales del XVIII Encuentro de Sistemas Computacionales 2026, la exhibición del 14° Concurso de Prototipos de Hardware y Software, la final del Game Jam y ceremonias de graduación.",
      floors: 2,
      mapCoords: { x: 875, y: 295, width: 105, height: 74, height3d: 46, color: "#D97706" },
      gps: { lat: 24.10275, lng: -110.3141 },
      distanceMeters: 210,
      arBearing: 85,
      arInstruction: "Avanza hacia el extremo este del campus por la avenida principal hasta el Poliforo Cultural Universitario (AD-52).",
      facilities: [
        "Auditorio Principal para Congresos y Conferencias Magistrales",
        "Lobby de Exhibición (Sede del 14° Concurso de Hardware y Software)",
        "Escenario de Premiación de Concursos de Programación, Algoritmos y Robot NAO",
        "Sala de Prensa y Cabina de Producción Audiovisual"
      ]
    },
    {
      id: "ad-10",
      code: "AD-10 / AD-63",
      name: "Cafetería Universitaria, Librería (AD-38) y Centro de Servicios Universitario (CSU)",
      shortName: "Cafetería y CSU (AD-10)",
      zone: "Espacios Comerciales",
      category: "Espacios Comerciales y Culturales",
      isDascBuilding: false,
      description:
        "Zona comercial y de convivencia estudiantil que integra la Cafetería Central (AD-10), la Librería Universitaria (AD-38) y el Centro de Servicios Universitario CSU (AD-63) con áreas de comedor, impresión y estudio.",
      floors: 1,
      mapCoords: { x: 465, y: 415, width: 102, height: 64, height3d: 28, color: "#F59E0B" },
      gps: { lat: 24.10248, lng: -110.3163 },
      distanceMeters: 75,
      arBearing: 185,
      arInstruction: "Camina 75 m al sur del edificio DASC hacia la plaza de Cafetería y CSU (AD-10 / AD-63).",
      facilities: [
        "AD-10 Cafetería Central Universitaria y Comedor Estudiantil",
        "AD-63 CSU Centro de Servicios Universitario (Papelería, Impresión y Copiado)",
        "AD-38 Librería Universitaria UABCS",
        "Mesas Techadas de Convivencia y Descanso"
      ]
    },
    {
      id: "ad-21",
      code: "AD-21 / AD-27",
      name: "Unidad de Servicios Médicos (AD-21) y Radio y Televisión UABCS (AD-27)",
      shortName: "Servicios Médicos y Radio (AD-21)",
      zone: "Servicios",
      category: "Servicios",
      isDascBuilding: false,
      description:
        "Brinda atención médica primaria, primeros auxilios, orientación psicológica y nutricional a la comunidad estudiantil (AD-21), contiguo a las cabinas de Radio UABCS 1180 AM y producción de televisión (AD-27) y Difusión Cultural (AD-30).",
      floors: 1,
      mapCoords: { x: 660, y: 290, width: 92, height: 62, height3d: 30, color: "#F59E0B" },
      gps: { lat: 24.10282, lng: -110.3154 },
      distanceMeters: 95,
      arBearing: 80,
      arInstruction: "Dirígete al este del edificio DASC hacia la Unidad de Servicios Médicos (AD-21) y Radio UABCS (AD-27).",
      facilities: [
        "Consultorio de Atención Médica Primaria y Primeros Auxilios (AD-21)",
        "Orientación Psicológica y Promoción de la Salud Estudiantil",
        "Cabinas de Radio UABCS y Producción Audiovisual (AD-27)",
        "Departamento de Difusión Cultural y Extensión Universitaria (AD-30)"
      ]
    },
    {
      id: "ad-01",
      code: "AD-01 / AD-58",
      name: "Gimnasio Auditorio (AD-01) y Unidad Deportiva / Polideportivo UABCS (AD-58)",
      shortName: "Unidad Deportiva (AD-58)",
      zone: "Servicios",
      category: "Servicios",
      isDascBuilding: false,
      description:
        "Complejo deportivo universitario que comprende el Gimnasio Auditorio (AD-01) y las canchas del Polideportivo (AD-58), incluyendo el Campo 7 Empastado donde se celebra el Tradicional Torneo Interno de Fútbol Rápido del XVIII Encuentro DASC 2026.",
      floors: 1,
      mapCoords: { x: 215, y: 170, width: 135, height: 86, height3d: 38, color: "#10B981" },
      gps: { lat: 24.1035, lng: -110.3178 },
      distanceMeters: 230,
      arBearing: 290,
      arInstruction: "Dirígete hacia el sector noroeste del campus pasando los andadores deportivos hasta la Unidad Deportiva (AD-58) y Gimnasio Auditorio (AD-01).",
      facilities: [
        "Campo 7 Empastado de Fútbol Rápido (Sede Torneo Deportivo DASC 2026)",
        "Gimnasio Auditorio Universitario (AD-01)",
        "Canchas de Básquetbol, Voleibol, Fútbol y Pista Atlética (AD-58)",
        "Coordinación de Actividades Deportivas y Recreativas"
      ]
    },
    {
      id: "cmt-03",
      code: "CMT-03 / CMT-26",
      name: "Ciencias del Mar y de la Tierra (CMT-03, CMT-08) e Ingeniería Básica (CMT-26, CMT-29)",
      shortName: "Ciencias del Mar y Tierra (CMT)",
      zone: "Ciencias del Mar y la Tierra",
      category: "Ciencias del Mar y la Tierra",
      isDascBuilding: false,
      description:
        "Zona académica azul del Mapa Campus La Paz integrada por los edificios de Ciencias del Mar y de la Tierra I y II (CMT-03, CMT-08), Laboratorios de Geociencias y Docencia (CMT-07, CMT-12, CMT-14, CMT-15), Cubículos de Profesores (CMT-05) e Ingeniería Básica (CMT-26, CMT-29).",
      floors: 2,
      mapCoords: { x: 355, y: 165, width: 102, height: 66, height3d: 38, color: "#0284C7" },
      gps: { lat: 24.1034, lng: -110.3168 },
      distanceMeters: 125,
      arBearing: 330,
      arInstruction: "Avanza hacia el sector norte-central del campus para ubicar los edificios de Ciencias del Mar y de la Tierra (CMT).",
      facilities: [
        "CMT-03 y CMT-08: Aulas de Ciencias del Mar y de la Tierra I y II",
        "CMT-26 y CMT-29: Edificios de Ingeniería Básica I y II",
        "CMT-07, CMT-12, CMT-14 y CMT-15: Laboratorios de Ciencias de la Tierra y Docencia",
        "CMT-05: Cubículos de Profesores (B) y CMT-61: IFER / Licenciatura en Agua"
      ]
    },
    {
      id: "csh-02",
      code: "CSH-02 / CSH-43",
      name: "Ciencias Sociales y Humanidades (CSH-02, CSH-28, CSH-45) y Posgrado (CSH-43, CSH-53)",
      shortName: "Sociales y Posgrado (CSH)",
      zone: "Ciencias Sociales y Humanidades",
      category: "Ciencias Sociales y Humanidades",
      isDascBuilding: false,
      description:
        "Zona académica roja del Mapa Campus La Paz situada al sur/sureste. Agrupa Ciencias Sociales y Jurídicas (CSH-02, CSH-28, CSH-45, CSH-49), Humanidades I y II (CSH-44, CSH-56), Cubículos de Profesores (CSH-05, CSH-50) y el Centro de Vinculación, Investigación y Posgrado (CSH-43, CSH-53).",
      floors: 2,
      mapCoords: { x: 560, y: 515, width: 122, height: 74, height3d: 40, color: "#EF4444" },
      gps: { lat: 24.1019, lng: -110.3156 },
      distanceMeters: 165,
      arBearing: 165,
      arInstruction: "Camina hacia el sector sur del campus pasando la Biblioteca Central hasta los edificios de Ciencias Sociales y Humanidades (CSH).",
      facilities: [
        "CSH-02, CSH-28 y CSH-45: Ciencias Sociales, Humanidades y Ciencias Jurídicas",
        "CSH-43 y CSH-53: Centro de Vinculación, Investigación y Posgrado",
        "CSH-44 y CSH-56: Edificios de Humanidades I y II",
        "CSH-05 y CSH-50: Cubículos de Profesores de Ciencias Sociales"
      ]
    },
    {
      id: "ca-04",
      code: "CA-04 / CA-51",
      name: "Ciencias Agropecuarias I y II, Laboratorios de Biotecnología y Veterinaria",
      shortName: "Ciencias Agropecuarias (CA)",
      zone: "Ciencias Agropecuarias",
      category: "Ciencias Agropecuarias",
      isDascBuilding: false,
      description:
        "Zona académica verde del Mapa Campus La Paz ubicada al poniente y suroeste. Comprende Ciencias Agropecuarias I y II (CA-04, CA-51), Cubículos de Profesores (CA-05, CA-13, CA-22), Laboratorios de Agronomía, Biotecnología y Morfofisiología Veterinaria (CA-06, CA-37, CA-42, CA-47) y Posta Zootécnica.",
      floors: 2,
      mapCoords: { x: 255, y: 430, width: 120, height: 76, height3d: 36, color: "#16A34A" },
      gps: { lat: 24.1021, lng: -110.3176 },
      distanceMeters: 195,
      arBearing: 240,
      arInstruction: "Dirígete hacia el sector poniente/suroeste del campus para llegar al complejo de Ciencias Agropecuarias (CA).",
      facilities: [
        "CA-04 y CA-51: Edificios de Ciencias Agropecuarias I y II",
        "CA-05, CA-13 y CA-22: Cubículos de Profesores (A), Pastizales y Posta Zootécnica",
        "CA-06, CA-11, CA-37 y CA-42: Laboratorios de Agronomía, Docencia y Biotecnología",
        "CA-47 y CA-48: Laboratorio de Morfofisiología Veterinaria y Productos Pecuarios"
      ]
    },
    {
      id: "ad-59",
      code: "AD-59 / AD-64",
      name: "Arco de Entrada Principal, Caseta de Vigilancia (AD-59) y Centro de Tránsito Universitario (AD-64)",
      shortName: "Acceso Principal (AD-59)",
      zone: "Servicios",
      category: "Servicios",
      isDascBuilding: false,
      description:
        "Acceso principal al Campus La Paz sobre el Boulevard Forjadores de Sudcalifornia y Av. Universidad. Integra la Caseta de Vigilancia (AD-59), la Glorieta Principal de Acceso y el Centro de Tránsito Universitario (AD-64).",
      floors: 1,
      mapCoords: { x: 825, y: 540, width: 105, height: 60, height3d: 26, color: "#64748B" },
      gps: { lat: 24.1016, lng: -110.3142 },
      distanceMeters: 240,
      arBearing: 135,
      arInstruction: "Avanza por la avenida principal hacia la glorieta sureste para llegar al Arco de Entrada y Caseta de Vigilancia (AD-59).",
      facilities: [
        "AD-59: Caseta de Vigilancia y Seguridad Universitaria",
        "AD-64: Centro de Tránsito Universitario y Parada de Transporte Público",
        "Arco Monumental y Glorieta de Entrada UABCS (Blvd. Forjadores)"
      ]
    }
  ],

  // =========================================================================
  // DIRECTORIO ACADÉMICO: REPRESENTANTES PRINCIPALES DEL DASC
  // (Únicamente los Maestros Jesús Andrés Sandoval Bringas y Alejandro Leyva Carrillo)
  // =========================================================================
  professors: [
    {
      id: "prof-sandoval",
      name: "Dr. Jesús Andrés Sandoval Bringas",
      role: "Jefe del Departamento Académico de Sistemas Computacionales (Representante Principal DASC)",
      cubicle: "Oficina de la Jefatura del DASC · Edificio DSC-39 (Planta Alta)",
      email: "sandoval@uabcs.mx",
      phone: "(612) 123-8800 Ext. 2000",
      officeHours: "Lunes a Viernes 09:00 - 14:00 y 17:00 - 19:00 hrs",
      subjects: [
        "Jefatura del Departamento Académico (DASC)",
        "Desarrollo de un Proyecto de Software (9° Semestre IDS)",
        "Temas Selectos de TIC (9° Semestre IDS)",
        "Ingeniería de Software e Inteligencia Artificial"
      ],
      responsibilities:
        "Dirección académica y administrativa del DASC, coordinación de las 6 carreras del departamento (IDS, IIA, IC, IRT, ITC, LATI/LITI), presidencia del Comité Organizador del Encuentro de Sistemas Computacionales y atención a situaciones estudiantiles.",
      buildingId: "dsc-39"
    },
    {
      id: "prof-leyva",
      name: "M.T.I. Amado Alejandro Leyva Carrillo",
      role: "Responsable de Carrera de Ingeniería en Desarrollo de Software y Prácticas Profesionales (Representante Principal IDS)",
      cubicle: "Oficina de Coordinación IDS y Cubículo Docente · Edificio DSC-39 (Planta Baja)",
      email: "aleyva@uabcs.mx",
      phone: "(612) 123-8800 Ext. 2014",
      officeHours: "Lunes a Viernes 08:30 - 13:30 hrs",
      subjects: [
        "Responsable del Programa Educativo IDS",
        "Introducción a las TI (1° Semestre IDS TM-A)",
        "Álgebra Lineal (3° Semestre IDS TM-A)",
        "Prácticas Profesionales (9° Semestre IDS TM)"
      ],
      responsibilities:
        "Orientación sobre el plan de estudios de Ingeniería en Desarrollo de Software, seguimiento de trayectorias escolares, tutorías, validación de Prácticas Profesionales y vinculación con empresas del sector TI.",
      buildingId: "dsc-39"
    }
  ],

  // =========================================================================
  // DIRECTORIO DE OFICINAS, CUBÍCULOS DE MAESTROS, ÁREA DE SERVICIO, REDES
  // Y OTROS LUGARES IMPORTANTES DEL DASC Y LA UABCS
  // =========================================================================
  directoryPlaces: [
    {
      id: "lugar-jefatura-dasc",
      name: "Oficina de la Jefatura del DASC (Dr. Jesús Andrés Sandoval Bringas)",
      category: "Oficina Representante",
      buildingId: "dsc-39",
      buildingCode: "DSC-39",
      location: "Edificio Principal DASC (DSC-39) · Planta Alta",
      schedule: "Lunes a Viernes 08:00 - 15:00 y 16:00 - 20:00 hrs",
      contact: "sandoval@uabcs.mx · Tel. (612) 123-8800",
      description:
        "Oficina central de dirección del Departamento Académico de Sistemas Computacionales. Atención de trámites académicos departamentales, justificantes oficiales, solicitudes al Consejo Académico y coordinación de eventos."
    },
    {
      id: "lugar-coordinacion-ids",
      name: "Oficina de Coordinación IDS y Prácticas Profesionales (M.T.I. Alejandro Leyva Carrillo)",
      category: "Oficina Representante",
      buildingId: "dsc-39",
      buildingCode: "DSC-39",
      location: "Edificio Principal DASC (DSC-39) · Planta Baja",
      schedule: "Lunes a Viernes 08:30 - 14:00 hrs",
      contact: "aleyva@uabcs.mx · Coordinación IDS",
      description:
        "Atención directa a estudiantes de Ingeniería en Desarrollo de Software: carga académica, equivalencias, cartas de presentación y liberación de Prácticas Profesionales."
    },
    {
      id: "lugar-cubiculos-maestros",
      name: "Cubículos de Maestros e Investigadores del DASC",
      category: "Cubículos de Maestros",
      buildingId: "dsc-39",
      buildingCode: "DSC-39 / DSC-46",
      location: "Edificio DASC (DSC-39 Planta Baja y Alta) y Anexo Sistemas II (DSC-46)",
      schedule: "Lunes a Viernes 07:00 - 20:30 hrs (según horario de cada docente)",
      contact: "Directorio Docente DASC · 55 Profesores Activos",
      description:
        "Área de cubículos de los Profesores-Investigadores de Tiempo Completo del DASC (Dra. Italia Estrada, M.C. Mónica Carreño, M.C. Miriam Carreño, Dr. Jonathan Soto, Dr. Israel Durán, M.C. Brenda Lara, Dra. Viviana Flores, M.C. Jesús Zúñiga, entre otros) para asesorías académicas, tutorías y dirección de tesis."
    },
    {
      id: "lugar-area-servicio",
      name: "Área de Servicio Social, Recepción Administrativa y Atención Estudiantil DASC",
      category: "Área de Servicio",
      buildingId: "dsc-39",
      buildingCode: "DSC-39",
      location: "Edificio Principal DASC (DSC-39) · Recepción Planta Baja",
      schedule: "Lunes a Viernes 08:00 - 15:00 y 16:00 - 20:00 hrs",
      contact: "Recepción DASC · Ext. 2001",
      description:
        "Ventanilla administrativa del DASC para registro de Servicio Social Universitario, entrega de formatos, sellos departamentales, préstamo de proyectores/llaves de aulas y orientación sobre convocatorias."
    },
    {
      id: "lugar-area-redes",
      name: "Área de Redes, Telecomunicaciones y Site de Servidores (Lab LR y CTIC)",
      category: "Redes y Telecomunicaciones",
      buildingId: "dsc-39",
      buildingCode: "DSC-39 / AD-65",
      location: "Planta Baja DSC-39 (Laboratorio de Redes LR) y Edificio CTIC (AD-65)",
      schedule: "Lunes a Viernes 08:00 - 20:30 hrs",
      contact: "Soporte Red RIUABCS y Lab de Redes LR",
      description:
        "Centro de prácticas de enrutamiento, conmutación Cisco, cableado estructurado y administración de servidores del DASC, conectado con el nodo central del CTIC (AD-65) que gestiona el Wi-Fi institucional RIUABCS y cuentas @alu.uabcs.mx."
    },
    {
      id: "lugar-labs-salones-dasc",
      name: "Laboratorios de Cómputo (LAB A, LAB F, LAB G), Talleres (T1, T2) y Sala Alan Turing",
      category: "Laboratorios y Salones",
      buildingId: "dsc-39",
      buildingCode: "DSC-39",
      location: "Edificio Principal DASC (DSC-39) · Planta Baja y Planta Alta",
      schedule: "Lunes a Viernes 07:00 - 21:00 hrs",
      contact: "Coordinación de Laboratorios de Cómputo DASC",
      description:
        "Infraestructura práctica para todas las materias de programación, bases de datos, ingeniería web e inteligencia artificial, además del Aula de Usos Múltiples Alan Turing para talleres, conferencias y Game Jam."
    },
    {
      id: "lugar-sistemas-2",
      name: "Aulas Temáticas de Sistemas II (SC10, SC12, SC13, SC15, SC16, SC17)",
      category: "Laboratorios y Salones",
      buildingId: "dsc-46",
      buildingCode: "DSC-46",
      location: "Edificio Sistemas II (DSC-46) · Planta Baja y Planta Alta",
      schedule: "Lunes a Viernes 07:00 - 21:00 hrs",
      contact: "Subjefatura y Control de Aulas DASC",
      description:
        "Edificio de aulas de Ingeniería en Desarrollo de Software identificadas por lenguajes de programación: SC10-ASSEMBLY, SC12-DELPHI, SC13-ALGOL, SC15-FORTRAN, SC16-RUST y SC17-KOTLIN."
    },
    {
      id: "lugar-cae-servicios-escolares",
      name: "Centro de Atención a Estudiantes (CAE — Servicios Escolares UABCS)",
      category: "Lugar Importante UABCS",
      buildingId: "ad-55",
      buildingCode: "AD-55",
      location: "Sector Administrativo Este · Edificio AD-55",
      schedule: "Lunes a Viernes 08:00 - 15:00 hrs",
      contact: "Servicios Escolares UABCS · siia.uabcs.mx",
      description:
        "Trámites institucionales de inscripciones, bajas, constancias oficiales con sello, kárdex, credencial universitaria, becas institucionales y proceso de titulación."
    },
    {
      id: "lugar-biblioteca-dele",
      name: "Biblioteca Central Universitaria (AD-20) y Lenguas Extranjeras DELE (AD-18)",
      category: "Lugar Importante UABCS",
      buildingId: "ad-20",
      buildingCode: "AD-20 / AD-18",
      location: "Zona Central del Campus · Edificios AD-20 y AD-18",
      schedule: "Lunes a Viernes 07:30 - 20:30 hrs",
      contact: "biblio.uabcs.mx · Coordinación DELE",
      description:
        "Servicios de consulta bibliográfica, préstamo de libros de programación e ingeniería, cubículos de estudio en equipo (AD-20) y coordinación de cursos de Inglés I a VI para liberación de requisito de titulación (AD-18)."
    },
    {
      id: "lugar-poliforo-servicios",
      name: "Poliforo Cultural (AD-52), Servicios Médicos (AD-21) y Cafetería / CSU (AD-10 / AD-63)",
      category: "Lugar Importante UABCS",
      buildingId: "ad-52",
      buildingCode: "AD-52 / AD-21 / AD-10",
      location: "Sector Central y Este del Campus La Paz",
      schedule: "Lunes a Viernes 07:30 - 20:00 hrs",
      contact: "Servicios Universitarios UABCS",
      description:
        "Espacios esenciales para la vida universitaria: auditorio magno Poliforo Cultural (sede del Encuentro de Sistemas), consultorio de atención médica y seguro IMSS (AD-21), y zona de comedor, librería e impresión en el CSU (AD-10 / AD-63)."
    }
  ],

  // =========================================================================
  // EVENTOS Y CONVOCATORIAS OFICIALES EXTRAÍDOS DE LA PÁGINA DEL DASC / UABCS
  // Fuente: https://www.uabcs.mx/dasc/ (XVIII Encuentro Nacional y V Internacional de Sistemas Computacionales 2026)
  // =========================================================================
  events: [
    {
      id: "evt-encuentro-2026",
      title: "XVIII Encuentro Nacional y V Internacional de Sistemas Computacionales 2026",
      category: "Magno Evento DASC",
      date: "17, 18 y 19 de noviembre de 2026 · 08:00 - 19:00 hrs",
      speaker: "Dr. Jesús Andrés Sandoval Bringas y Comité Organizador DASC",
      locationDetail: "Poliforo Cultural Universitario (AD-52) y Edificio DASC (DSC-39)",
      buildingId: "ad-52",
      officialUrl: "https://www.uabcs.mx/dasc/wp-content/uploads/2026/11/Lonitas.pdf",
      description:
        "Ciclo anual de conferencias magistrales, talleres especializados, exhibición tecnológica y concursos académicos para todas las carreras del DASC (IDS, IIA, IC, IRT, ITC, LATI y LITI). Registro oficial en https://uabcs.online/."
    },
    {
      id: "evt-game-jam-2026",
      title: "Concurso Game Jam: 'Diseñando Juegos para Transformar los Retos de BCS'",
      category: "Game Jam DASC",
      date: "10 de nov. (13:00 h) al 17 de nov. de 2026 (10:40 h)",
      speaker: "Comité Organizador DASC · Equipos de hasta 3 estudiantes",
      locationDetail: "Aula de Usos Múltiples Alan Turing (DSC-39) y Poliforo Cultural (AD-52)",
      buildingId: "dsc-39",
      officialUrl:
        "https://www.uabcs.mx/dasc/wp-content/uploads/2026/10/CONCURSO-GAME-JAM-DISENANDO-JUEGOS-PARA-TRANSFORMAR-LOS-RETOS-DE-BCS.pdf",
      description:
        "Desarrollo intensivo durante 7 días de un videojuego, prototipo interactivo o simulador con repositorio en GitHub que atienda problemáticas de Baja California Sur (escasez de agua, movilidad, conservación marina, huracanes y energía)."
    },
    {
      id: "evt-concurso-prog-18",
      title: "18° Concurso de Programación del DASC 2026",
      category: "Concurso Académico",
      date: "Martes 17 de noviembre de 2026 · 16:00 a 19:00 hrs",
      speaker: "Jurado de Profesores-Investigadores del DASC",
      locationDetail: "Laboratorio de Cómputo LAB A / LAB F — Edificio DASC (DSC-39)",
      buildingId: "dsc-39",
      officialUrl: "https://www.uabcs.mx/dasc/wp-content/uploads/2026/10/18°-CONCURSO-DE-PROGRAMACION.pdf",
      description:
        "Competencia de resolución de banco de problemas durante 3 horas utilizando C/C++, C#, Java o Python (individual o equipos de hasta 3 integrantes). Premiación el 18 de noviembre en el Poliforo Cultural."
    },
    {
      id: "evt-hardware-software-14",
      title: "14° Concurso de Prototipos de Hardware y Software 2026",
      category: "Feria de Prototipos",
      date: "Miércoles 18 de noviembre de 2026 · TM 08:00 - 14:00 h y Final TV 16:30 - 19:00 h",
      speaker: "Comité Evaluador DASC y Patrocinadores",
      locationDetail: "Interior del Poliforo Cultural Universitario (AD-52)",
      buildingId: "ad-52",
      officialUrl: "https://www.uabcs.mx/dasc/wp-content/uploads/2026/10/14°-CONCURSO-DE-HARDWARE-Y-SOFTWARE.pdf",
      description:
        "Exposición y demostración funcional de proyectos en Nivel Intermedio (1°, 3° y 5° semestre) y Nivel Avanzado (7° y 9° semestre), con premio especial al mejor proyecto de tecnología inclusiva y objetos de aprendizaje."
    },
    {
      id: "evt-algoritmos-14",
      title: "14° Concurso de Algoritmos (Especial 1° Semestre en Python)",
      category: "Concurso 1° Semestre",
      date: "Martes 17 de noviembre de 2026 · 16:00 a 19:00 hrs",
      speaker: "Comité Académico de Programación DASC",
      locationDetail: "Laboratorio de Cómputo — Edificio DASC (DSC-39)",
      buildingId: "dsc-39",
      officialUrl: "https://www.uabcs.mx/dasc/wp-content/uploads/2026/10/14°-CONCURSO-DE-ALGORITMOS.pdf",
      description:
        "Convocatoria dirigida exclusivamente a estudiantes de primer semestre del periodo 2026-II del DASC para resolver problemas lógicos y algorítmicos en lenguaje Python."
    },
    {
      id: "evt-robot-nao",
      title: "Concurso 'Ponle Nombre a Nuestro Robot NAO'",
      category: "Comunidad e IA",
      date: "Votación: 12 al 17 de nov. · Premiación: 18 de nov. de 2026 (18:00 hrs)",
      speaker: "Comité Evaluador DASC y Comunidad Universitaria",
      locationDetail: "Edificio DASC (DSC-39) y Poliforo Cultural Universitario (AD-52)",
      buildingId: "dsc-39",
      officialUrl: "https://www.uabcs.mx/dasc/wp-content/uploads/2026/10/CONCURSO-NOMBRE-DEL-ROBOT-NAO.pdf",
      description:
        "Certamen creativo para bautizar al robot humanoide NAO del Departamento Académico de Sistemas Computacionales con una propuesta original y su significado."
    },
    {
      id: "evt-torneo-futbol",
      title: "Tradicional Torneo Interno de Fútbol Rápido — XVIII Encuentro DASC 2026",
      category: "Deportes DASC",
      date: "Junta previa: 17 nov. (12:00 h, DASC) · Torneo: Viernes 20 de nov. de 2026 (07:30 hrs)",
      speaker: "Responsables de Carrera y Comité Deportivo DASC",
      locationDetail: "Campo 7 Empastado del Polideportivo Universitario UABCS (AD-58)",
      buildingId: "ad-01",
      officialUrl:
        "https://www.uabcs.mx/dasc/wp-content/uploads/2026/10/TORNEO-DEPORTIVO-XVIII-Encuentro-de-Sistemas-Computacionales-2026.pdf",
      description:
        "Torneo deportivo inter-carreras del DASC (IDS, ITC, LATI, LITI, IC, IIA, IRT) en categoría libre (varonil, femenil o mixto) con premiación al 1° y 2° lugar."
    },
    {
      id: "evt-smash-bros",
      title: "4° Torneo Flash de Super Smash Bros. Ultimate 2026",
      category: "Convivencia Gamer",
      date: "Viernes 20 de noviembre de 2026 · 16:00 hrs",
      speaker: "Comité Estudiantil del Encuentro de Sistemas",
      locationDetail: "Aula Asignada — Edificio DASC (DSC-39)",
      buildingId: "dsc-39",
      officialUrl: "https://www.uabcs.mx/dasc/wp-content/uploads/2026/10/4°-TORNEO-FLASH-DE-SUPER-SMASH-BROS.pdf",
      description:
        "Torneo recreativo individual 1 contra 1 de eliminación directa para alumnos inscritos en el semestre 2026-II del DASC."
    }
  ]
};
