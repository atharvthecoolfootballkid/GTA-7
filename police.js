/* =========================================================
   ULTIMATE CITY — POLICE SYSTEM
   Wanted Level • Police AI • Pursuit • Search
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const PoliceSystem = {

    initialized: false,

    wantedLevel: 0,

    wantedPoints: 0,

    maxWantedLevel: 5,

    officers: [],

    cooldown: 0,

    sirenTime: 0,

    init() {

        this.createPoliceUnits();

        this.createPoliceHUD();

        this.initialized = true;

        console.log(
            "Police system initialized."
        );

    },

    /* =====================================================
       POLICE CAR
       ===================================================== */

    createPoliceCar(
        x,
        z,
        rotation = 0
    ) {

        const car =
            new THREE.Group();

        car.name =
            "PoliceVehicle";

        const body =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.25,
                    .68,
                    4.5
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x151719,

                    metalness:
                        .45,

                    roughness:
                        .4

                })

            );

        body.position.y =
            .72;

        body.castShadow =
            true;

        car.add(
            body
        );

        const roof =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    1.7,
                    .55,
                    2.25
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xe4e6e7,

                    roughness:
                        .55

                })

            );

        roof.position.y =
            1.18;

        car.add(
            roof
        );

        const wheels = [];

        for (
            const px of [-1.02, 1.02]
        ) {

            for (
                const pz of [-1.45, 1.45]
            ) {

                const wheel =
                    new THREE.Mesh(

                        new THREE.CylinderGeometry(
                            .42,
                            .42,
                            .28,
                            16
                        ),

                        new THREE.MeshStandardMaterial({
                            color:
                                0x0b0c0d,
                            roughness:
                                .9
                        })

                    );

                wheel.rotation.z =
                    Math.PI / 2;

                wheel.position.set(
                    px,
                    .42,
                    pz
                );

                car.add(
                    wheel
                );

                wheels.push(
                    wheel
                );

            }

        }

        /* LIGHT BAR */

        const lightBar =
            new THREE.Group();

        const red =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .35,
                    .18,
                    .65
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0xff1717
                })

            );

        red.position.x =
            -.35;

        const blue =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .35,
                    .18,
                    .65
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0x175cff
                })

            );

        blue.position.x =
            .35;

        lightBar.add(
            red
        );

        lightBar.add(
            blue
        );

        lightBar.position.y =
            1.58;

        car.add(
            lightBar
        );

        const sirenRed =
            new THREE.PointLight(
                0xff2020,
                4,
                22
            );

        const sirenBlue =
            new THREE.PointLight(
                0x205cff,
                4,
                22
            );

        sirenRed.position.set(
            -.35,
            1.7,
            0
        );

        sirenBlue.position.set(
            .35,
            1.7,
            0
        );

        car.add(
            sirenRed
        );

        car.add(
            sirenBlue
        );

        car.position.set(
            x,
            0,
            z
        );

        car.rotation.y =
            rotation;

        UC.world.add(
            car
        );

        const officer = {

            vehicle: car,

            wheels,

            speed:
                0,

            maxSpeed:
                22,

            target:
                null,

            state:
                "patrol",

            sirenRed,

            sirenBlue,

            arrestDistance:
                3

        };

        this.officers.push(
            officer
        );

        return officer;

    },

    /* =====================================================
       CREATE POLICE UNITS
       ===================================================== */

    createPoliceUnits() {

        const positions = [

            [-80, -120],
            [120, -260],
            [-300, 180],
            [360, 270],
            [-500, -400],
            [500, 400]

        ];

        positions.forEach(
            ([x, z], i) => {

                this.createPoliceCar(
                    x,
                    z,
                    i
                );

            }
        );

    },

    /* =====================================================
       WANTED SYSTEM
       ===================================================== */

    addWanted(
        amount = 1
    ) {

        this.wantedPoints +=
            amount;

        this.updateWantedLevel();

        this.refreshPoliceTargets();

    },

    removeWanted(
        amount = 1
    ) {

        this.wantedPoints =
            Math.max(
                0,
                this.wantedPoints -
                amount
            );

        this.updateWantedLevel();

    },

    updateWantedLevel() {

        const old =
            this.wantedLevel;

        if (
            this.wantedPoints <= 0
        ) {

            this.wantedLevel =
                0;

        } else if (
            this.wantedPoints < 3
        ) {

            this.wantedLevel =
                1;

        } else if (
            this.wantedPoints < 7
        ) {

            this.wantedLevel =
                2;

        } else if (
            this.wantedPoints < 12
        ) {

            this.wantedLevel =
                3;

        } else if (
            this.wantedPoints < 18
        ) {

            this.wantedLevel =
                4;

        } else {

            this.wantedLevel =
                5;

        }

        if (
            old !==
            this.wantedLevel
        ) {

            this.updatePoliceBehavior();

        }

        this.updateHUD();

    },

    /* =====================================================
       POLICE TARGETS
       ===================================================== */

    refreshPoliceTargets() {

        if (
            !UC.player
        ) {

            return;

        }

        if (
            this.wantedLevel === 0
        ) {

            this.officers.forEach(
                officer => {

                    officer.target =
                        null;

                    officer.state =
                        "patrol";

                }
            );

            return;

        }

        this.officers.forEach(
            officer => {

                officer.target =
                    UC.player;

                officer.state =
                    "pursuit";

            }
        );

    },

    /* =====================================================
       BEHAVIOR
       ===================================================== */

    updatePoliceBehavior() {

        const active =
            Math.min(
                this.officers.length,
                Math.max(
                    1,
                    this.wantedLevel + 1
                )
            );

        this.officers.forEach(
            (
                officer,
                index
            ) => {

                if (
                    index < active
                ) {

                    officer.state =
                        this.wantedLevel > 0
                            ? "pursuit"
                            : "patrol";

                } else {

                    officer.state =
                        "patrol";

                }

            }
        );

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(delta) {

        if (
            !this.initialized
        ) {

            return;

        }

        this.sirenTime +=
            delta;

        this.updateSirens();

        this.updateCooldown(
            delta
        );

        this.updateOfficers(
            delta
        );

        this.checkArrest();

    },

    /* =====================================================
       SIRENS
       ===================================================== */

    updateSirens() {

        const flash =
            Math.sin(
                this.sirenTime *
                14
            ) > 0;

        this.officers.forEach(
            officer => {

                officer.sirenRed.intensity =
                    flash
                        ? 6
                        : .4;

                officer.sirenBlue.intensity =
                    flash
                        ? .4
                        : 6;

            }
        );

    },

    /* =====================================================
       COOLDOWN
       ===================================================== */

    updateCooldown(delta) {

        if (
            this.wantedLevel <= 0
        ) {

            return;

        }

        this.cooldown +=
            delta;

        if (
            this.cooldown >
            18
        ) {

            this.cooldown =
                0;

            this.wantedPoints =
                Math.max(
                    0,
                    this.wantedPoints -
                    1
                );

            this.updateWantedLevel();

        }

    },

    /* =====================================================
       OFFICER AI
       ===================================================== */

    updateOfficers(delta) {

        if (
            !UC.player
        ) {

            return;

        }

        for (
            const officer
            of this.officers
        ) {

            if (
                officer.state ===
                "pursuit"
            ) {

                this.pursue(
                    officer,
                    delta
                );

            } else {

                this.patrol(
                    officer,
                    delta
                );

            }

        }

    },

    pursue(
        officer,
        delta
    ) {

        const vehicle =
            officer.vehicle;

        const target =
            UC.player.position;

        const direction =
            new THREE.Vector3()
                .subVectors(
                    target,
                    vehicle.position
                );

        direction.y =
            0;

        const distance =
            direction.length();

        if (
            distance <
            0.1
        ) {

            return;

        }

        direction.normalize();

        const desired =
            Math.atan2(
                direction.x,
                direction.z
            );

        let difference =
            desired -
            vehicle.rotation.y;

        difference =
            Math.atan2(
                Math.sin(difference),
                Math.cos(difference)
            );

        vehicle.rotation.y +=
            difference *
            delta *
            2.5;

        officer.speed =
            THREE.MathUtils.lerp(
                officer.speed,
                officer.maxSpeed,
                delta *
                .8
            );

        const forward =
            new THREE.Vector3(
                0,
                0,
                1
            );

        forward.applyQuaternion(
            vehicle.quaternion
        );

        vehicle.position.addScaledVector(
            forward,
            officer.speed *
            delta
        );

        vehicle.position.y =
            0;

        officer.wheels.forEach(
            wheel => {

                wheel.rotation.x +=
                    officer.speed *
                    delta *
                    2;

            }
        );

    },

    patrol(
        officer,
        delta
    ) {

        officer.speed =
            THREE.MathUtils.lerp(
                officer.speed,
                5,
                delta
            );

        const forward =
            new THREE.Vector3(
                0,
                0,
                1
            );

        forward.applyQuaternion(
            officer.vehicle.quaternion
        );

        officer.vehicle.position
            .addScaledVector(
                forward,
                officer.speed *
                delta
            );

        if (
            Math.abs(
                officer.vehicle.position.x
            ) > 950 ||
            Math.abs(
                officer.vehicle.position.z
            ) > 950
        ) {

            officer.vehicle.rotation.y +=
                Math.PI;

        }

    },

    /* =====================================================
       ARREST CHECK
       ===================================================== */

    checkArrest() {

        if (
            !UC.player ||
            this.wantedLevel <= 0
        ) {

            return;

        }

        for (
            const officer
            of this.officers
        ) {

            const distance =
                officer.vehicle.position
                    .distanceTo(
                        UC.player.position
                    );

            if (
                distance <
                officer.arrestDistance
            ) {

                this.arrestPlayer();

                return;

            }

        }

    },

    /* =====================================================
       ARREST
       ===================================================== */

    arrestPlayer() {

        this.wantedPoints =
            0;

        this.wantedLevel =
            0;

        this.cooldown =
            0;

        if (
            UC.player
        ) {

            UC.player.respawn();

        }

        this.refreshPoliceTargets();

        this.updateHUD();

        console.log(
            "PLAYER ARRESTED"
        );

    },

    /* =====================================================
       HUD
       ===================================================== */

    createPoliceHUD() {

        let container =
            document.getElementById(
                "wanted-display"
            );

        if (
            container
        ) {

            return;

        }

        container =
            document.createElement(
                "div"
            );

        container.id =
            "wanted-display";

        container.style.position =
            "fixed";

        container.style.right =
            "24px";

        container.style.top =
            "24px";

        container.style.zIndex =
            "50";

        container.style.fontFamily =
            "Arial, sans-serif";

        container.style.fontWeight =
            "900";

        container.style.fontSize =
            "24px";

        container.style.letterSpacing =
            "5px";

        container.style.color =
            "#fff";

        document.body.appendChild(
            container
        );

        this.updateHUD();

    },

    updateHUD() {

        const display =
            document.getElementById(
                "wanted-display"
            );

        if (
            !display
        ) {

            return;

        }

        let stars = "";

        for (
            let i = 0;
            i < this.maxWantedLevel;
            i++
        ) {

            stars +=
                i <
                this.wantedLevel
                    ? "★"
                    : "☆";

        }

        display.textContent =
            stars;

    },

    /* =====================================================
       PUBLIC ACTIONS
       ===================================================== */

    crime(
        severity = 1
    ) {

        this.addWanted(
            severity
        );

    },

    clearWanted() {

        this.wantedPoints =
            0;

        this.wantedLevel =
            0;

        this.refreshPoliceTargets();

        this.updateHUD();

    }

};

UC.registerModule(
    "police",
    PoliceSystem
);

PoliceSystem.init();
