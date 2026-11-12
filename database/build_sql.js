/**
 * database/build_sql.js
 * Genera el archivo SQL relacional (database/uabcs_dasc.sql) y la base de datos SQLite
 * (database/uabcs_dasc.sqlite) con todos los horarios oficiales de Ingeniería en Desarrollo de Software (IDS)
 * extraídos de: https://www.uabcs.mx/dasc/estudiantes/horarios/horarios-ingenieria-en-desarrollo-de-software/
 * Dividido en las tablas normalizadas: salones, maestros, materias, horarios y usuarios.
 */

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const DB_DIR = __dirname;
const SQL_FILE_PATH = path.join(DB_DIR, "uabcs_dasc.sql");
const SQLITE_FILE_PATH = path.join(DB_DIR, "uabcs_dasc.sqlite");

// 1. Catálogo de Salones y Laboratorios del DASC (DSC-39 y DSC-46)
const salones = [
  {
    id: 1,
    codigo: "LAB A",
    nombre: "Laboratorio A de Cómputo y Programación",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Baja",
    tipo: "Laboratorio de Cómputo",
    capacidad: 35,
    equipamiento: "35 PCs Dual-Boot Windows/Linux, Proyector HD, Red Gigabit RIUABCS, Aire Acondicionado",
    descripcion: "Laboratorio principal de programación estructurada, metodología de la programación y concursos de algoritmos."
  },
  {
    id: 2,
    codigo: "LAB F",
    nombre: "Laboratorio F de Desarrollo de Software",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Baja",
    tipo: "Laboratorio de Cómputo",
    capacidad: 35,
    equipamiento: "35 Estaciones de trabajo, IDE Visual Studio / IntelliJ / VS Code, Proyector interactivo",
    descripcion: "Laboratorio enfocado en taller de programación, programación orientada a objetos y bases de datos."
  },
  {
    id: 3,
    codigo: "LAB G",
    nombre: "Laboratorio G de Ingeniería Web y Multimedia",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Alta",
    tipo: "Laboratorio de Cómputo",
    capacidad: 35,
    equipamiento: "35 Equipos de alto rendimiento, Servidores locales de prueba, Pantalla de proyección",
    descripcion: "Laboratorio empleado para Programación Web, Programación II y desarrollo de proyectos full-stack."
  },
  {
    id: 4,
    codigo: "LR",
    nombre: "Laboratorio de Redes y Telecomunicaciones (LR)",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Baja",
    tipo: "Laboratorio de Redes",
    capacidad: 30,
    equipamiento: "Racks de ruteadores y switches Cisco, cableado estructurado Cat 6A, analizadores de red y simuladores Packet Tracer",
    descripcion: "Laboratorio especializado en Redes I, enrutamiento, conmutación, ciberseguridad e infraestructura de telecomunicaciones."
  },
  {
    id: 5,
    codigo: "T1",
    nombre: "Taller 1 de Sistemas Computacionales (T1)",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Alta",
    tipo: "Taller Especializado",
    capacidad: 36,
    equipamiento: "Mesas colaborativas con tomas eléctricas, proyector láser, pizarrón de cristal, Wi-Fi de alta densidad",
    descripcion: "Aula-taller para Ingeniería de Software I, Base de Datos II, Diseño de Interfaces y Teoría de la Computación."
  },
  {
    id: 6,
    codigo: "T2",
    nombre: "Taller 2 de Inteligencia Artificial y Calidad (T2)",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Alta",
    tipo: "Taller Especializado",
    capacidad: 36,
    equipamiento: "Mesas de trabajo grupal, conectividad de red para laptops, pantalla inteligente y sistema de audio",
    descripcion: "Aula-taller de semestres avanzados (7° IDS) para Inteligencia Artificial, Sistemas Operativos y Calidad del Software."
  },
  {
    id: 7,
    codigo: "SC2-JAVA",
    nombre: "Salón SC2 - JAVA",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Baja",
    tipo: "Aula de Clase",
    capacidad: 40,
    equipamiento: "Proyector multimedia, pizarrón blanco, climatización y nodos eléctricos para portátiles",
    descripcion: "Aula teórica-práctica del Edificio DASC (DSC-39) asignada principalmente a 5° Semestre IDS Turno Matutino Grupo B."
  },
  {
    id: 8,
    codigo: "SC5-PROLOG",
    nombre: "Salón SC5 - PROLOG",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Alta",
    tipo: "Aula de Clase",
    capacidad: 40,
    equipamiento: "Proyector multimedia, pizarrón acrílico, climatización y cobertura Wi-Fi RIUABCS",
    descripcion: "Aula teórica del Edificio DASC (DSC-39) asignada a 3° Semestre IDS Turno Vespertino."
  },
  {
    id: 9,
    codigo: "SC10-ASSEMBLY",
    nombre: "Salón SC10 - ASSEMBLY",
    edificio_id: "dsc-46",
    edificio_codigo: "DSC-46",
    planta: "Planta Baja",
    tipo: "Aula de Clase",
    capacidad: 42,
    equipamiento: "Proyector HD, pizarrón panorámico, butacas ergonómicas y red inalámbrica",
    descripcion: "Aula del Edificio Sistemas II (DSC-46) asignada a 1° Semestre IDS Turno Matutino Grupo B."
  },
  {
    id: 10,
    codigo: "SC12-DELPHI",
    nombre: "Salón SC12 - DELPHI",
    edificio_id: "dsc-46",
    edificio_codigo: "DSC-46",
    planta: "Planta Baja",
    tipo: "Aula de Clase",
    capacidad: 40,
    equipamiento: "Pantalla de proyección, audio ambiental, contactos eléctricos y climatización",
    descripcion: "Aula del Edificio Sistemas II (DSC-46) asignada a 7° Semestre IDS Turno Vespertino."
  },
  {
    id: 11,
    codigo: "SC13-ALGOL",
    nombre: "Salón SC13 - ALGOL",
    edificio_id: "dsc-46",
    edificio_codigo: "DSC-46",
    planta: "Planta Baja",
    tipo: "Aula de Clase",
    capacidad: 40,
    equipamiento: "Proyector digital, pizarrón doble, climatización y red RIUABCS",
    descripcion: "Aula del Edificio Sistemas II (DSC-46) asignada a 5° Semestre IDS Turno Vespertino."
  },
  {
    id: 12,
    codigo: "SC15-FORTRAN",
    nombre: "Salón SC15 - FORTRAN",
    edificio_id: "dsc-46",
    edificio_codigo: "DSC-46",
    planta: "Planta Alta",
    tipo: "Aula de Clase",
    capacidad: 42,
    equipamiento: "Proyector multimedia, pizarrón blanco, climatización e iluminación LED",
    descripcion: "Aula del Edificio Sistemas II (DSC-46) asignada a 1° Semestre IDS Turno Matutino Grupo A."
  },
  {
    id: 13,
    codigo: "SC16-RUST",
    nombre: "Salón SC16 - RUST",
    edificio_id: "dsc-46",
    edificio_codigo: "DSC-46",
    planta: "Planta Alta",
    tipo: "Aula de Clase",
    capacidad: 42,
    equipamiento: "Proyector interactivo, conectores eléctricos, climatización y Wi-Fi institucional",
    descripcion: "Aula del Edificio Sistemas II (DSC-46) asignada a 3° IDS Matutino A y 1° IDS Vespertino A."
  },
  {
    id: 14,
    codigo: "SC17-KOTLIN",
    nombre: "Salón SC17 - KOTLIN",
    edificio_id: "dsc-46",
    edificio_codigo: "DSC-46",
    planta: "Planta Alta",
    tipo: "Aula de Clase",
    capacidad: 42,
    equipamiento: "Proyector HD, pizarrón de gran formato, climatización y red RIUABCS",
    descripcion: "Aula del Edificio Sistemas II (DSC-46) asignada a 3° IDS Matutino B y 1° IDS Vespertino B."
  },
  {
    id: 15,
    codigo: "ALAN-TURING",
    nombre: "Aula de Usos Múltiples 'Alan Turing'",
    edificio_id: "dsc-39",
    edificio_codigo: "DSC-39",
    planta: "Planta Baja",
    tipo: "Sala de Usos Múltiples",
    capacidad: 75,
    equipamiento: "Sistema de videoconferencia, pantalla gigante, sonido envolvente y mesas modulares para hackathons",
    descripcion: "Recinto del DASC para inauguraciones, defensas de tesis, conferencias, Game Jam y talleres magistrales."
  },
  {
    id: 16,
    codigo: "VIRTUAL",
    nombre: "Aula Virtual Institucional (UABCS en Línea)",
    edificio_id: "ad-65",
    edificio_codigo: "AD-65",
    planta: "Modalidad Virtual",
    tipo: "Plataforma en Línea",
    capacidad: 100,
    equipamiento: "Plataforma Moodle enlinea.uabcs.mx, Google Meet Institucional y Repositorios Git",
    descripcion: "Sesiones síncronas virtuales respaldadas por el Centro de Tecnologías de la Información y Comunicaciones (CTIC AD-65)."
  },
  {
    id: 17,
    codigo: "ASÍNCRONA",
    nombre: "Modalidad Asíncrona (Plataforma DASC)",
    edificio_id: "ad-65",
    edificio_codigo: "AD-65",
    planta: "Modalidad Virtual",
    tipo: "Plataforma en Línea",
    capacidad: 100,
    equipamiento: "Entorno Virtual de Aprendizaje enlinea.uabcs.mx y entrega de prácticas en línea",
    descripcion: "Actividades de aprendizaje autónomo y seguimiento de proyectos en línea."
  }
];

