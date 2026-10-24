(() => {
  'use strict';
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>[...root.querySelectorAll(s)];
  const html=document.documentElement;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=window.matchMedia('(pointer: coarse)');
  const get=(key)=>{try{return localStorage.getItem(key)}catch{return null}};
  const set=(key,val)=>{try{localStorage.setItem(key,val)}catch{}};

  const projects={
    weather:{index:'001 / DESKTOP EXPERIMENT',title:'Weather Eyes',description:'A living macOS wallpaper. It responds to real weather for a location you choose, and its curious eyes watch your cursor. Rain, snow, daily colourway rolls and all those little interactions make it feel like a companion.',image:'weather-preview.svg',alt:'Weather Eyes dark green project illustration',stack:['Swift','WebKit','JavaScript','Canvas','Open-Meteo'],url:'https://github.com/buzzword365/weather-eyes'},
    sonora:{index:'002 / MUSIC EXPERIENCE',title:'Sonora Music',description:'A local-first music player for macOS, built for a beautiful listening experience. Organise your files, enjoy playlists, control playback and pair a phone companion on your local network. The public release includes the compiled React frontend.',image:'sonora-preview.svg',alt:'Sonora Music neon-green record illustration',stack:['Electron','React','Node.js','JavaScript'],url:'https://github.com/buzzword365/sonora-music'},
    spoof:{index:'003 / DEVELOPER UTILITY',title:'Spoof by Ziz',description:'A locally hosted, map-driven iPhone location simulation utility for app development and testing. Explore a route on a map and send test coordinates to a USB-connected device you control.',image:'spoof-preview.svg',alt:'Spoof by Ziz route map illustration',stack:['Python','Swift','Leaflet','OpenStreetMap'],url:'https://github.com/buzzword365/spoof-by-ziz'},
    notes:{index:'004 / STUDY TOOL',title:'Class Notes',description:'A local-first study companion that turns live class speech into transcripts, extracts homework and assessment tasks, and keeps study notes and timetables organised. The public version has no preloaded school information.',image:'class-notes-preview.svg',alt:'Class Notes lavender study illustration',stack:['Python','PySide6','SQLite','Whisper','Ollama'],url:'https://github.com/buzzword365/class-notes'}
  };

  $('#year').textContent=String(new Date().getFullYear());

  let motionEnabled=!reduced.matches && get('ziz-motion')!=='off';
  let updateAnimation=()=>{};
  const motionToggle=$('#motion-toggle');
  const syncMotion=()=>{
    html.classList.toggle('motion-off',!motionEnabled);
    motionToggle.querySelector('span').textContent=motionEnabled?'ON':'OFF';
    motionToggle.setAttribute('aria-pressed',String(motionEnabled));
    if(!motionEnabled){
      $$('.reveal').forEach(el=>el.classList.add('is-visible'));
      $('#orb-container').style.transform='';
      $$('.pupil').forEach(p=>{p.style.removeProperty('--pupil-x');p.style.removeProperty('--pupil-y')});
    }
    updateAnimation();
  };
  motionToggle.addEventListener('click',()=>{motionEnabled=!motionEnabled;set('ziz-motion',motionEnabled?'on':'off');syncMotion()});
  reduced.addEventListener?.('change',ev=>{if(ev.matches){motionEnabled=false;syncMotion()}});

  let light=get('ziz-portfolio-theme')==='light';
  const themeToggle=$('#theme-toggle');
  const applyTheme=()=>{
    html.dataset.theme=light?'light':'dark';
    themeToggle.querySelector('span').textContent=light?'DAYLIGHT':'NOCTURNE';
    themeToggle.setAttribute('aria-pressed',String(light));
  };
  applyTheme();
  themeToggle.addEventListener('click',()=>{light=!light;set('ziz-portfolio-theme',light?'light':'dark');applyTheme()});

  const header=$('#header'),progress=$('#page-progress');
  let scrollQueued=false;
  const updateScroll=()=>{
    scrollQueued=false;
    const scroll=window.scrollY||0;
    const total=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    progress.style.transform='scaleX('+Math.min(1,scroll/total)+')';
    header.classList.toggle('is-scrolled',scroll>35);
  };
  window.addEventListener('scroll',()=>{
    if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll)}
  },{passive:true});
  updateScroll();

  const menu=$('#site-menu'),menuToggle=$('#menu-toggle');
  let menuFocus=null;
  const setMenu=open=>{
    menu.classList.toggle('is-open',open);
    header.classList.toggle('is-menu',open);
    menuToggle.setAttribute('aria-expanded',String(open));
    $('.menu-label',menuToggle).textContent=open?'CLOSE':'MENU';
    menu.setAttribute('aria-hidden',String(!open));
    menu.inert=!open;
    document.body.classList.toggle('modal-open',open);
    if(open){menuFocus=document.activeElement;setTimeout(()=>{if(menu.classList.contains('is-open')) $('[data-menu-link]',menu)?.focus()},180)}
    else{(menuFocus instanceof HTMLElement?menuFocus:menuToggle).focus({preventScroll:true})}
  };
  menuToggle.addEventListener('click',()=>setMenu(!menu.classList.contains('is-open')));
  $$('[data-menu-link]').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  menu.addEventListener('click',ev=>{
    if(ev.target instanceof Element && ev.target.closest('.menu-bottom a'))setMenu(false);
  });
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'&&menu.classList.contains('is-open'))setMenu(false);
  });

  if('IntersectionObserver' in window && motionEnabled){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})
    },{rootMargin:'0px 0px -10% 0px',threshold:.05});
    $$('.reveal').forEach(el=>observer.observe(el));
  }else $$('.reveal').forEach(el=>el.classList.add('is-visible'));

  const dialog=$('#project-dialog'),close=$('#dialog-close');
  let dialogFocus=null;
  function showProject(key){
    const data=projects[key];
    if(!data)return;
    dialogFocus=document.activeElement;
    $('#dialog-index').textContent=data.index;
    $('#dialog-title').textContent=data.title;
    $('#dialog-description').textContent=data.description;
    $('#dialog-image').src='./assets/'+data.image;
    $('#dialog-image').alt=data.alt;
    $('#dialog-link').href=data.url;
    const pills=data.stack.map(name=>{const el=document.createElement('span');el.textContent=name;return el});
    $('#dialog-stack').replaceChildren(...pills);
    if(typeof dialog.showModal==='function'){dialog.showModal();document.body.classList.add('modal-open');close.focus()}
    else window.open(data.url,'_blank','noopener,noreferrer');
  }
  $$('.project-card').forEach(card=>{
    card.addEventListener('click',ev=>{
      if(ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey||ev.button!==0)return;
      ev.preventDefault();showProject(card.dataset.project);
    });
    card.addEventListener('pointermove',ev=>{
      const r=card.getBoundingClientRect(),shine=$('.project-shine',card);
      if(shine){
        shine.style.setProperty('--shine-x',((ev.clientX-r.left)/r.width*100)+'%');
        shine.style.setProperty('--shine-y',((ev.clientY-r.top)/r.height*100)+'%');
      }
    },{passive:true});
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close()});
  dialog.addEventListener('close',()=>{
    document.body.classList.remove('modal-open');
    if(dialogFocus instanceof HTMLElement)dialogFocus.focus({preventScroll:true});
  });

  $$('.filter').forEach(button=>button.addEventListener('click',()=>{
    const category=button.dataset.filter;
    $$('.filter').forEach(el=>{
      const active=el===button;el.classList.toggle('is-active',active);el.setAttribute('aria-pressed',String(active))
    });
    let count=0;
    $$('.project-card').forEach(card=>{
      const visible=category==='all'||card.dataset.category===category;
      card.hidden=!visible;if(visible)count++;
    });
    $('#no-results').hidden=count>0;
    $('#project-grid').setAttribute('aria-label',String(count)+' projects shown');
  }));

  const orbStage=$('#orb-stage'),orb=$('#orb-container'),pupils=$$('.pupil');
  document.addEventListener('pointermove',ev=>{
    if(!motionEnabled||ev.pointerType==='touch')return;
    const r=orbStage.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,(ev.clientX-r.left-r.width/2)/(r.width/2)));
    const y=Math.max(-1,Math.min(1,(ev.clientY-r.top-r.height/2)/(r.height/2)));
    orb.style.transform='rotateY('+(x*9)+'deg) rotateX('+(-y*8)+'deg)';
    pupils.forEach((p,i)=>{
      const reach=i===0?14:12;
      p.style.setProperty('--pupil-x',(x*reach)+'px');
      p.style.setProperty('--pupil-y',(y*reach)+'px');
    });
  },{passive:true});

  if(!coarse.matches){
    const cursor=$('#cursor-orbit');
    let tx=-100,ty=-100,cx=-100,cy=-100,curAnimating=false;
    const cursorFrame=()=>{
      cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;
      cursor.style.transform='translate3d('+(cx-cursor.offsetWidth/2)+'px,'+(cy-cursor.offsetHeight/2)+'px,0)';
      if(Math.abs(cx-tx)+Math.abs(cy-ty)>.35)requestAnimationFrame(cursorFrame);
      else curAnimating=false;
    };
    document.addEventListener('pointermove',ev=>{
      tx=ev.clientX;ty=ev.clientY;cursor.style.opacity='1';
      if(!curAnimating){curAnimating=true;requestAnimationFrame(cursorFrame)}
    },{passive:true});
    document.addEventListener('pointerout',ev=>{if(!ev.relatedTarget)cursor.style.opacity='0'});
    $$('a,button,input[type="range"]').forEach(el=>{
      el.addEventListener('mouseenter',()=>cursor.classList.add('is-hovered'));
      el.addEventListener('mouseleave',()=>cursor.classList.remove('is-hovered'));
    });
    document.addEventListener('pointerdown',()=>cursor.classList.add('is-clicked'));
    document.addEventListener('pointerup',()=>cursor.classList.remove('is-clicked'));
    $$('.magnet').forEach(el=>{
      el.addEventListener('pointermove',ev=>{
        if(!motionEnabled)return;
        const r=el.getBoundingClientRect();
        el.style.transform='translate('+
          ((ev.clientX-r.left-r.width/2)*.1)+'px,'+
          ((ev.clientY-r.top-r.height/2)*.1)+'px)';
      },{passive:true});
      el.addEventListener('pointerleave',()=>{el.style.transform=''});
    });
  }

  // Canvas built without dependencies or telemetry.
  const canvas=$('#signal-canvas'),field=$('#lab-display'),ctx=canvas.getContext('2d');
  const intensity=$('#intensity'),amount=$('#intensity-output'),countEl=$('#signal-count'),status=$('#lab-status'),colorButton=$('#signal-color');
  let purple=false,signalCount=0,labVisible=false,frame=0,raf=0,w=1,h=1,nodes=[];
  const pointer={x:-1000,y:-1000,active:false},pulses=[];
  const tone=alpha=>{
    const rgb=purple?'194,159,255':'204,255,133';
    return 'rgba('+rgb+','+alpha+')';
  };
  function resetNodes(){
    const total=Math.max(36,Math.min(112,Math.floor(w*h/4400)));
    nodes=Array.from({length:total},(_,i)=>({
      angle:i*2.39996323,dist:Math.sqrt((i+.6)/total),phase:i*.34,x:w/2,y:h/2
    }));
  }
  function renderField(){
    if(!ctx)return;
    ctx.clearRect(0,0,w,h);
    const t=frame*.004,cx=w*.5,cy=h*.5,radius=Math.min(w*.34,h*.45);
    const pull=Number(intensity.value)/100;
    for(const n of nodes){
      const theta=n.angle+t*.42,dist=n.dist*radius;
      let x=cx+Math.cos(theta)*dist*1.5+Math.sin(t*1.7+n.phase)*3.7;
      let y=cy+Math.sin(theta)*dist*.95+Math.cos(t*1.8+n.phase)*4;
      if(pointer.active&&motionEnabled){
        const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy)||1,influence=155*pull;
        if(d<influence){
          const k=(1-d/influence),power=k*k*(3-2*k)*65*pull;
          x+=(dx/d)*power;y+=(dy/d)*power;
        }
      }
      n.x=x;n.y=y;
      ctx.fillStyle=tone(.16+.65*n.dist);
      ctx.beginPath();ctx.arc(x,y,1.1+1.9*n.dist,0,Math.PI*2);ctx.fill();
    }
    ctx.lineWidth=1;
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
        if(d2<98*98&&d2>20*20){
          ctx.strokeStyle=tone(.065*(1-d2/(98*98))*(1+pull));
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    for(let ring=0;ring<3;ring++){
      const rr=radius*(.47+ring*.28);
      ctx.strokeStyle=tone(.13-ring*.025);
      ctx.setLineDash(ring===1?[4,12]:[]);
      ctx.beginPath();ctx.ellipse(cx,cy,rr*1.53,rr,Math.sin(t*.4+ring)*.06,0,Math.PI*2);ctx.stroke();
    }
    ctx.setLineDash([]);
    if(motionEnabled){
      for(let i=pulses.length-1;i>=0;i--){
        const p=pulses[i];p.r+=3.6+pull*2;p.opacity-=.021;
        if(p.opacity<=0){pulses.splice(i,1);continue}
        ctx.strokeStyle=tone(p.opacity*.65);ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.stroke();
      }
    }
  }
  function animate(){
    raf=0;
    if(!motionEnabled||!labVisible||document.hidden)return;
    frame++;renderField();raf=requestAnimationFrame(animate);
  }
  updateAnimation=()=>{
    if(motionEnabled&&labVisible&&!document.hidden){if(!raf)raf=requestAnimationFrame(animate)}
    else{if(raf){cancelAnimationFrame(raf);raf=0}renderField()}
  };
  const resize=()=>{
    const rect=field.getBoundingClientRect();
    w=Math.max(1,rect.width);h=Math.max(1,rect.height);
    const dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);resetNodes();renderField();
  };
  canvas.addEventListener('pointermove',ev=>{
    const r=canvas.getBoundingClientRect();
    pointer.x=ev.clientX-r.left;pointer.y=ev.clientY-r.top;pointer.active=true;
    if(!motionEnabled)renderField();
  },{passive:true});
  canvas.addEventListener('pointerleave',()=>{pointer.active=false;if(!motionEnabled)renderField()},{passive:true});
  canvas.addEventListener('pointerdown',ev=>{
    const r=canvas.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top;
    pointer.x=x;pointer.y=y;pointer.active=true;
    pulses.push({x,y,r:15,opacity:1});if(pulses.length>10)pulses.shift();
    signalCount++;countEl.textContent=String(signalCount).padStart(3,'0');
    status.textContent='SIGNAL RECEIVED';
    if(!motionEnabled)renderField();
  });
  intensity.addEventListener('input',()=>{
    amount.textContent=intensity.value+'%';if(!motionEnabled)renderField();
  });
  colorButton.addEventListener('click',()=>{
    purple=!purple;
    colorButton.setAttribute('aria-pressed',String(purple));
    colorButton.firstChild.textContent=purple?'GREEN FREQUENCY ':'SWITCH FREQUENCY ';
    renderField();
  });
  $('#signal-reset').addEventListener('click',()=>{
    signalCount=0;countEl.textContent='000';pulses.length=0;pointer.active=false;
    status.textContent='MOVE TO EXPLORE';intensity.value='65';amount.textContent='65%';
    purple=false;colorButton.setAttribute('aria-pressed','false');
    colorButton.firstChild.textContent='SWITCH FREQUENCY ';renderField();
  });
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(field);
  else window.addEventListener('resize',resize,{passive:true});
  if('IntersectionObserver'in window){
    new IntersectionObserver(entries=>{
      labVisible=!!entries[0]?.isIntersecting;updateAnimation()
    },{threshold:.05}).observe(field);
  }else labVisible=true;
  document.addEventListener('visibilitychange',updateAnimation);
  resize();syncMotion();
})();
