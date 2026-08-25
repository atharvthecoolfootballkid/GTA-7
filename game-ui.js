/* =========================================================
   ULTIMATE CITY — GAME UI
   Pause • Settings • Inventory • Mission Menu • HUD
   ========================================================= */

const UC = window.UltimateCity;

const GameUI = {

    initialized: false,

    paused: false,

    overlay: null,

    init() {

        this.createPauseMenu();

        this.createHUD();

        this.setupKeyboard();

        this.initialized = true;

        console.log(
            "Game UI initialized."
        );

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
                    "Escape"
                ) {

                    this.togglePause();

                }

            }
        );

    },

    /* =====================================================
       PAUSE MENU
       ===================================================== */

    createPauseMenu() {

        const overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "pause-menu";

        overlay.style.position =
            "fixed";

        overlay.style.inset =
            "0";

        overlay.style.zIndex =
            "800";

        overlay.style.display =
            "none";

        overlay.style.background =
            "rgba(5,7,10,.93)";

        overlay.style.color =
            "#fff";

        overlay.style.fontFamily =
            "Arial,sans-serif";

        overlay.innerHTML =

            `<div style="
                width:min(720px,90vw);
                margin:0 auto;
                padding-top:10vh;
            ">

                <div style="
                    font-size:12px;
                    letter-spacing:5px;
                    opacity:.55;
                ">
                    ULTIMATE CITY
                </div>

                <div style="
                    margin-top:8px;
                    font-size:52px;
                    font-weight:1000;
                ">
                    PAUSED
                </div>

                <div
                    id="pause-buttons"
                    style="
                        margin-top:35px;
                        display:grid;
                        gap:10px;
                    "
                >

                    <button
                        data-pause="resume"
                        class="pause-button"
                    >
                        RESUME
                    </button>

                    <button
                        data-pause="map"
                        class="pause-button"
                    >
                        MAP
                    </button>

                    <button
                        data-pause="missions"
                        class="pause-button"
                    >
                        MISSIONS
                    </button>

                    <button
                        data-pause="inventory"
                        class="pause-button"
                    >
                        INVENTORY
                    </button>

                    <button
                        data-pause="save"
                        class="pause-button"
                    >
                        SAVE GAME
                    </button>

                    <button
                        data-pause="settings"
                        class="pause-button"
                    >
                        SETTINGS
                    </button>

                </div>

                <div style="
                    margin-top:30px;
                    opacity:.45;
                    font-size:12px;
                ">
                    Press ESC to resume
                </div>

            </div>`;

        document.body.appendChild(
            overlay
        );

        this.overlay =
            overlay;

        this.injectStyles();

        overlay
            .querySelectorAll(
                "[data-pause]"
            )
            .forEach(
                button => {

                    button.onclick =
                        () => {

                            this.handlePauseAction(
                                button.dataset.pause
                            );

                        };

                }
            );

    },

    /* =====================================================
       STYLES
       ===================================================== */

    injectStyles() {

        const style =
            document.createElement(
                "style"
            );

        style.textContent = `

            .pause-button {

                width:100%;

                padding:17px;

                border:1px solid
                    rgba(255,255,255,.12);

                border-radius:11px;

                background:
                    rgba(255,255,255,.06);

                color:#fff;

                text-align:left;

                font-size:15px;

                font-weight:900;

                letter-spacing:1px;

                cursor:pointer;

            }

            .pause-button:hover {

                background:
                    rgba(255,255,255,.14);

            }

        `;

        document.head.appendChild(
            style
        );

    },

    /* =====================================================
       PAUSE
       ===================================================== */

    togglePause() {

        if (
            this.paused
        ) {

            this.resume();

        } else {

            this.pause();

        }

    },

    pause() {

        this.paused =
            true;

        if (
            this.overlay
        ) {

            this.overlay.style.display =
                "block";

        }

        if (
            UC.game
        ) {

            UC.game.paused =
                true;

        }

    },

    resume() {

        this.paused =
            false;

        if (
            this.overlay
        ) {

            this.overlay.style.display =
                "none";

        }

        if (
            UC.game
        ) {

            UC.game.paused =
                false;

        }

    },

    /* =====================================================
       ACTIONS
       ===================================================== */

    handlePauseAction(
        action
    ) {

        if (
            UC.audio
        ) {

            UC.audio.uiClick();

        }

        if (
            action ===
            "resume"
        ) {

            this.resume();

            return;

        }

        if (
            action ===
            "map"
        ) {

            this.resume();

            if (
                UC.map
            ) {

                UC.map.toggleFullMap();

            }

            return;

        }

        if (
            action ===
            "missions"
        ) {

            this.showMissions();

            return;

        }

        if (
            action ===
            "inventory"
        ) {

            this.showInventory();

            return;

        }

        if (
            action ===
            "save"
        ) {

            if (
                UC.save
            ) {

                UC.save.save();

            }

            return;

        }

        if (
            action ===
            "settings"
        ) {

            this.showSettings();

        }

    },

    /* =====================================================
       MISSION MENU
       ===================================================== */

    showMissions() {

        const missions =
            UC.missions
                ? UC.missions.missions
                : [];

        const panel =
            this.createPanel(
                "MISSIONS"
            );

        missions.forEach(
            mission => {

                const done =
                    UC.missions.completed
                        .includes(
                            mission.id
                        );

                const button =
                    document.createElement(
                        "button"
                    );

                button.style.width =
                    "100%";

                button.style.padding =
                    "14px";

                button.style.marginTop =
                    "8px";

                button.style.border =
                    "1px solid rgba(255,255,255,.1)";

                button.style.borderRadius =
                    "10px";

                button.style.background =
                    "rgba(255,255,255,.06)";

                button.style.color =
                    "#fff";

                button.style.textAlign =
                    "left";

                button.innerHTML =

                    `<b>
                        ${mission.title}
                    </b>

                    <br>

                    <small style="
                        opacity:.6;
                    ">
                        ${done
                            ? "COMPLETED"
                            : mission.description}
                    </small>`;

                if (
                    !done
                ) {

                    button.onclick =
                        () => {

                            UC.missions
                                .startMission(
                                    mission.id
                                );

                            panel.remove();

                        };

                }

                panel
                    .querySelector(
                        ".panel-content"
                    )
                    .appendChild(
                        button
                    );

            }
        );

    },

    /* =====================================================
       INVENTORY
       ===================================================== */

    showInventory() {

        const panel =
            this.createPanel(
                "INVENTORY"
            );

        const inventory =
            UC.shops
                ? UC.shops.inventory
                : [];

        const content =
            panel.querySelector(
                ".panel-content"
            );

        if (
            inventory.length ===
            0
        ) {

            content.innerHTML +=

                `<div style="
                    margin-top:20px;
                    opacity:.55;
                ">
                    Inventory empty.
                </div>`;

            return;

        }

        inventory.forEach(
            item => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.style.marginTop =
                    "8px";

                row.style.padding =
                    "13px";

                row.style.borderRadius =
                    "9px";

                row.style.background =
                    "rgba(255,255,255,.06)";

                row.textContent =
                    item.name;

                content.appendChild(
                    row
                );

            }
        );

    },

    /* =====================================================
       SETTINGS
       ===================================================== */

    showSettings() {

        const panel =
            this.createPanel(
                "SETTINGS"
            );

        const content =
            panel.querySelector(
                ".panel-content"
            );

        content.innerHTML +=

            `<div style="
                margin-top:20px;
                opacity:.7;
                line-height:1.7;
            ">
                Graphics and control settings
                will be available here.
                <br><br>
                The game automatically adapts
                to computer and touch devices.
            </div>`;

    },

    /* =====================================================
       PANEL
       ===================================================== */

    createPanel(
        title
    ) {

        const panel =
            document.createElement(
                "div"
            );

        panel.style.position =
            "fixed";

        panel.style.inset =
            "0";

        panel.style.zIndex =
            "1000";

        panel.style.background =
            "rgba(5,7,10,.97)";

        panel.style.color =
            "#fff";

        panel.style.fontFamily =
            "Arial,sans-serif";

        panel.innerHTML =

            `<div style="
                width:min(650px,90vw);
                margin:0 auto;
                padding-top:8vh;
            ">

                <button
                    class="panel-close"
                    style="
                        float:right;
                        width:40px;
                        height:40px;
                        border:0;
                        border-radius:50%;
                        background:rgba(255,255,255,.1);
                        color:#fff;
                        font-size:20px;
                    "
                >
                    ×
                </button>

                <div style="
                    font-size:34px;
                    font-weight:900;
                ">
                    ${title}
                </div>

                <div
                    class="panel-content"
                    style="
                        margin-top:20px;
                        max-height:70vh;
                        overflow:auto;
                    "
                >
                </div>

            </div>`;

        document.body.appendChild(
            panel
        );

        panel
            .querySelector(
                ".panel-close"
            )
            .onclick =
                () => panel.remove();

        return panel;

    },

    /* =====================================================
       HUD
       ===================================================== */

    createHUD() {

        const hud =
            document.createElement(
                "div"
            );

        hud.id =
            "game-hud";

        hud.style.position =
            "fixed";

        hud.style.left =
            "20px";

        hud.style.bottom =
            "20px";

        hud.style.zIndex =
            "40";

        hud.style.color =
            "#fff";

        hud.style.font =
            "900 13px Arial";

        hud.innerHTML =

            `<div>
                HEALTH
            </div>

            <div style="
                width:190px;
                height:8px;
                margin-top:5px;
                background:
                    rgba(255,255,255,.2);
                border-radius:5px;
                overflow:hidden;
            ">
                <div
                    id="health-bar"
                    style="
                        width:100%;
                        height:100%;
                        background:#fff;
                    "
                ></div>
            </div>

            <div style="
                margin-top:9px;
            ">
                ARMOR
            </div>

            <div style="
                width:190px;
                height:6px;
                margin-top:5px;
                background:
                    rgba(255,255,255,.2);
                border-radius:5px;
                overflow:hidden;
            ">
                <div
                    id="armor-bar"
                    style="
                        width:0%;
                        height:100%;
                        background:#8db4d8;
                    "
                ></div>
            </div>`;

        document.body.appendChild(
            hud
        );

    },

    /* =====================================================
       HUD UPDATE
       ===================================================== */

    updateHUD() {

        if (
            !UC.player
        ) {

            return;

        }

        const health =
            Math.max(
                0,
                Math.min(
                    100,
                    UC.player.health ??
                    100
                )
            );

        const armor =
            Math.max(
                0,
                Math.min(
                    100,
                    UC.player.armor ??
                    0
                )
            );

        const healthBar =
            document.getElementById(
                "health-bar"
            );

        const armorBar =
            document.getElementById(
                "armor-bar"
            );

        if (
            healthBar
        ) {

            healthBar.style.width =
                health +
                "%";

        }

        if (
            armorBar
        ) {

            armorBar.style.width =
                armor +
                "%";

        }

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

        this.updateHUD();

    }

};

UC.registerModule(
    "ui",
    GameUI
);

GameUI.init();