// 2. Catálogo de Maestros (Docentes reales de los horarios de IDS + Representantes Principales Sandoval y Leyva)
const maestros = [
  {
    id: 1,
    nombre: "Dr. Jesús Andrés Sandoval Bringas",
    grado: "Dr.",
    correo: "sandoval@uabcs.mx",
    cargo: "Jefe del Departamento Académico de Sistemas Computacionales (Representante Principal DASC)",
    oficina: "Jefatura del Departamento DASC (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 09:00 - 14:00 y 17:00 - 19:00 hrs",
    es_representante: 1
  },
  {
    id: 2,
    nombre: "M.T.I. Amado Alejandro Leyva Carrillo",
    grado: "M.T.I.",
    correo: "aleyva@uabcs.mx",
    cargo: "Responsable de Carrera de Ingeniería en Desarrollo de Software y Prácticas Profesionales (Representante Principal IDS)",
    oficina: "Oficina de Coordinación IDS y Prácticas Profesionales (Edificio DSC-39, Planta Baja)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 08:30 - 13:30 hrs",
    es_representante: 1
  },
  {
    id: 3,
    nombre: "Prof. Arturo Villegas Fimbres",
    grado: "M.C.",
    correo: "avillegas@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Ciencias Básicas y Matemáticas",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 08:30 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 4,
    nombre: "Lic. Itzia Lucía Serna Monge",
    grado: "Lic.",
    correo: "iserna@uabcs.mx",
    cargo: "Docente DASC · Comunicación y Expresión Oral y Escrita",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes, Miércoles y Viernes 10:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 5,
    nombre: "Lic. Marisol Méndez Ramírez",
    grado: "Lic.",
    correo: "m.mendez@uabcs.mx",
    cargo: "Profesora - Investigadora · Lenguas Extranjeras aplicadas a TI",
    oficina: "Coordinación DELE (Edificio AD-18) / Cubículos DASC",
    edificio_id: "ad-18",
    horario_atencion: "Lunes a Viernes 08:30 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 6,
    nombre: "M.C. Miriam Maray Carreño León",
    grado: "M.C.",
    correo: "marayc@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Programación y Desarrollo",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Jueves 11:30 - 14:00 hrs",
    es_representante: 0
  },
  {
    id: 7,
    nombre: "Dr. Óscar Reséndiz Pacheco",
    grado: "Dr.",
    correo: "oresendiz@uabcs.mx",
    cargo: "Profesor - Investigador · Física y Ciencias de Ingeniería",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Miércoles y Viernes 08:30 - 10:30 hrs",
    es_representante: 0
  },
  {
    id: 8,
    nombre: "Dr. Jonathan Giovanni Soto Muñoz",
    grado: "Dr.",
    correo: "jsoto@uabcs.mx",
    cargo: "Profesor - Investigador Tiempo Completo · Desarrollo Web y Metodología",
    oficina: "Cubículo Docente (Edificio DSC-46 Sistemas II, Planta Alta)",
    edificio_id: "dsc-46",
    horario_atencion: "Lunes a Viernes 11:30 - 14:00 hrs",
    es_representante: 0
  },
  {
    id: 9,
    nombre: "M.C. Samuel Montané Baños",
    grado: "M.C.",
    correo: "s.montane@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Tecnologías de la Información",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Viernes 08:30 - 11:00 hrs",
    es_representante: 0
  },
  {
    id: 10,
    nombre: "Ing. Sergio Hernández Casas",
    grado: "Ing.",
    correo: "shernandez@uabcs.mx",
    cargo: "Docente DASC · Matemáticas Aplicadas",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes, Miércoles y Jueves 10:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 11,
    nombre: "Ing. Orel Octavio Romero Espinoza",
    grado: "Ing.",
    correo: "o.romero@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Taller de Programación",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Martes 11:30 - 13:30 hrs",
    es_representante: 0
  },
  {
    id: 12,
    nombre: "Ing. Iván Alexis Cota",
    grado: "Ing.",
    correo: "icota@uabcs.mx",
    cargo: "Docente DASC · Base de Datos y Metodología de la Programación",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes a Jueves 08:30 - 11:30 hrs",
    es_representante: 0
  },
  {
    id: 13,
    nombre: "Dr. Israel Murillo",
    grado: "Dr.",
    correo: "imurillo@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Física y Formación Disciplinaria",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 08:30 - 11:00 hrs",
    es_representante: 0
  },
  {
    id: 14,
    nombre: "Lic. Verónica Carrillo y Carrillo",
    grado: "Lic.",
    correo: "vcarrillo@uabcs.mx",
    cargo: "Profesora - Investigadora · Inglés Técnico",
    oficina: "Edificio de Idiomas DELE (AD-18)",
    edificio_id: "ad-18",
    horario_atencion: "Lunes a Jueves 17:30 - 19:30 hrs",
    es_representante: 0
  },
  {
    id: 15,
    nombre: "Lic. Antonio Geraldo Lucero",
    grado: "Lic.",
    correo: "ageraldolu@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Expresión Oral y Escrita",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Miércoles y Viernes 17:30 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 16,
    nombre: "Ing. Gilberto Ulises León Carballo",
    grado: "Ing.",
    correo: "gleon@uabcs.mx",
    cargo: "Docente DASC · Introducción a las Tecnologías de la Información",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes, Jueves y Viernes 17:30 - 19:30 hrs",
    es_representante: 0
  },
  {
    id: 17,
    nombre: "Ing. Dhailane Soto del Río",
    grado: "Ing.",
    correo: "dsoto@uabcs.mx",
    cargo: "Docente DASC · Metodología y Taller de Programación",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Jueves 17:30 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 18,
    nombre: "Lic. Diego Cota",
    grado: "Lic.",
    correo: "dcota@uabcs.mx",
    cargo: "Docente DASC · Expresión Oral y Desarrollo con RSU",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Jueves 16:00 - 17:30 hrs",
    es_representante: 0
  },
  {
    id: 19,
    nombre: "Ing. César Taylor",
    grado: "Ing.",
    correo: "ctaylor@uabcs.mx",
    cargo: "Docente DASC · Estructura de Datos y Algoritmos",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes, Martes y Viernes 10:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 20,
    nombre: "M.C. David Alonso Valdez Sánchez",
    grado: "M.C.",
    correo: "dvaldez@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Probabilidad y Estadística",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 10:00 - 13:00 hrs",
    es_representante: 0
  },
  {
    id: 21,
    nombre: "M.C. Brenda Cecilia Lara Rubio",
    grado: "M.C.",
    correo: "b.lara@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Programación Web y Orientada a Objetos",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 10:00 - 13:00 hrs",
    es_representante: 0
  },
  {
    id: 22,
    nombre: "Lic. Francisco Martínez Monge",
    grado: "Lic.",
    correo: "fmartinez@uabcs.mx",
    cargo: "Docente DASC · Responsabilidad Social Universitaria (RSU)",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Miércoles 08:30 - 10:00 hrs",
    es_representante: 0
  },
  {
    id: 23,
    nombre: "Ing. Alán Saúl Escobar Ortega",
    grado: "Ing.",
    correo: "a.escobar@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Paradigmas Tecnológicos",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Miércoles y Viernes 10:00 - 11:30 hrs",
    es_representante: 0
  },
  {
    id: 24,
    nombre: "M.C. Elvia Esthela Aispuro Félix",
    grado: "M.C.",
    correo: "aispuro@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Programación II",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes, Jueves y Viernes 10:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 25,
    nombre: "M.C. Rafael Alberto Cosío Castro",
    grado: "M.C.",
    correo: "r.cosio@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Paradigmas Tecnológicos",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Viernes 13:00 - 14:30 hrs",
    es_representante: 0
  },
  {
    id: 26,
    nombre: "M.C. Nelson Eduardo Olachea Urías",
    grado: "M.C.",
    correo: "nolachea@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Álgebra Lineal y Matemáticas",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Miércoles 08:30 - 10:00 hrs",
    es_representante: 0
  },
  {
    id: 27,
    nombre: "M.C. Perla Elena Richi Buenrostro",
    grado: "M.C.",
    correo: "richi@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Estructura de Datos",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes a Viernes 10:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 28,
    nombre: "M.C. Carlos Sandoval Bringas",
    grado: "M.C.",
    correo: "csandoval@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Desarrollo de Tecnología con RSU",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes 17:30 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 29,
    nombre: "Ing. Antonio Arce Aguilar",
    grado: "Ing.",
    correo: "aarce@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Programación II",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes, Miércoles y Jueves 19:00 - 20:00 hrs",
    es_representante: 0
  },
  {
    id: 30,
    nombre: "M.C. Jaime Eudes Castro Campos",
    grado: "M.C.",
    correo: "je.castro@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Álgebra Lineal",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Miércoles 18:00 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 31,
    nombre: "Dra. Rosa Isela Hirales Cota",
    grado: "Dra.",
    correo: "rhirales@uabcs.mx",
    cargo: "Profesora - Investigadora · Probabilidad y Estadística",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Jueves y Viernes 17:30 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 32,
    nombre: "M.C. Jesús Antonio Zúñiga Arce",
    grado: "M.C.",
    correo: "jzuniga@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Base de Datos II y Programación Web",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 10:00 - 13:00 hrs",
    es_representante: 0
  },
  {
    id: 33,
    nombre: "Dra. Italia Estrada Cota",
    grado: "Dra.",
    correo: "iestrada@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Ingeniería de Software I",
    oficina: "Cubículo Docente (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 11:30 - 14:00 hrs",
    es_representante: 0
  },
  {
    id: 34,
    nombre: "Dr. Israel Durán Encinas",
    grado: "Dr.",
    correo: "iduran@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Diseño de Interfaces UI/UX y Prácticas Profesionales",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes a Viernes 10:00 - 13:00 hrs",
    es_representante: 0
  },
  {
    id: 35,
    nombre: "M.C. Martín Agúndez Amador",
    grado: "M.C.",
    correo: "magundez@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Teoría de la Computación",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Miércoles y Viernes 11:30 - 13:00 hrs",
    es_representante: 0
  },
  {
    id: 36,
    nombre: "M.C. Germán Ernesto Ochoa Manríquez",
    grado: "M.C.",
    correo: "gochoa@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Redes de Computadoras y Telecomunicaciones",
    oficina: "Área de Redes / Cubículos DASC (Edificio DSC-39, Planta Baja)",
    edificio_id: "dsc-39",
    horario_atencion: "Jueves y Viernes 10:00 - 11:30 hrs",
    es_representante: 0
  },
  {
    id: 37,
    nombre: "Ing. Guadalupe Eridani Lucero Cota",
    grado: "Ing.",
    correo: "glucero@uabcs.mx",
    cargo: "Docente DASC · Ingeniería de Software I",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Miércoles 10:00 - 11:30 hrs",
    es_representante: 0
  },
  {
    id: 38,
    nombre: "M.C. Nelson Israel Higuera Castillo",
    grado: "M.C.",
    correo: "nhiguera@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Sistemas Operativos y Teoría de la Computación",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 08:30 - 11:30 hrs",
    es_representante: 0
  },
  {
    id: 39,
    nombre: "Ing. Rafael de Luna",
    grado: "Ing.",
    correo: "rdeluna@uabcs.mx",
    cargo: "Docente DASC · Redes de Computadoras I",
    oficina: "Laboratorio de Redes LR (Edificio DSC-39, Planta Baja)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Jueves 11:30 - 13:00 hrs",
    es_representante: 0
  },
  {
    id: 40,
    nombre: "M.C. Ángel de Jesús Ojeda Castro",
    grado: "M.C.",
    correo: "aj.ojeda@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Base de Datos II y Formación Disciplinaria",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 17:30 - 19:30 hrs",
    es_representante: 0
  },
  {
    id: 41,
    nombre: "Ing. Ángel de Jesús Romero Verdugo",
    grado: "Ing.",
    correo: "a.romero@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Redes I y Telecomunicaciones",
    oficina: "Área de Redes LR (Edificio DSC-39, Planta Baja)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Jueves 18:00 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 42,
    nombre: "M.C. Teresita de Jesús Álvarez Robles",
    grado: "M.C.",
    correo: "tj.alvarez@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Diseño de Interfaces de Usuario",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Miércoles y Viernes 16:00 - 17:30 hrs",
    es_representante: 0
  },
  {
    id: 43,
    nombre: "Ing. Emmanuel Romero Quintero",
    grado: "Ing.",
    correo: "em.romero@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Formación Disciplinaria I",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Miércoles 08:30 - 10:00 hrs",
    es_representante: 0
  },
  {
    id: 44,
    nombre: "M.C. Aída Sánchez Paz Rubio",
    grado: "M.C.",
    correo: "a.sanchez@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Calidad del Software",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes, Miércoles y Viernes 10:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 45,
    nombre: "Dra. Viviana Flores Herrera",
    grado: "Dra.",
    correo: "v.flores@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Inteligencia Artificial",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Viernes 09:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 46,
    nombre: "M.C. Alán Joaquín Baeza Meza",
    grado: "M.C.",
    correo: "ajbaeza@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Ciberseguridad",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Jueves 08:30 - 10:00 hrs",
    es_representante: 0
  },
  {
    id: 47,
    nombre: "Ing. Julián Cadena",
    grado: "Ing.",
    correo: "jcadena@uabcs.mx",
    cargo: "Docente DASC · Formación Disciplinaria I",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Jueves 10:00 - 11:30 hrs",
    es_representante: 0
  },
  {
    id: 48,
    nombre: "M.C. Iván Francisco Contreras Torres",
    grado: "M.C.",
    correo: "if.contreras@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Formulación y Evaluación de Proyectos",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Jueves 10:00 - 12:00 hrs",
    es_representante: 0
  },
  {
    id: 49,
    nombre: "M.C. Ángeles Araceli Ojeda Lira",
    grado: "M.C.",
    correo: "aojeda@uabcs.mx",
    cargo: "Docente DASC · Formulación y Evaluación de Proyectos",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Jueves 17:30 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 50,
    nombre: "Ing. Miguel Parra García",
    grado: "Ing.",
    correo: "mparra@uabcs.mx",
    cargo: "Docente DASC · Formación Disciplinaria I",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes y Jueves 17:30 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 51,
    nombre: "M.C. Víctor Samuel Urbina Rodarte",
    grado: "M.C.",
    correo: "v.urbina@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Formación Disciplinaria II",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Miércoles 17:30 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 52,
    nombre: "M.C. Ricardo Luis Ignacio Sánchez",
    grado: "M.C.",
    correo: "rignacio@uabcs.mx",
    cargo: "Profesor - Investigador DASC · Ciberseguridad",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Martes y Viernes 18:00 - 19:00 hrs",
    es_representante: 0
  },
  {
    id: 53,
    nombre: "Dra. Andrea Margarita de Anda Trasviña",
    grado: "Dra.",
    correo: "anda@uabcs.mx",
    cargo: "Profesora - Investigadora DASC · Inteligencia Artificial",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Miércoles y Viernes 16:00 - 17:30 hrs",
    es_representante: 0
  },
  {
    id: 54,
    nombre: "M.C. Patricia Alejandra Martínez Sánchez",
    grado: "M.C.",
    correo: "pmartinez@uabcs.mx",
    cargo: "Docente DASC · Formación Disciplinar V",
    oficina: "Cubículos de Maestros DASC (Edificio DSC-39)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes a Miércoles 08:30 - 10:00 hrs",
    es_representante: 0
  },
  {
    id: 55,
    nombre: "M.C. Mónica Adriana Carreño León",
    grado: "M.C.",
    correo: "mcarreno@uabcs.mx",
    cargo: "Profesora - Investigadora Tiempo Completo · Proyectos de Software y Bases de Datos",
    oficina: "Cubículo Docente (Edificio DSC-39, Planta Alta)",
    edificio_id: "dsc-39",
    horario_atencion: "Lunes, Miércoles y Jueves 10:00 - 12:30 hrs",
    es_representante: 0
  }
];

