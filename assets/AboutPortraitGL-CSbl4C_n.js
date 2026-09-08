import{f as e,l as t,o as n,u as r}from"./index-DYFq0Fqo.js";import{At as i,G as a,I as o,g as s,ht as c,mt as l,n as u,rt as d,u as f}from"./three.module-BFmht-cx.js";var p=e(r(),1),m=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`,h=`
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
`,g={amp:.007,top:.27,peak:.37,bottom:.56,collar:.35},_=n(),v=1.75;function y({videoRef:e,onReady:n,onFail:r}){let y=(0,p.useRef)(null);return(0,p.useEffect)(()=>{let p=y.current,_=e.current;if(!p||!_)return;s.enabled=!1;let b;try{b=new u({canvas:p,alpha:!0,antialias:!1,premultipliedAlpha:!1,powerPreference:`low-power`})}catch{r?.();return}b.setClearColor(0,0);let x=new i(_);x.minFilter=o,x.magFilter=o,x.generateMipmaps=!1;let S={uMap:{value:x},uShrug:{value:0},uAmp:{value:g.amp},uTop:{value:g.top},uPeak:{value:g.peak},uBottom:{value:g.bottom},uCollar:{value:g.collar}},C=new d(1,1),w=new c({vertexShader:m,fragmentShader:h,uniforms:S,transparent:!0,depthTest:!1,depthWrite:!1}),T=new l;T.add(new a(C,w));let E=new f,D=()=>{let e=p.parentElement;if(!e)return;let t=e.clientWidth,n=e.clientHeight;if(!t||!n)return;let r=p.getBoundingClientRect(),i=r.width&&t?r.width/t:1,a=Math.min((window.devicePixelRatio||1)*i,v);b.setPixelRatio(a),b.setSize(t,n,!1),b.render(T,E)};D();let O=new ResizeObserver(D);p.parentElement&&O.observe(p.parentElement);let k=t.timeline({repeat:-1});k.to(S.uShrug,{value:1,duration:.42,ease:`power2.out`}).to(S.uShrug,{value:0,duration:1.25,ease:`power2.inOut`},`+=0.18`).to({},{duration:3.4}).to(S.uShrug,{value:.55,duration:.5,ease:`power2.out`}).to(S.uShrug,{value:0,duration:1.4,ease:`power2.inOut`},`+=0.1`).to({},{duration:4.6});let A=new Uint8Array(4),j=(e,t)=>{let n=b.getContext(),r=b.domElement.width,i=b.domElement.height;if(!r||!i)return-1;let a=Math.min(r-1,Math.max(0,Math.round(r*e))),o=Math.min(i-1,Math.max(0,Math.round(i*(1-t))));return n.readPixels(a,o,1,1,n.RGBA,n.UNSIGNED_BYTE,A),A[3]},M=0,N=!1,P=0,F=!0,I=new IntersectionObserver(([e])=>{F=e.isIntersecting,N&&(F?k.resume():k.pause())},{rootMargin:`25% 0px 25% 0px`});I.observe(p);let L=0,R=(e=0)=>{if(M=requestAnimationFrame(R),document.hidden||N&&!F||N&&e-L<30.303030303030305||(L=e,b.render(T,E),N))return;let t=j(.5,.6),i=j(.01,.02);if(t>240&&i<16){N=!0,F||k.pause(),n?.();return}if(t>240&&i>240){N=!0,r?.();return}++P>60&&(N=!0,r?.())};M=requestAnimationFrame(R);let z=e=>{e.preventDefault(),r?.()};return p.addEventListener(`webglcontextlost`,z),()=>{cancelAnimationFrame(M),p.removeEventListener(`webglcontextlost`,z),I.disconnect(),O.disconnect(),k.kill(),x.dispose(),C.dispose(),w.dispose(),b.dispose()}},[e,n,r]),(0,_.jsx)(`canvas`,{ref:y,"aria-hidden":`true`,className:`absolute inset-0 h-full w-full select-none`})}export{y as default};