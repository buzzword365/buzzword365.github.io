/* ZIZ sculpture: original drag-to-rotate WebGL geometry.
   Bundled with Three.js (MIT) for offline-ready static hosting. */
import * as THREE from 'three';

(() => {
  const root=document.getElementById('sculpture-shell'),stage=document.getElementById('sculpture-stage');
  const canvas=document.getElementById('sculpture-canvas'),status=document.getElementById('sculpture-state');
  if(!root||!canvas)return;
  const buttons=[...document.querySelectorAll('[data-finish]')];
  const spin=document.getElementById('sculpture-spin');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let renderer,scene,camera,model,holder;
  let visible=false,raf=0,drag=false,dragId=null,lastX=0,lastY=0;
  let yaw=-.54,pitch=.20,velocityX=0,velocityY=0,auto=true,finish='lime';
  const fallback=(reason)=>{
    if(raf)cancelAnimationFrame(raf);raf=0;
    canvas.hidden=true;
    const backup=document.getElementById('sculpture-fallback');
    backup.hidden=false;status.textContent=reason||'WEBGL UNAVAILABLE / STATIC VIEW';
    buttons.forEach(b=>b.disabled=true);
    for(const id of ['sculpture-reset','sculpture-spin','sculpture-save'])document.getElementById(id).disabled=true;
  };
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'default'});
    renderer.setClearColor('#08110a',1);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.4;
  }catch(e){fallback();return}
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(38,1,.1,40);camera.position.z=6.8;

  // A painted 360° studio softbox; provides actual specular reflections on metal.
  const envCanvas=document.createElement('canvas');
  envCanvas.width=1024;envCanvas.height=512;
  const c=envCanvas.getContext('2d');
  const gradient=c.createLinearGradient(0,0,1024,512);
  gradient.addColorStop(0,'#172f21');gradient.addColorStop(.17,'#8fae8f');
  gradient.addColorStop(.4,'#020a05');gradient.addColorStop(.65,'#c1d4b1');
  gradient.addColorStop(1,'#05120a');c.fillStyle=gradient;c.fillRect(0,0,1024,512);
  [[60,100,340,.85],[280,65,400,.75],[535,160,420,1],[875,85,365,.65]].forEach(([x,width,height,alpha])=>{
    const g=c.createLinearGradient(x,0,x+width,0);
    g.addColorStop(0,'rgba(255,255,245,0)');
    g.addColorStop(.28,'rgba(255,255,245,'+alpha+')');
    g.addColorStop(.7,'rgba(233,255,220,'+alpha+')');
    g.addColorStop(1,'rgba(255,255,245,0)');
    c.fillStyle=g;c.fillRect(x,20,width,height);
  });
  const top=c.createLinearGradient(0,0,0,200);
  top.addColorStop(0,'rgba(255,255,238,.85)');top.addColorStop(1,'rgba(255,255,238,0)');
  c.fillStyle=top;c.fillRect(0,0,1024,200);
  const envRaw=new THREE.CanvasTexture(envCanvas);
  envRaw.mapping=THREE.EquirectangularReflectionMapping;
  envRaw.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromEquirectangular(envRaw).texture;
  pmrem.dispose();envRaw.dispose();

  scene.add(new THREE.HemisphereLight('#fff7df','#194a27',2));
  const spot=new THREE.PointLight('#fffce7',85,14,1.6);
  spot.position.set(-4,5,5);scene.add(spot);
  const rim=new THREE.PointLight('#b5ff72',70,13,1.65);
  rim.position.set(4,-3,-3);scene.add(rim);
  const cool=new THREE.PointLight('#abcfff',26,11,1.7);
  cool.position.set(3,3,4);scene.add(cool);

  const mats={
    lime:new THREE.MeshPhysicalMaterial({color:'#a5ff5b',metalness:.73,roughness:.11,clearcoat:1,clearcoatRoughness:.027,envMapIntensity:2.7}),
    chrome:new THREE.MeshPhysicalMaterial({color:'#efffee',metalness:1,roughness:.07,clearcoat:.85,clearcoatRoughness:.025,envMapIntensity:3}),
    obsidian:new THREE.MeshPhysicalMaterial({color:'#183522',metalness:.67,roughness:.08,clearcoat:1,clearcoatRoughness:.028,envMapIntensity:3})
  };
  holder=new THREE.Group();scene.add(holder);
  model=new THREE.Mesh(new THREE.TorusKnotGeometry(1.05,.29,320,48,3,5),mats.lime);
  model.rotation.z=.2;holder.add(model);

  const halo=new THREE.Mesh(new THREE.RingGeometry(1.99,1.996,160),new THREE.MeshBasicMaterial({color:'#aaff76',transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));
  halo.position.z=-.7;scene.add(halo);

  let width=1,height=1;
  const draw=()=>{if(!renderer)return;holder.rotation.set(pitch,yaw,0);renderer.render(scene,camera)};
  const resize=()=>{
    const r=stage.getBoundingClientRect();
    width=r.width;height=r.height;if(width<10||height<10)return;
    const dpr=Math.min(1.7,devicePixelRatio||1);
    renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.position.z=width/height<.9?8.8:width/height<1.4?7.5:6.8;
    camera.updateProjectionMatrix();draw();
  };
  const motion=()=>!reduced.matches&&!document.documentElement.classList.contains('motion-off');
  const tick=()=>{
    raf=0;if(!motion()||!visible||document.hidden)return;
    if(!drag){
      yaw+=(auto?.0038:0)+velocityX;pitch=THREE.MathUtils.clamp(pitch+velocityY,-1.4,1.4);
      velocityX*=.92;velocityY*=.92;
    }
    halo.rotation.z+=.0004;
    draw();raf=requestAnimationFrame(tick);
  };
  const sync=()=>{
    if(motion()&&visible&&!document.hidden){if(!raf)raf=requestAnimationFrame(tick)}
    else{if(raf)cancelAnimationFrame(raf);raf=0;draw()}
  };

  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==undefined&&e.button!==0)return;
    drag=true;dragId=e.pointerId;lastX=e.clientX;lastY=e.clientY;velocityX=0;velocityY=0;
    canvas.setPointerCapture(e.pointerId);root.classList.add('is-dragging');
    status.textContent='YOUR ANGLE / YOUR OBJECT';e.preventDefault();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==dragId)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;
    yaw+=dx*.009;pitch=THREE.MathUtils.clamp(pitch+dy*.008,-1.4,1.4);
    velocityX=motion()?dx*.0004:0;velocityY=motion()?dy*.00035:0;
    lastX=e.clientX;lastY=e.clientY;draw();e.preventDefault();
  });
  const release=e=>{
    if(e.pointerId!==dragId)return;
    drag=false;dragId=null;root.classList.remove('is-dragging');
    status.textContent='DRAG / ROTATE / EXPLORE';
  };
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('keydown',e=>{
    const step=e.shiftKey?.23:.1;
    if(e.key==='ArrowLeft')yaw-=step;
    else if(e.key==='ArrowRight')yaw+=step;
    else if(e.key==='ArrowUp')pitch-=step;
    else if(e.key==='ArrowDown')pitch+=step;
    else return;
    e.preventDefault();draw();status.textContent='KEYBOARD ROTATION / ACTIVE';
  });
  buttons.forEach(button=>button.addEventListener('click',()=>{
    finish=button.dataset.finish;
    model.material=mats[finish]||mats.lime;
    buttons.forEach(b=>{const on=b===button;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on))});
    status.textContent=finish.toUpperCase()+' / FINISH APPLIED';draw();
  }));
  document.getElementById('sculpture-reset').addEventListener('click',()=>{
    yaw=-.54;pitch=.2;velocityX=0;velocityY=0;draw();
    status.textContent='ORIENTATION / RESET';canvas.focus({preventScroll:true});
  });
  spin.addEventListener('click',()=>{
    auto=!auto;spin.setAttribute('aria-pressed',String(auto));
    spin.textContent='AUTO-ROTATE: '+(auto?'ON':'OFF');
    status.textContent=auto?'SLOW ROTATION / ON':'ROTATION / MANUAL';
    sync();draw();
  });
  document.getElementById('sculpture-save').addEventListener('click',()=>{
    draw();
    const a=document.createElement('a');
    a.download='ziz-sculpture-'+finish+'.png';
    a.href=canvas.toDataURL('image/png');
    a.click();
    status.textContent='IMAGE / SAVED';
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback('GRAPHICS CONTEXT LOST')});
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize',resize,{passive:true});
  if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=!!e[0]?.isIntersecting;sync()},{threshold:.03}).observe(stage);
  else visible=true;
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('ziz:motion-changed',sync);
  reduced.addEventListener?.('change',sync);
  resize();draw();sync();status.textContent='DRAG / ROTATE / EXPLORE';
  window.ZizSculpture={getRotation:()=>({x:pitch,y:yaw}),getFinish:()=>finish};
})();