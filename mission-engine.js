/* =========================================================
   ULTIMATE WORLD — MISSION ENGINE
   Missions • Objectives • Rewards • Progress • Checkpoints
   ========================================================= */

(() => {

"use strict";

const UC =
    window.UltimateCity ||
    window.UltimateWorld;

if (!UC) {
    console.error("Mission engine could not start.");
    return;
}

const MissionEngine = {

    initialized: false,

    activeMission: null,

    completed: [],

    missions: {},

    progress: {},

    listeners: [],

    init() {

        this.load();

        this.createMissions();

        this.initialized = true;

        console.log(
            "Mission engine initialized."
        );

    },

    /* =====================================================
       MISSION DATABASE
       ===================================================== */

    createMissions() {

        this.missions = {

            welcome: {

                id: "welcome",

                title: "Welcome to the City",

                description:
                    "Explore the city and reach the first waypoint.",

                objectives: [

                    {
                        id: "reach_waypoint",
                        type: "distance",
                        target: 100,
                        current: 0,
                        label: "Travel 100 metres"
                    }

                ],

                reward: {
                    money: 250,
                    xp: 100
                }

            },

            city_explorer: {

                id: "city_explorer",

                title: "City Explorer",

                description:
                    "Visit different parts of the city.",

                objectives: [

                    {
                        id: "travel",
                        type: "distance",
                        target: 1000,
                        current: 0,
                        label: "Travel 1 kilometre"
                    },

                    {
                        id: "time",
                        type: "time",
                        target: 60,
                        current: 0,
                        label: "Stay in the city for 60 seconds"
                    }

                ],

                reward: {
                    money: 750,
                    xp: 300
                }

            },

            traffic_runner: {

                id: "traffic_runner",

                title: "Traffic Runner",

                description:
                    "Drive or travel across the city without stopping.",

                objectives: [

                    {
                        id: "distance",
                        type: "distance",
                        target: 2500,
                        current: 0,
                        label: "Travel 2.5 kilometres"
                    }

                ],

                reward: {
                    money: 1200,
                    xp: 500
                }

            },

            night_drive: {

                id: "night_drive",

                title: "Night Drive",

                description:
                    "Explore the city after dark.",

                objectives: [

                    {
                        id: "night",
                        type: "night",
                        target: 45,
                        current: 0,
                        label: "Stay out at night"
                    }

                ],

                reward: {
                    money: 900,
                    xp: 400
                }

            },

            storm_survivor: {

                id: "storm_survivor",

                title: "Storm Survivor",

                description:
                    "Keep moving while the weather system is active.",

                objectives: [

                    {
                        id: "storm",
                        type: "weather",
                        target: 45,
                        current: 0,
                        label: "Survive the storm"
                    }

                ],

                reward: {
                    money: 1500,
                    xp: 650
                }

            }

        };

    },

    /* =====================================================
       START
       ===================================================== */

    startMission(
        id
    ) {

        const mission =
            this.missions[id];

        if (!mission) {

            console.warn(
                "Mission not found:",
                id
            );

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
            this.cloneMission(
                mission
            );

        this.progress = {};

        for (
            const objective
            of this.activeMission.objectives
        ) {

            this.progress[
                objective.id
            ] = 0;

        }

        this.emit(
            "missionStarted",
            this.activeMission
        );

        return true;

    },

    /* =====================================================
       CLONE
       ===================================================== */

    cloneMission(
        mission
    ) {

        return JSON.parse(
            JSON.stringify(
                mission
            )
        );

    },

    /* =====================================================
       OBJECTIVE PROGRESS
       ===================================================== */

    addProgress(
        objectiveId,
        amount
    ) {

        if (
            !this.activeMission
        ) {

            return;

        }

        const objective =
            this.activeMission.objectives
            .find(
                item =>
                    item.id ===
                    objectiveId
            );

        if (!objective) {

            return;

        }

        objective.current =
            Math.min(
                objective.target,
                objective.current +
                amount
            );

        this.progress[
            objectiveId
        ] =
            objective.current;

        this.emit(
            "objectiveUpdated",
            {
                mission:
                    this.activeMission,
                objective
            }
        );

        this.checkCompletion();

    },

    /* =====================================================
       GENERIC EVENT
       ===================================================== */

    updateEvent(
        type,
        amount = 1
    ) {

        if (
            !this.activeMission
        ) {

            return;

        }

        for (
            const objective
            of this.activeMission.objectives
        ) {

            if (
                objective.type ===
                type
            ) {

                this.addProgress(
                    objective.id,
                    amount
                );

            }

        }

    },

    /* =====================================================
       DISTANCE
       ===================================================== */

    updateDistance(
        distance
    ) {

        this.updateEvent(
            "distance",
            distance
        );

    },

    /* =====================================================
       TIME
       ===================================================== */

    updateTime(
        delta
    ) {

        this.updateEvent(
            "time",
            delta
        );

    },

    /* =====================================================
       WEATHER
       ===================================================== */

    updateWeather(
        weather,
        delta
    ) {

        if (
            weather ===
            "storm"
        ) {

            this.updateEvent(
                "weather",
                delta
            );

        }

    },

    /* =====================================================
       NIGHT
       ===================================================== */

    updateNight(
        isNight,
        delta
    ) {

        if (
            isNight
        ) {

            this.updateEvent(
                "night",
                delta
            );

        }

    },

    /* =====================================================
       CHECK COMPLETION
       ===================================================== */

    checkCompletion() {

        if (
            !this.activeMission
        ) {

            return;

        }

        const finished =
            this.activeMission.objectives
            .every(
                objective =>
                    objective.current >=
                    objective.target
            );

        if (
            finished
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

        this.giveReward(
            mission.reward
        );

        this.emit(
            "missionCompleted",
            mission
        );

        this.activeMission =
            null;

        this.progress = {};

        this.save();

    },

    /* =====================================================
       REWARDS
       ===================================================== */

    giveReward(
        reward
    ) {

        if (!reward) {

            return;

        }

        if (
            reward.money
        ) {

            if (
                typeof UC.addMoney ===
                "function"
            ) {

                UC.addMoney(
                    reward.money
                );

            }

            else if (
                UC.playerData
            ) {

                UC.playerData.money =
                    (
                        UC.playerData.money ||
                        0
                    ) +
                    reward.money;

            }

        }

        if (
            reward.xp
        ) {

            if (
                typeof UC.addXP ===
                "function"
            ) {

                UC.addXP(
                    reward.xp
                );

            }

            else if (
                UC.profile
            ) {

                UC.profile.xp =
                    (
                        UC.profile.xp ||
                        0
                    ) +
                    reward.xp;

            }

        }

    },

    /* =====================================================
       CANCEL
       ===================================================== */

    cancelMission() {

        if (
            !this.activeMission
        ) {

            return;

        }

        const mission =
            this.activeMission;

        this.activeMission =
            null;

        this.progress = {};

        this.emit(
            "missionCancelled",
            mission
        );

    },

    /* =====================================================
       CURRENT MISSION
       ===================================================== */

    getCurrentMission() {

        return this.activeMission;

    },

    getMission(
        id
    ) {

        return this.missions[id] ||
            null;

    },

    getAllMissions() {

        return Object.values(
            this.missions
        );

    },

    getCompletedMissions() {

        return [
            ...this.completed
        ];

    },

    /* =====================================================
       LISTENERS
       ===================================================== */

    on(
        event,
        callback
    ) {

        this.listeners.push({
            event,
            callback
        });

    },

    emit(
        event,
        data
    ) {

        for (
            const listener
            of this.listeners
        ) {

            if (
                listener.event ===
                event
            ) {

                try {

                    listener.callback(
                        data
                    );

                }

                catch (
                    error
                ) {

                    console.error(
                        "Mission listener error:",
                        error
                    );

                }

            }

        }

        window.dispatchEvent(
            new CustomEvent(
                "ultimateworld:" + event,
                {
                    detail:data
                }
            )
        );

    },

    /* =====================================================
       SAVE
       ===================================================== */

    save() {

        const data = {

            completed:
                this.completed,

            active:
                this.activeMission

        };

        try {

            localStorage.setItem(
                "UW_MISSIONS",
                JSON.stringify(
                    data
                )
            );

        }

        catch (
            error
        ) {

            console.warn(
                "Could not save missions.",
                error
            );

        }

    },

    /* =====================================================
       LOAD
       ===================================================== */

    load() {

        try {

            const raw =
                localStorage.getItem(
                    "UW_MISSIONS"
                );

            if (!raw) {

                return;

            }

            const data =
                JSON.parse(
                    raw
                );

            if (
                Array.isArray(
                    data.completed
                )
            ) {

                this.completed =
                    data.completed;

            }

            if (
                data.active
            ) {

                this.activeMission =
                    data.active;

                for (
                    const objective
                    of this.activeMission.objectives
                ) {

                    this.progress[
                        objective.id
                    ] =
                        objective.current;

                }

            }

        }

        catch (
            error
        ) {

            console.warn(
                "Could not load missions.",
                error
            );

        }

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(
        delta
    ) {

        if (
            !this.initialized ||
            !this.activeMission
        ) {

            return;

        }

        this.updateTime(
            delta
        );

        const weather =
            UC.modules &&
            UC.modules.weather;

        if (
            weather
        ) {

            const isNight =
                weather.time <
                6 ||
                weather.time >
                19;

            this.updateNight(
                isNight,
                delta
            );

            this.updateWeather(
                weather.weather,
                delta
            );

        }

        this.save();

    }

};

if (
    typeof UC.registerModule ===
    "function"
) {

    UC.registerModule(
        "mission-engine",
        MissionEngine
    );

}

function boot() {

    if (
        MissionEngine.initialized
    ) {

        return;

    }

    try {

        MissionEngine.init();

    }

    catch (
        error
    ) {

        console.error(
            "Mission engine initialization error:",
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
                1900
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
        1900
    );

}

})();
