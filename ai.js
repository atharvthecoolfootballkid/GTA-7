/* =========================================================
   ULTIMATE WORLD — ADVANCED AI SYSTEM
   NPC States • Awareness • Navigation • Pursuit • Fleeing
   ========================================================= */

(() => {

"use strict";

const UC =
    window.UltimateCity ||
    window.UltimateWorld;

const THREE = window.THREE;

if (!UC || !THREE) {
    console.error("AI system could not start.");
    return;
}

const AI = {

    initialized:false,

    agents:[],

    maxAgents:100,

    detectionRange:35,

    alertRange:60,

    states:{
        IDLE:"idle",
        WANDER:"wander",
        ALERT:"alert",
        FLEE:"flee",
        FOLLOW:"follow",
        CHASE:"chase"
    },

    init(){

        this.findAgents();

        this.initialized=true;

        console.log(
            "Advanced AI initialized:",
            this.agents.length,
            "agents"
        );

    },

    /* =====================================================
       FIND NPCS
       ===================================================== */

    findAgents(){

        this.agents=[];

        const sources=[];

        if(
            window.UltimateCity &&
            UltimateCity.pedestrians
        ){

            sources.push(
                UltimateCity.pedestrians
            );

        }

        if(
            UC.pedestrians
        ){

            sources.push(
                UC.pedestrians
            );

        }

        const pedestrianSystem =
            UC.modules &&
            UC.modules.pedestrians;

        if(
            pedestrianSystem &&
            pedestrianSystem.people
        ){

            sources.push(
                pedestrianSystem.people
            );

        }

        for(
            const source
            of sources
        ){

            if(
                !Array.isArray(source)
            ){

                continue;

            }

            for(
                const person
                of source
            ){

                if(
                    person &&
                    person.position &&
                    !this.agents.includes(
                        person
                    )
                ){

                    this.setupAgent(
                        person
                    );

                    this.agents.push(
                        person
                    );

                }

            }

        }

    },

    /* =====================================================
       AGENT SETUP
       ===================================================== */

    setupAgent(
        agent
    ){

        if(
            !agent.userData
        ){

            agent.userData={};

        }

        agent.userData.ai = {

            state:
                this.states.WANDER,

            health:
                100,

            awareness:
                0,

            target:
                null,

            targetPosition:
                new THREE.Vector3(),

            stateTimer:
                Math.random()*5,

            decisionTimer:
                0,

            speed:
                1+
                Math.random()*2,

            home:
                agent.position.clone()

        };

    },

    /* =====================================================
       PLAYER
       ===================================================== */

    getPlayer(){

        if(
            UC.player &&
            UC.player.position
        ){

            return UC.player;

        }

        if(
            window.player &&
            window.player.position
        ){

            return window.player;

        }

        return null;

    },

    /* =====================================================
       DISTANCE
       ===================================================== */

    distanceToPlayer(
        agent,
        player
    ){

        return agent.position.distanceTo(
            player.position
        );

    },

    /* =====================================================
       STATE DECISION
       ===================================================== */

    decideState(
        agent,
        player
    ){

        const ai =
            agent.userData.ai;

        const distance =
            this.distanceToPlayer(
                agent,
                player
            );

        ai.stateTimer-=0.1;

        if(
            ai.stateTimer>0
        ){

            return;

        }

        ai.stateTimer=
            2+
            Math.random()*4;

        /*
         * Nearby player:
         * mostly stay calm.
         * Only become alert when
         * the player is very close.
         */

        if(
            distance<
            this.detectionRange
        ){

            if(
                ai.state===
                this.states.FLEE
            ){

                return;

            }

            if(
                Math.random()<0.15
            ){

                ai.state=
                    this.states.ALERT;

                ai.awareness=
                    1;

                return;

            }

        }

        if(
            ai.state===
            this.states.ALERT
        ){

            if(
                distance>
                this.detectionRange*1.5
            ){

                ai.state=
                    this.states.WANDER;

            }

            return;

        }

        if(
            Math.random()<0.12
        ){

            ai.state=
                this.states.IDLE;

        }

        else{

            ai.state=
                this.states.WANDER;

        }

    },

    /* =====================================================
       WANDER
       ===================================================== */

    wander(
        agent
    ){

        const ai =
            agent.userData.ai;

        if(
            !ai.targetPosition ||
            agent.position.distanceTo(
                ai.targetPosition
            )<3
        ){

            ai.targetPosition.set(

                agent.position.x+
                (
                    Math.random()-.5
                )*
                100,

                agent.position.y,

                agent.position.z+
                (
                    Math.random()-.5
                )*
                100

            );

        }

        this.moveToward(
            agent,
            ai.targetPosition,
            ai.speed
        );

    },

    /* =====================================================
       IDLE
       ===================================================== */

    idle(
        agent
    ){

        const ai =
            agent.userData.ai;

        ai.stateTimer-=0.016;

        if(
            ai.stateTimer<=0
        ){

            ai.state=
                this.states.WANDER;

            ai.stateTimer=
                2+
                Math.random()*4;

        }

    },

    /* =====================================================
       ALERT
       ===================================================== */

    alert(
        agent,
        player
    ){

        if(
            !player
        ){

            return;

        }

        const direction =
            player.position.clone()
            .sub(
                agent.position
            );

        if(
            direction.lengthSq()>0
        ){

            direction.normalize();

            const target =
                agent.position.clone()
                .add(
                    direction
                );

            agent.lookAt(
                target.x,
                agent.position.y,
                target.z
            );

        }

    },

    /* =====================================================
       FLEE
       ===================================================== */

    flee(
        agent,
        player
    ){

        if(
            !player
        ){

            return;

        }

        const away =
            agent.position.clone()
            .sub(
                player.position
            );

        away.y=0;

        if(
            away.lengthSq()<0.001
        ){

            away.set(
                1,
                0,
                0
            );

        }

        away.normalize();

        const target =
            agent.position.clone()
            .add(
                away.multiplyScalar(
                    30
                )
            );

        this.moveToward(
            agent,
            target,
            aiSpeed(agent)*1.5
        );

    },

    /* =====================================================
       MOVE
       ===================================================== */

    moveToward(
        agent,
        target,
        speed
    ){

        const direction =
            target.clone()
            .sub(
                agent.position
            );

        direction.y=0;

        const distance =
            direction.length();

        if(
            distance<
            0.2
        ){

            return;

        }

        direction.normalize();

        agent.position.x +=
            direction.x*
            speed*
            0.016;

        agent.position.z +=
            direction.z*
            speed*
            0.016;

        agent.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );

    },

    /* =====================================================
       AVOID OTHER AI
       ===================================================== */

    avoidAgents(
        agent
    ){

        const push =
            new THREE.Vector3();

        for(
            const other
            of this.agents
        ){

            if(
                other===agent
            ){

                continue;

            }

            const difference =
                agent.position.clone()
                .sub(
                    other.position
                );

            difference.y=0;

            const distance =
                difference.length();

            if(
                distance>0 &&
                distance<2
            ){

                push.add(
                    difference.normalize()
                    .multiplyScalar(
                        (
                            2-distance
                        )/2
                    )
                );

            }

        }

        agent.position.add(
            push.multiplyScalar(
                0.15
            )
        );

    },

    /* =====================================================
       UPDATE AGENT
       ===================================================== */

    updateAgent(
        agent,
        delta,
        player
    ){

        if(
            !agent.userData.ai
        ){

            this.setupAgent(
                agent
            );

        }

        const ai =
            agent.userData.ai;

        ai.decisionTimer+=
            delta;

        if(
            ai.decisionTimer>
            1
        ){

            ai.decisionTimer=0;

            this.decideState(
                agent,
                player
            );

        }

        switch(
            ai.state
        ){

            case this.states.IDLE:

                this.idle(
                    agent
                );

                break;

            case this.states.WANDER:

                this.wander(
                    agent
                );

                break;

            case this.states.ALERT:

                this.alert(
                    agent,
                    player
                );

                break;

            case this.states.FLEE:

                this.flee(
                    agent,
                    player
                );

                break;

            default:

                this.wander(
                    agent
                );

                break;

        }

        this.avoidAgents(
            agent
        );

    },

    /* =====================================================
       MAIN UPDATE
       ===================================================== */

    update(
        delta
    ){

        if(
            !this.initialized
        ){

            return;

        }

        if(
            this.agents.length<
            5
        ){

            this.findAgents();

        }

        const player =
            this.getPlayer();

        for(
            let i=0;
            i<this.agents.length;
            i++
        ){

            this.updateAgent(
                this.agents[i],
                delta,
                player
            );

        }

    }

};

function aiSpeed(
    agent
){

    if(
        agent &&
        agent.userData &&
        agent.userData.ai
    ){

        return agent.userData.ai.speed;

    }

    return 2;

}

if(
    typeof UC.registerModule===
    "function"
){

    UC.registerModule(
        "ai",
        AI
    );

}

function boot(){

    if(
        AI.initialized
    ){

        return;

    }

    try{

        AI.init();

    }catch(error){

        console.error(
            "AI initialization error:",
            error
        );

    }

}

if(
    document.readyState===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        ()=>{
            setTimeout(
                boot,
                1700
            );
        },
        {
            once:true
        }
    );

}else{

    setTimeout(
        boot,
        1700
    );

}

})();
