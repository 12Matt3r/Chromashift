import * as THREE from 'three';

class ChromaShiftNavigator {
    constructor() {
        this.container = document.getElementById('panorama-container');
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.panoramaSphere = null;
        
        // Camera control
        this.isUserInteracting = false;
        this.longitude = 0;
        this.latitude = 0;
        this.phi = 0;
        this.theta = 0;
        this.onPointerDownPointerX = 0;
        this.onPointerDownPointerY = 0;
        this.onPointerDownLongitude = 0;
        this.onPointerDownLatitude = 0;

        // Dream state variables with progression tracking
        this.dreamState = {
            lucidity: 47,
            perception: 'DISTORTED',
            realityCoherence: 23,
            anomalyCount: 0,
            dreamTier: 1, // Progression tier (1-5)
            whispersCompleted: 0,
            whispersFailed: 0,
            descentLevel: 0 // How hostile the dream is becoming
        };

        // Mission/Arc tracking
        this.currentMission = null;
        this.activeMissions = [];
        this.completedMissions = [];
        this.missionHistory = [];

        // Current scene data
        this.currentScene = {
            title: 'CHROMA-DREAM INITIALIZATION',
            description: '',
            wtfMoment: 'Floor liquefaction observed',
            panoramaUrl: 'imgs/supermarket_dreamscape_7.png',
            hasMission: false,
            missionChoice: null
        };

        // Initialize all choice outcomes and missions
        this.choiceOutcomes = this.initializeChoiceOutcomes();
        this.missionArcs = this.initializeMissionArcs();

        // Subconscious whispers
        this.whispers = [
            "The products remember when they were trees...",
            "Time tastes like copper here...",
            "The floor knows your name...",
            "Gravity is just a suggestion...",
            "The mascot sees through all timelines...",
            "Mercury dreams of being solid again...",
            "Your reflection is walking independently...",
            "The neon signs are speaking in tongues...",
            "Reality is on lunch break...",
            "Follow the trophy. It knows your worth...",
            "The mission whispers your name...",
            "Progression is an illusion... or is it?",
            "The dream rewards those who seek patterns..."
        ];

        this.init();
    }

    async init() {
        this.setupScene();
        this.setupEvents();
        this.loadInitialScene();
        this.startDreamCycle();
        await this.hideSplashScreen();
    }

    setupScene() {
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            1100
        );
        this.camera.position.set(0, 0, 0.1);

        // Scene setup
        this.scene = new THREE.Scene();

        // Hyper-bright surreal lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Dream-glow directional lights
        const dreamLight1 = new THREE.DirectionalLight(0xff00ff, 0.6);
        dreamLight1.position.set(100, 100, 100);
        this.scene.add(dreamLight1);

        const dreamLight2 = new THREE.DirectionalLight(0x00ffff, 0.6);
        dreamLight2.position.set(-100, -100, -100);
        this.scene.add(dreamLight2);

        // Point light for shimmer effect
        const shimmerLight = new THREE.PointLight(0xffd700, 1.5, 500);
        shimmerLight.position.set(0, 200, 0);
        this.scene.add(shimmerLight);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        this.container.appendChild(this.renderer.domElement);

