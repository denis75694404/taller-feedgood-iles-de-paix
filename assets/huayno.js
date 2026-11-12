/* Huayno instrumental generado en el navegador (Web Audio): quena, charango, arpa y bombo.
   Escala pentatónica andina en la menor, compás de 2/4 con la figura típica del huayno
   (corchea con puntillo, semicorchea y dos corcheas). Sin archivos ni licencias de terceros. */
window.Huayno = (function () {
  const BPM = 112, SEMI = 60 / BPM / 4;              // duración de una semicorchea
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  // melodía: [nota MIDI, semicorcheas]; 8 semicorcheas por compás
  const A = [[76,3],[74,1],[72,2],[74,2], [76,3],[79,1],[76,2],[74,2], [72,3],[74,1],[72,2],[69,2], [72,4],[69,4],
             [76,3],[74,1],[72,2],[74,2], [76,3],[79,1],[81,2],[79,2], [76,3],[74,1],[72,2],[74,2], [69,8]];
  const B = [[81,3],[79,1],[76,2],[79,2], [81,3],[84,1],[81,2],[79,2], [76,3],[79,1],[76,2],[74,2], [72,4],[74,4],
             [76,3],[74,1],[72,2],[74,2], [76,3],[74,1],[72,2],[69,2], [72,3],[74,1],[72,2],[67,2], [69,8]];
  const MEL = A.concat(A, B, A);
  const CH = { Am: { t: [69, 72, 76, 81], b: [45, 52] }, C: { t: [67, 72, 76, 79], b: [48, 55] }, G: { t: [67, 71, 74, 79], b: [43, 50] } };
  const PROG = ["Am", "C", "Am", "Am", "Am", "C", "G", "Am"].concat(["Am", "C", "Am", "Am", "Am", "C", "G", "Am"],
               ["Am", "C", "C", "G", "C", "Am", "G", "Am"], ["Am", "C", "Am", "Am", "Am", "C", "G", "Am"]);
  const BARS = PROG.length;                          // 32 compases y vuelve a empezar

  let ctx = null, master = null, rev = null, timer = null, playing = false;
  let nextT = 0, s16 = 0, melIdx = 0, melLeft = 0;

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // reverberación sencilla (eco de valle)
    rev = ctx.createConvolver();
    const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    rev.buffer = ir;
    const rg = ctx.createGain(); rg.gain.value = 0.28; rev.connect(rg); rg.connect(master);
  }
  function out(node, wet) { node.connect(master); if (wet) { const g = ctx.createGain(); g.gain.value = wet; node.connect(g); g.connect(rev); } }

  function quena(n, t, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "triangle"; o2.type = "sine"; o.frequency.value = hz(n); o2.frequency.value = hz(n) * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(lp);
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.2; vg.gain.value = 0;
    vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(hz(n) * 0.012, t + Math.min(dur, 0.25));
    vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    lp.type = "lowpass"; lp.frequency.value = 2600; o.connect(lp); lp.connect(g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.035);
    g.gain.setValueAtTime(0.17, t + dur * 0.7); g.gain.linearRampToValueAtTime(0, t + dur + 0.06);
    out(g, 0.55);
    // soplo de la quena
    const nb = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    ns.buffer = nb; bp.type = "bandpass"; bp.frequency.value = hz(n) * 2; bp.Q.value = 3;
    ng.gain.setValueAtTime(0.06, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    ns.connect(bp); bp.connect(ng); out(ng, 0.3);
    [o, o2, vib].forEach(x => { x.start(t); x.stop(t + dur + 0.1); }); ns.start(t);
  }
  function charango(notes, t, vol, up) {
    (up ? [...notes].reverse() : notes).forEach((n, i) => {
      const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), tt = t + i * 0.012;
      o.type = "sawtooth"; o.frequency.value = hz(n); lp.type = "lowpass"; lp.frequency.value = 3200;
      g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(vol, tt + 0.003); g.gain.exponentialRampToValueAtTime(0.0008, tt + 0.32);
      o.connect(lp); lp.connect(g); out(g, 0.25); o.start(tt); o.stop(tt + 0.35);
    });
  }
  function arpa(n, t) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.value = hz(n); lp.type = "lowpass"; lp.frequency.value = 900;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.32, t + 0.005); g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    o.connect(lp); lp.connect(g); out(g, 0.2); o.start(t); o.stop(t + 0.95);
  }
  function bombo(t, v) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(v * 0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); out(g, 0.1); o.start(t); o.stop(t + 0.32);
  }

  function tick() {
    while (nextT < ctx.currentTime + 0.15) {
      const bar = Math.floor(s16 / 8) % BARS, pos = s16 % 8, ch = CH[PROG[bar]];
      if (melLeft <= 0) { const [n, d] = MEL[melIdx]; quena(n, nextT, d * SEMI); melLeft = d; melIdx = (melIdx + 1) % MEL.length; }
      melLeft--;
      if (pos === 0 || pos === 3 || pos === 4 || pos === 6) charango(ch.t, nextT, pos === 0 ? 0.05 : 0.032, pos === 3 || pos === 6);
      if (pos === 0) arpa(ch.b[0], nextT); if (pos === 4) arpa(ch.b[1], nextT);
      if (pos === 0) bombo(nextT, 1); if (pos === 3) bombo(nextT, 0.45); if (pos === 4) bombo(nextT, 0.7);
      nextT += SEMI; s16 = (s16 + 1) % (BARS * 8);
    }
  }
  function start() {
    if (playing) return;
    if (!ctx) setup();
    ctx.resume();
    playing = true; nextT = ctx.currentTime + 0.1;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 1.5);
    timer = setInterval(tick, 25); tick();
  }
  function stop() {
    if (!playing) return;
    playing = false; clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  }
  return { start, stop, get playing() { return playing; } };
})();
