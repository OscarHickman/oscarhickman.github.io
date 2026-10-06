/**
 * WebGL renderer for a flight through the periodic cosmic-web box.
 *
 * Every particle is drawn as a crisp, anti-aliased point, larger when near
 * and smaller and fainter with distance, the way N-body simulations are
 * rendered; filaments emerge from the points crowding together. The points
 * add up in an off-screen light buffer, which a second pass tone-maps and
 * colours so dense nodes brighten smoothly instead of clipping. Copies of the
 * box are tiled out to `reach` so distant structure fills the view; fog hides
 * where the tiling ends.
 */
import type { FlightPose, Vec3 } from './cosmic-flight'
import type { CosmicWebField } from './cosmic-web'
import { visibleCopies } from './cosmic-flight'

export type Rgb = [number, number, number]

export interface CosmicWebTheme {
  /** Colour of thin, low-density structure. */
  thin: Rgb
  /** Colour of dense filaments and nodes. */
  dense: Rgb
  /** Peak opacity of the tone-mapped light. */
  strength: number
}

export interface CosmicWebFrame {
  growth: number
  pose: FlightPose
  /** Multiplies the strength while the web fades in. */
  fade: number
}

export interface CosmicWebRenderer {
  draw: (frame: CosmicWebFrame) => void
  /** Size in CSS pixels, drawn at up to `pixelRatio` device pixels each. */
  resize: (width: number, height: number, pixelRatio: number) => void
  /** Light buffer resolution as a fraction of full; lower is cheaper and softer. */
  setQuality: (scale: number) => void
  setTheme: (theme: CosmicWebTheme) => void
  dispose: () => void
}

// All distances are in box lengths
const FIELD_OF_VIEW = (65 * Math.PI) / 180
const FOG_START = 0.5
const FOG_END = 1.5
// Particles fade in over this depth range so none swell up in front of the camera
const NEAR_START = 0.05
const NEAR_END = 0.16
const MAX_PIXEL_RATIO = 2
// Light is gathered at screen resolution up to about 1920x1200; beyond that
// (high-DPI and 4K screens) the fill cost grows faster than the visible gain
const MAX_LIGHT_PIXELS = 1920 * 1200
// Point radius in pixels at the reference depth, for a 1080p-tall view;
// it scales with the focal length so points look the same on every screen
const POINT_RADIUS = 1.2
const POINT_REFERENCE_DEPTH = 0.25
const MAX_POINT_RADIUS = 1.6
// Smaller points dim by their coverage instead of shrinking below this
const MIN_POINT_RADIUS = 0.5
const REFERENCE_FOCAL_PIXELS = 848
// Brightness grows with density as density^p so filaments and nodes stand out
const DENSITY_POWER = 0.7
const EXPOSURE = 0.45
// 8-bit fallback stores light scaled into [0, 1]
const BYTE_ENCODING = 1 / 12

const f = (value: number) => value.toFixed(6)

