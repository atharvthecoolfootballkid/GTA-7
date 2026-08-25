/* =========================================================
   ULTIMATE CITY — WORLD LIFE SYSTEM
   Pedestrians • Traffic Lights • Day/Night • Atmosphere
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const WorldLife = {

    initialized: false,

    pedestrians: [],

    trafficLights: [],

    timeOfDay: 12,

    dayLength: 900,

    weather: "clear",

    init() {

        this.createPedestrians();

        this.createTrafficLights();

        this.createAtmosphere();

        this.initialized = true;

        console.log(
            "World life initialized."
        );

    },

    /* =====================================================
       PEDESTRIANS
       ===================================================== */

    createPedestrians() {

        for (
            let i = 0;
            i < 45;
            i++
        ) {

            this.createPedestrian();

        }

    },

    createPedestrian() {

        const person =
            new THREE.Group();

        person.name =
            "Pedestrian";

        const skinColors = [
            0x8d5a3a,
            0xb87852,
            0x633c29,
            0xd69a72
        ];

        const clothingColors = [
            0x28384a,
            0x6b3434,
            0x344f36,
            0x554733,
            0x252525,
            0x7b6b91
        ];

        const skin =
            skinColors[
                Math.floor(
                    Math.random() *
                    skinColors.length
                )
            ];

        const clothing =
            clothingColors[
                Math.floor(
                    Math.random() *
                    clothingColors.length
                )
            ];

        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: clothing,
                roughness: .75
            });

        const skinMaterial =
            new THREE.MeshStandardMaterial({
                color: skin,
                roughness: .85
            });

        /* BODY */

        const body =
            new THREE.Mesh(

                new THREE.CapsuleGeometry(
                    .28,
                    .7,
                    5,
                    10
                ),

                bodyMaterial

            );

        body.position.y =
            1.05;

        body.castShadow =
            true;

        person.add(
            body
        );

        /* HEAD */

        const head =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .22,
                    12,
                    10
                ),

                skinMaterial

            );

        head.position.y =
            1.75;

        head.castShadow =
            true;

        person.add(
            head
        );

        /* LEGS */

        for (
            const x of [-.13, .13]
        ) {

            const leg =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        .16,
                        .65,
                        .16
                    ),

                    bodyMaterial

                );

            leg.position.set(
                x,
                .48,
                0
            );

            person.add(
                leg
            );

        }

        /* POSITION */

        person.position.set(

            Math.random() *
                1700 -
                850,

            0,

            Math.random() *
                1700 -
                850

        );

        person.userData = {

            speed:
                1 +
                Math.random() *
                1.5,

            direction:
                Math.random() *
                Math.PI *
                2,

            changeTimer:
                2 +
                Math.random() *
                5,

            walkPhase:
                Math.random() *
                Math.PI * 2

        };

        UC.world.add(
            person
        );

        this.pedestrians.push(
            person
        );

    },

    /* =====================================================
       PEDESTRIAN UPDATE
       ===================================================== */

    updatePedestrians(delta) {

        for (
            const person
            of this.pedestrians
        ) {

            const data =
                person.userData;

            data.changeTimer -=
                delta;

            if (
                data.changeTimer <= 0
            ) {

                data.changeTimer =
                    2 +
                    Math.random() *
                    5;

                data.direction +=
                    (
                        Math.random() -
                        .5
                    ) *
                    1.5;

            }

            person.rotation.y =
                data.direction;

            const forward =
                new THREE.Vector3(
                    0,
                    0,
                    1
                );

            forward.applyQuaternion(
                person.quaternion
            );

            person.position.addScaledVector(
                forward,
                data.speed *
                delta
            );

            data.walkPhase +=
                delta *
                8;

            const legs =
                person.children
                    .filter(
                        child =>
                            child.geometry &&
                            child.geometry.type ===
                            "BoxGeometry"
                    );

            if (
                legs.length >= 2
            ) {

                legs[0].rotation.x =
                    Math.sin(
                        data.walkPhase
                    ) *
                    .35;

                legs[1].rotation.x =
                    Math.sin(
                        data.walkPhase +
                        Math.PI
                    ) *
                    .35;

            }

            if (
                Math.abs(
                    person.position.x
                ) > 950
            ) {

                person.position.x *=
                    -.98;

            }

            if (
                Math.abs(
                    person.position.z
                ) > 950
            ) {

                person.position.z *=
                    -.98;

            }

        }

    },

    /* =====================================================
       TRAFFIC LIGHTS
       ===================================================== */

    createTrafficLights() {

        const locations = [

            [-180, -180],
            [180, -180],
            [-180, 180],
            [180, 180],
            [-540, 360],
            [540, -360]

        ];

        locations.forEach(
            ([x, z]) => {

                this.createTrafficLight(
                    x,
                    z
                );

            }
        );

    },

    createTrafficLight(
        x,
        z
    ) {

        const group =
            new THREE.Group();

        const pole =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    .06,
                    .06,
                    4,
                    8
                ),

                new THREE.MeshStandardMaterial({
                    color:
                        0x303336
                })

            );

        pole.position.y =
            2;

        group.add(
            pole
        );

        const housing =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .3,
                    .95,
                    .28
                ),

                new THREE.MeshStandardMaterial({
                    color:
                        0x17191b
                })

            );

        housing.position.y =
            3.55;

        group.add(
            housing
        );

        const red =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .075,
                    10,
                    8
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0xff2020
                })

            );

        red.position.set(
            0,
            3.82,
            -.15
        );

        group.add(
            red
        );

        const yellow =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .075,
                    10,
                    8
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0xffc21c
                })

            );

        yellow.position.set(
            0,
            3.55,
            -.15
        );

        group.add(
            yellow
        );

        const green =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .075,
                    10,
                    8
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0x22dd65
                })

            );

        green.position.set(
            0,
            3.28,
            -.15
        );

        group.add(
            green
        );

        group.position.set(
            x,
            0,
            z
        );

        UC.world.add(
            group
        );

        this.trafficLights.push({

            group,

            red,

            yellow,

            green,

            timer:
                Math.random() *
                10

        });

    },

    /* =====================================================
       TRAFFIC LIGHT UPDATE
       ===================================================== */

    updateTrafficLights(delta) {

        for (
            const light
            of this.trafficLights
        ) {

            light.timer +=
                delta;

            const phase =
                light.timer %
                18;

            light.red.material.color
                .set(
                    0x401010
                );

            light.yellow.material.color
                .set(
                    0x403710
                );

            light.green.material.color
                .set(
                    0x103f20
                );

            if (
                phase < 8
            ) {

                light.red.material.color
                    .set(
                        0xff2020
                    );

            } else if (
                phase < 10
            ) {

                light.yellow.material.color
                    .set(
                        0xffc21c
                    );

            } else {

                light.green.material.color
                    .set(
                        0x22dd65
                    );

            }

        }

    },

    /* =====================================================
       DAY / NIGHT
       ===================================================== */

    updateDayNight(delta) {

        this.timeOfDay +=
            (
                24 /
                this.dayLength
            ) *
            delta;

        if (
            this.timeOfDay >= 24
        ) {

            this.timeOfDay -=
                24;

        }

        const daylight =
            Math.max(
                0,
                Math.sin(
                    (
                        this.timeOfDay -
                        6
                    ) *
                    Math.PI /
                    12
                )
            );

        if (
            UC.scene
        ) {

            const sky =
                new THREE.Color();

            sky.setHSL(
                .59,
                .35,
                .12 +
                daylight *
                .38
            );

            UC.scene.background =
                sky;

        }

        if (
            UC.sun
        ) {

            UC.sun.intensity =
                .15 +
                daylight *
                1.15;

        }

        if (
            UC.ambientLight
        ) {

            UC.ambientLight.intensity =
                .18 +
                daylight *
                .45;

        }

    },

    /* =====================================================
       ATMOSPHERE
       ===================================================== */

    createAtmosphere() {

        if (
            UC.scene
        ) {

            UC.scene.fog =
                new THREE.Fog(
                    0x87919a,
                    100,
                    1600
                );

        }

    },

    /* =====================================================
       WEATHER
       ===================================================== */

    setWeather(
        weather
    ) {

        const allowed = [

            "clear",
            "cloudy",
            "rain",
            "fog"

        ];

        if (
            !allowed.includes(
                weather
            )
        ) {

            return;

        }

        this.weather =
            weather;

        if (
            UC.scene
        ) {

            if (
                weather ===
                "fog"
            ) {

                UC.scene.fog =
                    new THREE.Fog(
                        0x8c9295,
                        30,
                        450
                    );

            } else {

                UC.scene.fog =
                    new THREE.Fog(
                        0x87919a,
                        100,
                        1600
                    );

            }

        }

    },

    /* =====================================================
       MAIN UPDATE
       ===================================================== */

    update(delta) {

        if (
            !this.initialized
        ) {

            return;

        }

        this.updatePedestrians(
            delta
        );

        this.updateTrafficLights(
            delta
        );

        this.updateDayNight(
            delta
        );

    }

};

UC.registerModule(
    "worldLife",
    WorldLife
);

WorldLife.init();
