// Animated ocean whose surface height follows the tide (WebGL, with a 2D canvas fallback).
import { prefersReducedMotion } from './util.js';

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision mediump float;
uniform vec2 res; uniform float time; uniform float level;
uniform vec3 skyA; uniform vec3 skyB; uniform vec3 waterTop; uniform vec3 waterDeep; uniform vec3 foam;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float waves(float x, float t){
  return sin(x*3.1 + t*.9)*.010 + sin(x*7.3 - t*1.4)*.006 + sin(x*13.7 + t*2.1)*.003 + (noise(vec2(x*4., t*.35))-.5)*.012;
}
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  float aspect = res.x / res.y;
  float x = uv.x * aspect;
  float surf = level + waves(x, time);
  float back = level + .028 + waves(x*.7 + 3., time*.6) * .8;
  vec3 sky = mix(skyB, skyA, smoothstep(0., 1., uv.y));
  vec3 col = sky;
  // distant swell line
  if (uv.y < back) col = mix(sky, waterTop * .7 + sky * .3, .55);
  if (uv.y < surf) {
    float depth = clamp((surf - uv.y) / max(surf, .001), 0., 1.);
    vec3 w = mix(waterTop, waterDeep, pow(depth, .7));
    // caustics
    float c = noise(vec2(x*9., uv.y*14. - time*.6)) * noise(vec2(x*5. + time*.3, uv.y*9.));
    w += foam * pow(c, 3.) * .25 * (1. - depth);
    // suspended particles
    float pr = hash(floor(vec2(x*90., (uv.y + time*.004)*90.)));
    w += foam * step(.997, pr) * .35 * (1. - depth * .6);
    col = w;
    // foam line
    float edge = smoothstep(.012, 0., surf - uv.y);
    col = mix(col, foam, edge * .55);
  }
  // highlight just above the surface
  col += foam * smoothstep(.02, 0., abs(uv.y - surf)) * .08;
  gl_FragColor = vec4(col, 1.);
}`;

function cssColor(name) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = v.match(/^#([0-9a-f]{6})$/i);
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function createWater(canvas) {
  let target = 0.45;
  let level = 0.45;
  let raf = 0;
  let first = true;
  let onScreen = true;
  let colors = null;
  const start = performance.now();
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });

  const readColors = () => {
    colors = {
      skyA: cssColor('--abyss'), skyB: cssColor('--deep'), waterTop: cssColor('--water-top'),
      waterDeep: cssColor('--water-deep'), foam: cssColor('--foam'),
    };
  };
  readColors();

  let draw;
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const U = { res: u('res'), time: u('time'), level: u('level'), skyA: u('skyA'), skyB: u('skyB'), waterTop: u('waterTop'), waterDeep: u('waterDeep'), foam: u('foam') };
    draw = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, t);
      gl.uniform1f(U.level, level);
      ['skyA', 'skyB', 'waterTop', 'waterDeep', 'foam'].forEach((k) => gl.uniform3fv(U[k], colors[k]));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  } else {
    const ctx = canvas.getContext('2d');
    const rgb = (c) => `rgb(${c.map((v) => Math.round(v * 255)).join(',')})`;
    draw = (t) => {
      const { width: w, height: hgt } = canvas;
      ctx.fillStyle = rgb(colors.skyA);
      ctx.fillRect(0, 0, w, hgt);
      const y0 = hgt * (1 - level);
      const g = ctx.createLinearGradient(0, y0, 0, hgt);
      g.addColorStop(0, rgb(colors.waterTop));
      g.addColorStop(1, rgb(colors.waterDeep));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, hgt);
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, y0 + Math.sin(x / 60 + t) * 6 + Math.sin(x / 23 - t * 1.4) * 3);
      ctx.lineTo(w, hgt);
      ctx.fill();
    };
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr * 0.75));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr * 0.75));
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const loop = () => {
    level += (target - level) * 0.06;
    const still = prefersReducedMotion();
    draw(still ? 0 : (performance.now() - start) / 1000);
    if (still && Math.abs(target - level) < 0.0005) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && onScreen !== false) raf = requestAnimationFrame(loop); };
  // Pause when the tab is hidden or the canvas is scrolled off-screen (battery).
  const pause = () => { cancelAnimationFrame(raf); raf = 0; };
  const onVis = () => { if (document.hidden) pause(); else if (onScreen) kick(); };
  document.addEventListener('visibilitychange', onVis);
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen && !document.hidden) kick(); else pause();
  }) : null;
  io?.observe(canvas);
  kick();

  return {
    /** fraction 0..1 of the canvas height filled with water */
    setLevel(f) {
      target = Math.min(0.92, Math.max(0.05, f));
      if (first) { level = target; first = false; draw(prefersReducedMotion() ? 0 : (performance.now() - start) / 1000); } // no slow fill on first paint
      kick();
    },
    refreshTheme() { readColors(); kick(); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); io?.disconnect(); document.removeEventListener('visibilitychange', onVis); },
  };
}
