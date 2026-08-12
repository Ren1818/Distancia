<?php
// index.php - Fase 1/2/3: PWA scaffold, pantalla inicial con sobre, reproductor y contador (mínimo)
// Mantener markup minimalista; la interacción avanza por fases mediante JS modular.

?><!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <title>Nuestra Historia ❤️</title>

    <link rel="manifest" href="/manifest.json">

    <meta name="theme-color" content="#111018" />

    <link rel="stylesheet" href="/css/reset.css">
    <link rel="stylesheet" href="/css/variables.css">
    <link rel="stylesheet" href="/css/global.css">
    <link rel="stylesheet" href="/css/envelope.css">
    <link rel="stylesheet" href="/css/music.css">
    <link rel="stylesheet" href="/css/responsive.css">

</head>
<body>
    <div id="app" class="screen screen--letter">
        <main class="stage">
            <!-- Initial romantic background and envelope object -->
            <section class="intro">
                <div class="envelope-wrapper" aria-hidden="false">
                    <div class="envelope" id="envelope" role="button" aria-label="Sobre cerrado" tabindex="0">
                        <div class="envelope__flap"></div>
                        <div class="envelope__body"></div>
                        <div class="seal" id="seal" aria-hidden="true" tabindex="0"></div>
                    </div>
                </div>
                <div class="intro__hint" id="hint">Toca el sello para comenzar</div>

                <!-- contador: visible después de abrir la carta -->
                <div id="counter" class="hint-small" aria-live="polite" hidden>
                  Juntos desde el 15 de julio de 2026
                  <div id="counter-values">0 años · 0 meses · 0 días · 00:00:00</div>
                </div>

            </section>
        </main>

        <!-- Small persistent player -->
        <div id="player-small" class="player-small" aria-hidden="true" hidden>
            <img id="player-cover" class="player-cover" src="/assets/images/cover.svg" alt="Portada">
            <div class="player-meta">
                <div id="player-title" class="player-title">NOMBRE DE LA CANCIÓN</div>
                <div id="player-artist" class="player-artist">ARTISTA</div>
            </div>
            <div class="player-controls">
                <button id="btn-play" aria-label="Play/Pause">▶</button>
                <div class="player-time"><span id="player-current">0:00</span> / <span id="player-duration">0:00</span></div>
            </div>
            <div class="player-progress-wrapper">
                <input id="player-progress" type="range" min="0" max="100" value="0" step="0.1" aria-label="Progreso" />
            </div>
        </div>

        <!-- large player modal -->
        <div id="player-modal" class="player-modal" hidden aria-hidden="true">
            <div class="player-modal__backdrop"></div>
            <div class="player-modal__content" role="dialog" aria-modal="true">
                <button id="player-modal-close" class="player-modal__close" aria-label="Cerrar">✕</button>
                <div class="player-modal__left">
                    <img id="player-modal-cover" src="/assets/images/cover.svg" alt="Portada grande">
                </div>
                <div class="player-modal__right">
                    <h3 id="modal-title">NOMBRE DE LA CANCIÓN</h3>
                    <p id="modal-artist">ARTISTA</p>
                    <div class="player-modal__controls">
                        <button id="modal-play">Play</button>
                        <button id="modal-download">Descargar</button>
                    </div>
                    <pre id="modal-lyrics" class="modal-lyrics">AQUÍ VA LA LETRA</pre>
                </div>
            </div>
        </div>

        <div id="pwa-install" class="pwa-install" hidden>
            <button id="btn-install">Instalar</button>
        </div>

    </div>

    <script type="module" src="/js/config.js"></script>
    <script type="module" src="/js/app.js"></script>
    <script type="module" src="/js/pwa.js"></script>
    <script type="module" src="/js/counter.js"></script>
    <script type="module" src="/js/music.js"></script>
</body>
</html>
