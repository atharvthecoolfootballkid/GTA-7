/* =========================================================
   ULTIMATE WORLD — MASTER GAME LOOP
   Connects all systems into one running game.
   ========================================================= */

(() => {

"use strict";

const UC =
    window.UltimateCity ||
    window.UltimateWorld;

if (!UC) {
    console.error(
        "Ultimate World master loop could not start."
    );
    return;
}

const GameLoop = {

    running:false,

    lastTime:0,

    frame:0,

    fps:0,

    fpsTimer:0,

    fpsFrames:0,

    systems:[],

    init(){

        this.collectSystems();

        this.running=true;

        this.lastTime =
            performance.now();

        requestAnimationFrame(
            this.loop.bind(this)
        );

        console.log(
            "ULTIMATE WORLD MASTER LOOP ONLINE."
        );

    },

    /* =====================================================
       SYSTEM COLLECTION
       ===================================================== */

    collectSystems(){

        const names = [

            "physics",

            "ai",

            "mission-engine",

            "vehicles",

            "audio",

            "ui",

            "save-system",

            "mobile-controls",

            "world-events"

        ];

        this.systems=[];

        for(
            const name
            of names
        ){

            if(
                UC.modules &&
                UC.modules[name] &&
                typeof UC.modules[name].update ===
                "function"
            ){

                this.systems.push(
                    UC.modules[name]
                );

            }

        }

        console.log(
            "Connected systems:",
            this.systems.length
        );

    },

    /* =====================================================
       MAIN LOOP
       ===================================================== */

    loop(
        currentTime
    ){

        if(
            !this.running
        ){

            return;

        }

        let delta =
            (
                currentTime -
                this.lastTime
            ) /
            1000;

        this.lastTime =
            currentTime;

        /*
         * Prevent massive physics
         * jumps if the browser tab
         * was inactive.
         */

        delta =
            Math.min(
                delta,
                0.05
            );

        this.frame++;

        this.updateFPS(
            delta
        );

        /*
         * Run every registered system.
         */

        for(
            const system
            of this.systems
        ){

            try{

                system.update(
                    delta
                );

            }

            catch(error){

                console.error(
                    "System update error:",
                    error
                );

            }

        }

        /*
         * Update renderer/camera if
         * the existing project exposes
         * them.
         */

        this.render();

        requestAnimationFrame(
            this.loop.bind(this)
        );

    },

    /* =====================================================
       RENDER
       ===================================================== */

    render(){

        const renderer =
            UC.renderer ||
            window.renderer;

        const scene =
            UC.scene ||
            window.scene;

        const camera =
            UC.camera ||
            window.camera;

        if(
            renderer &&
            scene &&
            camera &&
            typeof renderer.render ===
            "function"
        ){

            renderer.render(
                scene,
                camera
            );

        }

    },

    /* =====================================================
       FPS
       ===================================================== */

    updateFPS(
        delta
    ){

        this.fpsTimer +=
            delta;

        this.fpsFrames++;

        if(
            this.fpsTimer >= 1
        ){

            this.fps =
                Math.round(
                    this.fpsFrames /
                    this.fpsTimer
                );

            this.fpsFrames=0;

            this.fpsTimer=0;

        }

    },

    /* =====================================================
       START
       ===================================================== */

    start(){

        if(
            this.running
        ){

            return;

        }

        this.running=true;

        this.lastTime =
            performance.now();

        requestAnimationFrame(
            this.loop.bind(this)
        );

    },

    /* =====================================================
       STOP
       ===================================================== */

    stop(){

        this.running=false;

    },

    /* =====================================================
       GET FPS
       ===================================================== */

    getFPS(){

        return this.fps;

    },

    /* =====================================================
       ADD SYSTEM
       ===================================================== */

    addSystem(
        system
    ){

        if(
            !system ||
            typeof system.update !==
            "function"
        ){

            return;

        }

        if(
            !this.systems.includes(
                system
            )
        ){

            this.systems.push(
                system
            );

        }

    }

};

if(
    typeof UC.registerModule ===
    "function"
){

    UC.registerModule(
        "game-loop",
        GameLoop
    );

}

/* =========================================================
   BOOT
   ========================================================= */

function boot(){

    if(
        GameLoop.running
    ){

        return;

    }

    try{

        /*
         * Give the other systems a
         * moment to register themselves.
         */

        GameLoop.collectSystems();

        GameLoop.init();

    }

    catch(error){

        console.error(
            "Master game loop error:",
            error
        );

    }

}

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                boot,
                3500
            );

        },
        {
            once:true
        }
    );

}

else{

    setTimeout(
        boot,
        3500
    );

}

})();
