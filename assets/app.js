/* Portal del taller Feed Good · lógica de vistas, agenda en vivo, herramientas, QR y cronómetro. */
(function () {
  const D = window.FG;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* íconos (trazos al estilo Lucide, ISC) */
  const P = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    sprout: '<path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    wifioff: '<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 4.2-2.7M10.7 5.1A15 15 0 0 1 22 8.8M5 12.9a10 10 0 0 1 5.2-2.8M16.9 11.4A10 10 0 0 1 19 12.9M12 20h.01"/>',
    pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'
  };
  const ic = (n, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
  document.querySelectorAll("[data-i]").forEach(el => el.insertAdjacentHTML("afterbegin", ic(el.dataset.i)));

  /* navegación */
  const NAV = [["inicio", "Inicio", "home"], ["agenda", "Agenda", "calendar"], ["herramientas", "Herramientas", "wrench"], ["participa", "Participa", "users"], ["documentos", "Documentos", "file"], ["facilitador", "Facilitador", "shield"]];
  const navHtml = list => list.map(([k, t, i]) => `<a class="nav-btn" data-k="${k}" href="#/${k}">${ic(i)}<span>${t}</span></a>`).join("");
  $("#rail").insertAdjacentHTML("beforeend", navHtml(NAV));
  $("#tabbar").innerHTML = navHtml(NAV.filter(n => n[0] !== "documentos"));

  function route() {
    const k = (location.hash.replace(/^#\//, "").split("/")[0]) || "inicio";
    const v = document.getElementById("v-" + k) ? k : "inicio";
    document.querySelectorAll(".view").forEach(x => x.classList.toggle("on", x.id === "v-" + v));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("on", b.dataset.k === v));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    if (v === "participa") drawQR();
  }
  window.addEventListener("hashchange", route);

  /* hora de Huánuco (UTC−5, sin horario de verano) */
  const nowPe = () => { const d = new Date(Date.now() - 5 * 3600e3); return { ymd: d.toISOString().slice(0, 10), min: d.getUTCHours() * 60 + d.getUTCMinutes(), hm: d.toISOString().slice(11, 16) }; };
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const toolByCode = c => D.herr.find(x => x.c === c);

  function status() {
    const n = nowPe();
    for (const d of D.dias) {
      if (d.fecha !== n.ymd) continue;
      const b = d.bloques.find(b => n.min >= toMin(b.t0) && n.min < toMin(b.t1));
      const next = d.bloques.find(b => toMin(b.t0) > n.min);
      return { d, b, next, n };
    }
    const first = D.dias.find(d => d.fecha > n.ymd);
    return { first, n };
  }

  function renderNow() {
    const s = status(), el = $("#nowCard");
    $("#clock span:last-child").textContent = "Huánuco " + s.n.hm;
    if (s.b) {
      const pct = Math.round(100 * (s.n.min - toMin(s.b.t0)) / (toMin(s.b.t1) - toMin(s.b.t0)));
      el.innerHTML = `<div class="ico">${ic("clock")}</div><div><div class="eyebrow">Ahora en el taller · ${esc(s.d.label)}</div>
        <h3 style="margin:0">${esc(s.b.c ? s.b.c + " · " : "")}${esc(s.b.t)}</h3><div class="small muted">${esc(s.b.t0)}–${esc(s.b.t1)} · ${esc(s.b.who)}</div>
        <div class="prog"><i style="width:${pct}%"></i></div></div>
        <div class="acts chips"><a class="btn pri sm" href="#/agenda">Ver la agenda</a>${s.b.pausa ? "" : `<button class="btn sec sm" data-timer="${s.d.key}|${s.b.t0}">${ic("timer")}Cronómetro</button>`}</div>`;
    } else if (s.d) {
      el.innerHTML = `<div class="ico">${ic("calendar")}</div><div><div class="eyebrow">${esc(s.d.label)}</div>
        <h3 style="margin:0">${s.next ? "Siguiente: " + esc(s.next.t) : "La jornada terminó. ¡Gracias por participar!"}</h3>
        <div class="small muted">${s.next ? esc(s.next.t0) + " · " + esc(s.next.who) : "Nos vemos en la siguiente sesión."}</div></div>
        <div class="acts"><a class="btn pri sm" href="#/agenda">Ver la agenda</a></div>`;
    } else {
      const f = s.first || D.dias[0];
      const dd = Math.max(0, Math.round((Date.parse(f.fecha + "T08:00:00-05:00") - Date.now()) / 864e5));
      el.innerHTML = `<div class="ico">${ic("sprout")}</div><div><div class="eyebrow">Próxima jornada</div>
        <h3 style="margin:0">${esc(f.label)} · ${esc(f.tema)}</h3>
        <div class="small muted">${s.first ? (dd > 0 ? "Faltan " + dd + (dd === 1 ? " día" : " días") + " · " : "") + "inicio 08:00, ciudad de Huánuco" : "El taller ya se realizó; los materiales siguen disponibles."}</div></div>
        <div class="acts"><a class="btn pri sm" href="#/agenda">Ver la agenda</a></div>`;
    }
  }

  /* inicio */
  $("#routeGrid").innerHTML = D.dias.map((d, i) => `<a class="card daycard lift" href="#/agenda/${d.key}" style="text-decoration:none">
      <img class="ph" src="${d.img}" alt="" loading="lazy"><div class="pad">
      <div class="eyebrow">Día ${i + 1} · ${esc(d.label)}</div><h3>${esc(d.tema)}</h3>
      <p class="small muted">${esc(d.publico)}</p>
      <ol>${d.bloques.filter(b => !b.pausa).slice(0, 10).map(b => `<li>${esc(b.t)}</li>`).join("")}</ol></div></a>`).join("");
  $("#resGrid").innerHTML = D.resultados.map(r => `<div class="card rcard"><img class="ph" src="${r.img}" alt="" loading="lazy"><div class="pad">
      <span class="tag">${r.r}</span><h3>${esc(r.n)}</h3><p class="small muted" style="margin:0">${esc(r.d)}</p></div></div>`).join("");
  const nTools = D.herr.length;
  $("#facts").innerHTML = [["5", "años de programa (2022–2026)"], ["6", "resultados, de la chacra a la política pública"], ["4", "criterios: impacto, sostenibilidad, eficacia y género"], [String(nTools), "herramientas de facilitación y documentación"]]
    .map(([v, l]) => `<div class="fact"><b>${v}</b><span class="small muted">${l}</span></div>`).join("");

  /* agenda */
  let day = D.dias[0].key;
  function renderAgenda() {
    const hk = location.hash.split("/")[2]; if (hk && D.dias.some(d => d.key === hk)) day = hk;
    $("#dayChips").innerHTML = D.dias.map((d, i) => `<button class="chip ${d.key === day ? "on" : ""}" data-day="${d.key}">Día ${i + 1} · ${esc(d.label)}</button>`).join("");
    const d = D.dias.find(x => x.key === day), n = nowPe();
    const opened = new Set([...document.querySelectorAll("#timeline .blk-row.open")].map(x => x.dataset.b));
    $("#dayInfo").textContent = d.tema + ". " + d.publico + ".";
    $("#timeline").innerHTML = d.bloques.map(b => {
      const live = d.fecha === n.ymd && n.min >= toMin(b.t0) && n.min < toMin(b.t1);
      const past = d.fecha < n.ymd || (d.fecha === n.ymd && n.min >= toMin(b.t1));
      if (b.pausa) return `<div class="blk-row pausa ${live ? "now" : ""} ${past ? "past" : ""}"><div class="hr">${b.t0}–${b.t1}</div><div><div class="tt">${esc(b.t)}</div></div><div></div></div>`;
      const tools = (b.h || []).map(c => c === "TJ" ? `<a class="tcode" href="#/participa">Trabajemos juntos</a>` : `<a class="tcode" href="#/herramientas/${c}">${c}</a>`).join("");
      return `<div class="blk-row ${live ? "now" : ""} ${live || opened.has(b.t0) ? "open" : ""} ${past ? "past" : ""}" data-b="${b.t0}">
        <div class="hr">${b.t0}–${b.t1}<span class="code">${b.c}</span></div>
        <div><div class="tt">${esc(b.t)}</div><div class="who">${esc(b.who)}</div><div class="tl">${tools}</div>
          <div class="detail"><p><b>Objetivo:</b> ${esc(b.obj)}</p><ol>${(b.pasos || []).map(p => `<li>${esc(p)}</li>`).join("")}</ol>
          <p class="small"><b>Producto o registro:</b> ${esc(b.prod)}</p></div></div>
        <div class="noprint"><button class="btn sec sm" data-timer="${d.key}|${b.t0}" title="Cronómetro de la sesión">${ic("timer")}</button></div></div>`;
    }).join("");
  }
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-day]"); if (c) { day = c.dataset.day; history.replaceState(null, "", "#/agenda/" + day); renderAgenda(); return; }
    const t = e.target.closest("[data-timer]"); if (t) { e.stopPropagation(); const [dk, t0] = t.dataset.timer.split("|"); const b = D.dias.find(x => x.key === dk).bloques.find(x => x.t0 === t0); openTimer(b); return; }
    const r = e.target.closest(".blk-row:not(.pausa)"); if (r && !e.target.closest("a,button,.detail")) r.classList.toggle("open");
  });

  /* herramientas */
  const GRUPOS = [["todas", "Todas"], ["c", "Comunes"], ["1", "Día 1"], ["2", "Día 2"], ["doc", "Documentación"]];
  let tf = "todas";
  function renderTools() {
    $("#toolChips").innerHTML = GRUPOS.map(([k, t]) => `<button class="chip ${k === tf ? "on" : ""}" data-tf="${k}">${t}</button>`).join("");
    $("#toolGrid").innerHTML = D.herr.filter(h => tf === "todas" || h.d.includes(tf)).map(h => `<button class="tcard lift" data-tool="${h.c}">
      <img class="ph" src="${h.img}" alt="" loading="lazy"><div class="bd"><span class="cd">${h.c}</span><span class="nm">${esc(h.n)}</span>
      <span class="ty">${esc(h.s)} · ${esc(h.f)}</span>${h.mode ? `<span class="badge">${ic("pen")}Interactiva</span>` : ""}</div></button>`).join("");
  }
  function openTool(code) {
    const h = toolByCode(code); if (!h) return;
    $("#modalBox").innerHTML = `<button class="x" data-close aria-label="Cerrar">×</button><img class="ph" src="${h.img}" alt="">
      <div class="pad"><div class="eyebrow">${h.c} · ${esc(h.s)}</div><h2>${esc(h.n)}</h2><p>${esc(h.p)}</p>
      <div class="kv"><div><b>Sesión</b>${esc(h.s)}</div><div><b>Responsable</b>${esc(h.who)}</div><div><b>Formato</b>${esc(h.f)}</div><div><b>Tipo</b>${h.mode ? "Interactiva" : "Ficha y formato"}</div></div>
      <h3>Instrucciones</h3><ol>${h.i.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
      <div class="chips" style="margin-top:14px">${h.mode ? `<a class="btn pri" href="herramientas/herramienta.html?id=${h.c}">${ic("pen")}Abrir la herramienta</a>` : ""}
      <a class="btn sec" href="${D.docs[1].u}" target="_blank" rel="noopener">${ic("file")}Formato en el Producto 2</a></div></div>`;
    $("#modal").classList.add("on");
  }
  document.addEventListener("click", e => {
    const f = e.target.closest("[data-tf]"); if (f) { tf = f.dataset.tf; renderTools(); return; }
    const t = e.target.closest("[data-tool]"); if (t) { openTool(t.dataset.tool); return; }
    if (e.target.closest("[data-close]") || e.target.id === "modal") $("#modal").classList.remove("on");
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { $("#modal").classList.remove("on"); closeTimer(); } });

  /* participa: QR hacia Trabajemos juntos */
  const tjUrl = () => new URL("trabajemos-juntos/grupos.html", location.href).href;
  let qrDone = false;
  function drawQR() {
    $("#qrUrl").textContent = tjUrl();
    if (qrDone || !window.QRCode) return;
    new QRCode($("#qr"), { text: tjUrl(), width: 220, height: 220, colorDark: "#3d2520", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    qrDone = true;
  }
  $("#qrBig").addEventListener("click", () => {
    $("#modalBox").innerHTML = `<button class="x" data-close aria-label="Cerrar">×</button><div class="pad" style="text-align:center">
      <div class="eyebrow">Trabajemos juntos · Taller Feed Good</div><h2>Escanee y entre a su mesa</h2><div id="qrL" style="display:inline-block;margin:10px auto"></div>
      <p class="muted" style="word-break:break-all">${esc(tjUrl())}</p></div>`;
    $("#modal").classList.add("on");
    if (window.QRCode) new QRCode($("#qrL"), { text: tjUrl(), width: 420, height: 420, colorDark: "#3d2520", colorLight: "#ffffff" });
  });

  /* documentos y créditos */
  $("#docGrid").innerHTML = D.docs.map(d => `<div class="card daycard"><img class="ph" src="${d.img}" alt="" loading="lazy"><div class="pad">
    <h3>${esc(d.t)}</h3><p class="small muted">${esc(d.d)}</p><div class="chips">
    <a class="btn pri sm" href="${d.u}" target="_blank" rel="noopener">${ic("file")}Ver PDF</a><a class="btn sec sm" href="${d.w}" download>${ic("download")}Descargar Word</a></div></div></div>`).join("");
  const cr = (D.creditos || []).concat((window.FG_CREDITOS || []).map(c => [c.archivo, c.titulo, c.autor, c.licencia, c.fuente]));
  $("#credits").innerHTML = "<b>Créditos de las fotografías.</b> " + cr.map(([f, t, a, l, u]) => `${esc(t)}: ${esc(a)} (${esc(l)}, <a href="${u}" target="_blank" rel="noopener">fuente</a>)`).join(" · ") +
    ". Las fotos de Wikimedia Commons se usan según su licencia; las de Iles de Paix provienen de su sitio web.";

  /* facilitador */
  const FAC = [
    ["Panel de Trabajemos juntos", "Crea la sesión del día 1 (miércoles 25) o del día 2 (jueves 26), envía la pregunta y controla las rondas (pide clave).", "trabajemos-juntos/admin.html", "shield", true],
    ["Versión sin internet", "La misma dinámica en una sola laptop, con pegado del chat de WhatsApp.", "trabajemos-juntos/pantalla-unica.html", "wifioff", true],
    ["Relatoría en vivo (D1)", "Registro de los aportes clave por sesión y mesa, con exportación a CSV.", "herramientas/herramienta.html?id=D1", "pen", false],
    ["Cronómetro de la sesión", "Proyecta el tiempo de la sesión en curso o de la que elija.", "#timer", "timer", false],
    ["Modo proyección", "Oculta los menús y agranda la letra para la pantalla de la sala.", "#proj", "monitor", false],
    ["Evaluación del taller (H22)", "Encuesta en una pantalla para cerrar cada jornada.", "herramientas/herramienta.html?id=H22", "users", false]
  ];
  $("#facGrid").innerHTML = FAC.map(([t, d, u, i, ext]) => `<a class="card pad lift" style="text-decoration:none;display:block" href="${u}" ${ext ? 'target="_blank" rel="noopener"' : ""} data-fac="${u}">
    <div class="now" style="grid-template-columns:auto 1fr"><div class="ico">${ic(i)}</div><div><h3 style="margin:0 0 4px">${esc(t)}</h3><p class="small muted" style="margin:0">${esc(d)}</p></div></div></a>`).join("");
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-fac]"); if (!a) return;
    const u = a.dataset.fac;
    if (u === "#timer") { e.preventDefault(); const s = status(); openTimer(s.b && !s.b.pausa ? s.b : { t: "Sesión", t0: "00:00", t1: "00:15", c: "" }); }
    if (u === "#proj") { e.preventDefault(); document.documentElement.classList.add("proj"); location.hash = "#/inicio"; }
  });
  $("#projX").addEventListener("click", () => document.documentElement.classList.remove("proj"));

  /* cronómetro */
  let tm = { left: 0, run: false, iv: null };
  const fmt = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  function paint() { $("#tmBig").textContent = fmt(tm.left); $("#tmBig").classList.toggle("alert", tm.left <= 60); $("#tmPlay").textContent = tm.run ? "Pausar" : "Continuar"; }
  function openTimer(b) {
    tm.total = (toMin(b.t1) - toMin(b.t0)) * 60; tm.left = tm.total; tm.run = true;
    $("#tmLabel").textContent = (b.c ? b.c + " · " : "") + b.t + " (" + b.t0 + "–" + b.t1 + ")";
    clearInterval(tm.iv); tm.iv = setInterval(() => { if (tm.run) { tm.left -= 1; if (tm.left <= 0) { tm.left = 0; tm.run = false; } paint(); } }, 1000);
    paint(); $("#timer").classList.add("on");
  }
  function closeTimer() { $("#timer").classList.remove("on"); clearInterval(tm.iv); }
  $("#tmPlay").onclick = () => { tm.run = !tm.run; paint(); };
  $("#tmPlus").onclick = () => { tm.left += 60; paint(); };
  $("#tmMinus").onclick = () => { tm.left -= 60; paint(); };
  $("#tmReset").onclick = () => { tm.left = tm.total; tm.run = true; paint(); };
  $("#tmClose").onclick = closeTimer;

  /* arranque */
  function deep() { const p = location.hash.split("/"); if (p[1] === "herramientas" && p[2]) openTool(p[2]); }
  renderTools(); renderAgenda(); renderNow(); route(); deep();
  window.addEventListener("hashchange", () => { renderAgenda(); deep(); });
  setInterval(() => { renderNow(); if ($("#v-agenda").classList.contains("on")) renderAgenda(); }, 30000);
})();
