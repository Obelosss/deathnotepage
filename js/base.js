document.addEventListener('DOMContentLoaded', function () {

    // ---------- Menú móvil + navegación inteligente a la página actual ----------
    var botonMenu = document.querySelector('.nav-toggle');
    var listaMenu = document.querySelector('.site-nav ul');

    // Nombre del archivo actual (ej. "index.html", "" para la raíz -> se asume "index.html")
    var urlPath = window.location.pathname.split('/').pop();
    var paginaActual = urlPath === '' ? 'index.html' : urlPath;

    if (botonMenu && listaMenu) {
        botonMenu.addEventListener('click', function () {
            var abierto = listaMenu.classList.toggle('abierto');
            botonMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        });

        // Aplicamos el scroll suave SOLO a los enlaces del menú principal (nav)
        var enlacesMenu = listaMenu.querySelectorAll('a');

        enlacesMenu.forEach(function (enlace) {
            enlace.addEventListener('click', function (evento) {
                var destino = enlace.getAttribute('href');
                if (!destino) return;

                var archivoDestino = destino.split('#')[0].split('?')[0].split('/').pop();
                if (archivoDestino === '') archivoDestino = 'index.html';

                // Si toca el enlace de la página en la que ya está, sube al tope sin recargar
                if (archivoDestino === paginaActual) {
                    evento.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    if (listaMenu.classList.contains('abierto')) {
                        listaMenu.classList.remove('abierto');
                        botonMenu.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    }

    // ---------- Pantalla de entrada (Aparece SIEMPRE al recargar) ----------
    var pantallaInicial = document.getElementById('pantalla-inicial');

    if (pantallaInicial) {
        // Bloquea el scroll por defecto al cargar la página
        document.body.style.overflow = 'hidden';
        
        pantallaInicial.addEventListener('click', function () {
            pantallaInicial.classList.add('oculto');
            document.body.style.overflow = '';
        });
    }

    // ---------- Comportamiento especial del Logotipo ----------
    var logo = document.querySelector('.logo');
    
    if (logo) {
        logo.addEventListener('click', function (evento) {
            // Si el usuario toca el logo y YA ESTÁ en Inicio, reactivamos la Intro
            if (paginaActual === 'index.html') {
                evento.preventDefault(); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
                
                if (pantallaInicial) {
                    pantallaInicial.classList.remove('oculto'); 
                    document.body.style.overflow = 'hidden'; 
                    
                    // Si hay un video de fondo en la intro, lo reiniciamos
                    var videoIntro = pantallaInicial.querySelector('video');
                    if (videoIntro) {
                        videoIntro.currentTime = 0;
                        videoIntro.play();
                    }
                }
            }
            // Si está en expediente o contacto, el logo funcionará normal y cargará index.html
        });
    }

    // ---------- Lluvia de partículas (canvas) ----------
    function iniciarLluviaParticulas(idCanvas, cantidad) {
        var canvas = document.getElementById(idCanvas);
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        var particulas = [];

        function ajustarTamano() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        function crearParticula() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radio: Math.random() * 1.5 + 0.5,
                velocidadY: Math.random() * 0.6 + 0.2,
                velocidadX: Math.random() * 0.3 - 0.15,
                opacidad: Math.random() * 0.6 + 0.3
            };
        }

        function iniciarParticulas() {
            particulas = [];
            for (var i = 0; i < cantidad; i++) {
                particulas.push(crearParticula());
            }
        }

        function dibujar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particulas.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + p.opacidad + ')';
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 6;
                ctx.fill();

                p.y += p.velocidadY;
                p.x += p.velocidadX;

                if (p.y > canvas.height) {
                    p.y = -5;
                    p.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(dibujar);
        }

        ajustarTamano();
        iniciarParticulas();
        dibujar();

        window.addEventListener('resize', ajustarTamano);
    }

    iniciarLluviaParticulas('particulas-inicio', 70);
    iniciarLluviaParticulas('particulas-sitio', 40);

    // ---------- Estela de partículas del cursor ----------
    (function () {
        var canvas = document.getElementById('estela-cursor');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        var particulas = [];
        var ultimaEmisionX = null;
        var ultimaEmisionY = null;
        var distanciaMinimaEmision = 14; 

        var PARTICULAS_POR_EMISION = 1;
        var DURACION_VIDA_MIN = 800;   
        var DURACION_VIDA_MAX = 1500;  

        function ajustarTamano() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function crearParticula(x, y) {
            var tono = 200 + Math.floor(Math.random() * 55); 
            return {
                x: x,
                y: y,
                tamano: Math.random() * 2 + 1,        
                vx: (Math.random() - 0.5) * 0.6,      
                vy: Math.random() * 0.3 + 0.15,       
                opacidadInicial: Math.random() * 0.6 + 0.4, 
                opacidad: 0,
                tono: tono,
                nacimiento: performance.now(),
                duracionVida: DURACION_VIDA_MIN + Math.random() * (DURACION_VIDA_MAX - DURACION_VIDA_MIN)
            };
        }

        function emitirParticulas(x, y) {
            for (var i = 0; i < PARTICULAS_POR_EMISION; i++) {
                particulas.push(crearParticula(x, y));
            }
        }

        function manejarMovimiento(x, y) {
            if (ultimaEmisionX === null) {
                ultimaEmisionX = x;
                ultimaEmisionY = y;
                emitirParticulas(x, y);
                return;
            }

            var dx = x - ultimaEmisionX;
            var dy = y - ultimaEmisionY;
            var distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia >= distanciaMinimaEmision) {
                emitirParticulas(x, y);
                ultimaEmisionX = x;
                ultimaEmisionY = y;
            }
        }

        function dibujar(ahora) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = particulas.length - 1; i >= 0; i--) {
                var p = particulas[i];
                var edad = ahora - p.nacimiento;
                var progreso = edad / p.duracionVida;

                if (progreso >= 1) {
                    particulas.splice(i, 1);
                    continue;
                }

                p.x += p.vx;
                p.y += p.vy;
                p.opacidad = p.opacidadInicial * (1 - progreso);

                ctx.fillStyle = 'rgba(' + p.tono + ',' + p.tono + ',' + p.tono + ',' + p.opacidad + ')';
                ctx.fillRect(p.x, p.y, p.tamano, p.tamano);
            }

            requestAnimationFrame(dibujar);
        }

        ajustarTamano();
        requestAnimationFrame(dibujar);

        window.addEventListener('resize', ajustarTamano);

        window.addEventListener('mousemove', function (evento) {
            manejarMovimiento(evento.clientX, evento.clientY);
        });

        window.addEventListener('touchmove', function (evento) {
            var toque = evento.touches[0];
            if (toque) manejarMovimiento(toque.clientX, toque.clientY);
        }, { passive: true });
    })();

    // ---------- Parallax Tilt sutil para la Manzana 3D ----------
    var visorManzana = document.getElementById('visor-manzana');

    if (visorManzana) {
        var tiltXActual = 0;
        var tiltYActual = 0;
        var tiltXObjetivo = 0;
        var tiltYObjetivo = 0;

        window.addEventListener('mousemove', function (evento) {
            var centroX = window.innerWidth / 2;
            var centroY = window.innerHeight / 2;
            var normX = (evento.clientX - centroX) / centroX;
            var normY = (evento.clientY - centroY) / centroY;

            tiltXObjetivo = -normY * 10;
            tiltYObjetivo = normX * 10;
        });

        window.addEventListener('mouseleave', function () {
            tiltXObjetivo = 0;
            tiltYObjetivo = 0;
        });

        function animarTilt() {
            tiltXActual += (tiltXObjetivo - tiltXActual) * 0.05;
            tiltYActual += (tiltYObjetivo - tiltYActual) * 0.05;

            visorManzana.style.transform = 'rotateX(' + tiltXActual.toFixed(2) + 'deg) rotateY(' + tiltYActual.toFixed(2) + 'deg)';
            requestAnimationFrame(animarTilt);
        }

        animarTilt();
    }

    // ---------- Reproductor de música de fondo ----------
    var audioMusica = document.getElementById('audio-musica');
    var btnTogglePanel = document.getElementById('btn-toggle-reproductor');
    var iconoTogglePanel = document.getElementById('icono-toggle-reproductor');
    var panel = document.getElementById('reproductor-panel');
    var btnPlayPause = document.getElementById('btn-play-pause');
    var iconoPlayPause = document.getElementById('icono-play-pause');
    var controlVolumen = document.getElementById('control-volumen');
    var btnMute = document.getElementById('btn-mute');
    var iconoMute = document.getElementById('icono-mute');
    var volumenPrevioAlMute = 0.7;

    if (audioMusica) {
        audioMusica.volume = 0.7;

        function iniciarMusicaPrimerClic() {
            audioMusica.play().catch(function () {});
            document.removeEventListener('click', iniciarMusicaPrimerClic);
        }
        document.addEventListener('click', iniciarMusicaPrimerClic);

        if (btnTogglePanel && panel) {
            btnTogglePanel.addEventListener('click', function (evento) {
                evento.stopPropagation();
                var abierto = panel.classList.toggle('abierto');
                btnTogglePanel.setAttribute('aria-expanded', abierto ? 'true' : 'false');
            });

            document.addEventListener('click', function (evento) {
                if (!panel.contains(evento.target) && evento.target !== btnTogglePanel) {
                    panel.classList.remove('abierto');
                    btnTogglePanel.setAttribute('aria-expanded', 'false');
                }
            });
        }

        if (btnPlayPause && iconoPlayPause) {
            btnPlayPause.addEventListener('click', function () {
                if (audioMusica.paused) {
                    audioMusica.play().catch(function () {});
                    btnPlayPause.setAttribute('aria-pressed', 'false');
                    btnPlayPause.setAttribute('aria-label', 'Pausar música');
                    iconoPlayPause.classList.remove('fa-play');
                    iconoPlayPause.classList.add('fa-pause');
                } else {
                    audioMusica.pause();
                    btnPlayPause.setAttribute('aria-pressed', 'true');
                    btnPlayPause.setAttribute('aria-label', 'Reanudar música');
                    iconoPlayPause.classList.remove('fa-pause');
                    iconoPlayPause.classList.add('fa-play');
                }
            });
        }

        if (controlVolumen) {
            controlVolumen.addEventListener('input', function () {
                var nuevoVolumen = controlVolumen.value / 100;
                audioMusica.volume = nuevoVolumen;
                audioMusica.muted = nuevoVolumen === 0;
                actualizarIconoVolumen(nuevoVolumen, audioMusica.muted);
            });
        }

        if (btnMute) {
            btnMute.addEventListener('click', function () {
                if (!audioMusica.muted) {
                    volumenPrevioAlMute = audioMusica.volume || 0.5;
                    audioMusica.muted = true;
                    controlVolumen.value = 0;
                    btnMute.setAttribute('aria-pressed', 'true');
                } else {
                    audioMusica.muted = false;
                    audioMusica.volume = volumenPrevioAlMute;
                    controlVolumen.value = volumenPrevioAlMute * 100;
                    btnMute.setAttribute('aria-pressed', 'false');
                }
                actualizarIconoVolumen(audioMusica.volume, audioMusica.muted);
            });
        }

        function actualizarIconoVolumen(volumen, muteado) {
            [iconoMute, iconoTogglePanel].forEach(function (icono) {
                if (!icono) return;
                icono.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-xmark');
                if (muteado || volumen === 0) {
                    icono.classList.add('fa-volume-xmark');
                } else if (volumen < 0.5) {
                    icono.classList.add('fa-volume-low');
                } else {
                    icono.classList.add('fa-volume-high');
                }
            });
        }
    }

});