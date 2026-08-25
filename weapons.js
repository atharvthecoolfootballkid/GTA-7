/* =========================================================
   ULTIMATE CITY — WEAPON SYSTEM
   Original fictional weapons • First-person compatible
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const WeaponSystem = {

    initialized: false,

    weapons: {},

    current: null,

    ammo: {},

    cooldown: 0,

    muzzleFlash: null,

    init() {

        this.createWeapons();

        this.setupControls();

        this.createWeaponHUD();

        this.initialized = true;

        console.log(
            "Weapon system initialized."
        );

    },

    /* =====================================================
       WEAPONS
       ===================================================== */

    createWeapons() {

        this.weapons = {

            sidearm: {

                name:
                    "Viper",

                damage:
                    24,

                magazine:
                    12,

                reserve:
                    72,

                fireRate:
                    .22,

                range:
                    180

            },

            carbine: {

                name:
                    "Raptor",

                damage:
                    18,

                magazine:
                    30,

                reserve:
                    120,

                fireRate:
                    .1,

                range:
                    260

            },

            marksman: {

                name:
                    "Longshot",

                damage:
                    70,

                magazine:
                    8,

                reserve:
                    40,

                fireRate:
                    .8,

                range:
                    500

            }

        };

        for (
            const id in this.weapons
        ) {

            const weapon =
                this.weapons[id];

            this.ammo[id] = {

                magazine:
                    weapon.magazine,

                reserve:
                    weapon.reserve

            };

        }

        this.select(
            "sidearm"
        );

    },

    /* =====================================================
       SELECT
       ===================================================== */

    select(id) {

        if (
            !this.weapons[id]
        ) {

            return;

        }

        this.current =
            id;

        this.updateHUD();

    },

    nextWeapon() {

        const ids =
            Object.keys(
                this.weapons
            );

        const index =
            ids.indexOf(
                this.current
            );

        const next =
            (
                index + 1
            ) %
            ids.length;

        this.select(
            ids[next]
        );

    },

    /* =====================================================
       INPUT
       ===================================================== */

    setupControls() {

        window.addEventListener(
            "keydown",
            event => {

                if (
                    event.code ===
                    "Digit1"
                ) {

                    this.select(
                        "sidearm"
                    );

                }

                if (
                    event.code ===
                    "Digit2"
                ) {

                    this.select(
                        "carbine"
                    );

                }

                if (
                    event.code ===
                    "Digit3"
                ) {

                    this.select(
                        "marksman"
                    );

                }

                if (
                    event.code ===
                    "KeyQ"
                ) {

                    this.nextWeapon();

                }

                if (
                    event.code ===
                    "KeyR"
                ) {

                    this.reload();

                }

                if (
                    event.code ===
                    "Space"
                ) {

                    return;

                }

            }
        );

        window.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.button === 0
                ) {

                    this.fire();

                }

            }
        );

    },

    /* =====================================================
       FIRE
       ===================================================== */

    fire() {

        if (
            !this.initialized ||
            !this.current
        ) {

            return;

        }

        const weapon =
            this.weapons[
                this.current
            ];

        const ammo =
            this.ammo[
                this.current
            ];

        if (
            this.cooldown > 0
        ) {

            return;

        }

        if (
            ammo.magazine <= 0
        ) {

            this.reload();

            return;

        }

        ammo.magazine--;

        this.cooldown =
            weapon.fireRate;

        this.createMuzzleFlash();

        this.performRaycast(
            weapon
        );

        this.updateHUD();

    },

    /* =====================================================
       RAYCAST
       ===================================================== */

    performRaycast(
        weapon
    ) {

        if (
            !UC.camera
        ) {

            return;

        }

        const raycaster =
            new THREE.Raycaster();

        const center =
            new THREE.Vector2(
                0,
                0
            );

        raycaster.setFromCamera(
            center,
            UC.camera
        );

        const objects = [];

        UC.world.traverse(
            object => {

                if (
                    object.isMesh
                ) {

                    objects.push(
                        object
                    );

                }

            }
        );

        const hits =
            raycaster.intersectObjects(
                objects,
                true
            );

        if (
            hits.length === 0
        ) {

            return;

        }

        const hit =
            hits[0];

        const object =
            hit.object;

        if (
            object.userData &&
            object.userData.damageable
        ) {

            if (
                typeof object.userData.damage
                ===
                "function"
            ) {

                object.userData.damage(
                    weapon.damage
                );

            }

        }

        this.createImpact(
            hit.point
        );

    },

    /* =====================================================
       MUZZLE FLASH
       ===================================================== */

    createMuzzleFlash() {

        if (
            this.muzzleFlash
        ) {

            UC.camera.remove(
                this.muzzleFlash
            );

        }

        const flash =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .08,
                    8,
                    8
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0xffd36b,

                    transparent:
                        true,

                    opacity:
                        .95

                })

            );

        flash.position.set(
            0,
            -.18,
            -.75
        );

        UC.camera.add(
            flash
        );

        this.muzzleFlash =
            flash;

        setTimeout(
            () => {

                if (
                    flash.parent
                ) {

                    flash.parent.remove(
                        flash
                    );

                }

            },
            55
        );

    },

    /* =====================================================
       IMPACT
       ===================================================== */

    createImpact(
        position
    ) {

        const geometry =
            new THREE.SphereGeometry(
                .08,
                8,
                8
            );

        const material =
            new THREE.MeshBasicMaterial({

                color:
                    0xffa33a

            });

        const impact =
            new THREE.Mesh(
                geometry,
                material
            );

        impact.position.copy(
            position
        );

        UC.world.add(
            impact
        );

        setTimeout(
            () => {

                if (
                    impact.parent
                ) {

                    impact.parent.remove(
                        impact
                    );

                }

            },
            250
        );

    },

    /* =====================================================
       RELOAD
       ===================================================== */

    reload() {

        if (
            !this.current
        ) {

            return;

        }

        const weapon =
            this.weapons[
                this.current
            ];

        const ammo =
            this.ammo[
                this.current
            ];

        const missing =
            weapon.magazine -
            ammo.magazine;

        if (
            missing <= 0 ||
            ammo.reserve <= 0
        ) {

            return;

        }

        const amount =
            Math.min(
                missing,
                ammo.reserve
            );

        ammo.magazine +=
            amount;

        ammo.reserve -=
            amount;

        this.updateHUD();

    },

    /* =====================================================
       UPDATE
       ===================================================== */

    update(delta) {

        if (
            this.cooldown > 0
        ) {

            this.cooldown -=
                delta;

        }

    },

    /* =====================================================
       HUD
       ===================================================== */

    createWeaponHUD() {

        let hud =
            document.getElementById(
                "weapon-display"
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
            "weapon-display";

        hud.style.position =
            "fixed";

        hud.style.right =
            "25px";

        hud.style.bottom =
            "30px";

        hud.style.zIndex =
            "50";

        hud.style.color =
            "#ffffff";

        hud.style.fontFamily =
            "Arial,sans-serif";

        hud.style.fontWeight =
            "900";

        hud.style.textAlign =
            "right";

        document.body.appendChild(
            hud
        );

        this.updateHUD();

    },

    updateHUD() {

        const hud =
            document.getElementById(
                "weapon-display"
            );

        if (
            !hud ||
            !this.current
        ) {

            return;

        }

        const weapon =
            this.weapons[
                this.current
            ];

        const ammo =
            this.ammo[
                this.current
            ];

        hud.innerHTML =

            `<div style="
                font-size:18px;
                letter-spacing:2px;
            ">
                ${weapon.name}
            </div>

            <div style="
                font-size:30px;
            ">
                ${ammo.magazine}
                /
                ${ammo.reserve}
            </div>`;

    }

};

UC.registerModule(
    "weapons",
    WeaponSystem
);

WeaponSystem.init();
