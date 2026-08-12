/* pwa.js - registro básico del service worker y manejo de instalación */
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btn-install');
  if(btn){ btn.hidden = false; btn.addEventListener('click', async ()=>{ await deferredPrompt.prompt(); const choice = await deferredPrompt.userChoice; deferredPrompt = null; btn.hidden = true; }); }
});

if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg)=>{
      console.log('SW registrado', reg.scope);
    }).catch(err=>console.warn('SW falló', err));
  });
}
