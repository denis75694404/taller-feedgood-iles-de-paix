/* Recorrido 3D del taller Feed Good (adaptado de la maqueta de Dashboard.html).
   Maqueta del valle de Huánuco con una estación por cada parte del taller y recorrido guiado a pantalla completa.
   Se carga solo cuando la sección de inicio llega a la vista (ver index.html). Usa los datos de assets/data.js (window.FG). */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/* ─── Datos del taller para las estaciones ─── */
const FG = window.FG;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const PAL = { blue: '#8C5A4F', gold: '#E8B44F', green: '#3F6B4A', violet: '#7c5cd6', pink: '#d6457a', cyan: '#0891b2', gray: '#cbd5e1' };
const RC = ['emerald', 'blue', 'indigo', 'amber', 'teal', 'pink'];
const RLEVEL = ['Territorio', 'Territorio', 'Territorio', 'Nacional', 'Ciudadanía', 'Transversal'];
const RESULTS = FG.resultados.map((r, i) => ({ code: r.r, title: r.n, sub: r.d, c: RC[i], level: RLEVEL[i] }));
const dias = FG.dias, ses = d => d.bloques.filter(b => !b.pausa).length;
const DOCS = FG.herr.filter(h => /^D\d/.test(h.c));
const VIEWS = [
  { id: 'resumen', nav: 'El taller', title: FG.taller.titulo, badge: 'Huánuco · ' + FG.taller.fechas,
    desc: 'Dos días para mirar juntos cinco años del programa Feed Good en Huánuco: qué cambió, qué aportó el programa, qué no se logró y qué aprendimos.', link: '#/agenda', linkTxt: 'Ver la agenda' },
  { id: 'calendario', nav: 'Calendario', title: 'Del 24 al 26 de noviembre',
    desc: `<b>${esc(FG.previo.label)}:</b> ${esc(FG.previo.t.toLowerCase())}.<br>` + dias.map((d, i) => `<b>Día ${i + 1} · ${esc(d.label)}:</b> ${esc(d.tema.toLowerCase())}.`).join('<br>') + '<br>Después, el informe final.', link: '#/agenda', linkTxt: 'Ver la agenda' },
  { id: 'programa', nav: 'Resultados R1–R6', title: 'Lo que el programa se propuso',
    desc: 'Seis resultados, de la chacra a la política pública. Los cambios que identifiquemos en el taller se vinculan con ellos.', link: '#/herramientas/H5', linkTxt: 'Ver los resultados (H5)' },
  { id: 'metodologia', nav: 'Mesas de trabajo', title: 'Todas las voces cuentan',
    desc: 'Mesas mixtas por color: productoras y productores, transformadores, organizaciones, autoridades, consumidores y socios comparten sus tarjetas, arman el muro de cambios y priorizan los más significativos.', link: '#/herramientas', linkTxt: 'Ver las herramientas' },
  { id: 'agenda', nav: 'Agenda', title: 'La agenda de los dos días',
    desc: `${ses(dias[0])} sesiones el día 1 y ${ses(dias[1])} el día 2. Cada columna es un bloque de la agenda y su altura indica cuánto dura; las grises son los refrigerios y el almuerzo.`, link: '#/agenda', linkTxt: 'Abrir la agenda en vivo' },
  { id: 'documentacion', nav: 'Documentación', title: 'Lo que queda escrito',
    desc: DOCS.map(d => `${d.c} · ${esc(d.n)}`).join('; ') + '. Todo alimenta el informe final.', link: '#/herramientas', linkTxt: 'Ver las herramientas' },
  { id: 'equipo', nav: 'Equipo facilitador', title: 'Facilitación y documentación',
    desc: 'César Delgado facilita el taller y Denis García lo documenta, junto con el equipo del programa y las cofacilitadoras y cofacilitadores de mesa.' },
  { id: 'simulacion', nav: 'Trabajemos juntos', title: 'Participación desde el celular',
    desc: 'Cada mesa escribe sus aportes y vota desde el celular; los resultados aparecen en la pantalla al instante.', link: 'trabajemos-juntos/grupos.html', linkTxt: 'Abrir Trabajemos juntos' },
  { id: 'postulacion', nav: 'Iles de Paix', title: FG.taller.programa,
    desc: 'Iles de Paix acompaña a familias productoras, organizaciones y autoridades de Huánuco hacia sistemas alimentarios sostenibles. «' + esc(FG.taller.frase) + '»' },
].map((v, i) => ({ ...v, n: i + 1 }));
// Cronograma: piedras-hito (las grandes son los dos días del taller)
const PHASES = [{ t: 'Jóvenes' }, { key: 1, t: 'Día 1' }, { key: 1, t: 'Día 2' }, { t: 'Informe' }];
// Agenda: un bloque por sesión; la altura sale de la duración real
const TYPES = { s1: { hex: '#B27D71' }, s2: { hex: '#6E9460' }, pausa: { hex: PAL.gray }, fiesta: { hex: PAL.gold } };
const AGENDA = Object.fromEntries(dias.map((d, j) => [d.key, { blocks: d.bloques.map(b => ({ m: toMin(b.t1) - toMin(b.t0), type: b.pausa ? 'pausa' : (/celebraci/i.test(b.t) ? 'fiesta' : (j ? 's2' : 's1')) })) }]));
const DELIVERABLES = DOCS.map((d, i) => ({ hex: ['#B27D71', '#6E9460', '#E8B44F', '#0891b2', '#7c5cd6'][i % 5], final: false }));
const JOINT = new Array(6).fill(0);
const SIM_PROG = [{ v: 78 }, { v: 62 }, { v: 90 }, { v: 48 }];
let t3dTimer = null;
function t3dToast(msg) {
  let el = document.getElementById('t3dToast');
  if (!el) { el = document.createElement('div'); el.id = 't3dToast'; el.className = 't3d-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('on'); clearTimeout(t3dTimer); t3dTimer = setTimeout(() => el.classList.remove('on'), 2600);
}


const RM3 = matchMedia('(prefers-reduced-motion: reduce)').matches;
const Mo = window.Motion || null;
const heroHost = document.getElementById('hero3dHost');
const tourEl = document.getElementById('tour');
const tourHost = document.getElementById('tourHost');

let renderer = null;
try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (!renderer) {
  document.documentElement.classList.add('no-3d');
} else {
  build();
}

function build() {
  /* ─── Renderizadores ─── */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const canvas = renderer.domElement;
  canvas.className = 't3d-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Maqueta 3D del valle de Huánuco con una estación por cada parte del taller Feed Good: calendario, resultados R1–R6, mesas de trabajo, agenda, documentación, equipo facilitador, Trabajemos juntos e Iles de Paix.');
  const labelR = new CSS2DRenderer();
  labelR.domElement.className = 'l2d';

  /* ─── Escena, cielo y luz ─── */
  const scene = new THREE.Scene();
  scene.background = (() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 512;
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#1e5dd8'); gr.addColorStop(0.45, '#7fb0f0'); gr.addColorStop(0.8, '#d7e7fc'); gr.addColorStop(1, '#f4f7fc');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  scene.fog = new THREE.Fog(0xcfe0f7, 120, 260);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
  camera.position.set(0, 40, 54);

  scene.add(new THREE.HemisphereLight(0xe3eeff, 0x6f8f4e, 1.15));
  const sun = new THREE.DirectionalLight(0xfff0d2, 2.6);
  sun.position.set(34, 48, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 140 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 7; controls.maxDistance = 95;
  controls.minPolarAngle = 0.15; controls.maxPolarAngle = 1.38;
  controls.target.set(0, 0, 0);

  /* ─── Utilidades ─── */
  const V3 = THREE.Vector3;
  const deg = THREE.MathUtils.degToRad;
  const polar = (r, a, y = 0) => new V3(Math.cos(deg(a)) * r, y, Math.sin(deg(a)) * r);
  const hash = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
  const jitter = (geo, amt) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      p.setXYZ(i, x + (hash(x, y, z) - 0.5) * amt, y + (hash(y, z, x) - 0.5) * amt, z + (hash(z, x, y) - 0.5) * amt);
    }
    geo.computeVertexNormals(); return geo;
  };
  const MATS = new Map();
  const mat = (c, extra = {}) => {
    const k = c + JSON.stringify(extra);
    if (!MATS.has(k)) MATS.set(k, new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.82, metalness: 0.02, ...extra }));
    return MATS.get(k);
  };
  const add = (parent, geo, color, p = [0, 0, 0], o = {}) => {
    const m = new THREE.Mesh(geo, color && color.isMaterial ? color : mat(color, o.m || {}));
    m.position.set(p[0], p[1], p[2]);
    if (o.r) m.rotation.set(o.r[0], o.r[1], o.r[2]);
    if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]);
    m.castShadow = o.cast !== false; m.receiveShadow = !!o.recv;
    parent.add(m); return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const baseBox = (w, h, d) => box(w, h, d).translate(0, h / 2, 0);
  const prism = (len, depth) => { const r = depth / Math.sqrt(3); const g = new THREE.CylinderGeometry(r, r, len, 3); g.rotateX(-Math.PI / 2); g.rotateY(Math.PI / 2); return g; };
  const faceTo = (obj, x, z) => { obj.rotation.y = Math.atan2(x - obj.position.x, z - obj.position.z); };
  const hex = s => new THREE.Color(s).getHex();

  const C = {
    blue: hex(PAL.blue), gold: hex(PAL.gold), green: hex(PAL.green), violet: hex(PAL.violet), pink: hex(PAL.pink), cyan: hex(PAL.cyan),
    grass: 0x9fd27c, soil: 0xa9774c, soilDark: 0x7d5334, wall: 0xf5efe4, wood: 0x9a6a43, stone: 0xd9cdb6, water: 0x4c9df5, dark: 0x1e293b,
  };
  const RCOL = { emerald: 0x10b981, blue: C.blue, indigo: 0x4f46e5, amber: C.gold, teal: 0x0d9488, pink: C.pink };
  const SKIN = [0xe0b48a, 0xc98f63, 0xb57a50, 0xd9a577];

  function person(parent, color, p, h = 1, hat = true) {
    const g = new THREE.Group(); g.position.set(p[0], p[1], p[2]); parent.add(g);
    add(g, cyl(0.2 * h, 0.3 * h, 0.78 * h, 8), color, [0, 0.39 * h, 0]);
    add(g, new THREE.SphereGeometry(0.2 * h, 10, 8), SKIN[Math.floor(hash(p[0], p[2], h) * 4)], [0, 0.98 * h, 0]);
    if (hat) {
      add(g, cyl(0.34 * h, 0.34 * h, 0.04 * h, 14), 0x3b2a20, [0, 1.13 * h, 0]);
      add(g, cyl(0.15 * h, 0.18 * h, 0.2 * h, 12), 0x3b2a20, [0, 1.24 * h, 0]);
    }
    return g;
  }
  function flag(parent, p, color, h = 2.2, peru = false) {
    add(parent, cyl(0.04, 0.05, h, 6), 0xe2e8f0, [p[0], h / 2, p[2]]);
    if (peru) {
      [0xd91023, 0xffffff, 0xd91023].forEach((c, i) => add(parent, box(0.22, 0.42, 0.02), c, [p[0] + 0.13 + i * 0.22, h - 0.25, p[2]], { cast: false }));
    } else add(parent, box(0.6, 0.38, 0.03), color, [p[0] + 0.32, h - 0.22, p[2]], { cast: false });
  }
  function ribbon(points, width, color, y, opts = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map(q => new V3(q[0], 0, q[1])), false, 'catmullrom', 0.5);
    const N = opts.samples || 160, pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = curve.getPoint(t), tg = curve.getTangent(t), n = new V3(-tg.z, 0, tg.x).normalize();
      const w = width * (opts.taper ? (0.75 + 0.25 * Math.sin(t * Math.PI)) : 1) / 2;
      pos.push(p.x + n.x * w, y, p.z + n.z * w, p.x - n.x * w, y, p.z - n.z * w);
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, color && color.isMaterial ? color : mat(color)); m.receiveShadow = true; scene.add(m);
    return { mesh: m, curve };
  }

  /* ─── Tweens (animaciones de entrada de cada estación) ─── */
  const tweens = [];
  const E = {
    outBack: k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
    outCubic: k => 1 - Math.pow(1 - k, 3),
    inOut: k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
    outBounce: k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375; return n * (k -= 2.625 / d) * k + 0.984375; },
  };
  function tween(update, { dur = 0.8, delay = 0, ease = E.outBack } = {}) {
    if (RM3) { update(1); return; }
    update(0); tweens.push({ t: -delay, dur, ease, update });
  }

  /* ─── Isla flotante ─── */
  const top = new THREE.Mesh(cyl(26, 23.5, 3, 80), [mat(C.soil), mat(C.grass), mat(C.soilDark)]);
  top.position.y = -1.5; top.receiveShadow = true; scene.add(top);
  const under = new THREE.Mesh(jitter(new THREE.ConeGeometry(23.4, 17, 40, 5), 1.4), mat(0x8c6242));
  under.rotation.x = Math.PI; under.position.y = -11.4; scene.add(under);
  [[-8, -16, 4], [10, -18, 3], [2, -22, 2.4]].forEach(([x, y, s]) => add(scene, jitter(new THREE.DodecahedronGeometry(s, 0), 0.5), 0x8c6242, [x * 0.9, y, (x % 3) * 2]));

  /* Río que cruza el valle */
  const RIVER = [[-27, -15.6], [-16.5, -9.5], [-9.5, -5.5], [-5.6, 2.4], [0, 6.2], [5.2, 5.6], [9.5, 5.5], [16.5, 9.5], [27, 15.6]];
  const waterMat = new THREE.MeshStandardMaterial({ color: C.water, roughness: 0.18, metalness: 0.1, emissive: 0x0b3d91, emissiveIntensity: 0.25, flatShading: false });
  const river = ribbon(RIVER, 1.9, waterMat, 0.04, { taper: true, samples: 220 });
  ribbon(RIVER, 2.9, 0xcdb68d, 0.02, { samples: 220 });
  const riverPts = river.curve.getSpacedPoints(160);

  /* ─── Estaciones ─── */
  const R_RING = 11.5, OUT = 19;
  const R_ANG = [240, 300, 0, 60, 120, 180];
  const POS = {
    resumen: new V3(0, 0, 0), programa: new V3(0, 0, 0), metodologia: new V3(0, 0, 0),
    calendario: polar(OUT, 150), agenda: polar(OUT, 105), simulacion: polar(OUT, 68), equipo: polar(OUT, 30),
    documentacion: polar(OUT, 292), postulacion: polar(OUT, 252),
  };
  const RPOS = R_ANG.map(a => polar(R_RING, a));
  const reserved = [{ p: new V3(0, 0, 0), r: 5 }, ...RPOS.map(p => ({ p, r: 3.8 })), ...['calendario', 'agenda', 'simulacion', 'equipo', 'documentacion', 'postulacion'].map(k => ({ p: POS[k], r: 4.2 }))];
  const free = (x, z, pad = 0) => {
    const q = new V3(x, 0, z);
    if (Math.hypot(x, z) > 23.5) return false;
    if (reserved.some(o => o.p.distanceTo(q) < o.r + pad)) return false;
    if (riverPts.some(p => Math.hypot(p.x - x, p.z - z) < 2 + pad)) return false;
    return true;
  };
  const stationGroup = p => { const g = new THREE.Group(); g.position.copy(p); scene.add(g); if (p.lengthSq() > 0) faceTo(g, 0, 0); return g; };
  const ANIM = {};

  /* Caminos de tierra desde la plaza hacia cada resultado */
  RPOS.forEach(p => ribbon([[0, 0], [p.x * 0.5 + (hash(p.x, 1, p.z) - 0.5) * 2, p.z * 0.5], [p.x * 0.82, p.z * 0.82]], 0.7, 0xdcc49a, 0.025, { samples: 40 }));

  /* 1 · Plaza del taller (Retos y metodología) */
  const plaza = stationGroup(POS.metodologia);
  add(plaza, cyl(4.2, 4.5, 0.3, 44), C.stone, [0, 0.15, 0], { recv: true });
  add(plaza, cyl(4.25, 4.25, 0.05, 44), 0xc9b999, [0, 0.31, 0], { recv: true, cast: false });
  add(plaza, cyl(1.5, 1.5, 0.12, 30), 0xb57f52, [0, 0.95, 0]);
  add(plaza, cyl(0.18, 0.26, 0.65, 8), C.wood, [0, 0.6, 0]);
  const NOTE = [0xf6c445, 0xf28c38, 0x7fd1ae, 0xf29ac1, 0x93c5fd];
  const notes = [];
  for (let i = 0; i < 12; i++) { const q = polar(0.35 + (i % 3) * 0.38, i * 47); notes.push(add(plaza, box(0.24, 0.02, 0.24), NOTE[i % 5], [q.x, 1.02, q.z], { r: [0, i, 0], cast: false })); }
  const circle = [C.blue, C.gold, C.green, C.violet, C.pink, C.cyan, 0xd9774b].map((c, i) => { const q = polar(2.4, i * (360 / 7) + 10); const pr = person(plaza, c, [q.x, 0.31, q.z], 1, i % 2 === 0); faceTo(pr, 0, 0); return pr; });
  [205, 250].forEach((a, j) => {
    const q = polar(3.55, a), b = new THREE.Group(); b.position.set(q.x, 0.3, q.z); faceTo(b, 0, 0); plaza.add(b);
    add(b, cyl(0.04, 0.04, 1.8, 6), C.wood, [-0.7, 0.9, 0]); add(b, cyl(0.04, 0.04, 1.8, 6), C.wood, [0.7, 0.9, 0]);
    add(b, box(1.7, 1.15, 0.06), 0xffffff, [0, 1.35, 0]);
    for (let i = 0; i < 9; i++) notes.push(add(b, box(0.26, 0.26, 0.02), NOTE[(i + j) % 5], [-0.55 + (i % 3) * 0.55, 1.7 - Math.floor(i / 3) * 0.36, 0.05], { cast: false }));
  });
  ANIM.metodologia = () => {
    circle.forEach((pr, i) => tween(k => { pr.position.y = 0.31 + Math.sin(k * Math.PI) * 0.45; }, { dur: 0.55, delay: i * 0.12, ease: E.outCubic }));
    notes.forEach((n, i) => tween(k => n.scale.setScalar(Math.max(0.001, k)), { dur: 0.5, delay: 0.3 + i * 0.04 }));
  };

  /* 2 · Resultados R1–R6 */
  const R = RPOS.map((p, i) => {
    const g = stationGroup(p), c = RCOL[RESULTS[i].c];
    add(g, cyl(3.1, 3.3, 0.18, 36), 0xb9dd97, [0, 0.09, 0], { recv: true });
    return { g, c };
  });
  // R1 · Producción agroecológica: andenes
  (() => { const { g } = R[0]; [3.0, 2.4, 1.8, 1.2].forEach((r, i) => {
    add(g, cyl(r, r + 0.12, 0.42, 24), [0x6fbf5c, 0x86cc68, 0x5aad50, 0x9bd67a][i], [0, 0.39 + i * 0.42, 0], { recv: true });
    for (let k = 0; k < 10 + i * 2; k++) { const q = polar(r - 0.22, k * (360 / (10 + i * 2))); add(g, new THREE.ConeGeometry(0.1, 0.34, 5), 0x2f7d3a, [q.x, 0.77 + i * 0.42, q.z]); }
  }); person(g, C.green, [2.4, 0.18, 1.6]); })();
  // R2 · Transformación y comercialización: mercado
  (() => { const { g } = R[1]; [-1.1, 1.1].forEach((x, j) => {
    add(g, box(1.8, 0.8, 1), C.wood, [x, 0.58, 0.2]);
    [[-0.8, -0.35], [0.8, -0.35], [-0.8, 0.65], [0.8, 0.65]].forEach(([a, b]) => add(g, cyl(0.04, 0.04, 1.9, 6), 0x6b4a2f, [x + a, 1.13, b]));
    for (let s = 0; s < 6; s++) add(g, box(0.3, 0.06, 1.3), s % 2 ? 0xffffff : C.gold, [x - 0.75 + s * 0.3, 2.05, 0.15], { r: [0.18, 0, 0] });
    ['#e4572e', '#f6c445', '#6dbb4c', '#f28c38'].forEach((c, k) => add(g, new THREE.SphereGeometry(0.13, 8, 6), c, [x - 0.6 + k * 0.4, 1.08, 0.2]));
  }); person(g, C.blue, [0, 0.18, 1.5]); person(g, C.pink, [1.9, 0.18, 1.6], 0.95, false); })();
  // R3 · Gobernanza territorial: municipio
  (() => { const { g } = R[2];
    add(g, baseBox(3.6, 0.2, 2.6), C.stone, [0, 0.18, 0]); add(g, baseBox(3.2, 0.2, 2.3), C.stone, [0, 0.38, 0]);
    add(g, baseBox(2.8, 1.7, 1.7), C.wall, [0, 0.58, -0.2]);
    [-1.05, -0.35, 0.35, 1.05].forEach(x => add(g, cyl(0.1, 0.12, 1.7, 8), 0xffffff, [x, 1.43, 0.85]));
    add(g, box(3.0, 0.16, 2.2), 0xe2e8f0, [0, 2.36, 0]); add(g, prism(3.0, 2.2), 0x4f46e5, [0, 2.76, 0]);
    add(g, box(0.5, 0.8, 0.05), 0x5b3a22, [0, 0.98, 0.66]); flag(g, [1.9, 0.18, 1.2], 0, 2.6, true); })();
  // R4 · Incidencia nacional: antena
  const waves = [];
  (() => { const { g } = R[3];
    add(g, baseBox(1.6, 1, 1.4), C.wall, [-0.9, 0.18, 0.3]); add(g, prism(1.8, 1.6), C.gold, [-0.9, 1.43, 0.3]);
    add(g, cyl(0.08, 0.5, 5.2, 4), 0x94a3b8, [0.9, 2.78, -0.2]);
    [1.2, 2.4, 3.6].forEach(y => add(g, cyl(0.42 - y * 0.08, 0.42 - y * 0.08, 0.06, 4), 0x64748b, [0.9, y, -0.2]));
    add(g, new THREE.ConeGeometry(0.28, 0.6, 12, 1, true), C.gold, [1.15, 5.15, -0.2], { r: [0, 0, -Math.PI / 2] });
    add(g, new THREE.SphereGeometry(0.14, 10, 8), 0xef4444, [0.9, 5.5, -0.2], { m: { emissive: 0xef4444, emissiveIntensity: 1.2 } });
    for (let k = 0; k < 3; k++) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.035, 6, 36), new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.8 })); w.position.set(0.9, 5.3, -0.2); w.rotation.x = Math.PI / 2; g.add(w); waves.push({ w, o: k / 3 }); }
  })();
  // R5 · Sensibilización y educación: escuela
  (() => { const { g } = R[4];
    add(g, baseBox(3.4, 1.3, 1.8), C.wall, [0, 0.18, -0.3]); add(g, prism(3.6, 2.1), 0x0d9488, [0, 1.78, -0.3]);
    [-1.1, -0.4, 0.4, 1.1].forEach(x => add(g, box(0.4, 0.4, 0.05), 0x7dd3fc, [x, 0.95, 0.62], { cast: false }));
    add(g, box(0.5, 0.75, 0.05), 0x5b3a22, [0, 0.55, 0.62]); flag(g, [-2, 0.18, 1.2], 0, 2.6, true);
    [[-0.9, 1.5], [0.1, 1.8], [1.1, 1.5]].forEach(([x, z], k) => person(g, [C.cyan, C.gold, C.pink][k], [x, 0.18, z], 0.68, false)); })();
  // R6 · Mujeres y jóvenes: liderazgo
  const halo = (() => { const { g } = R[5];
    add(g, cyl(1.7, 1.8, 0.25, 30), 0xf9d3e0, [0, 0.3, 0], { recv: true });
    [[0, 0, 1.12, C.pink], [-0.9, 0.3, 0.9, C.violet], [0.9, 0.3, 0.86, C.gold], [0, -0.9, 0.8, C.cyan]].forEach(([x, z, h, c], k) => person(g, c, [x, 0.42, z], h, k === 0));
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.08, 10, 40), mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.3 }));
    t.position.set(0, 2.5, 0); t.castShadow = true; g.add(t); return t; })();
  // Anillo luminoso de los resultados + balizas
  const ringMat = new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R_RING, 0.09, 8, 160), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.22; scene.add(ring);
  const beams = RPOS.map((p, i) => {
    const b = new THREE.Mesh(cyl(0.5, 0.5, 14, 20, 1).translate(0, 7, 0), new THREE.MeshBasicMaterial({ color: R[i].c, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
    b.position.copy(p); b.scale.y = 0.001; b.visible = false; scene.add(b); return b;
  });
  ANIM.programa = () => { tween(k => { ringMat.opacity = 0.85 * k; }, { dur: 1.2, ease: E.outCubic }); R.forEach(({ g }, i) => tween(k => { g.position.y = Math.sin(k * Math.PI) * 0.8; }, { dur: 0.7, delay: i * 0.1, ease: E.outCubic })); };

  /* 3 · Cronograma: piedras-hito de las fases */
  const cal = stationGroup(POS.calendario);
  const PH_COL = [C.gold, C.gold, C.pink, C.violet, C.blue, C.green];
  const stones = PHASES.map((ph, i) => {
    const s = new THREE.Group(); const x = (i - (PHASES.length - 1) / 2) * 1.7, z = Math.sin(i * 0.9) * 0.9; s.position.set(x, 0, z); cal.add(s);
    const big = !!ph.key;
    add(s, jitter(cyl(big ? 0.85 : 0.6, big ? 0.95 : 0.7, 0.34, 9), 0.08), big ? 0xe9dcc3 : C.stone, [0, 0.17, 0], { recv: true });
    flag(s, [0, 0.34, 0], PH_COL[i], big ? 2.4 : 1.7);
    if (big) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 8, 36), mat(C.gold, { emissive: C.gold, emissiveIntensity: 0.5 })); r.rotation.x = Math.PI / 2; r.position.y = 0.36; s.add(r); }
    return s;
  });
  ANIM.calendario = () => stones.forEach((s, i) => tween(k => { s.position.y = -1.6 * (1 - k); s.scale.setScalar(Math.max(0.001, k)); }, { dur: 0.7, delay: i * 0.18 }));

  /* 4 · Agenda: dos arcos de bloques (altura = minutos) */
  const ag = stationGroup(POS.agenda);
  add(ag, cyl(3.9, 4.1, 0.25, 44), C.stone, [0, 0.12, 0], { recv: true });
  add(ag, cyl(0.5, 0.6, 0.3, 16), 0xe2e8f0, [0, 0.4, 0]);
  add(ag, prism(0.9, 0.5), C.gold, [0, 0.8, 0]);
  const cols = [];
  ['d1', 'd2'].forEach((d, j) => {
    const bl = AGENDA[d].blocks, r = j ? 3.25 : 2.05, span = 250, a0 = -35;
    bl.forEach((b, i) => {
      const h = 0.25 + b.m / 30 * 0.42, q = polar(r, a0 + i * (span / Math.max(1, bl.length - 1)));
      const m = add(ag, baseBox(0.34, h, 0.34), hex(TYPES[b.type] ? TYPES[b.type].hex : PAL.gray), [q.x, 0.25, q.z]);
      faceTo(m, 0, 0); cols.push(m);
    });
  });
  ANIM.agenda = () => cols.forEach((m, i) => tween(k => { m.scale.y = Math.max(0.001, k); }, { dur: 0.6, delay: i * 0.035 }));

  /* 5 · Documentación: escritorio, pilas de notas y entregables P1–P5 flotando */
  const doc = stationGroup(POS.documentacion);
  add(doc, cyl(3.3, 3.5, 0.2, 36), C.stone, [0, 0.1, 0], { recv: true });
  add(doc, baseBox(2.6, 0.12, 1.4), C.wood, [0, 0.95, 0]);
  [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach(([x, z]) => add(doc, cyl(0.05, 0.05, 0.85, 6), 0x6b4a2f, [x, 0.62, z]));
  for (let s = 0; s < 3; s++) for (let k = 0; k < 4 + s * 2; k++) add(doc, box(0.55, 0.035, 0.75), 0xffffff, [-0.8 + s * 0.55, 1.1 + k * 0.04, -0.1], { r: [0, (hash(s, k, 1) - 0.5) * 0.3, 0] });
  add(doc, box(0.5, 0.08, 0.7), C.blue, [0.95, 1.12, 0.15]);
  add(doc, box(0.42, 0.28, 0.24), C.dark, [0.95, 1.3, -0.45]); add(doc, cyl(0.1, 0.1, 0.16, 12), 0x475569, [0.95, 1.3, -0.3], { r: [Math.PI / 2, 0, 0] });
  person(doc, C.gold, [0, 0.2, 1.3]);
  const sheets = DELIVERABLES.map((d, i) => {
    const s = new THREE.Group(); const q = polar(2.2, 200 + i * 35); s.position.set(q.x, 2.6, q.z); doc.add(s); faceTo(s, 0, 4);
    add(s, box(0.75, 1, 0.04), 0xffffff, [0, 0, 0]); add(s, box(0.75, 0.2, 0.05), hex(d.hex), [0, 0.4, 0.01]);
    [0.1, -0.08, -0.26].forEach(y => add(s, box(0.5, 0.05, 0.05), 0xcbd5e1, [0, y, 0.02], { cast: false }));
    if (d.final) add(s, new THREE.TorusGeometry(0.16, 0.05, 8, 20), C.green, [0.2, -0.32, 0.05]);
    s.userData.y = 2.6; return s;
  });
  ANIM.documentacion = () => sheets.forEach((s, i) => tween(k => { s.userData.y = 2.6 + (1 - k) * 5; s.rotation.z = (1 - k) * 2; }, { dur: 0.9, delay: i * 0.15 }));

  /* 6 · Equipo: puente sobre el río con César y Denis */
  const eq = new THREE.Group(); eq.position.copy(POS.equipo); scene.add(eq);
  { const tg = river.curve.getTangent(0.78); eq.rotation.y = Math.atan2(tg.x, tg.z); }
  const lanterns = [];
  for (let i = 0; i < 11; i++) { const x = -2.5 + i * 0.5, y = 0.25 + 0.55 * Math.cos(x / 2.6 * Math.PI / 2); add(eq, box(0.46, 0.1, 1.2), C.wood, [x, y, 0], { r: [0, 0, -Math.sin(x / 2.6 * Math.PI / 2) * 0.35] }); }
  [-0.6, 0.6].forEach(z => { for (let i = 0; i <= 6; i++) { const x = -2.4 + i * 0.8, y = 0.25 + 0.55 * Math.cos(x / 2.6 * Math.PI / 2); add(eq, cyl(0.04, 0.04, 0.6, 6), 0x6b4a2f, [x, y + 0.3, z]);
    if (i % 1 === 0 && lanterns.length < JOINT.length && z > 0 && i > 0) { const l = add(eq, new THREE.SphereGeometry(0.1, 10, 8), C.gold, [x, y + 0.66, z], { m: { emissive: C.gold, emissiveIntensity: 0.05 } }); l.material = l.material.clone(); lanterns.push(l); } } });
  const cesar = person(eq, C.blue, [-0.55, 0.78, 0], 1.05, false), denis = person(eq, C.gold, [0.55, 0.78, 0], 1.0, false);
  cesar.rotation.y = Math.PI / 2; denis.rotation.y = -Math.PI / 2;
  const arcMat = new THREE.MeshStandardMaterial({ color: C.gold, emissive: C.gold, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 30, Math.PI), arcMat); arc.position.set(0, 2.05, 0); eq.add(arc);
  ANIM.equipo = () => {
    lanterns.forEach((l, i) => tween(k => { l.material.emissiveIntensity = 0.05 + k * 1.6; }, { dur: 0.5, delay: 0.3 + i * 0.22, ease: E.outCubic }));
    [cesar, denis].forEach((p, i) => tween(k => { p.position.y = 0.78 + Math.sin(k * Math.PI) * 0.5; }, { dur: 0.6, delay: i * 0.2, ease: E.outCubic }));
    tween(k => { arc.scale.setScalar(Math.max(0.001, k)); }, { dur: 0.9, delay: 0.5 });
  };

  /* 8 · Postulación: casa de Iles de Paix, buzón y avión de papel */
  const post = stationGroup(POS.postulacion); post.updateMatrixWorld(true);
  add(post, cyl(3.3, 3.5, 0.2, 36), C.stone, [0, 0.1, 0], { recv: true });
  add(post, baseBox(2.6, 1.6, 2), C.wall, [0, 0.2, -0.4]); add(post, prism(2.9, 2.5), C.blue, [0, 2.2, -0.4]);
  add(post, box(0.55, 0.9, 0.05), C.gold, [0, 0.65, 0.62]); [-0.85, 0.85].forEach(x => add(post, box(0.45, 0.45, 0.05), 0x93c5fd, [x, 1.1, 0.62], { cast: false }));
  add(post, cyl(0.05, 0.05, 1.1, 6), 0x475569, [1.9, 0.75, 1.2]); add(post, box(0.5, 0.36, 0.34), C.gold, [1.9, 1.35, 1.2]);
  const plane = (() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.6, -0.45, 0, -0.35, 0, 0.05, -0.2, 0, 0, 0.6, 0, 0.05, -0.2, 0.45, 0, -0.35, 0, 0, 0.6, 0, 0.05, -0.2, 0, -0.18, -0.25], 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, flatShading: true })); m.castShadow = true; scene.add(m); return m;
  })();
  const planePath = new THREE.CatmullRomCurve3([[4, 4.5, 4], [-1, 5.5, 5], [-4.5, 4, 0], [-2, 3, -3.5], [2.5, 3.2, -2.5], [2, 1.6, 1.2], [4.5, 3, 2]].map(([x, y, z]) => post.localToWorld(new V3(x, y, z))), true);
  let planeT = 0;
  ANIM.postulacion = () => { planeT = 0; };

  /* 9 · Datos simulados: pantalla con barras */
  const sim = stationGroup(POS.simulacion); sim.rotation.y += Math.PI;
  add(sim, cyl(3.2, 3.4, 0.2, 36), C.stone, [0, 0.1, 0], { recv: true });
  [-1.8, 1.8].forEach(x => add(sim, cyl(0.07, 0.09, 2.4, 8), 0x475569, [x, 1.3, -0.4]));
  add(sim, box(4.4, 2.7, 0.18), C.dark, [0, 3.3, -0.4]); add(sim, box(4.1, 2.4, 0.05), 0xf8fafc, [0, 3.3, -0.29], { cast: false });
  const simBars = SIM_PROG.map((s, i) => add(sim, baseBox(0.62, 1.9 * s.v / 100, 0.35), [C.green, C.cyan, C.pink, C.violet][i], [-1.35 + i * 0.9, 2.2, -0.1]));
  ANIM.simulacion = () => simBars.forEach((b, i) => tween(k => { b.scale.y = Math.max(0.001, k); }, { dur: 0.8, delay: 0.2 + i * 0.15 }));

  /* ─── Entorno: montañas, chacras, árboles, nubes, aves, polen ─── */
  for (let a = 196; a <= 344; a += 11) {
    const r = 24 + hash(a, 1, 2) * 0.8, h = 5 + hash(a, 3, 4) * 7, rad = 3 + hash(a, 5, 6) * 1.8, q = polar(r, a);
    add(scene, jitter(new THREE.ConeGeometry(rad, h, 7, 2), 0.5), hash(a, 7, 8) > 0.5 ? 0x6f9f67 : 0x7fae70, [q.x, h / 2 - 0.05, q.z]);
    if (h > 9.5) add(scene, jitter(new THREE.ConeGeometry(rad * 0.32, h * 0.3, 7, 1), 0.2), 0xeef4fb, [q.x, h - h * 0.15 - 0.05, q.z]);
  }
  const FIELD = [0x7cc56b, 0xc9dd82, 0x5fae5f, 0xe0cf85, 0x94d38a, 0xb4d67a];
  for (let i = 0, n = 0; i < 400 && n < 34; i++) {
    const x = (hash(i, 9, 1) - 0.5) * 46, z = (hash(i, 2, 9) - 0.5) * 46;
    if (!free(x, z, 1.4)) continue;
    add(scene, box(1.6 + hash(i, 4, 4) * 2.4, 0.08, 1.2 + hash(i, 5, 5) * 2), FIELD[n % FIELD.length], [x, 0.04, z], { r: [0, hash(i, 6, 6) * 3, 0], cast: false, recv: true }); n++;
  }
  const treeSpots = [];
  for (let i = 0; i < 900 && treeSpots.length < 150; i++) {
    const x = (hash(i, 1, 7) - 0.5) * 48, z = (hash(i, 8, 3) - 0.5) * 48;
    if (free(x, z, 0.3)) treeSpots.push([x, z, 0.7 + hash(i, 4, 2) * 0.7]);
  }
  const trunk = new THREE.InstancedMesh(cyl(0.08, 0.12, 0.7, 6).translate(0, 0.35, 0), mat(0x7a5236), treeSpots.length);
  const crown = new THREE.InstancedMesh(new THREE.ConeGeometry(0.55, 1.5, 7).translate(0, 1.35, 0), mat(0xffffff), treeSpots.length);
  const TREE = [0x2f8f4e, 0x3aa35a, 0x4c9a3f, 0x2c7a45, 0x5cb85c].map(c => new THREE.Color(c));
  const dm = new THREE.Object3D();
  treeSpots.forEach(([x, z, s], i) => { dm.position.set(x, 0, z); dm.scale.setScalar(s); dm.rotation.y = s * 7; dm.updateMatrix(); trunk.setMatrixAt(i, dm.matrix); crown.setMatrixAt(i, dm.matrix); crown.setColorAt(i, TREE[i % TREE.length]); });
  [trunk, crown].forEach(m => { m.castShadow = true; scene.add(m); });
  for (let i = 0; i < 18; i++) { const x = (hash(i, 3, 3) - 0.5) * 44, z = (hash(i, 7, 7) - 0.5) * 44; if (free(x, z)) add(scene, jitter(new THREE.DodecahedronGeometry(0.35 + hash(i, 1, 5) * 0.4, 0), 0.1), 0x9aa5b1, [x, 0.15, z]); }

  const clouds = [];
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group(), n = 3 + (i % 3);
    for (let k = 0; k < n; k++) add(g, new THREE.IcosahedronGeometry(1.2 + hash(i, k, 1) * 1.1, 0), 0xffffff, [k * 1.5 - n * 0.7, hash(k, i, 2) * 0.6, hash(i, k, 3) * 0.8], { m: { roughness: 1 }, cast: false });
    g.userData = { r: 17 + hash(i, 5, 5) * 14, a: i * 40, y: 12 + hash(i, 6, 6) * 5, s: 0.02 + hash(i, 7, 7) * 0.025 };
    scene.add(g); clouds.push(g);
  }
  const birds = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group(), wm = mat(0x1e293b, { side: THREE.DoubleSide });
    const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.18).translate(0.35, 0, 0), wm), w2 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.18).translate(-0.35, 0, 0), wm);
    w1.rotation.x = w2.rotation.x = -Math.PI / 2; g.add(w1, w2); g.userData = { w1, w2, r: 15 + i * 2.4, y: 10 + i * 0.8, a: i * 70, s: 0.18 + i * 0.02 }; scene.add(g); birds.push(g);
  }
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd479, fog: false }));
  sunMesh.position.set(52, 58, -70); scene.add(sunMesh);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd479, transparent: true, opacity: 0.8, depthWrite: false, fog: false })); sunGlow.scale.set(34, 34, 1); sunGlow.position.copy(sunMesh.position); scene.add(sunGlow);
  const POLLEN = 160, pp = new Float32Array(POLLEN * 3);
  for (let i = 0; i < POLLEN; i++) { const q = polar(Math.sqrt(hash(i, 1, 2)) * 23, hash(i, 3, 4) * 360); pp[i * 3] = q.x; pp[i * 3 + 1] = hash(i, 5, 6) * 7; pp[i * 3 + 2] = q.z; }
  const pollenGeo = new THREE.BufferGeometry(); pollenGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  scene.add(new THREE.Points(pollenGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xffe08a, size: 0.35, transparent: true, depthWrite: false, opacity: 0.85 })));
  const SPARK = 70, sp = new Float32Array(SPARK * 3);
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sparkGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xffffff, size: 0.4, transparent: true, depthWrite: false, opacity: 0.9 })));

  /* ─── Recorrido: estaciones y encuadres de cámara ─── */
  // Las estaciones del lado de las montañas se miran desde el interior del valle (montañas de fondo)
  const camFor = (p, dist, h, side = 0) => {
    const dir = p.clone().setY(0); if (dir.lengthSq() < 0.01) dir.set(0, 0, 1); dir.normalize();
    const ang = (THREE.MathUtils.radToDeg(Math.atan2(p.z, p.x)) + 360) % 360;
    const inward = ang > 190 && ang < 350;
    const lat = new V3(-dir.z, 0, dir.x).multiplyScalar(side);
    return { pos: p.clone().add(dir.multiplyScalar(inward ? -dist * 0.85 : dist)).add(lat).setY(inward ? h + 1 : h), target: p.clone().setY(1.2) };
  };
  const VIEW = id => VIEWS.find(v => v.id === id);
  const STOPS = [];
  VIEWS.forEach(v => {
    let cam;
    if (v.id === 'resumen') cam = { pos: new V3(0, 40, 54), target: new V3(0, -1, 0) };
    else if (v.id === 'programa') cam = { pos: new V3(0, 27, 30), target: new V3(0, 0, 1.5) };
    else if (v.id === 'metodologia') cam = { pos: new V3(2.5, 7.5, 11), target: new V3(0, 1, 0) };
    else cam = camFor(POS[v.id], { postulacion: 13, documentacion: 11 }[v.id] || 10, { postulacion: 7.5 }[v.id] || 6.5, 2.2);
    STOPS.push({ kind: 'view', id: v.id, v, cam, enter: ANIM[v.id] });
    if (v.id === 'programa') RESULTS.forEach((r, i) => STOPS.push({ kind: 'r', id: 'programa', i, r, cam: camFor(RPOS[i], 9, 6, 1.8), enter: () => beamOn(i) }));
  });
  function beamOn(i) {
    beams.forEach((b, j) => { b.visible = j === i; });
    const b = beams[i]; tween(k => { b.scale.y = Math.max(0.001, k); }, { dur: 0.9, ease: E.outCubic });
    const g = R[i].g; tween(k => { g.position.y = Math.sin(k * Math.PI) * 0.9; }, { dur: 0.7, ease: E.outCubic });
  }

  /* Etiquetas HTML en 3D */
  const labels = [];
  const mkLabel = (html, color, pos, onClick, key) => {
    const wrap = document.createElement('div'); wrap.className = 'lbl-wrap';
    wrap.innerHTML = `<button type="button" class="lbl3d" style="--c:${color}">${html}</button><div class="lbl-stem" style="--c:${color}"></div>`;
    wrap.querySelector('button').addEventListener('click', e => { e.stopPropagation(); onClick(); });
    const o = new CSS2DObject(wrap); o.center.set(0.5, 1); o.position.copy(pos); scene.add(o);
    labels.push({ key, el: wrap.querySelector('button') }); return o;
  };
  const LABEL_H = { metodologia: 3.4, calendario: 3.4, agenda: 3.6, simulacion: 5.2, equipo: 3.2, documentacion: 4, postulacion: 3.8 };
  Object.keys(LABEL_H).forEach(id => {
    const v = VIEW(id); if (!v) return;
    mkLabel(`<span class="ic">${v.n}</span><span class="tx">${esc(v.nav)}</span>`, PAL.blue, POS[id].clone().setY(LABEL_H[id]), () => onPick(STOPS.findIndex(s => s.kind === 'view' && s.id === id)), 'v:' + id);
  });
  RESULTS.forEach((r, i) => {
    const col = '#' + new THREE.Color(RCOL[r.c]).getHexString();
    mkLabel(`<span class="ic">${r.code}</span><span class="tx">${esc(r.title)}</span>`, col, RPOS[i].clone().setY(i === 3 ? 6.2 : 3.6), () => onPick(STOPS.findIndex(s => s.kind === 'r' && s.i === i)), 'r:' + i);
  });

  /* ─── Modo (portada / recorrido), montaje y tamaño ─── */
  let mode = 'hero', host = heroHost, heroVisible = false, running = false;
  const mount = h => { host = h; h.appendChild(canvas); h.appendChild(labelR.domElement); requestAnimationFrame(resize); resize(); };
  const resize = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false); labelR.setSize(w, h);
    camera.fov = w / h < 0.9 ? 55 : 40;
    // En el recorrido, la escena se desplaza para no quedar bajo la tarjeta
    if (mode === 'tour' && w >= 900) { camera.aspect = (w * 1.32) / h; camera.setViewOffset(w * 1.32, h, 0, 0, w, h); }
    else if (mode === 'tour') { camera.aspect = w / (h * 1.4); camera.setViewOffset(w, h * 1.4, 0, h * 0.4, w, h); }
    else { camera.aspect = w / h; camera.clearViewOffset(); }
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(() => resize()).observe(heroHost);
  new ResizeObserver(() => { if (mode === 'tour') resize(); }).observe(tourHost);
  new IntersectionObserver(en => { heroVisible = en[0].isIntersecting; ensureLoop(); }, { threshold: 0.02 }).observe(heroHost);
  mount(heroHost);
  const setHeroControls = () => { controls.autoRotate = !RM3; controls.autoRotateSpeed = 0.55; controls.enableZoom = false; };
  setHeroControls();
  controls.addEventListener('start', () => { if (mode === 'tour' && playing) setPlaying(false); controls.autoRotate = false; });

  /* ─── Vuelo de cámara (Bézier elevada) ─── */
  let fly = null;
  function flyTo(cam, dur = 2.3) {
    if (RM3) { camera.position.copy(cam.pos); controls.target.copy(cam.target); controls.update(); return Promise.resolve(); }
    const p0 = camera.position.clone(), p1 = cam.pos.clone(), mid = p0.clone().lerp(p1, 0.5);
    mid.y += Math.max(5, p0.distanceTo(p1) * 0.32);
    return new Promise(res => { fly = { p0, p1, mid, t0: controls.target.clone(), t1: cam.target.clone(), t: 0, dur, res }; controls.enabled = false; });
  }

  /* ─── Recorrido guiado ─── */
  let idx = 0, playing = false, arrived = false, dwell = 0;
  const DWELL = 6.5;
  const $t = s => tourEl.querySelector(s);
  const card = $t('#tourCard'), steps = $t('#tourSteps'), prog = $t('#tourProg'), playBtn = $t('#tourPlay');
  steps.innerHTML = STOPS.map((s, i) => s.kind === 'view'
    ? `<button type="button" data-stop="${i}" class="tour-step" title="${esc(s.v.nav)}"><b>${s.v.n}</b><span>${esc(s.v.nav)}</span></button>`
    : `<button type="button" data-stop="${i}" class="tour-step r" title="${s.r.code} · ${esc(s.r.title)}" style="--c:#${new THREE.Color(RCOL[s.r.c]).getHexString()}">${s.r.code}</button>`).join('');
  steps.addEventListener('click', e => { const b = e.target.closest('[data-stop]'); if (b) { setPlaying(false); go(+b.dataset.stop); } });

  function cardHTML(s, i) {
    const n = `<span class="t3d-num">${String(i + 1).padStart(2, '0')} / ${STOPS.length}</span>`;
    const nav = `<button type="button" data-step="-1" class="t3d-nav" aria-label="Estación anterior">‹</button><button type="button" data-step="1" class="t3d-nav" aria-label="Estación siguiente">›</button>`;
    if (s.kind === 'r') {
      const col = '#' + new THREE.Color(RCOL[s.r.c]).getHexString();
      return `<div class="t3d-top">${n}<span class="t3d-tag" style="--c:${col}">${s.r.level}</span></div>
        <div class="t3d-head"><div class="t3d-ico" style="background:${col}">${s.r.code}</div><div><div class="t3d-kick" style="color:${col}">Resultado ${s.r.code}</div><h3>${esc(s.r.title)}</h3></div></div>
        <p>${esc(s.r.sub)}</p>
        <div class="t3d-acts"><button type="button" data-open="#/herramientas/H5" class="t3d-cta">Ver los seis resultados (H5)</button>${nav}</div>`;
    }
    const v = s.v;
    return `<div class="t3d-top">${n}${v.badge ? `<span class="t3d-tag">${esc(v.badge)}</span>` : ''}</div>
      <div class="t3d-head"><div class="t3d-ico">${v.n}</div><div><div class="t3d-kick">${esc(v.nav)}</div><h3>${esc(v.title)}</h3></div></div>
      <p>${v.desc}</p>
      <div class="t3d-acts">${v.link ? `<button type="button" data-open="${v.link}" class="t3d-cta">${esc(v.linkTxt || 'Abrir')}</button>` : '<span class="t3d-sp"></span>'}${nav}</div>`;
  }
  card.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { const to = o.dataset.open; closeTour(); if (/\.html/.test(to)) window.open(to, '_blank', 'noopener'); else location.hash = to; return; }
    const st = e.target.closest('[data-step]'); if (st) { setPlaying(false); go(idx + +st.dataset.step); }
  });

  function renderCard(i, dir) {
    const html = cardHTML(STOPS[i], i);
    if (!Mo || RM3) { card.innerHTML = html; return; }
    Mo.animate(card, { opacity: [1, 0], rotateY: [0, -dir * 40], x: [0, -dir * 50], scale: [1, 0.94] }, { duration: 0.26, ease: 'easeIn' }).then(() => {
      card.innerHTML = html;
      Mo.animate(card, { opacity: [0, 1], rotateY: [dir * 40, 0], x: [dir * 50, 0], scale: [0.94, 1] }, { duration: 0.75, ease: [0.16, 1, 0.3, 1] });
    });
  }
  function highlight() {
    const s = STOPS[idx];
    $$('.tour-step', steps).forEach((b, i) => b.classList.toggle('on', i === idx));
    const act = steps.querySelector('.tour-step.on'); if (act) act.scrollIntoView({ block: 'nearest', inline: 'center', behavior: RM3 ? 'auto' : 'smooth' });
    const key = s.kind === 'r' ? 'r:' + s.i : 'v:' + s.id;
    labels.forEach(l => l.el.classList.toggle('on', l.key === key || (s.id === 'programa' && s.kind === 'view' && l.key.startsWith('r:'))));
    if (s.kind !== 'r') beams.forEach(b => { b.visible = false; });
    if (s.id !== 'programa') ringMat.opacity = 0;
  }
  function go(i) {
    const prev = idx; idx = (i + STOPS.length) % STOPS.length;
    arrived = false; dwell = 0; prog.style.width = '0%';
    renderCard(idx, idx >= prev ? 1 : -1); highlight();
    const s = STOPS[idx];
    flyTo(s.cam).then(() => { if (STOPS[idx] !== s) return; arrived = true; if (s.enter) s.enter(); });
  }
  function onPick(i) {
    if (i < 0) return;
    if (mode === 'tour') { setPlaying(false); go(i); return; }
    openTour(null, false, i);
  }
  function setPlaying(p) {
    playing = p;
    playBtn.innerHTML = p ? '❚❚<span>Pausar</span>' : '▶<span>Reproducir</span>';
    playBtn.setAttribute('aria-pressed', String(p));
    if (!p) prog.style.width = '0%';
  }
  playBtn.addEventListener('click', () => { setPlaying(!playing); if (playing && arrived) dwell = 0; });
  $t('#tourClose').addEventListener('click', () => closeTour());

  function openTour(viewId, autoplay, at) {
    mode = 'tour'; tourEl.classList.remove('hidden'); tourEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tour-open');
    mount(tourHost);
    controls.autoRotate = false; controls.enableZoom = true;
    const start = at != null ? at : Math.max(0, STOPS.findIndex(s => s.kind === 'view' && s.id === viewId));
    if (Mo && !RM3) Mo.animate(tourEl, { opacity: [0, 1], scale: [1.04, 1] }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    setPlaying(!!autoplay); idx = start; go(start);
    ensureLoop();
    setTimeout(() => $t('#tourClose').focus(), 50);
  }
  function closeTour() {
    if (mode !== 'tour') return;
    setPlaying(false);
    const done = () => {
      tourEl.classList.add('hidden'); tourEl.setAttribute('aria-hidden', 'true'); document.body.classList.remove('tour-open');
      mode = 'hero'; mount(heroHost); setHeroControls(); labels.forEach(l => l.el.classList.remove('on')); beams.forEach(b => { b.visible = false; }); ringMat.opacity = 0;
      flyTo(STOPS[0].cam, 1.2); ensureLoop();
    };
    if (Mo && !RM3) Mo.animate(tourEl, { opacity: [1, 0], scale: [1, 1.03] }, { duration: 0.3 }).then(done); else done();
  }
  document.addEventListener('keydown', e => {
    if (mode !== 'tour') return;
    if (e.key === 'Escape') { e.preventDefault(); closeTour(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); go(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setPlaying(false); go(idx - 1); }
    else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); setPlaying(!playing); }
  });

  window.V3D = {
    openTour,
    onView(id) { if (mode === 'hero' && id === 'resumen') { flyTo(STOPS[0].cam, 1.4); } ensureLoop(); },
  };
  document.querySelectorAll('[data-tour]').forEach(b => b.addEventListener('click', () => openTour(b.dataset.tour, b.hasAttribute('data-autoplay'))));

  /* ─── Bucle ─── */
  const clock = new THREE.Clock();
  let t = 0;
  function ensureLoop() {
    const need = mode === 'tour' || heroVisible;
    if (need && !running) { running = true; clock.getDelta(); requestAnimationFrame(frame); }
  }
  function frame() {
    const need = mode === 'tour' || heroVisible;
    if (!need) { running = false; return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!RM3) t += dt;

    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]; tw.t += dt;
      if (tw.t < 0) continue;
      const k = Math.min(1, tw.t / tw.dur); tw.update(tw.ease(k));
      if (k >= 1) tweens.splice(i, 1);
    }
    if (fly) {
      fly.t += dt / fly.dur;
      const k = E.inOut(Math.min(1, fly.t));
      const a = fly.p0.clone().lerp(fly.mid, k), b = fly.mid.clone().lerp(fly.p1, k);
      camera.position.copy(a.lerp(b, k));
      controls.target.copy(fly.t0).lerp(fly.t1, k);
      camera.lookAt(controls.target);
      if (fly.t >= 1) { const r = fly.res; fly = null; controls.enabled = true; controls.update(); r(); }
    } else controls.update();

    if (mode === 'tour' && playing && arrived && !fly) {
      dwell += dt; prog.style.width = Math.min(100, dwell / DWELL * 100) + '%';
      if (dwell >= DWELL) { if (idx < STOPS.length - 1) go(idx + 1); else { setPlaying(false); t3dToast('Recorrido completo'); } }
    }

    // Animación ambiental
    halo.rotation.y = t * 1.2; halo.position.y = 2.5 + Math.sin(t * 2) * 0.12;
    waves.forEach(o => { const k = (t * 0.45 + o.o) % 1; o.w.scale.setScalar(1 + k * 3.2); o.w.material.opacity = 0.85 * (1 - k); });
    sheets.forEach((s, i) => { s.position.y = s.userData.y + Math.sin(t * 1.6 + i) * 0.12; });
    arc.rotation.y = Math.sin(t) * 0.25;
    circle.forEach((p, i) => { p.rotation.z = Math.sin(t * 2 + i) * 0.03; });
    clouds.forEach(c => { const u = c.userData; u.a += u.s * dt * 20; const q = polar(u.r, u.a, u.y); c.position.copy(q); });
    birds.forEach(b => { const u = b.userData; u.a += u.s * dt * 60; const a = deg(u.a); b.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.r) * 0.6, Math.sin(a) * u.r); b.rotation.y = -a; const f = Math.sin(t * 9 + u.r) * 0.6; u.w1.rotation.z = f; u.w2.rotation.z = -f; });
    if (!RM3) {
      planeT = (planeT + dt * 0.07) % 1;
      const p = planePath.getPointAt(planeT), n = planePath.getPointAt((planeT + 0.01) % 1);
      plane.position.copy(p); plane.lookAt(n);
      const pa = pollenGeo.attributes.position;
      for (let i = 0; i < POLLEN; i++) { let y = pa.getY(i) + dt * 0.25; if (y > 8) y = 0; pa.setY(i, y); pa.setX(i, pa.getX(i) + Math.sin(t + i) * dt * 0.1); }
      pa.needsUpdate = true;
      const sa = sparkGeo.attributes.position;
      for (let i = 0; i < SPARK; i++) { const q = river.curve.getPointAt(((i / SPARK) + t * 0.018) % 1); sa.setXYZ(i, q.x + Math.sin(i * 7) * 0.5, 0.12, q.z + Math.cos(i * 5) * 0.5); }
      sa.needsUpdate = true;
      waterMat.emissiveIntensity = 0.22 + Math.sin(t * 1.5) * 0.06;
    } else {
      const p = planePath.getPointAt(0.2); plane.position.copy(p); plane.lookAt(planePath.getPointAt(0.21));
    }
    renderer.render(scene, camera);
    labelR.render(scene, camera);
    requestAnimationFrame(frame);
  }
  camera.position.copy(STOPS[0].cam.pos); controls.target.copy(STOPS[0].cam.target); controls.update();
  ensureLoop();
  // Respaldo: comprueba la visibilidad de la portada aunque el observador no dispare
  setInterval(() => {
    const r = heroHost.getBoundingClientRect();
    heroVisible = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    ensureLoop();
  }, 1000);
  document.documentElement.classList.add('has-3d');
  const ld = document.getElementById('t3dLoad'); if (ld) ld.remove();
}
