/* =========================================================
   ULTIMATE CITY
   GAME.JS — CORE ENGINE
   ========================================================= */

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* =========================================================
   GLOBAL GAME OBJECT
   ========================================================= */

window.UltimateCity = {

    version: "1.0.0",

    scene: null,
    camera: null,
    renderer: null,

    clock: new THREE.Clock(),

    paused: false,

    delta: 0,

    time: 12,

    player: null,

    activeVehicle: null,

    modules: {},

    settings: {

        shadows: true,

        quality: "high",

        cameraMode: "third",

        vibration: true,

        sound: true

    },

    stats: {

        fps: 60,

        frames: 0,

        lastTime: performance.now()

    }

};

/* =========================================================
   DOM
   ========================================================= */

const canvas =
    document.getElementById("game");

const loading =
    document.getElementById("loading");

const loadingBar =
    document.querySelector(".loading-bar");

const loadingStatus =
    document.querySelector(".loading-status");

const hud =
    document.getElementById("hud");

const pauseScreen =
    document.querySelector(".pause");

/* =========================================================
   LOADING
   ========================================================= */

let loadingProgress = 0;

function loadingStep(
    amount,
    message
){

    loadingProgress =
        Math.min(
            100,
            loadingProgress + amount
        );

    if(loadingBar){

        loadingBar.style.width =
            loadingProgress + "%";

    }

    if(loadingStatus){

        loadingStatus.textContent =
            message;

    }

}

/* =========================================================
   RENDERER
   ========================================================= */

const renderer =
    new THREE.WebGLRenderer({

        canvas,

        antialias: true,

        alpha: false,

        powerPreference:
            "high-performance"

    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.shadowMap.enabled =
    true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.1;

UltimateCity.renderer =
    renderer;

loadingStep(
    8,
    "INITIALIZING RENDERER..."
);

/* =========================================================
   SCENE
   ========================================================= */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(
        0x84949c
    );

scene.fog =
    new THREE.FogExp2(
        0x84949c,
        0.0012
    );

UltimateCity.scene =
    scene;

loadingStep(
    7,
    "CREATING WORLD..."
);

/* =========================================================
   CAMERA
   ========================================================= */

const camera =
    new THREE.PerspectiveCamera(

        70,

        window.innerWidth /
        window.innerHeight,

        0.05,

        5000

    );

camera.position.set(
    0,
    4,
    8
);

UltimateCity.camera =
    camera;

/* =========================================================
   LIGHTING
   ========================================================= */

const hemisphere =
    new THREE.HemisphereLight(

        0xe7f4ff,

        0x171b1e,

        2.2

    );

scene.add(
    hemisphere
);

const sun =
    new THREE.DirectionalLight(

        0xffe1bd,

        3.4

    );

sun.position.set(
    300,
    600,
    250
);

sun.castShadow = true;

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

sun.shadow.camera.left =
    -1200;

sun.shadow.camera.right =
    1200;

sun.shadow.camera.top =
    1200;

sun.shadow.camera.bottom =
    -1200;

sun.shadow.camera.near =
    1;

sun.shadow.camera.far =
    2500;

scene.add(
    sun
);

UltimateCity.sun =
    sun;

loadingStep(
    7,
    "LIGHTING CITY..."
);

/* =========================================================
   WORLD GROUP
   ========================================================= */

const world =
    new THREE.Group();

world.name =
    "World";

scene.add(
    world
);

UltimateCity.world =
    world;

/* =========================================================
   MATERIAL CACHE
   ========================================================= */

const materialCache =
    new Map();

function getMaterial(
    color,
    options = {}
){

    const key =
        JSON.stringify({
            color,
            metalness:
                options.metalness || 0,
            roughness:
                options.roughness ??
                .8
        });

    if(
        materialCache.has(key)
    ){

        return materialCache.get(
            key
        );

    }

    const material =
        new THREE.MeshStandardMaterial({

            color,

            metalness:
                options.metalness || 0,

            roughness:
                options.roughness ??
                .8

        });

    materialCache.set(
        key,
        material
    );

    return material;

}

/* =========================================================
   GROUND
   ========================================================= */

const ground =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            3000,
            3000
        ),

        getMaterial(
            0x34393b,
            {
                roughness: 1
            }
        )

    );

