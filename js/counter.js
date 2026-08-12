// counter.js - contador que calcula tiempo transcurrido desde relationship.startDate
import { relationship } from './config.js';

function pad(n){ return n.toString().padStart(2,'0'); }

function diffDetailed(start, now){
    // start, now are Date objects
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if(seconds < 0){ seconds += 60; minutes -= 1; }
    if(minutes < 0){ minutes += 60; hours -= 1; }
    if(hours < 0){ hours += 24; days -= 1; }

    if(days < 0){
        // borrow days from previous month relative to 'now'
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day previous month
        days += prevMonth.getDate();
        months -= 1;
    }

    if(months < 0){ months += 12; years -= 1; }

    return { years, months, days, hours, minutes, seconds };
}

export function initCounter(containerId){
    const container = document.getElementById(containerId);
    if(!container) return null;

    function render(){
        const now = new Date();
        const start = new Date(relationship.startDate);
        const d = diffDetailed(start, now);
        const yearsText = `${d.years} años`;
        const monthsText = `${d.months} meses`;
        const daysText = `${d.days} días`;
        const timeText = `${pad(d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`;
        const node = document.getElementById('counter-values');
        if(node){ node.textContent = `${yearsText} · ${monthsText} · ${daysText} · ${timeText}`; }
    }

    render();
    const id = setInterval(render, 1000);
    return ()=> clearInterval(id);
}

// Auto-init if element present
window.addEventListener('DOMContentLoaded', ()=>{
    const el = document.getElementById('counter');
    if(el) {
        // hidden by default; will be revealed by envelope flow
        // but initialize anyway so it starts ticking
        initCounter('counter');
    }
});
