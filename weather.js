/* =========================================================
   ULTIMATE CITY — WEATHER + DAY/NIGHT SYSTEM
   ========================================================= */

(() => {

"use strict";

const UC = window.UltimateCity;
const THREE = window.THREE;

if (!UC || !THREE) {
    console.error("Weather system could not start.");
    return;
}

const Weather = {

    initialized:false,

    time:12,

    dayLength:240,

    weather:"clear",

    weatherTimer:0,

    rain:null,

    rainCount:900,

    ambient:null,

    sun:null,

    moon:null,

    init(){

        const scene =
            UC.scene ||
            UC.world;

        if(!scene){
            console.warn(
                "Weather: scene unavailable."
            );
            return;
        }

        this.scene=scene;

        this.createLighting();

        this.createRain();

        this.initialized=true;

        console.log(
            "Weather system initialized."
        );

    },

    /* =====================================================
       LIGHTING
       ===================================================== */

    createLighting(){

        this.ambient =
            new THREE.HemisphereLight(
                0x9bb4d1,
                0x293028,
                1.1
            );

        this.scene.add(
            this.ambient
        );

        this.sun =
            new THREE.DirectionalLight(
                0xfff0c4,
                2.0
            );

        this.sun.position.set(
            300,
            500,
            200
        );

        this.sun.castShadow=true;

        this.sun.shadow.mapSize.width=
            2048;

        this.sun.shadow.mapSize.height=
            2048;

        this.sun.shadow.camera.left=
            -700;

        this.sun.shadow.camera.right=
            700;

        this.sun.shadow.camera.top=
            700;

        this.sun.shadow.camera.bottom=
            -700;

        this.scene.add(
            this.sun
        );

        this.moon =
            new THREE.DirectionalLight(
                0x7d91c7,
                .25
            );

        this.moon.position.set(
            -300,
            400,
            -200
        );

        this.scene.add(
            this.moon
        );

    },

    /* =====================================================
       RAIN
       ===================================================== */

    createRain(){

        const positions =
            new Float32Array(
                this.rainCount*3
            );

        for(
            let i=0;
            i<this.rainCount;
            i++
        ){

            positions[i*3]=
                (
                    Math.random()-.5
                )*1000;

            positions[i*3+1]=
                Math.random()*500;

            positions[i*3+2]=
                (
                    Math.random()-.5
                )*1000;

        }

        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        const material =
            new THREE.PointsMaterial({

                color:
                    0xb9d8ff,

                size:
                    .18,

                transparent:
                    true,

                opacity:
                    .55,

                depthWrite:
                    false

            });

        this.rain =
            new THREE.Points(
                geometry,
                material
            );

        this.rain.visible=false;

        this.scene.add(
            this.rain
        );

    },

    /* =====================================================
       WEATHER
       ===================================================== */

    setWeather(
        type
    ){

        const allowed=[
            "clear",
            "cloudy",
            "rain",
            "storm",
            "fog"
        ];

        if(
            !allowed.includes(
                type
            )
        ){

            return;

        }

        this.weather=
            type;

        if(
            this.rain
        ){

            this.rain.visible=
                type==="rain" ||
                type==="storm";

        }

        this.applyWeather();

    },

    randomWeather(){

        const choices=[
            "clear",
            "clear",
            "clear",
            "cloudy",
            "rain",
            "storm",
            "fog"
        ];

        this.setWeather(
            choices[
                Math.floor(
                    Math.random()*
                    choices.length
                )
            ]
        );

    },

    applyWeather(){

        if(
            !this.sun ||
            !this.ambient
        ){

            return;

        }

        if(
            this.weather==="clear"
        ){

            this.sun.intensity=
                2.0;

            this.ambient.intensity=
                1.1;

        }

        if(
            this.weather==="cloudy"
        ){

            this.sun.intensity=
                .9;

            this.ambient.intensity=
                .85;

        }

        if(
            this.weather==="rain"
        ){

            this.sun.intensity=
                .55;

            this.ambient.intensity=
                .65;

        }

        if(
            this.weather==="storm"
        ){

            this.sun.intensity=
                .25;

            this.ambient.intensity=
                .45;

        }

        if(
            this.weather==="fog"
        ){

            this.sun.intensity=
                .7;

            this.ambient.intensity=
                .6;

        }

    },

    /* =====================================================
       DAY / NIGHT
       ===================================================== */

    updateTime(
        delta
    ){

        this.time +=
            (
                24 /
                this.dayLength
            )*
            delta;

        if(
            this.time>=24
        ){

            this.time-=24;

        }

        const angle =
            (
                this.time /
                24
            )*
            Math.PI*2;

        const sunX =
            Math.cos(
                angle
            )*
            500;

        const sunY =
            Math.sin(
                angle
            )*
            500;

        const sunZ =
            Math.sin(
                angle*.7
            )*
            300;

        this.sun.position.set(
            sunX,
            sunY,
            sunZ
        );

        const daylight =
            THREE.MathUtils.clamp(
                Math.sin(
                    angle
                ),
                0,
                1
            );

        this.sun.intensity =
            daylight*
            (
                this.weather==="storm"
                    ? .35
                    : this.weather==="rain"
                        ? .7
                        : 2
            );

        this.ambient.intensity =
            .25+
            daylight*
            (
                this.weather==="clear"
                    ? .9
                    : .65
            );

        this.moon.intensity =
            .15+
            (
                1-daylight
            )*
            .45;

        this.updateSky(
            daylight
        );

    },

    /* =====================================================
       SKY
       ===================================================== */

    updateSky(
        daylight
    ){

        if(
            !this.scene
        ){

            return;

        }

        const world =
            this.scene.background;

        if(
            world &&
            world.isColor
        ){

            if(
                daylight>.6
            ){

                world.set(
                    0x75a5cf
                );

            }else if(
                daylight>.15
            ){

                world.set(
                    0x403e52
                );

            }else{

                world.set(
                    0x101827
                );

            }

        }

    },

    /* =====================================================
       RAIN MOVEMENT
       ===================================================== */

    updateRain(
        delta
    ){

        if(
            !this.rain ||
            !this.rain.visible
        ){

            return;

        }

        const position =
            this.rain.geometry
            .attributes
            .position;

        for(
            let i=0;
            i<this.rainCount;
            i++
        ){

            const y =
                position.getY(i);

            position.setY(
                i,
                y-
                (
                    this.weather==="storm"
                        ? 28
                        : 20
                )*
                delta
            );

            const x =
                position.getX(i);

            const z =
                position.getZ(i);

            position.setX(
                i,
                x+
                delta*
                (
                    this.weather==="storm"
                        ? 3
                        : 1
                )
            );

            if(
                position.getY(i)<0
            ){

                position.setY(
                    i,
                    400+
                    Math.random()*100
                );

                position.setX(
                    i,
                    (
                        Math.random()-.5
                    )*1000
                );

                position.setZ(
                    i,
                    (
                        Math.random()-.5
                    )*1000
                );

            }

        }

        position.needsUpdate=
            true;

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(
        delta
    ){

        if(
            !this.initialized
        ){

            return;

        }

        this.updateTime(
            delta
        );

        this.updateRain(
            delta
        );

        this.weatherTimer+=
            delta;

        if(
            this.weatherTimer>75
        ){

            this.weatherTimer=0;

            if(
                Math.random()<.35
            ){

                this.randomWeather();

            }

        }

    }

};

UC.registerModule(
    "weather",
    Weather
);

function boot(){

    if(
        Weather.initialized
    ){

        return;

    }

    try{

        Weather.init();

    }catch(error){

        console.error(
            "Weather initialization error:",
            error
        );

    }

}

if(
    document.readyState===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        ()=>{
            setTimeout(
                boot,
                1100
            );
        },
        {once:true}
    );

}else{

    setTimeout(
        boot,
        1100
    );

}

})();
