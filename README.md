# Portal del taller Feed Good · Iles de Paix (Huánuco, 25 y 26 de noviembre de 2026)

Sistema del taller participativo de autoevaluación final del programa Feed Good 2022–2026, adaptado del portal del taller Devida PP 0072 Pirdais.

## Contenido

| Archivo o carpeta | Uso |
|---|---|
| `index.html` | Portal único: inicio con «Ahora en el taller», agenda en vivo con cronómetro, caja de herramientas (H1–H22 y D1–D5), participación con QR, documentos y panel del facilitador |
| `herramientas/herramienta.html?id=…` | Herramientas interactivas: padrón (H1), muro de cambios (H6 y H8), priorización (H9), contribución (H10), árbol de resultados no alcanzados (H11), aprendizajes (H12 y H19), matrices de criterios (H15 y H16), lecciones (H17), historias de cambio (H20), evaluación (H22) y relatoría (D1). Guardan en el navegador del equipo y exportan a CSV y JSON |
| `trabajemos-juntos/` | Dinámica en vivo por mesas desde el celular: `grupos.html` (participantes), `admin.html` (facilitador, con clave) y `pantalla-unica.html` (respaldo sin internet) |
| `assets/data.js` | Agenda, herramientas y resultados del programa (fuente: Productos 1 y 2) |
| `docs/` | Producto 1 y Producto 2 en PDF y Word |
| `img/` | Fotos de Iles de Paix y de Wikimedia Commons; créditos en `img/creditos_commons.json` |

## Sesiones de «Trabajemos juntos»

| Sesión | Hora | Mesas | Pregunta |
|---|---|---|---|
| Miércoles 25 · ¿Qué ha cambiado? (S1.4) | 09:30–10:30 | 6 mesas por color | ¿Qué ha cambiado en el sistema alimentario de Huánuco en estos cinco años con el programa Feed Good? |
| Miércoles 25 · Lo que no se logró (S1.8) | 15:00–16:00 | 6 mesas por color | ¿Qué esperábamos lograr con el programa que no se logró o se logró solo en parte? |
| Jueves 26 · Aprendizajes para el futuro (S2.8) | 14:30–15:15 | 3 mesas | ¿Qué deberíamos hacer de manera diferente? y ¿Qué deberíamos mantener? |

## Antes del taller

1. **Firebase.** `trabajemos-juntos/fbconfig.js` apunta todavía al proyecto del taller Devida (`taller-devida-pirdais`). Se recomienda crear un proyecto propio (por ejemplo, `taller-feedgood`), copiar su configuración en `fbconfig.js`, publicar `firestore.rules` y definir la clave de administrador. Así los datos de Iles de Paix quedan separados (cláusula décima primera del contrato).
2. **Publicar** la carpeta como sitio estático (Render con `render.yaml`, GitHub Pages o Firebase Hosting) y probar el QR con datos móviles.
3. **Exportar** el CSV de cada herramienta al cierre de cada sesión: los datos se guardan solo en el navegador del equipo que se usó.

## Fotos

- Iles de Paix (ilesdepaix.org, página de Perú): paisaje andino, yunta en la chacra y vivero agroforestal (© J. Valente).
- Wikimedia Commons (licencias CC BY, CC BY-SA y dominio público): valles de La Unión y Liriopampa, Huánuco Pampa, Mercado Viejo de Huánuco, cosecha en Marabamba, Danza de los Negritos (Panao y Huánuco), Kotosh y feria Ficafé 2024. Autor, licencia y enlace en `img/creditos_commons.json` y en la sección Documentos del portal.
