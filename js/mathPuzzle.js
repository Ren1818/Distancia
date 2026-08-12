// mathPuzzle.js - genera una expresión aritmética (solo + y -) cuyo resultado sea 15
export function generateExpression(){
    const target = 15;
    const maxAttempts = 200;

    for(let attempt=0; attempt<maxAttempts; attempt++){
        const terms = [];
        const ops = [];
        const n = Math.floor(Math.random()*3) + 3; // 3..5 términos

        // generar primer número
        terms.push(Math.floor(Math.random()*20) + 1); // 1..20

        // generar n-2 términos provisionales
        for(let i=1;i<n-1;i++){
            ops.push(Math.random() > 0.5 ? '+' : '-');
            terms.push(Math.floor(Math.random()*30));
        }

        // calcular resultado parcial
        let r = terms[0];
        for(let i=1;i<terms.length;i++){
            const op = ops[i-1];
            const num = terms[i];
            r = op === '+' ? r + num : r - num;
        }

        // elegir la última operación y número para llegar a target
n        const lastOp = Math.random() > 0.5 ? '+' : '-';
        let lastNum = lastOp === '+' ? target - r : r - target;
        lastNum = Math.abs(Math.round(lastNum));

        // evitar 0 or too large
        if(lastNum === 0 || lastNum > 99) continue;

        ops.push(lastOp);
        terms.push(lastNum);

        // construir expresión string
        let expr = '' + terms[0];
        for(let i=1;i<terms.length;i++){
            expr += ` ${ops[i-1]} ${terms[i]}`;
        }

        // verify
        let evalRes = eval(expr);
        if(evalRes === target){
            return { expr, result: target };
        }
    }
    // fallback hardcoded
    return { expr: '10 + 5', result: 15 };
}


export function createPuzzleModal(onCorrect){
    // crea modal simplificado en DOM
    const modal = document.createElement('div');
    modal.className = 'puzzle-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.display = 'grid';
    modal.style.placeItems = 'center';
    modal.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.6))';
    modal.style.zIndex = 9999;

    const box = document.createElement('div');
    box.style.background = 'linear-gradient(180deg,#0f0f12, #141218)';
    box.style.border = '1px solid rgba(255,255,255,0.04)';
    box.style.padding = '20px';
    box.style.borderRadius = '12px';
    box.style.boxShadow = '0 12px 40px rgba(0,0,0,0.7)';
    box.style.color = '#fff6ee';
    box.style.maxWidth = '420px';
    box.style.width = '92%';

    const title = document.createElement('div');
    title.textContent = 'Resuelve el acertijo';
    title.style.fontSize = '18px';
    title.style.marginBottom = '12px';

    const { expr } = generateExpression();
    const exprEl = document.createElement('div');
    exprEl.textContent = expr;
    exprEl.style.fontSize = '20px';
    exprEl.style.marginBottom = '12px';

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'Respuesta';
    input.style.width = '100%';
    input.style.padding = '10px 12px';
    input.style.borderRadius = '8px';
    input.style.border = '1px solid rgba(255,255,255,0.06)';
    input.style.background = 'rgba(255,255,255,0.02)';
    input.style.color = '#fff6ee';
    input.style.marginBottom = '12px';

    const msg = document.createElement('div');
    msg.className = 'puzzle-msg';
    msg.style.minHeight = '20px';
    msg.style.color = 'var(--muted)';
    msg.style.marginBottom = '8px';

    const btn = document.createElement('button');
    btn.textContent = 'Comprobar';
    btn.style.padding = '10px 14px';
    btn.style.borderRadius = '8px';
    btn.style.border = 'none';
    btn.style.background = 'linear-gradient(90deg,var(--accent),var(--accent-2))';
    btn.style.color = '#111018';
    btn.style.fontWeight = '700';

    btn.addEventListener('click', ()=>{
        const val = Number(input.value);
        if(isNaN(val)) return;
        if(val === 15){
            msg.textContent = '';
            document.body.removeChild(modal);
            if(typeof onCorrect === 'function') onCorrect();
        } else {
            // animación y mensaje
            msg.textContent = 'Parece que esa todavía no es la llave ❤️';
            // pequeño shake
            box.animate([{ transform: 'translateX(0)' },{ transform: 'translateX(-8px)' },{ transform: 'translateX(6px)' },{ transform: 'translateX(0)' }],{ duration:420, easing:'ease-in-out' });
        }
    });

    box.appendChild(title);
    box.appendChild(exprEl);
    box.appendChild(input);
    box.appendChild(msg);
    box.appendChild(btn);

    modal.appendChild(box);
    document.body.appendChild(modal);
    input.focus();

    return modal;
}
