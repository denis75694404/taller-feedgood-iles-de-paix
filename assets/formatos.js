/* Formatos, cuadros y dibujos de cada herramienta: se muestran dentro de la ficha, sin abrir ningún documento aparte. */
(function () {
  const D = window.FG; if (!D) return;
  const H = c => D.herr.find(h => h.c === c);
  const filas = (n, cols, pre) => Array.from({ length: n }, (_, k) => [pre ? pre(k) : String(k + 1)].concat(Array(cols - 1).fill("")));
  const CAT = "Categorías: P productor o productora; T transformador o MPE; O organización; S servicio técnico o autoridad; C consumidor o comunidad educativa; A socio u ONG; E equipo del programa.";

  /* ---------- dibujos (SVG) ---------- */
  const T = (x, y, s, o) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${(o && o.fs) || 15}" font-weight="${(o && o.fw) || 700}" fill="${(o && o.c) || "#3d2520"}">${s}</text>`;
  const mesa = (x, y, col, nom) => `<g><circle cx="${x}" cy="${y}" r="46" fill="${col}" stroke="#3d2520" stroke-width="2"/>${T(x, y - 4, "Mesa", { c: "#fff", fs: 14 })}${T(x, y + 15, nom, { c: "#fff", fs: 14 })}</g>`;
  const FIG = {
    sala: { cap: "Distribución sugerida de la sala (día 1)", nota: "El día 2 se usan dos o tres mesas; los paneles del día 1 permanecen en la pared.",
      svg: `<svg viewBox="0 0 800 520" role="img" aria-label="Plano de la sala con seis mesas de colores">
        <rect x="4" y="4" width="792" height="512" rx="14" fill="#fffaf2" stroke="#3d2520" stroke-width="3"/>
        <rect x="250" y="16" width="300" height="34" rx="6" fill="#3d2520"/>${T(400, 39, "Pantalla y proyector", { c: "#fff" })}
        <rect x="16" y="80" width="34" height="360" rx="6" fill="#e9dcc8" stroke="#3d2520"/>
        <text x="38" y="260" text-anchor="middle" font-size="14" font-weight="700" fill="#3d2520" transform="rotate(-90 38 260)">Muro de cambios y paneles (H4, H5, H6, H9, H11, H12)</text>
        ${mesa(160, 140, "#E8742A", "Naranja")}${mesa(310, 140, "#4E8A3E", "Verde")}${mesa(460, 140, "#2F6DB5", "Azul")}
        ${mesa(160, 300, "#D9A400", "Amarilla")}${mesa(310, 300, "#B5532F", "Terracota")}${mesa(460, 300, "#7A4A9E", "Morada")}
        <rect x="560" y="90" width="220" height="270" rx="110" fill="none" stroke="#3d2520" stroke-dasharray="8 6" stroke-width="2"/>
        ${T(670, 215, "Área libre")}${T(670, 236, "Ronda de círculos", { fw: 400, fs: 14 })}${T(670, 254, "concéntricos", { fw: 400, fs: 14 })}
        <rect x="90" y="440" width="230" height="56" rx="8" fill="#f3e6d3" stroke="#3d2520"/>${T(205, 474, "Mesa de materiales")}
        <rect x="520" y="440" width="260" height="56" rx="8" fill="#f3e6d3" stroke="#3d2520"/>${T(650, 474, "Mesa de documentación")}
      </svg>` },
    tarjeta: { cap: "Modelo de tarjeta individual (media hoja A5)",
      svg: `<svg viewBox="0 0 800 420" role="img" aria-label="Tarjeta ¿Qué ha cambiado con el programa Feed Good?">
        <!--base-->
        <rect x="6" y="6" width="788" height="408" rx="18" fill="#fff" stroke="#B5532F" stroke-width="4"/>
        <rect x="6" y="6" width="788" height="70" rx="18" fill="#B5532F"/><rect x="6" y="50" width="788" height="26" fill="#B5532F"/>
        ${T(400, 50, "¿Qué ha cambiado con el programa Feed Good?", { c: "#fff", fs: 26 })}
        ${T(400, 108, "En ti, tu familia, tu organización, tu comunidad, tu chacra, lo que comes o lo que vendes.", { fw: 400, fs: 17 })}
        ${T(400, 132, "Puedes escribirlo o dibujarlo.", { fw: 400, fs: 17 })}
        <rect x="40" y="152" width="720" height="240" rx="10" fill="#fffaf2" stroke="#B5532F" stroke-width="2"/>
        <!--division--><path d="M50 152h700a10 10 0 0 1 10 10v34H40v-34a10 10 0 0 1 10-10z" fill="#F3E6D3" stroke="#B5532F" stroke-width="2"/>
        <line x1="400" y1="152" x2="400" y2="392" stroke="#B5532F" stroke-width="2"/>
        ${T(220, 182, "Antes", { fs: 22, c: "#B5532F" })}${T(580, 182, "Ahora", { fs: 22, c: "#B5532F" })}<!--/division-->
      </svg>` },
    circulos: { cap: "Dinámica de círculos concéntricos", nota: "Al parar la música, cada pareja comparte el cambio de su tarjeta (tres minutos). Se repite dos o tres veces.",
      svg: (() => { let p = ""; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
          p += `<circle cx="${400 + 190 * c}" cy="${220 + 170 * s}" r="16" fill="#E8742A"/><circle cx="${400 + 120 * c}" cy="${220 + 105 * s}" r="16" fill="#4E8A3E"/>`; }
        return `<svg viewBox="0 0 800 440" role="img" aria-label="Dos círculos de personas que giran en sentidos opuestos">
          <defs><marker id="fl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#3d2520"/></marker></defs>
          <ellipse cx="400" cy="220" rx="190" ry="170" fill="none" stroke="#E8742A" stroke-width="2" stroke-dasharray="6 6"/>
          <ellipse cx="400" cy="220" rx="120" ry="105" fill="none" stroke="#4E8A3E" stroke-width="2" stroke-dasharray="6 6"/>${p}
          <path d="M610 120 A230 205 0 0 0 520 40" fill="none" stroke="#3d2520" stroke-width="2.5" marker-end="url(#fl)"/>
          <path d="M470 160 A85 75 0 0 1 488 220" fill="none" stroke="#3d2520" stroke-width="2.5" marker-end="url(#fl)"/>
          ${T(400, 214, "Comparte", { fs: 18 })}${T(400, 236, "tu cambio", { fs: 18 })}
          <text x="625" y="70" font-size="15" font-weight="700" fill="#E8742A">Círculo exterior</text><text x="625" y="90" font-size="14" fill="#3d2520">gira en sentido antihorario</text>
          <text x="20" y="400" font-size="15" font-weight="700" fill="#4E8A3E">Círculo interior</text><text x="20" y="420" font-size="14" fill="#3d2520">gira en sentido horario</text>
        </svg>`; })() },
    muro: { cap: "Estructura del muro de cambios", nota: "Cada tarjeta lleva el código de su mesa (por ejemplo, M3) para la trazabilidad.",
      pasos: ["Escribe tu nombre en un pósit.", "Adhiérelo sobre la columna que quisieras profundizar o discutir.", "El facilitador menciona los nombres de los integrantes de cada grupo y se forman nuevos equipos para trabajar la siguiente herramienta."],
      svg: (() => { const C = [["R1", "Producción", "#4E8A3E"], ["R2", "Cadenas", "#E8742A"], ["R3", "Gobernanza", "#2F6DB5"], ["R4", "Incidencia", "#7A4A9E"], ["R5", "Sensibilización", "#D9A400"], ["R6", "Mujeres y jóvenes", "#B5532F"], ["", "Otros cambios", "#7d6b5d"]];
        let g = ""; C.forEach(([r, n, col], k) => { const x = 10 + k * 112;
          g += `<rect x="${x}" y="10" width="104" height="70" rx="8" fill="${col}"/>${T(x + 52, 40, r || "Otros", { c: "#fff", fs: 18 })}${T(x + 52, 62, r ? n : "cambios", { c: "#fff", fs: n.length > 12 ? 11 : 13 })}
          <rect x="${x}" y="88" width="104" height="300" rx="6" fill="#fffaf2" stroke="${col}" stroke-width="2"/>`;
          for (let j = 0; j < 3 - (k % 2); j++) g += `<rect x="${x + 12}" y="${104 + j * 74}" width="80" height="56" rx="4" fill="#FFF3C4" stroke="#c9b8a3" transform="rotate(${(j % 2 ? 2 : -2)} ${x + 52} ${132 + j * 74})"/>${T(x + 52, 137 + j * 74, "M" + ((k + j) % 6 + 1), { fs: 12, c: "#7d6b5d" })}`; });
        return `<svg viewBox="0 0 800 400" role="img" aria-label="Muro con siete columnas: R1 a R6 y otros cambios">${g}</svg>`; })() },
    arbol: { cap: "Árbol horizontal de causa y efecto", nota: "Se lee de izquierda a derecha. Las causas sensibles pueden ir en tarjetas anónimas.",
      svg: (() => { const box = (x, y, w, h, col, t1, t2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${col}" stroke="#3d2520" stroke-width="1.5"/>${T(x + w / 2, y + h / 2 - 4, t1, { c: "#fff", fs: 16 })}${T(x + w / 2, y + h / 2 + 16, t2, { c: "#fff", fs: 13, fw: 400 })}`;
        const ar = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3d2520" stroke-width="2.5" marker-end="url(#fa)"/>`;
        let s = `<svg viewBox="0 0 800 380" role="img" aria-label="Causas, resultado no alcanzado y consecuencias"><defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3d2520"/></marker></defs>`;
        [40, 150, 260].forEach((y, k) => { s += box(10, y, 200, 80, "#7d6b5d", "Causa " + (k + 1), "¿Por qué pasó?") + ar(212, y + 40, 290, 190) + box(590, y, 200, 80, "#2F6DB5", "Consecuencia " + (k + 1), "¿Qué provocó?") + ar(510, 190, 588, y + 40); });
        s += box(292, 120, 216, 140, "#B5532F", "Resultado esperado", "no alcanzado") + T(400, 236, "¿Qué esperábamos lograr", { c: "#fff", fs: 12, fw: 400 }) + T(400, 252, "que no se logró o solo en parte?", { c: "#fff", fs: 12, fw: 400 });
        s += T(110, 30, "CAUSAS", { fs: 14 }) + T(690, 30, "CONSECUENCIAS", { fs: 14 }) + "</svg>"; return s; })() },
    leyenda: { cap: "Leyenda de valoración con adhesivos de color",
      svg: `<svg viewBox="0 0 800 110" role="img" aria-label="Naranja relevancia alta, verde media, blanco baja">
        <circle cx="90" cy="55" r="34" fill="#E8742A" stroke="#3d2520" stroke-width="2"/><text x="140" y="62" font-size="22" font-weight="700" fill="#3d2520">Relevancia alta</text>
        <circle cx="360" cy="55" r="34" fill="#4E8A3E" stroke="#3d2520" stroke-width="2"/><text x="410" y="62" font-size="22" font-weight="700" fill="#3d2520">Relevancia media</text>
        <circle cx="630" cy="55" r="34" fill="#fff" stroke="#3d2520" stroke-width="2"/><text x="680" y="62" font-size="22" font-weight="700" fill="#3d2520">Baja</text></svg>` },
    foto: { cap: "Cómo nombrar cada fotografía",
      svg: `<svg viewBox="0 0 800 200" role="img" aria-label="FG, sesión, mesa y número: FG-S1.4-M3-01">
        ${[["FG", "programa", "#B5532F", 40], ["S1.4", "sesión", "#E8742A", 230], ["M3", "mesa", "#4E8A3E", 420], ["01", "número", "#2F6DB5", 610]].map(([a, b, c, x]) =>
          `<rect x="${x}" y="30" width="150" height="80" rx="12" fill="${c}"/>${T(x + 75, 82, a, { c: "#fff", fs: 34 })}${T(x + 75, 140, b, { fs: 18, fw: 400 })}`).join("")}
        ${[200, 390, 580].map(x => T(x + 15, 82, "–", { fs: 40 })).join("")}${T(400, 185, "Carpeta por día · se fotografía todo al cierre de cada sesión", { fs: 16, fw: 400 })}</svg>` }
  };

  /* tarjeta sin la división Antes / Ahora (para H5) */
  FIG.tarjetaSimple = { cap: "¿Qué ha cambiado con el programa Feed Good?", svg: FIG.tarjeta.svg.replace(/<!--division-->[\s\S]*<!--\/division-->/, "") };

  /* ---------- cuadros (formatos) ---------- */
  const add = (c, o) => { const h = H(c); if (!h) return; if (o.tab) h.tab = o.tab.concat(h.tab || []); if (o.fig) h.fig = o.fig.map(k => FIG[k]); if (o.figPre) h.figPre = o.figPre.map(k => FIG[k]); if (o.prog) h.prog = true; };

  add("H1", { tab: [{ cap: "Padrón de asistencia", cols: ["N.°", "Nombres y apellidos", "Organización o comunidad", "Categoría de actor", "Sexo (M/H)", "Edad", "Mesa", "Firma"], rows: filas(8, 8), nota: CAT }] });
  add("H2", { fig: ["sala"] });
  add("H3", { prog: true, tab: [{ cap: "Contenido de la diapositiva y del papelógrafo", cols: ["Momento", "Texto"], rows: [
    ["Objetivo del día 1", "Mirar juntos qué ha cambiado en el sistema alimentario de nuestro territorio en Huánuco en estos cinco años, qué aportó el programa, qué no se logró y qué aprendimos para el futuro."],
    ["Objetivo del día 2", "Analizar a fondo los cambios y los resultados no alcanzados, según su impacto, sostenibilidad, eficacia y enfoque de género, y convertirlos en aprendizajes para los futuros programas."],
    ["Mensaje de encuadre", "Esto no es un examen al programa ni a las personas: es una conversación para aprender. Lo que no funcionó vale tanto como lo que sí."]] }] });
  add("H4", { tab: [{ cap: "Acuerdos de convivencia mínimos", nota: "Pregunta al grupo: «¿Cómo deberíamos trabajar para que todas las voces cuenten?»", cols: ["Acuerdo", "Qué significa en la práctica"], rows: [
    ["Una persona habla a la vez", "Se escucha hasta el final; el turno lo da la persona coordinadora de la mesa."],
    ["Todas hablan antes de que alguien repita", "Ronda de palabra en cada mesa; dos minutos por intervención en plenaria."],
    ["Lo dicho se registra sin nombres", "La relatoría anota la categoría de actor, no el nombre; las citas con nombre requieren autorización."],
    ["Lo que no funcionó también cuenta", "Se valoran los errores y las dificultades como fuente de aprendizaje."],
    ["Celulares en silencio", "Se usan solo para la evaluación con QR o para registrar las producciones."]] }] });
  add("H5", { figPre: ["tarjetaSimple"], tab: [{ cap: "Contenido de los seis papelógrafos de resultados", nota: "El logro previsto y su avance se completan con el marco lógico y los informes del programa.", cols: ["R", "Enunciado breve", "Líneas de acción", "Logro previsto y avance"], rows: [
    ["R1", "Producción agroecológica resiliente", "Diversificación, agroforestería, suelos y agua, semillas campesinas", ""],
    ["R2", "Cadenas de valor territoriales justas", "Circuitos cortos, transformación local, MPE de mujeres y jóvenes, poscosecha", ""],
    ["R3", "Gobernanza territorial", "Espacios de concertación multiactor", ""],
    ["R4", "Incidencia nacional", "Plataformas y redes, propuestas de política", ""],
    ["R5", "Sensibilización", "Programas escolares, campañas, radio, iniciativas ciudadanas", ""],
    ["R6", "Mujeres y jóvenes", "Empoderamiento económico, liderazgo, nuevas masculinidades", ""]] }] });
  add("H7", { fig: ["tarjeta", "circulos"] });
  add("H8", { tab: [{ cap: "Criterios de priorización", nota: "La plenaria puede ajustar o añadir criterios.", cols: ["Criterio", "Pregunta para el grupo"], rows: [
    ["Amplitud", "¿A cuántas personas, familias u organizaciones alcanza este cambio?"],
    ["Profundidad", "¿Cuánto cambia la vida, el trabajo o la alimentación de quienes lo viven?"],
    ["Permanencia", "¿Seguirá cuando el programa termine?"],
    ["Inclusión", "¿Beneficia también a mujeres, jóvenes y a quienes antes quedaban fuera?"],
    ["Sistema alimentario", "¿Mejora la forma en que producimos, transformamos, vendemos o consumimos alimentos?"]] }] });
  add("H6", { fig: ["muro"] });
  add("H9", { tab: [{ cap: "Matriz de cambios significativos", cols: ["Orden", "Cambio significativo", "Votos", "Resultado (R1–R6)", "¿Por qué es significativo? (palabras del grupo)"], rows: filas(6, 5) }] });
  add("H10", { tab: [{ cap: "Ficha de análisis de contribución", cols: ["Pregunta", "Respuesta del grupo"], rows: [["Cambio analizado", ""], 
    ["1. ¿Qué hizo el programa que ayudó a este cambio?", ""], ["2. ¿Qué hicieron otras personas, organizaciones o instituciones?", ""], ["3. ¿Qué factores del contexto influyeron (clima, precios, políticas, otros)?", ""],
    ["4. ¿Habría ocurrido sin el programa? (Sí / En parte / No) ¿Por qué?", ""], ["5. ¿Qué aprendimos de este cambio?", ""]] }] });
  add("H11", { fig: ["arbol"] });
  add("H12", { tab: [{ cap: "Panel de aprendizajes", nota: "Ejemplo: «El plátano pelado, en un táper de vidrio con tapa hermética y en la refrigeradora, se conserva en buen estado hasta 10 días sin perder sus propiedades sensoriales».", ir: "H17", cols: ["Aprendimos de lo que funcionó", "Aprendimos de lo que no funcionó"], rows: filas(3, 2, () => "") }] });
  add("H13", { tab: [{ cap: "Guion de la celebración", cols: ["Momento", "Contenido", "Tiempo"], rows: [
    ["Bienvenida", "Palabras breves de Iles de Paix: gratitud por los cinco años compartidos", "5 min"],
    ["Historia de cambio", "Una productora o un joven cuenta su historia con sus propias palabras", "5 min"],
    ["Brindis", "Una socia o un socio brinda por los logros y por lo aprendido", "5 min"],
    ["Expresión cultural", "Danza o música local elegida con las organizaciones (por ejemplo, Los Negritos o la contradanza)", "20 min"],
    ["Comida festiva", "Preparada en lo posible con productos locales y agroecológicos", "45 min"],
    ["Agradecimiento", "Si es pertinente para las y los participantes, un agradecimiento a la Pachamama", "5 min"]] }] });
  add("H20", { tab: [{ cap: "Preguntas de la entrevista (15 min)", nota: "Ficha: código, fecha, resultado vinculado, sexo, edad, rol, lugar y tipo de consentimiento.", cols: ["N.°", "Pregunta", "Para qué sirve"], rows: [
    ["1", "Cuéntanos cómo participaste en el programa.", "Contexto"], ["2", "¿Cómo era tu vida, tu chacra, tu negocio o tu organización antes del programa?", "Situación inicial"],
    ["3", "¿Qué ha cambiado para ti, tu familia, tu organización o tu comunidad?", "Cambios"], ["4", "De todos esos cambios, ¿cuál es el más importante para ti? ¿Por qué?", "Cambio más significativo"],
    ["5", "¿Qué hizo el programa para que eso cambie? ¿Quién más ayudó?", "Contribución"], ["6", "¿Qué esperabas que pasara y no pasó? ¿Por qué crees que no ocurrió?", "Resultados no alcanzados"],
    ["7", "¿Ese cambio se mantendrá? ¿Qué necesita para mantenerse?", "Sostenibilidad"], ["8", "Si empezáramos de nuevo, ¿qué harías distinto?", "Aprendizajes"]] }] });
  add("H14", { tab: [{ cap: "Estructura de la síntesis (20 minutos)", cols: ["Diapositiva", "Contenido"], rows: [
    ["1", "Quiénes participaron: número de personas por categoría de actor, sexo y edad"], ["2", "El muro de cambios: fotografía y número de cambios por resultado"],
    ["3", "Los cambios más significativos: prioridad, votos y frases del grupo"], ["4", "La contribución del programa: factores propios, de otros actores y del contexto"],
    ["5", "Lo que no se logró: resultados no alcanzados y sus causas probables"], ["6", "Las voces distintas: divergencias y percepciones de grupos minoritarios"],
    ["7", "Primeros aprendizajes y pregunta al grupo: «¿Falta algo? ¿Algo no está bien reflejado?»"]] }] });
  add("H15", { fig: ["leyenda"], tab: [{ cap: "Matriz de análisis de cambios por criterio", cols: ["Cambio seleccionado", "Impacto frente a lo previsto", "Sostenibilidad", "Eficacia", "Género", "Dificultades", "Aprendizajes"], rows: filas(4, 7, k => "Cambio " + (k + 1) + ":") },
    { cap: "Preguntas guía por criterio", cols: ["Criterio", "Pregunta guía"], rows: [
      ["Impacto frente a lo previsto", "¿El cambio alcanzó lo que el programa se propuso? ¿Fue más allá o se quedó corto?"], ["Sostenibilidad", "¿Quién lo sostendrá cuando el programa termine? ¿Con qué recursos y capacidades?"],
      ["Eficacia", "¿Las acciones del programa fueron las adecuadas para lograrlo? ¿Llegaron a tiempo?"], ["Perspectiva de género", "¿Cómo vivieron el cambio las mujeres y los hombres? ¿Se redujeron o se mantuvieron las brechas?"],
      ["Dificultades", "¿Qué obstáculos aparecieron y cómo se enfrentaron?"], ["Aprendizajes", "¿Qué nos enseña este cambio para el futuro?"],
      ["Teoría del cambio", "¿Con qué resultado (R1–R6) y con qué eslabón se vincula este cambio? ¿Se cumplieron los supuestos previstos?"]] }] });
  add("H16", { tab: [{ cap: "Matriz de resultados no alcanzados (usar adjetivos y adverbios)", cols: ["Resultado no alcanzado", "Realismo", "Imprevistos", "Metodología", "Tiempo estimado", "Otros factores", "Evidencia o ejemplo"], rows: filas(4, 7, k => (k + 1) + ".") }] });
  add("H19", { tab: [{ cap: "Matriz de aprendizajes y recomendaciones", nota: "¿Qué recomendarías si el proyecto se vuelve a realizar o se da uno similar?", cols: ["Aprendizaje", "¿Qué mantener?", "¿Qué hacer distinto? (recomendación)", "¿Para qué momento? (diseño, implementación o seguimiento)", "Prioridad (alta, media o baja)"], rows: filas(4, 5, k => (k + 1) + ".") }] });
  add("H21", { tab: [{ cap: "Estructura del informe final y fuentes de cada sección", nota: "Anexos: notas no editadas del taller, padrones, registro fotográfico, matrices completas, historias de cambio y matriz de trazabilidad (D4).", cols: ["N.°", "Sección", "Fuente en el taller", "Páginas aprox."], rows: [
    ["1", "Contexto y objetivos del ejercicio", "Documentos del programa; S1.2", "1,5"], ["2", "Metodología y desarrollo del taller", "Agenda; padrones H1; evaluación H22", "2"],
    ["3", "Principales cambios observados", "S1.3 a S1.5 (H6, H7)", "3"], ["4", "Cambios considerados más significativos", "S1.6 (H9); S2.4 (H15); historias de cambio (H20)", "2"],
    ["5", "Contribución del programa a dichos cambios", "S1.7 (H10); S2.4", "2,5"], ["6", "Principales resultados no alcanzados", "S1.8 (H11)", "2"],
    ["7", "Análisis de los resultados según los criterios", "S2.4 (H15)", "3"], ["8", "Dificultades y factores explicativos", "S2.5 (H16)", "1,5"],
    ["9", "Principales lecciones aprendidas", "S1.9, S2.6 y S2.7 (H12, H17)", "1"], ["10", "Aprendizajes e implicaciones para los futuros programas", "S2.8 (H19)", "1"],
    ["11", "Conclusiones y recomendaciones", "S2.7 y S2.8 (H18, H19)", "0,5"], ["", "Total del cuerpo principal", "", "20"]] }] });
  add("H22", { tab: [{ cap: "Formulario de evaluación", nota: "Preguntas abiertas: ¿qué fue lo más valioso para ti? y ¿qué mejorarías?", cols: ["Aspecto", "Muy bueno", "Bueno", "Regular", "Malo", "Muy malo"], rows: [
    ["Me expresé libremente", "", "", "", "", ""], ["Escuché otras opiniones", "", "", "", "", ""], ["Metodología", "", "", "", "", ""], ["Tiempo preciso", "", "", "", "", ""]] }] });
  add("D1", { tab: [{ cap: "Plantilla de relatoría", nota: "C = idea convergente (compartida por varios); D = idea divergente o minoritaria.", cols: ["Hora", "Sesión y mesa", "Aporte clave (textual)", "Categoría de actor", "C / D", "Código de foto o audio", "Observación"], rows: [["", "S1.4-M1", "", "", "", "", ""]].concat(filas(4, 7, () => "")) }] });
  add("D2", { tab: [{ cap: "Matriz de consolidación diaria", nota: "C = cambio; N = resultado no alcanzado. Respaldo: amplio o particular.", cols: ["Código", "Cambio o resultado no alcanzado", "R", "Votos", "Contribución o causa", "Aprendizaje", "Respaldo"], rows: ["C1", "C2", "N1", "N2"].map(c => [c, "", "", "", "", "", ""]) }] });
  add("D3", { fig: ["foto"] });
  add("D4", { tab: [{ cap: "Matriz de trazabilidad del informe", cols: ["Sección del informe", "Afirmación", "Fuente (sesión, mesa, herramienta)", "Tipo de fuente", "Respaldo"], rows: filas(4, 5, () => "").map(r => (r[3] = "Producción / nota / audio / entrevista", r)) }] });
  add("D5", { tab: [{ cap: "Registro de consentimiento", cols: ["Código", "Nombre", "Acepta la grabación (Sí/No)", "Acepta ser citada o citado con su nombre (Sí/No)", "Fecha", "Firma o huella"], rows: filas(5, 6, k => "E" + (k + 1)) }] });
})();
