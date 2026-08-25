/* =========================================================
   ULTIMATE CITY — CITY UPGRADE
   Procedural 3D Open-World City
   ========================================================= */

(() => {

    "use strict";

    const UC = window.UltimateCity;

    if (!UC || !window.THREE) {
        console.error("City Upgrade: engine or THREE.js missing.");
        return;
    }

    const THREE = window.THREE;

    const CityUpgrade = {

        initialized: false,

        group: null,

        buildings: [],

        roads: [],

        lights: [],

        trees: [],

        props: [],

        worldSize: 2000,

        roadSpacing: 100,

        init() {

            if (!UC.scene && !UC.world) {
                console.warn(
                    "City Upgrade: world is not ready yet."
                );
                return;
            }

            this.group =
                new THREE.Group();

            this.group.name =
                "UltimateCityWorld";

            const scene =
                UC.scene ||
                UC.world;

            scene.add(
                this.group
            );

            this.createGround();

            this.createRoadNetwork();

            this.createBuildings();

            this.createParks();

            this.createWater();

            this.createStreetLights();

            this.createTrees();

            this.createLandmarks();

            this.initialized = true;

            console.log(
                "City Upgrade initialized."
            );

        },

        /* =====================================================
           GROUND
           ===================================================== */

        createGround() {

            const geometry =
                new THREE.PlaneGeometry(
                    this.worldSize,
                    this.worldSize
                );

            const material =
                new THREE.MeshStandardMaterial({

                    color: 0x39413d,

                    roughness: 1,

                    metalness: 0

                });

            const ground =
                new THREE.Mesh(
                    geometry,
                    material
                );

            ground.rotation.x =
                -Math.PI / 2;

            ground.position.y =
                -0.08;

            ground.receiveShadow =
                true;

            this.group.add(
                ground
            );

        },

        /* =====================================================
           ROADS
           ===================================================== */

        createRoadNetwork() {

            const roadWidth =
                18;

            const sidewalkWidth =
                4;

            const half =
                this.worldSize / 2;

            for (
                let x = -half;
                x <= half;
                x += this.roadSpacing
            ) {

                this.createRoad(
                    x,
                    0,
                    roadWidth,
                    this.worldSize,
                    true
                );

                this.createSidewalk(
                    x - roadWidth / 2 -
                    sidewalkWidth / 2,
                    0,
                    sidewalkWidth,
                    this.worldSize,
                    true
                );

                this.createSidewalk(
                    x + roadWidth / 2 +
                    sidewalkWidth / 2,
                    0,
                    sidewalkWidth,
                    this.worldSize,
                    true
                );

            }

            for (
                let z = -half;
                z <= half;
                z += this.roadSpacing
            ) {

                this.createRoad(
                    0,
                    z,
                    this.worldSize,
                    roadWidth,
                    false
                );

                this.createSidewalk(
                    0,
                    z - roadWidth / 2 -
                    sidewalkWidth / 2,
                    this.worldSize,
                    sidewalkWidth,
                    false
                );

                this.createSidewalk(
                    0,
                    z + roadWidth / 2 +
                    sidewalkWidth / 2,
                    this.worldSize,
                    sidewalkWidth,
                    false
                );

            }

        },

        createRoad(
            x,
            z,
            width,
            depth,
            vertical
        ) {

            const geometry =
                new THREE.PlaneGeometry(
                    width,
                    depth
                );

            const material =
                new THREE.MeshStandardMaterial({

                    color:
                        0x202427,

                    roughness:
                        0.95

                });

            const road =
                new THREE.Mesh(
                    geometry,
                    material
                );

            road.rotation.x =
                -Math.PI / 2;

            road.position.set(
                x,
                0,
                z
            );

            if (
                vertical
            ) {

                road.rotation.z =
                    0;

            } else {

                road.rotation.z =
                    0;

            }

            road.receiveShadow =
                true;

            this.group.add(
                road
            );

            this.roads.push(
                road
            );

            this.createRoadLines(
                x,
                z,
                width,
                depth,
                vertical
            );

        },

        createRoadLines(
            x,
            z,
            width,
            depth,
            vertical
        ) {

            const lineMaterial =
                new THREE.MeshBasicMaterial({

                    color:
                        0xd9d29a

                });

            if (
                vertical
            ) {

                for (
                    let p = -depth / 2;
                    p < depth / 2;
                    p += 18
                ) {

                    const line =
                        new THREE.Mesh(

                            new THREE.PlaneGeometry(
                                0.18,
                                7
                            ),

                            lineMaterial

                        );

                    line.rotation.x =
                        -Math.PI / 2;

                    line.position.set(
                        x,
                        0.015,
                        z + p
                    );

                    this.group.add(
                        line
                    );

                }

            } else {

                for (
                    let p = -width / 2;
                    p < width / 2;
                    p += 18
                ) {

                    const line =
                        new THREE.Mesh(

                            new THREE.PlaneGeometry(
                                7,
                                0.18
                            ),

                            lineMaterial

                        );

                    line.rotation.x =
                        -Math.PI / 2;

                    line.position.set(
                        x + p,
                        0.015,
                        z
                    );

                    this.group.add(
                        line
                    );

                }

            }

        },

        /* =====================================================
           SIDEWALKS
           ===================================================== */

        createSidewalk(
            x,
            z,
            width,
            depth
        ) {

            const sidewalk =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width,
                        0.25,
                        depth
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x747876,

                        roughness:
                            1

                    })

                );

            sidewalk.position.set(
                x,
                0.1,
                z
            );

            sidewalk.receiveShadow =
                true;

            this.group.add(
                sidewalk
            );

        },

        /* =====================================================
           BUILDINGS
           ===================================================== */

        createBuildings() {

            const block =
                this.roadSpacing;

            const half =
                this.worldSize / 2;

            for (
                let x = -half + block / 2;
                x < half;
                x += block
            ) {

                for (
                    let z = -half + block / 2;
                    z < half;
                    z += block
                ) {

                    if (
                        this.isParkLocation(
                            x,
                            z
                        )
                    ) {

                        continue;

                    }

                    if (
                        Math.random() <
                        0.13
                    ) {

                        continue;

                    }

                    const count =
                        1 +
                        Math.floor(
                            Math.random() *
                            3
                        );

                    for (
                        let i = 0;
                        i < count;
                        i++
                    ) {

                        this.createBuilding(
                            x,
                            z
                        );

                    }

                }

            }

        },

        createBuilding(
            centerX,
            centerZ
        ) {

            const width =
                18 +
                Math.random() *
                22;

            const depth =
                18 +
                Math.random() *
                22;

            const height =
                12 +
                Math.pow(
                    Math.random(),
                    0.55
                ) *
                130;

            const colors = [

                0x565b5d,

                0x6b625b,

                0x4b5359,

                0x77716a,

                0x3f474c,

                0x625e58

            ];

            const color =
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];

            const building =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width,
                        height,
                        depth
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            color,

                        roughness:
                            0.85,

                        metalness:
                            0.05

                    })

                );

            building.position.set(

                centerX +
                (
                    Math.random() -
                    0.5
                ) *
                25,

                height / 2,

                centerZ +
                (
                    Math.random() -
                    0.5
                ) *
                25

            );

            building.castShadow =
                true;

            building.receiveShadow =
                true;

            building.userData = {

                building:
                    true,

                destructible:
                    false

            };

            this.group.add(
                building
            );

            this.buildings.push(
                building
            );

            this.createWindows(
                building
            );

            if (
                Math.random() <
                0.2
            ) {

                this.createRoofUnit(
                    building
                );

            }

        },

        /* =====================================================
           WINDOWS
           ===================================================== */

        createWindows(
            building
        ) {

            const width =
                building.geometry.parameters.width;

            const depth =
                building.geometry.parameters.depth;

            const height =
                building.geometry.parameters.height;

            const windowMaterial =
                new THREE.MeshBasicMaterial({

                    color:
                        Math.random() <
                        0.25
                            ? 0xffd783
                            : 0x8ba8b5

                });

            const spacing =
                4;

            for (
                let y = 5;
                y < height - 3;
                y += spacing
            ) {

                for (
                    let x =
                        -width / 2 + 3;

                    x <
                        width / 2 - 2;

                    x += spacing
                ) {

                    if (
                        Math.random() <
                        0.15
                    ) {

                        continue;

                    }

                    const window =
                        new THREE.Mesh(

                            new THREE.PlaneGeometry(
                                1.5,
                                1.8
                            ),

                            windowMaterial
                        );

                    window.position.set(
                        building.position.x +
                        x,
                        y,
                        building.position.z +
                        depth / 2 +
                        0.01
                    );

                    this.group.add(
                        window
                    );

                }

            }

        },

        /* =====================================================
           ROOFTOP EQUIPMENT
           ===================================================== */

        createRoofUnit(
            building
        ) {

            const unit =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        3,
                        1.5,
                        3
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x34383a,

                        roughness:
                            0.9

                    })

                );

            unit.position.set(

                building.position.x,

                building.position.y +
                building.geometry.parameters.height /
                2 +
                0.75,

                building.position.z

            );

            unit.castShadow =
                true;

            this.group.add(
                unit
            );

        },

        /* =====================================================
           PARKS
           ===================================================== */

        createParks() {

            const parks = [

                {
                    x: -350,
                    z: -350,
                    size: 75
                },

                {
                    x: 350,
                    z: 300,
                    size: 90
                },

                {
                    x: -400,
                    z: 400,
                    size: 65
                }

            ];

            parks.forEach(
                park => {

                    const ground =
                        new THREE.Mesh(

                            new THREE.BoxGeometry(
                                park.size,
                                0.18,
                                park.size
                            ),

                            new THREE.MeshStandardMaterial({

                                color:
                                    0x36563c,

                                roughness:
                                    1

                            })

                        );

                    ground.position.set(
                        park.x,
                        0.12,
                        park.z
                    );

                    ground.receiveShadow =
                        true;

                    this.group.add(
                        ground
                    );

                    for (
                        let i = 0;
                        i < 18;
                        i++
                    ) {

                        this.createTree(

                            park.x +
                            (
                                Math.random() -
                                0.5
                            ) *
                            park.size,

                            park.z +
                            (
                                Math.random() -
                                0.5
                            ) *
                            park.size

                        );

                    }

                }
            );

        },

        isParkLocation(
            x,
            z
        ) {

            const parks = [

                [-350, -350, 55],

                [350, 300, 65],

                [-400, 400, 45]

            ];

            return parks.some(
                park => {

                    return (

                        Math.abs(
                            x -
                            park[0]
                        ) <
                        park[2]

                        &&

                        Math.abs(
                            z -
                            park[1]
                        ) <
                        park[2]

                    );

                }
            );

        },

        /* =====================================================
           WATER
           ===================================================== */

        createWater() {

            const water =
                new THREE.Mesh(

                    new THREE.PlaneGeometry(
                        420,
                        650
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x17495b,

                        roughness:
                            0.25,

                        metalness:
                            0.15,

                        transparent:
                            true,

                        opacity:
                            0.9

                    })

                );

            water.rotation.x =
                -Math.PI / 2;

            water.position.set(
                700,
                0.02,
                200
            );

            this.group.add(
                water
            );

            this.createBridge(
                560,
                200
            );

        },

        /* =====================================================
           BRIDGE
           ===================================================== */

        createBridge(
            x,
            z
        ) {

            const bridge =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        180,
                        1,
                        24
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x4d5152,

                        roughness:
                            0.9

                    })

                );

            bridge.position.set(
                x,
                1,
                z
            );

            bridge.castShadow =
                true;

            bridge.receiveShadow =
                true;

            this.group.add(
                bridge
            );

            for (
                let i = -70;
                i <= 70;
                i += 20
            ) {

                const support =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            2,
                            15,
                            2
                        ),

                        new THREE.MeshStandardMaterial({

                            color:
                                0x393d3f

                        })

                    );

                support.position.set(
                    x + i,
                    -6,
                    z
                );

                this.group.add(
                    support
                );

            }

        },

        /* =====================================================
           STREET LIGHTS
           ===================================================== */

        createStreetLights() {

            const half =
                this.worldSize / 2;

            for (
                let x = -half;
                x <= half;
                x += 100
            ) {

                for (
                    let z = -half;
                    z <= half;
                    z += 100
                ) {

                    if (
                        Math.random() <
                        0.55
                    ) {

                        this.createStreetLight(
                            x + 12,
                            z + 12
                        );

                    }

                }

            }

        },

        createStreetLight(
            x,
            z
        ) {

            const pole =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.12,
                        0.18,
                        7,
                        8
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x303437,

                        roughness:
                            0.7

                    })

                );

            pole.position.set(
                x,
                3.5,
                z
            );

            pole.castShadow =
                true;

            this.group.add(
                pole
            );

            const lamp =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.25,
                        8,
                        8
                    ),

                    new THREE.MeshBasicMaterial({

                        color:
                            0xffdf9b

                    })

                );

            lamp.position.set(
                x,
                7,
                z
            );

            this.group.add(
                lamp
            );

            if (
                this.lights.length <
                80
            ) {

                const light =
                    new THREE.PointLight(

                        0xffd89a,

                        0.5,

                        18

                    );

                light.position.set(
                    x,
                    7,
                    z
                );

                this.group.add(
                    light
                );

                this.lights.push(
                    light
                );

            }

        },

        /* =====================================================
           TREES
           ===================================================== */

        createTrees() {

            for (
                let i = 0;
                i < 150;
                i++
            ) {

                const x =
                    Math.random() *
                    1700 -
                    850;

                const z =
                    Math.random() *
                    1700 -
                    850;

                this.createTree(
                    x,
                    z
                );

            }

        },

        createTree(
            x,
            z
        ) {

            const tree =
                new THREE.Group();

            const trunk =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.25,
                        0.35,
                        2.5,
                        7
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x60452e

                    })

                );

            trunk.position.y =
                1.25;

            trunk.castShadow =
                true;

            tree.add(
                trunk
            );

            const crown =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        1.7,
                        10,
                        8
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x315b35,

                        roughness:
                            1

                    })

                );

            crown.position.y =
                3.2;

            crown.castShadow =
                true;

            tree.add(
                crown
            );

            const scale =
                0.75 +
                Math.random() *
                0.8;

            tree.scale.setScalar(
                scale
            );

            tree.position.set(
                x,
                0,
                z
            );

            this.group.add(
                tree
            );

            this.trees.push(
                tree
            );

        },

        /* =====================================================
           LANDMARKS
           ===================================================== */

        createLandmarks() {

            this.createTower(
                -500,
                -80
            );

            this.createTower(
                420,
                -400
            );

            this.createArena(
                500,
                500
            );

        },

        createTower(
            x,
            z
        ) {

            const tower =
                new THREE.Group();

            const base =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        16,
                        22,
                        150,
                        16
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x59646a,

                        roughness:
                            0.55,

                        metalness:
                            0.15

                    })

                );

            base.position.y =
                75;

            base.castShadow =
                true;

            tower.add(
                base
            );

            const top =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        5,
                        12,
                        18,
                        12
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x77828a,

                        metalness:
                            0.35

                    })

                );

            top.position.y =
                159;

            tower.add(
                top
            );

            tower.position.set(
                x,
                0,
                z
            );

            this.group.add(
                tower
            );

        },

        createArena(
            x,
            z
        ) {

            const arena =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        55,
                        60,
                        18,
                        32
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x4b5054,

                        roughness:
                            0.8

                    })

                );

            arena.position.set(
                x,
                9,
                z
            );

            arena.castShadow =
                true;

            arena.receiveShadow =
                true;

            this.group.add(
                arena
            );

            const roof =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        47,
                        47,
                        2,
                        32
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0x303539,

                        metalness:
                            0.2

                    })

                );

            roof.position.set(
                x,
                20,
                z
            );

            this.group.add(
                roof
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

            /*
             * Tiny environmental motion.
             * Keeping this lightweight is important
             * for iPad performance.
             */

            for (
                let i = 0;
                i <
                Math.min(
                    this.trees.length,
                    150
                );
                i++
            ) {

                const tree =
                    this.trees[i];

                tree.rotation.z =
                    Math.sin(
                        performance.now() *
                        0.0005 +
                        i
                    ) *
                    0.008;

            }

        }

    };

    /*
     * Register with the existing engine.
     */

    if (
        typeof UC.registerModule ===
        "function"
    ) {

        UC.registerModule(
            "city-upgrade",
            CityUpgrade
        );

    }

    /*
     * Wait briefly for the world to exist.
     */

    const bootCity =
        () => {

            if (
                CityUpgrade.initialized
            ) {

                return;

            }

            try {

                CityUpgrade.init();

            } catch (
                error
            ) {

                console.error(
                    "City Upgrade failed:",
                    error
                );

            }

        };

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                setTimeout(
                    bootCity,
                    500
                );

            },
            {
                once: true
            }
        );

    } else {

        setTimeout(
            bootCity,
            500
        );

    }

})();