ground.rotation.x =
    -Math.PI / 2;

ground.position.y =
    -0.02;

ground.receiveShadow =
    true;

world.add(
    ground
);

/* =========================================================
   CITY CONFIGURATION
   ========================================================= */

const CITY = {

    size: 2000,

    roadSpacing: 180,

    roadWidth: 28,

    sidewalkWidth: 6,

    buildingMinHeight: 15,

    buildingMaxHeight: 160,

    seed: Math.random() * 999999

};

UltimateCity.city =
    CITY;

/* =========================================================
   DETERMINISTIC RANDOM
   ========================================================= */

function seededRandom(
    seed
){

    const x =
        Math.sin(
            seed * 12.9898
        ) *
        43758.5453;

    return (
        x -
        Math.floor(x)
    );

}

/* =========================================================
   ROAD MATERIALS
   ========================================================= */

const roadMaterial =
    getMaterial(
        0x101416,
        {
            roughness: .96
        }
    );

const sidewalkMaterial =
    getMaterial(
        0x6b7072,
        {
            roughness: .98
        }
    );

const laneMaterial =
    getMaterial(
        0xe0d7ad,
        {
            roughness: .7
        }
    );

/* =========================================================
   ROAD CREATION
   ========================================================= */

const roads = [];

function createRoad(
    position,
    vertical
){

    const length =
        CITY.size;

    const road =
        new THREE.Mesh(

            new THREE.PlaneGeometry(

                vertical
                    ? CITY.roadWidth
                    : length,

                vertical
                    ? length
                    : CITY.roadWidth

            ),

            roadMaterial

        );

    road.rotation.x =
        -Math.PI / 2;

    road.position.y =
        0.01;

    if(vertical){

        road.position.x =
            position;

    }else{

        road.position.z =
            position;

    }

    road.receiveShadow =
        true;

    world.add(
        road
    );

    roads.push({
        position,
        vertical
    });

    /* sidewalks */

    const offset =
        CITY.roadWidth / 2 +
        CITY.sidewalkWidth / 2;

    for(
        const side of [-1, 1]
    ){

        const sidewalk =
            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    vertical
                        ? CITY.sidewalkWidth
                        : length,

                    vertical
                        ? length
                        : CITY.sidewalkWidth

                ),

                sidewalkMaterial

            );

        sidewalk.rotation.x =
            -Math.PI / 2;

        sidewalk.position.y =
            0.025;

        if(vertical){

            sidewalk.position.x =
                position +
                side * offset;

        }else{

            sidewalk.position.z =
                position +
                side * offset;

        }

        sidewalk.receiveShadow =
            true;

        world.add(
            sidewalk
        );

    }

}

/* =========================================================
   ROAD GRID
   ========================================================= */

for(
    let p =
        -CITY.size / 2;

    p <=
        CITY.size / 2;

    p +=
        CITY.roadSpacing

){

    createRoad(
        p,
        true
    );

    createRoad(
        p,
        false
    );

}

loadingStep(
    8,
    "BUILDING ROAD NETWORK..."
);

/* =========================================================
   BUILDING SYSTEM
   ========================================================= */

const buildingMaterials = [

    0x30383c,
    0x414a4e,
    0x535a5d,
    0x65696a,
    0x393d40,
    0x59534d,
    0x727477

];

const buildings = [];

