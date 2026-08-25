/* =========================================================
   ULTIMATE CITY — WORLD SYSTEM
   ========================================================= */

const UC = window.UltimateCity;

const THREE = window.THREE;

const WorldSystem = {

    objects: [],

    buildings: [],

    roads: [],

    props: [],

    zones: [],

    initialized: false,

    update(delta) {

        if (!this.initialized) return;

        this.animateProps(delta);

    },

    init() {

        this.initialized = true;

        this.cacheExistingWorld();

        this.createParks();

        this.createWater();

        this.createBridges();

        this.createBillboards();

        this.createLandmarks();

        this.createTrafficLights();

        console.log(
            "World system initialized."
        );

    },

    cacheExistingWorld() {

        if (UC.world) {

            UC.world.traverse(
                object => {

                    if (
                        object.isMesh ||
                        object.isGroup
                    ) {

                        this.objects.push(
                            object
                        );

                    }

                }
            );

        }

        if (UC.buildings) {

            this.buildings =
                UC.buildings;

        }

    },

    /* =====================================================
       PARKS
       ===================================================== */

    createParks() {

        const parkMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x263d2b,

                roughness: 1

            });

        const pathsMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x77736b,

                roughness: .95

            });

        const parks = [

            {
                x: -270,
                z: -270,
                w: 105,
                d: 105
            },

            {
                x: 450,
                z: -90,
                w: 125,
                d: 90
            },

            {
                x: -90,
                z: 450,
                w: 100,
                d: 125
            },

            {
                x: 540,
                z: 450,
                w: 140,
                d: 100
            }

        ];

        parks.forEach(
            park => {

                const ground =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            park.w,
                            .12,
                            park.d
                        ),

                        parkMaterial

                    );

                ground.position.set(
                    park.x,
                    .08,
                    park.z
                );

                ground.receiveShadow =
                    true;

                UC.world.add(
                    ground
                );

                this.objects.push(
                    ground
                );

                const path =
                    new THREE.Mesh(

                        new THREE.PlaneGeometry(
                            park.w * .8,
                            4
                        ),

                        pathsMaterial

                    );

                path.rotation.x =
                    -Math.PI / 2;

                path.position.set(
                    park.x,
                    .16,
                    park.z
                );

                UC.world.add(
                    path
                );

                this.props.push(
                    path
                );

                this.createParkTrees(
                    park
                );

            }
        );

    },

    createParkTrees(park) {

        for (
            let i = 0;
            i < 20;
            i++
        ) {

            const x =
                park.x +
                (
                    Math.random() -
                    .5
                ) *
                (
                    park.w -
                    12
                );

            const z =
                park.z +
                (
                    Math.random() -
                    .5
                ) *
                (
                    park.d -
                    12
                );

            const tree =
                new THREE.Group();

            const trunk =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        .18,
                        .25,
                        2.2,
                        8
                    ),

                    new THREE.MeshStandardMaterial({
                        color:
                            0x4b321f,
                        roughness:
                            1
                    })

                );

            trunk.position.y =
                1.1;

            const crown =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        1.6 +
                        Math.random() * .7,
                        12,
                        10
                    ),

                    new THREE.MeshStandardMaterial({
                        color:
                            0x315d35,
                        roughness:
                            1
                    })

                );

            crown.position.y =
                3;

            tree.add(
                trunk
            );

            tree.add(
                crown
            );

            tree.position.set(
                x,
                .15,
                z
            );

            UC.world.add(
                tree
            );

            this.props.push(
                tree
            );

        }

    },

    /* =====================================================
       WATER
       ===================================================== */

    createWater() {

        const water =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    800,
                    260
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x163d50,

                    metalness:
                        .25,

                    roughness:
                        .15,

                    transparent:
                        true,

                    opacity:
                        .86

                })

            );

        water.rotation.x =
            -Math.PI / 2;

        water.position.set(
            -300,
            -.03,
            690
        );

        UC.world.add(
            water
        );

        this.water =
            water;

    },

    /* =====================================================
       BRIDGES
       ===================================================== */

    createBridges() {

        const bridgeMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x3b4145,

                metalness:
                    .55,

                roughness:
                    .55

            });

        const bridge =
            new THREE.Group();

        const deck =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    250,
                    2,
                    34
                ),

                bridgeMaterial

            );

        deck.position.y =
            2.2;

        deck.castShadow =
            true;

        deck.receiveShadow =
            true;

        bridge.add(
            deck
        );

        for (
            let x = -110;
            x <= 110;
            x += 22
        ) {

            const support =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        2.5,
                        14,
                        2.5
                    ),

                    bridgeMaterial

                );

            support.position.set(
                x,
                -5,
                0
            );

            bridge.add(
                support
            );

        }

        bridge.position.set(
            200,
            0,
            700
        );

        UC.world.add(
            bridge
        );

        this.props.push(
            bridge
        );

    },

    /* =====================================================
       BILLBOARDS
       ===================================================== */

    createBillboards() {

        const billboardColors = [

            0x242a2e,
            0x353b3f,
            0x4a4e51,
            0x252d32

        ];

        for (
            let i = 0;
            i < 25;
            i++
        ) {

            const material =
                new THREE.MeshStandardMaterial({

                    color:
                        billboardColors[
                            i %
                            billboardColors.length
                        ],

                    roughness:
                        .65

                });

            const board =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        12,
                        6,
                        .35
                    ),

                    material

                );

            board.position.set(

                (
                    Math.random() -
                    .5
                ) *
                1500,

                25 +
                Math.random() * 40,

                (
                    Math.random() -
                    .5
                ) *
                1500

            );

            board.rotation.y =
                Math.random() *
                Math.PI *
                2;

            board.castShadow =
                true;

            UC.world.add(
                board
            );

            this.props.push(
                board
            );

        }

    },

    /* =====================================================
       LANDMARKS
       ===================================================== */

    createLandmarks() {

        this.createTower(
            -600,
            -500
        );

        this.createArena(
            600,
            -550
        );

        this.createObservationTower(
            -650,
            520
        );

    },

    createTower(x, z) {

        const group =
            new THREE.Group();

        const body =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    18,
                    28,
                    180,
                    24
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x454d51,

                    metalness:
                        .55,

                    roughness:
                        .45

                })

            );

        body.position.y =
            90;

        body.castShadow =
            true;

        group.add(
            body
        );

        const ring =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    23,
                    1.6,
                    10,
                    32
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x9aa2a5,

                    metalness:
                        .8,

                    roughness:
                        .25

                })

            );

        ring.rotation.x =
            Math.PI / 2;

        ring.position.y =
            125;

        group.add(
            ring
        );

        group.position.set(
            x,
            0,
            z
        );

        UC.world.add(
            group
        );

        this.props.push(
            group
        );

    },

    createArena(x, z) {

        const group =
            new THREE.Group();

        const base =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    70,
                    75,
                    12,
                    48
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x373c40,

                    roughness:
                        .8

                })

            );

        base.position.y =
            6;

        group.add(
            base
        );

        const roof =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    68,
                    68,
                    2,
                    48
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x202528,

                    metalness:
                        .25,

                    roughness:
                        .5

                })

            );

        roof.position.y =
            14;

        group.add(
            roof
        );

        group.position.set(
            x,
            0,
            z
        );

        UC.world.add(
            group
        );

        this.props.push(
            group
        );

    },

    createObservationTower(x, z) {

        const group =
            new THREE.Group();

        const legs = [];

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const angle =
                i *
                Math.PI /
                2;

            const leg =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        1.5,
                        2,
                        70,
                        8
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x4a5054,

                        metalness:
                            .65,

                        roughness:
                            .4

                    })

                );

            leg.position.set(

                Math.cos(angle) *
                18,

                35,

                Math.sin(angle) *
                18

            );

            group.add(
                leg
            );

        }

        const platform =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    28,
                    28,
                    4,
                    32
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x3b4145,

                    metalness:
                        .45,

                    roughness:
                        .5

                })

            );

        platform.position.y =
            70;

        group.add(
            platform
        );

        group.position.set(
            x,
            0,
            z
        );

        UC.world.add(
            group
        );

        this.props.push(
            group
        );

    },

    /* =====================================================
       TRAFFIC LIGHTS
       ===================================================== */

    createTrafficLights() {

        const positions = [

            [-90, -90],
            [90, -90],
            [-270, 90],
            [270, 90],
            [-450, -270],
            [450, 270]

        ];

        positions.forEach(
            ([x, z], index) => {

                this.createTrafficLight(
                    x,
                    z,
                    index
                );

            }
        );

    },

    createTrafficLight(
        x,
        z,
        index
    ) {

        const group =
            new THREE.Group();

        const pole =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    .15,
                    .18,
                    6,
                    8
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x252a2d,

                    metalness:
                        .65,

                    roughness:
                        .35

                })

            );

        pole.position.y =
            3;

        group.add(
            pole
        );

        const box =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .7,
                    2.1,
                    .55
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x16191b,

                    roughness:
                        .7

                })

            );

        box.position.set(
            0,
            5.2,
            0
        );

        group.add(
            box
        );

        const lights = [

            0xff3030,
            0xffc32e,
            0x39d56b

        ];

        lights.forEach(
            (
                color,
                lightIndex
            ) => {

                const lamp =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(
                            .14,
                            8,
                            8
                        ),

                        new THREE.MeshBasicMaterial({
                            color
                        })

                    );

                lamp.position.set(

                    0,

                    4.65 +
                    lightIndex *
                    .55,

                    .3

                );

                group.add(
                    lamp
                );

            }
        );

        group.position.set(
            x,
            0,
            z
        );

        UC.world.add(
            group
        );

        this.props.push(
            group
        );

    },

    /* =====================================================
       ANIMATION
       ===================================================== */

    animateProps(delta) {

        if (
            this.water
        ) {

            this.water.material.opacity =
                .82 +
                Math.sin(
                    performance.now() *
                    .001
                ) *
                .035;

        }

    }

};

UC.registerModule(
    "world",
    WorldSystem
);

WorldSystem.init();
