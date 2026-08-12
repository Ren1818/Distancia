// music.js - reproductor simple y persistente
import { music } from './config.js';

let audio = null;
let isPlaying = false;

function formatTime(sec){
    if(isNaN(sec) || sec === Infinity) return '0:00';
    const s = Math.floor(sec % 60);
    const m = Math.floor(sec / 60);
    return `${m}:${s.toString().padStart(2,'0')}`;
}

function ensureAudio(){
    if(audio) return audio;
    audio = new Audio(music.audio);
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.addEventListener('ended', ()=>{ isPlaying=false; updatePlayButton(); });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', ()=>{
        const durEl = document.getElementById('player-duration');
        if(durEl) durEl.textContent = formatTime(audio.duration);
    });
    return audio;
}

function updatePlayButton(){
    const btn = document.getElementById('btn-play');
    if(!btn) return;
    btn.textContent = isPlaying ? '⏸' : '▶';
    const modalBtn = document.getElementById('modal-play');
    if(modalBtn) modalBtn.textContent = isPlaying ? 'Pausa' : 'Reproducir';
}

function updateProgress(){
    const progress = document.getElementById('player-progress');
    const current = document.getElementById('player-current');
    if(!audio || !progress) return;
    const pct = (audio.currentTime / Math.max(1, audio.duration)) * 100;
    progress.value = pct;
    if(current) current.textContent = formatTime(audio.currentTime);
}

function togglePlay(){
    const a = ensureAudio();
    if(isPlaying){
        a.pause();
        isPlaying = false;
        updatePlayButton();
        return;
    }
    const p = a.play();
    if(p && p.then){
        p.then(()=>{ isPlaying=true; updatePlayButton(); }).catch((err)=>{
            // autoplay blocked; show small play control (already present)
            console.warn('Autoplay blocked', err);
            isPlaying = false; updatePlayButton();
        });
    } else {
        isPlaying = true; updatePlayButton();
    }
}

function seekFromRange(){
    const progress = document.getElementById('player-progress');
    if(!audio || !progress) return;
    const pct = Number(progress.value);
    audio.currentTime = (pct/100) * audio.duration;
}

function openModal(){
    const modal = document.getElementById('player-modal');
    if(!modal) return;
    modal.hidden = false; modal.setAttribute('aria-hidden','false');
}
function closeModal(){
    const modal = document.getElementById('player-modal');
    if(!modal) return;
    modal.hidden = true; modal.setAttribute('aria-hidden','true');
}

function download(){
    const a = document.createElement('a');
    a.href = music.audio;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

export function initMusic(){
    // populate UI
    const title = document.getElementById('player-title');
    const artist = document.getElementById('player-artist');
    const cover = document.getElementById('player-cover');
    const modalCover = document.getElementById('player-modal-cover');
    const modalTitle = document.getElementById('modal-title');
    const modalArtist = document.getElementById('modal-artist');
    const modalLyrics = document.getElementById('modal-lyrics');

    if(title) title.textContent = music.title || '';
    if(artist) artist.textContent = music.artist || '';
    if(cover) cover.src = music.cover || '/assets/images/cover.svg';
    if(modalCover) modalCover.src = music.cover || '/assets/images/cover.svg';
    if(modalTitle) modalTitle.textContent = music.title || '';
    if(modalArtist) modalArtist.textContent = music.artist || '';
    if(modalLyrics) modalLyrics.textContent = music.lyrics || '';

    const btn = document.getElementById('btn-play');
    if(btn){ btn.addEventListener('click', ()=>{ togglePlay(); }); }

    const modalPlay = document.getElementById('modal-play');
    if(modalPlay){ modalPlay.addEventListener('click', ()=>{ togglePlay(); }); }

    const modalDownload = document.getElementById('modal-download');
    if(modalDownload){ modalDownload.addEventListener('click', download); }

    const progress = document.getElementById('player-progress');
    if(progress){ progress.addEventListener('input', ()=>{ seekFromRange(); }); }

    const small = document.getElementById('player-small');
    if(small){ small.hidden = false; small.setAttribute('aria-hidden','false'); }

    const modalOpen = document.getElementById('player-small');
    if(modalOpen){ modalOpen.addEventListener('dblclick', openModal); }

    const modalClose = document.getElementById('player-modal-close');
    if(modalClose){ modalClose.addEventListener('click', closeModal); }

    // try autoplay if allowed
    try{ const a = ensureAudio(); a.play().then(()=>{ isPlaying = true; updatePlayButton(); }).catch(()=>{ isPlaying = false; updatePlayButton(); }); }catch(e){ console.warn(e); }
}

// auto init when DOM ready
window.addEventListener('DOMContentLoaded', ()=>{
    initMusic();
});

export default { initMusic, togglePlay };
