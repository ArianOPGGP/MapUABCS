/* ==========================================================================
   Panorámicas 360° (equirectangulares 2:1) de los Edificios del DASC (1..23)
   Compatible tanto como arreglo (window.PANORAMAS[0..22]) como configuración
   multi-escena directa de Pannellum (window.PANORAMAS.default / .scenes).
   ========================================================================== */
window.PANORAMAS = (function () {
  const nombres = {
    1: "LAB A · Laboratorio de Cómputo y Programación (DSC-39)",
    2: "LAB G · Ingeniería Web y Pasillo Central DASC",
    3: "LR · Sala de Redes y Telecomunicaciones (DSC-39)",
    4: "LAB-MOVIL · Laboratorio de Cómputo Móvil (DSC-46B)",
    5: "Acceso Principal y Jefatura DASC (DSC-39)",
    6: "COORD-IDS · Área de Cubículos Docentes (DSC-39)",
    7: "T2 / LAB-IA · Inteligencia Artificial y Calidad (DSC-39)",
    8: "SC15-FORTRAN · Patio Interior y Pasillo Oriente",
    9: "ALAN-TURING · Auditorio y Sala de Conferencias DASC",
    10: "LAB-EMB · Laboratorio de Sistemas Embebidos (DSC-46B)",
    11: "SC10-ASSEMBLY · Pasillo Superior Edificio DASC",
    12: "AULA-MAC · Laboratorio Multimedia y Diseño UX/UI (DSC-46)",
    13: "SC5-PROLOG · Terraza y Pasillo Planta Alta",
    14: "SC2-JAVA · Recepción y Salón SC2 - JAVA",
    15: "LAB B · Laboratorio de Bases de Datos y Macrocentro (DSC-46)",
    16: "SC16-RUST · Explanada y Corredor Sistemas II",
    17: "SC17-KOTLIN · Sala Departamental y Aula Kotlin",
    18: "LAB F · Laboratorio de Desarrollo de Software (DSC-39)",
    19: "T1 · Taller 1 de Sistemas Computacionales (DSC-39)",
    20: "LAB-HW · Laboratorio de Hardware y Robótica (DSC-46B)",
    21: "SC12-DELPHI · Área de Innovación Tecnológica",
    22: "SC13-ALGOL · Acceso a Talleres y Laboratorios",
    23: "Explanada Principal y Plaza del DASC"
  };

  const lista = [];
  const scenes = {};

  for (let i = 1; i <= 23; i++) {
    const nextId = String(i < 23 ? i + 1 : 1);
    const prevId = String(i > 1 ? i - 1 : 23);
    const archivoUrl = "./img/panoramas/" + i + ".jpg";
    const titulo = nombres[i] || "Escena " + i;

    lista.push({
      id: "escena-" + i,
      numero: i,
      titulo: titulo,
      descripcion:
        i === 1
          ? "Interior esférico 360° de laboratorios y aulas del DASC (Linux / Windows)."
          : "Recorrido virtual esférico 360° de instalaciones del Departamento de Sistemas Computacionales.",
      edificio: i === 12 || i === 15 || i === 16 ? "dasc-ii" : "dasc",
      archivo: archivoUrl,
      miniatura: archivoUrl
    });

    scenes[String(i)] = {
      title: titulo,
      hfov: 105,
      pitch: -2,
      yaw: 0,
      type: "equirectangular",
      panorama: archivoUrl,
      hotSpots: [
        {
          pitch: -6,
          yaw: 35,
          type: "scene",
          text: "Avanzar a: " + (nombres[Number(nextId)] || "Siguiente Aula"),
          sceneId: nextId
        },
        {
          pitch: -6,
          yaw: -145,
          type: "scene",
          text: "Regresar a: " + (nombres[Number(prevId)] || "Aula Anterior"),
          sceneId: prevId
        },
        {
          pitch: 4,
          yaw: -45,
          type: "info",
          text: titulo + " · Campus La Paz UABCS"
        }
      ]
    };
  }

  lista.default = {
    firstScene: "1",
    author: "Maps UABCS · DASC",
    sceneFadeDuration: 800,
    autoLoad: true,
    compass: true
  };
  lista.scenes = scenes;
  lista.lista = lista;

  return lista;
})();
