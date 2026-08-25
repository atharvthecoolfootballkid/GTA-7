/* =========================================================
   ULTIMATE CITY — ECONOMY SYSTEM
   Money • Shops • Rewards • Player progression
   ========================================================= */

const UC = window.UltimateCity;
const THREE = window.THREE;

const EconomySystem = {

    initialized: false,

    money: 2500,

    xp: 0,

    level: 1,

    properties: [],

    shops: [],

    init() {

        this.load();

        this.createShops();

        this.createHUD();

        this.initialized = true;

        console.log(
            "Economy system initialized."
        );

    },

    /* =====================================================
       SAVE / LOAD
       ===================================================== */

    load() {

        try {

            const saved =
                localStorage.getItem(
                    "ultimate_city_economy"
                );

            if (
                saved
            ) {

                const data =
                    JSON.parse(
                        saved
                    );

                this.money =
                    data.money ||
                    2500;

                this.xp =
                    data.xp ||
                    0;

                this.level =
                    data.level ||
                    1;

                this.properties =
                    data.properties ||
                    [];

            }

        } catch (
            error
        ) {

            console.warn(
                "Economy load failed.",
                error
            );

        }

    },

    save() {

        try {

            localStorage.setItem(

                "ultimate_city_economy",

                JSON.stringify({

                    money:
                        this.money,

                    xp:
                        this.xp,

                    level:
                        this.level,

                    properties:
                        this.properties

                })

            );

        } catch (
            error
        ) {

            console.warn(
                "Economy save failed.",
                error
            );

        }

    },

    /* =====================================================
       MONEY
       ===================================================== */

    addMoney(
        amount
    ) {

        this.money +=
            Math.max(
                0,
                amount
            );

        this.save();

        this.updateHUD();

    },

    spendMoney(
        amount
    ) {

        if (
            amount >
            this.money
        ) {

            return false;

        }

        this.money -=
            amount;

        this.save();

        this.updateHUD();

        return true;

    },

    /* =====================================================
       XP
       ===================================================== */

    addXP(
        amount
    ) {

        this.xp +=
            Math.max(
                0,
                amount
            );

        const required =
            this.level * 1000;

        if (
            this.xp >=
            required
        ) {

            this.xp -=
                required;

            this.level++;

            this.levelUp();

        }

        this.save();

        this.updateHUD();

    },

    levelUp() {

        const message =
            document.createElement(
                "div"
            );

        message.style.position =
            "fixed";

        message.style.left =
            "50%";

        message.style.top =
            "25%";

        message.style.transform =
            "translateX(-50%)";

        message.style.zIndex =
            "100";

        message.style.padding =
            "18px 30px";

        message.style.borderRadius =
            "12px";

        message.style.background =
            "rgba(0,0,0,.82)";

        message.style.color =
            "#fff";

        message.style.font =
            "900 24px Arial";

        message.textContent =
            "LEVEL " +
            this.level;

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
       SHOPS
       ===================================================== */

    createShops() {

        const locations = [

            {
                name:
                    "Metro Motors",

                x:
                    310,

                z:
                    -260,

                price:
                    7500

            },

            {
                name:
                    "Urban Outfit",

                x:
                    -330,

                z:
                    -180,

                price:
                    2500

            },

            {
                name:
                    "City Market",

                x:
                    120,

                z:
                    430,

                price:
                    1000

            },

            {
                name:
                    "Harbor Club",

                x:
                    -560,

                z:
                    470,

                price:
                    25000

            }

        ];

        locations.forEach(
            location => {

                this.createShop(
                    location
                );

            }
        );

    },

    createShop(
        data
    ) {

        const building =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    18,
                    10,
                    18
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x3b4149,

                    roughness:
                        .8

                })

            );

        building.position.set(
            data.x,
            5,
            data.z
        );

        building.castShadow =
            true;

        building.receiveShadow =
            true;

        building.userData = {

            shop:
                true,

            name:
                data.name,

            price:
                data.price

        };

        UC.world.add(
            building
        );

        this.shops.push(
            building
        );

    },

    /* =====================================================
       PROPERTY
       ===================================================== */

    buyProperty(
        property
    ) {

        if (
            !property ||
            !property.userData
        ) {

            return false;

        }

        const price =
            property.userData.price;

        if (
            !this.spendMoney(
                price
            )
        ) {

            return false;

        }

        this.properties.push(
            property.userData.name
        );

        this.addXP(
            Math.floor(
                price /
                50
            )
        );

        this.save();

        return true;

    },

    /* =====================================================
       MISSION REWARD
       ===================================================== */

    missionReward(
        money,
        xp
    ) {

        this.addMoney(
            money
        );

        this.addXP(
            xp
        );

    },

    /* =====================================================
       HUD
       ===================================================== */

    createHUD() {

        let hud =
            document.getElementById(
                "economy-display"
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
            "economy-display";

        hud.style.position =
            "fixed";

        hud.style.right =
            "25px";

        hud.style.top =
            "72px";

        hud.style.zIndex =
            "50";

        hud.style.color =
            "#fff";

        hud.style.font =
            "900 16px Arial";

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
                "economy-display"
            );

        if (
            !hud
        ) {

            return;

        }

        hud.innerHTML =

            `<div>
                $${this.money.toLocaleString()}
            </div>

            <div style="
                font-size:11px;
                opacity:.65;
                margin-top:3px;
            ">
                LEVEL ${this.level}
            </div>`;

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
    "economy",
    EconomySystem
);

EconomySystem.init();
