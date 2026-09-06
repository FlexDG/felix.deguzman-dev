// Hero portal shaders (GLSL)

export const PORTAL_VERT = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const PORTAL_FRAG = /* glsl */ `
  varying vec2 vUv;

  uniform sampler2D uTex;

  uniform vec2  uResolution;
  uniform vec4  uRect;
  uniform vec2  uFocalUv;

  uniform float uZoom;
  uniform float uCentering;
  uniform float uBlur;
  uniform float uAberration;

  uniform float uCorrode;
  uniform float uEdge;
  uniform float uWarp;
  uniform float uRim;

  uniform float uWhite;
  uniform float uVignette;
  uniform float uGrain;
  uniform float uCover;
  uniform float uTime;
  uniform vec3  uBg;

  #define TAPS 8

  vec4 grab(vec2 px) {
    vec2 uv  = (px - uRect.xy) / uRect.zw;
    vec2 hit = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    return texture2D(uTex, clamp(uv, 0.0, 1.0)) * hit.x * hit.y;
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i),                 hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(31.7, 11.3);
      a *= 0.5;
    }
    return v * 1.067;
  }

  void main() {
    vec2 px = vUv * uResolution;

    vec2 rest  = uRect.xy + uFocalUv * uRect.zw;
    vec2 focus = mix(rest, uResolution * 0.5, uCentering);

    vec2  nUv = (px - focus) / uResolution.y;

    vec2  far    = max(focus, uResolution - focus) / uResolution.y;
    float radial = length(nUv) / max(length(far), 1e-4);

    float grade = mix(5.4, 2.5, uCorrode);
    float field = fbm(nUv * grade + vec2(uTime * 0.03, uTime * -0.02));
    float mask  = field * 0.62 + smoothstep(0.0, 1.0, radial) * 0.58;

    float thr   = mix(0.06, 1.14, uCorrode);
    float w     = max(uEdge, 1e-3);
    float erode = smoothstep(thr - w, thr + w, mask);
    float front = 1.0 - clamp(abs(mask - thr) / (w * 2.4), 0.0, 1.0);

    float onset = smoothstep(0.0, 0.05, uCorrode);
    erode = mix(1.0, erode, onset);
    front *= onset;

    float lead    = (1.0 - smoothstep(0.0, w * 6.0, mask - thr)) * erode;
    vec2  outward = normalize(nUv + vec2(1e-5));
    vec2  tangent = vec2(-outward.y, outward.x);
    float swirl   = vnoise(nUv * 2.6 + uTime * 0.05) - 0.5;
    vec2  tearDir = normalize(outward + tangent * swirl * 1.5);
    vec2  ray     = px - focus + tearDir * uWarp * lead * (0.35 + field);

    vec4  acc  = vec4(0.0);
    float wsum = 0.0;

    for (int i = 0; i < TAPS; i++) {
      float t    = float(i) / float(TAPS - 1);
      float pull = 1.0 - uBlur * t;
      float w    = 1.0 - t * 0.55;
      float ca   = uAberration * (0.3 + t);
      vec2  base = ray * pull / uZoom;

      vec4 r = grab(rest + base * (1.0 + ca));
      vec4 g = grab(rest + base);
      vec4 b = grab(rest + base * (1.0 - ca));

      acc  += vec4(r.r, g.g, b.b, (r.a + g.a + b.a) * 0.33333) * w;
      wsum += w;
    }
    acc /= wsum;

    float ia  = clamp(acc.a, 0.0, 1.0);
    vec3  img = acc.rgb / max(ia, 1e-4);

    float outA = ia + uCover * (1.0 - ia);
    vec3  pre  = img * ia + uBg * uCover * (1.0 - ia);

    pre *= mix(1.0, smoothstep(1.30, 0.20, radial), uVignette);

    float rim  = front * uRim * erode;
    float gone = 1.0 - erode;

    pre  = mix(pre, vec3(1.0), rim);
    outA = mix(outA, 1.0, rim);

    pre  = mix(pre, vec3(1.0), gone);
    outA = mix(outA, 1.0, gone);

    pre  = mix(pre, vec3(1.0), uWhite);
    outA = mix(outA, 1.0, uWhite);

    float n = fract(sin(dot(px + floor(uTime * 24.0), vec2(12.9898, 78.233))) * 43758.5453);
    pre += (n - 0.5) * 0.05 * uGrain * outA;

    gl_FragColor = vec4(clamp(pre, 0.0, 1.0), clamp(outA, 0.0, 1.0));
  }
`
