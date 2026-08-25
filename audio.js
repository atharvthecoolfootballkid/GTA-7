/* =========================================================
   ULTIMATE CITY — AUDIO ENGINE
   Dynamic ambience • Vehicle sounds • Police sirens
   ========================================================= */

const UC = window.UltimateCity;

const AudioSystem = {

    initialized: false,

    context: null,

    master: null,

    music: null,

    ambience: null,

    engine: null,

    siren: null,

    started: false,

    init() {

        this.createContext();

        this.initialized = true;

        window.addEventListener(
            "pointerdown",
            () => this.start(),
            { once: true }
        );

        console.log(
            "Audio system initialized."
        );

    },

    createContext() {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {

            return;

        }

        this.context =
            new AudioContext();

        this.master =
            this.context.createGain();

        this.master.gain.value =
            .32;

        this.master.connect(
            this.context.destination
        );

    },

    start() {

        if (
            this.started ||
            !this.context
        ) {

            return;

        }

        if (
            this.context.state ===
            "suspended"
        ) {

            this.context.resume();

        }

        this.started = true;

        this.startAmbience();

    },

    /* =====================================================
       AMBIENCE
       ===================================================== */

    startAmbience() {

        if (
            !this.context
        ) {

            return;

        }

        const oscillator =
            this.context.createOscillator();

        const gain =
            this.context.createGain();

        oscillator.type =
            "sine";

        oscillator.frequency.value =
            55;

        gain.gain.value =
            .018;

        oscillator.connect(
            gain
        );

        gain.connect(
            this.master
        );

        oscillator.start();

        this.ambience = {

            oscillator,

            gain

        };

    },

    /* =====================================================
       ENGINE SOUND
       ===================================================== */

    startEngine() {

        if (
            !this.context ||
            this.engine
        ) {

            return;

        }

        const oscillator =
            this.context.createOscillator();

        const gain =
            this.context.createGain();

        oscillator.type =
            "sawtooth";

        oscillator.frequency.value =
            65;

        gain.gain.value =
            0;

        oscillator.connect(
            gain
        );

        gain.connect(
            this.master
        );

        oscillator.start();

        this.engine = {

            oscillator,

            gain

        };

    },

    updateEngine(
        speed
    ) {

        if (
            !this.engine
        ) {

            return;

        }

        const normalized =
            Math.min(
                1,
                Math.abs(speed) /
                30
            );

        this.engine.oscillator
            .frequency.value =
                55 +
                normalized *
                120;

        this.engine.gain.gain.value =
            normalized *
            .09;

    },

    stopEngine() {

        if (
            !this.engine
        ) {

            return;

        }

        this.engine.gain.gain.value =
            0;

    },

    /* =====================================================
       SIREN
       ===================================================== */

    startSiren() {

        if (
            !this.context ||
            this.siren
        ) {

            return;

        }

        const oscillator =
            this.context.createOscillator();

        const gain =
            this.context.createGain();

        oscillator.type =
            "square";

        oscillator.frequency.value =
            650;

        gain.gain.value =
            .025;

        oscillator.connect(
            gain
        );

        gain.connect(
            this.master
        );

        oscillator.start();

        this.siren = {

            oscillator,

            gain,

            time: 0

        };

    },

    updateSiren(
        active,
        delta
    ) {

        if (
            !active
        ) {

            if (
                this.siren
            ) {

                this.siren.gain.gain.value =
                    0;

            }

            return;

        }

        if (
            !this.siren
        ) {

            this.startSiren();

        }

        if (
            !this.siren
        ) {

            return;

        }

        this.siren.time +=
            delta;

        this.siren.oscillator
            .frequency.value =
                500 +
                Math.sin(
                    this.siren.time *
                    7
                ) *
                300;

        this.siren.gain.gain.value =
            .035;

    },

    /* =====================================================
       WEAPON EFFECT
       ===================================================== */

    weaponShot() {

        if (
            !this.context
        ) {

            return;

        }

        const oscillator =
            this.context.createOscillator();

        const gain =
            this.context.createGain();

        oscillator.type =
            "square";

        oscillator.frequency.value =
            100;

        gain.gain.value =
            .12;

        oscillator.connect(
            gain
        );

        gain.connect(
            this.master
        );

        const now =
            this.context.currentTime;

        gain.gain.setValueAtTime(
            .12,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            .001,
            now + .08
        );

        oscillator.start(
            now
        );

        oscillator.stop(
            now + .08
        );

    },

    /* =====================================================
       UI SOUND
       ===================================================== */

    uiClick() {

        if (
            !this.context
        ) {

            return;

        }

        const oscillator =
            this.context.createOscillator();

        const gain =
            this.context.createGain();

        oscillator.type =
            "sine";

        oscillator.frequency.value =
            520;

        gain.gain.value =
            .04;

        oscillator.connect(
            gain
        );

        gain.connect(
            this.master
        );

        const now =
            this.context.currentTime;

        gain.gain.setValueAtTime(
            .04,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            .001,
            now + .08
        );

        oscillator.start(
            now
        );

        oscillator.stop(
            now + .08
        );

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(delta) {

        if (
            !this.initialized
        ) {

            return;

        }

        if (
            !this.started
        ) {

            return;

        }

        const vehicle =
            UC.activeVehicle;

        if (
            vehicle
        ) {

            this.startEngine();

            this.updateEngine(
                vehicle.userData.speed
            );

        } else {

            this.stopEngine();

        }

        const police =
            UC.police;

        if (
            police
        ) {

            this.updateSiren(
                police.wantedLevel > 0,
                delta
            );

        }

    }

};

UC.registerModule(
    "audio",
    AudioSystem
);

AudioSystem.init();
