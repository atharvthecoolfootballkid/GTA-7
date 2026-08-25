/* =========================================================
   ULTIMATE WORLD — PHYSICS SYSTEM
   Player Movement • Gravity • Grounding • Collisions
   Vehicle-Friendly • Mobile-Friendly
   ========================================================= */

(() => {

"use strict";

const UC =
    window.UltimateCity ||
    window.UltimateWorld;

const THREE = window.THREE;

if (!UC || !THREE) {
    console.error(
        "Physics system could not start."
    );
    return;
}

const Physics = {

    initialized: false,

    player: null,

    velocity:
        new THREE.Vector3(),

    acceleration:
        new THREE.Vector3(),

    gravity: -24,

    walkSpeed: 7,

    sprintSpeed: 11,

    jumpStrength: 9,

    groundY: 0,

    grounded: true,

    damping: 10,

    collisionRadius: 0.55,

    keys: {},

    mobileInput: {
        x: 0,
        z: 0,
        sprint: false
    },

    init() {

        this.player =
            UC.player ||
            window.player ||
            null;

        this.setupKeyboard();

        this.initialized = true;

        console.log(
            "Physics system initialized."
        );

    },

    /* =====================================================
       KEYBOARD
       ===================================================== */

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

                this.keys[
                    event.code
                ] = true;

                if (
                    event.code ===
                    "Space"
                ) {

                    this.jump();

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
       MOVEMENT INPUT
       ===================================================== */

    getKeyboardInput() {

        let x = 0;
        let z = 0;

        if (
            this.keys["KeyA"] ||
            this.keys["ArrowLeft"]
        ) {

            x -= 1;

        }

        if (
            this.keys["KeyD"] ||
            this.keys["ArrowRight"]
        ) {

            x += 1;

        }

        if (
            this.keys["KeyW"] ||
            this.keys["ArrowUp"]
        ) {

            z -= 1;

        }

        if (
            this.keys["KeyS"] ||
            this.keys["ArrowDown"]
        ) {

            z += 1;

        }

        const length =
            Math.hypot(
                x,
                z
            );

        if (
            length > 1
        ) {

            x /= length;
            z /= length;

        }

        return {
            x,
            z
        };

    },

    /* =====================================================
       MOBILE INPUT
       ===================================================== */

    setMobileInput(
        x,
        z,
        sprint = false
    ) {

        this.mobileInput.x =
            THREE.MathUtils.clamp(
                x,
                -1,
                1
            );

        this.mobileInput.z =
            THREE.MathUtils.clamp(
                z,
                -1,
                1
            );

        this.mobileInput.sprint =
            !!sprint;

    },

    clearMobileInput() {

        this.mobileInput.x = 0;
        this.mobileInput.z = 0;
        this.mobileInput.sprint = false;

    },

    /* =====================================================
       JUMP
       ===================================================== */

    jump() {

        if (
            !this.grounded
        ) {

            return;

        }

        this.velocity.y =
            this.jumpStrength;

        this.grounded =
            false;

    },

    /* =====================================================
       APPLY MOVEMENT
       ===================================================== */

    applyMovement(
        player,
        delta
    ) {

        const keyboard =
            this.getKeyboardInput();

        let inputX =
            keyboard.x;

        let inputZ =
            keyboard.z;

        if (
            Math.abs(
                this.mobileInput.x
            ) > 0.01 ||
            Math.abs(
                this.mobileInput.z
            ) > 0.01
        ) {

            inputX =
                this.mobileInput.x;

            inputZ =
                this.mobileInput.z;

        }

        const sprint =
            this.keys["ShiftLeft"] ||
            this.keys["ShiftRight"] ||
            this.mobileInput.sprint;

        const speed =
            sprint
                ? this.sprintSpeed
                : this.walkSpeed;

        const targetX =
            inputX *
            speed;

        const targetZ =
            inputZ *
            speed;

        const blend =
            1 -
            Math.exp(
                -this.damping *
                delta
            );

        this.velocity.x =
            THREE.MathUtils.lerp(
                this.velocity.x,
                targetX,
                blend
            );

        this.velocity.z =
            THREE.MathUtils.lerp(
                this.velocity.z,
                targetZ,
                blend
            );

        player.position.x +=
            this.velocity.x *
            delta;

        player.position.z +=
            this.velocity.z *
            delta;

    },

    /* =====================================================
       GRAVITY
       ===================================================== */

    applyGravity(
        player,
        delta
    ) {

        if (
            this.grounded
        ) {

            this.velocity.y =
                Math.max(
                    this.velocity.y,
                    0
                );

        }

        else {

            this.velocity.y +=
                this.gravity *
                delta;

            player.position.y +=
                this.velocity.y *
                delta;

        }

        if (
            player.position.y <=
            this.groundY
        ) {

            player.position.y =
                this.groundY;

            this.velocity.y = 0;

            this.grounded = true;

        }

    },

    /* =====================================================
       WORLD BOUNDS
       ===================================================== */

    enforceWorldBounds(
        player
    ) {

        const limit =
            950;

        player.position.x =
            THREE.MathUtils.clamp(
                player.position.x,
                -limit,
                limit
            );

        player.position.z =
            THREE.MathUtils.clamp(
                player.position.z,
                -limit,
                limit
            );

    },

    /* =====================================================
       BASIC OBSTACLE COLLISION
       ===================================================== */

    collideWithBuildings(
        player
    ) {

        const buildings =
            UC.buildings ||
            window.cityBuildings ||
            [];

        if (
            !Array.isArray(
                buildings
            )
        ) {

            return;

        }

        for (
            const building
            of buildings
        ) {

            if (
                !building ||
                !building.position
            ) {

                continue;

            }

            const box =
                new THREE.Box3()
                .setFromObject(
                    building
                );

            const closest =
                new THREE.Vector3();

            box.clampPoint(
                player.position,
                closest
            );

            const distance =
                closest.distanceTo(
                    player.position
                );

            if (
                distance <
                this.collisionRadius
            ) {

                const push =
                    player.position
                    .clone()
                    .sub(
                        closest
                    );

                if (
                    push.lengthSq() <
                    0.0001
                ) {

                    continue;

                }

                push.normalize();

                player.position.add(
                    push.multiplyScalar(
                        this.collisionRadius -
                        distance
                    )
                );

            }

        }

    },

    /* =====================================================
       FRICTION
       ===================================================== */

    applyFriction(
        delta
    ) {

        const moving =
            Math.abs(
                this.velocity.x
            ) >
            0.05 ||
            Math.abs(
                this.velocity.z
            ) >
            0.05;

        if (
            moving
        ) {

            return;

        }

        const friction =
            Math.exp(
                -12 *
                delta
            );

        this.velocity.x *=
            friction;

        this.velocity.z *=
            friction;

    },

    /* =====================================================
       ORIENTATION
       ===================================================== */

    updatePlayerRotation(
        player
    ) {

        const x =
            this.velocity.x;

        const z =
            this.velocity.z;

        if (
            Math.abs(x) <
            0.05 &&
            Math.abs(z) <
            0.05
        ) {

            return;

        }

        const target =
            Math.atan2(
                x,
                z
            );

        let difference =
            target -
            player.rotation.y;

        while (
            difference >
            Math.PI
        ) {

            difference -=
                Math.PI * 2;

        }

        while (
            difference <
            -Math.PI
        ) {

            difference +=
                Math.PI * 2;

        }

        player.rotation.y +=
            difference *
            0.18;

    },

    /* =====================================================
       MAIN UPDATE
       ===================================================== */

    update(
        delta
    ) {

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

        this.applyMovement(
            player,
            delta
        );

        this.applyGravity(
            player,
            delta
        );

        this.collideWithBuildings(
            player
        );

        this.enforceWorldBounds(
            player
        );

        this.updatePlayerRotation(
            player
        );

        this.applyFriction(
            delta
        );

    }

};

/* =========================================================
   REGISTER
   ========================================================= */

if (
    typeof UC.registerModule ===
    "function"
) {

    UC.registerModule(
        "physics",
        Physics
    );

}

/* =========================================================
   BOOT
   ========================================================= */

function boot() {

    if (
        Physics.initialized
    ) {

        return;

    }

    try {

        Physics.init();

    }

    catch (
        error
    ) {

        console.error(
            "Physics initialization error:",
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
                1500
            );

        },
        {
            once:true
        }
    );

}

else {

    setTimeout(
        boot,
        1500
    );

}

})();
