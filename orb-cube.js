// Avistar voice cube — grainy liquid rounded cube (WebGL raymarch). Same API as orb.js: window.AvistarOrb.create(canvas, getState) -> {dispose}
(function () {
  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;varying vec2 v;uniform float t,a;uniform vec3 c0,c1,c2;uniform vec2 res;
  vec3 h3(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return -1.+2.*fract(sin(p)*43758.5453);}
  float n3(vec3 p){vec3 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
   return mix(mix(mix(dot(h3(i),f),dot(h3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(h3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(h3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
   mix(mix(dot(h3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(h3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(h3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(h3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);}
  float fbm(vec3 p){float s=0.,w=.5;for(int i=0;i<4;i++){s+=w*n3(p);p*=2.03;w*=.5;}return s;}
  float gr(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  mat3 rY(float x){float c=cos(x),s=sin(x);return mat3(c,0,-s,0,1,0,s,0,c);}
  mat3 rX(float x){float c=cos(x),s=sin(x);return mat3(1,0,0,0,c,s,0,-s,c);}
  float B;
  float sdf(vec3 p){vec3 q=abs(p)-vec3(B-.07);return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-.07;}
  void main(){vec2 q=v;
   B=.47+a*.025;
   mat3 R=rX(-.6155)*rY(.785398+t*.12+a*.15*sin(t*3.));
   vec3 ro=vec3(q,-3.),rd=vec3(0,0,1);
   float d=0.,h;bool hit=false;vec3 p;
   for(int i=0;i<64;i++){p=R*(ro+rd*d);h=sdf(p);if(h<.0008){hit=true;break;}d+=h;if(d>6.)break;}
   if(!hit){gl_FragColor=vec4(0);return;}
   vec2 e=vec2(.0015,0.);
   vec3 n=normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy),sdf(p+e.yxy)-sdf(p-e.yxy),sdf(p+e.yyx)-sdf(p-e.yyx)));
   vec3 nw=n*R;
   vec3 fp=p*2.1+vec3(0,0,t*.25);
   vec2 w=vec2(fbm(fp+vec3(0,0,t*.15)),fbm(fp+vec3(5.2,1.3,-t*.12)));
   float f=fbm(fp*1.2+vec3(w*(1.6+a*1.4),t*.2));
   vec3 L=normalize(vec3(-.5,.6,-.65));float dl=dot(nw,L)*.5+.5;
   vec3 col=mix(c2,c0,smoothstep(.15,.75,dl+f*.55));
   col=mix(col,c1,smoothstep(.6,1.05,dl+f*.8)*.85);
   float edge=1.-smoothstep(.0,.06,B-max(abs(p.x),max(abs(p.y),abs(p.z)))+.0);
   float ax=max(abs(n.x),max(abs(n.y),abs(n.z)));col=mix(col,c2,(1.-smoothstep(.75,.98,ax))*.35);
   float sp=pow(max(0.,dot(reflect(L,nw),vec3(0,0,-1))),20.);col+=c1*sp*.3;
   float g=gr(gl_FragCoord.xy+fract(t*7.)*91.)-.5;col+=g*.11;
   float m=1.-smoothstep(.0,.0015,h);
   gl_FragColor=vec4(col,1.);}`;
  const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
  function create(cv, get) {
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) throw new Error('WebGL unavailable');
    const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n); const ut = U('t'), ua = U('a'), u0 = U('c0'), u1 = U('c1'), u2 = U('c2'), ur = U('res');
    let raf, clock = 0, last = performance.now(), sm = 0, dead = false, vis = true;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }); io.observe(cv);
    const frame = now => {
      if (dead) return;
      if (!vis) { last = now; raf = requestAnimationFrame(frame); return; }
      const st = get(); const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (st.animated) clock += dt * st.speed;
      sm += (st.activity - sm) * Math.min(1, dt * 9);
      const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
      if (W && (cv.width !== W || cv.height !== H)) { cv.width = W; cv.height = H; }
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(ut, clock); gl.uniform1f(ua, sm); gl.uniform2f(ur, cv.width, cv.height);
      gl.uniform3fv(u0, hex(st.colors[0])); gl.uniform3fv(u1, hex(st.colors[1])); gl.uniform3fv(u2, hex(st.colors[2]));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      const k = 1 + sm * 0.04, ky = 1 - sm * 0.018; cv.style.transform = `translate3d(0,${-sm * 2}px,0) scale(${k},${ky})`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return { dispose() { dead = true; io.disconnect(); cancelAnimationFrame(raf); } };
  }
  window.AvistarOrb = { create };
})();