function createBuilding(
    x,
    z,
    width,
    depth,
    height,
    index
){

    const group =
        new THREE.Group();

    group.name =
        "Building_" +
        index;

    const color =
        buildingMaterials[
            Math.floor(
                seededRandom(
                    index * 9.31
                ) *
                buildingMaterials.length
            )
        ];

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),

            getMaterial(
                color,
                {
                    roughness: .82
                }
            )

        );

    body.position.y =
        height / 2;

    body.castShadow =
        true;

    body.receiveShadow =
        true;

    group.add(
        body
    );

    /* rooftop */

    if(
        height > 70
    ){

        const roof =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    width * .88,
                    1.5,
                    depth * .88
                ),

                getMaterial(
                    0x25292b
                )

            );

        roof.position.y =
            height + .75;

        roof.castShadow =
            true;

        group.add(
            roof
        );

    }

    /* windows */

    const windowMaterial =
        new THREE.MeshBasicMaterial({
            color:
                height > 80
                ? 0x274653
                : 0x35464d
        });

    const columns =
        Math.max(
            2,
            Math.floor(
                width / 3.2
            )
        );

    const floors =
        Math.max(
            2,
            Math.floor(
                height / 4
            )
        );

    const windowWidth =
        Math.min(
            1.25,
            width /
            columns *
            .55
        );

    for(
        let floor = 0;
        floor < floors;
        floor++
    ){

        for(
            let column = 0;
            column < columns;
            column++
        ){

            const randomValue =
                seededRandom(
                    index *
                    100 +
                    floor *
                    17 +
                    column *
                    5
                );

            if(
                randomValue <
                .12
            ){

                continue;

            }

            const window =
                new THREE.Mesh(

                    new THREE.PlaneGeometry(
                        windowWidth,
                        1.35
                    ),

                    windowMaterial

                );

            window.position.set(

                -width / 2 +
                1.5 +
                column *
                (
                    width /
                    columns
                ),

                2 +
                floor * 4,

                depth / 2 + .01

            );

            group.add(
                window
            );

            const backWindow =
                window.clone();

            backWindow.rotation.y =
                Math.PI;

            backWindow.position.z =
                -depth / 2 - .01;

            group.add(
                backWindow
            );

        }

    }

    group.position.set(
        x,
        0,
        z
    );

    world.add(
        group
    );

    buildings.push({

        x,
        z,

        width,
        depth,
        height,

        mesh: group

    });

}

/* =========================================================
   BUILD CITY BLOCKS
   ========================================================= */

let buildingIndex = 0;

const half =
    CITY.size / 2;

for(
    let x =
        -half + 30;

    x <
        half;

    x +=
        CITY.roadSpacing

){

    for(
        let z =
            -half + 30;

        z <
            half;

        z +=
            CITY.roadSpacing

    ){

        const blockMin =
            42;

        const blockMax =
            CITY.roadSpacing -
            42;

        const width =
            25 +
            seededRandom(
                buildingIndex * 3
            ) *
            (
                blockMax -
                blockMin
            );

        const depth =
            25 +
            seededRandom(
                buildingIndex * 5
            ) *
            (
                blockMax -
                blockMin
            );

        const height =
            CITY.buildingMinHeight +
            seededRandom(
                buildingIndex * 7
            ) *
            (
                CITY.buildingMaxHeight -
                CITY.buildingMinHeight
            );

        createBuilding(

            x +
            seededRandom(
                buildingIndex * 11
            ) *
            25 -
            12,

            z +
            seededRandom(
                buildingIndex * 13
            ) *
            25 -
            12,

            width,
            depth,
            height,

            buildingIndex

        );

        buildingIndex++;

    }

}

UltimateCity.buildings =
    buildings;

loadingStep(
    12,
    "GENERATING BUILDINGS..."
);

/* =========================================================
   STREET LIGHTS
   ========================================================= */

const streetLightMaterial =
    getMaterial(
        0x25292b,
        {
            metalness: .7,
            roughness: .35
        }
    );

const lampMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffe6a6
    });

