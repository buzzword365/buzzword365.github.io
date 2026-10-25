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
      resetGaze();
    }
    updateAnimation();
    window.dispatchEvent(new Event('ziz:motion-changed'));
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

  // Build a continuous marquee from two exact, equal-length strips.
  // Each strip is wider than the viewport, so the animation never reaches an empty edge.
  const ticker=$('#marquee-inner');
  const tickerParts=ticker?[...ticker.querySelectorAll('.marquee-copy')]:[];
  const initialTicker=tickerParts[0]?.innerHTML || '';
  let lastTickerWidth=0;
  function sizeTicker(){
    if(tickerParts.length!==2)return;
    const view=window.innerWidth;
    if(view===lastTickerWidth)return;
    lastTickerWidth=view;
    tickerParts[0].innerHTML=initialTicker;
    let count=0;
    while(tickerParts[0].getBoundingClientRect().width < view+120 && count < 12){
      tickerParts[0].insertAdjacentHTML('beforeend',initialTicker);
      count++;
    }
    tickerParts[1].innerHTML=tickerParts[0].innerHTML;
    const stripWidth=tickerParts[0].getBoundingClientRect().width;
    ticker.style.setProperty('--marquee-duration',(stripWidth/98).toFixed(2)+'s');
  }
  sizeTicker();
  document.fonts?.ready?.then(()=>{lastTickerWidth=0;sizeTicker()});
  window.addEventListener('resize',sizeTicker,{passive:true});

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
    if(!menu.classList.contains('is-open'))return;
    if(ev.key==='Escape'){setMenu(false);return}
    if(ev.key==='Tab'){
      const links=[menuToggle,...menu.querySelectorAll('a:not([hidden])')];
      const first=links[0],last=links[links.length-1];
      if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}
      else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}
    }
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

  const orbStage=$('#orb-stage'),orb=$('#orb-container'),orbFace=$('.orb-face',orbStage);
  const eyes=$$('.eye',orbFace),pupils=$$('.pupil',orbFace);
  const clamp=(num,min,max)=>Math.max(min,Math.min(max,num));
  const resetGaze=()=>{
    orb.style.transform='';
    orbFace.style.removeProperty('--eye-x');
    orbFace.style.removeProperty('--eye-y');
    pupils.forEach(p=>{
      p.style.removeProperty('--pupil-x');
      p.style.removeProperty('--pupil-y');
    });
  };
  const gazeAt=(clientX,clientY)=>{
    if(!motionEnabled)return;
    const r=orbStage.getBoundingClientRect();
    const x=clamp((clientX-r.left-r.width/2)/(r.width/2),-1,1);
    const y=clamp((clientY-r.top-r.height/2)/(r.height/2),-1,1);
    // Orbit + entire white eyes shift together; the pupils add finer gaze movement.
    orb.style.transform='rotateY('+(x*7)+'deg) rotateX('+(-y*6)+'deg)';
    const diameter=orbFace.clientWidth;
    const travelX=diameter*.053,travelY=diameter*.042;
    orbFace.style.setProperty('--eye-x',(x*travelX).toFixed(2)+'px');
    orbFace.style.setProperty('--eye-y',(y*travelY).toFixed(2)+'px');
    eyes.forEach((eye,i)=>{
      const pupil=pupils[i];
      const reach=Math.min(eye.clientWidth*.13,18);
      pupil.style.setProperty('--pupil-x',(x*reach).toFixed(2)+'px');
      pupil.style.setProperty('--pupil-y',(y*reach*.68).toFixed(2)+'px');
    });
  };
  document.addEventListener('pointermove',ev=>{
    if(ev.pointerType==='touch')return;
    gazeAt(ev.clientX,ev.clientY);
  },{passive:true});
  // On touch screens the face follows a finger while it moves across the hero.
  // Let the eyes respond to a finger anywhere in the hero, including
  // the portion covered by the large headline on small screens.
  const hero=$('.hero');
  hero.addEventListener('pointerdown',ev=>{
    if(ev.pointerType==='touch')gazeAt(ev.clientX,ev.clientY);
  },{passive:true});
  hero.addEventListener('pointermove',ev=>{
    if(ev.pointerType==='touch')gazeAt(ev.clientX,ev.clientY);
  },{passive:true});
  window.addEventListener('blur',resetGaze);

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

  // Local WebGL sculpture handles its own controls and listens for motion changes.
  syncMotion();
})();
