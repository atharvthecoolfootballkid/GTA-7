/* =========================================================
   ULTIMATE CITY — MAP SYSTEM
   Minimap • Full Map • Mission Marker • Player Marker
   ========================================================= */

const UC = window.UltimateCity;

const MapSystem = {

    initialized: false,

    mapOpen: false,

    canvas: null,

    context: null,

    size: 220,

    worldSize: 2000,

    init() {

        this.createMinimap();

        this.createFullMap();

        this.setupKeyboard();

        this.initialized = true;

        console.log(
            "Map system initialized."
        );

    },

    /* =====================================================
       MINIMAP
       ===================================================== */

    createMinimap() {

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.id =
            "city-minimap";

        canvas.width =
            this.size;

        canvas.height =
            this.size;

        canvas.style.position =
            "fixed";

        canvas.style.right =
            "25px";

        canvas.style.bottom =
            "25px";

        canvas.style.width =
            this.size +
            "px";

        canvas.style.height =
            this.size +
            "px";

        canvas.style.borderRadius =
            "50%";

        canvas.style.border =
            "3px solid rgba(255,255,255,.7)";

        canvas.style.background =
            "rgba(25,35,40,.85)";

        canvas.style.zIndex =
            "55";

        canvas.style.pointerEvents =
            "none";

        document.body.appendChild(
            canvas
        );

        this.canvas =
            canvas;

        this.context =
            canvas.getContext(
                "2d"
            );

    },

    /* =====================================================
       FULL MAP
       ===================================================== */

    createFullMap() {

        const overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "full-map";

        overlay.style.position =
            "fixed";

        overlay.style.inset =
            "0";

        overlay.style.zIndex =
            "500";

        overlay.style.background =
            "rgba(8,10,13,.96)";

        overlay.style.display =
            "none";

        overlay.innerHTML =

            `<div style="
                position:absolute;
                top:25px;
                left:30px;
                color:#fff;
                font:900 28px Arial;
            ">
                CITY MAP
            </div>

            <canvas
                id="full-map-canvas"
                style="
                    position:absolute;
                    left:50%;
                    top:50%;
                    transform:
                        translate(-50%,-50%);
                    width:min(90vw,900px);
                    height:min(75vh,650px);
                    background:#263338;
                    border:2px solid
                        rgba(255,255,255,.2);
                    border-radius:12px;
                "
            ></canvas>

            <div style="
                position:absolute;
                left:30px;
                bottom:25px;
                color:#fff;
                opacity:.65;
                font:600 12px Arial;
            ">
                Press M to close
            </div>`;

        document.body.appendChild(
            overlay
        );

    },

    /* =====================================================
       KEYBOARD
       ===================================================== */

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

                if (
                    event.code ===
                    "KeyM"
                ) {

                    this.toggleFullMap();

                }

            }
        );

    },

    /* =====================================================
       TOGGLE
       ===================================================== */

    toggleFullMap() {

        const map =
            document.getElementById(
                "full-map"
            );

        if (
            !map
        ) {

            return;

        }

        this.mapOpen =
            !this.mapOpen;

        map.style.display =
            this.mapOpen
                ? "block"
                : "none";

        if (
            this.mapOpen
        ) {

            this.drawFullMap();

        }

    },

    /* =====================================================
       WORLD TO MAP
       ===================================================== */

    worldToMap(
        x,
        z,
        size
    ) {

        const half =
            this.worldSize / 2;

        return {

            x:
                (
                    x +
                    half
                ) /
                this.worldSize *
                size,

            y:
                (
                    z +
                    half
                ) /
                this.worldSize *
                size

        };

    },

    /* =====================================================
       DRAW MINIMAP
       ===================================================== */

    drawMinimap() {

        if (
            !this.context ||
            !UC.player
        ) {

            return;

        }

        const ctx =
            this.context;

        const size =
            this.size;

        ctx.clearRect(
            0,
            0,
            size,
            size
        );

        /* WATER */

        ctx.fillStyle =
            "#243e4b";

        ctx.fillRect(
            0,
            0,
            size,
            size
        );

        /* CITY */

        ctx.fillStyle =
            "#59625e";

        ctx.fillRect(
            20,
            20,
            size - 40,
            size - 40
        );

        /* ROADS */

        ctx.strokeStyle =
            "#303638";

        ctx.lineWidth =
            9;

        for (
            let i = 20;
            i < size;
            i += 38
        ) {

            ctx.beginPath();

            ctx.moveTo(
                i,
                0
            );

            ctx.lineTo(
                i,
                size
            );

            ctx.stroke();

            ctx.beginPath();

            ctx.moveTo(
                0,
                i
            );

            ctx.lineTo(
                size,
                i
            );

            ctx.stroke();

        }

        /* PLAYER */

        const p =
            this.worldToMap(

                UC.player.position.x,

                UC.player.position.z,

                size

            );

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* MISSION */

        if (
            UC.missions
        ) {

            const target =
                UC.missions.getTarget();

            if (
                target
            ) {

                const marker =
                    this.worldToMap(

                        target.x,

                        target.z,

                        size

                    );

                ctx.fillStyle =
                    "#ffd21c";

                ctx.beginPath();

                ctx.arc(
                    marker.x,
                    marker.y,
                    5,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }

        }

    },

    /* =====================================================
       FULL MAP DRAW
       ===================================================== */

    drawFullMap() {

        const canvas =
            document.getElementById(
                "full-map-canvas"
            );

        if (
            !canvas
        ) {

            return;

        }

        const width =
            canvas.width =
            Math.min(
                1400,
                window.innerWidth *
                1.5
            );

        const height =
            canvas.height =
            Math.min(
                1000,
                window.innerHeight *
                1.3
            );

        const ctx =
            canvas.getContext(
                "2d"
            );

        ctx.fillStyle =
            "#29434b";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        /* LAND */

        ctx.fillStyle =
            "#68706b";

        ctx.fillRect(
            70,
            70,
            width - 140,
            height - 140
        );

        /* MAIN ROADS */

        ctx.strokeStyle =
            "#333a3a";

        ctx.lineWidth =
            28;

        for (
            let x = 100;
            x < width;
            x += 130
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x,
                height
            );

            ctx.stroke();

        }

        for (
            let y = 100;
            y < height;
            y += 130
        ) {

            ctx.beginPath();

            ctx.moveTo(
                0,
                y
            );

            ctx.lineTo(
                width,
                y
            );

            ctx.stroke();

        }

        /* PARKS */

        ctx.fillStyle =
            "#3f6848";

        ctx.fillRect(
            130,
            140,
            180,
            120
        );

        ctx.fillRect(
            width - 330,
            180,
            200,
            150
        );

        ctx.fillRect(
            width / 2 - 120,
            height - 280,
            240,
            150
        );

        /* PLAYER */

        if (
            UC.player
        ) {

            const p =
                this.worldToMap(

                    UC.player.position.x,

                    UC.player.position.z,

                    Math.min(
                        width,
                        height
                    )

                );

            ctx.fillStyle =
                "#fff";

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                10,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        /* MISSION */

        if (
            UC.missions
        ) {

            const target =
                UC.missions.getTarget();

            if (
                target
            ) {

                const marker =
                    this.worldToMap(

                        target.x,

                        target.z,

                        Math.min(
                            width,
                            height
                        )

                    );

                ctx.fillStyle =
                    "#ffd21c";

                ctx.beginPath();

                ctx.arc(
                    marker.x,
                    marker.y,
                    13,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }

        }

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

        this.drawMinimap();

        if (
            this.mapOpen
        ) {

            this.drawFullMap();

        }

    }

};

UC.registerModule(
    "map",
    MapSystem
);

MapSystem.init();
