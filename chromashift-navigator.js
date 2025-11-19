/* AGENT-IMPLEMENTED: This file was completely rewritten to implement the ChromaShift Generative Dream Engine as specified in MASTER_PROMPT.md. */

import * as THREE from 'three';

class ChromaShiftEngine {
    constructor() {
        // --- DOM Element References ---
        this.panoramaContainer = document.getElementById('panorama-container');
        this.locationSection = document.getElementById('location-section');
        this.sceneDescriptionSection = document.getElementById('scene-description-section');
        this.blinkSection = document.getElementById('blink-section');
        this.anomalySection = document.getElementById('anomaly-section');
        this.dreamStateSection = document.getElementById('dream-state-section');
        this.choiceBubblesContainer = document.getElementById('choice-bubbles-container');
        this.locationInput = document.getElementById('location-input');
        this.shiftButton = document.getElementById('shift-button');
        this.actionInput = document.getElementById('action-input');
        this.manifestButton = document.getElementById('manifest-button');
        this.eyeMask = document.getElementById('eye-mask');

        // --- Three.js Properties ---
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.isUserInteracting = false;
        this.longitude = 0;
        this.latitude = 0;
        this.phi = 0;
        this.theta = 0;
        this.onPointerDownPointerX = 0;
        this.onPointerDownPointerY = 0;
        this.onPointerDownLongitude = 0;
        this.onPointerDownLatitude = 0;

        // --- Game State ---
        this.dreamState = {
            lucidity: 47,
            realityCoherence: 23,
            perception: 'DISTORTED',
            dreamTier: 1,
            whispersCompleted: 0,
            whispersFailed: 0,
            descentLevel: 0,
            anomalyCount: 0
        };

        this.init();
    }

    /**
     * Initializes the entire dream engine.
     */
    init() {
        console.log("Initializing ChromaShift Engine...");
        try {
            // this.setupThreeJS(); // Commented out to isolate potential WebGL issues
            this.setupEventListeners();
            this.loadInitialScene();
            // this.animate(); // Also disable animation loop
            console.log("Engine initialized successfully (without Three.js).");
        } catch (e) {
            console.error("Error during engine initialization:", e);
        }
    }

    /**
     * Sets up the core Three.js scene, camera, and renderer.
     */
    setupThreeJS() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
        this.camera.position.set(0, 0, 0.1);

        this.scene = new THREE.Scene();

