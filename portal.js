/* ZIZ PORTAL — three original real-time generative dimensions.
 * Canvas-only; no dependencies, account data or network requests.
 */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, f) => a + (b - a) * f;
  const SCENES = {
    vortex: { name: 'WORMHOLE', code: '001', poster: 'ENTER<br>THE VOID<span class="poster-point">.</span>', state: 'WORMHOLE / STABLE', rgb: [205, 255, 125] },
    nebula: { name: 'SUPERNOVA', code: '002', poster: 'MAKE<br>STARS<span class="poster-point">.</span>', state: 'STAR CORE / ACTIVE', rgb: [133, 255, 181] },
    grid: { name: 'HYPERGRID', code: '003', poster: 'BREAK<br>THE GRID<span class="poster-point">.</span>', state: 'HYPERSPACE / ONLINE', rgb: [190, 255, 115] }
  };
  const rand = n => {
    const v = Math.sin(n * 127.1 + 32.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const rgba = (col, a) => 'rgba(' + col.join(',') + ',' + clamp(a, 0, 1) + ')';
  const fillCircle = (ctx, x, y, r) => {
    ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); ctx.fill();
  };

  function mount({ motion = () => true } = {}) {
    const host = document.getElementById('portal-stage');
    const canvas = document.getElementById('portal-canvas');
    if (!host || !canvas) return { update() {} };
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return { update() {} };

    const status = document.getElementById('portal-status');
    const poster = document.getElementById('portal-poster');
    const coordinates = document.getElementById('portal-coordinates');
    const powerSlider = document.getElementById('portal-energy');
    const powerOutput = document.getElementById('portal-energy-output');
    const save = document.getElementById('portal-capture');
    const modeButtons = [...document.querySelectorAll('.portal-mode')];
    const stars = Array.from({ length: 160 }, (_, i) => ({
      x: rand(i * 2 + 17), y: rand(i * 2 + 18),
      r: 0.3 + rand(i + 28) * 1.45,
      phase: rand(i + 81) * TAU
    }));
    const streaks = Array.from({ length: 82 }, (_, i) => ({
      a: rand(i * 7 + 3) * TAU, spread: 0.2 + rand(i * 7 + 4) * 0.85,
      seed: rand(i * 7 + 5) * TAU, strength: 0.3 + rand(i * 7 + 6) * .7
    }));
    let world = 'vortex', w = 1, h = 1, dpr = 1;
    let time = 0, frame = 0, previous = 0, raf = 0, onscreen = false, excited = 0;
    let orbitX = 0, orbitY = 0, aimX = 0, aimY = 0;
    let power = Number(powerSlider.value) / 100;
    const shockwaves = [];

    function background(col, cx, cy, radius, strength = 1) {
      const back = ctx.createRadialGradient(cx, cy, radius * .02, cx, cy, radius * 1.8);
      back.addColorStop(0, '#14271b');
      back.addColorStop(.28, '#0b1710');
      back.addColorStop(.67, '#06100a');
      back.addColorStop(1, '#030805');
      ctx.fillStyle = back;
      ctx.fillRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(cx, cy, radius * .08, cx, cy, radius * 1.3);
      glow.addColorStop(0, rgba(col, .09 * strength));
      glow.addColorStop(.4, rgba(col, .11 * strength));
      glow.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }

    function starfield(col, t, rate = 1) {
      for (const [i, s] of stars.entries()) {
        const pulse = .6 + .4 * Math.sin(t * 1.4 + s.phase);
        const x = s.x * w;
        const y = s.y * h;
        ctx.fillStyle = rgba(col, (.15 + s.r * .23) * pulse * rate);
        fillCircle(ctx, x, y, s.r * (.6 + excited * .32));
        if (i % 13 === 0) {
          ctx.strokeStyle = rgba(col, .10 * pulse * rate);
          ctx.lineWidth = .7;
          ctx.beginPath();
          ctx.moveTo(x - 7, y);ctx.lineTo(x + 7, y);
          ctx.moveTo(x, y - 7);ctx.lineTo(x, y + 7);
          ctx.stroke();
        }
      }
    }

    function drawVortex(col, t, cx, cy, radius) {
      background(col, cx, cy, radius, 1.2 + excited * 1.2);
      starfield(col, t, .56);
      // Offset, ribbonlike trajectories create the illusion of a rotating tunnel.
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const turn = t * .27;
      for (let arm = 0; arm < 56; arm++) {
        const base = arm * TAU / 56 + turn;
        const strength = .17 + rand(arm + 41) * .65;
        ctx.lineWidth = .55 + rand(arm + 84) * 1.55 + excited * .6;
        ctx.strokeStyle = rgba(col, strength * (.31 + power * .7));
        ctx.beginPath();
        for (let step = 0; step <= 70; step++) {
          const p = step / 70;
          const rr = radius * (.15 + Math.pow(p, .78) * 1.19);
          const a = base + (1 - p) * 3.6 + Math.sin(p * 10 - t * .7 + arm) * .022;
          const x = cx + Math.cos(a) * rr * 1.26;
          const y = cy + Math.sin(a) * rr * .73;
          if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // High-energy ellipses wrap around the mouth.
      for (let ring = 0; ring < 14; ring++) {
        const r = radius * (.2 + ring * .079);
        const wobble = Math.sin(t + ring * 1.35) * .035;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.24, r * (.72 + wobble), t * .025 + ring * .018, 0, TAU);
        ctx.lineWidth = ring % 4 === 0 ? 2.3 : .8;
        ctx.strokeStyle = rgba(col, (.18 + .14 * Math.sin(ring * 2 + t)) * (1.12 - ring / 27));
        if (ring === 3 || ring === 8) { ctx.shadowBlur = 19 + excited * 13; ctx.shadowColor = rgba(col, .7); }
        else ctx.shadowBlur = 0;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      // Fine, orbiting bright sparks.
      for (const [i, s] of streaks.entries()) {
        const angle = s.a + t * (.32 + s.strength * .22);
        const r = radius * (.31 + s.spread * .81);
        const x = cx + Math.cos(angle) * r * 1.23;
        const y = cy + Math.sin(angle) * r * .72;
        ctx.fillStyle = rgba(col, .33 + s.strength * .55);
        fillCircle(ctx, x, y, .7 + s.strength * 1.7);
      }
      ctx.restore();
      // The absolute black iris gives the portal dramatic depth.
      const core = ctx.createRadialGradient(cx, cy, radius * .03, cx, cy, radius * .3);
      core.addColorStop(0, '#000301');
      core.addColorStop(.53, '#000401');
      core.addColorStop(.76, '#010903');
      core.addColorStop(.9, rgba(col, .29 + excited * .16));
      core.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = core;fillCircle(ctx, cx, cy, radius * .31);
      ctx.save();
      ctx.strokeStyle = rgba(col, .75);
      ctx.shadowBlur = 15;ctx.shadowColor = rgba(col, .85);
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * .20, radius * .115, t * .025, -.35, 2.1);
      ctx.stroke();
      ctx.restore();
    }

    function drawNebula(col, t, cx, cy, radius) {
      background(col, cx, cy, radius, 1.35 + excited * 1.2);
      starfield(col, t, .9);
      ctx.save();ctx.globalCompositeOperation = 'screen';
      const sun = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius * .5);
      sun.addColorStop(0, rgba([244,255,211], .98));
      sun.addColorStop(.12, rgba(col, .72));
      sun.addColorStop(.29, rgba(col, .20));
      sun.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = sun;fillCircle(ctx, cx, cy, radius * .50);
      // Multi-strand flames, fractal-like flowing arcs.
      for (let i = 0; i < 112; i++) {
        const angle = i * TAU / 112 + t * (.10 + excited * .1);
        const seed = rand(i * 2 + 3);
        const reach = radius * (.45 + .55 * seed);
        const width = (.5 + power * 1.3) * (.5 + seed);
        ctx.lineWidth = width;
        ctx.strokeStyle = rgba(col, .20 + .48 * seed);
        ctx.beginPath();
        for (let k = 0; k <= 23; k++) {
          const p = k / 23;
          const spin = angle + p * (.55 + seed * 1.3) + Math.sin(t * .7 + p * 8 + i) * p * .21;
          const rr = reach * (.06 + .96 * p);
          const x = cx + Math.cos(spin) * rr * 1.23;
          const y = cy + Math.sin(spin) * rr * .80;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Individual neon flares with orbiting halos.
      for (let i = 0; i < 14; i++) {
        const angle = i / 14 * TAU + t * .08;
        const r = radius * (.42 + .55 * rand(i + 66));
        const x = cx + Math.cos(angle) * r * 1.25;
        const y = cy + Math.sin(angle) * r * .82;
        ctx.fillStyle = rgba(col, .4 + .45 * rand(i + 90));
        fillCircle(ctx, x, y, 1.8 + rand(i + 26) * 3 + excited * 1.5);
        if (i % 3 === 0) {
          ctx.strokeStyle = rgba(col, .33);
          ctx.beginPath();ctx.arc(x, y, 7 + excited * 12, 0, TAU);ctx.stroke();
        }
      }
      // Arcing plasma filaments.
      for (let ring = 0; ring < 7; ring++) {
        const r = radius * (.32 + ring * .117);
        ctx.strokeStyle = rgba(col, .08 + Math.sin(ring * 4 + t) * .06);
        ctx.lineWidth = ring % 3 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.3, r * .8, -t * .13 + ring * .19, .35, 4.4);
        ctx.stroke();
      }
      ctx.restore();
      // Crisp, multi-pointed star.
      ctx.save();
      ctx.translate(cx, cy);ctx.rotate(t * .1);
      ctx.strokeStyle = rgba([224,255,203], .8);
      ctx.lineWidth=1.5;ctx.shadowColor=rgba(col,.8);ctx.shadowBlur=18;
      for (let i=0;i<8;i++){
        ctx.rotate(TAU/8);
        ctx.beginPath();ctx.moveTo(radius*.07,0);ctx.lineTo(radius*(.18+excited*.11),0);ctx.stroke();
      }
      ctx.restore();
    }

    function drawGrid(col, t, cx, cy, radius) {
      background(col, cx, cy, radius * 1.1, 1.1 + excited);
      starfield(col, t, .35);
      // Perspective wireframe portal stretching towards a far vanishing point.
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.translate(cx,cy);
      ctx.rotate(Math.sin(t * .15) * .13);
      const edges = 4;
      const corners = (r, phase) => {
        return Array.from({length:edges}, (_,i) => {
          const theta = TAU * (i / edges) + Math.PI / 4 + phase;
          return { x:Math.cos(theta)*r*1.45, y:Math.sin(theta)*r*.87 };
        });
      };
      for (let ring=25;ring>=0;ring--){
        const u=(ring + (t * .7)%1)/26;
        const r=radius*(.085+Math.pow(u,1.75)*1.28);
        const points=corners(r,.15*Math.sin(t*.2+u*3));
        ctx.strokeStyle=rgba(col,.10 + (.60*u*u)*(0.6+power*.55));
        ctx.lineWidth=.55+u*1.4;
        if(ring%6===0){ctx.shadowBlur=14;ctx.shadowColor=rgba(col,.7)}
        else ctx.shadowBlur=0;
        ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
        for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
        ctx.closePath();ctx.stroke();
      }
      ctx.shadowBlur=0;
      for(let edge=0;edge<28;edge++){
        const a=edge/28*TAU;
        const ca=Math.cos(a),sa=Math.sin(a);
        ctx.strokeStyle=rgba(col,.12+(.45*rand(edge+80)));
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(ca*radius*.10,sa*radius*.07);
        ctx.lineTo(ca*radius*1.85,sa*radius*1.1);
        ctx.stroke();
      }
      // A spinning neon diamond suspended inside the tunnel.
      const inner = radius * (.20 + excited*.08);
      ctx.save();ctx.rotate(t*.3);
      ctx.strokeStyle=rgba([239,255,223],.88);
      ctx.lineWidth=2;
      ctx.shadowBlur=22;ctx.shadowColor=rgba(col,.9);
      ctx.strokeRect(-inner*.67,-inner*.67,inner*1.34,inner*1.34);
      ctx.rotate(Math.PI/4);
      ctx.strokeStyle=rgba(col,.65);
      ctx.strokeRect(-inner*.37,-inner*.37,inner*.74,inner*.74);
      ctx.restore();
      ctx.restore();
      const light=ctx.createRadialGradient(cx,cy,0,cx,cy,radius*.35);
      light.addColorStop(0,rgba(col,.4+excited*.3));light.addColorStop(1,rgba(col,0));
      ctx.fillStyle=light;fillCircle(ctx,cx,cy,radius*.35);
    }

    function drawShockwaves(col) {
      ctx.save();ctx.globalCompositeOperation='screen';
      for(const p of shockwaves){
        const age=p.age;
        const r = 10 + (Math.pow(age,.9) * Math.max(w,h)*.9);
        ctx.lineWidth=(2.7-age*1.8)*dpr/Math.max(1,dpr);
        ctx.strokeStyle=rgba(col,(1-age)*(.65+power*.25));
        ctx.shadowBlur=age<.65?27:8;
        ctx.shadowColor=rgba(col,.8);
        ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.stroke();
        ctx.lineWidth=1;
        ctx.strokeStyle=rgba(col,(1-age)*.3);
        ctx.beginPath();ctx.arc(p.x,p.y,r*.64,0,TAU);ctx.stroke();
      }
      ctx.restore();
    }

    function render() {
      const col=SCENES[world].rgb;
      const extent=Math.min(w*.45,h*.65);
      const cx=w*.5 + orbitX*w*.125;
      const cy=h*.5 + orbitY*h*.14;
      if(world==='vortex')drawVortex(col,time,cx,cy,extent);
      else if(world==='nebula')drawNebula(col,time,cx,cy,extent);
      else drawGrid(col,time,cx,cy,extent);
      drawShockwaves(col);
      const vignette=ctx.createRadialGradient(w*.5,h*.5,extent*.4,w*.5,h*.5,Math.max(w,h)*.7);
      vignette.addColorStop(0,'rgba(0,0,0,0)');
      vignette.addColorStop(1,'rgba(0,0,0,.57)');
      ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
    }

    function updateFrame(now) {
      raf=0;
      if(!canAnimate())return;
      const dt=Math.min(.045,(now - (previous || now))/1000);
      previous=now;
      time+=dt*(.18 + power*1.2 + excited*.9);
      orbitX=lerp(orbitX,aimX,.035);
      orbitY=lerp(orbitY,aimY,.035);
      excited*=Math.max(0,1-dt*1.35);
      for(let i=shockwaves.length-1;i>=0;i--){
        shockwaves[i].age+=dt*.83;
        if(shockwaves[i].age>=1)shockwaves.splice(i,1);
      }
      frame++;
      render();
      raf=requestAnimationFrame(updateFrame);
    }
    const canAnimate=()=>motion()&&onscreen&&!document.hidden;
    function update() {
      if(canAnimate()) {
        if(!raf){previous=0;raf=requestAnimationFrame(updateFrame)}
      }else{
        if(raf){cancelAnimationFrame(raf);raf=0}
        previous=0;render();
      }
    }

    function burst(x=w*.5,y=h*.5) {
      shockwaves.push({x,y,age:0});
      if(shockwaves.length>6)shockwaves.shift();
      excited=1;
      status.textContent='ENERGY RELEASED / '+SCENES[world].name;
      if(!motion()){
        // Show a bright static shockwave, never trigger involuntary animation.
        shockwaves[shockwaves.length-1].age=.25;
        render();
      }else update();
    }

    function switchWorld(value) {
      if(!SCENES[value])return;
      world=value;
      host.dataset.world=value;
      const scene=SCENES[value];
      modeButtons.forEach(button=>{
        const active=button.dataset.world===value;
        button.classList.toggle('is-active',active);
        button.setAttribute('aria-pressed',String(active));
      });
      coordinates.textContent='DIMENSION_'+scene.code+' // '+scene.name;
      poster.innerHTML=scene.poster;
      status.textContent=scene.state;
      aimX=0;aimY=0;
      excited=.75;
      shockwaves.length=0;
      render();update();
    }

    function resize() {
      const rect=host.getBoundingClientRect();
      w=Math.max(1,rect.width);h=Math.max(1,rect.height);
      dpr=Math.min(window.devicePixelRatio||1,1.75);
      canvas.width=Math.max(1,Math.round(w*dpr));
      canvas.height=Math.max(1,Math.round(h*dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
      render();
    }

    canvas.addEventListener('pointermove',event=>{
      const r=canvas.getBoundingClientRect();
      aimX=clamp((event.clientX-r.left-r.width*.5)/(r.width*.5),-1,1);
      aimY=clamp((event.clientY-r.top-r.height*.5)/(r.height*.5),-1,1);
      if(!motion()){orbitX=aimX;orbitY=aimY;render()}
    },{passive:true});
    canvas.addEventListener('pointerleave',()=>{aimX=0;aimY=0});
    canvas.addEventListener('pointerdown',event=>{
      const r=canvas.getBoundingClientRect();
      burst(event.clientX-r.left,event.clientY-r.top);
    });
    canvas.addEventListener('keydown',event=>{
      if(event.code==='Space'||event.code==='Enter'){
        event.preventDefault();
        burst();
      }
    });
    modeButtons.forEach(button=>button.addEventListener('click',()=>switchWorld(button.dataset.world)));
    powerSlider.addEventListener('input',()=>{
      power=Number(powerSlider.value)/100;
      powerOutput.textContent=powerSlider.value+'%';
      render();
    });
    document.getElementById('portal-trigger').addEventListener('click',()=>burst());
    save.addEventListener('click',()=>{
      try {
        canvas.toBlob(blob=>{
          if(!blob){status.textContent='COULD NOT SAVE IMAGE';return}
          const url=URL.createObjectURL(blob);
          const anchor=document.createElement('a');
          anchor.href=url;
          anchor.download='ziz-'+world+'-dimension.png';
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          setTimeout(()=>URL.revokeObjectURL(url),1000);
          status.textContent='ART SAVED / '+SCENES[world].name;
        },'image/png');
      }catch{status.textContent='IMAGE SAVE NOT SUPPORTED'}
    });
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize',resize,{passive:true});
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{
        onscreen=!!entries[0]?.isIntersecting;update();
      },{threshold:.04}).observe(host);
    }else onscreen=true;
    document.addEventListener('visibilitychange',update);
    resize();
    switchWorld('vortex');
    update();
    return {update, switchWorld, burst};
  }

  window.ZizPortal={mount};
})();
