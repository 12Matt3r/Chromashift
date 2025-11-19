import * as THREE from 'three';

class ChromaShiftDreamscape {
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

        // Dream state variables
        this.dreamState = {
            lucidity: 47,
            perception: 'DISTORTED',
            realityCoherence: 23,
            anomalyCount: 0
        };

        // Current scene data
        this.currentScene = {
            title: 'CHROMA-DREAM INITIALIZATION',
            description: '',
            wtfMoment: 'Floor liquefaction observed',
            panoramaUrl: 'imgs/supermarket_dreamscape_7.png'
        };

        // Surreal choice outcomes
        this.choiceOutcomes = this.initializeChoiceOutcomes();

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
            "Reality is on lunch break..."
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
        this.renderer.toneMappingExposure = 1.5; // High brightness
        this.container.appendChild(this.renderer.domElement);

        // Start animation loop
        this.animate();
    }

    loadPanorama(imageUrl) {
        // Remove existing panorama if present
        if (this.panoramaSphere) {
            this.scene.remove(this.panoramaSphere);
            if (this.panoramaSphere.material.map) {
                this.panoramaSphere.material.map.dispose();
            }
            this.panoramaSphere.material.dispose();
            this.panoramaSphere.geometry.dispose();
        }

        // Load panorama texture
        const loader = new THREE.TextureLoader();
        loader.load(
            imageUrl,
            (texture) => {
                // Create sphere geometry for panorama
                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1); // Invert for inside view

                // Create material with dreamscape shader
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.BackSide,
                    transparent: true,
                    opacity: 0.95
                });

                this.panoramaSphere = new THREE.Mesh(geometry, material);
                this.scene.add(this.panoramaSphere);

                // Add surreal distortion effect
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
        // Create a surreal procedural panorama if image fails
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#FF10F0');
        gradient.addColorStop(0.5, '#00FFFF');
        gradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add abstract shapes
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
        // Add subtle pulsing distortion to panorama
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
        // Mouse/touch controls for panorama
        this.container.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.container.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.container.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.container.addEventListener('wheel', this.onWheel.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Choice button events
        const choiceBubbles = document.querySelectorAll('.choice-bubble');
        choiceBubbles.forEach((bubble, index) => {
            bubble.addEventListener('click', () => this.handleChoice(index + 1));
        });

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

            // Close modal when clicking outside
            infoModal.addEventListener('click', (e) => {
                if (e.target === infoModal) {
                    infoModal.classList.add('hidden');
                }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !infoModal.classList.contains('hidden')) {
                    infoModal.classList.add('hidden');
                }
            });
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

        // Update camera rotation
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
            panoramaUrl: 'imgs/supermarket_dreamscape_7.png'
        };

        this.updateScene();
        this.loadPanorama(this.currentScene.panoramaUrl);
    }

    updateScene() {
        // Update UI with current scene data
        const titleEl = document.getElementById('location-title');
        const sceneTextEl = document.getElementById('scene-text');
        const wtfTextEl = document.getElementById('wtf-text');

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

        // Update stats
        this.updateStats();
    }

    updateStats() {
        const lucidityEl = document.getElementById('lucidity');
        const perceptionEl = document.getElementById('perception');
        const realityLevelEl = document.getElementById('reality-level');
        const realityPercentageEl = document.getElementById('reality-percentage');

        if (lucidityEl) lucidityEl.textContent = `${this.dreamState.lucidity}%`;
        if (perceptionEl) perceptionEl.textContent = this.dreamState.perception;
        if (realityLevelEl) realityLevelEl.style.width = `${this.dreamState.realityCoherence}%`;
        if (realityPercentageEl) realityPercentageEl.textContent = `${this.dreamState.realityCoherence}%`;

        // Update dream time with surreal clock
        this.updateDreamTime();
    }

    updateDreamTime() {
        const dreamTimeEl = document.getElementById('dream-time');
        if (dreamTimeEl) {
            const surealTime = `${Math.floor(Math.random() * 30)}:${Math.floor(Math.random() * 99)}:${['∞', '??', '00', '88'][Math.floor(Math.random() * 4)]}`;
            dreamTimeEl.textContent = surealTime;
        }
    }

    handleChoice(choiceNumber) {
        console.log(`Choice ${choiceNumber} selected`);
        
        // Trigger reality blink
        this.triggerRealityBlink();
        
        // Eye blink effect
        setTimeout(() => {
            this.triggerEyeBlink(() => {
                // Apply choice outcome
                const outcome = this.choiceOutcomes[`choice${choiceNumber}`];
                if (outcome) {
                    this.applyChoiceOutcome(outcome);
                }
            });
        }, 300);
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
        // Update scene
        this.currentScene = {
            title: outcome.title,
            description: outcome.description,
            wtfMoment: outcome.wtfMoment,
            panoramaUrl: this.currentScene.panoramaUrl // Keep same panorama or change
        };

        // Update dream state stats
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

        // Update UI
        this.updateScene();

        // Update choice bubbles with new options
        if (outcome.newChoices) {
            this.updateChoiceBubbles(outcome.newChoices);
        }

        // Trigger whisper
        setTimeout(() => {
            this.triggerWhisper();
        }, 2000);
    }

    updateChoiceBubbles(newChoices) {
        const bubbles = document.querySelectorAll('.choice-bubble .choice-text');
        newChoices.forEach((text, index) => {
            if (bubbles[index]) {
                bubbles[index].textContent = text;
            }
        });
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
        // Periodic reality blinks
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                this.triggerRealityBlink();
            }
        }, 8000);

        // Periodic eye blinks
        setInterval(() => {
            if (Math.random() < 0.15) { // 15% chance
                this.triggerEyeBlink();
            }
        }, 12000);

        // Periodic whispers
        setInterval(() => {
            this.triggerWhisper();
        }, 15000);

        // Periodic stat fluctuations
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
                
                // Initial eye opening
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

// Initialize ChromaShift when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.chromashift = new ChromaShiftDreamscape();
});
