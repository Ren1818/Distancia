/* letter.js - maneja pointer drag para extraer la carta */
let startY = 0;
let currentY = 0;
let dragging = false;
let el = null;
let envelopeEl = null;
let onCompleteCb = null;

export function init(letterEl, envEl, onComplete){
    el = letterEl;
    envelopeEl = envEl;
    onCompleteCb = onComplete;

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
}

function onPointerDown(e){
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    dragging = true;
    startY = e.clientY;
    currentY = 0;
    el.classList.add('dragging');
}

function onPointerMove(e){
    if(!dragging) return;
    const dy = e.clientY - startY;
    // limitar movimiento hacia arriba (negative)
    const clamp = Math.min(Math.max(dy, -999), 120);
    currentY = clamp;
    el.style.transform = `translateY(${currentY}px)`;

    // detectar si sobre threshold (70% of envelope height)
    const envRect = envelopeEl.getBoundingClientRect();
    const threshold = - (envRect.height * 0.7);
    if(currentY <= threshold){
        // completar
        completeExtraction();
    }
}

function onPointerUp(e){
    if(!dragging) return;
    dragging = false;
    el.releasePointerCapture && el.releasePointerCapture(e.pointerId);
    el.classList.remove('dragging');
    // si no completado, volver a posición
    if(!el.classList.contains('extracted')){
        el.style.transition = 'transform 420ms cubic-bezier(.2,.9,.22,1)';
        el.style.transform = '';
        setTimeout(()=>{ el.style.transition = ''; },450);
    }
}

function completeExtraction(){
    el.classList.add('extracted');
    el.style.transition = 'transform 420ms cubic-bezier(.2,.9,.22,1)';
    el.style.transform = 'translateY(-220%)';
    if(typeof onCompleteCb === 'function') onCompleteCb();
}
