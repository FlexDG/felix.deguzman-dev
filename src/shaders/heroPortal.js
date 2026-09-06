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
  uniform float uLock;

  uniform float uWhite;
  uniform float uVignette;
  uniform float uGrain;
  uniform float uCover;
  uniform float uTime;
  uniform vec3  uBg;

  #ifndef TAPS
    #define TAPS 6
  #endif
  #ifndef OCT
    #define OCT 3
  #endif

  const vec3 DECAY = vec3(0.184, 0.122, 0.227);

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
    float n = 0.0;
    for (int i = 0; i < OCT; i++) {
      v += a * vnoise(p);
      n += a;
      p = p * 2.03 + vec2(31.7, 11.3);
      a *= 0.5;
    }
    return v / n;
  }

  float fbm3(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    float n = 0.0;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      n += a;
      p = p * 2.03 + vec2(31.7, 11.3);
      a *= 0.5;
    }
    return v / n;
  }

  void main() {
    vec2 px = vUv * uResolution;

    vec2 rest  = uRect.xy + uFocalUv * uRect.zw;
    vec2 focus = mix(rest, uResolution * 0.5, uCentering);

    vec2  nUv  = (px - focus) * (uLock / max(uZoom, 1e-4)) / uResolution.y;
    vec2  far  = max(focus, uResolution - focus) / uResolution.y;
    float farL = max(length(far), 1e-4);

    vec2  rv     = nUv / farL;
    float radial = length(rv);

    float grade = mix(3.4, 5.6, uCorrode);
    vec2  q     = rv * grade + vec2(uTime * 0.02, uTime * -0.015);
    vec2  warp  = vec2(vnoise(q * 1.7 + 11.5), vnoise(q * 1.7 + 41.9)) - 0.5;
    float field = fbm(q + warp * 1.35);

    float shape = field * 0.58 + smoothstep(0.0, 1.0, radial) * 0.42;

    float grain = fbm3(rv * 46.0 + 13.7);

    float mask = shape + (grain - 0.5) * 0.26;

    float thr   = mix(0.16, 0.84, uCorrode);
    float w     = max(uEdge, 1e-3);
    float onset = smoothstep(0.0, 0.10, uCorrode);

    float erode = mix(1.0, smoothstep(thr - w, thr + w, mask), onset);
    float near  = (1.0 - smoothstep(0.0, w * 4.0, mask - thr)) * erode * onset;

    vec2  ray  = px - focus;
    vec4  acc  = vec4(0.0);
    float wsum = 0.0;

    for (int i = 0; i < TAPS; i++) {
      float t    = float(i) / float(TAPS - 1);
      float pull = 1.0 - uBlur * t;
      float wt   = 1.0 - t * 0.55;
      vec2  base = ray * pull / uZoom;

      #ifdef USE_CA
        float ca = uAberration * (0.3 + t);
        vec4 r = grab(rest + base * (1.0 + ca));
        vec4 g = grab(rest + base);
        vec4 b = grab(rest + base * (1.0 - ca));
        acc += vec4(r.r, g.g, b.b, (r.a + g.a + b.a) * 0.33333) * wt;
      #else
        acc += grab(rest + base) * wt;
      #endif

      wsum += wt;
    }
    acc /= wsum;

    float ia  = clamp(acc.a, 0.0, 1.0);
    vec3  img = acc.rgb / max(ia, 1e-4);

    img = mix(img, mix(img, DECAY, 0.6), near * 0.32);

    vec3 room   = uBg * (0.93 + field * 0.14);
    vec3 ground = mix(room, vec3(1.0), smoothstep(0.10, 0.85, uCorrode));

    float outA = ia + uCover * (1.0 - ia);
    vec3  pre  = img * ia + ground * uCover * (1.0 - ia);

    pre *= mix(1.0, smoothstep(1.30, 0.20, radial), uVignette);

    float gone = (1.0 - erode) * ia;
    pre  = mix(pre, vec3(1.0), gone);
    outA = mix(outA, 1.0, gone);

    pre  = mix(pre, vec3(1.0), uWhite);
    outA = mix(outA, 1.0, uWhite);

    float n = fract(sin(dot(px + floor(uTime * 24.0), vec2(12.9898, 78.233))) * 43758.5453);
    pre += (n - 0.5) * 0.075 * uGrain * outA;

    gl_FragColor = vec4(clamp(pre, 0.0, 1.0), clamp(outA, 0.0, 1.0));
  }
`