        // Add subtle ambient light to avoid complete darkness
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.panoramaContainer.appendChild(this.renderer.domElement);
    }

    /**
     * Binds all necessary event listeners for user interaction.
     */
    setupEventListeners() {
        this.panoramaContainer.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.panoramaContainer.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.panoramaContainer.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.panoramaContainer.addEventListener('wheel', this.onWheel.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.shiftButton.addEventListener('click', () => this.processPlayerInput(this.locationInput.value, 'location'));
        this.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processPlayerInput(this.locationInput.value, 'location');
        });

        this.manifestButton.addEventListener('click', () => this.processPlayerInput(this.actionInput.value, 'action'));
        this.actionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processPlayerInput(this.actionInput.value, 'action');
        });
    }

    /**
     * Loads the initial scene as defined in the MASTER_PROMPT.
     */
    loadInitialScene() {
        const initialSceneData = {
            location: "CENTRAL DISTORTION POINT [GEOMETRIC TRAFFIC ZONE]",
            description: `You stand at a busy city intersection where the asphalt ripples like fabric caught in a gentle breeze. Each footstep sends waves across the surface, disturbing the yellow lane markings—they float upward like ribbons, defying gravity with lazy spirals before dissolving into mist.

Traffic flows around you in perfect silence. The cars have no tires. Instead, they glide on impossible geometric shapes: dodecahedrons that rotate with crystalline precision, fractaling icosahedrons that hurt to look at directly, tesseracts phasing in and out of dimensions you can sense but not see. The silence is profound and wrong—no engines, no horns, just the sound of your own breathing and the distant whisper of reality coming undone.

A businessman walks past you. He looks almost normal—almost. His suit is impeccable, his briefcase professional, but his tie defies gravity, pointing not down but toward the tallest building on the skyline. When you try to meet his eyes, they're pointed slightly wrong, tracking something behind you that isn't there. His shadow falls in the wrong direction, pooling beneath a streetlight that hasn't turned on yet.

In the center of the intersection, a shopping cart rolls slowly in perfect circles, maintaining impossible balance on the rippling ground. Inside it: a crystalline trophy, three feet tall, made of what looks like frozen light and liquid gold. It pulses faintly, like a heartbeat. Droplets of molten metal drip from its surface and evaporate mid-air, leaving trails of golden smoke that spell out words you almost recognize.

One section of a nearby building's wall has collapsed—not into rubble, but into raw code. Green cascading digits, Matrix-style, revealing the dream's underlying architecture. You can see the mathematical formulas holding the street together: (x² + y²) = GUILT × NOSTALGIA.`,
            blink: "The view blinks. For half a second, you see an office cubicle—fluorescent lights, beige walls, a cracked coffee mug on your desk with your name misspelled. Then you're back on the street corner.",
            anomaly: "Businessman's tie pointing toward ambition instead of ground.\nTrophy heartbeat synchronizing with your own pulse.",
            activeWhisper: "🏆 Trophy Arc: Stage 1/3 - Follow the Trophy",
            choices: [
                { text: "Touch the rippling asphalt", position: { top: '30%', left: '15%' } },
                { text: "Follow a geometric car", position: { top: '25%', right: '15%' } },
                { text: "Speak to the businessman", position: { bottom: '35%', left: '20%' } },
                { text: "Examine the code-wall", position: { bottom: '40%', right: '25%' } },
                { text: "Approach the trophy cart [MISSION]", isMission: true, position: { top: '50%', left: '50%', transform: 'translateX(-50%)' } }
            ],
            panoramaUrl: 'imgs/supermarket_dreamscape_7.png' // Placeholder, will be updated when new images are provided.
        };

        this.renderOutput(initialSceneData);
        this.loadPanorama(initialSceneData.panoramaUrl);
    }

    /**
     * Core function to handle and dispatch player commands.
     * @param {string} input - The text from the input field.
     * @param {'location'|'action'} type - The type of command.
     */
    processPlayerInput(input, type) {
        if (!input.trim()) return;

        // Clear the relevant input field after submission
        if (type === 'location') this.locationInput.value = '';
        if (type === 'action') this.actionInput.value = '';

        let newSceneData;

        // Dispatch to the appropriate handler based on command type
        switch (type) {
            case 'action':
                newSceneData = this.handleActionCommand(input);
                break;
            case 'location':
                newSceneData = this.handleLocationCommand(input);
                break;
            default:
                console.error(`Unknown command type: ${type}`);
                return; // Stop execution if the type is invalid
        }
        
        // This will be moved into individual handlers later
        this.updateDreamState({ lucidity: 5, realityCoherence: -8 });

        // Trigger the blink transition and render the new scene
        this.triggerEyeBlink(() => {
            this.renderOutput(newSceneData);
        });
    }

    /**
     * Parses and handles a manifestation (action) command.
     * @param {string} input - The player's action command.
     * @returns {object} The new scene data.
     */
    handleActionCommand(input) {
        console.log(`Handling action: ${input}`);
        const words = input.trim().toLowerCase().split(/\s+/);
        const verb = words[0];
        const target = words.slice(1).join(' ');

        let sceneData = {};
        
        // Differentiate between bubble clicks and typed commands
        if (input.startsWith('Chose option')) {
            const choiceText = input.split('"')[1].toLowerCase();
             // Simple routing for bubble choices for now
            if (choiceText.includes('asphalt')) {
                 sceneData = this.getActionOutcome('touch', 'rippling asphalt');
            } else if (choiceText.includes('car')) {
                 sceneData = this.getActionOutcome('follow', 'geometric car');
            } else if (choiceText.includes('businessman')) {
                 sceneData = this.getActionOutcome('speak', 'businessman');
            } else if (choiceText.includes('code-wall')) {
                 sceneData = this.getActionOutcome('examine', 'code-wall');
            } else if (choiceText.includes('trophy')) {
                 sceneData = this.getActionOutcome('approach', 'trophy cart'); // Mission
            } else {
                 sceneData = this.getActionOutcome('generic', choiceText); // Fallback
            }
        } else {
            // Route typed commands to the outcome generator
            sceneData = this.getActionOutcome(verb, target);
        }

        return sceneData;
    }

    /**
     * Generates a new scene based on the parsed action verb and target.
     * This is the core of the manifestation engine.
     * @param {string} verb - The action verb (e.g., 'touch', 'look').
     * @param {string} target - The target of the action.
     * @returns {object} The new scene data.
     */
    getActionOutcome(verb, target) {
        let location = `MANIFESTED: ${verb.toUpperCase()} ${target.toUpperCase()}`;
        let description = "";
        let blink = "A flash of a forgotten memory: the smell of rain on hot pavement.";
        let anomaly = "The laws of physics are taking a coffee break.";
        let statChanges = { lucidity: -8, realityCoherence: -10 };

        // --- SURREALIST INTERPRETATION PATTERNS ---
        switch (verb) {
            case 'touch':
            case 'feel':
                description = `You reach out and ${verb} the ${target}. A tactile reality breach occurs. The ${target} feels you back, a strange pressure against your consciousness. The boundary between self and other dissolves for a moment.`;
                blink = "You remember the feeling of cool glass against your forehead.";
                anomaly = `The ${target} now bears the faint imprint of your hand, glowing with a soft, residual light.`;
                statChanges = { lucidity: -15, realityCoherence: -12 };
                break;

            case 'look':
            case 'examine':
            case 'observe':
            case 'watch':
                description = `You ${verb} the ${target} with intense focus. A recursive vision unfolds. You see the ${target}, but you also see yourself observing it, and yourself observing yourself, into an infinite, omnidirectional tunnel of perception.`;
                blink = "For a split second, you see your own reflection in a screen that isn't there.";
                anomaly = "Your peripheral vision is now showing you events from five seconds in the past.";
                statChanges = { lucidity: 25, realityCoherence: -8 };
                break;

            case 'create':
            case 'manifest':
            case 'summon':
            case 'build':
            case 'conjure':
                description = `With a surge of will, you ${verb} a ${target}. It solidifies from the dream-stuff around you, shimmering with potential and the faint smell of ozone. It seems stable, for now, but all manifested objects in the Chroma-Dream are temporary.`;
                blink = "You recall the satisfaction of building something with your own hands, something real.";
                anomaly = `A small, harmless paradox has been created. A nearby puddle now reflects a sky with two suns.`;
                statChanges = { lucidity: 10, realityCoherence: -15 };
                break;

            case 'eat':
            case 'drink':
            case 'consume':
            case 'taste':
            case 'inhale':
                description = `You decide to ${verb} the ${target}. This is consumption reversal. As you bring it to your lips, it consumes you instead. You are not eating the dream; the dream is eating you. You fall through universes contained within the ${target}, digesting concepts beyond mortal comprehension.`;
                blink = "The lingering taste of something you can't name—was it ozone? Or cinnamon?";
                anomaly = "For the next few moments, you can taste colors. The yellow of the lane markings tastes like static electricity.";
                statChanges = { lucidity: -20, realityCoherence: -18 };
                this.dreamState.perception = 'EXISTENTIAL HUNGER';
                break;

            case 'walk':
            case 'run':
            case 'fly':
            case 'swim':
            case 'move':
                description = `You begin to ${verb} towards the ${target}. Movement is not a simple act here. The ground shifts and flows around you, either aiding or resisting your travel based on its own unknowable whims. The distance between two points is never constant in the Chroma-Dream.`;
                blink = "The feeling of pavement under your shoes, solid and dependable. It feels like a distant memory.";
                anomaly = "Your shadow has detached and is now racing you to your destination.";
                statChanges = { lucidity: -5, realityCoherence: -5 };
                break;

            case 'change':
            case 'alter':
            case 'make':
            case 'transform':
            case 'merge':
                description = `You focus your will on the ${target}, intending to ${verb} it. Reality ripples around the object as you impose a new form upon it. The ${target} shudders, melts, and reforms into something new, something that reflects your own internal state as much as your command.`;
                blink = "A flash of yourself in a mirror, but your face is subtly different.";
                anomaly = `The altered ${target} now whispers your name when you're not looking at it.`;
                statChanges = { lucidity: 5, realityCoherence: -20 };
                break;

            case 'break':
            case 'destroy':
                description = `You lash out, intending to ${verb} the ${target}. But destruction is a form of creation here. The ${target} shatters into a million pieces, and each fragment begins to grow into a perfect, miniature replica of the original object, creating a fractal swarm of decaying copies.`;
                blink = "The sharp, satisfying sound of something shattering, followed by immediate regret.";
                anomaly = "One of the fragments is now orbiting your head like a tiny, sad moon.";
                statChanges = { lucidity: -10, realityCoherence: -25 };
                break;

            case 'justice': // Abstract command example
            case 'fear':
            case 'ambition':
                description = `You attempt to manifest the abstract concept of '${verb}'. The dream obliges. A golden light descends, taking the form of impossible scales that weigh the nearby NPCs' actions. A guilty-looking businessman is crushed by a giant, ethereal gavel. The concept has been made real, and it is terrifyingly literal.`;
                blink = "You remember a time you were treated unfairly, the burning indignation.";
                anomaly = "All shadows in the area are now perfectly rectangular, regardless of the object casting them.";
                statChanges = { lucidity: 20, realityCoherence: -30 };
                // This is a good place for a perception shift in the future
                break;


            case 'speak':
            case 'ask':
            case 'say':
                description = `You open your mouth to ${verb}. The words crystallize as they leave your lips, falling to the ground as tiny, sharp-edged letters of ice. Your question, '${target}', hangs in the air, a visible, frozen sculpture of sound.`;
                blink = "You hear a faint echo of your own voice, but it's speaking a language you don't understand.";
                anomaly = `The businessman's briefcase clicks open, and a swarm of punctuation marks flies out.`;
                statChanges = { lucidity: 5, realityCoherence: -9 };
                break;

            case 'approach': // Special for mission
                if (target.includes('trophy')) {
                    location = "SHOPPING CART [AMBITION'S VESSEL]";
                    description = `You step toward the shopping cart. The golden trophy inside pulses brighter, its light casting long, dancing shadows that seem to flee from your approach. The molten droplets evaporating from it now clearly spell out one word: "MORE". The heartbeat you hear is definitely not your own.`;
                    blink = "A memory of winning something, the weight of a cheap medal around your neck.";
                    anomaly = "The wheels of the shopping cart are now spinning in opposite directions, yet it remains perfectly still.";
                    statChanges = { lucidity: 10, realityCoherence: 5 }; // Positive coherence for mission progression
                    this.dreamState.activeWhisper = "🏆 Trophy Arc: Stage 2/3";
                }
                break;

            default: // Generic fallback for unhandled verbs
                description = `You focused your will to "${verb} ${target}". The world warps and shifts in response. The consequences are immediate and irreversible, though their meaning is not yet clear.`;
                break;
        }

        // Apply stat changes
        this.updateDreamState(statChanges);

        // Return the complete scene data object
        return {
            location: location,
            description: description,
            blink: blink,
            anomaly: anomaly,
            activeWhisper: this.dreamState.activeWhisper,
            choices: [ // These should also be generative, but are static for now
                { text: "Examine the consequences", position: { top: '30%', left: '15%' } },
                { text: "Push your power further", position: { top: '25%', right: '15%' } },
                { text: "Wait for the dream to react", position: { bottom: '35%', left: '20%' } },
                { text: "Try to ground yourself in reality", position: { bottom: '40%', right: '25%' } },
            ],
            panoramaUrl: 'imgs/supermarket_dreamscape_7.png' // This will also be dynamic later
        };
    }

    /**
     * Parses and handles a location shift command.
     * @param {string} input - The player's desired location.
     * @returns {object} The new scene data.
     */
    handleLocationCommand(input) {
        console.log(`Handling location: ${input}`);
        return this.getLocationOutcome(input);
    }

    /**
     * Generates a new dreamscape based on location archetypes.
     * @param {string} input - The player's desired location.
     * @returns {object} The new scene data.
     */
    getLocationOutcome(input) {
        const text = input.toLowerCase();
        let sceneData = {};
        let statChanges = { lucidity: 0, realityCoherence: -15 };
        let panoramaUrl = 'imgs/supermarket_dreamscape_7.png'; // Default panorama

        // --- LOCATION INTERPRETATION PATTERNS ---
        if (text.includes('ocean') || text.includes('water') || text.includes('sea')) {
            sceneData = {
                location: "LIQUID CONSCIOUSNESS",
                description: "You are submerged in an ocean of pure thought. Schools of ideas, shaped like phosphorescent fish, swim past. The 'water' is warm and thick, like amniotic fluid. Above, you can see a distorted sun that looks suspiciously like a giant, glowing neuron.",
                blink: "The memory of a cold drink on a hot day.",
                anomaly: "You can breathe perfectly. In fact, it feels more natural than breathing air."
            };
            statChanges = { lucidity: 15, realityCoherence: -10 };
        } else if (text.includes('forest') || text.includes('jungle') || text.includes('nature')) {
            sceneData = {
                location: "TEMPORAL GROWTH ZONE",
                description: "You stand in a forest where time is a visible dimension. Trees grow from sapling to ancient giant and back to sapling in the span of a single breath. The seasons change with every footstep. The air hums with the sound of accelerated life and decay.",
                blink: "The smell of freshly cut grass from a childhood memory.",
                anomaly: "A flower blooms, lives its life, and wilts in the time it takes you to blink. Its petals are made of clock faces."
            };
            statChanges = { lucidity: 5, realityCoherence: -12 };
        } else if (text.includes('city') || text.includes('urban')) {
            sceneData = {
                location: "GEOMETRIC IMPOSSIBILITY",
                description: "You are back in a city, but it's one designed by a mad architect. Buildings twist into non-Euclidean shapes. Roads loop back on themselves. The sky is a lattice of interlocking highways filled with silent, geometric cars.",
                blink: "The faint sound of a distant siren.",
                anomaly: "Gravity is inconsistent here. It's stronger near the hot dog stands."
            };
            statChanges = { lucidity: -10, realityCoherence: -18 };
            panoramaUrl = 'imgs/city_dreamscape_3.png'; // Switch to a city panorama
        } else if (text.includes('home') || text.includes('bedroom') || text.includes('house')) {
            sceneData = {
                location: "DISTORTED NOSTALGIA",
                description: "This place is almost your home, but everything is wrong. The furniture is too big or too small. The walls breathe softly. Family portraits watch you as you move, their eyes shifting to follow you. The air is thick with the cloying sweetness of a memory you're trying to forget.",
                blink: "You remember the exact pattern of the wallpaper in your childhood bedroom.",
                anomaly: "The television is on, but it's broadcasting your own thoughts from five minutes ago."
            };
            statChanges = { lucidity: -25, realityCoherence: -20 };
        } else if (text.includes('space') || text.includes('void') || text.includes('stars')) {
            sceneData = {
                location: "COSMIC AWARENESS",
                description: "You are floating in a silent void, surrounded by nebulae of pure emotion and constellations of forgotten ideas. You can feel the slow, silent turning of galaxies. Your body is gone; you are pure consciousness, a single point of awareness in the infinite.",
                blink: "You remember looking up at the night sky as a child, feeling impossibly small.",
                anomaly: "A nearby star winks at you. Literally."
            };
            statChanges = { lucidity: 30, realityCoherence: -5 };
        } else { // Generic fallback
            sceneData = {
                location: `SHIFTED TO: ${input.toUpperCase()}`,
                description: `Your consciousness streams through the Chroma-Dream, re-coalescing in a new space defined by your command: "${input}". The air crackles with generative potential and the faint smell of static electricity.`,
                blink: "You remember the feeling of a steering wheel under your hands, just for a moment.",
                anomaly: "The local time is 'later than you think'."
            };
        }

        this.updateDreamState(statChanges);

        return {
            ...sceneData,
            activeWhisper: this.dreamState.activeWhisper, // Carry over whisper status
            choices: [ // Placeholder choices for new locations
                { text: "Explore this new reality", position: { top: '30%', left: '15%' } },
                { text: "Test the limits of this place", position: { top: '25%', right: '15%' } },
                { text: "Search for a familiar object", position: { bottom: '35%', left: '20%' } },
                { text: "Manifest a guide", position: { bottom: '40%', right: '25%' } },
            ],
            panoramaUrl: panoramaUrl
        };
    }

    /**
     * Renders the entire UI based on new scene data.
     * @param {object} sceneData - The data for the scene to render.
     */
    renderOutput(sceneData) {
        this.locationSection.innerHTML = `
            <pre>═══════════════════════════════════════════════════
${sceneData.location}
═══════════════════════════════════════════════════</pre>
        `;

        this.sceneDescriptionSection.innerHTML = `<pre>${sceneData.description}</pre>`;

        this.blinkSection.innerHTML = `
            <pre>═══════════════════════════════════════════════════
👁️ THE BLINK
═══════════════════════════════════════════════════</pre>
            <pre>${sceneData.blink}</pre>
        `;

        this.anomalySection.innerHTML = `
            <pre>═══════════════════════════════════════════════════
⚠️ ANOMALY DETECTED
═══════════════════════════════════════════════════</pre>
            <pre>${sceneData.anomaly}</pre>
        `;

        this.renderDreamState(sceneData.activeWhisper);
        this.renderChoiceBubbles(sceneData.choices);
        this.locationInput.placeholder = sceneData.location.split('[')[0].trim();
    }

    /**
     * Updates the dream state display.
     * @param {string} activeWhisper - The text for the active mission.
     */
    renderDreamState(activeWhisper) {
        this.dreamStateSection.innerHTML = `
            <pre>═══════════════════════════════════════════════════
📊 DREAM STATE
═══════════════════════════════════════════════════</pre>
            <pre>🧠 Lucidity: ${this.dreamState.lucidity}%
⚠️ Reality Coherence: ${this.dreamState.realityCoherence}%
👁️ Perception: ${this.dreamState.perception}
🌀 Dream Tier: ${this.dreamState.dreamTier}
${activeWhisper ? activeWhisper : ''}</pre>
        `;
    }

    /**
     * Creates and places the choice bubbles in the UI.
     * @param {Array<object>} choices - An array of choice objects.
     */
    renderChoiceBubbles(choices) {
        this.choiceBubblesContainer.innerHTML = '';
        choices.forEach((choice, index) => {
            const bubble = document.createElement('div');
            bubble.className = 'choice-bubble';
            if (choice.isMission) {
                bubble.classList.add('mission-choice');
            }
            bubble.textContent = `${index + 1}. ${choice.text}`;
            Object.assign(bubble.style, choice.position);

            bubble.addEventListener('click', () => {
                this.processPlayerInput(`Chose option ${index + 1}: "${choice.text}"`, 'action');
            });

            this.choiceBubblesContainer.appendChild(bubble);
        });
    }

    /**
     * Updates the internal dreamState object.
     * @param {object} statChanges - An object with lucidity, realityCoherence, etc.
     */
    updateDreamState(statChanges) {
        if (statChanges.lucidity) this.dreamState.lucidity += statChanges.lucidity;
        if (statChanges.realityCoherence) this.dreamState.realityCoherence += statChanges.realityCoherence;

        // Clamp values between 0 and 100
        this.dreamState.lucidity = Math.max(0, Math.min(100, this.dreamState.lucidity));
        this.dreamState.realityCoherence = Math.max(0, Math.min(100, this.dreamState.realityCoherence));
    }


    /**
     * Loads a new panoramic image into the scene.
     * @param {string} imageUrl - The URL of the 360-degree image.
     */
    loadPanorama(imageUrl) {
        // Remove old panorama if it exists
        if (this.scene.children.length > 1) {
            this.scene.remove(this.scene.children.find(c => c.type === "Mesh"));
        }

        const loader = new THREE.TextureLoader();
        loader.load(imageUrl,
            (texture) => {
                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ map: texture });
                const panoramaSphere = new THREE.Mesh(geometry, material);
                this.scene.add(panoramaSphere);
            },
            undefined,
            (error) => {
                console.error('An error occurred while loading the panorama:', error);
            }
        );
    }

    /**
     * Triggers the eye blink visual effect.
     * @param {Function} callback - Function to execute at the darkest point of the blink.
     */
    triggerEyeBlink(callback) {
        this.eyeMask.classList.add('eye-blink');
        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                this.eyeMask.classList.remove('eye-blink');
            }, 200);
        }, 200);
    }

    // --- Event Handlers for Camera Control ---
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

    /**
     * The main animation loop.
     */
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
}

// Initialize the engine once the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new ChromaShiftEngine();
});