const POINT_VERTEX = `
attribute vec3 a_position;
attribute vec3 a_displacement;
attribute vec3 a_invariants;
uniform float u_cells;
uniform float u_growth;
uniform vec3 u_camera;
uniform vec3 u_offset;
uniform vec3 u_right;
uniform vec3 u_up;
uniform vec3 u_forward;
uniform vec2 u_scale;
uniform float u_pixelScale;
uniform float u_encode;
varying float v_light;
varying float v_dense;
varying float v_radius;
varying float v_size;

void main() {
  // Position relative to the camera in the periodic copy at u_offset
  vec3 x = (a_position + u_growth * a_displacement) / u_cells;
  vec3 rel = mod(x - u_camera + 0.5, 1.0) - 0.5 + u_offset;
  vec3 view = vec3(dot(rel, u_right), dot(rel, u_up), dot(rel, u_forward));
  float dist = length(rel);
  if (view.z <= ${f(NEAR_START)} || dist >= ${f(FOG_END)}) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }
  gl_Position = vec4(view.xy * u_scale, 0.0, view.z);

  // Zel'dovich density contrast: 1 / |det(I + D dpsi/dq)|
  float D = u_growth;
  float volume = 1.0 + D * a_invariants.x + D * D * a_invariants.y + D * D * D * a_invariants.z;
  float density = 1.0 / max(abs(volume), 0.03);

  float radius = min(${f(POINT_RADIUS * POINT_REFERENCE_DEPTH)} / view.z, ${f(MAX_POINT_RADIUS)}) * u_pixelScale;
  float coverage = min(radius * radius / ${f(MIN_POINT_RADIUS * MIN_POINT_RADIUS)}, 1.0);
  radius = max(radius, ${f(MIN_POINT_RADIUS)});
  float fog = 1.0 - smoothstep(${f(FOG_START)}, ${f(FOG_END)}, dist);
  float near = smoothstep(${f(NEAR_START)}, ${f(NEAR_END)}, view.z);

  v_light = u_encode * pow(density, ${f(DENSITY_POWER)}) * fog * near * coverage;
  v_dense = smoothstep(2.0, 12.0, density);
  v_radius = radius;
  // One extra pixel each side for the anti-aliased edge
  v_size = 2.0 * radius + 2.0;
  gl_PointSize = v_size;
}
`

const POINT_FRAGMENT = `
// Faint distant points underflow at medium precision on some GPUs
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying float v_light;
varying float v_dense;
varying float v_radius;
varying float v_size;

void main() {
  // Distance from the point centre in pixels, with a one-pixel soft edge
  float d = length(gl_PointCoord - 0.5) * v_size;
  float light = v_light * clamp(v_radius + 0.5 - d, 0.0, 1.0);
  gl_FragColor = vec4(light, light * v_dense, 0.0, 0.0);
}
`

const COMPOSITE_VERTEX = `
attribute vec2 a_corner;
varying vec2 v_uv;

void main() {
  v_uv = a_corner * 0.5 + 0.5;
  gl_Position = vec4(a_corner, 0.0, 1.0);
}
`

