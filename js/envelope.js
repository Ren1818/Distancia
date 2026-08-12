/* envelope.js - controla la interacción con el sello, puzzle y apertura del sobre */
import { createPuzzleModal } from './mathPuzzle.js';
import { letterContent } from './config.js';
import * as Letter from './letter.js';

const envelopeEl = document.getElementById('envelope');
const sealEl = document.getElementById('seal');
const hintEl = document.getElementById('hint');

export function init(){
    if(!envelopeEl || !sealEl) return;

    // click/keyboard
    sealEl.addEventListener('click', onSeal);
    sealEl.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') onSeal(); });
}

function onSeal(e){
    // mostrar puzzle modal
    createPuzzleModal(async ()=>{
        // correcto: iniciar secuencia de ruptura
        await breakSealSequence();
        // mostrar carta parcialmente
        revealLetter();
    });
}

function breakSealSequence(){
    return new Promise((resolve)=>{
        envelopeEl.classList.add('seal-cracked');

        // partículas
        const p = document.createElement('div');
        p.className = 'particles';
        for(let i=0;i<12;i++){
            const s = document.createElement('span');
            s.style.left = (Math.random()*120 - 10) + 'px';
            s.style.top = (Math.random()*20) + 'px';
            s.style.background = 'rgba(255,220,220,' + (0.6 + Math.random()*0.4) + ')';
            s.style.animationDelay = (i*30) + 'ms';
            p.appendChild(s);
        }
        envelopeEl.appendChild(p);

        // vibrate seal a bit (already css) then crack
        setTimeout(()=>{
            // crear efecto grieta: reducir opacidad del sello
            sealEl.style.opacity = '0.12';
            sealEl.style.transform = 'translateX(-50%) scale(0.96)';
        },420);

        // abrir sobre después
        setTimeout(()=>{
            envelopeEl.classList.add('open');
            resolve();
        },800);

        // limpiar partículas
        setTimeout(()=>{ if(p.parentNode) p.parentNode.removeChild(p); },1500);
    });
}

function revealLetter(){
    // crear elemento carta si no existe
    if(envelopeEl.querySelector('.letter')) return;

    const letter = document.createElement('div');
    letter.className = 'letter';
    letter.setAttribute('role','article');
    letter.innerHTML = `
        <div class="fold"></div>
        <div class="content">${letterContent}</div>
    `;

    const body = envelopeEl.querySelector('.envelope__body');
    body.appendChild(letter);

    // permitir arrastrar con Letter module
    Letter.init(letter, envelopeEl, ()=>{
        // cuando extracción completa
        envelopeEl.classList.add('letter-extracted');
        setTimeout(()=>{
            letter.classList.add('opening');
            envelopeEl.classList.add('letter-open');
            // abrir contenido
        },220);
    });
}
