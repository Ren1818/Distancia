/* app.js - inicializador ligero de la UI y estado (Fase 1->2) */
import { relationship } from './config.js';
import * as MathPuzzle from './mathPuzzle.js';
import * as Envelope from './envelope.js';

export const appState = {
  currentScreen: 'letter',
  showRoute: false,
  musicPlaying: false,
  musicExpanded: false
};

window.addEventListener('DOMContentLoaded', ()=>{
  Envelope.init();
});

// contador simple de ejemplo en consola (se implementará visualmente en fases posteriores)
function logElapsed(){
  const start = new Date(relationship.startDate);
  const now = new Date();
  const milliseconds = now - start;
  console.info('Elapsed ms since', relationship.startDate, milliseconds);
}

logElapsed();
