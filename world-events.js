/* =========================================================
   ULTIMATE WORLD — WORLD EVENTS
   Dynamic Events • Traffic • Emergencies • Random Events
   ========================================================= */

(() => {

"use strict";

const UC =
    window.UltimateCity ||
    window.UltimateWorld;

if (!UC) {
    console.error("World events could not start.");
    return;
}

const WorldEvents = {

    initialized: false,

    active: [],

    cooldown: 0,

    eventTypes: [
        "traffic",
        "delivery",
        "street",
        "weather"
    ],

    init() {

        this.initialized = true;

        this.cooldown =
            8;

        console.log(
            "World events initialized."
        );

    },

    /* =====================================================
       CREATE EVENT
       ===================================================== */

    createEvent() {

        const type =
            this.eventTypes[
                Math.floor(
                    Math.random() *
                    this.eventTypes.length
                )
            ];

        const event = {

            id:
                "event_" +
                Date.now() +
                "_" +
                Math.floor(
                    Math.random() *
                    9999
                ),

            type,

            time:
                0,

            duration:
                30 +
                Math.random() *
                60,

            completed:false

        };

        this.active.push(
            event
        );

        this.emit(
            "eventStarted",
            event
        );

        return event;

    },

    /* =====================================================
       EVENTS
       ===================================================== */

    updateEvent(
        event,
        delta
    ) {

        event.time +=
            delta;

        switch(
            event.type
        ) {

            case "traffic":

                this.trafficEvent(
                    event
                );

                break;

            case "delivery":

                this.deliveryEvent(
                    event
                );

                break;

            case "street":

                this.streetEvent(
                    event
                );

                break;

            case "weather":

                this.weatherEvent(
                    event
                );

                break;

        }

        if (
            event.time >=
            event.duration
        ) {

            this.finishEvent(
                event
            );

        }

    },

    /* =====================================================
       TRAFFIC
       ===================================================== */

    trafficEvent(
        event
    ) {

        const vehicles =
            UC.modules &&
            UC.modules.vehicles;

        if (
            !vehicles
        ) {

            return;

        }

        /*
         * The event itself does not
         * require additional assets.
         * Existing traffic systems can
         * react to this event.
         */

        if (
            event.time < 1
        ) {

            this.notify(
                "Traffic is getting heavier."
            );

        }

    },

    /* =====================================================
       DELIVERY
       ===================================================== */

    deliveryEvent(
        event
    ) {

        if (
            event.time < 1
        ) {

            this.notify(
                "A delivery event has appeared."
            );

        }

    },

    /* =====================================================
       STREET EVENT
       ===================================================== */

    streetEvent(
        event
    ) {

        if (
            event.time < 1
        ) {

            this.notify(
                "Something is happening nearby."
            );

        }

    },

    /* =====================================================
       WEATHER EVENT
       ===================================================== */

    weatherEvent(
        event
    ) {

        const weather =
            UC.modules &&
            UC.modules.weather;

        if (
            !weather
        ) {

            return;

        }

        if (
            event.time < 1
        ) {

            this.notify(
                "Weather conditions are changing."
            );

        }

    },

    /* =====================================================
       FINISH
       ===================================================== */

    finishEvent(
        event
    ) {

        if (
            event.completed
        ) {

            return;

        }

        event.completed =
            true;

        this.emit(
            "eventFinished",
            event
        );

        const index =
            this.active.indexOf(
                event
            );

        if (
            index >= 0
        ) {

            this.active.splice(
                index,
                1
            );

        }

    },

    /* =====================================================
       NOTIFICATION
       ===================================================== */

    notify(
        message
    ) {

        const ui =
            UC.modules &&
            UC.modules.ui;

        if (
            ui &&
            typeof ui.notify ===
            "function"
        ) {

            ui.notify(
                message
            );

        }

    },

    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    listeners: [],

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
                        "World event listener error:",
                        error
                    );

                }

            }

        }

        window.dispatchEvent(
            new CustomEvent(
                "ultimateworld:" +
                event,
                {
                    detail:data
                }
            )
        );

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(
        delta
    ) {

        if (
            !this.initialized
        ) {

            return;

        }

        this.cooldown -=
            delta;

        /*
         * Random event generation.
         * Kept deliberately controlled
         * so the world does not become
         * chaotic.
         */

        if (
            this.cooldown <= 0
        ) {

            if (
                this.active.length <
                3
            ) {

                if (
                    Math.random() <
                    0.35
                ) {

                    this.createEvent();

                }

            }

            this.cooldown =
                10 +
                Math.random() *
                20;

        }

        for (
            const event
            of [
                ...this.active
            ]
        ) {

            this.updateEvent(
                event,
                delta
            );

        }

    }

};

if (
    typeof UC.registerModule ===
    "function"
) {

    UC.registerModule(
        "world-events",
        WorldEvents
    );

}

function boot() {

    if (
        WorldEvents.initialized
    ) {

        return;

    }

    try {

        WorldEvents.init();

    }

    catch (
        error
    ) {

        console.error(
            "World events initialization error:",
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
                3100
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
        3100
    );

}

})();
