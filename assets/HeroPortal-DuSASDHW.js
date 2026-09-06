import{a as e,c as t,d as n,l as r,o as i}from"./index-DlDkOJSk.js";import{Ct as a,Dt as o,Et as s,G as c,I as l,L as u,Ot as d,ht as f,m as p,mt as m,n as h,rt as g,u as _,z as v}from"./three.module-BFmht-cx.js";var y=n(r(),1),b=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,x=`
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
`,S=i(),C={desktop:[.49,.62],mobile:[.43,.55]},w=[.8902,.8706,.9882],T=[.251,.169,.314],E=1.75,D=32e5;function O(e,t){let n=Math.min(window.devicePixelRatio||1,E);return Math.min(n,Math.sqrt(D/Math.max(1,e*t)))}function k(){if(typeof document>`u`)return!1;try{let e=document.createElement(`canvas`),t=e.getContext(`webgl2`)||e.getContext(`webgl`);return t?.getExtension(`WEBGL_lose_context`)?.loseContext(),!!t}catch{return!1}}var A=k();function j(){return{uTex:{value:null},uResolution:{value:new s(1,1)},uRect:{value:new d(0,0,1,1)},uFocalUv:{value:new s(.49,.38)},uZoom:{value:1},uCentering:{value:0},uBlur:{value:0},uAberration:{value:0},uCorrode:{value:0},uEdge:{value:.05},uWarp:{value:0},uRim:{value:0},uWhite:{value:0},uVignette:{value:0},uGrain:{value:0},uCover:{value:0},uTime:{value:0},uBg:{value:new o(...w)}}}function M({apiRef:n,onReady:r}){let i=(0,y.useRef)(null),o=(0,y.useRef)(null),[s,d]=(0,y.useState)(A?`webgl`:`css`);return(0,y.useEffect)(()=>{if(s!==`webgl`)return;let o=i.current;if(!o)return;let y=o.closest(`[data-hero-pane]`),S=document.querySelector(`[data-hero-img]`);if(!y||!S)return;let E=document.createElement(`canvas`);E.setAttribute(`aria-hidden`,`true`),E.style.cssText=`display:block;width:100%;height:100%`,o.appendChild(E);let D;try{D=new h({canvas:E,alpha:!0,premultipliedAlpha:!0,antialias:!1,powerPreference:`high-performance`})}catch{D=null}if(!D||!D.getContext()){D?.dispose(),E.remove(),queueMicrotask(()=>d(`css`));return}D.setClearColor(0,0),D.outputColorSpace=v;let k=j(),A=new m,M=new _,N=new f({uniforms:k,vertexShader:b,fragmentShader:x,transparent:!0,blending:0,depthTest:!1,depthWrite:!1}),P=new g(2,2);A.add(new c(P,N));let F=()=>{!k.uTex.value||D.getContext().isContextLost()||D.render(A,M)},I=new a,L=null,R=!1,z=e=>{!e||e===L||(L=e,I.load(e,e=>{if(R){e.dispose();return}e.colorSpace=``,e.premultiplyAlpha=!0,e.generateMipmaps=!0,e.minFilter=u,e.magFilter=l,e.wrapS=p,e.wrapT=p,e.anisotropy=D.capabilities.getMaxAnisotropy(),e.needsUpdate=!0,k.uTex.value?.dispose(),k.uTex.value=e,F()}))},B=()=>{let e=y.getBoundingClientRect(),t=S.getBoundingClientRect(),n=Math.max(1,Math.round(e.width)),r=Math.max(1,Math.round(e.height));D.setPixelRatio(O(n,r)),D.setSize(n,r,!1),k.uResolution.value.set(n,r),k.uRect.value.set(t.left-e.left,e.bottom-t.bottom,Math.max(1,t.width),Math.max(1,t.height));let i=S.currentSrc||S.src,a=/mobile_hero/.test(i)?C.mobile:C.desktop;k.uFocalUv.value.set(a[0],1-a[1]),z(i),F()};B();let V=new ResizeObserver(B);V.observe(y),V.observe(S);let H=e(B),U=!1;document.fonts?.ready.then(()=>{!U&&!R&&B()});let W=e=>{e.preventDefault(),document.documentElement.setAttribute(`data-portal-lost`,``)},G=()=>{document.documentElement.removeAttribute(`data-portal-lost`),L=null,B()};E.addEventListener(`webglcontextlost`,W),E.addEventListener(`webglcontextrestored`,G);let K=!1,q=(e,t)=>{!K||!k.uTex.value||D.getContext().isContextLost()||(k.uTime.value+=Math.min(t,50)/1e3,D.render(A,M))};return t.ticker.add(q),n.current={mode:`webgl`,uniforms:k,room:{from:w,to:T},layer:o,setActive:e=>{K=e,e&&B()}},r?.(`webgl`),()=>{R=!0,U=!0,t.ticker.remove(q),V.disconnect(),H(),E.removeEventListener(`webglcontextlost`,W),E.removeEventListener(`webglcontextrestored`,G),document.documentElement.removeAttribute(`data-portal-lost`),k.uTex.value?.dispose(),P.dispose(),N.dispose(),D.dispose(),D.forceContextLoss(),E.remove(),n.current=null}},[s,n,r]),(0,y.useEffect)(()=>{if(s===`css`)return n.current={mode:`css`,el:o.current},r?.(`css`),()=>{n.current=null}},[s,n,r]),s===`css`?(0,S.jsx)(`div`,{ref:o,"aria-hidden":`true`,className:`pointer-events-none absolute inset-0 z-[2] opacity-0`,style:{background:`radial-gradient(circle at var(--hero-portal-fx, 50%) var(--hero-portal-fy, 60%), #fff 0%, #fff 38%, rgb(255 255 255 / 0) 72%)`}}):(0,S.jsx)(`div`,{ref:i,"data-portal-layer":!0,"aria-hidden":`true`,className:`pointer-events-none invisible absolute inset-0 z-[2] opacity-0`})}export{M as default};