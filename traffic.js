/* =========================================================
   ULTIMATE CITY — TRAFFIC SYSTEM
   Civilian Traffic • Traffic Lights • Lane AI
   ========================================================= */

(() => {

"use strict";

const UC = window.UltimateCity;
const THREE = window.THREE;

if (!UC || !THREE) {
    console.error("Traffic system could not start.");
    return;
}

const Traffic = {

    initialized:false,
    vehicles:[],
    lights:[],
    timer:0,

    maxVehicles:55,
    roadSpacing:100,
    citySize:1800,

    init(){

        const scene =
            UC.scene ||
            UC.world;

        if(!scene){
            console.warn("Traffic: scene unavailable.");
            return;
        }

        this.group =
            new THREE.Group();

        this.group.name =
            "CivilianTraffic";

        scene.add(this.group);

        this.createTrafficLights();
        this.createVehicles();

        this.initialized=true;

        console.log(
            "Traffic system initialized:",
            this.vehicles.length,
            "vehicles"
        );

    },

    /* =====================================================
       VEHICLES
       ===================================================== */

    createVehicles(){

        const colors=[
            0x202124,
            0xeeeeee,
            0x263b4a,
            0x7a2424,
            0x6b6b63,
            0x252525,
            0xaaa18f,
            0x174b3a
        ];

        for(
            let i=0;
            i<this.maxVehicles;
            i++
        ){

            const vertical =
                Math.random() > .5;

            const road =
                (
                    Math.floor(
                        Math.random()*18
                    )-9
                )*
                this.roadSpacing;

            const vehicle =
                this.createVehicle(
                    colors[
                        Math.floor(
                            Math.random()*
                            colors.length
                        )
                    ]
                );

            vehicle.userData.vertical =
                vertical;

            vehicle.userData.speed =
                8+
                Math.random()*10;

            vehicle.userData.direction =
                Math.random()>0.5
                    ? 1
                    : -1;

            vehicle.userData.road =
                road;

            if(vertical){

                vehicle.position.set(
                    road,
                    0,
                    (
                        Math.random()*
                        this.citySize
                    )-
                    this.citySize/2
                );

            }else{

                vehicle.position.set(
                    (
                        Math.random()*
                        this.citySize
                    )-
                    this.citySize/2,
                    0,
                    road
                );

            }

            this.group.add(
                vehicle
            );

            this.vehicles.push(
                vehicle
            );

        }

    },

    createVehicle(color){

        const car =
            new THREE.Group();

        const body =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    3.2,
                    1.1,
                    6
                ),

                new THREE.MeshStandardMaterial({
                    color,
                    roughness:.65,
                    metalness:.15
                })

            );

        body.position.y=1;

        body.castShadow=true;

        car.add(body);

        const cabin =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.55,
                    1.05,
                    2.6
                ),

                new THREE.MeshStandardMaterial({
                    color:0x26343b,
                    roughness:.25,
                    metalness:.1
                })

            );

        cabin.position.y=1.85;

        cabin.position.z=-.15;

        cabin.castShadow=true;

        car.add(cabin);

        const wheelMaterial =
            new THREE.MeshStandardMaterial({
                color:0x151515,
                roughness:1
            });

        const wheelGeometry =
            new THREE.CylinderGeometry(
                .55,
                .55,
                .35,
                12
            );

        const wheelPositions=[
            [-1.65,.65,-1.9],
            [1.65,.65,-1.9],
            [-1.65,.65,1.9],
            [1.65,.65,1.9]
        ];

        wheelPositions.forEach(
            p=>{

                const wheel =
                    new THREE.Mesh(
                        wheelGeometry,
                        wheelMaterial
                    );

                wheel.rotation.z=
                    Math.PI/2;

                wheel.position.set(
                    p[0],
                    p[1],
                    p[2]
                );

                car.add(wheel);

            }
        );

        const lightMaterial =
            new THREE.MeshBasicMaterial({
                color:0xffe9bd
            });

        for(
            const x of [-.9,.9]
        ){

            const light =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        .45,
                        .25,
                        .12
                    ),

                    lightMaterial

                );

            light.position.set(
                x,
                1.15,
                -3.03
            );

            car.add(light);

        }

        car.userData.type="civilian";

        return car;

    },

    /* =====================================================
       TRAFFIC LIGHTS
       ===================================================== */

    createTrafficLights(){

        for(
            let x=-900;
            x<=900;
            x+=100
        ){

            for(
                let z=-900;
                z<=900;
                z+=100
            ){

                if(
                    Math.random()>.32
                ) continue;

                this.createTrafficLight(
                    x+11,
                    z+11
                );

            }

        }

    },

    createTrafficLight(
        x,
        z
    ){

        const group =
            new THREE.Group();

        const pole =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    .12,
                    .16,
                    5,
                    8
                ),

                new THREE.MeshStandardMaterial({
                    color:0x292c2e
                })

            );

        pole.position.y=2.5;

        group.add(pole);

        const housing =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .65,
                    1.8,
                    .4
                ),

                new THREE.MeshStandardMaterial({
                    color:0x16191a
                })

            );

        housing.position.y=5;

        group.add(housing);

        const colors=[
            0xff3030,
            0xffc52f,
            0x38d45a
        ];

        const lamps=[];

        colors.forEach(
            (color,i)=>{

                const lamp =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(
                            .18,
                            8,
                            8
                        ),

                        new THREE.MeshBasicMaterial({
                            color
                        })

                    );

                lamp.position.set(
                    0,
                    4.45+
                    i*.55,
                    -.22
                );

                housing.add(
                    lamp
                );

                lamps.push(lamp);

            }
        );

        group.position.set(
            x,
            0,
            z
        );

        this.group.add(
            group
        );

        this.lights.push({
            group,
            lamps,
            timer:
                Math.random()*10
        });

    },

    /* =====================================================
       UPDATE TRAFFIC LIGHTS
       ===================================================== */

    updateLights(delta){

        for(
            const light
            of this.lights
        ){

            light.timer+=delta;

            const phase =
                Math.floor(
                    light.timer/6
                )%3;

            light.lamps.forEach(
                (lamp,i)=>{

                    lamp.material.opacity =
                        i===phase
                            ? 1
                            : .18;

                    lamp.material.transparent=
                        true;

                }
            );

        }

    },

    /* =====================================================
       VEHICLE MOVEMENT
       ===================================================== */

    updateVehicles(delta){

        for(
            const car
            of this.vehicles
        ){

            const speed =
                car.userData.speed;

            const direction =
                car.userData.direction;

            if(
                car.userData.vertical
            ){

                car.position.z +=
                    speed*
                    direction*
                    delta;

                car.rotation.y =
                    direction>0
                        ? 0
                        : Math.PI;

                if(
                    car.position.z>
                    this.citySize/2
                ){

                    car.position.z=
                        -this.citySize/2;

                }

                if(
                    car.position.z<
                    -this.citySize/2
                ){

                    car.position.z=
                        this.citySize/2;

                }

            }else{

                car.position.x +=
                    speed*
                    direction*
                    delta;

                car.rotation.y =
                    direction>0
                        ? Math.PI/2
                        : -Math.PI/2;

                if(
                    car.position.x>
                    this.citySize/2
                ){

                    car.position.x=
                        -this.citySize/2;

                }

                if(
                    car.position.x<
                    -this.citySize/2
                ){

                    car.position.x=
                        this.citySize/2;

                }

            }

            this.avoidTraffic(
                car
            );

        }

    },

    /* =====================================================
       BASIC COLLISION AVOIDANCE
       ===================================================== */

    avoidTraffic(
        car
    ){

        const direction =
            car.userData.vertical
                ? new THREE.Vector3(
                    0,
                    0,
                    car.userData.direction
                )
                : new THREE.Vector3(
                    car.userData.direction,
                    0,
                    0
                );

        for(
            const other
            of this.vehicles
        ){

            if(
                other===car
            ) continue;

            if(
                other.userData.vertical !==
                car.userData.vertical
            ) continue;

            const distance =
                car.position.distanceTo(
                    other.position
                );

            if(
                distance<7
            ){

                const relative =
                    other.position
                    .clone()
                    .sub(
                        car.position
                    );

                if(
                    relative.dot(
                        direction
                    )>0
                ){

                    car.userData.speed =
                        Math.max(
                            2,
                            car.userData.speed*
                            .93
                        );

                    return;

                }

            }

        }

        car.userData.speed =
            Math.min(
                18,
                car.userData.speed+
                .05
            );

    },

    /* =====================================================
       SPAWN EXTRA TRAFFIC
       ===================================================== */

    spawnVehicle(){

        if(
            this.vehicles.length>=
            this.maxVehicles
        ){

            return;

        }

        const car =
            this.createVehicle(
                0x555555+
                Math.floor(
                    Math.random()*
                    0x777777
                )
            );

        const vertical =
            Math.random()>.5;

        car.userData.vertical=
            vertical;

        car.userData.direction=
            Math.random()>.5
                ? 1
                : -1;

        car.userData.speed=
            8+
            Math.random()*8;

        car.userData.road=
            (
                Math.floor(
                    Math.random()*18
                )-9
            )*
            this.roadSpacing;

        if(vertical){

            car.position.set(
                car.userData.road,
                0,
                -900
            );

        }else{

            car.position.set(
                -900,
                0,
                car.userData.road
            );

        }

        this.group.add(
            car
        );

        this.vehicles.push(
            car
        );

    },

    /* =====================================================
       MAIN UPDATE
       ===================================================== */

    update(delta){

        if(
            !this.initialized
        ){

            return;

        }

        this.updateLights(
            delta
        );

        this.updateVehicles(
            delta
        );

        this.timer+=delta;

        if(
            this.timer>8
        ){

            this.timer=0;

            this.spawnVehicle();

        }

    }

};

/* =========================================================
   REGISTER
   ========================================================= */

UC.registerModule(
    "traffic",
    Traffic
);

/* =========================================================
   BOOT
   ========================================================= */

function boot(){

    if(
        Traffic.initialized
    ){

        return;

    }

    try{

        Traffic.init();

    }catch(error){

        console.error(
            "Traffic initialization error:",
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
                700
            );
        },
        {once:true}
    );

}else{

    setTimeout(
        boot,
        700
    );

}

})();
