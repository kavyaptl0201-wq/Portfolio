/**
 * Red smoke that follows the cursor: a small WebGL fluid simulation
 * (based on Pavel Dobryakov's MIT-licensed WebGL Fluid Simulation).
 */

const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const DENSITY_DISSIPATION = 2.2;
const VELOCITY_DISSIPATION = 2;
const PRESSURE = 0.1;
const PRESSURE_ITERATIONS = 20;
const CURL = 3;
const SPLAT_RADIUS = 0.7;
const SPLAT_FORCE = 5000;
const COLOR = [1.0 * 0.3, 0.3 * 0.3, 0.17 * 0.3];

const baseVertex = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv, vL, vR, vT, vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }`;

const head = `precision highp float; precision highp sampler2D; varying vec2 vUv, vL, vR, vT, vB;`;

const shaders = {
  clear: `${head} uniform sampler2D uTexture; uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`,
  display: `${head} uniform sampler2D uTexture;
    void main () { vec3 c = texture2D(uTexture, vUv).rgb; gl_FragColor = vec4(c, max(c.r, max(c.g, c.b))); }`,
  splat: `${head} uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main () {
      vec2 p = vUv - point; p.x *= aspectRatio;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p, p) / radius) * color, 1.0);
    }`,
  advection: `${head} uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
    }`,
  divergence: `${head} uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`,
  curl: `${head} uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }`,
  vorticity: `${head} uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x; float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
      vec2 v = texture2D(uVelocity, vUv).xy + force * dt;
      gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
    }`,
  pressure: `${head} uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
      gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
    }`,
  gradient: `${head} uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
      gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
    }`,
};

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };
type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; attach: (id: number) => number };
type DoubleFBO = { read: FBO; write: FBO; swap: () => void; texel: [number, number] };

/** Starts the smoke on the canvas. Returns a cleanup function, or null if WebGL is unavailable. */
export function startFluidSmoke(canvas: HTMLCanvasElement): (() => void) | null {
  const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
  let gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext | WebGLRenderingContext | null;
  const isGL2 = !!gl;
  if (!gl) gl = canvas.getContext('webgl', params) as WebGLRenderingContext | null;
  if (!gl) return null;
  const g = gl;

  // Half-float render targets
  let internalFormat: number;
  let texType: number;
  if (isGL2) {
    if (!g.getExtension('EXT_color_buffer_float')) return null;
    internalFormat = (g as WebGL2RenderingContext).RGBA16F;
    texType = (g as WebGL2RenderingContext).HALF_FLOAT;
  } else {
    const half = g.getExtension('OES_texture_half_float');
    if (!half) return null;
    g.getExtension('OES_texture_half_float_linear');
    internalFormat = g.RGBA;
    texType = half.HALF_FLOAT_OES;
  }

  const compile = (type: number, source: string) => {
    const shader = g.createShader(type)!;
    g.shaderSource(shader, source);
    g.compileShader(shader);
    return shader;
  };
  const vertex = compile(g.VERTEX_SHADER, baseVertex);
  const makeProgram = (fragment: string): Program => {
    const program = g.createProgram()!;
    g.attachShader(program, vertex);
    g.attachShader(program, compile(g.FRAGMENT_SHADER, fragment));
    g.bindAttribLocation(program, 0, 'aPosition');
    g.linkProgram(program);
    const uniforms: Program['uniforms'] = {};
    const count = g.getProgramParameter(program, g.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = g.getActiveUniform(program, i)!.name;
      uniforms[name] = g.getUniformLocation(program, name);
    }
    return { program, uniforms };
  };
  const p = Object.fromEntries(Object.entries(shaders).map(([k, src]) => [k, makeProgram(src)])) as Record<
    keyof typeof shaders,
    Program
  >;

  // Full-screen quad
  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), g.STATIC_DRAW);
  g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, g.createBuffer());
  g.bufferData(g.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), g.STATIC_DRAW);
  g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
  g.enableVertexAttribArray(0);

  const blit = (target: FBO | null) => {
    if (target) {
      g.viewport(0, 0, target.width, target.height);
      g.bindFramebuffer(g.FRAMEBUFFER, target.fbo);
    } else {
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.bindFramebuffer(g.FRAMEBUFFER, null);
    }
    g.drawElements(g.TRIANGLES, 6, g.UNSIGNED_SHORT, 0);
  };

  const createFBO = (w: number, h: number): FBO => {
    g.activeTexture(g.TEXTURE0);
    const texture = g.createTexture()!;
    g.bindTexture(g.TEXTURE_2D, texture);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, internalFormat, w, h, 0, g.RGBA, texType, null);
    const fbo = g.createFramebuffer()!;
    g.bindFramebuffer(g.FRAMEBUFFER, fbo);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
    g.viewport(0, 0, w, h);
    g.clear(g.COLOR_BUFFER_BIT);
    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach: (id) => {
        g.activeTexture(g.TEXTURE0 + id);
        g.bindTexture(g.TEXTURE_2D, texture);
        return id;
      },
    };
  };
  const createDoubleFBO = (w: number, h: number): DoubleFBO => {
    const d: DoubleFBO = {
      read: createFBO(w, h),
      write: createFBO(w, h),
      texel: [1 / w, 1 / h],
      swap: () => ([d.read, d.write] = [d.write, d.read]),
    };
    return d;
  };

  const resolution = (res: number) => {
    const aspect = g.drawingBufferWidth / g.drawingBufferHeight;
    const min = Math.round(res);
    const max = Math.round(res * (aspect < 1 ? 1 / aspect : aspect));
    return aspect > 1 ? [max, min] : [min, max];
  };

  let velocity: DoubleFBO, dye: DoubleFBO, pressure: DoubleFBO, divergence: FBO, curl: FBO;
  const initFramebuffers = () => {
    const [sw, sh] = resolution(SIM_RESOLUTION);
    const [dw, dh] = resolution(DYE_RESOLUTION);
    velocity = createDoubleFBO(sw, sh);
    pressure = createDoubleFBO(sw, sh);
    divergence = createFBO(sw, sh);
    curl = createFBO(sw, sh);
    dye = createDoubleFBO(dw, dh);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w;
    canvas.height = h;
    return true;
  };
  resize();
  initFramebuffers();

  const use = (prog: Program) => {
    g.useProgram(prog.program);
    return prog.uniforms;
  };

  const splat = (x: number, y: number, dx: number, dy: number) => {
    const aspect = canvas.width / canvas.height;
    const u = use(p.splat);
    g.uniform1i(u.uTarget, velocity.read.attach(0));
    g.uniform1f(u.aspectRatio, aspect);
    g.uniform2f(u.point, x, y);
    g.uniform3f(u.color, dx, dy, 0);
    g.uniform1f(u.radius, (SPLAT_RADIUS / 100) * (aspect > 1 ? aspect : 1));
    blit(velocity.write);
    velocity.swap();
    g.uniform1i(u.uTarget, dye.read.attach(0));
    g.uniform3f(u.color, COLOR[0], COLOR[1], COLOR[2]);
    blit(dye.write);
    dye.swap();
  };

  const step = (dt: number) => {
    g.disable(g.BLEND);
    let u = use(p.curl);
    g.uniform2f(u.texelSize, ...velocity.texel);
    g.uniform1i(u.uVelocity, velocity.read.attach(0));
    blit(curl);

    u = use(p.vorticity);
    g.uniform2f(u.texelSize, ...velocity.texel);
    g.uniform1i(u.uVelocity, velocity.read.attach(0));
    g.uniform1i(u.uCurl, curl.attach(1));
    g.uniform1f(u.curl, CURL);
    g.uniform1f(u.dt, dt);
    blit(velocity.write);
    velocity.swap();

    u = use(p.divergence);
    g.uniform2f(u.texelSize, ...velocity.texel);
    g.uniform1i(u.uVelocity, velocity.read.attach(0));
    blit(divergence);

    u = use(p.clear);
    g.uniform1i(u.uTexture, pressure.read.attach(0));
    g.uniform1f(u.value, PRESSURE);
    blit(pressure.write);
    pressure.swap();

    u = use(p.pressure);
    g.uniform2f(u.texelSize, ...velocity.texel);
    g.uniform1i(u.uDivergence, divergence.attach(0));
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      g.uniform1i(u.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    u = use(p.gradient);
    g.uniform2f(u.texelSize, ...velocity.texel);
    g.uniform1i(u.uPressure, pressure.read.attach(0));
    g.uniform1i(u.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    u = use(p.advection);
    g.uniform2f(u.texelSize, ...velocity.texel);
    g.uniform1i(u.uVelocity, velocity.read.attach(0));
    g.uniform1i(u.uSource, velocity.read.attach(0));
    g.uniform1f(u.dt, dt);
    g.uniform1f(u.dissipation, VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    g.uniform1i(u.uVelocity, velocity.read.attach(0));
    g.uniform1i(u.uSource, dye.read.attach(1));
    g.uniform1f(u.dissipation, DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  };

  const render = () => {
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
    g.enable(g.BLEND);
    const u = use(p.display);
    g.uniform1i(u.uTexture, dye.read.attach(0));
    blit(null);
  };

  // Pointer input, in texture coordinates
  const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false, started: false };
  const onMove = (e: PointerEvent) => {
    const x = e.clientX / canvas.clientWidth;
    const y = 1 - e.clientY / canvas.clientHeight;
    if (pointer.started) {
      const aspect = canvas.width / canvas.height;
      pointer.dx = (x - pointer.x) * (aspect < 1 ? aspect : 1);
      pointer.dy = (y - pointer.y) / (aspect > 1 ? aspect : 1);
      pointer.moved = Math.abs(pointer.dx) + Math.abs(pointer.dy) > 0;
    }
    pointer.x = x;
    pointer.y = y;
    pointer.started = true;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  // One soft puff where the cursor is when the smoke appears (screen centre if it hasn't moved yet)
  const puff = (x: number, y: number) => {
    for (let i = 0; i < 6; i++) splat(x, y, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
  };
  puff(0.5, 0.5);

  let last = performance.now();
  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 1 / 60);
    last = now;
    if (resize()) initFramebuffers();
    if (pointer.moved) {
      pointer.moved = false;
      splat(pointer.x, pointer.y, pointer.dx * SPLAT_FORCE, pointer.dy * SPLAT_FORCE);
    }
    step(dt);
    render();
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    g.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