// 3. Catálogo de Materias Oficiales de Ingeniería en Desarrollo de Software (IDS)
const materias = [
  // 1° Semestre IDS
  { id: 1, codigo: "IDS-101", nombre: "Matemáticas 1", semestre: 1, creditos: 6, area: "Ciencias Básicas" },
  { id: 2, codigo: "IDS-102", nombre: "Introducción a las TI", semestre: 1, creditos: 6, area: "Tecnologías de la Información" },
  { id: 3, codigo: "IDS-103", nombre: "Expresión Oral y Escrita", semestre: 1, creditos: 5, area: "Formación General" },
  { id: 4, codigo: "IDS-104", nombre: "Inglés I", semestre: 1, creditos: 5, area: "Lenguas Extranjeras" },
  { id: 5, codigo: "IDS-105", nombre: "Taller de Prog. (A)", semestre: 1, creditos: 7, area: "Programación" },
  { id: 6, codigo: "IDS-106", nombre: "Física", semestre: 1, creditos: 6, area: "Ciencias Básicas" },
  { id: 7, codigo: "IDS-107", nombre: "Metodología de la Programación", semestre: 1, creditos: 7, area: "Programación" },

  // 3° Semestre IDS
  { id: 8, codigo: "IDS-301", nombre: "Estructura de Datos 1", semestre: 3, creditos: 7, area: "Algoritmia y Software" },
  { id: 9, codigo: "IDS-302", nombre: "Probabilidad y Estadística", semestre: 3, creditos: 6, area: "Ciencias Básicas" },
  { id: 10, codigo: "IDS-303", nombre: "Programación 2 (A)", semestre: 3, creditos: 7, area: "Programación" },
  { id: 11, codigo: "IDS-304", nombre: "Álgebra Lineal", semestre: 3, creditos: 6, area: "Ciencias Básicas" },
  { id: 12, codigo: "IDS-305", nombre: "Desarrollo de Tecnología con RSU", semestre: 3, creditos: 5, area: "Formación Integral" },
  { id: 13, codigo: "IDS-306", nombre: "Paradigmas Tecnológicos", semestre: 3, creditos: 6, area: "Ingeniería de Software" },
  { id: 14, codigo: "IDS-307", nombre: "Inglés 3", semestre: 3, creditos: 5, area: "Lenguas Extranjeras" },

  // 5° Semestre IDS
  { id: 15, codigo: "IDS-501", nombre: "Base de Datos 2", semestre: 5, creditos: 7, area: "Datos e Información" },
  { id: 16, codigo: "IDS-502", nombre: "Programación Web", semestre: 5, creditos: 7, area: "Desarrollo Web" },
  { id: 17, codigo: "IDS-503", nombre: "Ingeniería de Software 1", semestre: 5, creditos: 7, area: "Ingeniería de Software" },
  { id: 18, codigo: "IDS-504", nombre: "Diseño de Interfaces de Usuario", semestre: 5, creditos: 6, area: "UI/UX y Frontend" },
  { id: 19, codigo: "IDS-505", nombre: "Teoría de la Computación", semestre: 5, creditos: 6, area: "Ciencias de la Computación" },
  { id: 20, codigo: "IDS-506", nombre: "Redes 1 (A)", semestre: 5, creditos: 7, area: "Redes y Telecomunicaciones" },

  // 7° Semestre IDS
  { id: 21, codigo: "IDS-701", nombre: "Formación Disciplinaria 1", semestre: 7, creditos: 6, area: "Especialidad IDS" },
  { id: 22, codigo: "IDS-702", nombre: "Formación Disciplinaria 2", semestre: 7, creditos: 6, area: "Especialidad IDS" },
  { id: 23, codigo: "IDS-703", nombre: "Calidad del Software", semestre: 7, creditos: 6, area: "Ingeniería de Software" },
  { id: 24, codigo: "IDS-704", nombre: "Inteligencia Artificial", semestre: 7, creditos: 7, area: "Sistemas Inteligentes" },
  { id: 25, codigo: "IDS-705", nombre: "Ciberseguridad", semestre: 7, creditos: 6, area: "Seguridad Informática" },
  { id: 26, codigo: "IDS-706", nombre: "Formulación y Evaluación de Proyectos", semestre: 7, creditos: 6, area: "Gestión TI" },
  { id: 27, codigo: "IDS-707", nombre: "Sistemas Operativos", semestre: 7, creditos: 6, area: "Infraestructura y Sistemas" },

  // 9° Semestre IDS
  { id: 28, codigo: "IDS-901", nombre: "Formación Disciplinar V", semestre: 9, creditos: 6, area: "Especialidad Terminal" },
  { id: 29, codigo: "IDS-902", nombre: "Desarrollo de un Proyecto de Software", semestre: 9, creditos: 8, area: "Titulación e Integración" },
  { id: 30, codigo: "IDS-903", nombre: "Prácticas Profesionales", semestre: 9, creditos: 10, area: "Vinculación Profesional" },
  { id: 31, codigo: "IDS-904", nombre: "Temas Selectos de TIC", semestre: 9, creditos: 6, area: "Actualización Tecnológica" }
];

