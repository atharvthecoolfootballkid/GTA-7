/* =========================================================
   ULTIMATE WORLD — MOBILE CONTROLS
   Virtual Joystick • Buttons • Touch • Responsive HUD
   ========================================================= */

(() => {

"use strict";

const UC =
    window.UltimateCity ||
    window.UltimateWorld;

if (!UC) {
    console.error("Mobile controls could not start.");
    return;
}

const MobileControls = {

    initialized:false,

    joystick:null,

    joystickKnob:null,

    active:false,

    inputX:0,

    inputZ:0,

    sprint:false,

    jumpPressed:false,

    interactPressed:false,

    init(){

        this.createStyles();

        this.createControls();

        this.setupTouch();

        this.initialized=true;

        console.log(
            "Mobile controls initialized."
        );

    },

    /* =====================================================
       STYLES
       ===================================================== */

    createStyles(){

        if(
            document.getElementById(
                "uw-mobile-styles"
            )
        ){

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "uw-mobile-styles";

        style.textContent = `

        #uw-mobile{

            position:fixed;

            inset:0;

            pointer-events:none;

            z-index:10000;

            display:none;

        }

        .uw-joystick{

            position:absolute;

            left:28px;

            bottom:30px;

            width:125px;

            height:125px;

            border-radius:50%;

            background:
                rgba(255,255,255,.12);

            border:
                2px solid
                rgba(255,255,255,.35);

            backdrop-filter:
                blur(8px);

            pointer-events:auto;

            touch-action:none;

        }

        .uw-knob{

            position:absolute;

            width:58px;

            height:58px;

            left:50%;

            top:50%;

            transform:
                translate(-50%,-50%);

            border-radius:50%;

            background:
                rgba(255,255,255,.7);

            box-shadow:
                0 5px 20px
                rgba(0,0,0,.25);

        }

        .uw-mobile-button{

            position:absolute;

            width:68px;

            height:68px;

            border-radius:50%;

            border:
                2px solid
                rgba(255,255,255,.35);

            background:
                rgba(0,0,0,.35);

            color:white;

            font-size:12px;

            font-weight:800;

            display:flex;

            align-items:center;

            justify-content:center;

            pointer-events:auto;

            touch-action:none;

            user-select:none;

            -webkit-user-select:none;

        }

        #uw-jump{

            right:35px;

            bottom:125px;

        }

        #uw-action{

            right:110px;

            bottom:55px;

        }

        #uw-sprint{

            right:30px;

            bottom:40px;

        }

        @media(
            max-width:900px
        ){

            #uw-mobile{

                display:block;

            }

        }

        `;

        document.head.appendChild(
            style
        );

    },

    /* =====================================================
       CONTROLS
       ===================================================== */

    createControls(){

        if(
            document.getElementById(
                "uw-mobile"
            )
        ){

            return;

        }

        const container =
            document.createElement(
                "div"
            );

        container.id =
            "uw-mobile";

        container.innerHTML = `

            <div
                class="uw-joystick"
                id="uw-joystick"
            >

                <div
                    class="uw-knob"
                    id="uw-knob"
                ></div>

            </div>

            <div
                class="uw-mobile-button"
                id="uw-jump"
            >
                JUMP
            </div>

            <div
                class="uw-mobile-button"
                id="uw-action"
            >
                ACTION
            </div>

            <div
                class="uw-mobile-button"
                id="uw-sprint"
            >
                RUN
            </div>

        `;

        document.body.appendChild(
            container
        );

        this.joystick =
            document.getElementById(
                "uw-joystick"
            );

        this.joystickKnob =
            document.getElementById(
                "uw-knob"
            );

    },

    /* =====================================================
       TOUCH
       ===================================================== */

    setupTouch(){

        if(
            !this.joystick
        ){

            return;

        }

        const move =
            event => {

                event.preventDefault();

                const touch =
                    event.touches[0];

                if(
                    !touch
                ){

                    return;

                }

                const rect =
                    this.joystick
                    .getBoundingClientRect();

                const centerX =
                    rect.left+
                    rect.width/2;

                const centerY =
                    rect.top+
                    rect.height/2;

                let dx =
                    touch.clientX-
                    centerX;

                let dy =
                    touch.clientY-
                    centerY;

                const radius =
                    rect.width/2;

                const distance =
                    Math.hypot(
                        dx,
                        dy
                    );

                if(
                    distance>radius
                ){

                    dx =
                        dx/
                        distance*
                        radius;

                    dy =
                        dy/
                        distance*
                        radius;

                }

                this.inputX =
                    dx/radius;

                this.inputZ =
                    dy/radius;

                this.joystickKnob.style.transform =
                    `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

                this.sendInput();

            };

        const end =
            event => {

                event.preventDefault();

                this.inputX=0;

                this.inputZ=0;

                this.joystickKnob.style.transform =
                    "translate(-50%,-50%)";

                this.sendInput();

            };

        this.joystick.addEventListener(
            "touchstart",
            event => {

                this.active=true;

                move(event);

            },
            {
                passive:false
            }
        );

        this.joystick.addEventListener(
            "touchmove",
            move,
            {
                passive:false
            }
        );

        this.joystick.addEventListener(
            "touchend",
            end,
            {
                passive:false
            }
        );

        this.joystick.addEventListener(
            "touchcancel",
            end,
            {
                passive:false
            }
        );

        this.setupButton(
            "uw-jump",
            () => {

                this.jumpPressed=true;

                this.triggerJump();

            }
        );

        this.setupButton(
            "uw-action",
            () => {

                this.interactPressed=true;

                this.triggerAction();

            }
        );

        const sprintButton =
            document.getElementById(
                "uw-sprint"
            );

        sprintButton.addEventListener(
            "touchstart",
            event => {

                event.preventDefault();

                this.sprint=true;

                this.sendInput();

            },
            {
                passive:false
            }
        );

        sprintButton.addEventListener(
            "touchend",
            event => {

                event.preventDefault();

                this.sprint=false;

                this.sendInput();

            },
            {
                passive:false
            }
        );

    },

    /* =====================================================
       BUTTON
       ===================================================== */

    setupButton(
        id,
        callback
    ){

        const button =
            document.getElementById(
                id
            );

        if(
            !button
        ){

            return;

        }

        button.addEventListener(
            "touchstart",
            event => {

                event.preventDefault();

                callback();

            },
            {
                passive:false
            }
        );

    },

    /* =====================================================
       SEND TO PHYSICS
       ===================================================== */

    sendInput(){

        const physics =
            UC.modules &&
            UC.modules.physics;

        if(
            physics &&
            typeof physics.setMobileInput ===
            "function"
        ){

            physics.setMobileInput(
                this.inputX,
                this.inputZ,
                this.sprint
            );

        }

    },

    /* =====================================================
       JUMP
       ===================================================== */

    triggerJump(){

        const physics =
            UC.modules &&
            UC.modules.physics;

        if(
            physics &&
            typeof physics.jump ===
            "function"
        ){

            physics.jump();

        }

        const audio =
            UC.modules &&
            UC.modules.audio;

        if(
            audio &&
            typeof audio.jump ===
            "function"
        ){

            audio.jump();

        }

    },

    /* =====================================================
       ACTION
       ===================================================== */

    triggerAction(){

        const vehicles =
            UC.modules &&
            UC.modules.vehicles;

        if(
            vehicles &&
            typeof vehicles.toggleVehicle ===
            "function"
        ){

            vehicles.toggleVehicle();

        }

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(){

        if(
            !this.initialized
        ){

            return;

        }

        this.sendInput();

    }

};

if(
    typeof UC.registerModule ===
    "function"
){

    UC.registerModule(
        "mobile-controls",
        MobileControls
    );

}

function boot(){

    if(
        MobileControls.initialized
    ){

        return;

    }

    try{

        MobileControls.init();

    }

    catch(error){

        console.error(
            "Mobile controls initialization error:",
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
        () => {

            setTimeout(
                boot,
                2900
            );

        },
        {
            once:true
        }
    );

}

else{

    setTimeout(
        boot,
        2900
    );

}

})();