        // Start animation loop
        this.animate();
    }

    loadPanorama(imageUrl) {
        if (this.panoramaSphere) {
            this.scene.remove(this.panoramaSphere);
            if (this.panoramaSphere.material.map) {
                this.panoramaSphere.material.map.dispose();
            }
            this.panoramaSphere.material.dispose();
            this.panoramaSphere.geometry.dispose();
        }

        const loader = new THREE.TextureLoader();
        loader.load(
            imageUrl,
            (texture) => {
                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1);

                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.BackSide,
                    transparent: true,
                    opacity: 0.95
                });

                this.panoramaSphere = new THREE.Mesh(geometry, material);
                this.scene.add(this.panoramaSphere);
                this.addDistortionEffect();
            },
            undefined,
            (error) => {
                console.error('Error loading panorama:', error);
                this.loadFallbackPanorama();
            }
        );
    }

    loadFallbackPanorama() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF10F0');
        gradient.addColorStop(0.5, '#00FFFF');
        gradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 100 + 20,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });

        this.panoramaSphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.panoramaSphere);
    }

    addDistortionEffect() {
        const distortionLoop = () => {
            if (this.panoramaSphere) {
                const time = Date.now() * 0.0005;
                this.panoramaSphere.rotation.y = Math.sin(time) * 0.02;
                this.panoramaSphere.scale.set(
                    1 + Math.sin(time * 1.5) * 0.01,
                    1 + Math.cos(time * 1.2) * 0.01,
                    1 + Math.sin(time * 0.8) * 0.01
                );
            }
            requestAnimationFrame(distortionLoop);
        };
        distortionLoop();
    }

    setupEvents() {
        // Panorama controls
        this.container.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.container.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.container.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.container.addEventListener('wheel', this.onWheel.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Choice button events (now 5 choices)
        const choiceBubbles = document.querySelectorAll('.choice-bubble');
        choiceBubbles.forEach((bubble, index) => {
            bubble.addEventListener('click', () => this.handleChoice(index + 1));
        });

        // Generative command interface events
        this.setupCommandInterface();

        // Info modal events
        const infoBtn = document.getElementById('info-btn');
        const infoModal = document.getElementById('info-modal');
        const closeInfo = document.getElementById('close-info');

        if (infoBtn && infoModal && closeInfo) {
            infoBtn.addEventListener('click', () => {
                infoModal.classList.remove('hidden');
            });

            closeInfo.addEventListener('click', () => {
                infoModal.classList.add('hidden');
            });

            infoModal.addEventListener('click', (e) => {
                if (e.target === infoModal) {
                    infoModal.classList.add('hidden');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !infoModal.classList.contains('hidden')) {
                    infoModal.classList.add('hidden');
                }
            });
        }
    }

    setupCommandInterface() {
        // Location Shift button
        const shiftButton = document.getElementById('shift-button');
        const locationInput = document.getElementById('location-input');

        if (shiftButton && locationInput) {
            shiftButton.addEventListener('click', () => this.handleLocationShift());
            locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLocationShift();
            });
        }

        // Action Manifestation button
        const manifestButton = document.getElementById('manifest-button');
        const actionInput = document.getElementById('action-input');

        if (manifestButton && actionInput) {
            manifestButton.addEventListener('click', () => this.handleActionManifestation());
            actionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleActionManifestation();
            });
        }
    }

    handleLocationShift() {
        const locationInput = document.getElementById('location-input');
        const locationText = locationInput.value.trim();

        if (!locationText) {
            this.flashInputWarning(locationInput, 'Enter a destination...');
            return;
        }

        console.log(`Location Shift: ${locationText}`);
        
        // Trigger reality shift sequence
        this.triggerRealityBlink();
        
        setTimeout(() => {
            this.triggerEyeBlink(() => {
                this.generateLocationShift(locationText);
                locationInput.value = '';
            });
        }, 300);
    }

    handleActionManifestation() {
        const actionInput = document.getElementById('action-input');
        const actionText = actionInput.value.trim();

        if (!actionText) {
            this.flashInputWarning(actionInput, 'Describe your action...');
            return;
        }

        console.log(`Action Manifestation: ${actionText}`);
        
        // Trigger reality shift sequence
        this.triggerRealityBlink();
        
        setTimeout(() => {
            this.triggerEyeBlink(() => {
                this.generateActionOutcome(actionText);
                actionInput.value = '';
            });
        }, 300);
    }

    flashInputWarning(inputEl, message) {
        const originalPlaceholder = inputEl.placeholder;
        inputEl.placeholder = message;
        inputEl.style.borderColor = 'var(--melting-orange)';
        inputEl.style.animation = 'input-shake 0.3s';
        
        setTimeout(() => {
            inputEl.placeholder = originalPlaceholder;
            inputEl.style.borderColor = 'var(--neon-pink)';
            inputEl.style.animation = '';
        }, 1500);
    }

    generateLocationShift(locationText) {
        // Generative AI interpretation of player's location input
        const interpretedLocation = this.interpretLocation(locationText);
        
        this.currentScene = {
            title: interpretedLocation.title,
            description: interpretedLocation.description,
            wtfMoment: interpretedLocation.wtfMoment,
            panoramaUrl: this.currentScene.panoramaUrl,
            hasMission: false,
            missionChoice: null
        };

        // Apply dream state changes
        if (interpretedLocation.statsChange) {
            this.applyStatsChange(interpretedLocation.statsChange);
        }

        this.updateScene();
        this.updateChoiceBubbles(interpretedLocation.choices);
        
        setTimeout(() => {
            this.triggerWhisper();
        }, 2000);

        // Show notification
        this.showNotification(
            'REALITY SHIFTED',
            `Manifested: ${interpretedLocation.title}`,
            'info'
        );
    }

    generateActionOutcome(actionText) {
        // Generative AI interpretation of player's action
        const interpretedOutcome = this.interpretAction(actionText, this.currentScene);
        
        this.currentScene = {
            ...this.currentScene,
            description: interpretedOutcome.description,
            wtfMoment: interpretedOutcome.wtfMoment
        };

        // Apply dream state changes
        if (interpretedOutcome.statsChange) {
            this.applyStatsChange(interpretedOutcome.statsChange);
        }

        this.updateScene();
        
        if (interpretedOutcome.newChoices) {
            this.updateChoiceBubbles(interpretedOutcome.newChoices);
        }

        setTimeout(() => {
            this.triggerWhisper();
        }, 2000);

        // Show notification
        this.showNotification(
            'ACTION MANIFESTED',
            interpretedOutcome.resultTitle,
            'success'
        );
    }

    interpretLocation(locationText) {
        // Surrealist interpretation engine for locations
        const lowerLocation = locationText.toLowerCase();
        
        // Pattern matching for common location types
        if (lowerLocation.includes('ocean') || lowerLocation.includes('sea') || lowerLocation.includes('beach')) {
            return this.generateOceanDreamscape(locationText);
        } else if (lowerLocation.includes('sky') || lowerLocation.includes('cloud') || lowerLocation.includes('air')) {
            return this.generateSkyDreamscape(locationText);
        } else if (lowerLocation.includes('forest') || lowerLocation.includes('wood') || lowerLocation.includes('tree')) {
            return this.generateForestDreamscape(locationText);
        } else if (lowerLocation.includes('city') || lowerLocation.includes('urban') || lowerLocation.includes('street')) {
            return this.generateUrbanDreamscape(locationText);
        } else if (lowerLocation.includes('desert') || lowerLocation.includes('sand') || lowerLocation.includes('dune')) {
            return this.generateDesertDreamscape(locationText);
        } else if (lowerLocation.includes('space') || lowerLocation.includes('void') || lowerLocation.includes('cosmos')) {
            return this.generateSpaceDreamscape(locationText);
        } else if (lowerLocation.includes('home') || lowerLocation.includes('house') || lowerLocation.includes('room')) {
            return this.generateHomeDreamscape(locationText);
        } else {
            // Default surreal interpretation
            return this.generateAbstractDreamscape(locationText);
        }
    }

    generateUrbanDreamscape(locationText) {
        const urbanScenarios = [
            {
                title: `${locationText.toUpperCase()} [GEOMETRIC TRAFFIC ZONE]`,
                description: `You blink and find yourself on a city street corner. The asphalt ripples beneath your feet like fabric in a gentle breeze, each footstep sending waves across the surface that disturb the painted lane markings. They float upward like yellow ribbons.

Traffic flows around you—cars without tires, gliding on impossible geometric shapes: dodecahedrons, fractaling icosahedrons, tesseracts that hurt to look at directly. They make no sound. The silence is profound and wrong.

Street signs point in directions that don't exist: "NORTH-PURPLE," "YESTERDAY LANE," "↗️SIDEWAYS AVENUE." A traffic light cycles through colors that haven't been invented yet—something between ultraviolet and nostalgia.

The buildings lean at angles that defy physics, their windows reflecting scenes from different times and places. One shows your childhood bedroom. Another shows a city that was never built. A third shows only darkness watching back.`,
                wtfMoment: 'Buildings reflecting impossible memories',
                statsChange: { lucidity: -8, realityCoherence: -10 },
                choices: [
                    'Touch the rippling asphalt',
                    'Follow a geometric car',
                    'Walk toward Yesterday Lane',
                    'Look into your childhood window'
                ]
            },
            {
                title: `${locationText.toUpperCase()} [VERTICAL ARCHITECTURE]`,
                description: `The city has rotated ninety degrees, but gravity hasn't noticed. You stand on what was once a building's wall, now the ground. Windows beneath your feet show people walking normally in their offices—to them, you're on the wall.

Skyscrapers extend infinitely upward and downward. Elevators travel in directions that include "perhaps" and "eventually." The sky is made of concrete. The ground is made of clouds that support your weight with the texture of velvet.

Neon signs spell out sentences that change meaning as you read them: "OPEN 24/7" becomes "OPEN NEVER" becomes "OPEN YOUR EYES YOU'RE STILL DREAMING."

A businessman walks past you, briefcase in hand, his tie defying gravity by pointing toward the nearest source of ambition. He tips his hat, which is actually a small thunderstorm.`,
                wtfMoment: 'Businessman with thunderstorm hat',
                statsChange: { lucidity: +15, realityCoherence: -15 },
                choices: [
                    'Take the elevator to "Eventually"',
                    'Walk on the cloud-ground',
                    'Follow the storm-hatted businessman',
                    'Knock on a window beneath you'
                ]
            }
        ];

        return urbanScenarios[Math.floor(Math.random() * urbanScenarios.length)];
    }

    generateOceanDreamscape(locationText) {
        return {
            title: `${locationText.toUpperCase()} [LIQUID CONSCIOUSNESS]`,
            description: `The ocean stretches before you, but it's not made of water. It's made of liquid memory—translucent, shimmering, and thick like mercury. Each wave that rolls in brings forgotten moments: your third birthday, the smell of your grandmother's kitchen, a conversation you had in a language you don't speak.

The beach is made of crystallized regrets, each grain of sand a decision you didn't make. They crunch under your feet and whisper "what if" in tiny voices.

Above you, the sky is underwater. Fish swim through the air, leaving trails of reversed rain that falls upward. Seagulls dive through the ocean depths below the horizon. The sun is drowning, setting in slow motion, its light refracting through the memory-water in colors that make you feel emotions that don't have names.

A ship sails past, but it's sailing through the sky. Its captain waves. The ship is made entirely of origami. It's on fire, but the fire is cold and blue and laughs like children.`,
            wtfMoment: 'Cold fire that laughs like children',
            statsChange: { lucidity: -20, realityCoherence: -18 },
            choices: [
                'Touch the liquid memory ocean',
                'Pick up crystallized regret sand',
                'Wave to the origami ship captain',
                'Dive into the sky-water'
            ]
        };
    }

    generateSkyDreamscape(locationText) {
        return {
            title: `${locationText.toUpperCase()} [ATMOSPHERIC CATHEDRAL]`,
            description: `You're standing on solid air. The ground beneath you is transparent atmosphere that holds your weight through sheer belief. Below, you can see the earth spinning slowly—cities, oceans, forests blurring together like watercolors in rain.

The sky around you has architecture. Clouds have been carved into Gothic cathedrals, floating mansions, and impossible spiral staircases that lead to different altitudes of thought. Lightning serves as structural support, holding up bridges made of frozen thunder.

Wind has texture here—you can see it flowing past in ribbons of silver and gold. Some winds carry voices from conversations happening in other dimensions. Some winds smell like your childhood. One wind tastes like the color blue.

Above you (or is it beside you? Direction has become negotiable), the sun and moon share the sky, orbiting each other in a dance that creates twilight in all directions. Stars blink in Morse code, spelling out your social security number.`,
            wtfMoment: 'Stars spelling your social security number',
            statsChange: { lucidity: +10, realityCoherence: -12 },
            choices: [
                'Walk up the thunder staircase',
                'Follow the wind-ribbons',
                'Enter a cloud cathedral',
                'Read the star-code messages'
            ]
        };
    }

    generateForestDreamscape(locationText) {
        return {
            title: `${locationText.toUpperCase()} [TEMPORAL GROWTH]`,
            description: `The forest grows in reverse. Ancient trees shrink into saplings, then seeds, then possibilities, then nothing. New trees burst from the ground fully grown, only to begin their backward journey through time.

The trunks are made of compressed seasons—spring, summer, fall, and winter stacked like sedimentary rock. You can see all four seasons happening simultaneously on different branches of the same tree. One branch blooms with flowers while another sheds autumn leaves while another is bare winter while another...

The forest floor is carpeted with fallen clocks instead of leaves. They tick in different directions. Some tick backward. Some tick sideways. One ticks in colors. They crunch under your feet like dead insects.

Animals here have forgotten what they're supposed to be. A deer with butterfly wings. A squirrel made entirely of smoke and regret. A bear that phases in and out of existence every seven seconds. They don't notice you because you might not be here.

The path through the forest branches infinitely. Every choice you don't make creates a ghost-you that walks the other path. You can see them out of the corner of your eye—hundreds of alternate yous, living the decisions you didn't make.`,
            wtfMoment: 'Ghost-yous walking alternate paths',
            statsChange: { lucidity: -15, realityCoherence: -20, perception: 'MULTIVERSAL' },
            choices: [
                'Touch a reverse-growing tree',
                'Pick up a fallen clock',
                'Follow the smoke-squirrel',
                'Speak to one of your ghost-selves'
            ]
        };
    }

    generateDesertDreamscape(locationText) {
        return {
            title: `${locationText.toUpperCase()} [CRYSTALLINE VOID]`,
            description: `The desert sand isn't sand—it's ground-up dreams, pulverized ambitions, crushed hopes weathered into fine dust. Each grain was once someone's aspiration. The wind carries them away in glittering streams.

The dunes shift and flow like thoughts, reshaping themselves based on what you're thinking. Think of mountains, and mountains rise. Think of water, and mirages become briefly, tantalizingly real before evaporating into disappointment.

The sun has melted into the horizon, creating a golden puddle that stretches across the world. It's still bright, but it flows like honey, dripping between dimensions. Where it pools, time moves differently—faster in the deep parts, slower in the shallows.

Cacti grow here, but they're made of crystallized silence. When the wind touches them, they chime like glass bells, playing music composed by the absence of sound. One cactus has your face. You don't remember planting it.

In the distance, a sphinx made of compressed midnight sits on a throne of frozen questions. It speaks without moving: "I have the answer. Do you have the question?"`,
            wtfMoment: 'Cactus with your face',
            statsChange: { lucidity: +5, realityCoherence: -15 },
            choices: [
                'Touch the ground-up dreams',
                'Approach the sphinx of midnight',
                'Listen to the crystalline cacti',
                'Wade into the melted sun'
            ]
        };
    }

    generateSpaceDreamscape(locationText) {
        return {
            title: `${locationText.toUpperCase()} [VOID CONSCIOUSNESS]`,
            description: `You float in infinite nothing, but the nothing is pregnant with everything. Space here isn't empty—it's full of potential, of could-bes and might-haves, of thoughts that haven't been thought yet.

Stars aren't balls of burning gas—they're crystallized moments of human joy, scattered across the void. Each one contains a specific happiness: your first kiss, a perfect sunset you saw once, the time you laughed so hard you couldn't breathe. You can reach out and touch them. They're warm.

Planets orbit around concepts instead of suns. One planet orbits the idea of "home." Another orbits "nostalgia." A third orbits "the taste of your grandmother's cooking." They're close enough to visit.

The cosmic background radiation sounds like your heartbeat slowed down ten thousand times. Or is your heartbeat the cosmic background radiation sped up? The distinction has collapsed.

Nebulae bloom like flowers, their petals made of ionized regret and excitement. One nebula is shaped exactly like your childhood bedroom. Another looks like every face you've ever loved, superimposed. They're birthing new stars—new joys, new memories you haven't made yet.

In the center of everything, a black hole made entirely of forgotten names rotates slowly. It's not pulling you in. It's waiting. Patient. It has a question it's been meaning to ask you.`,
            wtfMoment: 'Black hole of forgotten names waiting to speak',
            statsChange: { lucidity: +30, realityCoherence: -25, perception: 'COSMIC AWARENESS' },
            choices: [
                'Touch a star-memory',
                'Visit the planet orbiting "home"',
                'Enter your bedroom nebula',
                'Approach the black hole'
            ]
        };
    }

    generateHomeDreamscape(locationText) {
        return {
            title: `${locationText.toUpperCase()} [FAMILIAR DISTORTION]`,
            description: `You're home, but home has remembered itself wrong. The rooms are in the right order but the wrong size. The kitchen is vast as a cathedral. The bathroom is the size of a closet but contains an ocean. Your bedroom is exactly the same but all the furniture is nailed to the ceiling and you're the one who's upside down.

The walls are breathing. Slowly. Rhythmically. The wallpaper pattern shifts when you're not looking directly at it—flowers become eyes become flowers become doors become flowers.

Family photos line the hallway, but the people in them are strangers wearing your family's faces. Or maybe your family are strangers wearing familiar faces. One photo shows you at your own funeral. Everyone is smiling.

The refrigerator hums a song you know but can't remember. Inside, instead of food, there are neatly labeled jars of emotions: "CHILDHOOD JOY," "TEENAGE ANGST," "ADULT RESIGNATION." One jar is labeled "WHAT YOU'LL FEEL TOMORROW." You can't read the contents through the glass.

From upstairs, you hear footsteps. Familiar footsteps. Your mother's voice calls down: "Dinner's ready! It's been ready for seventeen years. Why are you late?"

The clock in the living room shows the right time, but the wrong day, month, year. It shows the day you were supposed to die, if everything had gone according to the original plan.`,
            wtfMoment: 'Dinner has been ready for seventeen years',
            statsChange: { lucidity: -25, realityCoherence: -15 },
            choices: [
                'Go upstairs to dinner',
                'Open the jar of tomorrow\'s feeling',
                'Examine the funeral photo',
                'Ask the walls why they\'re breathing'
            ]
        };
    }

    generateAbstractDreamscape(locationText) {
        return {
            title: `${locationText.toUpperCase()} [CONCEPTUAL SPACE]`,
            description: `You've shifted to a place that doesn't exist in three dimensions—or any specific number of dimensions. It's a space defined by pure concept, pure thought made manifest.

The environment around you shifts based on how you feel. When you're anxious, the ground becomes made of transparent glass over infinite depths. When you're calm, soft grass appears. When you're confused, the grass and glass exist simultaneously, occupying the same space without conflict.

Colors here don't just describe—they *are*. Blue isn't a color, it's the concept of distance and melancholy made visible. Red is urgency and passion made tangible. You can touch yellow and it tastes like laughter.

Shapes move through the space—not geometric shapes, but idea-shapes. The shape of "regret" floats past, angular and heavy. The shape of "hope" hovers nearby, light and fractal. The shape of "nostalgia" spirals through dimensions you can't see but can feel.

Words manifest physically. Someone once said "I love you" here, and the words still hang in the air, crystallized and slowly decaying. Someone else screamed "HELP" and it's frozen mid-flight, preserved in amber urgency.

You realize: this place is inside your own mind. Or your mind is inside this place. The boundary has dissolved. You are the dreamer and the dream and the act of dreaming, collapsed into a single impossible point.`,
            wtfMoment: 'You are the dreamer and the dream simultaneously',
            statsChange: { lucidity: +40, realityCoherence: -30, perception: 'META-AWARE' },
            choices: [
                'Touch the concept of hope',
                'Speak and watch words crystallize',
                'Find the boundary of yourself',
                'Embrace the dissolution'
            ]
        };
    }

    interpretAction(actionText, currentScene) {
        // Surrealist interpretation of player actions
        const lowerAction = actionText.toLowerCase();
        
        // Extract action verbs and objects
        const verbs = ['touch', 'grab', 'eat', 'drink', 'break', 'enter', 'exit', 'fly', 'swim', 'run', 'walk', 'speak', 'scream', 'whisper', 'look', 'stare', 'listen', 'smell', 'taste', 'feel'];
        
        let actionType = 'abstract';
        for (const verb of verbs) {
            if (lowerAction.includes(verb)) {
                actionType = verb;
                break;
            }
        }
        
        // Generate surreal outcomes based on action type
        switch(actionType) {
            case 'touch':
                return this.generateTouchOutcome(actionText, currentScene);
            case 'eat':
            case 'drink':
            case 'taste':
                return this.generateConsumptionOutcome(actionText, currentScene);
            case 'speak':
            case 'scream':
            case 'whisper':
                return this.generateVocalOutcome(actionText, currentScene);
            case 'look':
            case 'stare':
                return this.generateVisionOutcome(actionText, currentScene);
            default:
                return this.generateAbstractActionOutcome(actionText, currentScene);
        }
    }

    generateTouchOutcome(actionText, currentScene) {
        const outcomes = [
            {
                resultTitle: 'Tactile Reality Breach',
                description: `${currentScene.description}\n\nYou reach out and touch ${actionText.split(' ').slice(1).join(' ')}. The moment contact is made, your sense of touch inverts. You don't feel the object—the object feels you. It knows your temperature, your texture, your hidden anxieties transmitted through your fingertips.\n\nThe boundary between you and it dissolves. You are briefly the thing you're touching, experiencing existence from its perspective. It's vast. It's terrifying. It's been waiting for someone to notice it.\n\nWhen you pull away, your fingerprints have changed. They now spell out a message in microscopic text: "YOU WERE NEVER REALLY HERE."`,
                wtfMoment: 'Fingerprints spelling messages',
                statsChange: { lucidity: -10, realityCoherence: -12 }
            },
            {
                resultTitle: 'Physical Consequence Cascade',
                description: `${currentScene.description}\n\nYour touch causes a chain reaction. The object ripples, then liquefies, then evaporates, then crystallizes into something else entirely. That transformation spreads like a contagion—everything you've ever touched begins transforming simultaneously across space and time.\n\nYou can feel it happening: your childhood teddy bear is becoming crystal. Your first car is melting. The hand you held on your first date is evaporating. All of it connected through the ghost of your touch.\n\nThe dream is teaching you a lesson about permanence. Or impermanence. Or maybe it's just chaos dressed up as meaning.`,
                wtfMoment: 'All previously touched objects transforming across time',
                statsChange: { lucidity: +15, realityCoherence: -20 },
                newChoices: [
                    'Touch yourself to test the theory',
                    'Try not touching anything ever again',
                    'Embrace the transformation cascade',
                    'Ask the dream what it wants'
                ]
            }
        ];
        
        return outcomes[Math.floor(Math.random() * outcomes.length)];
    }

    generateConsumptionOutcome(actionText, currentScene) {
        return {
            resultTitle: 'Consumption Reversal',
            description: `${currentScene.description}\n\nYou consume ${actionText.split(' ').slice(1).join(' ')}. But in the dream logic, consumption is bidirectional. You don't just eat it—it eats you back. Not your body, but your identity, your memories, your sense of self.\n\nThe taste floods your consciousness: it tastes like every meal you've ever eaten, layered and simultaneous. Breakfast from fifteen years ago. Lunch from next Thursday. Dinner you'll have at your own wake. All of it mixing in your mouth, creating new flavors that don't exist in waking reality.\n\nYour stomach becomes a universe. You can feel galaxies forming in your digestive system, stars being born from the metabolized matter of dreams. You are both consumer and cosmos.\n\nWhen the moment passes, you realize: you've been hungry your entire life for something you can't name. This didn't satisfy it. But now you know what the hunger tastes like.`,
            wtfMoment: 'Galaxies forming in your digestive system',
            statsChange: { lucidity: -18, realityCoherence: -15, perception: 'EXISTENTIAL HUNGER' },
            newChoices: [
                'Vomit up the newborn galaxies',
                'Keep consuming until you become consumption itself',
                'Try to remember what normal hunger felt like',
                'Feed the dream back to itself'
            ]
        };
    }

    generateVocalOutcome(actionText, currentScene) {
        return {
            resultTitle: 'Sonic Manifestation',
            description: `${currentScene.description}\n\nYou speak. But here, words have mass and momentum. They leave your mouth as solid objects: "${actionText}" crystallizes in the air, each letter a distinct sculpture made of frozen sound and compressed meaning.\n\nThe words hang there, vibrating. They're waiting. Words have power here—they can reshape reality if you choose the right ones. Or the wrong ones. The distinction is unclear.\n\nOther words begin appearing, summoned by yours: ancient words, future words, words from languages that were never spoken. They orbit your statement like electrons around a nucleus. They're having a conversation you can't quite hear.\n\nOne word breaks free from the cluster: "${actionText.split(' ')[1] || 'DREAM'}". It grows larger, heavier, more insistent. It wants something from you. It demands acknowledgment. It remembers when you promised something, long ago, and it's here to collect.`,
            wtfMoment: 'Words gaining sentience and memory',
            statsChange: { lucidity: +20, realityCoherence: -10 },
            newChoices: [
                'Catch the words before they escape',
                'Speak the opposite to create balance',
                'Listen to the words\' conversation',
                'Swallow your words back down'
            ]
        };
    }

    generateVisionOutcome(actionText, currentScene) {
        return {
            resultTitle: 'Visual Recursion Loop',
            description: `${currentScene.description}\n\nYou look at ${actionText.split(' ').slice(1).join(' ')}. But looking here is not passive—it's an act of creation. By observing, you collapse infinite possibilities into one specific reality. And that reality looks back.\n\nYour vision doubles, triples, fractalizes. You see the object from every angle simultaneously: past, present, future, and angles that don't have temporal names. You see it as it was when it was made. You see it as it will be when it decays. You see it as it exists in dimensions you can't enter.\n\nBut worse: you realize you're being observed too. Something vast and incomprehensible is looking at YOU with the same omnidirectional vision. You are the object of a gaze so complete, so total, that it knows things about you that you've never known yourself.\n\nYour reflection in the object shows you as you truly are. You were not prepared for this truth.`,
            wtfMoment: 'Being observed by omnidirectional awareness',
            statsChange: { lucidity: +25, realityCoherence: -18, perception: 'RECURSIVE VISION' },
            newChoices: [
                'Close your eyes and refuse to see',
                'Stare back at the vast observer',
                'Accept the truth of your reflection',
                'Fragment your vision further'
            ]
        };
    }

    generateAbstractActionOutcome(actionText, currentScene) {
        return {
            resultTitle: 'Action Paradox Resolution',
            description: `${currentScene.description}\n\nYou attempt to ${actionText}. The dream considers your request. It files it under "INTENTIONS: NOBLE BUT IMPOSSIBLE." It generates a response.\n\nWhat happens next defies simple description: the action occurs, but also doesn't occur, but also has always been occurring, but also will never occur. Quantum superposition of intent and execution. You exist in the state of having-done-and-not-done simultaneously.\n\nThe environment reconfigures itself around your paradoxical action. New pathways open. Old certainties close. The dream's architecture rewrites its own blueprint in real-time, adapting to accommodate something it wasn't designed for.\n\nYou feel the weight of agency—true agency, not the illusion of choice but actual reality-bending will. It's intoxicating. It's terrifying. It's responsibility you never asked for.\n\nThe dream whispers: "Careful what you manifest. It might actually work."`,
            wtfMoment: 'Existing in superposition of action/inaction',
            statsChange: { lucidity: +10, realityCoherence: -8 },
            newChoices: [
                'Attempt an even more impossible action',
                'Accept the paradox and move on',
                'Try to collapse the superposition',
                'Let the dream guide you'
            ]
        };
    }

    applyStatsChange(statsChange) {
        if (statsChange.lucidity !== undefined) {
            this.dreamState.lucidity = Math.max(0, Math.min(100, 
                this.dreamState.lucidity + statsChange.lucidity));
        }
        if (statsChange.realityCoherence !== undefined) {
            this.dreamState.realityCoherence = Math.max(0, Math.min(100,
                this.dreamState.realityCoherence + statsChange.realityCoherence));
        }
        if (statsChange.perception) {
            this.dreamState.perception = statsChange.perception;
        }
    }

    onPointerDown(event) {
        this.isUserInteracting = true;
        this.onPointerDownPointerX = event.clientX;
        this.onPointerDownPointerY = event.clientY;
        this.onPointerDownLongitude = this.longitude;
        this.onPointerDownLatitude = this.latitude;
    }

    onPointerMove(event) {
        if (this.isUserInteracting) {
            this.longitude = (this.onPointerDownPointerX - event.clientX) * 0.1 + this.onPointerDownLongitude;
            this.latitude = (event.clientY - this.onPointerDownPointerY) * 0.1 + this.onPointerDownLatitude;
        }
    }

    onPointerUp() {
        this.isUserInteracting = false;
    }

    onWheel(event) {
        const fov = this.camera.fov + event.deltaY * 0.05;
        this.camera.fov = THREE.MathUtils.clamp(fov, 30, 100);
        this.camera.updateProjectionMatrix();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.latitude = Math.max(-85, Math.min(85, this.latitude));
        this.phi = THREE.MathUtils.degToRad(90 - this.latitude);
        this.theta = THREE.MathUtils.degToRad(this.longitude);

        const x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
        const y = 500 * Math.cos(this.phi);
        const z = 500 * Math.sin(this.phi) * Math.sin(this.theta);

        this.camera.lookAt(x, y, z);
        this.renderer.render(this.scene, this.camera);
    }

    loadInitialScene() {
        // Set initial supermarket scene
        this.currentScene = {
            title: 'SUPERMARKET AISLE 7 [LIQUEFACTION ZONE]',
            description: `You stand in a sterile supermarket aisle under harsh fluorescent lights that seem too bright, too real. But something is fundamentally wrong. The floor beneath you ripples like liquid mercury, thick and viscous. Cereal boxes and canned goods slowly sink into the metallic surface, disappearing with barely a sound.

Above the meat cooler section, a digital clock radio melts like hot plastic, its numbers dripping down in red LED tears. The time reads 25:87:∞. A neon sign flickers rhythmically: "FRESH" "FRESH" "FLESH" "FRESH."

Most disturbing of all: the cartoon mascot on a cereal box—a cheerful rabbit with impossible proportions—blinks slowly. Its painted eyes track your movements with deliberate intention. When you look away, you can feel its gaze on the back of your neck.

The air smells of ozone and forgotten childhood memories. This is the Chroma-Dream. Logic is broken here. You have total agency. What do you do?`,
            wtfMoment: 'Mascot eyes tracking viewer independently',
            panoramaUrl: 'imgs/supermarket_dreamscape_7.png',
            hasMission: false,
            missionChoice: null
        };

        this.updateScene();
        this.loadPanorama(this.currentScene.panoramaUrl);
    }

    updateScene() {
        const titleEl = document.getElementById('location-title');
        const sceneTextEl = document.getElementById('scene-text');
        const wtfTextEl = document.getElementById('wtf-text');
        const missionIndicatorEl = document.getElementById('mission-indicator');

        if (titleEl) {
            titleEl.textContent = this.currentScene.title;
            titleEl.setAttribute('data-text', this.currentScene.title);
        }

        if (sceneTextEl) {
            sceneTextEl.textContent = this.currentScene.description;
        }

        if (wtfTextEl) {
            wtfTextEl.textContent = this.currentScene.wtfMoment;
        }

        // Update mission indicator
        if (missionIndicatorEl) {
            if (this.currentMission) {
                missionIndicatorEl.classList.remove('hidden');
                missionIndicatorEl.querySelector('#mission-name').textContent = this.currentMission.name;
                missionIndicatorEl.querySelector('#mission-progress').textContent = 
                    `${this.currentMission.currentStep}/${this.currentMission.totalSteps}`;
            } else {
                missionIndicatorEl.classList.add('hidden');
            }
        }

        this.updateStats();
    }

    updateStats() {
        const lucidityEl = document.getElementById('lucidity');
        const perceptionEl = document.getElementById('perception');
        const realityLevelEl = document.getElementById('reality-level');
        const realityPercentageEl = document.getElementById('reality-percentage');
        const dreamTierEl = document.getElementById('dream-tier');

        if (lucidityEl) lucidityEl.textContent = `${this.dreamState.lucidity}%`;
        if (perceptionEl) perceptionEl.textContent = this.dreamState.perception;
        if (realityLevelEl) realityLevelEl.style.width = `${this.dreamState.realityCoherence}%`;
        if (realityPercentageEl) realityPercentageEl.textContent = `${this.dreamState.realityCoherence}%`;
        if (dreamTierEl) dreamTierEl.textContent = this.dreamState.dreamTier;

        this.updateDreamTime();
        this.checkProgression();
    }

    updateDreamTime() {
        const dreamTimeEl = document.getElementById('dream-time');
        if (dreamTimeEl) {
            const surealTime = `${Math.floor(Math.random() * 30)}:${Math.floor(Math.random() * 99)}:${['∞', '??', '00', '88'][Math.floor(Math.random() * 4)]}`;
            dreamTimeEl.textContent = surealTime;
        }
    }

    checkProgression() {
        // Check for Tier Shift (Win Condition)
        if (this.dreamState.whispersCompleted >= this.dreamState.dreamTier * 3) {
            this.triggerTierShift();
        }

        // Check for Descent (Loss Condition)
        if (this.dreamState.whispersFailed >= 5 || this.dreamState.realityCoherence <= 0) {
            this.triggerDescent();
        }
    }

    triggerTierShift() {
        this.dreamState.dreamTier++;
        this.dreamState.whispersCompleted = 0;
        this.dreamState.lucidity = Math.min(100, this.dreamState.lucidity + 20);
        this.dreamState.realityCoherence = Math.min(100, this.dreamState.realityCoherence + 15);
        
        this.showNotification(`TIER SHIFT: Dream Tier ${this.dreamState.dreamTier}`, 'The dream stabilizes...', 'success');
        this.triggerEyeBlink(() => {
            this.currentScene.description = `[TIER ${this.dreamState.dreamTier}] ${this.currentScene.description}`;
            this.updateScene();
        });
    }

    triggerDescent() {
        this.dreamState.descentLevel++;
        this.dreamState.lucidity = Math.max(0, this.dreamState.lucidity - 30);
        this.dreamState.realityCoherence = Math.max(5, this.dreamState.realityCoherence - 20);
        
        this.showNotification('DESCENT WARNING', 'The dream grows hostile...', 'danger');
        
        // Make environment more hostile
        if (this.dreamState.descentLevel >= 3) {
            this.currentScene.wtfMoment = 'Reality dissolution imminent';
        }
    }

    showNotification(title, message, type = 'info') {
        const notificationEl = document.getElementById('notification-system');
        if (notificationEl) {
            notificationEl.querySelector('.notification-title').textContent = title;
            notificationEl.querySelector('.notification-message').textContent = message;
            notificationEl.className = `notification ${type}`;
            notificationEl.classList.remove('hidden');
            
            setTimeout(() => {
                notificationEl.classList.add('hidden');
            }, 4000);
        }
    }

    handleChoice(choiceNumber) {
        console.log(`Choice ${choiceNumber} selected`);
        
        // Check if this is a mission choice
        const isMissionChoice = this.currentScene.hasMission && choiceNumber === 5;
        
        if (isMissionChoice) {
            this.handleMissionChoice();
        } else {
            this.handleFreeExplorationChoice(choiceNumber);
        }
    }

    handleMissionChoice() {
        if (!this.currentScene.missionChoice) return;

        this.triggerRealityBlink();
        
        setTimeout(() => {
            this.triggerEyeBlink(() => {
                const missionData = this.currentScene.missionChoice;
                this.startMission(missionData);
            });
        }, 300);
    }

    handleFreeExplorationChoice(choiceNumber) {
        this.triggerRealityBlink();
        
        setTimeout(() => {
            this.triggerEyeBlink(() => {
                const outcome = this.choiceOutcomes[`choice${choiceNumber}`];
                if (outcome) {
                    this.applyChoiceOutcome(outcome);
                }
            });
        }, 300);
    }

    startMission(missionData) {
        this.currentMission = {
            ...missionData,
            currentStep: 1,
            startTime: Date.now()
        };
        
        this.activeMissions.push(this.currentMission);
        this.showNotification('WHISPER INITIATED', `Mission: ${missionData.name}`, 'mission');
        
        // Apply mission's first step
        if (missionData.steps && missionData.steps[0]) {
            this.applyChoiceOutcome(missionData.steps[0]);
        }
    }

    completeMissionStep() {
        if (!this.currentMission) return;

        this.currentMission.currentStep++;
        
        if (this.currentMission.currentStep > this.currentMission.totalSteps) {
            this.completeMission(true);
        } else {
            this.showNotification('STEP COMPLETE', `Progress: ${this.currentMission.currentStep}/${this.currentMission.totalSteps}`, 'info');
            this.updateStats();
        }
    }

    completeMission(success) {
        if (!this.currentMission) return;

        const mission = this.currentMission;
        
        if (success) {
            this.dreamState.whispersCompleted++;
            this.dreamState.lucidity += mission.reward.lucidity || 0;
            this.dreamState.realityCoherence += mission.reward.realityCoherence || 0;
            
            this.completedMissions.push({...mission, completedAt: Date.now()});
            this.showNotification('WHISPER COMPLETE', mission.successMessage, 'success');
        } else {
            this.dreamState.whispersFailed++;
            this.dreamState.lucidity -= 15;
            this.dreamState.realityCoherence -= 10;
            
            this.showNotification('WHISPER FAILED', mission.failureMessage, 'danger');
        }
        
        this.currentMission = null;
        this.updateStats();
    }

    initializeMissionArcs() {
        return {
            trophyArc: {
                id: 'trophy_arc',
                name: 'The Melting Trophy',
                totalSteps: 3,
                description: 'Follow the impossible trophy through the dream',
                reward: {
                    lucidity: 25,
                    realityCoherence: 15
                },
                successMessage: 'The trophy dissolves into golden light. You remember what it means to strive.',
                failureMessage: 'The trophy melts completely. Your ambitions run like wax into the gutter.',
                steps: [
                    {
                        title: 'CITY STREET CORNER [GEOMETRIC TRAFFIC]',
                        description: `You leave the supermarket and step onto a busy city street corner. The transition is jarring—one moment you're drowning in fluorescent light and mercury, the next you're standing on rippling asphalt that moves like fabric in a gentle breeze.

The traffic flows around you, but the cars have no tires. Instead, they glide on impossible geometric shapes—perfect dodecahedrons, fractaling icosahedrons, tesseracts that hurt to look at directly. They make no sound. The street signs point in directions that don't exist.

A discarded shopping cart rolls by slowly, impossibly maintaining perfect balance despite the warping ground. Inside it sits a giant, crystalline trophy—three feet tall, made of what looks like frozen light and melting gold. As you watch, droplets of liquid metal drip from its surface and evaporate before hitting the cart's wire mesh.

The trophy pulses with a faint heartbeat. You can feel it calling to you, promising validation, achievement, purpose—everything the dream says you lack.

**THE WHISPER**: Follow the trophy. Prove your worth. Or walk away and let ambition melt into nothing.`,
                        wtfMoment: 'Trophy with heartbeat dripping liquid validation',
                        statsChange: { lucidity: -5, realityCoherence: -5 },
                        newChoices: [
                            'Touch the rippling asphalt',
                            'Vandalize the warped bus stop',
                            'Engage with a geometric car',
                            'Walk in a non-existent direction'
                        ],
                        missionChoice: {
                            text: '🏆 Follow the trophy cart',
                            missionStep: 1
                        }
                    }
                ]
            }
        };
    }

    initializeChoiceOutcomes() {
        return {
            choice1: {
                title: 'TACTILE VOID [MERCURY CONTACT]',
                description: `You reach down and touch the liquid floor. It's neither cold nor warm—it exists in a temperature that doesn't have a name. Your fingers sink through the surface and you feel them touch something solid beneath: pavement from a street you've never walked on.

When you pull your hand back, your fingers are coated in liquid silver that refuses to drip. The mercury clings to your skin like a second epidermis. You can see your memories reflected in the surface of your palm—childhood birthdays, forgotten faces, dreams you had last Tuesday.

The supermarket aisle begins to tilt at a 45-degree angle, but gravity remains perpendicular to your perception. Products slide past you horizontally. A shopping cart floats by, filled with clocks all showing different impossible times.`,
                wtfMoment: 'Memories reflected in mercury-coated fingers',
                statsChange: { lucidity: -15, realityCoherence: -8 },
                newChoices: [
                    'Lick the mercury from your fingers',
                    'Watch the floating cart',
                    'Walk on the tilted aisle',
                    'Try to remember who you were'
                ]
            },
            choice2: {
                title: 'MASCOT COMMUNION [GAZE LOCKED]',
                description: `You lock eyes with the cereal box mascot. The painted rabbit's smile widens imperceptibly—or perhaps it was always that wide, and you're only now truly seeing it. Its pupils dilate, then contract, then multiply into fractal patterns.

The rabbit speaks without moving its mouth. You don't hear it with your ears; you feel its voice as pressure changes in your sinuses: "You're late for breakfast. You've been late for three decades now."

The box tears itself open from the inside. Cereal pieces float out—but they're not cereal. They're tiny wooden alphabet blocks spelling out your childhood address, phone numbers you've forgotten, the name of your first pet. One block is just a question mark that pulses with bioluminescent light.

The mascot's hand—fully three-dimensional now—reaches out of the box toward you.`,
                wtfMoment: 'Mascot hand extending from 2D box into 3D space',
                statsChange: { lucidity: +20, realityCoherence: -15 },
                newChoices: [
                    'Take the mascot\'s hand',
                    'Eat one of the alphabet blocks',
                    'Read the cereal box ingredients',
                    'Ask the rabbit what year it is'
                ]
            },
            choice3: {
                title: 'TEMPORAL TASTE TEST [CLOCK CONSUMPTION]',
                description: `Your tongue makes contact with the melting clock radio. It tastes like static electricity, burnt caramel, and the color purple. The sensation of "time" floods your mouth—you can taste yesterday's lunch simultaneously with next Thursday's dinner.

The LED numbers that were dripping down now reverse their flow, climbing back up the clock face. But they're climbing onto your tongue, sliding down your throat. You've swallowed 3:47 PM. You've swallowed Tuesday. You've swallowed the concept of "afternoon."

Your perception of temporal sequence shatters. You see yourself licking the clock five minutes from now. You remember this moment from next week. The present moment exists in all directions simultaneously.

The meat cooler opens by itself. Inside, instead of meat, there are dozens of pristine white envelopes. Each one is addressed to you in your own handwriting. The postmarks are from dates that haven't occurred yet.`,
                wtfMoment: 'Swallowing time itself, seeing future memories',
                statsChange: { lucidity: -25, realityCoherence: -20, perception: 'TEMPORAL FRACTURE' },
                newChoices: [
                    'Open an envelope from the future',
                    'Climb into the meat cooler',
                    'Vomit up the stolen time',
                    'Check if you still have a reflection'
                ]
            },
            choice4: {
                title: 'REFRIGERATION THRESHOLD [COLD PASSAGE]',
                description: `You walk toward the meat cooler. As you approach, the glass door becomes increasingly transparent until it's not there at all—it never was. The threshold between the aisle and the cooler interior is marked only by a temperature gradient and a shift in the fundamental laws of physics.

You step through. Inside, it's not a cooler. It's a vast cathedral made entirely of frozen breath and crystallized prayers. The ceiling extends infinitely upward. Frost formations on the walls spell out conversations you'll have next year.

Hanging from meat hooks are not animal carcasses, but husks—translucent shells shaped like human bodies. You recognize some of them. They're you. Each one is a version of yourself from a decision you didn't make, a path you didn't take, a life you didn't live.

In the center of the cathedral, sitting on a throne carved from a single block of dry ice, is a figure that looks exactly like you. But older. Or younger. It's hard to tell. They smile and say: "Welcome back. You've been gone for seventeen seconds and thirty years."`,
                wtfMoment: 'Cathedral of alternate selves on meat hooks',
                statsChange: { lucidity: +35, realityCoherence: 5, perception: 'MULTIVERSAL AWARENESS' },
                newChoices: [
                    'Speak to your throne-self',
                    'Touch one of the alternate-you husks',
                    'Count how many versions exist',
                    'Sit on the dry ice throne yourself'
                ]
            }
        };
    }

    applyChoiceOutcome(outcome) {
        this.currentScene = {
            title: outcome.title,
            description: outcome.description,
            wtfMoment: outcome.wtfMoment,
            panoramaUrl: this.currentScene.panoramaUrl,
            hasMission: outcome.missionChoice ? true : false,
            missionChoice: outcome.missionChoice ? this.missionArcs.trophyArc : null
        };

        if (outcome.statsChange) {
            if (outcome.statsChange.lucidity !== undefined) {
                this.dreamState.lucidity = Math.max(0, Math.min(100, 
                    this.dreamState.lucidity + outcome.statsChange.lucidity));
            }
            if (outcome.statsChange.realityCoherence !== undefined) {
                this.dreamState.realityCoherence = Math.max(0, Math.min(100,
                    this.dreamState.realityCoherence + outcome.statsChange.realityCoherence));
            }
            if (outcome.statsChange.perception) {
                this.dreamState.perception = outcome.statsChange.perception;
            }
        }

        this.updateScene();

        if (outcome.newChoices) {
            this.updateChoiceBubbles(outcome.newChoices, outcome.missionChoice);
        }

        setTimeout(() => {
            this.triggerWhisper();
        }, 2000);
    }

    updateChoiceBubbles(newChoices, missionChoice = null) {
        const bubbles = document.querySelectorAll('.choice-bubble');
        
        // Update first 4 choices (free exploration)
        newChoices.forEach((text, index) => {
            if (bubbles[index]) {
                bubbles[index].querySelector('.choice-text').textContent = text;
                bubbles[index].classList.remove('mission-choice');
            }
        });

        // Update 5th choice (mission if available)
        if (bubbles[4]) {
            if (missionChoice) {
                bubbles[4].querySelector('.choice-text').textContent = missionChoice.text;
                bubbles[4].classList.add('mission-choice');
                bubbles[4].classList.remove('hidden');
            } else {
                bubbles[4].classList.add('hidden');
            }
        }
    }

    triggerRealityBlink() {
        const blinkEl = document.getElementById('reality-blink');
        if (blinkEl) {
            blinkEl.classList.remove('hidden');
            blinkEl.classList.add('active');
            setTimeout(() => {
                blinkEl.classList.remove('active');
                setTimeout(() => {
                    blinkEl.classList.add('hidden');
                }, 100);
            }, 150);
        }
    }

    triggerEyeBlink(callback) {
        const eyeMask = document.getElementById('eye-mask');
        if (eyeMask) {
            eyeMask.classList.remove('eye-open');
            eyeMask.classList.add('eye-closed');
            
            setTimeout(() => {
                if (callback) callback();
                eyeMask.classList.remove('eye-closed');
                eyeMask.classList.add('eye-open');
            }, 400);
        } else if (callback) {
            callback();
        }
    }

    triggerWhisper() {
        const whisperEl = document.getElementById('whisper-text');
        if (whisperEl) {
            const randomWhisper = this.whispers[Math.floor(Math.random() * this.whispers.length)];
            whisperEl.textContent = randomWhisper;
        }
    }

    startDreamCycle() {
        setInterval(() => {
            if (Math.random() < 0.1) {
                this.triggerRealityBlink();
            }
        }, 8000);

        setInterval(() => {
            if (Math.random() < 0.15) {
                this.triggerEyeBlink();
            }
        }, 12000);

        setInterval(() => {
            this.triggerWhisper();
        }, 15000);

        setInterval(() => {
            this.dreamState.lucidity += Math.floor(Math.random() * 10) - 5;
            this.dreamState.lucidity = Math.max(0, Math.min(100, this.dreamState.lucidity));
            
            this.dreamState.realityCoherence += Math.floor(Math.random() * 6) - 3;
            this.dreamState.realityCoherence = Math.max(0, Math.min(100, this.dreamState.realityCoherence));
            
            this.updateStats();
        }, 5000);
    }

    async hideSplashScreen() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const splashScreen = document.getElementById('splash-screen');
                if (splashScreen) {
                    splashScreen.classList.add('hidden');
                }
                
                const eyeMask = document.getElementById('eye-mask');
                if (eyeMask) {
                    eyeMask.classList.remove('eye-closed');
                    eyeMask.classList.add('eye-open');
                }
                
                resolve();
            }, 3500);
        });
    }
}

// Initialize ChromaShift Navigator
window.addEventListener('DOMContentLoaded', () => {
    window.chromashift = new ChromaShiftNavigator();
});
