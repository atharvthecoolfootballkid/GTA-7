/* =========================================================
   ULTIMATE CITY — PLAYER SYSTEM
   First Person + Third Person
   Keyboard + Touch Ready
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const PlayerSystem = {

    initialized: false,

    group: null,
    body: null,
    head: null,

    velocity: new THREE.Vector3(),

    position: new THREE.Vector3(
        0,
        0,
        40
    ),

    rotation: 0,

    pitch: 0,

    speed: 7,

    runSpeed: 12,

    jumpPower: 9,

    gravity: 25,

    health: 100,

    stamina: 100,

    cameraMode: "third",

    cameraDistance: 7,

    cameraHeight: 3,

    onGround: true,

    moving: false,

    running: false,

    input: {

        forward: false,
        backward: false,
        left: false,
        right: false,

        run: false,
        jump: false

    },

    touchInput: {

        x: 0,
        y: 0

    },

    init() {

        this.createCharacter();

        this.setupKeyboard();

        this.setupCamera();

        this.setupTouchCamera();

        this.initialized = true;

        UC.player = this;

        console.log(
            "Player system initialized."
        );

    },

    /* =====================================================
       CHARACTER
       ===================================================== */

    createCharacter() {

        this.group =
            new THREE.Group();

        this.group.name =
            "Player";

        /*
         * Original placeholder character.
         * It is deliberately simple so a custom
         * high-quality character model can later
         * replace this without changing gameplay.
         */

        const skin =
            new THREE.MeshStandardMaterial({

                color: 0xc78e68,

                roughness: .75

            });

        const clothing =
            new THREE.MeshStandardMaterial({

                color: 0x20272b,

                roughness: .8

            });

        const shoes =
            new THREE.MeshStandardMaterial({

                color: 0x111416,

                roughness: .65

            });

        /* torso */

        const torso =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .9,
                    1.25,
                    .5
                ),

                clothing

            );

        torso.position.y =
            1.55;

        torso.castShadow =
            true;

        this.group.add(
            torso
        );

        /* head */

        this.head =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .34,
                    20,
                    16
                ),

                skin

            );

        this.head.position.y =
            2.55;

        this.head.castShadow =
            true;

        this.group.add(
            this.head
        );

        /* left arm */

        const leftArm =
            new THREE.Mesh(

                new THREE.CapsuleGeometry(
                    .13,
                    .72,
                    6,
                    10
                ),

                clothing

            );

        leftArm.position.set(
            -.62,
            1.62,
            0
        );

        leftArm.rotation.z =
            -.08;

        leftArm.castShadow =
            true;

        this.group.add(
            leftArm
        );

        /* right arm */

        const rightArm =
            leftArm.clone();

        rightArm.position.x =
            .62;

        rightArm.rotation.z =
            .08;

        this.group.add(
            rightArm
        );

        /* left leg */

        const leftLeg =
            new THREE.Mesh(

                new THREE.CapsuleGeometry(
                    .15,
                    .9,
                    6,
                    10
                ),

                clothing

            );

        leftLeg.position.set(
            -.23,
            .55,
            0
        );

        leftLeg.castShadow =
            true;

        this.group.add(
            leftLeg
        );

        /* right leg */

        const rightLeg =
            leftLeg.clone();

        rightLeg.position.x =
            .23;

        this.group.add(
            rightLeg
        );

        /* shoes */

        const leftShoe =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .28,
                    .16,
                    .58
                ),

                shoes

            );

        leftShoe.position.set(
            -.23,
            .08,
            -.12
        );

        this.group.add(
            leftShoe
        );

        const rightShoe =
            leftShoe.clone();

        rightShoe.position.x =
            .23;

        this.group.add(
            rightShoe
        );

        this.group.position.copy(
            this.position
        );

        UC.world.add(
            this.group
        );

    },

    /* =====================================================
       CAMERA
       ===================================================== */

    setupCamera() {

        UC.camera.position.set(
            0,
            3,
            7
        );

    },

    setCameraMode(mode) {

        if (
            mode !== "first" &&
            mode !== "third"
        ) {

            return;

        }

        this.cameraMode =
            mode;

        UC.settings.cameraMode =
            mode;

    },

    toggleCamera() {

        this.setCameraMode(

            this.cameraMode === "third"
                ? "first"
                : "third"

        );

    },

    updateCamera() {

        const camera =
            UC.camera;

        if (
            this.cameraMode ===
            "first"
        ) {

            const eye =
                new THREE.Vector3(
                    0,
                    2.55,
                    0
                );

            eye.applyAxisAngle(
                new THREE.Vector3(
                    0,
                    1,
                    0
                ),
                this.rotation
            );

            eye.add(
                this.position
            );

            camera.position.lerp(
                eye,
                .25
            );

            camera.rotation.order =
                "YXZ";

            camera.rotation.y =
                this.rotation;

            camera.rotation.x =
                this.pitch;

            return;

        }

        const offset =
            new THREE.Vector3(
                0,
                this.cameraHeight,
                this.cameraDistance
            );

        offset.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            this.rotation
        );

        const target =
            this.position.clone();

        target.y += 1.7;

        const desired =
            target.clone().add(
                offset
            );

        camera.position.lerp(
            desired,
            .12
        );

        camera.lookAt(
            target
        );

    },

    /* =====================================================
       KEYBOARD
       ===================================================== */

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

                switch (
                    event.code
                ) {

                    case "KeyW":
                    case "ArrowUp":

                        this.input.forward =
                            true;

                        break;

                    case "KeyS":
                    case "ArrowDown":

                        this.input.backward =
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

                    case "ShiftLeft":
                    case "ShiftRight":

                        this.input.run =
                            true;

                        break;

                    case "Space":

                        if (
                            !event.repeat
                        ) {

                            this.input.jump =
                                true;

                        }

                        break;

                    case "KeyV":

                        if (
                            !event.repeat
                        ) {

                            this.toggleCamera();

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

                        this.input.forward =
                            false;

                        break;

                    case "KeyS":
                    case "ArrowDown":

                        this.input.backward =
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

                    case "ShiftLeft":
                    case "ShiftRight":

                        this.input.run =
                            false;

                        break;

                }

            }
        );

    },

    /* =====================================================
       MOUSE CAMERA
       ===================================================== */

    setupTouchCamera() {

        let dragging =
            false;

        let lastX = 0;
        let lastY = 0;

        window.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.pointerType ===
                    "mouse" &&
                    event.button !== 0
                ) {

                    return;

                }

                dragging =
                    true;

                lastX =
                    event.clientX;

                lastY =
                    event.clientY;

            }
        );

        window.addEventListener(
            "pointermove",
            event => {

                if (
                    !dragging
                ) {

                    return;

                }

                const dx =
                    event.clientX -
                    lastX;

                const dy =
                    event.clientY -
                    lastY;

                lastX =
                    event.clientX;

                lastY =
                    event.clientY;

                this.rotation -=
                    dx *
                    .004;

                this.pitch -=
                    dy *
                    .003;

                this.pitch =
                    THREE.MathUtils.clamp(
                        this.pitch,
                        -.9,
                        .9
                    );

            }
        );

        window.addEventListener(
            "pointerup",
            () => {

                dragging =
                    false;

            }
        );

    },

    /* =====================================================
       TOUCH MOVEMENT
       ===================================================== */

    setTouchMovement(
        x,
        y
    ) {

        this.touchInput.x =
            THREE.MathUtils.clamp(
                x,
                -1,
                1
            );

        this.touchInput.y =
            THREE.MathUtils.clamp(
                y,
                -1,
                1
            );

    },

    clearTouchMovement() {

        this.touchInput.x =
            0;

        this.touchInput.y =
            0;

    },

    /* =====================================================
       MOVEMENT
       ===================================================== */

    update(delta) {

        if (
            !this.initialized
        ) {

            return;

        }

        this.updateMovement(
            delta
        );

        this.updateCamera();

        this.animateCharacter(
            delta
        );

    },

    updateMovement(delta) {

        const movement =
            new THREE.Vector3();

        let forward = 0;
        let side = 0;

        if (
            this.input.forward
        ) {

            forward += 1;

        }

        if (
            this.input.backward
        ) {

            forward -= 1;

        }

        if (
            this.input.right
        ) {

            side += 1;

        }

        if (
            this.input.left
        ) {

            side -= 1;

        }

        forward +=
            -this.touchInput.y;

        side +=
            this.touchInput.x;

        movement.set(
            side,
            0,
            -forward
        );

        if (
            movement.lengthSq() >
            1
        ) {

            movement.normalize();

        }

        const moving =
            movement.lengthSq() >
            .001;

        this.moving =
            moving;

        const running =
            this.input.run &&
            moving &&
            this.stamina > 0;

        this.running =
            running;

        let currentSpeed =
            running
                ? this.runSpeed
                : this.speed;

        if (
            moving
        ) {

            movement.applyAxisAngle(
                new THREE.Vector3(
                    0,
                    1,
                    0
                ),
                this.rotation
            );

            this.position.addScaledVector(
                movement,
                currentSpeed *
                delta
            );

            if (
                running
            ) {

                this.stamina -=
                    25 *
                    delta;

            } else {

                this.stamina +=
                    15 *
                    delta;

            }

        } else {

            this.stamina +=
                18 *
                delta;

        }

        this.stamina =
            THREE.MathUtils.clamp(
                this.stamina,
                0,
                100
            );

        /* jump */

        if (
            this.input.jump &&
            this.onGround
        ) {

            this.velocity.y =
                this.jumpPower;

            this.onGround =
                false;

        }

        this.input.jump =
            false;

        /* gravity */

        this.velocity.y -=
            this.gravity *
            delta;

        this.position.y +=
            this.velocity.y *
            delta;

        if (
            this.position.y <=
            0
        ) {

            this.position.y =
                0;

            this.velocity.y =
                0;

            this.onGround =
                true;

        }

        this.limitWorld();

        this.group.position.copy(
            this.position
        );

        if (
            moving
        ) {

            const desiredRotation =
                Math.atan2(
                    movement.x,
                    movement.z
                );

            this.group.rotation.y =
                desiredRotation;

        }

    },

    /* =====================================================
       WORLD LIMIT
       ===================================================== */

    limitWorld() {

        const limit =
            970;

        this.position.x =
            THREE.MathUtils.clamp(
                this.position.x,
                -limit,
                limit
            );

        this.position.z =
            THREE.MathUtils.clamp(
                this.position.z,
                -limit,
                limit
            );

    },

    /* =====================================================
       CHARACTER ANIMATION
       ===================================================== */

    animateCharacter(delta) {

        if (
            !this.group
        ) {

            return;

        }

        const speed =
            this.running
                ? 12
                : 7;

        if (
            this.moving
        ) {

            const wave =
                Math.sin(
                    performance.now() *
                    .012 *
                    (
                        speed /
                        7
                    )
                ) *
                .15;

            this.group.children
                .forEach(
                    child => {

                        if (
                            child !==
                            this.head &&
                            child.isMesh
                        ) {

                            child.rotation.x =
                                wave;

                        }

                    }
                );

        }

    },

    /* =====================================================
       DAMAGE
       ===================================================== */

    damage(amount) {

        this.health -=
            Math.max(
                0,
                amount
            );

        this.health =
            THREE.MathUtils.clamp(
                this.health,
                0,
                100
            );

        this.showDamage();

        if (
            this.health <= 0
        ) {

            this.respawn();

        }

    },

    heal(amount) {

        this.health =
            THREE.MathUtils.clamp(
                this.health +
                amount,
                0,
                100
            );

    },

    showDamage() {

        const damage =
            document.querySelector(
                ".damage"
            );

        if (
            !damage
        ) {

            return;

        }

        damage.classList.add(
            "visible"
        );

        setTimeout(
            () => {

                damage.classList.remove(
                    "visible"
                );

            },
            140
        );

    },

    /* =====================================================
       RESPAWN
       ===================================================== */

    respawn() {

        this.health =
            100;

        this.stamina =
            100;

        this.position.set(
            0,
            0,
            40
        );

        this.velocity.set(
            0,
            0,
            0
        );

        this.rotation =
            0;

        this.group.position.copy(
            this.position
        );

    }

};

UC.registerModule(
    "player",
    PlayerSystem
);

PlayerSystem.init();
