/* =========================================================
   ULTIMATE CITY — COMBAT / DAMAGE SYSTEM
   Health • Damage • NPC targets • Knockback • Respawn
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const CombatSystem = {

    initialized: false,

    targets: [],

    effects: [],

    init() {

        this.createTargets();

        this.initialized = true;

        console.log(
            "Combat system initialized."
        );

    },

    /* =====================================================
       TARGET CREATION
       ===================================================== */

    createTargets() {

        for (
            let i = 0;
            i < 20;
            i++
        ) {

            this.createTarget();

        }

    },

    createTarget() {

        const target =
            new THREE.Group();

        const body =
            new THREE.Mesh(

                new THREE.CapsuleGeometry(
                    .3,
                    .7,
                    5,
                    10
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x485363,

                    roughness:
                        .8

                })

            );

        body.position.y =
            1;

        body.castShadow =
            true;

        target.add(
            body
        );

        const head =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .22,
                    12,
                    10
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xa96f4c,

                    roughness:
                        .9

                })

            );

        head.position.y =
            1.7;

        head.castShadow =
            true;

        target.add(
            head
        );

        target.position.set(

            Math.random() *
                1500 -
                750,

            0,

            Math.random() *
                1500 -
                750

        );

        target.userData = {

            damageable:
                true,

            health:
                100,

            maxHealth:
                100,

            alive:
                true,

            respawnTimer:
                0

        };

        UC.world.add(
            target
        );

        this.targets.push(
            target
        );

    },

    /* =====================================================
       DAMAGE
       ===================================================== */

    damage(
        target,
        amount
    ) {

        if (
            !target ||
            !target.userData ||
            !target.userData.alive
        ) {

            return;

        }

        target.userData.health -=
            amount;

        this.createHitEffect(
            target.position
        );

        if (
            target.userData.health <=
            0
        ) {

            this.kill(
                target
            );

        }

    },

    /* =====================================================
       KILL
       ===================================================== */

    kill(
        target
    ) {

        target.userData.alive =
            false;

        target.userData.respawnTimer =
            8;

        target.visible =
            false;

        if (
            UC.police
        ) {

            UC.police.addWanted(
                1
            );

        }

        if (
            UC.profile
        ) {

            UC.profile.xp =
                (
                    UC.profile.xp ||
                    0
                ) +
                25;

        }

    },

    /* =====================================================
       HIT EFFECT
       ===================================================== */

    createHitEffect(
        position
    ) {

        const geometry =
            new THREE.SphereGeometry(
                .12,
                8,
                8
            );

        const material =
            new THREE.MeshBasicMaterial({

                color:
                    0xffc46a,

                transparent:
                    true

            });

        const effect =
            new THREE.Mesh(
                geometry,
                material
            );

        effect.position.copy(
            position
        );

        effect.position.y +=
            1;

        effect.userData.life =
            .25;

        UC.world.add(
            effect
        );

        this.effects.push(
            effect
        );

    },

    /* =====================================================
       EFFECT UPDATE
       ===================================================== */

    updateEffects(
        delta
    ) {

        for (
            let i =
                this.effects.length -
                1;

            i >= 0;

            i--
        ) {

            const effect =
                this.effects[i];

            effect.userData.life -=
                delta;

            effect.scale.multiplyScalar(
                1 +
                delta *
                5
            );

            effect.material.opacity =
                Math.max(
                    0,
                    effect.userData.life /
                    .25
                );

            if (
                effect.userData.life <=
                0
            ) {

                if (
                    effect.parent
                ) {

                    effect.parent.remove(
                        effect
                    );

                }

                this.effects.splice(
                    i,
                    1
                );

            }

        }

    },

    /* =====================================================
       TARGET RESPAWN
       ===================================================== */

    updateTargets(
        delta
    ) {

        for (
            const target
            of this.targets
        ) {

            if (
                target.userData.alive
            ) {

                continue;

            }

            target.userData.respawnTimer -=
                delta;

            if (
                target.userData.respawnTimer <=
                0
            ) {

                target.userData.alive =
                    true;

                target.userData.health =
                    target.userData.maxHealth;

                target.visible =
                    true;

                target.position.set(

                    Math.random() *
                        1500 -
                        750,

                    0,

                    Math.random() *
                        1500 -
                        750

                );

            }

        }

    },

    /* =====================================================
       MAIN UPDATE
       ===================================================== */

    update(
        delta
    ) {

        if (
            !this.initialized
        ) {

            return;

        }

        this.updateEffects(
            delta
        );

        this.updateTargets(
            delta
        );

    }

};

UC.registerModule(
    "combat",
    CombatSystem
);

CombatSystem.init();
