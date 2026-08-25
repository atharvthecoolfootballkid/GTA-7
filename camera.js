/* =========================================================
   ULTIMATE WORLD — ADVANCED CAMERA SYSTEM
   First Person • Third Person • Cinematic • iPad Ready
   ========================================================= */

(() => {

"use strict";

const UC = window.UltimateCity || window.UltimateWorld;
const THREE = window.THREE;

if (!UC || !THREE) {
    console.error("Camera system could not start.");
    return;
}

const CameraSystem = {

    initialized: false,

    camera: null,
    player: null,

    mode: "third",

    yaw: 0,
    pitch: 0,

    targetYaw: 0,
    targetPitch: 0,

    distance: 6,
    targetDistance: 6,

    height: 2.3,

    smoothness: 10,

    sensitivity: 0.0025,

    firstPersonHeight: 1.65,

    thirdPersonHeight: 2.5,

    cinematicTime: 0,

    shake: 0,

    touchActive: false,

    lastTouchX: 0,
    lastTouchY: 0,

    keys: {},

    init() {

        this.camera =
            UC.camera ||
            window.camera;

        this.player =
            UC.player ||
            window.player;

        if (!this.camera) {

            console.warn(
                "Camera: camera unavailable."
            );

            return;

        }

        this.setupControls();

        this.initialized = true;

        console.log(
            "Advanced camera initialized."
        );

    },

    /* =====================================================
       CAMERA MODES
       ===================================================== */

    setMode(mode) {

        if (
            mode !== "first" &&
            mode !== "third" &&
            mode !== "cinematic"
        ) {

            return;

        }

        this.mode = mode;

        if (mode === "first") {

            this.targetDistance = 0;

            this.height =
                this.firstPersonHeight;

        }

        if (mode === "third") {

            this.targetDistance = 6;

            this.height =
                this.thirdPersonHeight;

        }

        if (mode === "cinematic") {

            this.targetDistance = 9;

            this.height = 3;

        }

    },

    toggleMode() {

        if (this.mode === "third") {

            this.setMode("first");

        } else {

            this.setMode("third");

        }

    },

    /* =====================================================
       INPUT
       ===================================================== */

    setupControls() {

        window.addEventListener(
            "keydown",
            event => {

                this.keys[
                    event.code
                ] = true;

                if (
                    event.code ===
                    "KeyV"
                ) {

                    this.toggleMode();

                }

            }
        );

        window.addEventListener(
            "keyup",
            event => {

                this.keys[
                    event.code
                ] = false;

            }
        );

        window.addEventListener(
            "mousemove",
            event => {

                if (
                    document.pointerLockElement
                ) {

                    this.targetYaw -=
                        event.movementX *
                        this.sensitivity;

                    this.targetPitch -=
                        event.movementY *
                        this.sensitivity;

                    this.targetPitch =
                        THREE.MathUtils.clamp(
                            this.targetPitch,
                            -1.35,
                            1.35
                        );

                }

            }
        );

        window.addEventListener(
            "touchstart",
            event => {

                if (
                    event.touches.length === 1
                ) {

                    const touch =
                        event.touches[0];

                    this.touchActive =
                        true;

                    this.lastTouchX =
                        touch.clientX;

                    this.lastTouchY =
                        touch.clientY;

                }

            },
            {
                passive: true
            }
        );

        window.addEventListener(
            "touchmove",
            event => {

                if (
                    !this.touchActive ||
                    event.touches.length !== 1
                ) {

                    return;

                }

                const touch =
                    event.touches[0];

                const dx =
                    touch.clientX -
                    this.lastTouchX;

                const dy =
                    touch.clientY -
                    this.lastTouchY;

                this.targetYaw -=
                    dx *
                    0.006;

                this.targetPitch -=
                    dy *
                    0.006;

                this.targetPitch =
                    THREE.MathUtils.clamp(
                        this.targetPitch,
                        -1.35,
                        1.35
                    );

                this.lastTouchX =
                    touch.clientX;

                this.lastTouchY =
                    touch.clientY;

            },
            {
                passive: true
            }
        );

        window.addEventListener(
            "touchend",
            () => {

                this.touchActive =
                    false;

            },
            {
                passive: true
            }
        );

        window.addEventListener(
            "wheel",
            event => {

                if (
                    this.mode !== "third"
                ) {

                    return;

                }

                this.targetDistance +=
                    event.deltaY *
                    0.01;

                this.targetDistance =
                    THREE.MathUtils.clamp(
                        this.targetDistance,
                        3,
                        12
                    );

            },
            {
                passive: true
            }
        );

    },

    /* =====================================================
       PLAYER FINDER
       ===================================================== */

    findPlayer() {

        if (
            this.player &&
            this.player.position
        ) {

            return this.player;

        }

        if (
            UC.player &&
            UC.player.position
        ) {

            this.player =
                UC.player;

            return this.player;

        }

        if (
            window.player &&
            window.player.position
        ) {

            this.player =
                window.player;

            return this.player;

        }

        return null;

    },

    /* =====================================================
       SMOOTH ROTATION
       ===================================================== */

    updateRotation(delta) {

        const amount =
            1 -
            Math.exp(
                -this.smoothness *
                delta
            );

        this.yaw =
            THREE.MathUtils.lerp(
                this.yaw,
                this.targetYaw,
                amount
            );

        this.pitch =
            THREE.MathUtils.lerp(
                this.pitch,
                this.targetPitch,
                amount
            );

    },

    /* =====================================================
       FIRST PERSON
       ===================================================== */

    updateFirstPerson(
        player
    ) {

        const position =
            player.position;

        this.camera.position.set(
            position.x,
            position.y +
            this.firstPersonHeight,
            position.z
        );

        this.camera.rotation.order =
            "YXZ";

        this.camera.rotation.y =
            this.yaw;

        this.camera.rotation.x =
            this.pitch;

    },

    /* =====================================================
       THIRD PERSON
       ===================================================== */

    updateThirdPerson(
        player,
        delta
    ) {

        const playerPosition =
            player.position.clone();

        playerPosition.y +=
            this.thirdPersonHeight;

        const horizontal =
            new THREE.Vector3(

                Math.sin(this.yaw),
                0,
                Math.cos(this.yaw)

            );

        const desired =
            playerPosition.clone()
            .add(
                horizontal.multiplyScalar(
                    this.targetDistance
                )
            );

        desired.y +=
            Math.sin(
                this.pitch
            ) *
            this.targetDistance;

        const amount =
            1 -
            Math.exp(
                -this.smoothness *
                delta
            );

        this.camera.position.lerp(
            desired,
            amount
        );

        this.camera.lookAt(
            playerPosition
        );

    },

    /* =====================================================
       CINEMATIC
       ===================================================== */

    updateCinematic(
        player,
        delta
    ) {

        this.cinematicTime +=
            delta;

        const radius = 9;

        const angle =
            this.cinematicTime *
            0.18;

        const target =
            player.position.clone();

        target.y += 2;

        const desired =
            new THREE.Vector3(

                target.x +
                Math.sin(angle) *
                radius,

                target.y +
                3,

                target.z +
                Math.cos(angle) *
                radius

            );

        const amount =
            1 -
            Math.exp(
                -3 *
                delta
            );

        this.camera.position.lerp(
            desired,
            amount
        );

        this.camera.lookAt(
            target
        );

    },

    /* =====================================================
       CAMERA SHAKE
       ===================================================== */

    addShake(
        amount
    ) {

        this.shake =
            Math.max(
                this.shake,
                amount
            );

    },

    updateShake(
        delta
    ) {

        if (
            this.shake <= 0
        ) {

            return;

        }

        this.camera.position.x +=
            (
                Math.random() -
                0.5
            ) *
            this.shake;

        this.camera.position.y +=
            (
                Math.random() -
                0.5
            ) *
            this.shake;

        this.camera.position.z +=
            (
                Math.random() -
                0.5
            ) *
            this.shake;

        this.shake *=
            Math.pow(
                0.03,
                delta
            );

        if (
            this.shake < 0.01
        ) {

            this.shake = 0;

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

        const player =
            this.findPlayer();

        if (
            !player
        ) {

            return;

        }

        this.updateRotation(
            delta
        );

        if (
            this.mode === "first"
        ) {

            this.updateFirstPerson(
                player
            );

        }

        else if (
            this.mode === "third"
        ) {

            this.updateThirdPerson(
                player,
                delta
            );

        }

        else {

            this.updateCinematic(
                player,
                delta
            );

        }

        this.updateShake(
            delta
        );

    }

};

if (
    typeof UC.registerModule ===
    "function"
) {

    UC.registerModule(
        "camera",
        CameraSystem
    );

}

function boot() {

    if (
        CameraSystem.initialized
    ) {

        return;

    }

    try {

        CameraSystem.init();

    }

    catch (
        error
    ) {

        console.error(
            "Camera initialization error:",
            error
        );

    }

}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                boot,
                1300
            );

        },
        {
            once: true
        }
    );

}

else {

    setTimeout(
        boot,
        1300
    );

}

})();
