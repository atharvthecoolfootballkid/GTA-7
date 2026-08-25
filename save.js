/* =========================================================
   ULTIMATE CITY — SAVE / LOAD SYSTEM
   ========================================================= */

const UC = window.UltimateCity;

const SaveSystem = {

    initialized: false,

    slot: "ultimate_city_save",

    autoSaveTimer: 0,

    autoSaveInterval: 20,

    init() {

        this.load();

        this.setupEvents();

        this.initialized = true;

        console.log(
            "Save system initialized."
        );

    },

    /* =====================================================
       COLLECT GAME STATE
       ===================================================== */

    collect() {

        const state = {

            version:
                "1.0",

            savedAt:
                Date.now(),

            player: null,

            economy: null,

            inventory: null,

            missions: null,

            settings: null

        };

        /* PLAYER */

        if (
            UC.player
        ) {

            state.player = {

                x:
                    UC.player.position
                        ? UC.player.position.x
                        : 0,

                y:
                    UC.player.position
                        ? UC.player.position.y
                        : 0,

                z:
                    UC.player.position
                        ? UC.player.position.z
                        : 0,

                rotation:
                    UC.player.rotation ||
                    0,

                pitch:
                    UC.player.pitch ||
                    0,

                health:
                    UC.player.health ??
                    100,

                armor:
                    UC.player.armor ??
                    0

            };

        }

        /* ECONOMY */

        if (
            UC.economy
        ) {

            state.economy = {

                money:
                    UC.economy.money,

                xp:
                    UC.economy.xp,

                level:
                    UC.economy.level,

                properties:
                    UC.economy.properties

            };

        }

        /* INVENTORY */

        if (
            UC.shops
        ) {

            state.inventory =
                UC.shops.inventory;

        }

        /* MISSIONS */

        if (
            UC.missions
        ) {

            state.missions = {

                completed:
                    UC.missions.completed,

                active:
                    UC.missions.activeMission
                        ? UC.missions.activeMission.id
                        : null

            };

        }

        return state;

    },

    /* =====================================================
       SAVE
       ===================================================== */

    save(
        silent = false
    ) {

        const state =
            this.collect();

        try {

            localStorage.setItem(

                this.slot,

                JSON.stringify(
                    state
                )

            );

            if (
                !silent
            ) {

                this.showMessage(
                    "GAME SAVED"
                );

            }

            return true;

        } catch (
            error
        ) {

            console.error(
                "Save failed:",
                error
            );

            return false;

        }

    },

    /* =====================================================
       LOAD
       ===================================================== */

    load() {

        try {

            const raw =
                localStorage.getItem(
                    this.slot
                );

            if (
                !raw
            ) {

                return false;

            }

            const state =
                JSON.parse(
                    raw
                );

            this.apply(
                state
            );

            return true;

        } catch (
            error
        ) {

            console.warn(
                "Save data could not be loaded.",
                error
            );

            return false;

        }

    },

    /* =====================================================
       APPLY STATE
       ===================================================== */

    apply(
        state
    ) {

        if (
            !state
        ) {

            return;

        }

        /* PLAYER */

        if (
            state.player &&
            UC.player
        ) {

            const p =
                state.player;

            if (
                UC.player.position
            ) {

                UC.player.position.set(

                    p.x || 0,

                    p.y || 0,

                    p.z || 0

                );

            }

            UC.player.rotation =
                p.rotation ||
                0;

            UC.player.pitch =
                p.pitch ||
                0;

            if (
                p.health !==
                undefined
            ) {

                UC.player.health =
                    p.health;

            }

            if (
                p.armor !==
                undefined
            ) {

                UC.player.armor =
                    p.armor;

            }

        }

        /* ECONOMY */

        if (
            state.economy &&
            UC.economy
        ) {

            UC.economy.money =
                state.economy.money ||
                0;

            UC.economy.xp =
                state.economy.xp ||
                0;

            UC.economy.level =
                state.economy.level ||
                1;

            UC.economy.properties =
                state.economy.properties ||
                [];

            UC.economy.save();

        }

        /* INVENTORY */

        if (
            state.inventory &&
            UC.shops
        ) {

            UC.shops.inventory =
                state.inventory;

            UC.shops.save();

        }

        /* MISSIONS */

        if (
            state.missions &&
            UC.missions
        ) {

            UC.missions.completed =
                state.missions.completed ||
                [];

            UC.missions.activeMission =
                null;

            if (
                state.missions.active
            ) {

                UC.missions.startMission(
                    state.missions.active
                );

            }

        }

    },

    /* =====================================================
       AUTO SAVE
       ===================================================== */

    update(
        delta
    ) {

        if (
            !this.initialized
        ) {

            return;

        }

        this.autoSaveTimer +=
            delta;

        if (
            this.autoSaveTimer >=
            this.autoSaveInterval
        ) {

            this.autoSaveTimer =
                0;

            this.save(
                true
            );

        }

    },

    /* =====================================================
       EVENTS
       ===================================================== */

    setupEvents() {

        window.addEventListener(
            "beforeunload",
            () => {

                this.save(
                    true
                );

            }
        );

        window.addEventListener(
            "keydown",
            event => {

                if (
                    event.code ===
                    "F5"
                ) {

                    event.preventDefault();

                    this.save();

                }

            }
        );

    },

    /* =====================================================
       DELETE
       ===================================================== */

    reset() {

        const confirmed =
            window.confirm(
                "Delete your saved game?"
            );

        if (
            !confirmed
        ) {

            return;

        }

        localStorage.removeItem(
            this.slot
        );

        this.showMessage(
            "SAVE DELETED"
        );

        setTimeout(
            () => {

                location.reload();

            },
            800
        );

    },

    /* =====================================================
       STATUS
       ===================================================== */

    hasSave() {

        return !!localStorage.getItem(
            this.slot
        );

    },

    /* =====================================================
       MESSAGE
       ===================================================== */

    showMessage(
        text
    ) {

        const box =
            document.createElement(
                "div"
            );

        box.style.position =
            "fixed";

        box.style.left =
            "50%";

        box.style.top =
            "80px";

        box.style.transform =
            "translateX(-50%)";

        box.style.zIndex =
            "999";

        box.style.padding =
            "11px 20px";

        box.style.borderRadius =
            "10px";

        box.style.background =
            "rgba(0,0,0,.82)";

        box.style.color =
            "#fff";

        box.style.font =
            "900 13px Arial";

        box.textContent =
            text;

        document.body.appendChild(
            box
        );

        setTimeout(
            () => {

                box.remove();

            },
            1800
        );

    }

};

UC.registerModule(
    "save",
    SaveSystem
);

SaveSystem.init();
