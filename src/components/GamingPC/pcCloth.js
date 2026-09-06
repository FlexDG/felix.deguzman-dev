// Gaming PC cloth shader

import * as THREE from 'three'

const SIZE = 60

const SEG = 26

const DISC_R = 0.5
const CLOTH_R = 0.13

const FOLD_IN = 0.2
const FOLD_OUT = 0.9

const FOV = 26

const CHASE = 13

const FULL_DRAG = 1400

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uDrag;
  uniform float uForm;
  uniform float uPress;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vFold;

  float sheet(vec2 p) {
    float r2 = dot(p, p);

    float hold = exp(-r2 * 11.0) * 0.26 * (1.0 - uPress * 0.85);

    float droop = -r2 * 0.62 * (1.0 - uPress * 0.55);

    float drag = -dot(uDrag, p) * 0.85;

    float flutter =
      sin(p.x * 15.0 + uTime * 3.4) * cos(p.y * 11.0 - uTime * 2.7) * 0.030 +
      sin((p.x + p.y) * 23.0 - uTime * 4.1) * 0.012;

    return (hold + droop + drag + flutter * (0.45 + length(uDrag))) * uForm;
  }

  void main() {
    vUv = uv;

    vec2 p = position.xy;
    float e = 0.02;
    float z0 = sheet(p);
    float zx = sheet(p + vec2(e, 0.0));
    float zy = sheet(p + vec2(0.0, e));

    vNormal = normalize(cross(vec3(e, 0.0, zx - z0), vec3(0.0, e, zy - z0)));
    vFold = z0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, z0, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uBase;
  uniform vec3 uShade;
  uniform vec3 uHem;
  uniform float uRadius;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vFold;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 q = abs(vUv - 0.5) - (0.5 - uRadius);
    float d = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - uRadius;
    float alpha = smoothstep(0.006, -0.002, d);
    if (alpha <= 0.001) discard;

    vec3 N = normalize(vNormal);

    vec3 L = normalize(vec3(-0.34, 0.60, 0.72));
    float ndl = pow(clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0), 1.45);

    float nap = vnoise(vUv * 34.0);
    float fibre = vnoise(vUv * 190.0);
    float weave = sin(vUv.x * 96.0) * sin(vUv.y * 96.0) * 0.5 + 0.5;

    float shade = ndl * (0.90 + nap * 0.18) + fibre * 0.07 + weave * 0.035;

    vec3 col = mix(uShade, uBase, clamp(shade, 0.0, 1.0));

    float hem = smoothstep(-0.052, -0.024, d);
    float stitch = smoothstep(0.35, 0.85, sin((vUv.x + vUv.y) * 420.0) * 0.5 + 0.5);
    col = mix(col, uHem, hem * (0.55 + stitch * 0.30));

    float sheen = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 9.0);
    col += sheen * 0.22 * (0.4 + nap * 0.6);

    col += pow(1.0 - clamp(N.z, 0.0, 1.0), 2.4) * 0.16;

    col *= 1.0 + clamp(vFold, -0.35, 0.35) * 0.35;

    gl_FragColor = vec4(col, alpha);

    #include <colorspace_fragment>
  }
`

export function createCloth({ renderer }) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 20000)

  const geometry = new THREE.PlaneGeometry(1, 1, SEG, SEG)

  const uniforms = {
    uTime: { value: 0 },
    uDrag: { value: new THREE.Vector2() },
    uForm: { value: 0 },
    uPress: { value: 0 },
    uRadius: { value: DISC_R },
    uBase: { value: new THREE.Color('#767b81') },
    uShade: { value: new THREE.Color('#2b2e33') },
    uHem: { value: new THREE.Color('#565b61') },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.scale.setScalar(SIZE)
  mesh.frustumCulled = false
  scene.add(mesh)

  let width = 1
  let height = 1
  let px = 0
  let py = 0
  let cx = 0
  let cy = 0
  let vx = 0
  let vy = 0
  let clock = 0
  let want = 0
  let show = 0
  let pressWant = 0
  let press = 0
  let placed = false

  function fit() {
    const d = height / 2 / Math.tan((FOV / 2) * (Math.PI / 180))
    camera.aspect = width / height
    camera.position.set(width / 2, -height / 2, d)
    camera.lookAt(width / 2, -height / 2, 0)
    camera.updateProjectionMatrix()
  }

  function resize(w, h) {
    width = Math.max(1, w)
    height = Math.max(1, h)
    fit()
  }

  function setPointer(x, y) {
    px = x
    py = y
    if (placed) return
    placed = true
    cx = x
    cy = y
  }

  function setActive(next) {
    want = next ? 1 : 0
    if (next && show <= 0.001) placed = false
  }

  function setPress(next) {
    pressWant = next ? 1 : 0
  }

  function update(dt) {
    if (show <= 0.001 && want === 0) return

    clock += dt

    const chase = 1 - Math.exp(-dt * CHASE)
    const nx = cx + (px - cx) * chase
    const ny = cy + (py - cy) * chase

    const ease = 1 - Math.exp(-dt * 9)
    vx += ((nx - cx) / Math.max(dt, 0.001) - vx) * ease
    vy += ((ny - cy) / Math.max(dt, 0.001) - vy) * ease
    cx = nx
    cy = ny

    const speed = Math.min(1, Math.hypot(vx, vy) / FULL_DRAG)
    const inv = speed > 0.0001 ? speed / Math.hypot(vx, vy) : 0
    uniforms.uDrag.value.set(vx * inv, -vy * inv)

    const rate = want ? 8 : 7
    show += (want - show) * (1 - Math.exp(-dt * rate))
    uniforms.uTime.value = clock

    const t = Math.min(1, Math.max(0, (show - FOLD_IN) / (FOLD_OUT - FOLD_IN)))
    const form = t * t * (3 - 2 * t)
    uniforms.uForm.value = form
    uniforms.uRadius.value = DISC_R + (CLOTH_R - DISC_R) * form

    press += (pressWant - press) * (1 - Math.exp(-dt * (pressWant ? 17 : 8)))
    uniforms.uPress.value = press
    mesh.scale.setScalar(SIZE * show * (1 + press * 0.085))

    const wobbleX = Math.cos(clock * 2.9) * 3.4 * form
    const wobbleY = Math.sin(clock * 2.3) * 2.6 * form

    mesh.position.set(cx + wobbleX, -(cy + wobbleY), 0)
    mesh.rotation.set(
      (-0.34 + uniforms.uDrag.value.y * 0.3 + Math.sin(clock * 1.7) * 0.05) * form,
      uniforms.uDrag.value.x * 0.26 * form,
      (Math.sin(clock * 1.1) * 0.06 - uniforms.uDrag.value.x * 0.34) * form,
    )
  }

  function render() {
    if (show <= 0.003) return
    const auto = renderer.autoClear
    renderer.autoClear = false
    renderer.render(scene, camera)
    renderer.autoClear = auto
  }

  function dispose() {
    geometry.dispose()
    material.dispose()
    scene.clear()
  }

  return { resize, setPointer, setActive, setPress, update, render, dispose }
}
