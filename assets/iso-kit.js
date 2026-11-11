(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function mk(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function f(v) { return (+v).toFixed(2); }
  function Scene(svg, S) {
    this.svg = svg; this.S = S;
    var defs = mk('defs', {}, svg);
    var g = mk('linearGradient', { id: 'isoG', x1: 0, y1: 1, x2: 1, y2: 0 }, defs); mk('stop', { offset: 0, 'stop-color': '#FF4B1F' }, g); mk('stop', { offset: 1, 'stop-color': '#1FDDFF' }, g);
    var r = mk('radialGradient', { id: 'isoGlow', cx: '50%', cy: '50%', r: '50%' }, defs); mk('stop', { offset: 0, 'stop-color': '#1FDDFF', 'stop-opacity': '.55' }, r); mk('stop', { offset: .6, 'stop-color': '#1FDDFF', 'stop-opacity': '.12' }, r); mk('stop', { offset: 1, 'stop-color': '#1FDDFF', 'stop-opacity': 0 }, r);
    var r2 = mk('radialGradient', { id: 'isoGlowO', cx: '50%', cy: '50%', r: '50%' }, defs); mk('stop', { offset: 0, 'stop-color': '#FF4B1F', 'stop-opacity': '.5' }, r2); mk('stop', { offset: .6, 'stop-color': '#FF4B1F', 'stop-opacity': '.1' }, r2); mk('stop', { offset: 1, 'stop-color': '#FF4B1F', 'stop-opacity': 0 }, r2);
    this.defs = defs; this.root = mk('g', {}, svg);
  }
  Scene.prototype.P = function (x, y, z) { var S = this.S; return [(x - y) * 0.866 * S, (x + y) * 0.5 * S - z * S]; };
  Scene.prototype.g = function (cls, p) { return mk('g', { class: cls || '' }, p || this.root); };
  Scene.prototype.poly = function (pts, cls, p) { return mk('polygon', { points: pts.map(function (q) { return f(q[0]) + ',' + f(q[1]); }).join(' '), class: cls }, p || this.root); };
  Scene.prototype.box = function (x, y, z, w, d, h, o) {
    o = o || {}; var s = this, P = function (a, b, c) { return s.P(a, b, c); }, g = mk('g', { class: o.cls || '' }, o.parent || this.root);
    this.poly([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)], o.right || 'f-grad', g);
    this.poly([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)], o.left || 'f-paper', g);
    this.poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], o.top || 'f-white', g);
    return g;
  };
  Scene.prototype.topM = function (x, y, z) { var S = this.S, o = this.P(x, y, z); return 'matrix(' + [0.866 * S, 0.5 * S, -0.866 * S, 0.5 * S, o[0], o[1]].map(f).join(',') + ')'; };
  Scene.prototype.leftM = function (x, y, z) { var S = this.S, o = this.P(x, y, z); return 'matrix(' + [0.866 * S, 0.5 * S, 0, S, o[0], o[1]].map(f).join(',') + ')'; };
  Scene.prototype.text = function (m, str, size, o, p) { o = o || {}; var g = mk('g', { transform: m }, p || this.root); var t = mk('text', { x: o.x || 0, y: o.y || 0, class: o.cls || 'lbl', 'font-size': size, 'text-anchor': o.anchor || 'start', 'letter-spacing': o.ls == null ? size * 0.18 : o.ls }, g); t.textContent = str; return g; };
  Scene.prototype.topText = function (x, y, z, str, size, o, p) { return this.text(this.topM(x, y, z), str, size, o, p); };
  Scene.prototype.leftText = function (x, y, z, str, size, o, p) { return this.text(this.leftM(x, y, z), str, size, o, p); };
  Scene.prototype.ell = function (cx, cy, z, r, cls, p, attrs) {
    var pts = []; for (var i = 0; i < 64; i++) { var t = i / 64 * Math.PI * 2; pts.push(this.P(cx + r * Math.cos(t), cy + r * Math.sin(t), z)); }
    var a = { d: 'M' + pts.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join('L') + 'Z', class: cls }; for (var k in attrs || {}) a[k] = attrs[k];
    return mk('path', a, p || this.root);
  };
  Scene.prototype.disc = function (cx, cy, z, r, h, p) { var g = this.g('', p); this.ell(cx, cy, z, r, 'f-grad', g); this.ell(cx, cy, z + h, r, 'f-white', g); return g; };
  Scene.prototype.line = function (a, b, cls, p, attrs) { var o = { d: 'M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]), class: cls }; for (var k in attrs || {}) o[k] = attrs[k]; return mk('path', o, p || this.root); };
  Scene.prototype.flag = function (pt, lift, label, cls, p) {
    var g = mk('g', { class: cls || '' }, p || this.root), y = pt[1] - lift, w = label.length * 7.4 + 30;
    mk('path', { d: 'M' + f(pt[0]) + ' ' + f(pt[1]) + 'V' + f(y + 22), class: 'ink-line' }, g);
    mk('rect', { x: f(pt[0]), y: f(y), width: f(w), height: 22, rx: 3, class: 'f-white' }, g);
    mk('circle', { cx: f(pt[0] + 11), cy: f(y + 11), r: 3.5, fill: 'url(#isoG)' }, g);
    var t = mk('text', { x: f(pt[0] + 20), y: f(y + 15), class: 'lbl', 'font-size': 10.5, 'letter-spacing': 1 }, g); t.textContent = label;
    return g;
  };
  Scene.prototype.fit = function (pad) { var b = this.root.getBBox(), p = pad || 16; this.svg.setAttribute('viewBox', [b.x - p, b.y - p, b.width + 2 * p, b.height + 2 * p].map(f).join(' ')); };
  window.Iso = { Scene: Scene, mk: mk };
})();
