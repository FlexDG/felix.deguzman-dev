// Hero dust shaders (GLSL)

import { PORTAL_MASK } from './heroPortal'

export const DUST_VERT = /* glsl */ `
  varying vec3  vCol;
  varying float vA;

  attribute vec4 aColor;
  attribute vec4 aRnd;

  uniform vec2  uResolution;
  uniform vec4  uRect;
  uniform vec2  uFocalUv;

  uniform float uZoom;
  uniform float uCentering;
  uniform float uCorrode;
  uniform float uLock;
  uniform float uVignette;
  uniform float uWhite;
  uniform float uTime;

  uniform float uSpan;
  uniform float uTail;
  uniform float uCell;
  uniform float uFlake;
  uniform float uDpr;

${PORTAL_MASK}

  const vec3 DECAY = vec3(0.184, 0.122, 0.227);

  void main() {
    vec2 restPx = uRect.xy + position.xy * uRect.zw;
    vec2 rest   = uRect.xy + uFocalUv * uRect.zw;
    vec2 focus  = mix(rest, uResolution * 0.5, uCentering);

    vec2  far  = max(focus, uResolution - focus) / uResolution.y;
    float farL = max(length(far), 1e-4);
    vec2  rv   = (restPx - rest) * uLock / uResolution.y / farL;

    float field;
    float mask = portalMask(rv, uCorrode, uTime, grainFreq(uResolution.y, farL, uCell, uLock), field);

    float lift = (mask - THR_LO) / (THR_HI - THR_LO) + (aRnd.w - 0.5) * 0.05;
    lift = max(lift, 0.035);

    float t = (uCorrode + uTail * uSpan - lift) / max(uSpan, 1e-3);

    if (t <= 0.0 || t >= 1.0 || uWhite > 0.985) {
      gl_Position  = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }

    float zEff = mix(uLock, uZoom, clamp(lift / max(uCorrode, 1e-4), 0.0, 1.0));

    float rise  = (0.07 + aRnd.x * 0.19) * uResolution.y;
    float drift = (aRnd.y - 0.38) * 0.085 * uResolution.y;

    vec2 px = focus + (restPx - rest) * zEff + vec2(drift, rise) * t;

    float vig = mix(1.0, smoothstep(1.30, 0.20, length(rv)), uVignette);

    vCol = mix(aColor.rgb, DECAY, 0.30 * t) * vig;
    vA   = smoothstep(0.0, 0.12, t) * (1.0 - t * t) * aColor.a;

    float dia = uCell * zEff * uFlake * (0.5 + aRnd.z * 0.6) * (1.0 - 0.35 * t);

    gl_PointSize = max(clamp(dia, 0.6, 20.0) * uDpr, 1.0);
    gl_Position  = vec4((px / uResolution) * 2.0 - 1.0, 0.0, 1.0);
  }
`

export const DUST_FRAG = /* glsl */ `
  varying vec3  vCol;
  varying float vA;

  void main() {
    vec2  d = gl_PointCoord - 0.5;
    float a = vA * smoothstep(0.25, 0.09, dot(d, d));

    gl_FragColor = vec4(vCol * a, a);
  }
`
