/* =========================================================
   ULTIMATE CITY — PEDESTRIAN SYSTEM
   Civilian NPCs • Walking AI • Wandering • Avoidance
   ========================================================= */

(() => {

"use strict";

const UC = window.UltimateCity;
const THREE = window.THREE;

if (!UC || !THREE) {
    console.error("Pedestrian system could not start.");
    return;
}

const Pedestrians = {

    initialized:false,

    group:null,

    people:[],

    maxPeople:80,

    citySize:1700,

    init(){

        const scene =
            UC.scene ||
            UC.world;

        if(!scene){
            console.warn(
                "Pedestrians: scene unavailable."
            );
            return;
        }

        this.group =
            new THREE.Group();

        this.group.name =
            "CityPedestrians";

        scene.add(
            this.group
        );

        for(
            let i=0;
            i<this.maxPeople;
            i++
        ){

            this.spawnPerson();

        }

        this.initialized=true;

        console.log(
            "Pedestrian system initialized:",
            this.people.length
        );

    },

    /* =====================================================
       CREATE PERSON
       ===================================================== */

    createPerson(){

        const person =
            new THREE.Group();

        const bodyColors=[
            0x27364a,
            0x4d3530,
            0x303030,
            0x5b4d35,
            0x3d4d3e,
            0x51465b
        ];

        const skinColors=[
            0xb87954,
            0xc98d69,
            0x9d6548,
            0xd39b76
        ];

        const body =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.75,
                    1.25,
                    0.45
                ),

                new THREE.MeshStandardMaterial({
                    color:
                        bodyColors[
                            Math.floor(
                                Math.random()*
                                bodyColors.length
                            )
                        ],
                    roughness:.9
                })

            );

        body.position.y=
            1.45;

        body.castShadow=true;

        person.add(body);

        const head =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .32,
                    10,
                    8
                ),

                new THREE.MeshStandardMaterial({
                    color:
                        skinColors[
                            Math.floor(
                                Math.random()*
                                skinColors.length
                            )
                        ],
                    roughness:.9
                })

            );

        head.position.y=
            2.35;

        head.castShadow=true;

        person.add(head);

        const legMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    0x292b30,
                roughness:.95
            });

        const armMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    body.material.color,
                roughness:.9
            });

        const legGeometry =
            new THREE.BoxGeometry(
                .25,
                .9,
                .28
            );

        const armGeometry =
            new THREE.BoxGeometry(
                .2,
                .85,
                .22
            );

        const leftLeg =
            new THREE.Mesh(
                legGeometry,
                legMaterial
            );

        const rightLeg =
            new THREE.Mesh(
                legGeometry,
                legMaterial
            );

        leftLeg.position.set(
            -.2,
            .65,
            0
        );

        rightLeg.position.set(
            .2,
            .65,
            0
        );

        leftLeg.castShadow=true;
        rightLeg.castShadow=true;

        person.add(
            leftLeg,
            rightLeg
        );

        const leftArm =
            new THREE.Mesh(
                armGeometry,
                armMaterial
            );

        const rightArm =
            new THREE.Mesh(
                armGeometry,
                armMaterial
            );

        leftArm.position.set(
            -.53,
            1.48,
            0
        );

        rightArm.position.set(
            .53,
            1.48,
            0
        );

        leftArm.rotation.z=
            -.12;

        rightArm.rotation.z=
            .12;

        person.add(
            leftArm,
            rightArm
        );

        person.userData = {

            type:
                "pedestrian",

            speed:
                1.2+
                Math.random()*
                1.8,

            direction:
                Math.random()*
                Math.PI*2,

            targetX:0,

            targetZ:0,

            idle:
                false,

            idleTimer:
                0,

            walkTime:
                Math.random()*10,

            leftLeg,

            rightLeg,

            leftArm,

            rightArm

        };

        return person;

    },

    /* =====================================================
       SPAWN
       ===================================================== */

    spawnPerson(){

        const person =
            this.createPerson();

        person.position.set(

            (
                Math.random()*
                this.citySize
            ) -
            this.citySize/2,

            0,

            (
                Math.random()*
                this.citySize
            ) -
            this.citySize/2

        );

        this.chooseTarget(
            person
        );

        this.group.add(
            person
        );

        this.people.push(
            person
        );

    },

    /* =====================================================
       TARGET
       ===================================================== */

    chooseTarget(
        person
    ){

        person.userData.targetX =
            person.position.x +
            (
                Math.random()-.5
            )*
            180;

        person.userData.targetZ =
            person.position.z +
            (
                Math.random()-.5
            )*
            180;

        person.userData.targetX =
            THREE.MathUtils.clamp(
                person.userData.targetX,
                -this.citySize/2,
                this.citySize/2
            );

        person.userData.targetZ =
            THREE.MathUtils.clamp(
                person.userData.targetZ,
                -this.citySize/2,
                this.citySize/2
            );

    },

    /* =====================================================
       WALK
       ===================================================== */

    updatePerson(
        person,
        delta,
        index
    ){

        const data =
            person.userData;

        data.walkTime+=
            delta;

        if(
            data.idle
        ){

            data.idleTimer-=
                delta;

            if(
                data.idleTimer<=0
            ){

                data.idle=false;

                this.chooseTarget(
                    person
                );

            }

            return;

        }

        const target =
            new THREE.Vector3(

                data.targetX,
                person.position.y,
                data.targetZ

            );

        const direction =
            target.clone()
            .sub(
                person.position
            );

        const distance =
            direction.length();

        if(
            distance<4
        ){

            if(
                Math.random()<.35
            ){

                data.idle=true;

                data.idleTimer=
                    1+
                    Math.random()*4;

            }else{

                this.chooseTarget(
                    person
                );

            }

            return;

        }

        direction.normalize();

        /* Avoid nearby pedestrians */

        const avoidance =
            new THREE.Vector3();

        for(
            const other
            of this.people
        ){

            if(
                other===person
            ) continue;

            const difference =
                person.position
                .clone()
                .sub(
                    other.position
                );

            const d =
                difference.length();

            if(
                d>0 &&
                d<3
            ){

                avoidance.add(
                    difference
                    .normalize()
                    .multiplyScalar(
                        (
                            3-d
                        ) /
                        3
                    )
                );

            }

        }

        direction.add(
            avoidance.multiplyScalar(
                .65
            )
        );

        direction.normalize();

        const speed =
            data.speed;

        person.position.x +=
            direction.x*
            speed*
            delta;

        person.position.z +=
            direction.z*
            speed*
            delta;

        person.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );

        /* Walking animation */

        const swing =
            Math.sin(
                data.walkTime*
                7
            )*
            .4;

        data.leftLeg.rotation.x=
            swing;

        data.rightLeg.rotation.x=
            -swing;

        data.leftArm.rotation.x=
            -swing*.7;

        data.rightArm.rotation.x=
            swing*.7;

        /* City boundary */

        const limit =
            this.citySize/2;

        if(
            Math.abs(
                person.position.x
            )>
            limit
            ||
            Math.abs(
                person.position.z
            )>
            limit
        ){

            person.position.x=
                THREE.MathUtils.clamp(
                    person.position.x,
                    -limit,
                    limit
                );

            person.position.z=
                THREE.MathUtils.clamp(
                    person.position.z,
                    -limit,
                    limit
                );

            this.chooseTarget(
                person
            );

        }

    },

    /* =====================================================
       PLAYER AVOIDANCE
       ===================================================== */

    avoidPlayer(){

        if(
            !UC.player
        ) return;

        const player =
            UC.player.position;

        for(
            const person
            of this.people
        ){

            const distance =
                person.position.distanceTo(
                    player
                );

            if(
                distance<
                3
            ){

                const away =
                    person.position
                    .clone()
                    .sub(
                        player
                    )
                    .normalize();

                person.position.x +=
                    away.x*.08;

                person.position.z +=
                    away.z*.08;

            }

        }

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

        for(
            let i=0;
            i<this.people.length;
            i++
        ){

            this.updatePerson(
                this.people[i],
                delta,
                i
            );

        }

        this.avoidPlayer();

    }

};

/* =========================================================
   REGISTER
   ========================================================= */

UC.registerModule(
    "pedestrians",
    Pedestrians
);

/* =========================================================
   BOOT
   ========================================================= */

function boot(){

    if(
        Pedestrians.initialized
    ){

        return;

    }

    try{

        Pedestrians.init();

    }catch(error){

        console.error(
            "Pedestrian initialization error:",
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
                900
            );
        },
        {once:true}
    );

}else{

    setTimeout(
        boot,
        900
    );

}

})();
