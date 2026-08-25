/* =========================================================
   ULTIMATE CITY — VEHICLE SYSTEM
   Cars • Traffic • Driving • Enter/Exit • iPad Ready
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const VehicleSystem = {

    initialized: false,

    vehicles: [],

    traffic: [],

    activeVehicle: null,

    nextVehicleId: 1,

    input: {

        accelerate: false,
        brake: false,
        left: false,
        right: false

    },

    init() {

        this.createTraffic();

        this.createParkedCars();

        this.setupControls();

        this.initialized = true;

        console.log(
            "Vehicle system initialized."
        );

    },

    /* =====================================================
       VEHICLE CREATION
       ===================================================== */

    createVehicle(
        options = {}
    ) {

        const vehicle =
            new THREE.Group();

        vehicle.name =
            "Vehicle_" +
            this.nextVehicleId++;

        const color =
            options.color ||
            this.randomCarColor();

        const bodyMaterial =
            new THREE.MeshStandardMaterial({

                color,

                metalness: .45,

                roughness: .38

            });

        const glassMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x15252d,

                metalness: .15,

                roughness: .15,

                transparent: true,

                opacity: .9

            });

        const tireMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x101112,

                roughness: .85

            });

        /* BODY */

        const body =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.2,
                    .65,
                    4.4
                ),

                bodyMaterial

            );

        body.position.y =
            .72;

        body.castShadow =
            true;

        body.receiveShadow =
            true;

        vehicle.add(
            body
        );

        /* ROOF */

        const roof =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    1.72,
                    .55,
                    2.25
                ),

                bodyMaterial

            );

        roof.position.set(
            0,
            1.2,
            -.1
        );

        roof.castShadow =
            true;

        vehicle.add(
            roof
        );

        /* WINDOWS */

        const frontWindow =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    1.45,
                    .8
                ),

                glassMaterial

            );

        frontWindow.position.set(
            0,
            1.23,
            -1.28
        );

        frontWindow.rotation.x =
            -.2;

        vehicle.add(
            frontWindow
        );

        const rearWindow =
            frontWindow.clone();

        rearWindow.position.z =
            1.1;

        rearWindow.rotation.x =
            .2;

        vehicle.add(
            rearWindow
        );

        /* SIDE WINDOWS */

        const sideWindow =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    1.65,
                    .68
                ),

                glassMaterial

            );

        sideWindow.rotation.y =
            Math.PI / 2;

        sideWindow.position.set(
            .87,
            1.23,
            -.1
        );

        vehicle.add(
            sideWindow
        );

        const otherSide =
            sideWindow.clone();

        otherSide.rotation.y =
            -Math.PI / 2;

        otherSide.position.x =
            -.87;

        vehicle.add(
            otherSide
        );

        /* WHEELS */

        const wheelPositions = [

            [-1.05, .42, -1.45],
            [1.05, .42, -1.45],
            [-1.05, .42, 1.45],
            [1.05, .42, 1.45]

        ];

        const wheels = [];

        wheelPositions.forEach(
            position => {

                const wheel =
                    new THREE.Mesh(

                        new THREE.CylinderGeometry(
                            .42,
                            .42,
                            .28,
                            18
                        ),

                        tireMaterial

                    );

                wheel.rotation.z =
                    Math.PI / 2;

                wheel.position.set(
                    ...position
                );

                wheel.castShadow =
                    true;

                vehicle.add(
                    wheel
                );

                wheels.push(
                    wheel
                );

            }
        );

        /* LIGHTS */

        const headlightMaterial =
            new THREE.MeshBasicMaterial({
                color:
                    0xffffdd
            });

        const redLightMaterial =
            new THREE.MeshBasicMaterial({
                color:
                    0xff1818
            });

        for (
            const x of [-.72, .72]
        ) {

            const frontLight =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        .34,
                        .15,
                        .08
                    ),

                    headlightMaterial

                );

            frontLight.position.set(
                x,
                .78,
                -2.22
            );

            vehicle.add(
                frontLight
            );

            const rearLight =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        .34,
                        .15,
                        .08
                    ),

                    redLightMaterial

                );

            rearLight.position.set(
                x,
                .78,
                2.22
            );

            vehicle.add(
                rearLight
            );

        }

        /* DATA */

        vehicle.userData = {

            id:
                vehicle.name,

            speed: 0,

            maxSpeed:
                options.maxSpeed ||
                28,

            acceleration:
                options.acceleration ||
                18,

            braking:
                options.braking ||
                30,

            turnSpeed:
                options.turnSpeed ||
                1.8,

            health:
                100,

            occupied:
                false,

            ai:
                options.ai ||
                false,

            wheels,

            type:
                options.type ||
                "car"

        };

        vehicle.position.set(
            options.x || 0,
            options.y || 0,
            options.z || 0
        );

        vehicle.rotation.y =
            options.rotation || 0;

        UC.world.add(
            vehicle
        );

        this.vehicles.push(
            vehicle
        );

        return vehicle;

    },

    /* =====================================================
       RANDOM CAR COLORS
       ===================================================== */

    randomCarColor() {

        const colors = [

            0xb52328,
            0x202b32,
            0xf2f0df,
            0x394f65,
            0x777b80,
            0x121518,
            0xc28a32,
            0x35614a,
            0x8b2f4a

        ];

        return colors[
            Math.floor(
                Math.random() *
                colors.length
            )
        ];

    },

    /* =====================================================
       TRAFFIC
       ===================================================== */

    createTraffic() {

        for (
            let i = 0;
            i < 35;
            i++
        ) {

            const vertical =
                Math.random() > .5;

            const lane =
                Math.floor(
                    Math.random() *
                    10
                ) *
                180 -
                900;

            const offset =
                Math.random() *
                1800 -
                900;

            const car =
                this.createVehicle({

                    x:
                        vertical
                            ? lane
                            : offset,

                    z:
                        vertical
                            ? offset
                            : lane,

                    rotation:
                        vertical
                            ? Math.PI / 2
                            : 0,

                    ai:
                        true,

                    maxSpeed:
                        10 +
                        Math.random() *
                        8

                });

            this.traffic.push(
                car
            );

        }

    },

    /* =====================================================
       PARKED CARS
       ===================================================== */

    createParkedCars() {

        for (
            let i = 0;
            i < 25;
            i++
        ) {

            const vertical =
                Math.random() >
                .5;

            const road =
                Math.floor(
                    Math.random() *
                    10
                ) *
                180 -
                900;

            const position =
                Math.random() *
                1700 -
                850;

            this.createVehicle({

                x:
                    vertical
                        ? road + 21
                        : position,

                z:
                    vertical
                        ? position
                        : road + 21,

                rotation:
                    vertical
                        ? Math.PI / 2
                        : 0,

                ai:
                    false

            });

        }

    },

    /* =====================================================
       CONTROLS
       ===================================================== */

    setupControls() {

        window.addEventListener(
            "keydown",
            event => {

                switch (
                    event.code
                ) {

                    case "KeyW":
                    case "ArrowUp":

                        this.input.accelerate =
                            true;

                        break;

                    case "KeyS":
                    case "ArrowDown":

                        this.input.brake =
                            true;

                        break;

                    case "KeyA":
                    case "ArrowLeft":

                        this.input.left =
                            true;

                        break;

                    case "KeyD":
                    case "ArrowRight":

                        this.input.right =
                            true;

                        break;

                    case "KeyE":

                        if (
                            !event.repeat
                        ) {

                            this.toggleVehicle();

                        }

                        break;

                }

            }
        );

        window.addEventListener(
            "keyup",
            event => {

                switch (
                    event.code
                ) {

                    case "KeyW":
                    case "ArrowUp":

                        this.input.accelerate =
                            false;

                        break;

                    case "KeyS":
                    case "ArrowDown":

                        this.input.brake =
                            false;

                        break;

                    case "KeyA":
                    case "ArrowLeft":

                        this.input.left =
                            false;

                        break;

                    case "KeyD":
                    case "ArrowRight":

                        this.input.right =
                            false;

                        break;

                }

            }
        );

    },

    /* =====================================================
       FIND NEAREST VEHICLE
       ===================================================== */

    findNearestVehicle() {

        if (
            !UC.player
        ) {

            return null;

        }

        let nearest =
            null;

        let distance =
            Infinity;

        for (
            const vehicle
            of this.vehicles
        ) {

            if (
                vehicle.userData.occupied
            ) {

                continue;

            }

            const d =
                vehicle.position.distanceTo(
                    UC.player.position
                );

            if (
                d < distance
            ) {

                distance =
                    d;

                nearest =
                    vehicle;

            }

        }

        return nearest;

    },

    /* =====================================================
       ENTER / EXIT
       ===================================================== */

    toggleVehicle() {

        if (
            this.activeVehicle
        ) {

            this.exitVehicle();

            return;

        }

        this.enterNearestVehicle();

    },

    enterNearestVehicle() {

        const vehicle =
            this.findNearestVehicle();

        if (
            !vehicle
        ) {

            return;

        }

        if (
            vehicle.position.distanceTo(
                UC.player.position
            ) > 6
        ) {

            return;

        }

        this.activeVehicle =
            vehicle;

        vehicle.userData.occupied =
            true;

        UC.player.group.visible =
            false;

        UC.player.position.copy(
            vehicle.position
        );

        UC.player.position.y =
            0;

        UC.player.cameraMode =
            "third";

        UC.activeVehicle =
            vehicle;

    },

    exitVehicle() {

        if (
            !this.activeVehicle
        ) {

            return;

        }

        const vehicle =
            this.activeVehicle;

        vehicle.userData.occupied =
            false;

        const direction =
            new THREE.Vector3(
                3,
                0,
                0
            );

        direction.applyQuaternion(
            vehicle.quaternion
        );

        UC.player.position.copy(
            vehicle.position
        );

        UC.player.position.add(
            direction
        );

        UC.player.group.position.copy(
            UC.player.position
        );

        UC.player.group.visible =
            true;

        this.activeVehicle =
            null;

        UC.activeVehicle =
            null;

    },

    /* =====================================================
       VEHICLE UPDATE
       ===================================================== */

    update(delta) {

        if (
            !this.initialized
        ) {

            return;

        }

        this.updateTraffic(
            delta
        );

        if (
            this.activeVehicle
        ) {

            this.updatePlayerVehicle(
                delta
            );

        }

    },

    /* =====================================================
       PLAYER VEHICLE
       ===================================================== */

    updatePlayerVehicle(delta) {

        const vehicle =
            this.activeVehicle;

        const data =
            vehicle.userData;

        if (
            this.input.accelerate
        ) {

            data.speed +=
                data.acceleration *
                delta;

        } else if (
            this.input.brake
        ) {

            data.speed -=
                data.braking *
                delta;

        } else {

            data.speed *=
                Math.pow(
                    .05,
                    delta
                );

        }

        data.speed =
            THREE.MathUtils.clamp(
                data.speed,
                -10,
                data.maxSpeed
            );

        if (
            Math.abs(
                data.speed
            ) > .1
        ) {

            const steering =
                (
                    this.input.right
                        ? 1
                        : 0
                ) -
                (
                    this.input.left
                        ? 1
                        : 0
                );

            vehicle.rotation.y -=
                steering *
                data.turnSpeed *
                delta *
                (
                    Math.abs(
                        data.speed
                    ) /
                    data.maxSpeed
                );

        }

        const direction =
            new THREE.Vector3(
                0,
                0,
                1
            );

        direction.applyQuaternion(
            vehicle.quaternion
        );

        vehicle.position.addScaledVector(
            direction,
            data.speed *
            delta
        );

        vehicle.position.y =
            0;

        vehicle.userData.wheels
            .forEach(
                wheel => {

                    wheel.rotation.x +=
                        data.speed *
                        delta *
                        2;

                }
            );

        UC.player.position.copy(
            vehicle.position
        );

        UC.player.position.y =
            0;

    },

    /* =====================================================
       AI TRAFFIC
       ===================================================== */

    updateTraffic(delta) {

        for (
            const vehicle
            of this.traffic
        ) {

            if (
                vehicle ===
                this.activeVehicle
            ) {

                continue;

            }

            const data =
                vehicle.userData;

            data.speed =
                THREE.MathUtils.lerp(
                    data.speed,
                    data.maxSpeed,
                    delta *
                    .6
                );

            const direction =
                new THREE.Vector3(
                    0,
                    0,
                    1
                );

            direction.applyQuaternion(
                vehicle.quaternion
            );

            vehicle.position.addScaledVector(
                direction,
                data.speed *
                delta
            );

            if (
                Math.abs(
                    vehicle.position.x
                ) > 1000 ||
                Math.abs(
                    vehicle.position.z
                ) > 1000
            ) {

                vehicle.position.x =
                    THREE.MathUtils.clamp(
                        vehicle.position.x,
                        -950,
                        950
                    );

                vehicle.position.z =
                    THREE.MathUtils.clamp(
                        vehicle.position.z,
                        -950,
                        950
                    );

            }

            data.wheels
                .forEach(
                    wheel => {

                        wheel.rotation.x +=
                            data.speed *
                            delta *
                            2;

                    }
                );

        }

    }

};

UC.registerModule(
    "vehicles",
    VehicleSystem
);

VehicleSystem.init();