const COMPOSITE_FRAGMENT = `
precision mediump float;
uniform sampler2D u_light;
uniform float u_decode;
uniform float u_exposure;
uniform float u_strength;
uniform vec3 u_colorThin;
uniform vec3 u_colorDense;
varying vec2 v_uv;

void main() {
  vec2 sum = texture2D(u_light, v_uv).rg * u_decode;
  float tone = 1.0 - exp(-u_exposure * sum.r);
  vec3 color = mix(u_colorThin, u_colorDense, clamp(sum.g / max(sum.r, 1e-4), 0.0, 1.0));
  float alpha = tone * u_strength;
  gl_FragColor = vec4(color * alpha, alpha);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader)
    return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('Cosmic web shader failed to compile:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program)
    return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Cosmic web program failed to link:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/** Interleave per-particle data: q (3), ψ (3), deformation invariants (3). */
function interleave(web: CosmicWebField): Float32Array {
  const data = new Float32Array(web.count * 9)
  for (let i = 0; i < web.count; i++) {
    const o = i * 9
    for (let c = 0; c < 3; c++) {
      data[o + c] = web.positions[3 * i + c]
      data[o + 3 + c] = web.displacements[3 * i + c]
      data[o + 6 + c] = web.invariants[3 * i + c]
    }
  }
  return data
}

interface LightFormat {
  type: number
  filter: number
  encode: number
}

/**
 * Prefer a half-float light buffer, which keeps faint distant points; fall back
 * to 8 bits, where they are quantised away but the bright web survives.
 */
function lightFormats(gl: WebGLRenderingContext): LightFormat[] {
  const formats: LightFormat[] = []
  const halfFloat = gl.getExtension('OES_texture_half_float')
  if (halfFloat) {
    gl.getExtension('EXT_color_buffer_half_float')
    const filter = gl.getExtension('OES_texture_half_float_linear') ? gl.LINEAR : gl.NEAREST
    formats.push({ type: halfFloat.HALF_FLOAT_OES, filter, encode: 1 })
  }
  formats.push({ type: gl.UNSIGNED_BYTE, filter: gl.LINEAR, encode: BYTE_ENCODING })
  return formats
}

interface LightBuffer {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
  format: LightFormat
}

function createLightBuffer(gl: WebGLRenderingContext, width: number, height: number): LightBuffer | null {
  for (const format of lightFormats(gl)) {
    const texture = gl.createTexture()
    const framebuffer = gl.createFramebuffer()
    if (!texture || !framebuffer)
      return null
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, format.type, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, format.filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, format.filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE)
      return { texture, framebuffer, format }
    gl.deleteFramebuffer(framebuffer)
    gl.deleteTexture(texture)
  }
  return null
}

function uniformsOf(gl: WebGLRenderingContext, program: WebGLProgram, names: readonly string[]) {
  return Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]))
}

const POINT_UNIFORMS = ['u_cells', 'u_growth', 'u_camera', 'u_offset', 'u_right', 'u_up', 'u_forward', 'u_scale', 'u_pixelScale', 'u_encode'] as const
const COMPOSITE_UNIFORMS = ['u_light', 'u_decode', 'u_exposure', 'u_strength', 'u_colorThin', 'u_colorDense'] as const

export function createCosmicWebRenderer(canvas: HTMLCanvasElement, web: CosmicWebField): CosmicWebRenderer | null {
  const context = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: true })
  if (!context)
    return null
  const gl: WebGLRenderingContext = context
  const points = createProgram(gl, POINT_VERTEX, POINT_FRAGMENT)
  const composite = createProgram(gl, COMPOSITE_VERTEX, COMPOSITE_FRAGMENT)
  const particles = gl.createBuffer()
  const triangle = gl.createBuffer()
  if (!points || !composite || !particles || !triangle)
    return null
  // Without any renderable light buffer there is nothing to draw
  const probe = createLightBuffer(gl, 1, 1)
  if (!probe)
    return null
  gl.deleteFramebuffer(probe.framebuffer)
  gl.deleteTexture(probe.texture)

  gl.bindBuffer(gl.ARRAY_BUFFER, particles)
  gl.bufferData(gl.ARRAY_BUFFER, interleave(web), gl.STATIC_DRAW)
  // One triangle that covers the screen
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const pointUniforms = uniformsOf(gl, points, POINT_UNIFORMS)
  const compositeUniforms = uniformsOf(gl, composite, COMPOSITE_UNIFORMS)
  const pointAttributes = (['a_position', 'a_displacement', 'a_invariants'] as const).map(name => gl.getAttribLocation(points, name))
  const cornerAttribute = gl.getAttribLocation(composite, 'a_corner')

  let light: LightBuffer | null = null
  let quality = 1
  let bufferWidth = 1
  let bufferHeight = 1
  let scale: [number, number] = [1, 1]
  let focalPixels = 1
  let theme: CosmicWebTheme = { thin: [1, 1, 1], dense: [1, 1, 1], strength: 1 }

  function bindPoints() {
    gl.useProgram(points)
    gl.bindBuffer(gl.ARRAY_BUFFER, particles)
    const bytes = Float32Array.BYTES_PER_ELEMENT
    pointAttributes.forEach((location, i) => {
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 9 * bytes, 3 * i * bytes)
    })
  }

  function unbindPoints() {
    for (const location of pointAttributes)
      gl.disableVertexAttribArray(location)
  }

  function drawLight(frame: CosmicWebFrame) {
    if (!light)
      return
    gl.bindFramebuffer(gl.FRAMEBUFFER, light.framebuffer)
    gl.viewport(0, 0, bufferWidth, bufferHeight)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    bindPoints()

    const { pose } = frame
    const camera = pose.position.map(c => c - Math.floor(c)) as Vec3
    gl.uniform1f(pointUniforms.u_cells, web.size)
    gl.uniform1f(pointUniforms.u_growth, frame.growth)
    gl.uniform3fv(pointUniforms.u_camera, camera)
    gl.uniform3fv(pointUniforms.u_right, pose.right)
    gl.uniform3fv(pointUniforms.u_up, pose.up)
    gl.uniform3fv(pointUniforms.u_forward, pose.forward)
    gl.uniform2fv(pointUniforms.u_scale, scale)
    gl.uniform1f(pointUniforms.u_pixelScale, focalPixels / REFERENCE_FOCAL_PIXELS)
    gl.uniform1f(pointUniforms.u_encode, light.format.encode)
    for (const offset of visibleCopies(pose, scale, FOG_END)) {
      gl.uniform3fv(pointUniforms.u_offset, offset)
      gl.drawArrays(gl.POINTS, 0, web.count)
    }
    unbindPoints()
  }

  function drawComposite(frame: CosmicWebFrame) {
    if (!light)
      return
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.disable(gl.BLEND)
    gl.useProgram(composite)
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle)
    gl.enableVertexAttribArray(cornerAttribute)
    gl.vertexAttribPointer(cornerAttribute, 2, gl.FLOAT, false, 0, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, light.texture)
    gl.uniform1i(compositeUniforms.u_light, 0)
    gl.uniform1f(compositeUniforms.u_decode, 1 / light.format.encode)
    gl.uniform1f(compositeUniforms.u_exposure, EXPOSURE)
    gl.uniform1f(compositeUniforms.u_strength, theme.strength * frame.fade)
    gl.uniform3fv(compositeUniforms.u_colorThin, theme.thin)
    gl.uniform3fv(compositeUniforms.u_colorDense, theme.dense)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.disableVertexAttribArray(cornerAttribute)
  }

  function releaseLight() {
    if (!light)
      return
    gl.deleteFramebuffer(light.framebuffer)
    gl.deleteTexture(light.texture)
    light = null
  }

  /** (Re)allocate the light buffer for the current canvas size and quality. */
  function allocateLight() {
    const fit = Math.min(1, Math.sqrt(MAX_LIGHT_PIXELS / (canvas.width * canvas.height)))
    bufferWidth = Math.max(1, Math.round(canvas.width * fit * quality))
    bufferHeight = Math.max(1, Math.round(canvas.height * fit * quality))
    releaseLight()
    light = createLightBuffer(gl, bufferWidth, bufferHeight)
    // The field of view spans the shorter side, so phones see as much as desktops
    const focal = 1 / Math.tan(FIELD_OF_VIEW / 2)
    const shorter = Math.min(bufferWidth, bufferHeight)
    scale = [(focal * shorter) / bufferWidth, (focal * shorter) / bufferHeight]
    focalPixels = (focal * shorter) / 2
  }

  return {
    draw(frame) {
      drawLight(frame)
      drawComposite(frame)
    },
    resize(width, height, pixelRatio) {
      const ratio = Math.min(Math.max(pixelRatio, 1), MAX_PIXEL_RATIO)
      const nextWidth = Math.max(1, Math.round(width * ratio))
      const nextHeight = Math.max(1, Math.round(height * ratio))
      if (light && nextWidth === canvas.width && nextHeight === canvas.height)
        return
      canvas.width = nextWidth
      canvas.height = nextHeight
      allocateLight()
    },
    setQuality(next) {
      if (next === quality)
        return
      quality = next
      allocateLight()
    },
    setTheme(next) {
      theme = next
    },
    dispose() {
      releaseLight()
      gl.deleteBuffer(particles)
      gl.deleteBuffer(triangle)
      gl.deleteProgram(points)
      gl.deleteProgram(composite)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