function createStreetLight(
    x,
    z
){

    const group =
        new THREE.Group();

    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .09,
                .13,
                5,
                8
            ),

            streetLightMaterial

        );

    pole.position.y =
        2.5;

    group.add(
        pole
    );

    const arm =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.3,
                .08,
                .08
            ),

            streetLightMaterial

        );

    arm.position.set(
        .55,
        4.9,
        0
    );

    group.add(
        arm
    );

    const lamp =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .16,
                8,
                8
            ),

            lampMaterial

        );

    lamp.position.set(
        1.15,
        4.82,
        0
    );

    group.add(
        lamp
    );

    const light =
        new THREE.PointLight(
            0xffd990,
            .9,
            20
        );

    light.position.set(
        1.15,
        4.8,
        0
    );

    group.add(
        light
    );

    group.position.set(
        x,
        0,
        z
    );

    world.add(
        group
    );

}

/* =========================================================
   STREET LIGHT GRID
   ========================================================= */

let lightCounter = 0;

for(
    const road of roads
){

    if(
        lightCounter > 300
    ){

        break;

    }

    if(
        road.vertical
    ){

        for(
            let z = -900;
            z < 900;
            z += 90
        ){

            createStreetLight(
                road.position +
                21,
                z
            );

            lightCounter++;

            if(
                lightCounter > 300
            ) break;

        }

    }else{

        for(
            let x = -900;
            x < 900;
            x += 90
        ){

            createStreetLight(
                x,
                road.position +
                21
            );

            lightCounter++;

            if(
                lightCounter > 300
            ) break;

        }

    }

}

loadingStep(
    8,
    "ADDING CITY LIGHTING..."
);

/* =========================================================
   TREES
   ========================================================= */

const treeTrunkMaterial =
    getMaterial(
        0x4a3221,
        {
            roughness: 1
        }
    );

const treeLeafMaterial =
    getMaterial(
        0x285b35,
        {
            roughness: 1
        }
    );

function createTree(
    x,
    z,
    scale
){

    const tree =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .18 * scale,
                .27 * scale,
                2.2 * scale,
                8
            ),

            treeTrunkMaterial

        );

    trunk.position.y =
        1.1 * scale;

    trunk.castShadow =
        true;

    tree.add(
        trunk
    );

    const crown =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                1.5 * scale,
                12,
                10
            ),

            treeLeafMaterial

        );

    crown.position.y =
        2.8 * scale;

    crown.castShadow =
        true;

    tree.add(
        crown
    );

    tree.position.set(
        x,
        0,
        z
    );

    world.add(
        tree
    );

}

/* =========================================================
   TREE DISTRIBUTION
   ========================================================= */

for(
    let i = 0;
    i < 450;
    i++
){

    const x =
        (
            seededRandom(
                i * 19
            ) -
            .5
        ) *
        1900;

    const z =
        (
            seededRandom(
                i * 23
            ) -
            .5
        ) *
        1900;

    const nearRoad =
        roads.some(
            road => {

                if(
                    road.vertical
                ){

                    return (
                        Math.abs(
                            x -
                            road.position
                        ) <
                        34
                    );

                }

                return (
                    Math.abs(
                        z -
                        road.position
                    ) <
                    34
                );

            }
        );

    if(
        nearRoad
    ){

        continue;

    }

    createTree(
        x,
        z,
        .7 +
        seededRandom(
            i * 29
        ) *
        .9
    );

}

/* =========================================================
   SKY OBJECTS
   ========================================================= */

const sunGlow =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            18,
            16,
            16
        ),

        new THREE.MeshBasicMaterial({
            color:
                0xffe5a5
        })

    );

sunGlow.position.set(
    300,
    550,
    -500
);

scene.add(
    sunGlow
);

/* =========================================================
   GAME TIME
   ========================================================= */

