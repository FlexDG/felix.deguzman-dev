import{a as e,f as t,l as n,o as r,u as i}from"./index-CpxnIwT9.js";import{Ct as a,Dt as o,Et as s,G as c,I as ee,L as l,Ot as u,ht as d,m as f,mt as p,n as te,rt as m,u as ne,z as re}from"./three.module-BFmht-cx.js";var h=t(i(),1),g=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,_=`
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
`,v=r(),y={desktop:[.49,.62],mobile:[.43,.55]},b=[.8902,.8706,.9882],x=[.128,.086,.161],S=2.4,C=(()=>{if(typeof window>`u`)return`high`;let e=window.matchMedia?.(`(pointer: coarse)`).matches,t=navigator.hardwareConcurrency||8,n=navigator.deviceMemory||8;return e||t<=4||n<=4?`low`:`high`})()===`low`,w=C?1.4:1.75,T=C?19e5:32e5,E=26,D=45,O=20,k=20,A=.55;function j(e,t,n=1){let r=Math.min(window.devicePixelRatio||1,w);return Math.min(r,Math.sqrt(T/Math.max(1,e*t)))*n}function M(){if(typeof document>`u`)return!1;try{let e=document.createElement(`canvas`),t=e.getContext(`webgl2`)||e.getContext(`webgl`);return t?.getExtension(`WEBGL_lose_context`)?.loseContext(),!!t}catch{return!1}}var N=M();function ie(){return{uTex:{value:null},uResolution:{value:new s(1,1)},uRect:{value:new u(0,0,1,1)},uFocalUv:{value:new s(.49,.38)},uZoom:{value:1},uCentering:{value:0},uBlur:{value:0},uAberration:{value:0},uCorrode:{value:0},uEdge:{value:.03},uLock:{value:S},uWhite:{value:0},uVignette:{value:0},uGrain:{value:0},uCover:{value:0},uTime:{value:0},uBg:{value:new o(...b)}}}function P({apiRef:t,onReady:r}){let i=(0,h.useRef)(null),o=(0,h.useRef)(null),[s,u]=(0,h.useState)(N?`webgl`:`css`);return(0,h.useEffect)(()=>{if(s!==`webgl`)return;let o=i.current;if(!o)return;let h=o.closest(`[data-hero-pane]`),v=document.querySelector(`[data-hero-img]`);if(!h||!v)return;let w=document.createElement(`canvas`);w.setAttribute(`aria-hidden`,`true`),w.style.cssText=`display:block;width:100%;height:100%`,o.appendChild(w);let T;try{T=new te({canvas:w,alpha:!0,premultipliedAlpha:!0,antialias:!1,powerPreference:`high-performance`})}catch{T=null}if(!T||!T.getContext()){T?.dispose(),w.remove(),queueMicrotask(()=>u(`css`));return}T.setClearColor(0,0),T.outputColorSpace=re;let M=ie(),N=new p,P=new ne,F=new d({uniforms:M,defines:{TAPS:C?4:6,OCT:C?2:3,USE_CA:!C&&1},vertexShader:g,fragmentShader:_,transparent:!0,blending:0,depthTest:!1,depthWrite:!1}),I=new m(2,2);N.add(new c(I,F));let L=()=>{!M.uTex.value||T.getContext().isContextLost()||T.render(N,P)},R=new a,z=null,B=!1,V=e=>{!e||e===z||(z=e,R.load(e,e=>{if(B){e.dispose();return}e.colorSpace=``,e.premultiplyAlpha=!0,e.generateMipmaps=!0,e.minFilter=l,e.magFilter=ee,e.wrapS=f,e.wrapT=f,e.anisotropy=T.capabilities.getMaxAnisotropy(),e.needsUpdate=!0,M.uTex.value?.dispose(),M.uTex.value=e,L()}))},H=1,U=()=>{let e=h.getBoundingClientRect(),t=v.getBoundingClientRect(),n=Math.max(1,Math.round(e.width)),r=Math.max(1,Math.round(e.height));T.setPixelRatio(j(n,r,H)),T.setSize(n,r,!1),M.uResolution.value.set(n,r),M.uRect.value.set(t.left-e.left,e.bottom-t.bottom,Math.max(1,t.width),Math.max(1,t.height));let i=v.currentSrc||v.src,a=/mobile_hero/.test(i)?y.mobile:y.desktop;M.uFocalUv.value.set(a[0],1-a[1]),V(i),L()};U();let W=new ResizeObserver(U);W.observe(h),W.observe(v);let G=e(U),K=!1;document.fonts?.ready.then(()=>{!K&&!B&&U()});let q=e=>{e.preventDefault(),document.documentElement.setAttribute(`data-portal-lost`,``)},J=()=>{document.documentElement.removeAttribute(`data-portal-lost`),z=null,U()};w.addEventListener(`webglcontextlost`,q),w.addEventListener(`webglcontextrestored`,J);let Y=null,X=0,Z=0,Q=0,$=(e,t)=>{if(!(!Y||!M.uTex.value||T.getContext().isContextLost())){if(M.uTime.value+=Math.min(t,50)/1e3,T.render(N,P),X<k){X+=1;return}H<=A||(Z+=1,t>E&&(Q+=1),!(Z<D)&&(Q>=O&&(H=Math.max(A,H*.75),U()),Z=0,Q=0))}};return n.ticker.add($),t.current={mode:`webgl`,uniforms:M,room:{from:b,to:x},lockZoom:S,layer:o,setActive:e=>{e!==Y&&(Y=e,e?(X=0,Z=0,Q=0,U()):L())}},r?.(`webgl`),()=>{B=!0,K=!0,n.ticker.remove($),W.disconnect(),G(),w.removeEventListener(`webglcontextlost`,q),w.removeEventListener(`webglcontextrestored`,J),document.documentElement.removeAttribute(`data-portal-lost`),M.uTex.value?.dispose(),I.dispose(),F.dispose(),T.dispose(),T.forceContextLoss(),w.remove(),t.current=null}},[s,t,r]),(0,h.useEffect)(()=>{if(s===`css`)return t.current={mode:`css`,el:o.current},r?.(`css`),()=>{t.current=null}},[s,t,r]),s===`css`?(0,v.jsx)(`div`,{ref:o,"aria-hidden":`true`,className:`pointer-events-none absolute inset-0 z-[2] opacity-0`,style:{background:`radial-gradient(circle at var(--hero-portal-fx, 50%) var(--hero-portal-fy, 60%), #fff 0%, #fff 38%, rgb(255 255 255 / 0) 72%)`}}):(0,v.jsx)(`div`,{ref:i,"data-portal-layer":!0,"aria-hidden":`true`,className:`pointer-events-none invisible absolute inset-0 z-[2] opacity-0`})}export{P as default};