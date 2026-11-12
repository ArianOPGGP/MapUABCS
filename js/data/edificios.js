/* ==========================================================================
   Directorio Oficial de Edificios, Laboratorios, Murales y Recorridos 360°
   Universidad Autónoma de Baja California Sur (UABCS) – Campus La Paz
   Fuentes integradas:
   1. Plano Oficial Campus La Paz (Mapa-Campus-La-Paz-2022.pdf)
   2. Menú de Recorrido Virtual 360° (uabcs.mx/recorrido-virtual/menu.html)
   3. Mapa Institucional SIIA (siia.uabcs.mx/Siia2019/mapas/mapauniversitario.aspx)
   4. Sedes de Jornadas de Comunicación y Hackatón 2026 (uabcs.net/micrositio/)
   ========================================================================== */
window.CAMPUS = (function () {
    "use strict";

    // Helper para generar un polígono rectangular limpio alrededor de un centro [lat, lng]
    function rect(lat, lng, dLat, dLng) {
        const hLat = (dLat || 0.00020) / 2;
        const hLng = (dLng || 0.00026) / 2;
        return [
            [+(lat - hLat).toFixed(6), +(lng - hLng).toFixed(6)],
            [+(lat + hLat).toFixed(6), +(lng - hLng).toFixed(6)],
            [+(lat + hLat).toFixed(6), +(lng + hLng).toFixed(6)],
            [+(lat - hLat).toFixed(6), +(lng + hLng).toFixed(6)]
        ];
    }

    const categorias = {
        sistemas: { nombre: "Sistemas Computacionales", color: "#3b82f6", icono: "bi-cpu" },
        agropecuarias: { nombre: "Ciencias Agropecuarias", color: "#22c55e", icono: "bi-tree" },
        mar: { nombre: "Ciencias del Mar y la Tierra", color: "#06b6d4", icono: "bi-water" },
        sociales: { nombre: "Ciencias Sociales y Humanidades", color: "#ef4444", icono: "bi-journal-bookmark" },
        administrativo: { nombre: "Administrativos", color: "#a855f7", icono: "bi-building" },
        servicios: { nombre: "Servicios Universitarios", color: "#f59e0b", icono: "bi-heart-pulse" },
        cultura: { nombre: "Espacios Culturales y Murales", color: "#ec4899", icono: "bi-palette" },
        comercial: { nombre: "Espacios Comerciales", color: "#14b8a6", icono: "bi-shop" },
        deportes: { nombre: "Deportes y Canchas", color: "#10b981", icono: "bi-trophy" },
        // Alias de compatibilidad
        academico: { nombre: "Académico", color: "#2b6ff0", icono: "bi-mortarboard" }
    };

    const edificios = [
        /* ==================== SISTEMAS COMPUTACIONALES ==================== */
        {
            id: "dasc",
            clave: "DSC-39",
            nombre: "Departamento Académico de Sistemas Computacionales (DASC)",
            categoria: "sistemas",
            altura: 11,
            tourSlug: "sistemas",
            foto: "img/recorrido/sistemas.jpg",
            sedeEvento: "hackaton",
            descripcion: "Edificio principal del DASC (DSC-39): jefatura departamental, aulas de ingeniería en software, tecnología computacional, ciberseguridad y sede del Hackatón 2026.",
            coords: [[24.102650, -110.316440], [24.102850, -110.316440], [24.102850, -110.316100], [24.102650, -110.316100]]
        },
        {
            id: "dasc-ii",
            clave: "DSC-46",
            nombre: "Sistemas II / Macrocentro de Cómputo (AULA MAC)",
            categoria: "sistemas",
            altura: 11,
            tourSlug: "macrocentro",
            foto: "img/recorrido/macrocentro.jpg",
            sedeEvento: "1",
            descripcion: "Edificio DSC-46 (AD-46 en SIIA): Macrocentro de Cómputo, Laboratorio Multimedia (AULA MAC - Punto 1 de las Jornadas 2026), laboratorios de redes, sistemas embebidos y desarrollo.",
            coords: [[24.102350, -110.316440], [24.102550, -110.316440], [24.102550, -110.316100], [24.102350, -110.316100]]
        },
        {
            id: "nuevo-dasc",
            clave: "DSC-46B",
            nombre: "Nuevo Edificio DASC (Laboratorios de Innovación y Cómputo)",
            categoria: "sistemas",
            altura: 13,
            tourSlug: "sistemas",
            foto: "img/recorrido/sistemas.jpg",
            descripcion: "Laboratorios especializados de inteligencia artificial, cómputo móvil, bases de datos y salas de docencia del DASC.",
            coords: [[24.102044, -110.316451], [24.102292, -110.316419], [24.102267, -110.316167], [24.102022, -110.316204]]
        },
        {
            id: "ctic",
            clave: "AD-65",
            nombre: "CTIC – Centro de Tecnologías de la Información y Comunicación",
            categoria: "administrativo",
            altura: 9,
            tourSlug: "macrocentro",
            foto: "img/recorrido/macrocentro.jpg",
            descripcion: "Dirección de infraestructura de red universitaria, servidores institucionales, SIIA y telecomunicaciones del campus.",
            coords: rect(24.102820, -110.315820, 0.00018, 0.00024)
        },

        /* ==================== ESPACIOS CULTURALES Y AUDITORIOS ==================== */
        {
            id: "poliforo",
            clave: "AD-52",
            nombre: "Poliforo Cultural Universitario «Ángel César Mendoza Arámburo»",
            categoria: "cultura",
            altura: 14,
            tourSlug: "poliforo",
            foto: "img/recorrido/poliforo.jpg",
            sedeEvento: "auditorio",
            descripcion: "Recinto magno de ceremonias institucionales, conferencias magistrales, congresos, graduaciones y eventos artísticos de la UABCS.",
            coords: [[24.103051, -110.316132], [24.103440, -110.316065], [24.103369, -110.315539], [24.103100, -110.315588]]
        },
        {
            id: "edificio-artes",
            clave: "AD-30",
            nombre: "Difusión Cultural y Extensión / Auditorio de las Artes",
            categoria: "cultura",
            altura: 9,
            tourSlug: "difusion",
            foto: "img/recorrido/difusion.jpg",
            sedeEvento: "3",
            descripcion: "Departamento de Difusión Cultural y Auditorio de las Artes (Punto 3 de Talleres de las Jornadas de Comunicación 2026: Transmisión con OBS).",
            coords: [[24.103112, -110.316202], [24.103119, -110.316325], [24.103455, -110.316277], [24.103425, -110.316151]]
        },
        {
            id: "radio-uabcs",
            clave: "AD-27",
            nombre: "Centro de Radio y Televisión UABCS (1180 AM)",
            categoria: "cultura",
            altura: 7,
            tourSlug: "radioytelevision",
            foto: "img/recorrido/radioytelevision.jpg",
            sedeEvento: "5",
            descripcion: "Cabinas de transmisión de Radio UABCS, estudios de producción televisiva y Punto 5 de las Jornadas de Comunicación (Taller RADIOBOSS).",
            coords: [[24.1020163, -110.3159098], [24.1018767, -110.3159366], [24.1018326, -110.3156737], [24.1019722, -110.3156549], [24.1020163, -110.3159098]]
        },
        {
            id: "sala-cine",
            clave: "AD-27B",
            nombre: "Sala de Cine Universitario UABCS",
            categoria: "cultura",
            altura: 8,
            tourSlug: "difusion",
            foto: "img/recorrido/difusion.jpg",
            sedeEvento: "4",
            descripcion: "Proyección cinematográfica, foros audiovisuales y Punto 4 de las Jornadas de Comunicación 2026 (Taller de Expresión Vocal).",
            coords: [[24.1022782, -110.3158722], [24.1021999, -110.3158829], [24.1021485, -110.315545], [24.1022342, -110.3155342], [24.1022782, -110.3158722]]
        },
        {
            id: "artes-graficas",
            clave: "AD-34",
            nombre: "Taller de Artes Gráficas e Imprenta Universitaria",
            categoria: "cultura",
            altura: 7,
            tourSlug: "imprenta",
            foto: "img/recorrido/imprenta.jpg",
            descripcion: "Producción editorial universitaria, impresión de libros, revistas académicas y materiales gráficos institucionales.",
            coords: [[24.0992485, -110.314777], [24.0992289, -110.3146429], [24.0994076, -110.314608], [24.0994296, -110.3147475], [24.0992485, -110.314777]]
        },

        /* ==================== SERVICIOS UNIVERSITARIOS ==================== */
        {
            id: "biblioteca",
            clave: "AD-20",
            nombre: "Biblioteca Central «Dr. Rubén Cardoza Macías»",
            categoria: "servicios",
            altura: 14,
            tourSlug: "biblioteca",
            foto: "img/recorrido/biblioteca.jpg",
            descripcion: "Acervo bibliográfico general, hemeroteca, cubículos de estudio grupal, sala de consulta digital y archivo histórico.",
            coords: [[24.101728, -110.316652], [24.101988, -110.316615], [24.101937, -110.316183], [24.101702, -110.316226]]
        },
        {
            id: "dele",
            clave: "AD-18",
            nombre: "Departamento de Lenguas Extranjeras (DELE)",
            categoria: "servicios",
            altura: 9,
            tourSlug: "dele",
            foto: "img/recorrido/dele.jpg",
            descripcion: "Cursos de inglés, francés, alemán, japonés, italiano, ruso y certificaciones oficiales de idiomas para alumnos y público general.",
            coords: [[24.1005374, -110.3168324], [24.1002583, -110.3168485], [24.1002289, -110.3165803], [24.1005179, -110.3165481], [24.1005374, -110.3168324]]
        },
        {
            id: "centro-medico",
            clave: "AD-21",
            nombre: "Unidad de Servicios Médicos Universitarios",
            categoria: "servicios",
            altura: 6,
            tourSlug: "servmed",
            foto: "img/recorrido/servmed.jpg",
            descripcion: "Consultorio médico, primeros auxilios, orientación nutricional, atención psicológica y campañas de salud estudiantil.",
            coords: [[24.1018424, -110.3159956], [24.1017249, -110.3160305], [24.1016955, -110.3157917], [24.1017959, -110.3157703], [24.1018424, -110.3159956]]
        },
        {
            id: "control-escolar",
            clave: "AD-55",
            nombre: "Centro de Atención a Estudiantes / Servicios Estudiantiles",
            categoria: "administrativo",
            altura: 8,
            tourSlug: "serviciosest",
            foto: "img/recorrido/serviciosest.jpg",
            descripcion: "Dirección de Servicios Estudiantiles, control escolar, becas, servicio social, titulación y trámites de kardex.",
            coords: [[24.102470, -110.315783], [24.102470, -110.315515], [24.102627, -110.315515], [24.102627, -110.315783]]
        },
        {
            id: "gimnasio",
            clave: "AD-01",
            nombre: "Gimnasio Auditorio «Lic. Rodrigo Aragón Ceseña»",
            categoria: "deportes",
            altura: 13,
            tourSlug: "gimnasio",
            foto: "img/recorrido/gimnasio.jpg",
            descripcion: "Cancha techada de básquetbol y voleibol, gradas, escenario deportivo y sede de torneos universitarios.",
            coords: rect(24.101850, -110.314480, 0.00034, 0.00040)
        },
        {
            id: "procesadora-alimentos",
            clave: "AD-16",
            nombre: "Unidad Académica Procesadora de Alimentos",
            categoria: "servicios",
            altura: 7,
            tourSlug: "procesadoraalimentos",
            foto: "img/recorrido/procesadoraalimentos.jpg",
            descripcion: "Planta piloto para procesamiento, conservación e inocuidad de productos alimenticios agropecuarios y marinos.",
            coords: rect(24.099980, -110.315420, 0.00018, 0.00024)
        },
        {
            id: "talleres-mantenimiento",
            clave: "AD-17",
            nombre: "Talleres de Mantenimiento",
            categoria: "servicios",
            altura: 6,
            tourSlug: "serviciosgenerales",
            foto: "img/recorrido/serviciosgenerales.jpg",
            descripcion: "Talleres técnicos de mantenimiento eléctrico, hidráulico, carpintería y parque vehicular universitario.",
            coords: rect(24.099420, -110.315680, 0.00018, 0.00024)
        },
        {
            id: "depto-lab-docencia",
            clave: "AD-31",
            nombre: "Departamento de Laboratorios de Docencia",
            categoria: "servicios",
            altura: 8,
            tourSlug: "adlaboratoriodocencia",
            foto: "img/recorrido/adlaboratoriodocencia.jpg",
            descripcion: "Coordinación y administración de laboratorios multidisciplinarios e insumos científicos de docencia.",
            coords: rect(24.100180, -110.315720, 0.00018, 0.00024)
        },
        {
            id: "edificio-redes",
            clave: "AD-40",
            nombre: "Edificio de Redes y Telecomunicaciones (RIUABCS)",
            categoria: "sistemas",
            altura: 8,
            tourSlug: "redes",
            foto: "img/recorrido/edificio-sistemas.jpg",
            descripcion: "Centro de Conectividad, Servidores Centrales y Telecomunicaciones de la Red Institucional Universitaria (RIUABCS) y CGTI.",
            coords: rect(24.103150, -110.316850, 0.00020, 0.00024)
        },
        {
            id: "reactivos-peligrosos",
            clave: "AD-54",
            nombre: "Centro de Reactivos Peligrosos",
            categoria: "servicios",
            altura: 5,
            tourSlug: "creactivospeligrosos",
            foto: "img/recorrido/creactivospeligrosos.jpg",
            descripcion: "Resguardo normativo y control de sustancias químicas e insumos para los laboratorios de investigación.",
            coords: rect(24.099120, -110.316280, 0.00016, 0.00020)
        },
        {
            id: "unicap",
            clave: "AD-57",
            nombre: "UNICAP – Unidad de Capacitación",
            categoria: "servicios",
            altura: 6,
            tourSlug: "unicap",
            foto: "img/recorrido/unicap.jpg",
            descripcion: "Salas de capacitación continua, cursos institucionales y formación docente y administrativa.",
            coords: rect(24.102340, -110.315280, 0.00016, 0.00022)
        },
        {
            id: "caseta-vigilancia",
            clave: "AD-59",
            nombre: "Caseta de Vigilancia y Acceso Principal UABCS",
            categoria: "servicios",
            altura: 5,
            tourSlug: "entrada",
            foto: "img/recorrido/entrada.jpg",
            descripcion: "Arco y caseta de seguridad en la entrada principal del Campus La Paz sobre Blvd. Forjadores.",
            coords: rect(24.103997, -110.312609, 0.00018, 0.00022)
        },
        {
            id: "servicios-generales",
            clave: "AD-60",
            nombre: "Coordinación de Servicios Generales",
            categoria: "servicios",
            altura: 6,
            tourSlug: "serviciosgenerales",
            foto: "img/recorrido/serviciosgenerales.jpg",
            descripcion: "Oficinas operativas de mantenimiento, intendencia, jardinería y logística de eventos del campus.",
            coords: rect(24.099280, -110.315920, 0.00018, 0.00024)
        },
        {
            id: "acopio-residuos",
            clave: "AD-62",
            nombre: "Centro de Acopio de Residuos Peligrosos",
            categoria: "servicios",
            altura: 5,
            tourSlug: "alamcentemporalresiduos",
            foto: "img/recorrido/alamcentemporalresiduos.jpg",
            descripcion: "Almacén temporal de gestión ambiental y manejo seguro de residuos biológicos y químicos.",
            coords: rect(24.098950, -110.316450, 0.00016, 0.00020)
        },
        {
            id: "parada-camiones",
            clave: "AD-64",
            nombre: "Centro de Tránsito Universitario / Parada de Camiones",
            categoria: "servicios",
            altura: 4,
            tourSlug: "paradabus",
            foto: "img/recorrido/paradabus.jpg",
            descripcion: "Circuito interior de transporte público universitario (Paradas A, B y C) para el ascenso y descenso seguro de estudiantes.",
            coords: rect(24.102259, -110.314473, 0.00015, 0.00020)
        },

        /* ==================== ADMINISTRATIVOS ==================== */
        {
            id: "rectoria",
            clave: "AD-19",
            nombre: "Rectoría y Administración Central UABCS",
            categoria: "administrativo",
            altura: 12,
            tourSlug: "rectoria",
            foto: "img/recorrido/rectoria.jpg",
            descripcion: "Oficina del Rector, Secretaría General, Secretaría de Administración y Finanzas, Tesorería y Sala de Consejo General Universitario.",
            coords: [[24.1012671, -110.3168163], [24.1009684, -110.3168861], [24.1009439, -110.3165857], [24.1012132, -110.3165052], [24.1012671, -110.3168163]]
        },
        {
            id: "almacen",
            clave: "AD-09",
            nombre: "Almacén General y Departamento de Compras",
            categoria: "administrativo",
            altura: 7,
            tourSlug: "almacenycompras",
            foto: "img/recorrido/almacenycompras.jpg",
            descripcion: "Recepción de bienes, inventarios, adquisiciones y suministros institucionales.",
            coords: [[24.0997285, -110.3154798], [24.0995522, -110.3155119], [24.0995106, -110.3151874], [24.0996844, -110.3151606], [24.0997285, -110.3154798]]
        },
        {
            id: "cige",
            clave: "AD-10B",
            nombre: "CIGE – Coordinación para la Igualdad de Género",
            categoria: "administrativo",
            altura: 6,
            tourSlug: "cige",
            foto: "img/recorrido/cige.jpg",
            descripcion: "Espacio institucional para la promoción de la equidad, derechos universitarios, orientación y atención con perspectiva de género.",
            coords: rect(24.100680, -110.316280, 0.00015, 0.00020)
        },
        {
            id: "spauabcs",
            clave: "AD-32",
            nombre: "SPAUABCS – Sindicato del Personal Académico",
            categoria: "administrativo",
            altura: 6,
            tourSlug: "spauabcs",
            foto: "img/recorrido/spauabcs.jpg",
            descripcion: "Oficinas de representación sindical del personal docente e investigador de la UABCS.",
            coords: rect(24.099180, -110.315120, 0.00018, 0.00022)
        },
        {
            id: "sindicato",
            clave: "AD-33",
            nombre: "SUTAUABCS – Sindicato Único de Trabajadores Administrativos",
            categoria: "administrativo",
            altura: 6,
            tourSlug: "sutauabcs",
            foto: "img/recorrido/sutauabcs.jpg",
            descripcion: "Instalaciones sindicales del personal administrativo y de apoyo de la universidad.",
            coords: [[24.0989473, -110.3152437], [24.0987245, -110.3152679], [24.0986878, -110.3149755], [24.0989008, -110.3149487], [24.0989473, -110.3152437]]
        },

        /* ==================== ESPACIOS COMERCIALES ==================== */
        {
            id: "cafeteria",
            clave: "AD-10",
            nombre: "Cafetería Universitaria Central",
            categoria: "comercial",
            altura: 5,
            tourSlug: "csu",
            foto: "img/recorrido/csu.jpg",
            descripcion: "Comedor estudiantil, barra de alimentos, bebidas y terraza de convivencia.",
            coords: [[24.1005246, -110.3159439], [24.1004438, -110.3159519], [24.100412, -110.3157696], [24.100505, -110.3157508], [24.1005246, -110.3159439]]
        },
        {
            id: "libreria",
            clave: "AD-38",
            nombre: "Librería Universitaria UABCS",
            categoria: "comercial",
            altura: 6,
            tourSlug: "libreria",
            foto: "img/recorrido/libreria.jpg",
            descripcion: "Venta de publicaciones académicas del fondo editorial UABCS, literatura científica y artículos promocionales.",
            coords: rect(24.102120, -110.315220, 0.00016, 0.00020)
        },
        {
            id: "csu",
            clave: "AD-63",
            nombre: "CSU – Centro de Servicios Universitarios",
            categoria: "comercial",
            altura: 7,
            tourSlug: "csu",
            foto: "img/recorrido/csu.jpg",
            descripcion: "Módulos de papelería, fotocopiado, impresión, cafetería rápida y áreas de estudio colaborativo.",
            coords: rect(24.101450, -110.315380, 0.00020, 0.00026)
        },

        /* ==================== CIENCIAS SOCIALES Y HUMANIDADES ==================== */
        {
            id: "auditorio-ciencias-sociales",
            clave: "CSH-02",
            nombre: "Ciencias Sociales I y Auditorio (CSH-02)",
            categoria: "sociales",
            altura: 11,
            tourSlug: "csociales",
            foto: "img/recorrido/csociales.jpg",
            sedeEvento: "2",
            descripcion: "Edificio CSH-02: aulas de la Licenciatura en Comunicación, Economía y Derecho, Auditorio de Ciencias Sociales y Salón 102 (Punto 2 de Talleres de las Jornadas 2026).",
            coords: [[24.1017066, -110.3149307], [24.1013589, -110.3149843], [24.1013197, -110.3146625], [24.1016772, -110.3146303], [24.1017066, -110.3149307]]
        },
        {
            id: "csh-cubiculos-c",
            clave: "CSH-05",
            nombre: "Cubículos de Profesores (C) – Ciencias Sociales",
            categoria: "sociales",
            altura: 7,
            tourSlug: "cubiculosprofesores",
            foto: "img/recorrido/cubiculosprofesores.jpg",
            descripcion: "Cubículos de asesoría académica e investigación del profesorado de Ciencias Sociales y Humanidades.",
            coords: rect(24.101180, -110.314650, 0.00018, 0.00024)
        },
        {
            id: "historia-regional",
            clave: "CSH-25",
            nombre: "Archivo e Investigación de Historia Regional",
            categoria: "sociales",
            altura: 8,
            tourSlug: "historiaregional",
            foto: "img/recorrido/historiaregional.jpg",
            descripcion: "Seminarios de historia sudcaliforniana, acervo documental y cuerpos académicos de humanidades.",
            coords: rect(24.100520, -110.314120, 0.00018, 0.00024)
        },
        {
            id: "csh-28",
            clave: "CSH-28",
            nombre: "Ciencias Sociales y Humanidades (CSH-28)",
            categoria: "sociales",
            altura: 10,
            tourSlug: "csocialesyhumanidades",
            foto: "img/recorrido/csocialesyhumanidades.jpg",
            descripcion: "Jefaturas departamentales y aulas de licenciatura del área de Ciencias Sociales y Humanidades.",
            coords: rect(24.100193, -110.314311, 0.00024, 0.00030)
        },
        {
            id: "diip",
            clave: "CSH-43",
            nombre: "Centro de Vinculación, Investigación y Posgrado (DIIP)",
            categoria: "sociales",
            altura: 10,
            tourSlug: "diip",
            foto: "img/recorrido/diip.jpg",
            descripcion: "Dirección de Investigación Interdisciplinaria y Posgrado, auditorio y salas de seminarios.",
            coords: [[24.102483, -110.313366], [24.102483, -110.313079], [24.102737, -110.313079], [24.102737, -110.313366]]
        },
        {
            id: "humanidades-ii",
            clave: "CSH-44",
            nombre: "Humanidades II",
            categoria: "sociales",
            altura: 10,
            tourSlug: "humanidades2",
            foto: "img/recorrido/humanidades2.jpg",
            descripcion: "Aulas de docencia de Lengua y Literatura, Historia, Filosofía y Comunicación.",
            coords: [[24.101975, -110.313465], [24.101975, -110.313190], [24.102233, -110.313190], [24.102233, -110.313465]]
        },
        {
            id: "ciencias-sociales-juridicas",
            clave: "CSH-45",
            nombre: "Departamento Académico de Ciencias Sociales y Jurídicas (DACSJ)",
            categoria: "sociales",
            altura: 10,
            tourSlug: "csocialesyjuridicas",
            foto: "img/recorrido/csocialesyjuridicas.jpg",
            descripcion: "Sede del DACSJ (co-organizador de las Jornadas de Comunicación 2026), Sala de Juicios Orales y aulas de Derecho y Comunicación.",
            coords: [[24.102131, -110.313103], [24.102131, -110.312762], [24.102480, -110.312762], [24.102480, -110.313103]]
        },
        {
            id: "ciencias-politicas",
            clave: "CSH-49",
            nombre: "Ciencias Políticas y Administración Pública",
            categoria: "sociales",
            altura: 9,
            tourSlug: "cpoliticas",
            foto: "img/recorrido/cpoliticas.jpg",
            descripcion: "Aulas de licenciatura, salas de análisis de políticas públicas y cubículos académicos.",
            coords: [[24.1009691, -110.3136899], [24.1007365, -110.3137329], [24.1007145, -110.3134754], [24.1009446, -110.3134512], [24.1009691, -110.3136899]]
        },
        {
            id: "csh-cubiculos-50",
            clave: "CSH-50",
            nombre: "Cubículos de Profesores (CSH-50)",
            categoria: "sociales",
            altura: 8,
            tourSlug: "cubprofesoressociales",
            foto: "img/recorrido/cubprofesoressociales.jpg",
            descripcion: "Cubículos de profesores investigadores de Ciencias Sociales, Economía y Políticas Públicas.",
            coords: rect(24.101640, -110.313420, 0.00018, 0.00024)
        },
        {
            id: "posgrados",
            clave: "CSH-53",
            nombre: "Edificio de Posgrado",
            categoria: "sociales",
            altura: 10,
            tourSlug: "posgrados",
            foto: "img/recorrido/posgrados.jpg",
            descripcion: "Aulas y seminarios de maestrías y doctorados en ciencias sociales, sustentabilidad y desarrollo estratégico.",
            coords: rect(24.101780, -110.313050, 0.00020, 0.00026)
        },
        {
            id: "humanidades",
            clave: "CSH-56",
            nombre: "Humanidades I",
            categoria: "sociales",
            altura: 10,
            tourSlug: "humanidades1",
            foto: "img/recorrido/humanidades1.jpg",
            descripcion: "Edificio de Humanidades I, aulas de licenciatura y sede del mural escultórico «Testamento del Sol».",
            coords: [[24.1014257, -110.3135921], [24.1011392, -110.3136725], [24.1010413, -110.3132568], [24.1013498, -110.3130878], [24.1014257, -110.3135921]]
        },

        /* ==================== CIENCIAS DEL MAR Y DE LA TIERRA ==================== */
        {
            id: "biologia-marina",
            clave: "CMT-03",
            nombre: "Ciencias del Mar y de la Tierra I (Biología Marina)",
            categoria: "mar",
            altura: 10,
            tourSlug: "cmarytierra",
            foto: "img/recorrido/cmarytierra.jpg",
            descripcion: "Edificio CMT-03: aulas y dirección de Biología Marina, Geología y Ciencias Ambientales, junto al mural «Cortés en la Bahía de La Paz».",
            coords: [[24.100674, -110.315301], [24.100674, -110.314956], [24.101052, -110.314956], [24.101052, -110.315301]]
        },
        {
            id: "cmt-cubiculos-b",
            clave: "CMT-05",
            nombre: "Cubículos de Profesores (B) – Ciencias del Mar",
            categoria: "mar",
            altura: 7,
            tourSlug: "cubiculosprofesores",
            foto: "img/recorrido/cubiculosprofesores.jpg",
            descripcion: "Cubículos de investigadores de oceanología, ecología marina y geología.",
            coords: rect(24.100880, -110.315520, 0.00018, 0.00024)
        },
        {
            id: "lab-ciencias-tierra",
            clave: "CMT-07",
            nombre: "Laboratorio de Ciencias de la Tierra",
            categoria: "mar",
            altura: 8,
            tourSlug: "labcienciastierra",
            foto: "img/recorrido/labcienciastierra.jpg",
            descripcion: "Laboratorios de mineralogía, petrología, paleontología y cartografía geológica.",
            coords: rect(24.100520, -110.315320, 0.00018, 0.00024)
        },
        {
            id: "cmt-08",
            clave: "CMT-08",
            nombre: "Ciencias del Mar y de la Tierra II",
            categoria: "mar",
            altura: 10,
            tourSlug: "cmartierra2",
            foto: "img/recorrido/cmartierra2.jpg",
            descripcion: "Aulas académicas y salas audiovisuales del área de Ciencias del Mar y de la Tierra.",
            coords: rect(24.100350, -110.315550, 0.00020, 0.00026)
        },
        {
            id: "lab-geociencias",
            clave: "CMT-12",
            nombre: "Laboratorio de Geociencias",
            categoria: "mar",
            altura: 8,
            tourSlug: "labgeociencias",
            foto: "img/recorrido/labgeociencias.jpg",
            descripcion: "Investigación geofísica, hidrogeología, sistemas de información geográfica y riesgos naturales.",
            coords: rect(24.099920, -110.315920, 0.00018, 0.00024)
        },
        {
            id: "lab-fisica",
            clave: "CMT-14",
            nombre: "Laboratorio de Docencia II (Física y Química Marina)",
            categoria: "mar",
            altura: 7,
            tourSlug: "cmlabdocencia2",
            foto: "img/recorrido/cmlabdocencia2.jpg",
            descripcion: "Prácticas de física, oceanografía química y análisis experimental para ciencias marinas.",
            coords: [[24.1001617, -110.316212], [24.1000466, -110.3162254], [24.1000197, -110.3159652], [24.1001348, -110.3159491], [24.1001617, -110.316212]]
        },
        {
            id: "cmt-lab-docencia-3",
            clave: "CMT-15",
            nombre: "Laboratorio de Docencia III",
            categoria: "mar",
            altura: 7,
            tourSlug: "cmlaboratoriodocencia3",
            foto: "img/recorrido/cmlaboratoriodocencia3.jpg",
            descripcion: "Laboratorios de microscopía, biología celular e invertebrados marinos.",
            coords: rect(24.099750, -110.316080, 0.00018, 0.00024)
        },
        {
            id: "lab-ciencias-marinas",
            clave: "CMT-24",
            nombre: "Laboratorio de Ciencias Marinas y Costeras",
            categoria: "mar",
            altura: 8,
            tourSlug: "labcienciasmarinas",
            foto: "img/recorrido/labcienciasmarinas.jpg",
            descripcion: "Investigación en biodiversidad arrecifal, mamíferos marinos, pesquerías y manejo de zona costera.",
            coords: rect(24.099380, -110.316050, 0.00020, 0.00026)
        },
        {
            id: "ing-pesquerias",
            clave: "CMT-26",
            nombre: "Ingeniería Básica I / Ingeniería en Pesquerías",
            categoria: "mar",
            altura: 9,
            tourSlug: "cmingbasica",
            foto: "img/recorrido/cmingbasica.jpg",
            descripcion: "Edificio CMT-26: aulas y laboratorios de Ingeniería en Pesquerías y ciencias básicas de ingeniería.",
            coords: [[24.0989718, -110.3161262], [24.0987294, -110.3161423], [24.0987294, -110.3158392], [24.0989742, -110.3158365], [24.0989718, -110.3161262]]
        },
        {
            id: "cmt-ing-basica-2",
            clave: "CMT-29",
            nombre: "Ingeniería Básica II",
            categoria: "mar",
            altura: 9,
            tourSlug: "cmingbasica2",
            foto: "img/recorrido/cmingbasica2.jpg",
            descripcion: "Aulas y talleres de ciencias de la ingeniería, hidráulica y modelación matemática.",
            coords: rect(24.098920, -110.315550, 0.00020, 0.00026)
        },
        {
            id: "ing-fuentes-renovables",
            clave: "CMT-61",
            nombre: "IFER y Licenciatura en Gestión del Agua",
            categoria: "mar",
            altura: 9,
            tourSlug: "iferyla",
            foto: "img/recorrido/iferyla.jpg",
            descripcion: "Ingeniería en Fuentes de Energía Renovables (IFER) y Licenciatura en Agua: laboratorios de energía solar, térmica y recursos hídricos.",
            coords: [[24.0987147, -110.3159679], [24.0985017, -110.3159813], [24.0984992, -110.3156943], [24.0987196, -110.315689], [24.0987147, -110.3159679]]
        },

        /* ==================== CIENCIAS AGROPECUARIAS ==================== */
        {
            id: "ciencias-agropecuarias-1",
            clave: "CA-04",
            nombre: "Ciencias Agropecuarias I",
            categoria: "agropecuarias",
            altura: 10,
            tourSlug: "cagropecuarias",
            foto: "img/recorrido/cagropecuarias.jpg",
            descripcion: "Departamento Académico de Agronomía y Ciencia Animal, aulas principales y mural «Savia Verde».",
            coords: rect(24.100261, -110.314906, 0.00022, 0.00028)
        },
        {
            id: "ca-cubiculos-a",
            clave: "CA-05",
            nombre: "Cubículos de Profesores (A) – Agropecuarias",
            categoria: "agropecuarias",
            altura: 7,
            tourSlug: "cubiculosprofesores",
            foto: "img/recorrido/cubiculosprofesores.jpg",
            descripcion: "Cubículos de atención y tutoría de profesores investigadores en agronomía y zootecnia.",
            coords: rect(24.100020, -110.314920, 0.00018, 0.00024)
        },
        {
            id: "lab-agronomia-1",
            clave: "CA-06",
            nombre: "Laboratorio de Agronomía I",
            categoria: "agropecuarias",
            altura: 8,
            tourSlug: "labagronomia1",
            foto: "img/recorrido/labagronomia1.jpg",
            descripcion: "Análisis de suelos, fitopatología, botánica sistemática y fisiología vegetal.",
            coords: rect(24.099800, -110.314880, 0.00018, 0.00024)
        },
        {
            id: "ca-lab-docencia-1",
            clave: "CA-11",
            nombre: "Laboratorio de Docencia I (Agropecuarias)",
            categoria: "agropecuarias",
            altura: 8,
            tourSlug: "calaboratoriodocencia",
            foto: "img/recorrido/calaboratoriodocencia.jpg",
            descripcion: "Prácticas de laboratorio para estudiantes de Agronomía, Medicina Veterinaria y Bioingeniería.",
            coords: rect(24.099600, -110.314820, 0.00018, 0.00024)
        },
        {
            id: "cubiculos-pastizales",
            clave: "CA-13",
            nombre: "Cubículos y Laboratorio de Pastizales",
            categoria: "agropecuarias",
            altura: 7,
            tourSlug: "labpastizales",
            foto: "img/recorrido/labpastizales.jpg",
            descripcion: "Manejo de agostaderos, ecología de zonas áridas y forrajes.",
            coords: rect(24.099520, -110.314450, 0.00018, 0.00024)
        },
        {
            id: "posta-zootecnica",
            clave: "CA-22",
            nombre: "Laboratorio y Cubículos de Posta Zootécnica",
            categoria: "agropecuarias",
            altura: 7,
            tourSlug: "laboratorioposta",
            foto: "img/recorrido/laboratorioposta.jpg",
            descripcion: "Instalaciones de producción pecuaria, manejo reproductivo y prácticas clínicas veterinarias.",
            coords: rect(24.098450, -110.317200, 0.00026, 0.00032)
        },
        {
            id: "lab-alimentos-agro",
            clave: "CA-23",
            nombre: "Laboratorio de Alimentos Agropecuarios",
            categoria: "agropecuarias",
            altura: 7,
            tourSlug: "labalimentrosagro",
            foto: "img/recorrido/labalimentrosagro.jpg",
            descripcion: "Bromatología, nutrición animal y control de calidad de productos agroalimentarios.",
            coords: rect(24.098780, -110.316950, 0.00020, 0.00026)
        },
        {
            id: "oficinas-campo-agricola",
            clave: "CA-35",
            nombre: "Oficinas del Campo Agrícola Experimental",
            categoria: "agropecuarias",
            altura: 6,
            tourSlug: "oficinacampoagri",
            foto: "img/recorrido/oficinacampoagri.jpg",
            descripcion: "Coordinación de parcelas demostrativas, invernaderos, sistemas de riego y cultivos protegidos.",
            coords: rect(24.098220, -110.316680, 0.00020, 0.00026)
        },
        {
            id: "cazusa",
            clave: "CA-36",
            nombre: "CAZUSA – Centro de Agricultura en Zonas Áridas",
            categoria: "agropecuarias",
            altura: 8,
            tourSlug: "sueloszonasaridas",
            foto: "img/recorrido/sueloszonasaridas.jpg",
            descripcion: "Investigación especializada en sustentabilidad agrícola en ambientes desérticos y uso eficiente del agua.",
            coords: rect(24.099050, -110.314420, 0.00020, 0.00026)
        },
        {
            id: "lab-agronomia-2",
            clave: "CA-37",
            nombre: "Laboratorio de Agronomía II",
            categoria: "agropecuarias",
            altura: 8,
            tourSlug: "labagronomia2",
            foto: "img/recorrido/labagronomia2.jpg",
            descripcion: "Entomología agrícola, control biológico de plagas y biotecnología de cultivos.",
            coords: rect(24.099280, -110.314350, 0.00018, 0.00024)
        },
        {
            id: "unidad-cunicultura",
            clave: "CA-41",
            nombre: "Unidad de Cunicultura y Especies Menores",
            categoria: "agropecuarias",
            altura: 6,
            tourSlug: "unidadcunicola",
            foto: "img/recorrido/unidadcunicola.jpg",
            descripcion: "Módulos de crianza, genética y prácticas zootécnicas en especies menores.",
            coords: rect(24.098150, -110.317550, 0.00020, 0.00026)
        },
        {
            id: "lab-veterinaria",
            clave: "CA-47",
            nombre: "Laboratorio de Morfofisiología y Medicina Veterinaria",
            categoria: "agropecuarias",
            altura: 9,
            tourSlug: "labveterinaria",
            foto: "img/recorrido/labveterinaria.jpg",
            descripcion: "Anatomía veterinaria, cirugía experimental, patología clínica y diagnóstico animal.",
            coords: rect(24.098550, -110.316420, 0.00022, 0.00028)
        },
        {
            id: "auditorio-agronomia",
            clave: "CA-51",
            nombre: "Ciencias Agropecuarias II y Auditorio de Agronomía",
            categoria: "agropecuarias",
            altura: 11,
            tourSlug: "cagropecuarias2",
            foto: "img/recorrido/cagropecuarias2.jpg",
            descripcion: "Edificio CA-51: aulas de Medicina Veterinaria y Zootecnia, Agronomía y Auditorio de Ciencias Agropecuarias.",
            coords: [[24.1006666, -110.3146886], [24.1004414, -110.3147315], [24.1004242, -110.3144928], [24.100647, -110.314458], [24.1006666, -110.3146886]]
        },

        /* ==================== MURALES ESCULTÓRICOS Y DEPORTES ==================== */
        {
            id: "mural-quijote",
            clave: "MURAL-01",
            nombre: "Mural Escultórico «El Ingenioso Hidalgo y su Fiel Rocinante»",
            categoria: "cultura",
            altura: 6,
            tourSlug: "quijote",
            foto: "img/recorrido/quijote.jpg",
            descripcion: "Obra artística emblemática del corredor cultural del campus universitario.",
            coords: rect(24.101580, -110.315920, 0.00010, 0.00012)
        },
        {
            id: "mural-lampara",
            clave: "MURAL-02",
            nombre: "Mural Escultórico «La Lámpara de la Sabiduría»",
            categoria: "cultura",
            altura: 7,
            tourSlug: "muralbiblio",
            foto: "img/recorrido/muralbiblio.jpg",
            descripcion: "Mural monumental ubicado en la Biblioteca Central de la UABCS.",
            coords: rect(24.101850, -110.316120, 0.00010, 0.00012)
        },
        {
            id: "cancha-voleibol",
            clave: "AD-58A",
            nombre: "Canchas Deportivas y Voleibol",
            categoria: "deportes",
            altura: 1.2,
            tourSlug: "gimnasio",
            foto: "img/recorrido/gimnasio.jpg",
            descripcion: "Canchas exteriores de voleibol, básquetbol y convivencia deportiva estudiantil.",
            coords: [[24.102011, -110.314240], [24.102011, -110.313896], [24.102347, -110.313896], [24.102347, -110.314240]]
        },
        {
            id: "campo-uabcs",
            clave: "AD-58",
            nombre: "Unidad Deportiva y Estadio Universitario UABCS",
            categoria: "deportes",
            altura: 1.5,
            tourSlug: "gimnasio",
            foto: "img/recorrido/gimnasio.jpg",
            descripcion: "Campo empastado de fútbol, pista atlética y complejo deportivo norte del campus.",
            coords: [[24.103922, -110.316277], [24.104951, -110.316103], [24.104801, -110.315333], [24.103812, -110.315561]]
        }
    ];

    // Directorio completo de recorridos virtuales 360° oficiales (uabcs.mx/recorrido-virtual/menu.html)
    const recorridosOficiales = [
        // Sistemas Computacionales
        { slug: "sistemas", clave: "DSC-39", titulo: "Departamento Académico de Sistemas Computacionales", area: "sistemas", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/sistemas/", edificioId: "dasc" },
        { slug: "macrocentro", clave: "DSC-46", titulo: "Sistemas II / Macrocentro de Cómputo (Aula MAC)", area: "sistemas", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/macrocentro/", edificioId: "dasc-ii" },
        // Ciencias Agropecuarias
        { slug: "cagropecuarias", clave: "CA-04", titulo: "Ciencias Agropecuarias I", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cagropecuarias/", edificioId: "ciencias-agropecuarias-1" },
        { slug: "cubiculosprofesores", clave: "CA-05", titulo: "Cubículos de Profesores (A, B y C)", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cubiculosprofesores/", edificioId: "ca-cubiculos-a" },
        { slug: "labagronomia1", clave: "CA-06", titulo: "Laboratorio de Agronomía I", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labagronomia1/", edificioId: "lab-agronomia-1" },
        { slug: "calaboratoriodocencia", clave: "CA-11", titulo: "Laboratorio de Docencia I", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/calaboratoriodocencia/", edificioId: "ca-lab-docencia-1" },
        { slug: "labpastizales", clave: "CA-13", titulo: "Cubículos de Pastizales", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labpastizales/", edificioId: "cubiculos-pastizales" },
        { slug: "laboratorioposta", clave: "CA-22", titulo: "Laboratorio de Posta Zootécnica", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/laboratorioposta/", edificioId: "posta-zootecnica" },
        { slug: "labalimentrosagro", clave: "CA-23", titulo: "Laboratorio de Alimentos Agropecuarios", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labalimentrosagro/", edificioId: "lab-alimentos-agro" },
        { slug: "oficinacampoagri", clave: "CA-35", titulo: "Oficinas del Campo Agrícola", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/oficinacampoagri/", edificioId: "oficinas-campo-agricola" },
        { slug: "sueloszonasaridas", clave: "CA-36", titulo: "CAZUSA – Suelos y Zonas Áridas", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/sueloszonasaridas/", edificioId: "cazusa" },
        { slug: "labagronomia2", clave: "CA-37", titulo: "Laboratorio de Agronomía II", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labagronomia2/", edificioId: "lab-agronomia-2" },
        { slug: "unidadcunicola", clave: "CA-41", titulo: "Unidad de Cunicultura", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/unidadcunicola/", edificioId: "unidad-cunicultura" },
        { slug: "labveterinaria", clave: "CA-47", titulo: "Laboratorio de Morfofisiología y Veterinaria", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labveterinaria/", edificioId: "lab-veterinaria" },
        { slug: "cagropecuarias2", clave: "CA-51", titulo: "Ciencias Agropecuarias II", area: "agropecuarias", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cagropecuarias2/", edificioId: "auditorio-agronomia" },
        // Ciencias del Mar y de la Tierra
        { slug: "cmarytierra", clave: "CMT-03", titulo: "Ciencias del Mar y de la Tierra I", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cmarytierra/", edificioId: "biologia-marina" },
        { slug: "labcienciastierra", clave: "CMT-07", titulo: "Laboratorio de Ciencias de la Tierra", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labcienciastierra/", edificioId: "lab-ciencias-tierra" },
        { slug: "cmartierra2", clave: "CMT-08", titulo: "Ciencias del Mar y de la Tierra II", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cmartierra2/", edificioId: "cmt-08" },
        { slug: "labgeociencias", clave: "CMT-12", titulo: "Laboratorio de Geociencias", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labgeociencias/", edificioId: "lab-geociencias" },
        { slug: "cmlabdocencia2", clave: "CMT-14", titulo: "Laboratorio de Docencia II", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cmlabdocencia2/", edificioId: "lab-fisica" },
        { slug: "cmlaboratoriodocencia3", clave: "CMT-15", titulo: "Laboratorio de Docencia III", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cmlaboratoriodocencia3/", edificioId: "cmt-lab-docencia-3" },
        { slug: "labcienciasmarinas", clave: "CMT-24", titulo: "Laboratorio de Ciencias Marinas y Costeras", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/labcienciasmarinas/", edificioId: "lab-ciencias-marinas" },
        { slug: "cmingbasica", clave: "CMT-26", titulo: "Ingeniería Básica I", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cmingbasica/", edificioId: "ing-pesquerias" },
        { slug: "cmingbasica2", clave: "CMT-29", titulo: "Ingeniería Básica II", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cmingbasica2/", edificioId: "cmt-ing-basica-2" },
        { slug: "iferyla", clave: "CMT-61", titulo: "IFER y Licenciatura en Agua", area: "mar", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/iferyla/", edificioId: "ing-fuentes-renovables" },
        // Ciencias Sociales y Humanidades
        { slug: "csociales", clave: "CSH-02", titulo: "Ciencias Sociales", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/csociales/", edificioId: "auditorio-ciencias-sociales" },
        { slug: "historiaregional", clave: "CSH-25", titulo: "Historia Regional", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/historiaregional/", edificioId: "historia-regional" },
        { slug: "csocialesyhumanidades", clave: "CSH-28", titulo: "Ciencias Sociales y Humanidades", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/csocialesyhumanidades/", edificioId: "csh-28" },
        { slug: "diip", clave: "CSH-43", titulo: "Centro de Vinculación, Investigación y Posgrado (DIIP)", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/diip/", edificioId: "diip" },
        { slug: "humanidades2", clave: "CSH-44", titulo: "Humanidades II", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/humanidades2/", edificioId: "humanidades-ii" },
        { slug: "csocialesyjuridicas", clave: "CSH-45", titulo: "Ciencias Sociales y Jurídicas (DACSJ)", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/csocialesyjuridicas/", edificioId: "ciencias-sociales-juridicas" },
        { slug: "cpoliticas", clave: "CSH-49", titulo: "Ciencias Políticas", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cpoliticas/", edificioId: "ciencias-politicas" },
        { slug: "cubprofesoressociales", clave: "CSH-50", titulo: "Cubículos de Profesores Sociales", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cubprofesoressociales/", edificioId: "csh-cubiculos-50" },
        { slug: "posgrados", clave: "CSH-53", titulo: "Edificio de Posgrado", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/posgrados/", edificioId: "posgrados" },
        { slug: "humanidades1", clave: "CSH-56", titulo: "Humanidades I y Mural «Testamento del Sol»", area: "sociales", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/humanidades1/", edificioId: "humanidades" },
        // Servicios
        { slug: "gimnasio", clave: "AD-01", titulo: "Gimnasio Auditorio Universitario", area: "deportes", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/gimnasio/", edificioId: "gimnasio" },
        { slug: "procesadoraalimentos", clave: "AD-16", titulo: "Unidad Académica Procesadora de Alimentos", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/procesadoraalimentos/", edificioId: "procesadora-alimentos" },
        { slug: "dele", clave: "AD-18", titulo: "Departamento de Lenguas Extranjeras (DELE)", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/dele/", edificioId: "dele" },
        { slug: "biblioteca", clave: "AD-20", titulo: "Biblioteca Central", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/biblioteca/", edificioId: "biblioteca" },
        { slug: "servmed", clave: "AD-21", titulo: "Unidad de Servicios Médicos", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/servmed/", edificioId: "centro-medico" },
        { slug: "adlaboratoriodocencia", clave: "AD-31", titulo: "Depto. de Laboratorios de Docencia", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/adlaboratoriodocencia/", edificioId: "depto-lab-docencia" },
        { slug: "redes", clave: "AD-40", titulo: "Edificio de Redes y Telecomunicaciones (RIUABCS)", area: "sistemas", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/sistemas/", edificioId: "edificio-redes" },
        { slug: "creactivospeligrosos", clave: "AD-54", titulo: "Centro de Reactivos Peligrosos", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/creactivospeligrosos/", edificioId: "reactivos-peligrosos" },
        { slug: "serviciosest", clave: "AD-55", titulo: "Centro de Atención a Estudiantes", area: "administrativo", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/serviciosest/", edificioId: "control-escolar" },
        { slug: "unicap", clave: "AD-57", titulo: "UNICAP – Unidad de Capacitación", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/unicap/", edificioId: "unicap" },
        { slug: "entrada", clave: "AD-59", titulo: "Entrada Principal y Caseta de Vigilancia UABCS", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/entrada/", edificioId: "caseta-vigilancia" },
        { slug: "serviciosgenerales", clave: "AD-60", titulo: "Servicios Generales y Mantenimiento", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/serviciosgenerales/", edificioId: "servicios-generales" },
        { slug: "alamcentemporalresiduos", clave: "AD-62", titulo: "Centro de Acopio de Residuos Peligrosos", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/alamcentemporalresiduos/", edificioId: "acopio-residuos" },
        { slug: "paradabus", clave: "AD-64", titulo: "Parada de Camiones y Transporte Universitario", area: "servicios", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/paradabus/", edificioId: "parada-camiones" },
        // Espacios Culturales y Murales
        { slug: "radioytelevision", clave: "AD-27", titulo: "Centro de Radio y Televisión UABCS", area: "cultura", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/radioytelevision/", edificioId: "radio-uabcs" },
        { slug: "imprenta", clave: "AD-34", titulo: "Artes Gráficas e Imprenta Universitaria", area: "cultura", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/imprenta/", edificioId: "artes-graficas" },
        { slug: "poliforo", clave: "AD-52", titulo: "Poliforo Cultural Universitario", area: "cultura", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/poliforo/", edificioId: "poliforo" },
        { slug: "quijote", clave: "MURAL-01", titulo: "Mural Escultórico «El Ingenioso Hidalgo y su Fiel Rocinante»", area: "cultura", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/quijote/", edificioId: "mural-quijote" },
        { slug: "muralbiblio", clave: "MURAL-02", titulo: "Mural Escultórico «La Lámpara de la Sabiduría»", area: "cultura", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/muralbiblio/index.html#node2", edificioId: "mural-lampara" },
        // Administrativos y Comerciales
        { slug: "almacenycompras", clave: "AD-09", titulo: "Almacén y Compras", area: "administrativo", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/almacenycompras/", edificioId: "almacen" },
        { slug: "cige", clave: "AD-10B", titulo: "CIGE: Coordinación para la Igualdad de Género", area: "administrativo", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/cige/", edificioId: "cige" },
        { slug: "rectoria", clave: "AD-19", titulo: "Rectoría de la UABCS", area: "administrativo", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/rectoria/", edificioId: "rectoria" },
        { slug: "difusion", clave: "AD-30", titulo: "Difusión Cultural y Extensión Universitaria", area: "cultura", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/difusion/", edificioId: "edificio-artes" },
        { slug: "spauabcs", clave: "AD-32", titulo: "SPAUABCS – Sindicato Académico", area: "administrativo", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/spauabcs/", edificioId: "spauabcs" },
        { slug: "sutauabcs", clave: "AD-33", titulo: "SUTAUABCS – Sindicato Administrativo", area: "administrativo", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/sutauabcs/", edificioId: "sindicato" },
        { slug: "libreria", clave: "AD-38", titulo: "Librería Universitaria", area: "comercial", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/libreria/", edificioId: "libreria" },
        { slug: "csu", clave: "AD-63", titulo: "CSU – Centro de Servicios Universitarios y Mural «Cactácea Sudca»", area: "comercial", nodoUrl: "https://www.uabcs.mx/recorrido-virtual/lapaz/csu/", edificioId: "csu" }
    ];

    const extensionesAcademicas = [
        { id: "ext-pichilingue", titulo: "Unidad Académica Pichilingue", url: "https://www.uabcs.mx/recorrido-virtual/pichilingue/1/", ubicacion: "La Paz, B.C.S." },
        { id: "ext-loscabos", titulo: "Extensión Académica Los Cabos", url: "https://www.uabcs.mx/recorrido-virtual/loscabos/1/", ubicacion: "Cabo San Lucas, B.C.S." },
        { id: "ext-guerreronegro", titulo: "Extensión Académica Guerrero Negro", url: "https://www.uabcs.mx/recorrido-virtual/guerreronegro/1/", ubicacion: "Mulegé, B.C.S." },
        { id: "ext-loreto", titulo: "Extensión Académica Loreto", url: "https://www.uabcs.mx/recorrido-virtual/loreto/", ubicacion: "Loreto, B.C.S." },
        { id: "ext-laribera", titulo: "Extensión Académica La Ribera", url: "https://www.uabcs.mx/recorrido-virtual/laribera/", ubicacion: "Los Cabos, B.C.S." },
        { id: "ext-portales", titulo: "Centro Cultural Los Portales", url: "https://www.uabcs.mx/recorrido-virtual/portales/", ubicacion: "Centro Histórico La Paz" }
    ];

    recorridosOficiales.forEach(function (r) {
        if (!r.nombre) r.nombre = r.titulo;
        if (!r.url) r.url = r.nodoUrl;
    });

    extensionesAcademicas.forEach(function (x) {
        if (!x.slug) x.slug = x.id.replace(/^ext-/, "");
        if (!x.nombre) x.nombre = x.titulo;
    });

    /* ==================== MOTOR GEOMÉTRICO PARA ARQUITECTURA 3D SIIA ==================== */
    function centroCoords(pts) {
        const n = pts.length;
        let sLat = 0, sLng = 0;
        for (let i = 0; i < n; i++) {
            sLat += pts[i][0];
            sLng += pts[i][1];
        }
        return [sLat / n, sLng / n];
    }

    function quitarCierreDuplicado(pts) {
        if (pts.length > 3) {
            const a = pts[0], b = pts[pts.length - 1];
            if (Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7) {
                return pts.slice(0, pts.length - 1);
            }
        }
        return pts;
    }

    function escalarPoligono(ptsRaw, fLat, fLng, dLat, dLng) {
        const pts = quitarCierreDuplicado(ptsRaw);
        const c = centroCoords(pts);
        const oLat = dLat || 0;
        const oLng = dLng || 0;
        return pts.map(function (p) {
            return [
                +(c[0] + (p[0] - c[0]) * fLat + oLat).toFixed(7),
                +(c[1] + (p[1] - c[1]) * fLng + oLng).toFixed(7)
            ];
        });
    }

    function aAnilloGeoJSON(pts) {
        const anillo = pts.map(function (p) { return [p[1], p[0]]; });
        const a = anillo[0], b = anillo[anillo.length - 1];
        if (a[0] !== b[0] || a[1] !== b[1]) anillo.push(a.slice());
        return anillo;
    }

    function poligonoCircular(lat, lng, radioMetros, lados) {
        const n = lados || 16;
        const dLat = radioMetros / 111320;
        const dLng = radioMetros / (111320 * Math.cos((lat * Math.PI) / 180));
        const pts = [];
        for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2;
            pts.push([
                +(lat + Math.sin(ang) * dLat).toFixed(7),
                +(lng + Math.cos(ang) * dLng).toFixed(7)
            ]);
        }
        return pts;
    }

    const ROJOS_ARCADAS_SIIA = {
        "dasc": true,
        "dasc-ii": true,
        "edificio-artes": true,
        "radio-uabcs": true,
        "dele": true,
        "control-escolar": true,
        "auditorio-ciencias-sociales": true,
        "csh-28": true,
        "diip": true,
        "humanidades-ii": true,
        "biologia-marina": true,
        "cmt-08": true,
        "ing-pesquerias": true,
        "ciencias-agropecuarias-1": true,
        "auditorio-agronomia": true
    };

    const AMARILLOS_ARCADAS_SIIA = {
        "sala-cine": true,
        "centro-medico": true,
        "cafeteria": true,
        "libreria": true,
        "csu": true,
        "historia-regional": true,
        "lab-ciencias-tierra": true,
        "lab-geociencias": true
    };

    function determinarArquetipoSIIA(ed) {
        if (ed.id === "biblioteca") return "biblioteca";
        if (ed.id === "caseta-vigilancia") return "arco-entrada";
        if (ed.id === "rectoria") return "rectoria";
        if (ed.id === "poliforo") return "poliforo";
        if (ed.id === "gimnasio") return "gimnasio";
        if (ed.id === "campo-uabcs" || ed.id === "cancha-voleibol") return "estadio";
        if (ed.id === "mural-quijote" || ed.id === "mural-lampara") return "mural";
        if (ROJOS_ARCADAS_SIIA[ed.id]) return "rojo-arcadas";
        if (AMARILLOS_ARCADAS_SIIA[ed.id]) return "amarillo-arcadas";
        return "crema-dos-niveles";
    }

    function crearFeatureParte(ed, propsBase, coordsPts, baseM, alturaM, colorSIIA, colorCat, parteNombre, featureId) {
        return {
            type: "Feature",
            id: featureId,
            properties: Object.assign({}, propsBase, {
                base: +baseM.toFixed(2),
                baseM: +baseM.toFixed(2),
                altura: +alturaM.toFixed(2),
                alturaM: +alturaM.toFixed(2),
                color: colorCat,
                colorSIIA: colorSIIA,
                colorCategoria: colorCat,
                parte: parteNombre
            }),
            geometry: {
                type: "Polygon",
                coordinates: [aAnilloGeoJSON(coordsPts)]
            }
        };
    }

    function generarPartesEdificioSIIA(ed, self, seqRef) {
        const cat = self.categorias[ed.categoria] || self.categorias.academico;
        const centro = self.centroDe(ed);
        const H = ed.altura || 9;
        const arq = determinarArquetipoSIIA(ed);

        const propsBase = {
            id: ed.id,
            clave: ed.clave || "",
            nombre: ed.nombre,
            etiquetaCorta: (ed.clave ? ed.clave + " · " : "") + ed.nombre.split("(")[0].trim(),
            categoria: ed.categoria,
            arquetipoSIIA: arq,
            foto: ed.foto || "img/uabcs.jpg",
            tourSlug: ed.tourSlug || "sistemas",
            sedeEvento: ed.sedeEvento || "",
            descripcion: ed.descripcion || "",
            centroLat: centro[0],
            centroLng: centro[1]
        };

        const piezas = [];
        function add(coordsPts, baseM, alturaM, colSIIA, colCat, parte) {
            piezas.push(crearFeatureParte(ed, propsBase, coordsPts, baseM, alturaM, colSIIA, colCat, parte, seqRef.val++));
        }

        const ptsBase = quitarCierreDuplicado(ed.coords);

        if (arq === "biblioteca") {
            // BIBLIOTECA CENTRAL (AD-20): Escalinata blanca + Planta Baja Amarilla SIIA + 2do Piso Azul Rey + Cornisa blanca + Domo escalonado
            add(escalarPoligono(ptsBase, 1.12, 1.12), 0, 1.2, "#f8fafc", "#f8fafc", "basamento");
            // Escalinata/Rampa oriente hacia la avenida
            add(escalarPoligono(ptsBase, 0.45, 0.24, 0, 0.00018), 0, 2.4, "#e2e8f0", "#e2e8f0", "escalinata");
            // Pórtico de columnas blancas en planta baja
            add(escalarPoligono(ptsBase, 1.03, 1.03), 1.2, 6.4, "#ffffff", "#f8fafc", "portico");
            // Cuerpo principal Planta Baja Amarillo SIIA
            add(escalarPoligono(ptsBase, 0.96, 0.96), 1.2, 6.5, "#eab308", cat.color, "cuerpo-pb");
            // Segundo Nivel Volado Azul Rey Institucional SIIA
            add(escalarPoligono(ptsBase, 1.05, 1.05), 6.5, 10.6, "#1d4ed8", cat.color, "nivel-azul");
            // Cornisa y losa superior blanca
            add(escalarPoligono(ptsBase, 1.07, 1.07), 10.6, 11.5, "#ffffff", "#ffffff", "cornisa");
            // Domo y tragaluz central en la azotea
            add(escalarPoligono(ptsBase, 0.44, 0.44), 11.5, 13.1, "#cbd5e1", "#cbd5e1", "domo-base");
            add(escalarPoligono(ptsBase, 0.26, 0.26), 13.1, 14.0, "#475569", "#475569", "domo-cristal");
            return piezas;
        }

        if (arq === "arco-entrada") {
            // ARCO MONUMENTAL DE ENTRADA UABCS (AD-59) en Blvd. Forjadores
            const cLat = centro[0], cLng = centro[1];
            // 3 Pilares con base blanca + columna amarilla SIIA
            const pilarIzq = rect(cLat + 0.000075, cLng - 0.000075, 0.000045, 0.000045);
            const pilarCen = rect(cLat, cLng, 0.000050, 0.000050);
            const pilarDer = rect(cLat - 0.000075, cLng + 0.000075, 0.000045, 0.000045);
            [pilarIzq, pilarCen, pilarDer].forEach(function (pil) {
                add(pil, 0, 1.1, "#ffffff", "#ffffff", "base-pilar");
                add(pil, 1.1, 5.4, "#fde047", cat.color, "pilar-arco");
            });
            // Viga / Doble Arco Superior Flotante (base: 4.6m a 7.4m sobre la avenida)
            const vigaArco = [
                [cLat + 0.000105, cLng - 0.000055],
                [cLat + 0.000055, cLng - 0.000105],
                [cLat - 0.000105, cLng + 0.000055],
                [cLat - 0.000055, cLng + 0.000105]
            ];
            add(vigaArco, 4.6, 7.4, "#facc15", cat.color, "dintel-arco");
            add(escalarPoligono(vigaArco, 0.55, 0.55), 7.4, 8.8, "#fde047", cat.color, "fronton-arco");
            add(escalarPoligono(vigaArco, 1.04, 1.04), 7.2, 7.7, "#ffffff", "#ffffff", "cornisa-arco");
            // Caseta de vigilancia junto al arco
            const caseta = rect(cLat - 0.00004, cLng - 0.00006, 0.000055, 0.000055);
            add(caseta, 0, 3.4, "#f8fafc", "#f8fafc", "caseta");
            add(escalarPoligono(caseta, 1.15, 1.15), 3.4, 4.0, "#c81e1e", cat.color, "techo-caseta");
            return piezas;
        }

        if (arq === "rectoria") {
            // RECTORÍA (AD-19): Ala frontal blanca curva + Torre posterior en L color Arena/Crema de 2 niveles
            add(escalarPoligono(ptsBase, 1.08, 1.08), 0, 0.9, "#f1f5f9", "#f1f5f9", "basamento");
            // Ala blanca oriente con terraza y pórtico
            add(escalarPoligono(ptsBase, 0.85, 0.65, 0.00004, 0.00006), 0.9, 7.6, "#f8fafc", "#f8fafc", "ala-blanca");
            add(escalarPoligono(ptsBase, 0.89, 0.69, 0.00004, 0.00006), 7.6, 8.4, "#ffffff", "#ffffff", "cornisa-ala");
            // Rotonda / Fachada curva de acceso en Rectoría
            const rotonda = poligonoCircular(centro[0] + 0.00006, centro[1] + 0.00011, 8.5, 14);
            add(rotonda, 0, 8.0, "#ffffff", "#f8fafc", "rotonda-rectoria");
            add(poligonoCircular(centro[0] + 0.00006, centro[1] + 0.00011, 4.5, 12), 8.0, 9.4, "#cbd5e1", "#cbd5e1", "domo-rotonda");
            // Bloque principal de 2 niveles color Arena/Crema SIIA
            add(ptsBase, 0.9, 11.4, "#d6b895", cat.color, "cuerpo-rectoria");
            add(escalarPoligono(ptsBase, 1.04, 1.04), 5.6, 6.3, "#ffffff", "#f8fafc", "entrepiso");
            add(escalarPoligono(ptsBase, 1.05, 1.05), 11.4, 12.3, "#ffffff", "#ffffff", "cornisa");
            add(escalarPoligono(ptsBase, 0.38, 0.38), 12.3, 13.8, "#cbd5e1", "#cbd5e1", "domo");
            return piezas;
        }

        if (arq === "poliforo") {
            // POLIFORO CULTURAL (AD-52): Pórtico blanco monumental + Nave crema/marfil + Franja dorada + Caja acústica superior
            add(escalarPoligono(ptsBase, 1.10, 1.10), 0, 1.0, "#e2e8f0", "#e2e8f0", "plataforma");
            add(escalarPoligono(ptsBase, 1.04, 1.04), 1.0, 6.6, "#ffffff", "#f8fafc", "portico-columnas");
            add(ptsBase, 1.0, 11.2, "#efe6d5", cat.color, "nave-principal");
            add(escalarPoligono(ptsBase, 1.03, 1.03), 11.2, 12.1, "#d97706", "#f59e0b", "friso-oro");
            add(escalarPoligono(ptsBase, 0.72, 0.72), 12.1, 15.0, "#f8fafc", cat.color, "caja-escenica");
            add(escalarPoligono(ptsBase, 0.76, 0.76), 15.0, 15.7, "#ffffff", "#ffffff", "cornisa-alta");
            add(escalarPoligono(ptsBase, 0.36, 0.36), 15.7, 17.2, "#94a3b8", "#94a3b8", "domo-poliforo");
            return piezas;
        }

        if (arq === "gimnasio") {
            // GIMNASIO AUDITORIO (AD-01): Plazoleta curva + Nave blanca + Cubierta abovedada en 3 niveles
            const plaz = poligonoCircular(centro[0] - 0.00012, centro[1] - 0.00016, 14, 14);
            add(plaz, 0, 0.4, "#cbd5e1", "#cbd5e1", "plazoleta");
            add(escalarPoligono(ptsBase, 1.06, 1.06), 0, 5.6, "#fef3c7", "#f8fafc", "portico-gimnasio");
            add(ptsBase, 0, 11.0, "#f8fafc", cat.color, "nave-gimnasio");
            add(escalarPoligono(ptsBase, 1.04, 1.04), 10.6, 11.4, "#ffffff", "#ffffff", "cornisa");
            // Bóveda escalonada del techo del gimnasio
            add(escalarPoligono(ptsBase, 0.84, 0.72), 11.4, 12.8, "#e2e8f0", "#e2e8f0", "boveda-1");
            add(escalarPoligono(ptsBase, 0.78, 0.48), 12.8, 13.9, "#cbd5e1", "#cbd5e1", "boveda-2");
            add(escalarPoligono(ptsBase, 0.70, 0.25), 13.9, 14.7, "#94a3b8", "#94a3b8", "boveda-3");
            return piezas;
        }

        if (arq === "estadio") {
            // UNIDAD DEPORTIVA Y CANCHAS CON GRADAS TECHADAS BLANCAS (como en la maqueta SIIA 3D)
            add(escalarPoligono(ptsBase, 1.05, 1.05), 0, 0.22, "#14532d", "#14532d", "borde-campo");
            add(ptsBase, 0.22, 0.42, "#16a34a", "#16a34a", "cesped");
            add(escalarPoligono(ptsBase, 0.86, 0.82), 0.42, 0.50, "#dcfce7", "#dcfce7", "lineas-cancha");
            add(escalarPoligono(ptsBase, 0.82, 0.78), 0.43, 0.52, "#15803d", "#15803d", "cesped-interior");
            if (ed.id === "campo-uabcs") {
                // Gradas techadas blancas en el costado poniente
                const gradas1 = escalarPoligono(ptsBase, 0.36, 0.14, 0, -0.00032);
                const gradas2 = escalarPoligono(ptsBase, 0.34, 0.09, 0, -0.00035);
                const techoGradas = escalarPoligono(ptsBase, 0.38, 0.16, 0, -0.00033);
                add(gradas1, 0, 2.0, "#f1f5f9", "#f1f5f9", "gradas-bajas");
                add(gradas2, 2.0, 3.8, "#e2e8f0", "#e2e8f0", "gradas-altas");
                add(techoGradas, 4.8, 5.6, "#ffffff", "#ffffff", "techo-gradas");
            }
            return piezas;
        }

        if (arq === "mural") {
            add(escalarPoligono(ptsBase, 1.35, 1.35), 0, 1.2, "#94a3b8", "#94a3b8", "pedestal-mural");
            add(ptsBase, 1.2, H, "#f59e0b", cat.color, "mural-cuerpo");
            add(escalarPoligono(ptsBase, 1.12, 1.12), H, H + 0.7, "#fef08a", "#ffffff", "mural-remate");
            return piezas;
        }

        if (arq === "rojo-arcadas" || arq === "amarillo-arcadas") {
            // EDIFICIOS CLÁSICOS SIIA ROJOS O AMARILLOS CON ARCADAS BLANCAS PERIMETRALES Y DOMO DE AZOTEA
            const colorMuroSIIA = arq === "rojo-arcadas" ? "#c81e1e" : "#eab308";
            // 1. Basamento y corredor perimetral de arcadas blancas (Planta Baja)
            add(escalarPoligono(ptsBase, 1.07, 1.07), 0, H * 0.46, "#f8fafc", "#f8fafc", "arcada-pb");
            // 2. Franja de entrepiso / balcón blanco perimetral
            add(escalarPoligono(ptsBase, 1.08, 1.08), H * 0.45, H * 0.53, "#ffffff", "#ffffff", "cornisa-media");
            // 3. Pilastras blancas verticales en las esquinas (simulando las columnas de los arcos hasta el techo)
            add(escalarPoligono(ptsBase, 1.04, 0.90), 0, H * 0.89, "#f1f5f9", "#f1f5f9", "pilastras-lat");
            add(escalarPoligono(ptsBase, 0.90, 1.04), 0, H * 0.89, "#f1f5f9", "#f1f5f9", "pilastras-lng");
            // 4. Cuerpo arquitectónico principal (Rojo Terracota SIIA o Amarillo Ocre SIIA)
            add(escalarPoligono(ptsBase, 0.96, 0.96), 0, H * 0.90, colorMuroSIIA, cat.color, "cuerpo-principal");
            // 5. Losa y Cornisa Superior Blanca Volada
            add(escalarPoligono(ptsBase, 1.06, 1.06), H * 0.90, H, "#ffffff", "#ffffff", "cornisa-azotea");
            // 6. Domo / Tragaluz Central de Azotea (característico de la maqueta 3D SIIA)
            add(escalarPoligono(ptsBase, 0.40, 0.40), H, H + 1.4, "#cbd5e1", "#cbd5e1", "domo-base");
            add(escalarPoligono(ptsBase, 0.24, 0.24), H + 1.4, H + 2.0, "#64748b", "#64748b", "domo-tragaluz");
            return piezas;
        }

        // ARQUETIPO POR DEFECTO: "crema-dos-niveles" (Edificios modernos Arena/Crema y Blanco del SIIA)
        add(escalarPoligono(ptsBase, 1.06, 1.06), 0, H * 0.44, "#f8fafc", "#f8fafc", "portico-pb");
        add(escalarPoligono(ptsBase, 1.04, 1.04), H * 0.44, H * 0.52, "#ffffff", "#ffffff", "entrepiso-blanco");
        add(escalarPoligono(ptsBase, 0.96, 0.96), 0, H * 0.90, "#dfc3a3", cat.color, "cuerpo-crema");
        add(escalarPoligono(ptsBase, 1.05, 1.05), H * 0.90, H, "#ffffff", "#ffffff", "cornisa-azotea");
        add(escalarPoligono(ptsBase, 0.36, 0.36), H, H + 1.3, "#cbd5e1", "#cbd5e1", "domo-azotea");
        return piezas;
    }

    // Normalizar propiedades para compatibilidad con Mapa 2D/3D, Guía AR y Store
    categorias.todas = { nombre: "Todas las Áreas", label: "Todas", color: "#3b82f6", icono: "bi-grid" };
    Object.keys(categorias).forEach(function (k) {
        categorias[k].label = categorias[k].label || categorias[k].nombre;
    });

    edificios.forEach(function (e) {
        const cat = categorias[e.categoria] || categorias.academico;
        e.codigoMapa = e.codigoMapa || e.clave || "UABCS";
        e.color = e.color || cat.color || "#3b82f6";
        e.alturaM = e.alturaM || e.altura || 7;
        e.pisos = e.pisos || (e.altura >= 8 ? 2 : 1);
        e.imagen = e.imagen || (e.foto ? (e.foto.indexOf("./") === 0 || e.foto.indexOf("http") === 0 ? e.foto : "./" + e.foto) : "./img/uabcs.jpg");
        e.centro = e.centro || centroCoords(quitarCierreDuplicado(e.coords));
    });

    recorridosOficiales.forEach(function (r) {
        const edMatch = edificios.find(function (e) { return e.id === r.edificioId; });
        r.nombre = r.nombre || ((r.clave ? r.clave + " · " : "") + r.titulo);
        r.url = r.url || r.nodoUrl;
        r.img = r.img || (edMatch ? edMatch.imagen : "./img/uabcs.jpg");
    });

    return {
        centro: [24.101711, -110.314783],
        zoom: 16.0,
        marcadorPrincipal: {
            coords: [24.102593, -110.315115],
            nombre: "Universidad Autónoma de Baja California Sur"
        },
        modeloSketchfab: "https://sketchfab.com/models/dff24f6f10774fea857c774fc08f59f9/embed?annotation_cycle=5&autostart=1",
        pdfOficialUrl: "img/Mapa-Campus-La-Paz-2022.pdf",
        categorias: categorias,
        edificios: edificios,
        recorridosOficiales: recorridosOficiales,
        extensionesAcademicas: extensionesAcademicas,

        /** Busca un edificio por id, clave oficial (ej. DSC-39, AD-20) o nombre. */
        buscar: function (texto) {
            if (!texto) return null;
            const norm = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); };
            const q = norm(texto);
            return this.edificios.find(function (e) {
                return e.id === q || norm(e.clave || "") === q || norm(e.nombre) === q || e.tourSlug === q;
            }) || this.edificios.find(function (e) {
                return norm(e.nombre).indexOf(q) !== -1 || norm(e.clave || "").indexOf(q) !== -1;
            }) || null;
        },

        /** Centro aproximado (promedio de vértices) en [lat, lng]. */
        centroDe: function (edificio) {
            return centroCoords(quitarCierreDuplicado(edificio.coords));
        },

        /** Convierte los edificios a GeoJSON 2D base (1 polígono por edificio). */
        geojson: function () {
            const self = this;
            return {
                type: "FeatureCollection",
                features: this.edificios.map(function (e, idx) {
                    const anillo = aAnilloGeoJSON(e.coords);
                    const cat = self.categorias[e.categoria] || self.categorias.academico;
                    const centro = self.centroDe(e);
                    return {
                        type: "Feature",
                        id: idx,
                        properties: {
                            id: e.id,
                            clave: e.clave || "",
                            nombre: e.nombre,
                            etiquetaCorta: (e.clave ? e.clave + " · " : "") + e.nombre.split("(")[0].trim(),
                            categoria: e.categoria,
                            altura: e.altura,
                            base: 0,
                            color: cat.color,
                            foto: e.foto || "img/uabcs.jpg",
                            tourSlug: e.tourSlug || "sistemas",
                            sedeEvento: e.sedeEvento || "",
                            descripcion: e.descripcion || "",
                            centroLat: centro[0],
                            centroLng: centro[1]
                        },
                        geometry: { type: "Polygon", coordinates: [anillo] }
                    };
                })
            };
        },

        /**
         * Genera la Arquitectura 3D Multi-Volumen inspirada en la Maqueta 3D del SIIA:
         * Pórticos de arcadas blancas, muros rojos/amarillos/crema, segundo piso azul de Biblioteca,
         * cornisas voladas, domos de azotea, Arco Monumental de Entrada y Gradas Techadas.
         */
        geojsonArquitecturaSIIA: function () {
            const self = this;
            const seqRef = { val: 1 };
            let features = [];
            this.edificios.forEach(function (e) {
                const partes = generarPartesEdificioSIIA(e, self, seqRef);
                features = features.concat(partes);
            });
            return {
                type: "FeatureCollection",
                features: features
            };
        },

        /**
         * Genera el Urbanismo 3D de la Maqueta SIIA:
         * Glorieta Universitaria, Camellones, Plaza de los 3 Edificios Rojos con fuente,
         * Jardineras verdes en cuadrícula (DIIP/Humanidades), Explanada Ocre de Biblioteca,
         * Pérgola techada de Sistemas (DASC) y Techos de Paneles Solares en Estacionamientos.
         */
        geojsonUrbanismoSIIA: function () {
            const feats = [];
            let uid = 5000;
            function addUrb(coordsPts, baseM, alturaM, color, nombre) {
                feats.push({
                    type: "Feature",
                    id: uid++,
                    properties: {
                        nombreUrbanismo: nombre,
                        base: +baseM.toFixed(2),
                        baseM: +baseM.toFixed(2),
                        altura: +alturaM.toFixed(2),
                        alturaM: +alturaM.toFixed(2),
                        color: color,
                        colorSIIA: color
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [aAnilloGeoJSON(coordsPts)]
                    }
                });
            }

            // 1. GLORIETA UNIVERSITARIA UABCS (Acceso Principal)
            const gLat = 24.10234, gLng = -110.31456;
            addUrb(poligonoCircular(gLat, gLng, 22, 24), 0, 0.22, "#f8fafc", "Guarnición Exterior Glorieta");
            addUrb(poligonoCircular(gLat, gLng, 19.5, 24), 0, 0.28, "#334155", "Arroyo Vehicular Glorieta");
            addUrb(poligonoCircular(gLat, gLng, 10.2, 20), 0, 0.55, "#ffffff", "Guarnición Interior Glorieta");
            addUrb(poligonoCircular(gLat, gLng, 8.8, 20), 0, 0.75, "#16a34a", "Jardín Central Glorieta");
            addUrb(poligonoCircular(gLat, gLng, 2.5, 12), 0.75, 3.4, "#facc15", "Monumento Central Glorieta");

            // 2. CAMELLÓN CENTRAL DEL BULEVAR DE ENTRADA (Glorieta -> Arco de Entrada AD-59)
            const camellonEntrada = [
                [24.10248, -110.31442],
                [24.10243, -110.31437],
                [24.10388, -110.31268],
                [24.10393, -110.31273]
            ];
            addUrb(camellonEntrada, 0, 0.35, "#ffffff", "Camellón Bulevar Entrada");

            // Palmeras/Árboles 3D a lo largo del Camellón de Entrada
            for (let i = 1; i <= 6; i++) {
                const t = i / 7;
                const pLat = 24.10246 + (24.10390 - 24.10246) * t;
                const pLng = -110.31440 + (-110.31270 - (-110.31440)) * t;
                addUrb(poligonoCircular(pLat, pLng, 0.9, 8), 0.35, 3.6, "#78350f", "Tronco Palmera");
                addUrb(poligonoCircular(pLat, pLng, 3.2, 10), 3.3, 5.8, "#15803d", "Copa Palmera");
            }

            // 3. EXPLANADA OCRE JUNTO A LA GLORIETA Y BIBLIOTECA (visible en la maqueta SIIA 3D)
            const explanadaOcre = rect(24.10205, -110.31502, 0.00024, 0.00032);
            addUrb(escalarPoligono(explanadaOcre, 1.08, 1.08), 0, 0.18, "#f8fafc", "Borde Explanada");
            addUrb(explanadaOcre, 0.18, 0.32, "#d97706", "Explanada Ocre SIIA");

            // 4. PLAZA DE LOS 3 EDIFICIOS ROJOS CON FUENTE/JARDINERA CIRCULAR (CSH-02 / CMT-03)
            const pRojaLat = 24.10118, pRojaLng = -110.31495;
            addUrb(rect(pRojaLat, pRojaLng, 0.00026, 0.00028), 0, 0.22, "#e2e8f0", "Plaza Central Edificios Rojos");
            addUrb(poligonoCircular(pRojaLat, pRojaLng, 5.8, 16), 0.22, 0.75, "#ffffff", "Fuente / Jardinera Circular");
            addUrb(poligonoCircular(pRojaLat, pRojaLng, 4.2, 16), 0.75, 0.95, "#16a34a", "Jardín Central");

            // 5. PLAZA DE JARDINERAS VERDES EN CUADRÍCULA (Zona DIIP CSH-43 y Humanidades II CSH-44)
            const jBaseLat = 24.10225, jBaseLng = -110.31332;
            addUrb(rect(jBaseLat, jBaseLng, 0.00036, 0.00038), 0, 0.20, "#f1f5f9", "Andador DIIP y Humanidades");
            [-0.00009, 0.00009].forEach(function (dLat) {
                [-0.00010, 0, 0.00010].forEach(function (dLng) {
                    addUrb(rect(jBaseLat + dLat, jBaseLng + dLng, 0.00009, 0.00007), 0.20, 0.68, "#16a34a", "Jardinera SIIA");
                });
            });

            // 6. CORREDOR Y PÉRGOLA TECHADA 3D DEL DASC (Conectando DSC-39, DSC-46 y Nuevo DASC)
            const andadorDasc = rect(24.10248, -110.31627, 0.00078, 0.00007);
            addUrb(andadorDasc, 0, 0.25, "#cbd5e1", "Andador Central Sistemas DASC");
            addUrb(escalarPoligono(andadorDasc, 1.0, 0.65), 3.2, 3.7, "#f8fafc", "Pasillo Techado DASC");

            // 7. TECHOS DE PANELES SOLARES EN ESTACIONAMIENTOS UNIVERSITARIOS (Flotantes a 2.8m)
            const solares = [
                rect(24.10292, -110.31626, 0.00011, 0.00032),
                rect(24.10155, -110.31642, 0.00011, 0.00034),
                rect(24.10185, -110.31495, 0.00011, 0.00030)
            ];
            solares.forEach(function (sol) {
                addUrb(escalarPoligono(sol, 0.25, 0.90), 0, 2.8, "#64748b", "Estructura Soporte Solar");
                addUrb(sol, 2.8, 3.4, "#1e3a8a", "Domo de Paneles Solares Fotovoltaicos");
            });

            return {
                type: "FeatureCollection",
                features: feats
            };
        },

        /** Puntos centrales en GeoJSON para etiquetas flotantes en el mapa 2D/3D */
        geojsonEtiquetas: function () {
            const self = this;
            return {
                type: "FeatureCollection",
                features: this.edificios.map(function (e, idx) {
                    const c = self.centroDe(e);
                    return {
                        type: "Feature",
                        id: idx,
                        properties: {
                            id: e.id,
                            clave: e.clave || "",
                            codigoMapa: e.clave || "UABCS",
                            nombre: e.nombre,
                            categoria: e.categoria,
                            sedeEvento: e.sedeEvento || ""
                        },
                        geometry: { type: "Point", coordinates: [c[1], c[0]] }
                    };
                })
            };
        }
    };
})();

