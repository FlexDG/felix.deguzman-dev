import{a as e,f as t,l as n,o as r,s as i,u as a}from"./index-DYFq0Fqo.js";import{Ct as o,Dt as s,Et as c,G as l,I as u,L as d,Ot as f,at as ee,c as p,ht as m,l as te,m as h,mt as ne,n as re,rt as ie,u as ae,yt as oe,z as se}from"./three.module-BFmht-cx.js";var g=t(a(),1),ce=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,_=`
  #ifndef OCT
    #define OCT 3
  #endif

  #define THR_LO 0.16
  #define THR_HI 0.84

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

  float grainFreq(float resY, float farL, float cell, float lock) {
    return clamp(resY * farL / (max(cell, 0.4) * max(lock, 0.4)), 30.0, 260.0);
  }

  float portalMask(vec2 rv, float corrode, float time, float gf, out float field) {
    float grade = mix(3.4, 5.6, corrode);
    vec2  q     = rv * grade + vec2(time * 0.02, time * -0.015);
    vec2  warp  = vec2(vnoise(q * 1.7 + 11.5), vnoise(q * 1.7 + 41.9)) - 0.5;

    field = fbm(q + warp * 1.35);

    float shape = field * 0.58 + smoothstep(0.0, 1.0, length(rv)) * 0.42;
    float grain = fbm3(rv * gf + 13.7);

    return shape + (grain - 0.5) * 0.26;
  }
`,le=`
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
  uniform float uCell;
  uniform float uTime;
  uniform vec3  uBg;

  #ifndef TAPS
    #define TAPS 6
  #endif

${_}

  const vec3 DECAY = vec3(0.184, 0.122, 0.227);

  vec4 grab(vec2 px) {
    vec2 uv  = (px - uRect.xy) / uRect.zw;
    vec2 hit = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    return texture2D(uTex, clamp(uv, 0.0, 1.0)) * hit.x * hit.y;
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

    float field;
    float mask = portalMask(rv, uCorrode, uTime, grainFreq(uResolution.y, farL, uCell, uLock), field);

    float thr   = mix(THR_LO, THR_HI, uCorrode);
    float w     = max(uEdge, 1e-3);
    float onset = smoothstep(0.0, 0.10, uCorrode);

    float erode = mix(1.0, smoothstep(thr - w, thr + w, mask), onset);
    float near  = (1.0 - smoothstep(0.0, w * 4.0, mask - thr)) * erode * onset;

    vec2  ray  = px - focus;
    vec4  acc  = vec4(0.0);
    float wsum = 0.0;

    float spread = max(float(TAPS - 1), 1.0);

    for (int i = 0; i < TAPS; i++) {
      float t    = float(i) / spread;
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
`,ue=`
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

${_}

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
`,de=`
  varying vec3  vCol;
  varying float vA;

  void main() {
    vec2  d = gl_PointCoord - 0.5;
    float a = vA * smoothstep(0.25, 0.09, dot(d, d));

    gl_FragColor = vec4(vCol * a, a);
  }
`,v={high:6.5,low:10.5},y={high:6e4,low:2e4},b={high:1,low:.72},x=110,S=.7;function fe({boxW:e,boxH:t,zoom:n,low:r}){let i=(r?v.low:v.high)/Math.max(n,1),a=Math.max(16,Math.round(e/i)),o=Math.max(16,Math.round(t/i)),s=r?y.low:y.high,c=a*o*.55;if(c>s){let e=Math.sqrt(s/c);a=Math.max(16,Math.round(a*e)),o=Math.max(16,Math.round(o*e))}return{cols:a,rows:o,flake:r?b.low:b.high}}function pe(e,t,n){let r=document.createElement(`canvas`);r.width=t,r.height=n;let i=r.getContext(`2d`,{willReadFrequently:!0});if(!i)return null;i.clearRect(0,0,t,n),i.drawImage(e,0,0,t,n);let a;try{a=i.getImageData(0,0,t,n).data}catch{return null}let o=0;for(let e=3;e<a.length;e+=4)a[e]>=x&&(o+=1);if(!o)return null;let s=new Float32Array(o*2),c=new Uint8Array(o*4),l=new Uint8Array(o*4),u=0;for(let e=0;e<n;e+=1)for(let r=0;r<t;r+=1){let i=(e*t+r)*4,o=a[i+3];if(o<x)continue;let d=(Math.random()-.5)*S,f=(Math.random()-.5)*S;s[u*2]=(r+.5+d)/t,s[u*2+1]=1-(e+.5+f)/n,c[u*4]=a[i],c[u*4+1]=a[i+1],c[u*4+2]=a[i+2],c[u*4+3]=o,l[u*4]=Math.random()*255|0,l[u*4+1]=Math.random()*255|0,l[u*4+2]=Math.random()*255|0,l[u*4+3]=Math.random()*255|0,u+=1}return{count:o,uv:s,color:c,rnd:l,cols:t,rows:n}}var C=r(),w={desktop:[.49,.62],mobile:[.43,.55]},T=[.8902,.8706,.9882],me=[.128,.086,.161],E=2.4,D=.55,he=E*1.25,O=i(),k=O?1.4:1.75,A=O?19e5:32e5,ge=26,_e=45,ve=20,ye=20,j=.55;function be(e,t,n=1){let r=Math.min(window.devicePixelRatio||1,k);return Math.min(r,Math.sqrt(A/Math.max(1,e*t)))*n}function M(){if(typeof document>`u`)return!1;try{let e=document.createElement(`canvas`),t=e.getContext(`webgl2`)||e.getContext(`webgl`);return t?.getExtension(`WEBGL_lose_context`)?.loseContext(),!!t}catch{return!1}}var xe=33901,N=M();function Se(){return{uTex:{value:null},uResolution:{value:new c(1,1)},uRect:{value:new f(0,0,1,1)},uFocalUv:{value:new c(.49,.38)},uZoom:{value:1},uCentering:{value:0},uBlur:{value:0},uAberration:{value:0},uCorrode:{value:0},uEdge:{value:.03},uLock:{value:E},uWhite:{value:0},uVignette:{value:0},uGrain:{value:0},uCover:{value:0},uSpan:{value:D},uTail:{value:0},uCell:{value:2},uFlake:{value:1},uDpr:{value:1},uTime:{value:0},uBg:{value:new s(...T)}}}function P({apiRef:t,onReady:r}){let i=(0,g.useRef)(null),a=(0,g.useRef)(null),[c,f]=(0,g.useState)(N?`webgl`:`css`);return(0,g.useEffect)(()=>{if(c!==`webgl`)return;let a=i.current;if(!a)return;let g=a.closest(`[data-hero-pane]`),_=document.querySelector(`[data-hero-img]`);if(!g||!_)return;let v=document.createElement(`canvas`);v.setAttribute(`aria-hidden`,`true`),v.style.cssText=`display:block;width:100%;height:100%`,a.appendChild(v);let y;try{y=new re({canvas:v,alpha:!0,premultipliedAlpha:!0,antialias:!1,powerPreference:`high-performance`})}catch{y=null}if(!y||!y.getContext()){y?.dispose(),v.remove(),queueMicrotask(()=>f(`css`));return}y.setClearColor(0,0),y.outputColorSpace=se;let b=Se(),x=new ne,S=new ae,C=new m({uniforms:b,defines:{TAPS:O?1:3,OCT:O?2:3,USE_CA:!O&&1},vertexShader:ce,fragmentShader:le,transparent:!0,blending:0,depthTest:!1,depthWrite:!1}),D=new ie(2,2),k=new l(D,C);k.renderOrder=0,x.add(k);let A=null,M=0,N=()=>{A&&(x.remove(A.points),A.geometry.dispose(),A.material.dispose(),A=null,M=0)},P=()=>{!b.uTex.value||y.getContext().isContextLost()||y.render(x,S)},Ce=new o,F=null,I=!1,L=0,R=!1,z=null,B=!1,we=e=>{if(I||!e||B)return;let t=b.uRect.value;if(t.z<24||t.w<24)return;if(y.getContext().getParameter(xe)[1]<8){B=!0;return}let{cols:n,rows:r,flake:i}=fe({boxW:t.z,boxH:t.w,zoom:he,low:O}),a=pe(e,n,r);if(I)return;if(!a){B=!0;return}N();let o=new te;o.setAttribute(`position`,new p(a.uv,2)),o.setAttribute(`aColor`,new p(a.color,4,!0)),o.setAttribute(`aRnd`,new p(a.rnd,4,!0)),o.boundingSphere=new oe(new s(.5,.5,0),1);let c=new m({uniforms:b,defines:{OCT:O?2:3},vertexShader:ue,fragmentShader:de,transparent:!0,blending:1,premultipliedAlpha:!0,depthTest:!1,depthWrite:!1}),l=new ee(o,c);l.frustumCulled=!1,l.renderOrder=1,x.add(l),A={points:l,geometry:o,material:c,count:a.count},M=a.cols,b.uFlake.value=i,b.uCell.value=t.z/a.cols,P()},V=()=>{L&&=(R?clearTimeout(L):window.cancelIdleCallback?.(L),0)},H=(e,t=1500)=>{if(z=e,B)return;V();let n=()=>{L=0,we(e)};window.requestIdleCallback?(R=!1,L=window.requestIdleCallback(n,{timeout:t})):(R=!0,L=setTimeout(n,Math.min(t,120)))},Te=e=>{!e||e===F||(F=e,Ce.load(e,e=>{if(I){e.dispose();return}e.colorSpace=``,e.premultiplyAlpha=!0,e.generateMipmaps=!0,e.minFilter=d,e.magFilter=u,e.wrapS=h,e.wrapT=h,e.anisotropy=y.capabilities.getMaxAnisotropy(),e.needsUpdate=!0,b.uTex.value?.dispose(),b.uTex.value=e,H(e.image,Y?200:1500),P()}))},U=1,W=()=>{let e=g.getBoundingClientRect(),t=_.getBoundingClientRect(),n=Math.max(1,Math.round(e.width)),r=Math.max(1,Math.round(e.height));y.setPixelRatio(be(n,r,U)),y.setSize(n,r,!1),b.uResolution.value.set(n,r),b.uRect.value.set(t.left-e.left,e.bottom-t.bottom,Math.max(1,t.width),Math.max(1,t.height)),b.uDpr.value=y.getPixelRatio(),M&&(b.uCell.value=b.uRect.value.z/M),!L&&!A&&!B&&z&&b.uRect.value.z>=24&&H(z,400);let i=_.currentSrc||_.src,a=/mobile_hero/.test(i)?w.mobile:w.desktop;b.uFocalUv.value.set(a[0],1-a[1]),Te(i),P()};W();let G=new ResizeObserver(W);G.observe(g),G.observe(_);let Ee=e(W),K=!1;document.fonts?.ready.then(()=>{!K&&!I&&W()});let q=e=>{e.preventDefault(),document.documentElement.setAttribute(`data-portal-lost`,``)},J=()=>{document.documentElement.removeAttribute(`data-portal-lost`),F=null,W()};v.addEventListener(`webglcontextlost`,q),v.addEventListener(`webglcontextrestored`,J);let Y=null,X=0,Z=0,Q=0,$=(e,t)=>{if(!(!Y||!b.uTex.value||y.getContext().isContextLost())){if(b.uTime.value+=Math.min(t,50)/1e3,y.render(x,S),X<ye){X+=1;return}U<=j||(Z+=1,t>ge&&(Q+=1),!(Z<_e)&&(Q>=ve&&(U=Math.max(j,U*.75),W()),Z=0,Q=0))}};return n.ticker.add($),t.current={mode:`webgl`,uniforms:b,room:{from:T,to:me},lockZoom:E,layer:a,setActive:e=>{e!==Y&&(Y=e,e?(!A&&z&&H(z,200),X=0,Z=0,Q=0,W()):P())}},r?.(`webgl`),()=>{I=!0,K=!0,n.ticker.remove($),G.disconnect(),Ee(),v.removeEventListener(`webglcontextlost`,q),v.removeEventListener(`webglcontextrestored`,J),document.documentElement.removeAttribute(`data-portal-lost`),V(),N(),b.uTex.value?.dispose(),D.dispose(),C.dispose(),y.dispose(),y.forceContextLoss(),v.remove(),t.current=null}},[c,t,r]),(0,g.useEffect)(()=>{if(c===`css`)return t.current={mode:`css`,el:a.current},r?.(`css`),()=>{t.current=null}},[c,t,r]),c===`css`?(0,C.jsx)(`div`,{ref:a,"aria-hidden":`true`,className:`pointer-events-none absolute inset-0 z-[2] opacity-0`,style:{background:`radial-gradient(circle at var(--hero-portal-fx, 50%) var(--hero-portal-fy, 60%), #fff 0%, #fff 38%, rgb(255 255 255 / 0) 72%)`}}):(0,C.jsx)(`div`,{ref:i,"data-portal-layer":!0,"aria-hidden":`true`,className:`pointer-events-none invisible absolute inset-0 z-[2] opacity-0`})}export{P as default};