function updateDayNight(
    delta
){

    UltimateCity.time +=
        delta *
        .12;

    if(
        UltimateCity.time >= 24
    ){

        UltimateCity.time -=
            24;

    }

    const normalized =
        UltimateCity.time /
        24;

    const angle =
        normalized *
        Math.PI *
        2 -
        Math.PI / 2;

    const daylight =
        THREE.MathUtils.clamp(
            Math.sin(angle) *
            .5 +
            .5,

            .06,
            1
        );

    sun.position.set(

        Math.cos(angle) *
        600,

        Math.sin(angle) *
        600,

        250

    );

    sun.intensity =
        .4 +
        daylight *
        3.3;

    hemisphere.intensity =
        .5 +
        daylight *
        1.6;

    const sky =
        new THREE.Color();

    sky.setHSL(

        .56,

        .25,

        .12 +
        daylight *
        .42

    );

    scene.background.copy(
        sky
    );

    scene.fog.color.copy(
        sky
    );

}

/* =========================================================
   PAUSE
   ========================================================= */

function togglePause(){

    UltimateCity.paused =
        !UltimateCity.paused;

    if(
        pauseScreen
    ){

        pauseScreen.classList.toggle(
            "visible",
            UltimateCity.paused
        );

    }

}

/* =========================================================
   KEYBOARD
   ========================================================= */

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;

        if(
            event.code ===
            "Escape"
        ){

            togglePause();

        }

    }
);

window.addEventListener(
    "keyup",
    event => {

        keys[event.code] =
            false;

    }
);

UltimateCity.keys =
    keys;

/* =========================================================
   RESIZE
   ========================================================= */

function resize(){

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
        width,
        height
    );

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

}

window.addEventListener(
    "resize",
    resize
);

/* =========================================================
   FPS COUNTER
   ========================================================= */

function updateStats(){

    UltimateCity.stats.frames++;

    const now =
        performance.now();

    if(
        now -
        UltimateCity.stats.lastTime
        >=
        1000
    ){

        UltimateCity.stats.fps =
            UltimateCity.stats.frames;

        UltimateCity.stats.frames =
            0;

        UltimateCity.stats.lastTime =
            now;

    }

}

/* =========================================================
   MODULE SYSTEM
   ========================================================= */

UltimateCity.registerModule =
    function(
        name,
        module
    ){

        UltimateCity.modules[
            name
        ] = module;

    };

UltimateCity.getModule =
    function(
        name
    ){

        return UltimateCity.modules[
            name
        ];

    };

/* =========================================================
   UPDATE MODULES
   ========================================================= */

function updateModules(
    delta
){

    for(
        const module
        of Object.values(
            UltimateCity.modules
        )
    ){

        if(
            module &&
            typeof module.update ===
            "function"
        ){

            module.update(
                delta
            );

        }

    }

}

/* =========================================================
   MAIN LOOP
   ========================================================= */

function gameLoop(){

    requestAnimationFrame(
        gameLoop
    );

    const rawDelta =
        UltimateCity.clock
            .getDelta();

    UltimateCity.delta =
        Math.min(
            rawDelta,
            .05
        );

    if(
        !UltimateCity.paused
    ){

        updateDayNight(
            UltimateCity.delta
        );

        updateModules(
            UltimateCity.delta
        );

    }

    updateStats();

    renderer.render(
        scene,
        camera
    );

}

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initialize(){

    loadingStep(
        5,
        "LOADING CORE SYSTEMS..."
    );

    UltimateCity.clock.start();

    loadingStep(
        5,
        "LOADING GAME WORLD..."
    );

    UltimateCity.ready =
        true;

    setTimeout(
        () => {

            if(
                loading
            ){

                loading.classList.add(
                    "hidden"
                );

            }

            if(
                hud
            ){

                hud.style.display =
                    "block";

            }

        },
        350
    );

    gameLoop();

}

initialize();

/* =========================================================
   PUBLIC API
   ========================================================= */

window.THREE =
    THREE;

window.Game =
    UltimateCity;

console.log(
    "%cULTIMATE CITY",
    "font-size:28px;font-weight:900"
);

console.log(
    "Core engine initialized."
);

console.log(
    "Version:",
    UltimateCity.version
);
