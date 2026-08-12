<?php
// index.php - Fase 1: PWA scaffold y pantalla inicial con sobre
// Este archivo sirve como punto de entrada. Mantener el markup minimalista
// para ir agregando fases posteriores.

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
    <link rel="stylesheet" href="/css/responsive.css">

</head>
<body>
    <div id="app" class="screen screen--letter">
        <main class="stage">
            <!-- Initial romantic background and envelope object -->
            <section class="intro">
                <div class="envelope-wrapper" aria-hidden="false">
                    <div class="envelope" id="envelope" role="button" aria-label="Sobre cerrado">
                        <div class="envelope__flap"></div>
                        <div class="envelope__body"></div>
                        <div class="seal" id="seal" aria-hidden="true"></div>
                    </div>
                </div>
                <div class="intro__hint" id="hint">Toca el sello para comenzar</div>
            </section>
        </main>

        <!-- Minimal UI placeholders that later phases will populate -->
        <div id="pwa-install" class="pwa-install" hidden>
            <button id="btn-install">Instalar</button>
        </div>

    </div>

    <script type="module" src="/js/config.js"></script>
    <script type="module" src="/js/app.js"></script>
    <script type="module" src="/js/pwa.js"></script>
</body>
</html>
