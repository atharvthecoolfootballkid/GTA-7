/* =========================================================
   ULTIMATE CITY — MISSION SYSTEM
   Story • Objectives • Rewards • Mission Tracking
   ========================================================= */

const UC = window.UltimateCity;

const MissionSystem = {

    initialized: false,

    activeMission: null,

    completed: [],

    missions: [],

    init() {

        this.createMissions();

        this.createMissionHUD();

        this.initialized = true;

        console.log(
            "Mission system initialized."
        );

    },

    /* =====================================================
       MISSION DATABASE
       ===================================================== */

    createMissions() {

        this.missions = [

            {
                id:
                    "first-drive",

                title:
                    "FIRST MOVE",

                description:
                    "Explore the city and reach the marked destination.",

                objective:
                    "Reach the destination",

                reward:
                    500,

                type:
                    "travel",

                target:
                    {
                        x: 260,
                        z: 180
                    },

                radius:
                    12
            },

            {
                id:
                    "night-run",

                title:
                    "NIGHT RUN",

                description:
                    "Take a vehicle to the industrial district.",

                objective:
                    "Reach the industrial district",

                reward:
                    1000,

                type:
                    "drive",

                target:
                    {
                        x: -520,
                        z: 420
                    },

                radius:
                    16
            },

            {
                id:
                    "escape",

                title:
                    "HOT STREET",

                description:
                    "Lose the police pursuit.",

                objective:
                    "Lose your wanted level",

                reward:
                    1500,

                type:
                    "escape",

                requiredWanted:
                    2
            },

            {
                id:
                    "summit",

                title:
                    "THE SUMMIT",

                description:
                    "Reach the observation tower.",

                objective:
                    "Reach the tower",

                reward:
                    2500,

                type:
                    "travel",

                target:
                    {
                        x: -650,
                        z: 520
                    },

                radius:
                    25
            }

        ];

    },

    /* =====================================================
       START
       ===================================================== */

    startMission(id) {

        const mission =
            this.missions.find(
                m => m.id === id
            );

        if (
            !mission
        ) {

            return false;

        }

        if (
            this.completed.includes(
                id
            )
        ) {

            return false;

        }

        this.activeMission =
            mission;

        this.updateHUD();

        return true;

    },

    startNextMission() {

        const mission =
            this.missions.find(
                m =>
                    !this.completed.includes(
                        m.id
                    )
            );

        if (
            mission
        ) {

            this.startMission(
                mission.id
            );

        }

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(delta) {

        if (
            !this.initialized ||
            !this.activeMission ||
            !UC.player
        ) {

            return;

        }

        const mission =
            this.activeMission;

        if (
            mission.type ===
            "travel" ||
            mission.type ===
            "drive"
        ) {

            this.checkDestination(
                mission
            );

        }

        if (
            mission.type ===
            "escape"
        ) {

            this.checkEscape(
                mission
            );

        }

    },

    /* =====================================================
       DESTINATION
       ===================================================== */

    checkDestination(
        mission
    ) {

        const dx =
            UC.player.position.x -
            mission.target.x;

        const dz =
            UC.player.position.z -
            mission.target.z;

        const distance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        if (
            distance <=
            mission.radius
        ) {

            this.completeMission();

        }

    },

    /* =====================================================
       ESCAPE
       ===================================================== */

    checkEscape(
        mission
    ) {

        if (
            !UC.police
        ) {

            return;

        }

        if (
            UC.police.wantedLevel ===
            0
        ) {

            this.completeMission();

        }

    },

    /* =====================================================
       COMPLETE
       ===================================================== */

    completeMission() {

        if (
            !this.activeMission
        ) {

            return;

        }

        const mission =
            this.activeMission;

        if (
            !this.completed.includes(
                mission.id
            )
        ) {

            this.completed.push(
                mission.id
            );

        }

        this.reward(
            mission.reward
        );

        this.showComplete(
            mission
        );

        this.activeMission =
            null;

        this.updateHUD();

    },

    /* =====================================================
       REWARDS
       ===================================================== */

    reward(amount) {

        if (
            !UC.profile
        ) {

            UC.profile = {

                money:
                    0,

                xp:
                    0

            };

        }

        UC.profile.money =
            (
                UC.profile.money ||
                0
            ) +
            amount;

        UC.profile.xp =
            (
                UC.profile.xp ||
                0
            ) +
            Math.floor(
                amount /
                10
            );

        this.saveProfile();

    },

    saveProfile() {

        try {

            localStorage.setItem(

                "ultimate_city_profile",

                JSON.stringify(
                    UC.profile
                )

            );

        } catch (
            error
        ) {

            console.warn(
                "Profile save failed.",
                error
            );

        }

    },

    /* =====================================================
       MISSION MARKER
       ===================================================== */

    getTarget() {

        if (
            !this.activeMission
        ) {

            return null;

        }

        return this.activeMission.target ||
            null;

    },

    /* =====================================================
       HUD
       ===================================================== */

    createMissionHUD() {

        let hud =
            document.getElementById(
                "mission-display"
            );

        if (
            hud
        ) {

            return;

        }

        hud =
            document.createElement(
                "div"
            );

        hud.id =
            "mission-display";

        hud.style.position =
            "fixed";

        hud.style.left =
            "28px";

        hud.style.top =
            "90px";

        hud.style.zIndex =
            "50";

        hud.style.maxWidth =
            "320px";

        hud.style.padding =
            "14px 17px";

        hud.style.borderRadius =
            "10px";

        hud.style.background =
            "rgba(0,0,0,.58)";

        hud.style.backdropFilter =
            "blur(8px)";

        hud.style.color =
            "#fff";

        hud.style.fontFamily =
            "Arial,sans-serif";

        document.body.appendChild(
            hud
        );

        this.updateHUD();

    },

    updateHUD() {

        const hud =
            document.getElementById(
                "mission-display"
            );

        if (
            !hud
        ) {

            return;

        }

        if (
            !this.activeMission
        ) {

            hud.innerHTML =

                `<div style="
                    font-size:12px;
                    opacity:.65;
                    letter-spacing:2px;
                ">
                    MISSIONS
                </div>

                <div style="
                    margin-top:5px;
                    font-size:15px;
                ">
                    No active mission
                </div>`;

            return;

        }

        const mission =
            this.activeMission;

        hud.innerHTML =

            `<div style="
                font-size:11px;
                opacity:.7;
                letter-spacing:2px;
            ">
                CURRENT MISSION
            </div>

            <div style="
                margin-top:4px;
                font-size:20px;
                font-weight:900;
            ">
                ${mission.title}
            </div>

            <div style="
                margin-top:5px;
                font-size:13px;
                opacity:.82;
                line-height:1.4;
            ">
                ${mission.description}
            </div>

            <div style="
                margin-top:9px;
                font-size:13px;
                font-weight:700;
            ">
                ${mission.objective}
            </div>

            <div style="
                margin-top:5px;
                font-size:12px;
                opacity:.7;
            ">
                Reward: $${mission.reward.toLocaleString()}
            </div>`;

    },

    /* =====================================================
       COMPLETION MESSAGE
       ===================================================== */

    showComplete(
        mission
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
            "35%";

        message.style.transform =
            "translate(-50%,-50%)";

        message.style.zIndex =
            "100";

        message.style.padding =
            "24px 38px";

        message.style.borderRadius =
            "14px";

        message.style.background =
            "rgba(0,0,0,.82)";

        message.style.color =
            "#fff";

        message.style.textAlign =
            "center";

        message.style.fontFamily =
            "Arial,sans-serif";

        message.innerHTML =

            `<div style="
                font-size:13px;
                letter-spacing:4px;
                opacity:.7;
            ">
                MISSION COMPLETE
            </div>

            <div style="
                margin-top:8px;
                font-size:30px;
                font-weight:900;
            ">
                ${mission.title}
            </div>

            <div style="
                margin-top:10px;
                font-size:17px;
            ">
                +$${mission.reward.toLocaleString()}
            </div>`;

        document.body.appendChild(
            message
        );

        setTimeout(
            () => {

                message.remove();

            },
            3000
        );

    },

    /* =====================================================
       RESET
       ===================================================== */

    reset() {

        this.activeMission =
            null;

        this.completed = [];

        this.updateHUD();

    }

};

UC.registerModule(
    "missions",
    MissionSystem
);

MissionSystem.init();
