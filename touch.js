/* =========================================================
   ULTIMATE CITY — TOUCH / IPAD CONTROL SYSTEM
   ========================================================= */

const UC = window.UltimateCity;

const TouchSystem = {

    initialized: false,

    joystick: {
        active: false,
        id: null,
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    },

    camera: {
        active: false,
        id: null,
        lastX: 0,
        lastY: 0
    },

    buttons: {},

    init() {

        this.createInterface();

        this.setupJoystick();

        this.setupCamera();

        this.setupButtons();

        this.initialized = true;

        console.log(
            "Touch controls initialized."
        );

    },

    /* =====================================================
       INTERFACE
       ===================================================== */

    createInterface() {

        if (
            document.getElementById(
                "touch-interface"
            )
        ) {

            return;

        }

        const root =
            document.createElement(
                "div"
            );

        root.id =
            "touch-interface";

        root.innerHTML = `

            <div
                id="touch-joystick"
                class="touch-joystick"
            >
                <div
                    id="joystick-stick"
                    class="joystick-stick"
                ></div>
            </div>

            <div
                id="touch-actions"
                class="touch-actions"
            >

                <button
                    id="touch-jump"
                    class="touch-button"
                >
                    JUMP
                </button>

                <button
                    id="touch-run"
                    class="touch-button"
                >
                    RUN
                </button>

                <button
                    id="touch-action"
                    class="touch-button large"
                >
                    E
                </button>

                <button
                    id="touch-reload"
                    class="touch-button"
                >
                    R
                </button>

                <button
                    id="touch-camera"
                    class="touch-button"
                >
                    VIEW
                </button>

                <button
                    id="touch-fire"
                    class="touch-button fire"
                >
                    FIRE
                </button>

            </div>

        `;

        document.body.appendChild(
            root
        );

        this.injectStyles();

    },

    /* =====================================================
       STYLES
       ===================================================== */

    injectStyles() {

        if (
            document.getElementById(
                "touch-system-style"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "touch-system-style";

        style.textContent = `

            #touch-interface {

                position:fixed;

                inset:0;

                z-index:80;

                pointer-events:none;

                user-select:none;

                -webkit-user-select:none;

                touch-action:none;

                font-family:
                    Arial,
                    sans-serif;

            }

            .touch-joystick {

                position:absolute;

                left:28px;

                bottom:34px;

                width:145px;

                height:145px;

                border-radius:50%;

                background:
                    rgba(255,255,255,.11);

                border:
                    2px solid
                    rgba(255,255,255,.24);

                box-shadow:
                    0 8px 30px
                    rgba(0,0,0,.3);

                pointer-events:auto;

                touch-action:none;

            }

            .joystick-stick {

                position:absolute;

                left:50%;

                top:50%;

                width:62px;

                height:62px;

                transform:
                    translate(-50%,-50%);

                border-radius:50%;

                background:
                    rgba(255,255,255,.34);

                border:
                    2px solid
                    rgba(255,255,255,.55);

                box-shadow:
                    0 4px 20px
                    rgba(0,0,0,.35);

            }

            .touch-actions {

                position:absolute;

                right:22px;

                bottom:25px;

                width:245px;

                display:grid;

                grid-template-columns:
                    repeat(3,1fr);

                gap:10px;

                pointer-events:auto;

            }

            .touch-button {

                min-height:54px;

                border:1px solid
                    rgba(255,255,255,.25);

                border-radius:14px;

                background:
                    rgba(10,10,12,.62);

                color:#fff;

                font-weight:900;

                font-size:11px;

                letter-spacing:1px;

                backdrop-filter:blur(10px);

                -webkit-backdrop-filter:
                    blur(10px);

                touch-action:none;

                -webkit-tap-highlight-color:
                    transparent;

            }

            .touch-button:active {

                transform:
                    scale(.94);

                background:
                    rgba(255,255,255,.25);

            }

            .touch-button.large {

                font-size:19px;

            }

            .touch-button.fire {

                background:
                    rgba(130,20,20,.72);

                min-height:64px;

            }

            @media
            (orientation:portrait) {

                .touch-joystick {

                    width:125px;

                    height:125px;

                    bottom:25px;

                    left:18px;

                }

                .joystick-stick {

                    width:54px;

                    height:54px;

                }

                .touch-actions {

                    width:210px;

                    right:12px;

                    bottom:15px;

                    gap:7px;

                }

                .touch-button {

                    min-height:48px;

                    font-size:9px;

                }

            }

            @media
            (min-width:1000px) {

                #touch-interface {

                    display:none;

                }

            }

        `;

        document.head.appendChild(
            style
        );

    },

    /* =====================================================
       JOYSTICK
       ===================================================== */

    setupJoystick() {

        const joystick =
            document.getElementById(
                "touch-joystick"
            );

        const stick =
            document.getElementById(
                "joystick-stick"
            );

        if (
            !joystick ||
            !stick
        ) {

            return;

        }

        joystick.addEventListener(
            "pointerdown",
            event => {

                this.joystick.active =
                    true;

                this.joystick.id =
                    event.pointerId;

                joystick.setPointerCapture(
                    event.pointerId
                );

                const rect =
                    joystick.getBoundingClientRect();

                this.joystick.startX =
                    rect.left +
                    rect.width / 2;

                this.joystick.startY =
                    rect.top +
                    rect.height / 2;

                this.updateJoystick(
                    event.clientX,
                    event.clientY,
                    stick
                );

            }
        );

        joystick.addEventListener(
            "pointermove",
            event => {

                if (
                    !this.joystick.active ||
                    event.pointerId !==
                    this.joystick.id
                ) {

                    return;

                }

                this.updateJoystick(
                    event.clientX,
                    event.clientY,
                    stick
                );

            }
        );

        const release =
            event => {

                if (
                    event.pointerId !==
                    this.joystick.id
                ) {

                    return;

                }

                this.joystick.active =
                    false;

                this.joystick.x =
                    0;

                this.joystick.y =
                    0;

                stick.style.transform =
                    "translate(-50%,-50%)";

                if (
                    UC.player
                ) {

                    UC.player
                        .clearTouchMovement();

                }

            };

        joystick.addEventListener(
            "pointerup",
            release
        );

        joystick.addEventListener(
            "pointercancel",
            release
        );

    },

    updateJoystick(
        x,
        y,
        stick
    ) {

        const dx =
            x -
            this.joystick.startX;

        const dy =
            y -
            this.joystick.startY;

        const radius =
            54;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        const scale =
            Math.min(
                1,
                radius /
                Math.max(
                    distance,
                    .001
                )
            );

        const px =
            dx *
            scale;

        const py =
            dy *
            scale;

        this.joystick.x =
            px / radius;

        this.joystick.y =
            py / radius;

        stick.style.transform =
            `translate(
                calc(-50% + ${px}px),
                calc(-50% + ${py}px)
            )`;

        if (
            UC.player
        ) {

            UC.player
                .setTouchMovement(
                    this.joystick.x,
                    this.joystick.y
                );

        }

    },

    /* =====================================================
       CAMERA SWIPE
       ===================================================== */

    setupCamera() {

        window.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.pointerType !==
                    "touch"
                ) {

                    return;

                }

                const target =
                    event.target;

                if (
                    target.closest(
                        "#touch-interface"
                    )
                ) {

                    return;

                }

                this.camera.active =
                    true;

                this.camera.id =
                    event.pointerId;

                this.camera.lastX =
                    event.clientX;

                this.camera.lastY =
                    event.clientY;

            }
        );

        window.addEventListener(
            "pointermove",
            event => {

                if (
                    !this.camera.active ||
                    event.pointerId !==
                    this.camera.id
                ) {

                    return;

                }

                if (
                    !UC.player
                ) {

                    return;

                }

                const dx =
                    event.clientX -
                    this.camera.lastX;

                const dy =
                    event.clientY -
                    this.camera.lastY;

                this.camera.lastX =
                    event.clientX;

                this.camera.lastY =
                    event.clientY;

                UC.player.rotation -=
                    dx *
                    .004;

                UC.player.pitch -=
                    dy *
                    .003;

                UC.player.pitch =
                    Math.max(
                        -.9,
                        Math.min(
                            .9,
                            UC.player.pitch
                        )
                    );

            }
        );

        const stop =
            event => {

                if (
                    event.pointerId ===
                    this.camera.id
                ) {

                    this.camera.active =
                        false;

                }

            };

        window.addEventListener(
            "pointerup",
            stop
        );

        window.addEventListener(
            "pointercancel",
            stop
        );

    },

    /* =====================================================
       BUTTONS
       ===================================================== */

    setupButtons() {

        this.bindButton(
            "touch-jump",
            () => {

                if (
                    UC.player
                ) {

                    UC.player.input.jump =
                        true;

                }

            }
        );

        this.bindHoldButton(
            "touch-run",
            value => {

                if (
                    UC.player
                ) {

                    UC.player.input.run =
                        value;

                }

            }
        );

        this.bindButton(
            "touch-action",
            () => {

                if (
                    UC.vehicles
                ) {

                    UC.vehicles
                        .toggleVehicle();

                }

            }
        );

        this.bindButton(
            "touch-reload",
            () => {

                if (
                    UC.weapons
                ) {

                    UC.weapons.reload();

                }

            }
        );

        this.bindButton(
            "touch-camera",
            () => {

                if (
                    UC.player
                ) {

                    UC.player
                        .toggleCamera();

                }

            }
        );

        this.bindHoldButton(
            "touch-fire",
            value => {

                if (
                    value &&
                    UC.weapons
                ) {

                    UC.weapons.fire();

                }

            }
        );

    },

    /* =====================================================
       NORMAL BUTTON
       ===================================================== */

    bindButton(
        id,
        callback
    ) {

        const element =
            document.getElementById(
                id
            );

        if (
            !element
        ) {

            return;

        }

        element.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                callback();

            }
        );

    },

    /* =====================================================
       HOLD BUTTON
       ===================================================== */

    bindHoldButton(
        id,
        callback
    ) {

        const element =
            document.getElementById(
                id
            );

        if (
            !element
        ) {

            return;

        }

        const start =
            event => {

                event.preventDefault();

                callback(
                    true
                );

                try {

                    element.setPointerCapture(
                        event.pointerId
                    );

                } catch (
                    error
                ) {}

            };

        const end =
            event => {

                event.preventDefault();

                callback(
                    false
                );

            };

        element.addEventListener(
            "pointerdown",
            start
        );

        element.addEventListener(
            "pointerup",
            end
        );

        element.addEventListener(
            "pointercancel",
            end
        );

        element.addEventListener(
            "pointerleave",
            end
        );

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update() {

        if (
            !this.initialized
        ) {

            return;

        }

        /*
         * The joystick continuously feeds
         * movement into PlayerSystem.
         */

        if (
            this.joystick.active &&
            UC.player
        ) {

            UC.player
                .setTouchMovement(
                    this.joystick.x,
                    this.joystick.y
                );

        }

    }

};

UC.registerModule(
    "touch",
    TouchSystem
);

TouchSystem.init();