// Mapas auxiliares por código/nombre para insertar horarios de forma legible y exacta
const salonByCode = Object.fromEntries(salones.map((s) => [s.codigo, s.id]));
function getSalonId(code) {
  const id = salonByCode[code];
  if (!id) throw new Error("Salón no encontrado: " + code);
  return id;
}

function getMateriaId(name) {
  const m = materias.find((x) => x.nombre.toLowerCase() === name.toLowerCase());
  if (!m) throw new Error("Materia no encontrada: " + name);
  return m.id;
}

function getMaestroId(substr) {
  const p = maestros.find((x) => x.nombre.toLowerCase().includes(substr.toLowerCase()));
  if (!p) throw new Error("Maestro no encontrado: " + substr);
  return p.id;
}

// Función para registrar bloques de horario
const horariosRows = [];
function addClass(semestre, turno, grupo, dia, bloque, materiaName, maestroKey, salonCode, subgrupo = null) {
  const [hora_inicio, hora_fin] = bloque.split(" - ").map((s) => s.trim());
  horariosRows.push({
    periodo: "2026-II",
    semestre,
    turno,
    grupo,
    dia,
    hora_inicio,
    hora_fin,
    bloque_horario: bloque,
    materia_id: getMateriaId(materiaName),
    maestro_id: getMaestroId(maestroKey),
    salon_id: getSalonId(salonCode),
    subgrupo
  });
}

// =========================================================================
// CARGA DE LOS 12 HORARIOS OFICIALES DE IDS (PERIODO 2026-II)
// Fuente: https://www.uabcs.mx/dasc/estudiantes/horarios/horarios-ingenieria-en-desarrollo-de-software/
// =========================================================================

