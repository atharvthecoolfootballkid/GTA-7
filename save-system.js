/* =========================================================
   ULTIMATE WORLD — SAVE SYSTEM
   Auto Save • Player Data • Settings • Missions • Vehicles
   ========================================================= */

(() => {

"use strict";

const UC =
    window.UltimateCity ||
    window.UltimateWorld;

if (!UC) {
    console.error("Save system could not start.");
    return;
}

const SaveSystem = {

    initialized:false,

    KEY:
        "ULTIMATE_WORLD_SAVE_V1",

    interval:null,

    autoSaveSeconds:10,

    init(){

        this.load();

        this.startAutoSave();

        this.initialized=true;

        console.log(
            "Save system initialized."
        );

    },

    /* =====================================================
       COLLECT DATA
       ===================================================== */

    collect(){

        const data = {

            version:1,

            savedAt:
                Date.now(),

            player:this.getPlayerData(),

            profile:this.getProfileData(),

            settings:this.getSettingsData(),

            missions:this.getMissionData(),

            vehicles:this.getVehicleData(),

            world:this.getWorldData()

        };

        return data;

    },

    /* =====================================================
       PLAYER
       ===================================================== */

    getPlayerData(){

        const player =
            UC.player ||
            window.player;

        if(
            !player ||
            !player.position
        ){

            return null;

        }

        return {

            x:
                player.position.x,

            y:
                player.position.y,

            z:
                player.position.z,

            rotation:
                player.rotation
                    ? player.rotation.y
                    : 0

        };

    },

    /* =====================================================
       PROFILE
       ===================================================== */

    getProfileData(){

        if(
            UC.profile
        ){

            return {
                ...UC.profile
            };

        }

        if(
            UC.playerData
        ){

            return {
                ...UC.playerData
            };

        }

        return {};

    },

    /* =====================================================
       SETTINGS
       ===================================================== */

    getSettingsData(){

        try{

            const settings =
                localStorage.getItem(
                    "UW_SETTINGS"
                );

            return settings
                ? JSON.parse(settings)
                : {};

        }

        catch(error){

            return {};

        }

    },

    /* =====================================================
       MISSIONS
       ===================================================== */

    getMissionData(){

        const missions =
            UC.modules &&
            UC.modules[
                "mission-engine"
            ];

        if(
            !missions
        ){

            return {};

        }

        return {

            active:
                missions.getCurrentMission(),

            completed:
                missions.getCompletedMissions()

        };

    },

    /* =====================================================
       VEHICLES
       ===================================================== */

    getVehicleData(){

        const vehicles =
            UC.modules &&
            UC.modules.vehicles;

        if(
            !vehicles
        ){

            return {};

        }

        const list=[];

        for(
            const vehicle
            of vehicles.vehicles
        ){

            if(
                !vehicle ||
                !vehicle.position
            ){

                continue;

            }

            list.push({

                x:
                    vehicle.position.x,

                y:
                    vehicle.position.y,

                z:
                    vehicle.position.z,

                rotation:
                    vehicle.rotation
                        ? vehicle.rotation.y
                        : 0,

                speed:
                    vehicle.userData &&
                    vehicle.userData.vehicle
                        ? vehicle
                            .userData
                            .vehicle
                            .speed
                        : 0

            });

        }

        return list;

    },

    /* =====================================================
       WORLD
       ===================================================== */

    getWorldData(){

        const weather =
            UC.modules &&
            UC.modules.weather;

        return {

            time:
                weather &&
                typeof weather.time ===
                "number"
                    ? weather.time
                    : 12,

            weather:
                weather &&
                weather.weather
                    ? weather.weather
                    : "clear"

        };

    },

    /* =====================================================
       SAVE
       ===================================================== */

    save(){

        try{

            const data =
                this.collect();

            localStorage.setItem(
                this.KEY,
                JSON.stringify(
                    data
                )
            );

            this.showSaved();

            return true;

        }

        catch(error){

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

    load(){

        try{

            const raw =
                localStorage.getItem(
                    this.KEY
                );

            if(
                !raw
            ){

                return false;

            }

            const data =
                JSON.parse(
                    raw
                );

            this.restorePlayer(
                data.player
            );

            this.restoreProfile(
                data.profile
            );

            this.restoreSettings(
                data.settings
            );

            this.restoreMissions(
                data.missions
            );

            this.restoreWorld(
                data.world
            );

            console.log(
                "Ultimate World save loaded."
            );

            return true;

        }

        catch(error){

            console.error(
                "Load failed:",
                error
            );

            return false;

        }

    },

    /* =====================================================
       RESTORE PLAYER
       ===================================================== */

    restorePlayer(
        data
    ){

        if(
            !data
        ){

            return;

        }

        const player =
            UC.player ||
            window.player;

        if(
            !player ||
            !player.position
        ){

            return;

        }

        player.position.set(
            data.x || 0,
            data.y || 0,
            data.z || 0
        );

        if(
            player.rotation
        ){

            player.rotation.y =
                data.rotation || 0;

        }

    },

    /* =====================================================
       RESTORE PROFILE
       ===================================================== */

    restoreProfile(
        data
    ){

        if(
            !data
        ){

            return;

        }

        if(
            UC.profile
        ){

            Object.assign(
                UC.profile,
                data
            );

        }

        if(
            UC.playerData
        ){

            Object.assign(
                UC.playerData,
                data
            );

        }

    },

    /* =====================================================
       RESTORE SETTINGS
       ===================================================== */

    restoreSettings(
        data
    ){

        if(
            !data
        ){

            return;

        }

        try{

            localStorage.setItem(
                "UW_SETTINGS",
                JSON.stringify(
                    data
                )
            );

        }

        catch(error){}

    },

    /* =====================================================
       RESTORE MISSIONS
       ===================================================== */

    restoreMissions(
        data
    ){

        if(
            !data
        ){

            return;

        }

        const missions =
            UC.modules &&
            UC.modules[
                "mission-engine"
            ];

        if(
            !missions
        ){

            return;

        }

        if(
            Array.isArray(
                data.completed
            )
        ){

            missions.completed =
                data.completed;

        }

        if(
            data.active
        ){

            missions.activeMission =
                data.active;

        }

    },

    /* =====================================================
       RESTORE WORLD
       ===================================================== */

    restoreWorld(
        data
    ){

        if(
            !data
        ){

            return;

        }

        const weather =
            UC.modules &&
            UC.modules.weather;

        if(
            weather
        ){

            if(
                typeof data.time ===
                "number"
            ){

                weather.time =
                    data.time;

            }

            if(
                data.weather
            ){

                weather.weather =
                    data.weather;

            }

        }

    },

    /* =====================================================
       AUTO SAVE
       ===================================================== */

    startAutoSave(){

        clearInterval(
            this.interval
        );

        this.interval =
            setInterval(
                () => {

                    if(
                        this.initialized
                    ){

                        this.save();

                    }

                },
                this.autoSaveSeconds*
                1000
            );

    },

    /* =====================================================
       DELETE SAVE
       ===================================================== */

    deleteSave(){

        try{

            localStorage.removeItem(
                this.KEY
            );

            console.log(
                "Save deleted."
            );

            return true;

        }

        catch(error){

            return false;

        }

    },

    /* =====================================================
       SAVE STATUS
       ===================================================== */

    hasSave(){

        try{

            return !!localStorage.getItem(
                this.KEY
            );

        }

        catch(error){

            return false;

        }

    },

    /* =====================================================
       UI
       ===================================================== */

    showSaved(){

        const ui =
            UC.modules &&
            UC.modules.ui;

        if(
            ui &&
            typeof ui.notify ===
            "function"
        ){

            ui.notify(
                "Game saved"
            );

        }

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(){

        /*
         * Auto-save is handled by
         * the interval.
         */

    }

};

if(
    typeof UC.registerModule ===
    "function"
){

    UC.registerModule(
        "save-system",
        SaveSystem
    );

}

function boot(){

    if(
        SaveSystem.initialized
    ){

        return;

    }

    try{

        SaveSystem.init();

    }

    catch(error){

        console.error(
            "Save system initialization error:",
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
                2700
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
        2700
    );

}

})();
