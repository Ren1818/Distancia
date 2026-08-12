// loveQuestion.js - muestra la pregunta "¿Me permites estar en tu corazón?" con botones Sí/No
// El botón NO escapa (desktop: mouseenter; mobile: touchstart). El botón SÍ lanza una transición cinematográfica.

export function showQuestion(){
  // Prevent multiple instances
  if(document.querySelector('.love-question-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'love-question-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');

  const card = document.createElement('div');
  card.className = 'love-question-card';

  const title = document.createElement('h2');
  title.textContent = '¿Me permites estar en tu corazón?';

  const buttons = document.createElement('div');
  buttons.className = 'love-buttons';

  const btnYes = document.createElement('button');
  btnYes.className = 'btn-yes';
  btnYes.textContent = 'Sí ❤️';
  btnYes.setAttribute('aria-label','Sí, acepto');

  const btnNo = document.createElement('button');
  btnNo.className = 'btn-no';
  btnNo.textContent = 'No';
  btnNo.setAttribute('aria-label','No, escapar');

  buttons.appendChild(btnNo);
  buttons.appendChild(btnYes);

  card.appendChild(title);
  card.appendChild(buttons);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Ensure focus order
  btnYes.focus();

  // NO button behavior: flee on mouseenter (desktop) or touchstart (mobile)
  function moveNo(el){
    const padding = 14;
    const bw = el.offsetWidth; const bh = el.offsetHeight;
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const left = Math.floor(Math.random()*(vw - bw - padding*2)) + padding;
    const top = Math.floor(Math.random()*(vh - bh - padding*2)) + padding;
    el.style.position = 'fixed';
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.classList.add('flee');
    setTimeout(()=> el.classList.remove('flee'), 400);
  }

  let noClicks = 0;
  btnNo.addEventListener('mouseenter', ()=> moveNo(btnNo));
  btnNo.addEventListener('touchstart', (e)=>{ e.preventDefault(); moveNo(btnNo); });
  btnNo.addEventListener('click', (e)=>{ e.preventDefault(); noClicks++; moveNo(btnNo); });

  // YES behavior: cinematic transition
  btnYes.addEventListener('click', (e)=>{
    e.preventDefault();
    // remove overlay buttons to prevent double clicks
    btnYes.disabled = true; btnNo.disabled = true;
    startCinematicTransition();
  });

  // Accessibility: allow pressing Escape to close (but No should not allow progression)
  function onKey(e){
    if(e.key === 'Escape'){
      overlay.remove();
      window.removeEventListener('keydown', onKey);
    }
  }
  window.addEventListener('keydown', onKey);
}

function startCinematicTransition(){
  // create overlay
  const t = document.createElement('div');
  t.className = 'space-transition hearts';

  const bg = document.createElement('div');
  bg.className = 'bg-zoom';
  t.appendChild(bg);

  // spawn hearts
  const heartsCount = 14;
  for(let i=0;i<heartsCount;i++){
    const h = document.createElement('div');
    h.className = 'heart';
    h.textContent = '❤';
    // randomize positions
    const left = Math.random()*100;
    const startX = (left/100) * window.innerWidth;
    h.style.left = startX + 'px';
    h.style.bottom = (20 + Math.random()*40) + 'px';
    h.style.animationDelay = (i*80) + 'ms';
    t.appendChild(h);
  }

  document.body.appendChild(t);
  document.body.classList.add('space-transitioning');

  // subtle zoom/fade on envelope and UI
  const env = document.getElementById('envelope');
  const app = document.getElementById('app');
  if(env) env.style.transition = 'transform 900ms ease, opacity 900ms ease';
  if(app) app.style.transition = 'transform 900ms ease, opacity 900ms ease';
  if(env) env.style.transform = 'scale(0.96) translateY(-10px)';
  if(app) app.style.opacity = '0.12';

  // after animation, show placeholder space container
  setTimeout(()=>{
    // cleanup existing UI that should be hidden
    if(env) env.style.display = 'none';
    const overlay = document.querySelector('.love-question-overlay'); if(overlay) overlay.remove();

    const space = document.createElement('div');
    space.id = 'space-container';
    space.className = 'space-container';
    space.innerHTML = `<div style="text-align:center;color:var(--text);">
      <h2>Bienvenido a nuestro universo</h2>
      <p>Preparando la escena 3D…</p>
    </div>`;
    document.body.appendChild(space);

    // remove transition overlay after a short delay
    setTimeout(()=>{
      const tr = document.querySelector('.space-transition'); if(tr) tr.remove();
      document.body.classList.remove('space-transitioning');
    },1200);

    // signal app that we entered space (Three.js phase can listen to this)
    window.dispatchEvent(new CustomEvent('app:enteredSpace', { detail:{ timestamp: Date.now() } }));

  }, 1100);
}

// auto-expose for imports
export default { showQuestion, startCinematicTransition };