// --- 1° IDS | Turno Matutino | Grupo A (1-IDS-TM-A) ---
addClass(1, "Matutino", "A", "Lunes", "07:00 - 08:30", "Matemáticas 1", "Villegas Fimbres", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Lunes", "08:30 - 10:00", "Introducción a las TI", "Leyva Carrillo", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Lunes", "10:00 - 11:30", "Expresión Oral y Escrita", "Serna Monge", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Martes", "07:00 - 08:30", "Matemáticas 1", "Villegas Fimbres", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Martes", "08:30 - 10:00", "Inglés I", "Méndez Ramírez", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Martes", "10:00 - 11:30", "Taller de Prog. (A)", "Miriam Maray Carreño", "LAB A");
addClass(1, "Matutino", "A", "Miércoles", "07:00 - 08:30", "Física", "Reséndiz Pacheco", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Miércoles", "08:30 - 10:00", "Inglés I", "Méndez Ramírez", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Miércoles", "10:00 - 11:30", "Taller de Prog. (A)", "Miriam Maray Carreño", "LAB A");
addClass(1, "Matutino", "A", "Jueves", "07:00 - 08:30", "Matemáticas 1", "Villegas Fimbres", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Jueves", "08:30 - 10:00", "Introducción a las TI", "Leyva Carrillo", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Jueves", "10:00 - 11:30", "Metodología de la Programación", "Jonathan Giovanni Soto", "LAB A");
addClass(1, "Matutino", "A", "Viernes", "07:00 - 08:30", "Física", "Reséndiz Pacheco", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Viernes", "08:30 - 10:00", "Expresión Oral y Escrita", "Serna Monge", "SC15-FORTRAN");
addClass(1, "Matutino", "A", "Viernes", "10:00 - 11:30", "Metodología de la Programación", "Jonathan Giovanni Soto", "LAB A");

// --- 1° IDS | Turno Matutino | Grupo B (1-IDS-TM-B) ---
addClass(1, "Matutino", "B", "Lunes", "07:00 - 08:30", "Introducción a las TI", "Montané Baños", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Lunes", "08:30 - 10:00", "Matemáticas 1", "Hernández Casas", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Lunes", "10:00 - 11:30", "Taller de Prog. (A)", "Orel Octavio Romero", "LAB F");
addClass(1, "Matutino", "B", "Martes", "08:30 - 10:00", "Expresión Oral y Escrita", "Serna Monge", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Martes", "10:00 - 11:30", "Metodología de la Programación", "Iván Alexis Cota", "LAB F");
addClass(1, "Matutino", "B", "Martes", "11:30 - 13:00", "Taller de Prog. (A)", "Orel Octavio Romero", "LAB A");
addClass(1, "Matutino", "B", "Miércoles", "07:00 - 08:30", "Matemáticas 1", "Hernández Casas", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Miércoles", "08:30 - 10:00", "Expresión Oral y Escrita", "Serna Monge", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Miércoles", "10:00 - 11:30", "Metodología de la Programación", "Iván Alexis Cota", "LAB F");
addClass(1, "Matutino", "B", "Jueves", "07:00 - 08:30", "Física", "Israel Murillo", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Jueves", "08:30 - 10:00", "Inglés I", "Méndez Ramírez", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Jueves", "10:00 - 11:30", "Matemáticas 1", "Hernández Casas", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Viernes", "07:00 - 08:30", "Física", "Israel Murillo", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Viernes", "08:30 - 10:00", "Introducción a las TI", "Montané Baños", "SC10-ASSEMBLY");
addClass(1, "Matutino", "B", "Viernes", "10:00 - 11:30", "Inglés I", "Méndez Ramírez", "SC10-ASSEMBLY");

// --- 1° IDS | Turno Vespertino | Grupo A (1-IDS-TV-A) ---
addClass(1, "Vespertino", "A", "Lunes", "16:00 - 17:30", "Inglés I", "Verónica Carrillo", "SC16-RUST");
addClass(1, "Vespertino", "A", "Lunes", "17:30 - 19:00", "Taller de Prog. (A)", "Miriam Maray Carreño", "LAB F");
addClass(1, "Vespertino", "A", "Lunes", "19:00 - 20:30", "Matemáticas 1", "Villegas Fimbres", "SC16-RUST");
addClass(1, "Vespertino", "A", "Martes", "16:00 - 17:30", "Metodología de la Programación", "Jonathan Giovanni Soto", "LAB A");
addClass(1, "Vespertino", "A", "Martes", "17:30 - 19:00", "Inglés I", "Verónica Carrillo", "SC16-RUST");
addClass(1, "Vespertino", "A", "Martes", "19:00 - 20:30", "Matemáticas 1", "Villegas Fimbres", "SC16-RUST");
addClass(1, "Vespertino", "A", "Miércoles", "16:00 - 17:30", "Expresión Oral y Escrita", "Antonio Geraldo Lucero", "SC16-RUST");
addClass(1, "Vespertino", "A", "Miércoles", "17:30 - 19:00", "Taller de Prog. (A)", "Miriam Maray Carreño", "LAB F");
addClass(1, "Vespertino", "A", "Miércoles", "19:00 - 20:30", "Matemáticas 1", "Villegas Fimbres", "SC16-RUST");
addClass(1, "Vespertino", "A", "Jueves", "16:00 - 17:30", "Metodología de la Programación", "Jonathan Giovanni Soto", "LAB F");
addClass(1, "Vespertino", "A", "Jueves", "17:30 - 19:00", "Física", "Israel Murillo", "SC16-RUST");
addClass(1, "Vespertino", "A", "Jueves", "19:00 - 20:30", "Introducción a las TI", "León Carballo", "SC16-RUST");
addClass(1, "Vespertino", "A", "Viernes", "16:00 - 17:30", "Física", "Israel Murillo", "SC16-RUST");
addClass(1, "Vespertino", "A", "Viernes", "17:30 - 19:00", "Introducción a las TI", "León Carballo", "SC16-RUST");
addClass(1, "Vespertino", "A", "Viernes", "19:00 - 20:30", "Expresión Oral y Escrita", "Antonio Geraldo Lucero", "SC16-RUST");

// --- 1° IDS | Turno Vespertino | Grupo B (1-IDS-TV-B) ---
addClass(1, "Vespertino", "B", "Lunes", "16:00 - 17:30", "Metodología de la Programación", "Dhailane Soto", "LAB F");
addClass(1, "Vespertino", "B", "Lunes", "17:30 - 19:00", "Expresión Oral y Escrita", "Diego Cota", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Lunes", "19:00 - 20:30", "Matemáticas 1", "Hernández Casas", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Martes", "16:00 - 17:30", "Taller de Prog. (A)", "Dhailane Soto", "LAB F");
addClass(1, "Vespertino", "B", "Martes", "17:30 - 19:00", "Introducción a las TI", "León Carballo", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Martes", "19:00 - 20:30", "Física", "Israel Murillo", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Miércoles", "16:00 - 17:30", "Matemáticas 1", "Hernández Casas", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Miércoles", "17:30 - 19:00", "Inglés I", "Verónica Carrillo", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Miércoles", "19:00 - 20:30", "Metodología de la Programación", "Dhailane Soto", "LAB A");
addClass(1, "Vespertino", "B", "Jueves", "16:00 - 17:30", "Inglés I", "Verónica Carrillo", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Jueves", "17:30 - 19:00", "Expresión Oral y Escrita", "Diego Cota", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Jueves", "19:00 - 20:30", "Taller de Prog. (A)", "Dhailane Soto", "LAB A");
addClass(1, "Vespertino", "B", "Viernes", "16:00 - 17:30", "Introducción a las TI", "León Carballo", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Viernes", "17:30 - 19:00", "Física", "Israel Murillo", "SC17-KOTLIN");
addClass(1, "Vespertino", "B", "Viernes", "19:00 - 20:30", "Matemáticas 1", "Hernández Casas", "SC17-KOTLIN");

// --- 3° IDS | Turno Matutino | Grupo A (3-IDS-TM-A) ---
addClass(3, "Matutino", "A", "Lunes", "08:30 - 10:00", "Estructura de Datos 1", "César Taylor", "SC16-RUST");
addClass(3, "Matutino", "A", "Lunes", "10:00 - 11:30", "Probabilidad y Estadística", "David Alonso Valdez", "SC16-RUST");
addClass(3, "Matutino", "A", "Lunes", "11:30 - 13:00", "Programación 2 (A)", "Brenda Cecilia Lara", "LAB G");
addClass(3, "Matutino", "A", "Martes", "08:30 - 10:00", "Álgebra Lineal", "Leyva Carrillo", "SC16-RUST");
addClass(3, "Matutino", "A", "Martes", "10:00 - 11:30", "Estructura de Datos 1", "César Taylor", "SC16-RUST");
addClass(3, "Matutino", "A", "Martes", "11:30 - 13:00", "Probabilidad y Estadística", "David Alonso Valdez", "SC16-RUST");
addClass(3, "Matutino", "A", "Miércoles", "07:00 - 08:30", "Desarrollo de Tecnología con RSU", "Francisco Martínez Monge", "SC16-RUST");
addClass(3, "Matutino", "A", "Miércoles", "08:30 - 10:00", "Paradigmas Tecnológicos", "Alán Saúl Escobar", "SC16-RUST");
addClass(3, "Matutino", "A", "Miércoles", "10:00 - 11:30", "Inglés 3", "Méndez Ramírez", "SC16-RUST");
addClass(3, "Matutino", "A", "Jueves", "08:30 - 10:00", "Programación 2 (A)", "Brenda Cecilia Lara", "LAB G");
addClass(3, "Matutino", "A", "Jueves", "10:00 - 11:30", "Inglés 3", "Méndez Ramírez", "SC16-RUST");
addClass(3, "Matutino", "A", "Jueves", "11:30 - 13:00", "Álgebra Lineal", "Leyva Carrillo", "SC16-RUST");
addClass(3, "Matutino", "A", "Viernes", "08:30 - 10:00", "Paradigmas Tecnológicos", "Alán Saúl Escobar", "SC16-RUST");
addClass(3, "Matutino", "A", "Viernes", "10:00 - 11:30", "Estructura de Datos 1", "César Taylor", "SC16-RUST");
addClass(3, "Matutino", "A", "Viernes", "11:30 - 13:00", "Programación 2 (A)", "Brenda Cecilia Lara", "LAB G");

// --- 3° IDS | Turno Matutino | Grupo B (3-IDS-TM-B) ---
addClass(3, "Matutino", "B", "Lunes", "08:30 - 10:00", "Programación 2 (A)", "Aispuro Félix", "LAB F");
addClass(3, "Matutino", "B", "Lunes", "10:00 - 11:30", "Inglés 3", "Méndez Ramírez", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Lunes", "11:30 - 13:00", "Paradigmas Tecnológicos", "Cosío Castro", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Martes", "07:00 - 08:30", "Álgebra Lineal", "Olachea Urías", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Martes", "08:30 - 10:00", "Estructura de Datos 1", "Richi Buenrostro", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Martes", "10:00 - 11:30", "Inglés 3", "Méndez Ramírez", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Miércoles", "07:00 - 08:30", "Álgebra Lineal", "Olachea Urías", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Miércoles", "08:30 - 10:00", "Estructura de Datos 1", "Richi Buenrostro", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Miércoles", "10:00 - 11:30", "Desarrollo de Tecnología con RSU", "Diego Cota", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Jueves", "08:30 - 10:00", "Programación 2 (A)", "Aispuro Félix", "LAB F");
addClass(3, "Matutino", "B", "Jueves", "10:00 - 11:30", "Estructura de Datos 1", "Richi Buenrostro", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Jueves", "11:30 - 13:00", "Probabilidad y Estadística", "David Alonso Valdez", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Viernes", "08:30 - 10:00", "Probabilidad y Estadística", "David Alonso Valdez", "SC17-KOTLIN");
addClass(3, "Matutino", "B", "Viernes", "10:00 - 11:30", "Programación 2 (A)", "Aispuro Félix", "LAB F");
addClass(3, "Matutino", "B", "Viernes", "11:30 - 13:00", "Paradigmas Tecnológicos", "Cosío Castro", "SC17-KOTLIN");

// --- 3° IDS | Turno Vespertino | Grupo A (3-IDS-TV) ---
addClass(3, "Vespertino", "A", "Lunes", "16:00 - 17:30", "Desarrollo de Tecnología con RSU", "Carlos Sandoval Bringas", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Lunes", "17:30 - 19:00", "Programación 2 (A)", "Antonio Arce", "LAB A");
addClass(3, "Vespertino", "A", "Lunes", "19:00 - 20:30", "Álgebra Lineal", "Jaime Eudes Castro", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Martes", "16:00 - 17:30", "Estructura de Datos 1", "Richi Buenrostro", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Martes", "17:30 - 19:00", "Paradigmas Tecnológicos", "Cosío Castro", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Martes", "19:00 - 20:30", "Inglés 3", "Verónica Carrillo", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Miércoles", "16:00 - 17:30", "Estructura de Datos 1", "Richi Buenrostro", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Miércoles", "17:30 - 19:00", "Programación 2 (A)", "Antonio Arce", "LAB A");
addClass(3, "Vespertino", "A", "Miércoles", "19:00 - 20:30", "Álgebra Lineal", "Jaime Eudes Castro", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Jueves", "16:00 - 17:30", "Probabilidad y Estadística", "Rosa Isela Hirales", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Jueves", "17:30 - 19:00", "Programación 2 (A)", "Antonio Arce", "LAB F");
addClass(3, "Vespertino", "A", "Jueves", "19:00 - 20:30", "Inglés 3", "Verónica Carrillo", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Viernes", "16:00 - 17:30", "Probabilidad y Estadística", "Rosa Isela Hirales", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Viernes", "17:30 - 19:00", "Estructura de Datos 1", "Richi Buenrostro", "SC5-PROLOG");
addClass(3, "Vespertino", "A", "Viernes", "19:00 - 20:30", "Paradigmas Tecnológicos", "Cosío Castro", "SC5-PROLOG");

// --- 5° IDS | Turno Matutino | Grupo A (5-IDS-TM-A) ---
addClass(5, "Matutino", "A", "Lunes", "08:30 - 10:00", "Base de Datos 2", "Zúñiga Arce", "T1");
addClass(5, "Matutino", "A", "Lunes", "10:00 - 11:30", "Programación Web", "Brenda Cecilia Lara", "LAB G");
addClass(5, "Matutino", "A", "Lunes", "11:30 - 13:00", "Ingeniería de Software 1", "Italia Estrada Cota", "T1");
addClass(5, "Matutino", "A", "Martes", "08:30 - 10:00", "Diseño de Interfaces de Usuario", "Israel Durán Encinas", "T1");
addClass(5, "Matutino", "A", "Martes", "10:00 - 11:30", "Ingeniería de Software 1", "Italia Estrada Cota", "T1");
addClass(5, "Matutino", "A", "Martes", "11:30 - 13:00", "Programación Web", "Brenda Cecilia Lara", "LAB G");
addClass(5, "Matutino", "A", "Miércoles", "08:30 - 10:00", "Programación Web", "Brenda Cecilia Lara", "LAB G");
addClass(5, "Matutino", "A", "Miércoles", "10:00 - 11:30", "Teoría de la Computación", "Martín Agúndez Amador", "T1");
addClass(5, "Matutino", "A", "Miércoles", "11:30 - 13:00", "Base de Datos 2", "Zúñiga Arce", "T1");
addClass(5, "Matutino", "A", "Jueves", "08:30 - 10:00", "Base de Datos 2", "Zúñiga Arce", "T1");
addClass(5, "Matutino", "A", "Jueves", "10:00 - 11:30", "Diseño de Interfaces de Usuario", "Israel Durán Encinas", "T1");
addClass(5, "Matutino", "A", "Jueves", "11:30 - 13:00", "Redes 1 (A)", "Ochoa Manríquez", "LR");
addClass(5, "Matutino", "A", "Viernes", "08:30 - 10:00", "Teoría de la Computación", "Martín Agúndez Amador", "T1");
addClass(5, "Matutino", "A", "Viernes", "10:00 - 11:30", "Ingeniería de Software 1", "Italia Estrada Cota", "T1");
addClass(5, "Matutino", "A", "Viernes", "11:30 - 13:00", "Redes 1 (A)", "Ochoa Manríquez", "LR");

// --- 5° IDS | Turno Matutino | Grupo B (5-IDS-TM-B) ---
addClass(5, "Matutino", "B", "Lunes", "08:30 - 10:00", "Ingeniería de Software 1", "Guadalupe Eridani Lucero", "SC2-JAVA");
addClass(5, "Matutino", "B", "Lunes", "10:00 - 11:30", "Teoría de la Computación", "Nelson Israel Higuera", "SC2-JAVA");
addClass(5, "Matutino", "B", "Lunes", "11:30 - 13:00", "Redes 1 (A)", "Rafael de Luna", "LR");
addClass(5, "Matutino", "B", "Martes", "07:00 - 08:30", "Base de Datos 2", "Iván Alexis Cota", "SC2-JAVA");
addClass(5, "Matutino", "B", "Martes", "08:30 - 10:00", "Programación Web", "Zúñiga Arce", "LAB G");
addClass(5, "Matutino", "B", "Martes", "10:00 - 11:30", "Diseño de Interfaces de Usuario", "Israel Durán Encinas", "SC2-JAVA");
addClass(5, "Matutino", "B", "Miércoles", "07:00 - 08:30", "Base de Datos 2", "Iván Alexis Cota", "SC2-JAVA");
addClass(5, "Matutino", "B", "Miércoles", "08:30 - 10:00", "Diseño de Interfaces de Usuario", "Israel Durán Encinas", "SC2-JAVA");
addClass(5, "Matutino", "B", "Miércoles", "10:00 - 11:30", "Teoría de la Computación", "Nelson Israel Higuera", "SC2-JAVA");
addClass(5, "Matutino", "B", "Miércoles", "11:30 - 13:00", "Ingeniería de Software 1", "Guadalupe Eridani Lucero", "SC2-JAVA");
addClass(5, "Matutino", "B", "Jueves", "08:30 - 10:00", "Base de Datos 2", "Iván Alexis Cota", "SC2-JAVA");
addClass(5, "Matutino", "B", "Jueves", "10:00 - 11:30", "Redes 1 (A)", "Rafael de Luna", "LR");
addClass(5, "Matutino", "B", "Jueves", "11:30 - 13:00", "Programación Web", "Zúñiga Arce", "LAB G");
addClass(5, "Matutino", "B", "Viernes", "08:30 - 10:00", "Ingeniería de Software 1", "Guadalupe Eridani Lucero", "ASÍNCRONA");
addClass(5, "Matutino", "B", "Viernes", "10:00 - 11:30", "Programación Web", "Zúñiga Arce", "ASÍNCRONA");

// --- 5° IDS | Turno Vespertino | Grupo A (5-IDS-TV) ---
addClass(5, "Vespertino", "A", "Lunes", "16:00 - 17:30", "Programación Web", "Jonathan Giovanni Soto", "LAB G");
addClass(5, "Vespertino", "A", "Lunes", "17:30 - 19:00", "Base de Datos 2", "Ángel de Jesús Ojeda", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Lunes", "19:00 - 20:30", "Teoría de la Computación", "Martín Agúndez Amador", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Martes", "16:00 - 17:30", "Ingeniería de Software 1", "Italia Estrada Cota", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Martes", "17:30 - 19:00", "Programación Web", "Jonathan Giovanni Soto", "LAB G");
addClass(5, "Vespertino", "A", "Martes", "19:00 - 20:30", "Redes 1 (A)", "Romero Verdugo", "LR");
addClass(5, "Vespertino", "A", "Miércoles", "16:00 - 17:30", "Diseño de Interfaces de Usuario", "Teresita de Jesús Álvarez", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Miércoles", "17:30 - 19:00", "Teoría de la Computación", "Martín Agúndez Amador", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Miércoles", "19:00 - 20:30", "Ingeniería de Software 1", "Italia Estrada Cota", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Jueves", "16:00 - 17:30", "Ingeniería de Software 1", "Italia Estrada Cota", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Jueves", "17:30 - 19:00", "Base de Datos 2", "Ángel de Jesús Ojeda", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Jueves", "19:00 - 20:30", "Redes 1 (A)", "Romero Verdugo", "LR");
addClass(5, "Vespertino", "A", "Viernes", "16:00 - 17:30", "Programación Web", "Jonathan Giovanni Soto", "LAB G");
addClass(5, "Vespertino", "A", "Viernes", "17:30 - 19:00", "Diseño de Interfaces de Usuario", "Teresita de Jesús Álvarez", "SC13-ALGOL");
addClass(5, "Vespertino", "A", "Viernes", "19:00 - 20:30", "Base de Datos 2", "Ángel de Jesús Ojeda", "SC13-ALGOL");

// --- 7° IDS | Turno Matutino | Grupo A (7-IDS-TM) ---
addClass(7, "Matutino", "A", "Lunes", "07:00 - 08:30", "Formación Disciplinaria 1", "Emmanuel Romero Quintero", "T2", "Grupo 1");
addClass(7, "Matutino", "A", "Lunes", "07:00 - 08:30", "Formación Disciplinaria 2", "Israel Murillo", "T1", "Grupo 2");
addClass(7, "Matutino", "A", "Lunes", "08:30 - 10:00", "Calidad del Software", "Aída Sánchez", "T2");
addClass(7, "Matutino", "A", "Lunes", "10:00 - 11:30", "Inteligencia Artificial", "Viviana Flores", "T2");
addClass(7, "Matutino", "A", "Martes", "07:00 - 08:30", "Ciberseguridad", "Alán Joaquín Baeza", "VIRTUAL");
addClass(7, "Matutino", "A", "Martes", "08:30 - 10:00", "Formación Disciplinaria 2", "Viviana Flores", "VIRTUAL", "Grupo 1");
addClass(7, "Matutino", "A", "Martes", "08:30 - 10:00", "Formación Disciplinaria 1", "Julián Cadena", "VIRTUAL", "Grupo 2");
addClass(7, "Matutino", "A", "Martes", "10:00 - 11:30", "Formulación y Evaluación de Proyectos", "Iván Francisco Contreras", "VIRTUAL");
addClass(7, "Matutino", "A", "Miércoles", "07:00 - 08:30", "Sistemas Operativos", "Nelson Israel Higuera", "T2");
addClass(7, "Matutino", "A", "Miércoles", "08:30 - 10:00", "Formación Disciplinaria 1", "Emmanuel Romero Quintero", "T2", "Grupo 1");
addClass(7, "Matutino", "A", "Miércoles", "08:30 - 10:00", "Formación Disciplinaria 2", "Israel Murillo", "T1", "Grupo 2");
addClass(7, "Matutino", "A", "Miércoles", "10:00 - 11:30", "Calidad del Software", "Aída Sánchez", "T2");
addClass(7, "Matutino", "A", "Jueves", "07:00 - 08:30", "Ciberseguridad", "Alán Joaquín Baeza", "VIRTUAL");
addClass(7, "Matutino", "A", "Jueves", "08:30 - 10:00", "Formulación y Evaluación de Proyectos", "Iván Francisco Contreras", "VIRTUAL");
addClass(7, "Matutino", "A", "Jueves", "10:00 - 11:30", "Formación Disciplinaria 2", "Viviana Flores", "VIRTUAL", "Grupo 1");
addClass(7, "Matutino", "A", "Jueves", "10:00 - 11:30", "Formación Disciplinaria 1", "Julián Cadena", "VIRTUAL", "Grupo 2");
addClass(7, "Matutino", "A", "Viernes", "07:00 - 08:30", "Sistemas Operativos", "Nelson Israel Higuera", "T2");
addClass(7, "Matutino", "A", "Viernes", "08:30 - 10:00", "Inteligencia Artificial", "Viviana Flores", "T2");
addClass(7, "Matutino", "A", "Viernes", "10:00 - 11:30", "Calidad del Software", "Aída Sánchez", "T2");

// --- 7° IDS | Turno Vespertino | Grupo A (7-IDS-TV) ---
addClass(7, "Vespertino", "A", "Lunes", "16:00 - 17:30", "Sistemas Operativos", "Nelson Israel Higuera", "VIRTUAL");
addClass(7, "Vespertino", "A", "Lunes", "17:30 - 19:00", "Formulación y Evaluación de Proyectos", "Ángeles Araceli Ojeda", "VIRTUAL");
addClass(7, "Vespertino", "A", "Lunes", "19:00 - 20:30", "Formación Disciplinaria 1", "Miguel Parra García", "VIRTUAL", "Grupo 1");
addClass(7, "Vespertino", "A", "Lunes", "19:00 - 20:30", "Formación Disciplinaria 1", "Julián Cadena", "VIRTUAL", "Grupo 2");
addClass(7, "Vespertino", "A", "Martes", "16:00 - 17:30", "Calidad del Software", "Aída Sánchez", "SC12-DELPHI");
addClass(7, "Vespertino", "A", "Martes", "17:30 - 19:00", "Formación Disciplinaria 2", "Ángel de Jesús Ojeda", "SC12-DELPHI", "Grupo 1");
addClass(7, "Vespertino", "A", "Martes", "17:30 - 19:00", "Formación Disciplinaria 2", "Víctor Samuel Urbina", "SC12-DELPHI", "Grupo 2");
addClass(7, "Vespertino", "A", "Martes", "19:00 - 20:30", "Ciberseguridad", "Ricardo Luis Ignacio", "SC12-DELPHI");
addClass(7, "Vespertino", "A", "Miércoles", "16:00 - 17:30", "Calidad del Software", "Aída Sánchez", "SC12-DELPHI");
addClass(7, "Vespertino", "A", "Miércoles", "17:30 - 19:00", "Inteligencia Artificial", "Andrea Margarita de Anda", "SC12-DELPHI");
addClass(7, "Vespertino", "A", "Miércoles", "19:00 - 20:30", "Formación Disciplinaria 2", "Ángel de Jesús Ojeda", "SC12-DELPHI", "Grupo 1");
addClass(7, "Vespertino", "A", "Miércoles", "19:00 - 20:30", "Formación Disciplinaria 2", "Víctor Samuel Urbina", "SC12-DELPHI", "Grupo 2");
addClass(7, "Vespertino", "A", "Jueves", "16:00 - 17:30", "Sistemas Operativos", "Nelson Israel Higuera", "VIRTUAL");
addClass(7, "Vespertino", "A", "Jueves", "17:30 - 19:00", "Formación Disciplinaria 1", "Miguel Parra García", "VIRTUAL", "Grupo 1");
addClass(7, "Vespertino", "A", "Jueves", "17:30 - 19:00", "Formación Disciplinaria 1", "Julián Cadena", "VIRTUAL", "Grupo 2");
addClass(7, "Vespertino", "A", "Jueves", "19:00 - 20:30", "Formulación y Evaluación de Proyectos", "Ángeles Araceli Ojeda", "VIRTUAL");
addClass(7, "Vespertino", "A", "Viernes", "16:00 - 17:30", "Calidad del Software", "Aída Sánchez", "SC12-DELPHI");
addClass(7, "Vespertino", "A", "Viernes", "17:30 - 19:00", "Inteligencia Artificial", "Andrea Margarita de Anda", "SC12-DELPHI");
addClass(7, "Vespertino", "A", "Viernes", "19:00 - 20:30", "Ciberseguridad", "Ricardo Luis Ignacio", "SC12-DELPHI");

// --- 9° IDS | Turno Matutino | Grupo A (9-IDS-TM) ---
addClass(9, "Matutino", "A", "Lunes", "08:30 - 10:00", "Formación Disciplinar V", "Brenda Cecilia Lara", "VIRTUAL", "Grupo 1");
addClass(9, "Matutino", "A", "Lunes", "08:30 - 10:00", "Formación Disciplinar V", "Patricia Alejandra Martínez", "VIRTUAL", "Grupo 2");
addClass(9, "Matutino", "A", "Lunes", "10:00 - 11:30", "Desarrollo de un Proyecto de Software", "Mónica Adriana Carreño", "VIRTUAL");
addClass(9, "Matutino", "A", "Martes", "07:00 - 08:30", "Prácticas Profesionales", "Leyva Carrillo", "VIRTUAL");
addClass(9, "Matutino", "A", "Martes", "08:30 - 10:00", "Formación Disciplinar V", "Brenda Cecilia Lara", "VIRTUAL", "Grupo 1");
addClass(9, "Matutino", "A", "Martes", "08:30 - 10:00", "Formación Disciplinar V", "Patricia Alejandra Martínez", "VIRTUAL", "Grupo 2");
addClass(9, "Matutino", "A", "Martes", "10:00 - 11:30", "Temas Selectos de TIC", "Jesús Andrés Sandoval", "VIRTUAL");
addClass(9, "Matutino", "A", "Miércoles", "08:30 - 10:00", "Temas Selectos de TIC", "Jesús Andrés Sandoval", "VIRTUAL");
addClass(9, "Matutino", "A", "Miércoles", "10:00 - 11:30", "Desarrollo de un Proyecto de Software", "Mónica Adriana Carreño", "VIRTUAL");
addClass(9, "Matutino", "A", "Jueves", "10:00 - 11:30", "Desarrollo de un Proyecto de Software", "Mónica Adriana Carreño", "VIRTUAL");
addClass(9, "Matutino", "A", "Viernes", "07:00 - 08:30", "Prácticas Profesionales", "Leyva Carrillo", "VIRTUAL");
addClass(9, "Matutino", "A", "Viernes", "08:30 - 10:00", "Prácticas Profesionales", "Leyva Carrillo", "VIRTUAL");
addClass(9, "Matutino", "A", "Viernes", "10:00 - 11:30", "Prácticas Profesionales", "Leyva Carrillo", "VIRTUAL");
addClass(9, "Matutino", "A", "Viernes", "11:30 - 13:00", "Prácticas Profesionales", "Leyva Carrillo", "VIRTUAL");

// --- 9° IDS | Turno Vespertino | Grupo A (9-IDS-TV) ---
addClass(9, "Vespertino", "A", "Lunes", "16:00 - 17:30", "Temas Selectos de TIC", "Jesús Andrés Sandoval", "VIRTUAL");
addClass(9, "Vespertino", "A", "Lunes", "17:30 - 19:00", "Formación Disciplinar V", "Brenda Cecilia Lara", "VIRTUAL", "Grupo 1");
addClass(9, "Vespertino", "A", "Lunes", "17:30 - 19:00", "Formación Disciplinar V", "Patricia Alejandra Martínez", "VIRTUAL", "Grupo 2");
addClass(9, "Vespertino", "A", "Martes", "17:30 - 19:00", "Temas Selectos de TIC", "Jesús Andrés Sandoval", "VIRTUAL");
addClass(9, "Vespertino", "A", "Martes", "19:00 - 20:30", "Desarrollo de un Proyecto de Software", "Jesús Andrés Sandoval", "VIRTUAL");
addClass(9, "Vespertino", "A", "Miércoles", "17:30 - 19:00", "Formación Disciplinar V", "Brenda Cecilia Lara", "VIRTUAL", "Grupo 1");
addClass(9, "Vespertino", "A", "Miércoles", "17:30 - 19:00", "Formación Disciplinar V", "Patricia Alejandra Martínez", "VIRTUAL", "Grupo 2");
addClass(9, "Vespertino", "A", "Miércoles", "19:00 - 20:30", "Prácticas Profesionales", "Israel Durán Encinas", "VIRTUAL");
addClass(9, "Vespertino", "A", "Jueves", "17:30 - 19:00", "Desarrollo de un Proyecto de Software", "Jesús Andrés Sandoval", "VIRTUAL");
addClass(9, "Vespertino", "A", "Jueves", "19:00 - 20:30", "Prácticas Profesionales", "Israel Durán Encinas", "VIRTUAL");
addClass(9, "Vespertino", "A", "Viernes", "16:00 - 17:30", "Prácticas Profesionales", "Israel Durán Encinas", "VIRTUAL");
addClass(9, "Vespertino", "A", "Viernes", "17:30 - 19:00", "Prácticas Profesionales", "Israel Durán Encinas", "VIRTUAL");
addClass(9, "Vespertino", "A", "Viernes", "19:00 - 20:30", "Prácticas Profesionales", "Israel Durán Encinas", "VIRTUAL");

// Función para escapar cadenas en SQL
function sqlStr(val) {
  if (val === null || val === undefined) return "NULL";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

// Construir el archivo .sql completo
const sqlLines = [
  "-- =====================================================================================",
  "-- BASE DE DATOS SQL: HORARIOS INGENIERÍA EN DESARROLLO DE SOFTWARE (IDS) - DASC UABCS",
  "-- Fuente oficial: https://www.uabcs.mx/dasc/estudiantes/horarios/horarios-ingenieria-en-desarrollo-de-software/",
  "-- Estructura normalizada dividida en: salones, maestros, materias, horarios y usuarios",
  "-- =====================================================================================",
  "",
  "PRAGMA foreign_keys = ON;",
  "",
  "DROP TABLE IF EXISTS horarios;",
  "DROP TABLE IF EXISTS materias;",
  "DROP TABLE IF EXISTS maestros;",
  "DROP TABLE IF EXISTS salones;",
  "DROP TABLE IF EXISTS usuarios;",
  "",
  "-- 1. Tabla de Salones y Laboratorios del DASC (DSC-39 y DSC-46)",
  "CREATE TABLE salones (",
  "  id INTEGER PRIMARY KEY,",
  "  codigo VARCHAR(30) UNIQUE NOT NULL,",
  "  nombre VARCHAR(120) NOT NULL,",
  "  edificio_id VARCHAR(40) NOT NULL,",
  "  edificio_codigo VARCHAR(20) NOT NULL,",
  "  planta VARCHAR(40) NOT NULL,",
  "  tipo VARCHAR(50) NOT NULL,",
  "  capacidad INTEGER DEFAULT 35,",
  "  equipamiento TEXT,",
  "  descripcion TEXT",
  ");",
  "",
  "-- 2. Tabla de Maestros (Docentes del DASC)",
  "CREATE TABLE maestros (",
  "  id INTEGER PRIMARY KEY,",
  "  nombre VARCHAR(120) UNIQUE NOT NULL,",
  "  grado VARCHAR(40),",
  "  correo VARCHAR(100),",
  "  cargo VARCHAR(160),",
  "  oficina VARCHAR(160),",
  "  edificio_id VARCHAR(40),",
  "  horario_atencion VARCHAR(100),",
  "  es_representante INTEGER DEFAULT 0",
  ");",
  "",
  "-- 3. Tabla de Materias (Plan de Estudios IDS)",
  "CREATE TABLE materias (",
  "  id INTEGER PRIMARY KEY,",
  "  codigo VARCHAR(30) UNIQUE NOT NULL,",
  "  nombre VARCHAR(120) NOT NULL,",
  "  semestre INTEGER NOT NULL,",
  "  creditos INTEGER DEFAULT 6,",
  "  area VARCHAR(80)",
  ");",
  "",
  "-- 4. Tabla Relacional de Horarios (Conecta Materia + Maestro + Salón por Semestre, Turno y Grupo)",
  "CREATE TABLE horarios (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  periodo VARCHAR(20) NOT NULL DEFAULT '2026-II',",
  "  semestre INTEGER NOT NULL,",
  "  turno VARCHAR(20) NOT NULL,",
  "  grupo VARCHAR(10) NOT NULL,",
  "  dia VARCHAR(20) NOT NULL,",
  "  hora_inicio VARCHAR(10) NOT NULL,",
  "  hora_fin VARCHAR(10) NOT NULL,",
  "  bloque_horario VARCHAR(25) NOT NULL,",
  "  materia_id INTEGER NOT NULL,",
  "  maestro_id INTEGER NOT NULL,",
  "  salon_id INTEGER NOT NULL,",
  "  subgrupo VARCHAR(30) DEFAULT NULL,",
  "  FOREIGN KEY (materia_id) REFERENCES materias(id),",
  "  FOREIGN KEY (maestro_id) REFERENCES maestros(id),",
  "  FOREIGN KEY (salon_id) REFERENCES salones(id)",
  ");",
  "",
  "-- 5. Tabla de Usuarios (Estudiantes con Correo Institucional, Contraseña, Semestre y Grupo)",
  "CREATE TABLE usuarios (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  correo VARCHAR(120) UNIQUE NOT NULL,",
  "  password_hash VARCHAR(255) NOT NULL,",
  "  nombre VARCHAR(120) NOT NULL,",
  "  semestre INTEGER NOT NULL DEFAULT 5,",
  "  turno VARCHAR(20) NOT NULL DEFAULT 'Matutino',",
  "  grupo VARCHAR(10) NOT NULL DEFAULT 'A',",
  "  rol VARCHAR(20) NOT NULL DEFAULT 'student',",
  "  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP",
  ");",
  "",
  "-- =====================================================================================",
  "-- INSERCIÓN DE SALONES",
  "-- ====================================================================================="
];

for (const s of salones) {
  sqlLines.push(
    `INSERT INTO salones (id, codigo, nombre, edificio_id, edificio_codigo, planta, tipo, capacidad, equipamiento, descripcion) VALUES (${s.id}, ${sqlStr(s.codigo)}, ${sqlStr(s.nombre)}, ${sqlStr(s.edificio_id)}, ${sqlStr(s.edificio_codigo)}, ${sqlStr(s.planta)}, ${sqlStr(s.tipo)}, ${s.capacidad}, ${sqlStr(s.equipamiento)}, ${sqlStr(s.descripcion)});`
  );
}

sqlLines.push(
  "",
  "-- =====================================================================================",
  "-- INSERCIÓN DE MAESTROS",
  "-- ====================================================================================="
);

for (const m of maestros) {
  sqlLines.push(
    `INSERT INTO maestros (id, nombre, grado, correo, cargo, oficina, edificio_id, horario_atencion, es_representante) VALUES (${m.id}, ${sqlStr(m.nombre)}, ${sqlStr(m.grado)}, ${sqlStr(m.correo)}, ${sqlStr(m.cargo)}, ${sqlStr(m.oficina)}, ${sqlStr(m.edificio_id)}, ${sqlStr(m.horario_atencion)}, ${m.es_representante});`
  );
}

sqlLines.push(
  "",
  "-- =====================================================================================",
  "-- INSERCIÓN DE MATERIAS",
  "-- ====================================================================================="
);

for (const mat of materias) {
  sqlLines.push(
    `INSERT INTO materias (id, codigo, nombre, semestre, creditos, area) VALUES (${mat.id}, ${sqlStr(mat.codigo)}, ${sqlStr(mat.nombre)}, ${mat.semestre}, ${mat.creditos}, ${sqlStr(mat.area)});`
  );
}

sqlLines.push(
  "",
  "-- =====================================================================================",
  "-- INSERCIÓN DE HORARIOS OFICIALES IDS (PERIODO 2026-II)",
  "-- ====================================================================================="
);

horariosRows.forEach((h, idx) => {
  sqlLines.push(
    `INSERT INTO horarios (id, periodo, semestre, turno, grupo, dia, hora_inicio, hora_fin, bloque_horario, materia_id, maestro_id, salon_id, subgrupo) VALUES (${idx + 1}, ${sqlStr(h.periodo)}, ${h.semestre}, ${sqlStr(h.turno)}, ${sqlStr(h.grupo)}, ${sqlStr(h.dia)}, ${sqlStr(h.hora_inicio)}, ${sqlStr(h.hora_fin)}, ${sqlStr(h.bloque_horario)}, ${h.materia_id}, ${h.maestro_id}, ${h.salon_id}, ${sqlStr(h.subgrupo)});`
  );
});

sqlLines.push(
  "",
  "-- =====================================================================================",
  "-- USUARIOS DE EJEMPLO (ESTUDIANTE Y ADMINISTRADOR)",
  "-- =====================================================================================",
  "INSERT INTO usuarios (correo, password_hash, nombre, semestre, turno, grupo, rol) VALUES ('alumno@alu.uabcs.mx', 'uabcs2026', 'Estudiante IDS DASC', 5, 'Matutino', 'A', 'student');",
  "INSERT INTO usuarios (correo, password_hash, nombre, semestre, turno, grupo, rol) VALUES ('admin@uabcs.mx', 'admin123', 'Coordinación DASC - UABCS', 5, 'Matutino', 'A', 'admin');",
  ""
);

const finalSql = sqlLines.join("\n");
fs.writeFileSync(SQL_FILE_PATH, finalSql, "utf8");

if (fs.existsSync(SQLITE_FILE_PATH)) {
  fs.unlinkSync(SQLITE_FILE_PATH);
}
const db = new DatabaseSync(SQLITE_FILE_PATH);
db.exec(finalSql);

const counts = {
  salones: db.prepare("SELECT COUNT(*) AS c FROM salones").get().c,
  maestros: db.prepare("SELECT COUNT(*) AS c FROM maestros").get().c,
  materias: db.prepare("SELECT COUNT(*) AS c FROM materias").get().c,
  horarios: db.prepare("SELECT COUNT(*) AS c FROM horarios").get().c,
  usuarios: db.prepare("SELECT COUNT(*) AS c FROM usuarios").get().c
};
console.log("Base de datos SQL generada exitosamente:", counts);
db.close();
