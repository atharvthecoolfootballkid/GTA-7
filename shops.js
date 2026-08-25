/* =========================================================
   ULTIMATE CITY — SHOPS & CUSTOMIZATION
   Vehicles • Clothing • Food • Equipment • Upgrades
   ========================================================= */

const UC = window.UltimateCity;

const ShopSystem = {

    initialized: false,

    currentShop: null,

    shops: {

        motors: {
            title: "METRO MOTORS",

            items: [
                {
                    id: "city",
                    name: "City Cruiser",
                    price: 8500,
                    type: "vehicle"
                },
                {
                    id: "sport",
                    name: "Street Sport",
                    price: 24000,
                    type: "vehicle"
                },
                {
                    id: "super",
                    name: "Hyper GT",
                    price: 95000,
                    type: "vehicle"
                }
            ]
        },

        clothing: {
            title: "URBAN OUTFIT",

            items: [
                {
                    id: "jacket",
                    name: "Urban Jacket",
                    price: 750,
                    type: "clothing"
                },
                {
                    id: "street",
                    name: "Street Outfit",
                    price: 1500,
                    type: "clothing"
                },
                {
                    id: "formal",
                    name: "Formal Outfit",
                    price: 3000,
                    type: "clothing"
                }
            ]
        },

        market: {
            title: "CITY MARKET",

            items: [
                {
                    id: "health",
                    name: "Health Pack",
                    price: 250,
                    type: "health"
                },
                {
                    id: "armor",
                    name: "Protective Gear",
                    price: 1000,
                    type: "armor"
                },
                {
                    id: "snack",
                    name: "Snack",
                    price: 50,
                    type: "food"
                }
            ]
        }
    },

    inventory: [],

    init() {

        this.load();

        this.initialized = true;

        console.log(
            "Shop system initialized."
        );

    },

    /* =====================================================
       SAVE
       ===================================================== */

    load() {

        try {

            const saved =
                localStorage.getItem(
                    "ultimate_city_inventory"
                );

            if (
                saved
            ) {

                this.inventory =
                    JSON.parse(
                        saved
                    );

            }

        } catch (
            error
        ) {

            this.inventory = [];

        }

    },

    save() {

        try {

            localStorage.setItem(

                "ultimate_city_inventory",

                JSON.stringify(
                    this.inventory
                )

            );

        } catch (
            error
        ) {

            console.warn(
                "Inventory save failed.",
                error
            );

        }

    },

    /* =====================================================
       OPEN SHOP
       ===================================================== */

    open(
        type
    ) {

        const shop =
            this.shops[type];

        if (
            !shop
        ) {

            return;

        }

        this.currentShop =
            type;

        this.createShopUI(
            shop
        );

    },

    /* =====================================================
       SHOP UI
       ===================================================== */

    createShopUI(
        shop
    ) {

        this.close();

        const overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "shop-overlay";

        overlay.style.position =
            "fixed";

        overlay.style.inset =
            "0";

        overlay.style.zIndex =
            "200";

        overlay.style.background =
            "rgba(0,0,0,.72)";

        overlay.style.display =
            "flex";

        overlay.style.alignItems =
            "center";

        overlay.style.justifyContent =
            "center";

        overlay.style.padding =
            "20px";

        const panel =
            document.createElement(
                "div"
            );

        panel.style.width =
            "min(850px,95vw)";

        panel.style.maxHeight =
            "85vh";

        panel.style.overflowY =
            "auto";

        panel.style.background =
            "rgba(18,20,24,.98)";

        panel.style.border =
            "1px solid rgba(255,255,255,.14)";

        panel.style.borderRadius =
            "18px";

        panel.style.padding =
            "25px";

        panel.style.color =
            "#fff";

        panel.style.fontFamily =
            "Arial,sans-serif";

        panel.innerHTML =

            `<div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div>

                    <div style="
                        font-size:11px;
                        letter-spacing:3px;
                        opacity:.55;
                    ">
                        ULTIMATE CITY
                    </div>

                    <div style="
                        font-size:30px;
                        font-weight:900;
                        margin-top:4px;
                    ">
                        ${shop.title}
                    </div>

                </div>

                <button
                    id="shop-close"
                    style="
                        width:42px;
                        height:42px;
                        border:0;
                        border-radius:50%;
                        background:rgba(255,255,255,.1);
                        color:#fff;
                        font-size:20px;
                    "
                >
                    ×
                </button>

            </div>

            <div
                id="shop-balance"
                style="
                    margin-top:15px;
                    font-size:15px;
                    font-weight:800;
                    opacity:.85;
                "
            >
            </div>

            <div
                id="shop-items"
                style="
                    margin-top:20px;
                    display:grid;
                    grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(190px,1fr)
                        );
                    gap:14px;
                "
            >
            </div>`;

        overlay.appendChild(
            panel
        );

        document.body.appendChild(
            overlay
        );

        document.getElementById(
            "shop-close"
        ).onclick =
            () => this.close();

        this.renderItems(
            shop
        );

    },

    /* =====================================================
       ITEMS
       ===================================================== */

    renderItems(
        shop
    ) {

        const container =
            document.getElementById(
                "shop-items"
            );

        const balance =
            document.getElementById(
                "shop-balance"
            );

        if (
            !container ||
            !balance
        ) {

            return;

        }

        const money =
            UC.economy
                ? UC.economy.money
                : 0;

        balance.textContent =
            "Balance: $" +
            money.toLocaleString();

        container.innerHTML = "";

        shop.items.forEach(
            item => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.style.padding =
                    "18px";

                card.style.borderRadius =
                    "14px";

                card.style.background =
                    "rgba(255,255,255,.06)";

                card.style.border =
                    "1px solid rgba(255,255,255,.08)";

                card.innerHTML =

                    `<div style="
                        font-size:17px;
                        font-weight:900;
                    ">
                        ${item.name}
                    </div>

                    <div style="
                        margin-top:8px;
                        opacity:.65;
                        font-size:12px;
                    ">
                        ${item.type.toUpperCase()}
                    </div>

                    <div style="
                        margin-top:16px;
                        font-size:20px;
                        font-weight:900;
                    ">
                        $${item.price.toLocaleString()}
                    </div>

                    <button
                        data-shop-item="${item.id}"
                        style="
                            width:100%;
                            margin-top:14px;
                            padding:11px;
                            border:0;
                            border-radius:9px;
                            background:#fff;
                            color:#111;
                            font-weight:900;
                        "
                    >
                        BUY
                    </button>`;

                container.appendChild(
                    card
                );

            }
        );

        container
            .querySelectorAll(
                "[data-shop-item]"
            )
            .forEach(
                button => {

                    button.onclick =
                        () => {

                            this.buy(
                                button.dataset
                                    .shopItem
                            );

                        };

                }
            );

    },

    /* =====================================================
       BUY
       ===================================================== */

    buy(
        itemID
    ) {

        if (
            !this.currentShop
        ) {

            return;

        }

        const shop =
            this.shops[
                this.currentShop
            ];

        const item =
            shop.items.find(
                i =>
                    i.id ===
                    itemID
            );

        if (
            !item
        ) {

            return;

        }

        if (
            !UC.economy
        ) {

            return;

        }

        const success =
            UC.economy.spendMoney(
                item.price
            );

        if (
            !success
        ) {

            this.message(
                "NOT ENOUGH MONEY"
            );

            return;

        }

        this.inventory.push({

            id:
                item.id,

            name:
                item.name,

            type:
                item.type,

            purchasedAt:
                Date.now()

        });

        this.save();

        if (
            item.type ===
            "health"
        ) {

            this.applyHealth();

        }

        if (
            item.type ===
            "armor"
        ) {

            this.applyArmor();

        }

        if (
            UC.audio
        ) {

            UC.audio.uiClick();

        }

        this.message(
            item.name +
            " purchased"
        );

        this.renderItems(
            shop
        );

    },

    /* =====================================================
       HEALTH
       ===================================================== */

    applyHealth() {

        if (
            UC.player &&
            UC.player.health !==
            undefined
        ) {

            UC.player.health =
                Math.min(
                    100,
                    UC.player.health +
                    35
                );

        }

    },

    /* =====================================================
       ARMOR
       ===================================================== */

    applyArmor() {

        if (
            UC.player
        ) {

            UC.player.armor =
                Math.min(
                    100,
                    (
                        UC.player.armor ||
                        0
                    ) +
                    50
                );

        }

    },

    /* =====================================================
       MESSAGE
       ===================================================== */

    message(
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

        box.style.bottom =
            "120px";

        box.style.transform =
            "translateX(-50%)";

        box.style.zIndex =
            "300";

        box.style.padding =
            "12px 20px";

        box.style.borderRadius =
            "10px";

        box.style.background =
            "rgba(0,0,0,.85)";

        box.style.color =
            "#fff";

        box.style.font =
            "800 13px Arial";

        box.textContent =
            text;

        document.body.appendChild(
            box
        );

        setTimeout(
            () => box.remove(),
            1800
        );

    },

    /* =====================================================
       CLOSE
       ===================================================== */

    close() {

        const overlay =
            document.getElementById(
                "shop-overlay"
            );

        if (
            overlay
        ) {

            overlay.remove();

        }

        this.currentShop =
            null;

    }

};

UC.registerModule(
    "shops",
    ShopSystem
);

ShopSystem.init();
