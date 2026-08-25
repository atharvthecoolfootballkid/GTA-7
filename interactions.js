/* =========================================================
   ULTIMATE CITY — INTERACTION SYSTEM
   NPCs • Vehicles • Shops • Objects • Interaction prompts
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const InteractionSystem = {

    initialized: false,

    nearby: null,

    range: 5,

    prompt: null,

    init() {

        this.createPrompt();

        this.setupKeyboard();

        this.initialized = true;

        console.log(
            "Interaction system initialized."
        );

    },

    /* =====================================================
       PROMPT
       ===================================================== */

    createPrompt() {

        let prompt =
            document.getElementById(
                "interaction-prompt"
            );

        if (
            prompt
        ) {

            return;

        }

        prompt =
            document.createElement(
                "div"
            );

        prompt.id =
            "interaction-prompt";

        prompt.style.position =
            "fixed";

        prompt.style.left =
            "50%";

        prompt.style.bottom =
            "115px";

        prompt.style.transform =
            "translateX(-50%)";

        prompt.style.zIndex =
            "70";

        prompt.style.padding =
            "10px 17px";

        prompt.style.borderRadius =
            "10px";

        prompt.style.background =
            "rgba(0,0,0,.68)";

        prompt.style.color =
            "#fff";

        prompt.style.font =
            "700 13px Arial";

        prompt.style.display =
            "none";

        prompt.style.pointerEvents =
            "none";

        document.body.appendChild(
            prompt
        );

        this.prompt =
            prompt;

    },

    /* =====================================================
       KEYBOARD
       ===================================================== */

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

                if (
                    event.code ===
                    "KeyE" &&
                    !event.repeat
                ) {

                    this.interact();

                }

            }
        );

    },

    /* =====================================================
       FIND NEAREST
       ===================================================== */

    findNearest() {

        if (
            !UC.player ||
            !UC.world
        ) {

            return null;

        }

        let closest =
            null;

        let closestDistance =
            this.range;

        UC.world.traverse(
            object => {

                if (
                    !object.userData
                ) {

                    return;

                }

                const data =
                    object.userData;

                const interactable =
                    data.shop ||
                    data.interactable ||
                    data.vehicle ||
                    data.npc ||
                    data.property;

                if (
                    !interactable
                ) {

                    return;

                }

                const distance =
                    object.position.distanceTo(
                        UC.player.position
                    );

                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;

                    closest =
                        object;

                }

            }
        );

        return closest;

    },

    /* =====================================================
       INTERACT
       ===================================================== */

    interact() {

        const object =
            this.nearby;

        if (
            !object ||
            !object.userData
        ) {

            return;

        }

        const data =
            object.userData;

        /* VEHICLE */

        if (
            data.vehicle
        ) {

            if (
                UC.vehicles
            ) {

                UC.vehicles
                    .toggleVehicle();

            }

            return;

        }

        /* SHOP */

        if (
            data.shop
        ) {

            this.openShop(
                data
            );

            return;

        }

        /* PROPERTY */

        if (
            data.property
        ) {

            this.buyProperty(
                object
            );

            return;

        }

        /* NPC */

        if (
            data.npc
        ) {

            this.talkToNPC(
                object
            );

            return;

        }

        /* GENERIC */

        if (
            typeof data.onInteract ===
            "function"
        ) {

            data.onInteract();

        }

    },

    /* =====================================================
       SHOP
       ===================================================== */

    openShop(
        shop
    ) {

        const message =
            document.createElement(
                "div"
            );

        message.style.position =
            "fixed";

        message.style.left =
            "50%";

        message.style.top =
            "50%";

        message.style.transform =
            "translate(-50%,-50%)";

        message.style.zIndex =
            "100";

        message.style.width =
            "min(420px,85vw)";

        message.style.padding =
            "25px";

        message.style.borderRadius =
            "16px";

        message.style.background =
            "rgba(10,12,15,.94)";

        message.style.color =
            "#fff";

        message.style.fontFamily =
            "Arial,sans-serif";

        message.innerHTML =

            `<div style="
                font-size:12px;
                letter-spacing:3px;
                opacity:.6;
            ">
                STORE
            </div>

            <div style="
                font-size:28px;
                font-weight:900;
                margin-top:7px;
            ">
                ${shop.name}
            </div>

            <div style="
                margin-top:15px;
                opacity:.75;
                line-height:1.5;
            ">
                Explore this location and
                purchase available items.
            </div>

            <button
                id="close-interaction"
                style="
                    margin-top:20px;
                    padding:12px 18px;
                    border:0;
                    border-radius:9px;
                    background:#fff;
                    color:#111;
                    font-weight:800;
                "
            >
                CLOSE
            </button>`;

        document.body.appendChild(
            message
        );

        const close =
            document.getElementById(
                "close-interaction"
            );

        if (
            close
        ) {

            close.onclick =
                () => {

                    message.remove();

                };

        }

    },

    /* =====================================================
       PROPERTY
       ===================================================== */

    buyProperty(
        object
    ) {

        if (
            !UC.economy
        ) {

            return;

        }

        const success =
            UC.economy.buyProperty(
                object
            );

        if (
            success
        ) {

            this.showMessage(
                "PROPERTY PURCHASED"
            );

        } else {

            this.showMessage(
                "NOT ENOUGH MONEY"
            );

        }

    },

    /* =====================================================
       NPC
       ===================================================== */

    talkToNPC(
        npc
    ) {

        const names = [

            "Alex",

            "Jordan",

            "Sam",

            "Taylor",

            "Morgan",

            "Casey"

        ];

        const name =
            npc.userData.name ||
            names[
                Math.floor(
                    Math.random() *
                    names.length
                )
            ];

        npc.userData.name =
            name;

        const lines = [

            "Nice day out here.",

            "The city never sleeps.",

            "You should check out downtown.",

            "Traffic is crazy today.",

            "I think I saw a police car nearby.",

            "There are some interesting places around here."

        ];

        const line =
            lines[
                Math.floor(
                    Math.random() *
                    lines.length
                )
            ];

        this.showMessage(
            name +
            ": " +
            line
        );

    },

    /* =====================================================
       MESSAGE
       ===================================================== */

    showMessage(
        text
    ) {

        const message =
            document.createElement(
                "div"
            );

        message.style.position =
            "fixed";

        message.style.left =
            "50%";

        message.style.bottom =
            "160px";

        message.style.transform =
            "translateX(-50%)";

        message.style.zIndex =
            "100";

        message.style.padding =
            "13px 22px";

        message.style.borderRadius =
            "12px";

        message.style.background =
            "rgba(0,0,0,.8)";

        message.style.color =
            "#fff";

        message.style.font =
            "700 14px Arial";

        message.textContent =
            text;

        document.body.appendChild(
            message
        );

        setTimeout(
            () => {

                message.remove();

            },
            2200
        );

    },

    /* =====================================================
       UPDATE PROMPT
       ===================================================== */

    update() {

        if (
            !this.initialized
        ) {

            return;

        }

        this.nearby =
            this.findNearest();

        if (
            !this.nearby
        ) {

            this.prompt.style.display =
                "none";

            return;

        }

        const data =
            this.nearby.userData;

        let action =
            "INTERACT";

        if (
            data.vehicle
        ) {

            action =
                "E  ENTER VEHICLE";

        } else if (
            data.shop
        ) {

            action =
                "E  ENTER SHOP";

        } else if (
            data.npc
        ) {

            action =
                "E  TALK";

        } else if (
            data.property
        ) {

            action =
                "E  BUY PROPERTY";

        }

        this.prompt.textContent =
            action;

        this.prompt.style.display =
            "block";

    }

};

UC.registerModule(
    "interactions",
    InteractionSystem
);

InteractionSystem.init();
