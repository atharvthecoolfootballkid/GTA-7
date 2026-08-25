/* =========================================================
   ULTIMATE CITY
   FINAL APPLICATION CONNECTOR
   Version 1.0
   ========================================================= */

(() => {

    "use strict";

    const UC = window.UltimateCity;

    if (!UC) {

        console.error(
            "UltimateCity engine was not loaded."
        );

        return;

    }

    /* =====================================================
       APPLICATION STATE
       ===================================================== */

    const App = {

        initialized: false,

        running: false,

        paused: false,

        lastTime: 0,

        fps: 0,

        frameCounter: 0,

        fpsTimer: 0,

        modules: [],

        bootTime: Date.now(),

        /* =================================================
           START
           ================================================= */

        start() {

            if (
                this.initialized
            ) {

                return;

            }

            console.log(
                "================================"
            );

            console.log(
                "ULTIMATE CITY"
            );

            console.log(
                "Starting application..."
            );

            console.log(
                "================================"
            );

            this.collectModules();

            this.setupGlobalControls();

            this.setupResize();

            this.initialized =
                true;

            this.running =
                true;

            this.lastTime =
                performance.now();

            requestAnimationFrame(
                time =>
                    this.loop(time)
            );

            console.log(
                "Ultimate City started."
            );

        },

        /* =================================================
           MODULE DISCOVERY
           ================================================= */

        collectModules() {

            const names = [

                "world",

                "player",

                "vehicles",

                "police",

                "weapons",

                "missions",

                "touch",

                "world-life",

                "audio",

                "combat",

                "economy",

                "interactions",

                "shops",

                "map",

                "save",

                "ui"

            ];

            this.modules = [];

            names.forEach(
                name => {

                    const module =
                        UC.getModule
                            ? UC.getModule(
                                name
                            )
                            : null;

                    if (
                        module
                    ) {

                        this.modules.push(
                            module
                        );

                    }

                }
            );

            console.log(

                "Modules loaded:",
                this.modules.length

            );

        },

        /* =================================================
           GLOBAL CONTROLS
           ================================================= */

        setupGlobalControls() {

            window.addEventListener(
                "keydown",
                event => {

                    /* F1 */

                    if (
                        event.code ===
                        "F1"
                    ) {

                        event.preventDefault();

                        this.toggleDeveloperInfo();

                    }

                    /* F2 */

                    if (
                        event.code ===
                        "F2"
                    ) {

                        event.preventDefault();

                        this.takeScreenshot();

                    }

                    /* F3 */

                    if (
                        event.code ===
                        "F3"
                    ) {

                        event.preventDefault();

                        this.togglePerformance();

                    }

                    /* ESC */

                    if (
                        event.code ===
                        "Escape"
                    ) {

                        if (
                            UC.ui
                        ) {

                            UC.ui.togglePause();

                        }

                    }

                }
            );

            document.addEventListener(
                "visibilitychange",
                () => {

                    if (
                        document.hidden
                    ) {

                        this.paused =
                            true;

                    } else {

                        this.paused =
                            false;

                        this.lastTime =
                            performance.now();

                    }

                }
            );

        },

        /* =================================================
           RESIZE
           ================================================= */

        setupResize() {

            window.addEventListener(
                "resize",
                () => {

                    if (
                        UC.camera &&
                        UC.renderer
                    ) {

                        const width =
                            window.innerWidth;

                        const height =
                            window.innerHeight;

                        UC.camera.aspect =
                            width /
                            height;

                        UC.camera.updateProjectionMatrix();

                        UC.renderer.setSize(
                            width,
                            height
                        );

                        if (
                            UC.renderer
                                .setPixelRatio
                        ) {

                            UC.renderer.setPixelRatio(
                                Math.min(
                                    window.devicePixelRatio ||
                                    1,
                                    2
                                )
                            );

                        }

                    }

                }
            );

        },

        /* =================================================
           MAIN LOOP
           ================================================= */

        loop(
            time
        ) {

            if (
                !this.running
            ) {

                return;

            }

            let delta =
                (
                    time -
                    this.lastTime
                ) /
                1000;

            this.lastTime =
                time;

            delta =
                Math.min(
                    delta,
                    0.05
                );

            if (
                !this.paused
            ) {

                this.update(
                    delta
                );

            }

            this.render();

            this.frameCounter++;

            this.fpsTimer +=
                delta;

            if (
                this.fpsTimer >=
                1
            ) {

                this.fps =
                    this.frameCounter;

                this.frameCounter =
                    0;

                this.fpsTimer =
                    0;

            }

            requestAnimationFrame(
                nextTime =>
                    this.loop(
                        nextTime
                    )
            );

        },

        /* =================================================
           UPDATE
           ================================================= */

        update(
            delta
        ) {

            for (
                const module
                of this.modules
            ) {

                if (
                    typeof module.update !==
                    "function"
                ) {

                    continue;

                }

                try {

                    module.update(
                        delta
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "Module update error:",
                        error
                    );

                }

            }

        },

        /* =================================================
           RENDER
           ================================================= */

        render() {

            if (
                UC.renderer &&
                UC.scene &&
                UC.camera
            ) {

                UC.renderer.render(
                    UC.scene,
                    UC.camera
                );

            }

        },

        /* =================================================
           SCREENSHOT
           ================================================= */

        takeScreenshot() {

            if (
                !UC.renderer
            ) {

                return;

            }

            try {

                const image =
                    UC.renderer
                        .domElement
                        .toDataURL(
                            "image/png"
                        );

                const link =
                    document.createElement(
                        "a"
                    );

                link.download =
                    "ultimate-city.png";

                link.href =
                    image;

                link.click();

            } catch (
                error
            ) {

                console.warn(
                    "Screenshot failed.",
                    error
                );

            }

        },

        /* =================================================
           PERFORMANCE
           ================================================= */

        performancePanel:
            null,

        togglePerformance() {

            if (
                this.performancePanel
            ) {

                this.performancePanel.remove();

                this.performancePanel =
                    null;

                return;

            }

            const panel =
                document.createElement(
                    "div"
                );

            panel.style.position =
                "fixed";

            panel.style.left =
                "15px";

            panel.style.top =
                "15px";

            panel.style.zIndex =
                "2000";

            panel.style.padding =
                "10px 13px";

            panel.style.borderRadius =
                "8px";

            panel.style.background =
                "rgba(0,0,0,.75)";

            panel.style.color =
                "#fff";

            panel.style.font =
                "11px monospace";

            panel.id =
                "performance-panel";

            panel.textContent =
                "FPS: --";

            document.body.appendChild(
                panel
            );

            this.performancePanel =
                panel;

            const update =
                () => {

                    if (
                        !this.performancePanel
                    ) {

                        return;

                    }

                    this.performancePanel.textContent =

                        "FPS: " +
                        this.fps +
                        " | Modules: " +
                        this.modules.length;

                    requestAnimationFrame(
                        update
                    );

                };

            update();

        },

        /* =================================================
           DEVELOPER INFO
           ================================================= */

        developerPanel:
            null,

        toggleDeveloperInfo() {

            if (
                this.developerPanel
            ) {

                this.developerPanel.remove();

                this.developerPanel =
                    null;

                return;

            }

            const panel =
                document.createElement(
                    "div"
                );

            panel.style.position =
                "fixed";

            panel.style.left =
                "15px";

            panel.style.top =
                "55px";

            panel.style.zIndex =
                "2000";

            panel.style.padding =
                "14px";

            panel.style.borderRadius =
                "10px";

            panel.style.background =
                "rgba(0,0,0,.82)";

            panel.style.color =
                "#fff";

            panel.style.font =
                "12px monospace";

            panel.style.lineHeight =
                "1.7";

            panel.innerHTML =

                `<b>ULTIMATE CITY</b>
                 <br>
                 Engine: ${UC.version || "1.0"}
                 <br>
                 Modules: ${this.modules.length}
                 <br>
                 FPS: ${this.fps}
                 <br>
                 Runtime:
                 ${Math.floor(
                     (
                         Date.now() -
                         this.bootTime
                     ) / 1000
                 )}s`;

            document.body.appendChild(
                panel
            );

            this.developerPanel =
                panel;

        },

        /* =================================================
           STOP
           ================================================= */

        stop() {

            this.running =
                false;

        },

        /* =================================================
           RESTART
           ================================================= */

        restart() {

            location.reload();

        }

    };

    /* =====================================================
       PUBLIC API
       ===================================================== */

    UC.App =
        App;

    window.UltimateCityApp =
        App;

    /* =====================================================
       START WHEN READY
       ===================================================== */

    function boot() {

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                () => {

                    setTimeout(
                        () => {

                            App.start();

                        },
                        100
                    );

                },
                {
                    once: true
                }
            );

        } else {

            setTimeout(
                () => {

                    App.start();

                },
                100
            );

        }

    }

    boot();

})();
