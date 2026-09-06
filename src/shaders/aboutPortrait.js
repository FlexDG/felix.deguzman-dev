// About portrait shaders (GLSL)

export const PORTRAIT_VERT = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`

export const PORTRAIT_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform float uShrug;
  uniform float uAmp;
  uniform float uTop;
  uniform float uPeak;
  uniform float uBottom;
  uniform float uCollar;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    float yTop = 1.0 - uv.y;

    float rise = smoothstep(uTop, uPeak, yTop);
    float fall = 1.0 - smoothstep(uPeak, uBottom, yTop);
    float band = rise * fall;

    float fromCentre = smoothstep(0.0, 0.18, abs(uv.x - 0.5));
    float collar = 1.0 - uCollar * (1.0 - fromCentre);

    uv.y -= uShrug * uAmp * band * collar;

    gl_FragColor = texture2D(uMap, uv);
  }
`

export const SHRUG = {
  amp: 0.007,
  top: 0.27,
  peak: 0.37,
  bottom: 0.56,
  collar: 0.35,
}
