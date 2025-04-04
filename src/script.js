import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from 'stats.js'
import gsap from 'gsap'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import narrationSound from '/sounds/narration.mp3'
import whoosh from '/sounds/sfx/whoosh.mp3'
import { animateHumusLayer, animateTopsoilLayer, animateSubsoilLayer, animateParentRockLayer, animateBedRockLayer } from './layersAnimation.js'


const html = document.querySelector('html')
const infoBox = document.querySelectorAll('.info-box')

const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: ms, 2: memory
document.body.appendChild(stats.dom);


/**
 * Base
 */

// Flag to Expand/contract layers
let isExpanded = false
let isLightMode = true
// Flag to track if a layer is currently zoomed in
let isLayerZoomed = false

// Debug
const gui = new GUI()

const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/** 
 * Models
 */

let model1 = null
let model2 = null
// let model3 = null
// let model4 = null

const gltfLoader = new GLTFLoader()

// gltfLoader.load(
//     // 'models/low-poly-saloon/scene.gltf',
//     // 'models/low-poly-island/scene.gltf',
//     // 'models/building-cell-shaded/scene.gltf',
//     // 'models/tavern/scene.gltf',
//     // 'models/sea-watcher/scene.gltf',
//     'models/bear-of-clouds/scene.gltf',

//     (gltf) => {
//         model1 = gltf.scene
//         model1.position.set(0, 5.3, -0.21)
//         scene.add(model1)
//     }
// )

gltfLoader.load(
    'models/dinosaur-bones/scene.gltf',

    (gltf) => {
        model2 = gltf.scene
        model2.scale.set(0.015, 0.015, 0.015)
        model2.position.set(0, -3, 0)
        model2.rotation.set(0, 4.5, 0)
        scene.add(model2)

        // Traverse all child meshes and update their material color
        model2.traverse((child) => {
            if (child.isMesh) {
                // If there's an existing texture map you don't want, remove it
                // child.material.map = null

                // Set a brownish color to match the soil layers (example: SaddleBrown)
                // child.material.color.set("#BDB76B")
                child.material.color.set("#D2B48C")


                // Optionally adjust metalness/roughness if it's a PBR material
                // child.material.metalness = 0.0
                // child.material.roughness = 0.8
            }
        })
    }
)

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()

const matcapTexture = textureLoader.load('/textures/matcaps/1.webp')
matcapTexture.colorSpace = THREE.SRGBColorSpace

const grassColorTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_Color.jpg')
grassColorTexture.colorSpace = THREE.SRGBColorSpace
const grassNormalTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_NormalGL.jpg')
const grassDisplacementTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_Displacement.jpg')
const grassRoughnessTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_Roughness.jpg')
const grassAOTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_AmbientOcclusion.jpg')

// const humusLayerColorTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_diff_1k.webp')
// humusLayerColorTexture.colorSpace = THREE.SRGBColorSpace
// const humusLayerARMTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_arm_1k.webp')
// const humusLayerNormalTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_nor_gl_1k.webp')
// const humusLayerDisplacementTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_disp_2k.webp')

const humusLayerColorTexture = textureLoader.load('./textures/humusLayer/color.jpg')
humusLayerColorTexture.colorSpace = THREE.SRGBColorSpace
const humusLayerARMTexture = textureLoader.load('./textures/humusLayer/ao_map.png')
const humusLayerNormalTexture = textureLoader.load('./textures/humusLayer/normal_map.png')
const humusLayerDisplacementTexture = textureLoader.load('./textures/humusLayer/displacement_map.png')





const topsoilColorTexture = textureLoader.load('./textures/topSoil/color.jpg')
topsoilColorTexture.colorSpace = THREE.SRGBColorSpace
const topsoilARMTexture = textureLoader.load('./textures/topSoil/roughness_map.jpg')
const topsoilNormalTexture = textureLoader.load('./textures/topSoil/normal_map.jpg')
const topsoilDisplacementTexture = textureLoader.load('./textures/topSoil/height_map.jpg')
const topsoilAOTexture = textureLoader.load('./textures/topSoil/ao_map.jpg')




// const subsoilColorTexture = textureLoader.load('./textures/subSoil/red_mud_stones_diff_1k.webp')
// subsoilColorTexture.colorSpace = THREE.SRGBColorSpace
// const subsoilARMTexture = textureLoader.load('./textures/subSoil/red_mud_stones_arm_1k.webp')
// const subsoilNormalTexture = textureLoader.load('./textures/subSoil/red_mud_stones_nor_gl_1k.webp')
// const subsoilDisplacementTexture = textureLoader.load('./textures/subSoil/red_mud_stones_disp_1k.webp')

const subsoilColorTexture = textureLoader.load('./textures/subSoil/subsoil.jpg')
subsoilColorTexture.colorSpace = THREE.SRGBColorSpace
const subsoilNormalTexture = textureLoader.load('./textures/subSoil/normal_map_subsoil.png')
const subsoilDisplacementTexture = textureLoader.load('./textures/subSoil/displacement_map.png')
const subsoilAOTexture = textureLoader.load('./textures/subsoil/ao_map.png')





// const parentRockColorTexture = textureLoader.load('./textures/parentRock/hand-drawn-color.jpg')
// parentRockColorTexture.colorSpace = THREE.SRGBColorSpace
// const parentRockARMTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_arm_1k.webp')
// const parentRockNormalTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_nor_gl_1k.webp')
// const parentRockDisplacementTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_height_1k.webp')
// const parentRockAOTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_ao_1k.webp')



const parentRockColorTexture = textureLoader.load('./textures/parentRock/hand-drawn-color.jpg')
parentRockColorTexture.colorSpace = THREE.SRGBColorSpace
const parentRockARMTexture = textureLoader.load('./textures/parentRock/roughness_map.jpg')
const parentRockNormalTexture = textureLoader.load('./textures/parentRock/normal_map.jpg')
const parentRockAOTexture = textureLoader.load('./textures/parentRock/ao_map.jpg')


const bedRockColorTexture = textureLoader.load('./textures/bedRock/1.jpeg')
bedRockColorTexture.colorSpace = THREE.SRGBColorSpace
const bedRockARMTexture = textureLoader.load('./textures/bedRock/new_roughness_map.jpg')
const bedRockNormalTexture = textureLoader.load('./textures/bedRock/new_normal_map.jpg')
const bedRockDisplacementTexture = textureLoader.load('./textures/bedRock/new_displacement_map.jpg')
const bedRockAOTexture = textureLoader.load('./textures/bedRock/new_ao_map.jpg')


// Repeat wrapping for parent rock textures
parentRockColorTexture.wrapS = THREE.RepeatWrapping;
parentRockColorTexture.wrapT = THREE.RepeatWrapping;
parentRockColorTexture.repeat.set(0.5, 0.5);

parentRockARMTexture.wrapS = THREE.RepeatWrapping;
parentRockARMTexture.wrapT = THREE.RepeatWrapping;
parentRockARMTexture.repeat.set(0.5, 0.5);

parentRockNormalTexture.wrapS = THREE.RepeatWrapping;
parentRockNormalTexture.wrapT = THREE.RepeatWrapping;
parentRockNormalTexture.repeat.set(0.5, 0.5);

// parentRockDisplacementTexture.wrapS = THREE.RepeatWrapping;
// parentRockDisplacementTexture.wrapT = THREE.RepeatWrapping;
// parentRockDisplacementTexture.repeat.set(0.5, 0.5);

parentRockAOTexture.wrapS = THREE.RepeatWrapping;
parentRockAOTexture.wrapT = THREE.RepeatWrapping;
parentRockAOTexture.repeat.set(0.5, 0.5);



/** 
 * Lights
 */

// Increase ambient light intensity
const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Increased from 1 to 2
scene.add(ambientLight)

// Add multiple directional lights from different angles
const frontLight = new THREE.DirectionalLight(0xffffff, 2);
frontLight.position.set(0, 5, 5);
scene.add(frontLight);

/**
 * Layers of soil
 */

const layersOfSoil = new THREE.Group()


// 3D-Text
const fontLoader = new FontLoader()

let text

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry(
            'Layers of Soil 3D',
            {
                font: font,
                size: 0.7,
                depth: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
        text = new THREE.Mesh(textGeometry, textMaterial)
        // scene.add(text)

        text.position.x -= 3.5
        text.position.y += 3
    }
)

// Grass and tree above the ground

const grassLayer = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3, 64, 64),
    new THREE.MeshStandardMaterial({
        // wireframe: true,
        color: "lightgreen",
        alphaMap: grassAOTexture,
        transparent: true,
        map: grassColorTexture,
        aoMap: grassAOTexture,
        roughnessMap: grassRoughnessTexture,
        normalMap: grassNormalTexture,
        displacementMap: grassDisplacementTexture,
        // Check the 2 via lil-gui
        displacementScale: 0.5,
        displacementBias: -0.15
    })
)

grassLayer.rotation.x = - Math.PI * 0.5
layersOfSoil.add(grassLayer)

// Humus
// Increase segments, especially on the y-axis
const humusLayer = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.5, 3, 64, 64, 64), // More segments
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: humusLayerColorTexture,
        roughnessMap: humusLayerARMTexture,
        normalMap: humusLayerNormalTexture,
        displacementMap: humusLayerDisplacementTexture,
        displacementScale: 0.1,
        displacementBias: -0.07 // Add this to push displacement inward
    })
)
layersOfSoil.add(humusLayer)

// Topsoil
const topsoil = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        map: topsoilColorTexture,
        roughnessMap: topsoilARMTexture,
        metalnessMap: topsoilARMTexture,
        normalMap: topsoilNormalTexture,
        aoMap: topsoilAOTexture,
        displacementMap: topsoilDisplacementTexture,
        displacementScale: 0.1,
        displacementBias: -0.045 // Add this to push displacement inward
    })
)
layersOfSoil.add(topsoil)

// Subsoil
const subsoil = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.5, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        map: subsoilColorTexture,
        // roughnessMap: subsoilARMTexture,
        normalMap: subsoilNormalTexture,
        displacementMap: subsoilDisplacementTexture,
        displacementScale: 0.2,
        displacementBias: -0.09
    })
)
layersOfSoil.add(subsoil)

// Parent Rock
const parentRock = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.5, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: parentRockColorTexture,
        roughnessMap: parentRockARMTexture,
        aoMap: parentRockAOTexture,
        normalMap: parentRockNormalTexture,
        // displacementMap: parentRockDisplacementTexture,
        // displacementScale: 0.1,
        // displacementBias: -0.08
    })
)
layersOfSoil.add(parentRock)

// Bedrock
const bedRock = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2.4, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: bedRockColorTexture,
        roughnessMap: bedRockARMTexture,
        aoMap: bedRockAOTexture,
        normalMap: bedRockNormalTexture,
        displacementScale: 0.5,
        displacementBias: -0.45
    })
)
layersOfSoil.add(bedRock)

humusLayer.name = "humusLayer"
topsoil.name = "topsoil"
subsoil.name = "subsoil"
parentRock.name = "parentRock"
bedRock.name = "bedRock"

layersOfSoil.scale.set(2.3, 2.3, 2.3)
scene.add(layersOfSoil)



debugObject.expandLayers = () => {
    isExpanded = !isExpanded

    if (isExpanded) {

        gsap.to(text.position, {
            duration: 1,
            y: 6,
            ease: 'power2.inOut'
        })

        gsap.to(grassLayer.position, {
            duration: 1,
            // y: 12.15,
            y: 5.3,
            ease: 'power2.inOut'
        })

        gsap.to(humusLayer.position, {
            duration: 1,
            y: 5,
            ease: 'power2.inOut'
        })

        gsap.to(topsoil.position, {
            duration: 1.2,
            y: 3.7,
            ease: 'power2.inOut'
        })

        gsap.to(subsoil.position, {
            duration: 1.4,
            y: 2,
            ease: 'power2.inOut'
        })

        gsap.to(parentRock.position, {
            duration: 1.6,
            y: -0.5,
            ease: 'power2.inOut'
        })

        gsap.to(model2.position, {
            duration: 3,
            y: +0.4,
            ease: 'power2.inOut'
        })

        gsap.to(bedRock.position, {
            duration: 1.7,
            y: -4,
            ease: 'power2.inOut'
        })
    }
    else {

        gsap.to(text.position, {
            duration: 1.8,
            y: 3,
            ease: 'power2.inOut'
        })

        gsap.to(grassLayer.position, {
            duration: 1.8,
            y: 2.3,
            ease: 'power2.inOut'
        })

        gsap.to(humusLayer.position, {
            duration: 1.8,
            y: 2,
            ease: 'power2.inOut'
        })

        gsap.to(topsoil.position, {
            duration: 1.6,
            y: 1.25,
            ease: 'power2.inOut'
        })

        gsap.to(subsoil.position, {
            duration: 1.4,
            y: 0,
            ease: 'power2.inOut'
        })

        gsap.to(model2.position, {
            duration: 1,
            y: -3,
            ease: 'power2.inOut'
        })

        gsap.to(parentRock.position, {
            duration: 1.2,
            y: -1.5,
            ease: 'power2.inOut'
        })

        gsap.to(bedRock.position, {
            duration: 1,
            y: -3.5,
            ease: 'power2.inOut'
        })
    }
}

const body = document.querySelector('body')

// Light and Dark modes
debugObject.lightMode = () => {
    isLightMode = !isLightMode;

    if (isLightMode) {
        html.classList.add('light-mode');
        html.classList.remove('dark-mode');
    } else {
        html.classList.add('dark-mode');
        html.classList.remove('light-mode');
    }
};


gui.add(debugObject, 'lightMode').name('Light/Dark Mode')
gui.add(debugObject, 'expandLayers').name('Expand Layers')
// GUI toggle for Stats
// First, add a default boolean to the debugObject
debugObject.showStats = false; // Default to off

// Initially hide the stats panel
stats.dom.style.display = 'none';

// Add the toggle to the GUI
gui.add(debugObject, 'showStats').name('Show Stats').onChange((value) => {
    stats.dom.style.display = value ? 'block' : 'none';
});

// Default positions
grassLayer.position.y += 2.3
humusLayer.position.y += 2
topsoil.position.y += 1.25
subsoil.position.y -= 0
parentRock.position.y -= 1.5
bedRock.position.y -= 3.5


/**
 * Raycaster 
 */

layersOfSoil.updateMatrixWorld()

const raycaster = new THREE.Raycaster()

/**
 * Mouse
 */

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = -(event.clientY / sizes.height * 2 - 1)
})

window.addEventListener('click', () => {
    // Only handle clicks when not in zoomed state
    if (isLayerZoomed) return;

    // Get all visible info boxes
    const visibleInfoBoxes = document.querySelectorAll('.info-box.visible');

    if (currentIntersect) {
        console.log(currentIntersect.object.name)

        // Play whoosh sound before animation starts
        playWhooshSound();

        // Get the info box for the currently intersected object
        const clickedInfoBox = document.getElementById(`${currentIntersect.object.name}-info`);

        // Set the zoomed state flag
        isLayerZoomed = true;

        // Call the appropriate animation function based on the layer name
        if (currentIntersect.object.name === 'humusLayer') {
            animateHumusLayer(humusLayer, grassLayer, topsoil, subsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; });
        } else if (currentIntersect.object.name === 'topsoil') {
            animateTopsoilLayer(topsoil, grassLayer, humusLayer, subsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; });
        } else if (currentIntersect.object.name === 'subsoil') {
            animateSubsoilLayer(subsoil, grassLayer, humusLayer, topsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; });
        } else if (currentIntersect.object.name === 'parentRock') {
            animateParentRockLayer(parentRock, grassLayer, humusLayer, topsoil, subsoil, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; });
        } else if (currentIntersect.object.name === 'bedRock') {
            animateBedRockLayer(bedRock, grassLayer, humusLayer, topsoil, subsoil, parentRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; });
        }

        // Hide all other visible info boxes first
        visibleInfoBoxes.forEach(box => {
            if (box.id !== `${currentIntersect.object.name}-info`) {
                box.classList.remove('visible');
            }
        });

        // Toggle visibility of the clicked info box
        if (clickedInfoBox) {
            clickedInfoBox.classList.toggle('visible');
        }
    } else {
        // If clicked outside any layer, hide all visible info boxes
        visibleInfoBoxes.forEach(box => {
            box.classList.remove('visible');
        });
    }
});

// Create a back button for returning from layer view
const createBackButton = () => {
    // Check if button already exists
    if (document.getElementById('back-button')) return;

    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.innerHTML = 'Go Back';
    backButton.style.position = 'fixed';
    backButton.style.bottom = '20px'; // Changed from top to bottom
    backButton.style.right = '20px';
    backButton.style.padding = '12px 20px'; // Made bigger
    backButton.style.backgroundColor = 'white'; // Changed to white
    backButton.style.color = 'black';
    backButton.style.border = '5px solid black'; // Thicker border
    backButton.style.borderRadius = '5px';
    backButton.style.cursor = 'pointer';
    backButton.style.fontWeight = 'bold';
    backButton.style.fontSize = '16px'; // Larger font
    backButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    backButton.style.display = 'none';
    backButton.style.zIndex = '1000';

    backButton.addEventListener('mouseover', () => {
        backButton.style.backgroundColor = '#f0f0f0';
    });

    backButton.addEventListener('mouseout', () => {
        backButton.style.backgroundColor = 'white';
    });

    document.body.appendChild(backButton);
};

// Call this function to create the back button
createBackButton();

// Add ESC key listener for returning from layer view
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const backButton = document.getElementById('back-button');
        if (backButton && backButton.style.display === 'block') {
            backButton.click();
        }
    }
});

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 5
camera.position.z = 20
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



// Sounds

// Create audio listener --to listen sounds. (EARS)
const listener = new THREE.AudioListener()

// Attach the listener to the camera to let us have the ability to hear sound in the scene.
camera.add(listener)


// Create audio source object --emits sounds. (SPEAKER)
const sound = new THREE.Audio(listener)

// Audio loader to load audio files
const audioLoader = new THREE.AudioLoader()

// Load sound files into the speaker.
audioLoader.load(narrationSound, function (buffer) {
    sound.setBuffer(buffer) // Attach the loaded sound
    // sound.setLoop(true) // Make it loop
    sound.setVolume(0.5)
})

const whooshSound = new Audio(whoosh)

function playWhooshSound() {
    whooshSound.play()
}

// Create an object to store sound controls
const soundControls = {
    play: () => {
        if (!sound.isPlaying) {
            sound.play()
        }
    },
    pause: () => {
        if (sound.isPlaying) {
            sound.pause();
        }
    },
    stop: () => {
        if (sound.isPlaying) {
            sound.stop();
        }
    },
    volume: 0.5 // Default volume level
}

// Add buttons to lil-gui
const soundFolder = gui.addFolder('Narration Controls');
soundFolder.add(soundControls, 'play').name('▶ Play');
soundFolder.add(soundControls, 'pause').name('⏸ Pause');
soundFolder.add(soundControls, 'stop').name('⏹ Stop');
soundFolder.add(soundControls, 'volume', 0, 1, 0.01).onChange((value) => {
    sound.setVolume(value);
});

/**
 * Animate
 */

function animateLayer(layerName) {
    if (layerName === 'humusLayer') {
        console.log("Hello humus")
        animateHumusLayer(humusLayer, grassLayer, topsoil, subsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; })
    } else if (layerName === 'topsoil') {
        console.log("Hello topsoil")
        animateTopsoilLayer(topsoil, grassLayer, humusLayer, subsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; })
    } else if (layerName === 'subsoil') {
        console.log("Hello subsoil")
        animateSubsoilLayer(subsoil, grassLayer, humusLayer, topsoil, parentRock, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; })
    } else if (layerName === 'parentRock') {
        console.log("Hello parent rock")
        animateParentRockLayer(parentRock, grassLayer, humusLayer, topsoil, subsoil, bedRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; })
    } else if (layerName === 'bedRock') {
        console.log("Hello bedrock")
        animateBedRockLayer(bedRock, grassLayer, humusLayer, topsoil, subsoil, parentRock, model2, camera, controls, isExpanded, playWhooshSound, () => { isLayerZoomed = false; })
    }
}

const clock = new THREE.Clock()
// Counter to handle multiple clicks to animate.
let counter = 0

// For mouse enter and mouse leave events
let currentIntersect = null

debugObject.animateCamera = () => {
    // Only if value is 1 it'll play, i.e; only 1 animation at a time.
    counter++

    // Return if spam clicked
    if (counter != 1) {
        return
    }

    // Save initial camera position to return to
    const initialPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    // First, expand layers if they aren't already
    if (!isExpanded) {
        debugObject.expandLayers();

        // Wait for expansion to complete before starting camera animation
        setTimeout(() => {
            startCameraJourney();
        }, 1800); // Match your expansion animation duration
    } else {
        // If already expanded, start camera journey immediately
        startCameraJourney();
    }

    function startCameraJourney() {
        // Play whoosh sound before starting camera movement
        playWhooshSound();

        // Timeline for sequential animations
        const timeline = gsap.timeline();

        // Initial overview position - higher as requested
        timeline.to(camera.position, {
            duration: 1.7,
            x: 6,
            y: 18, // Higher starting position
            z: 6,
            ease: 'power2.inOut',
            onUpdate: () => controls.update(),
            onComplete: () => {
                // Play narration after camera reaches the first position
                soundControls.play();
            }
        });

        // Pause at overview position
        timeline.to({}, { duration: 2 }); // Back to original pause time

        // Humus layer view
        timeline.to(camera.position, {
            duration: 2,
            x: 6, // Keeping x,z same to avoid moving forward
            y: 12.5, // Using your suggested values
            z: 7,
            ease: 'power2.inOut',
            onUpdate: () => controls.update()
        });

        // Pause at humus layer
        timeline.to({}, { duration: 2 });

        // Subsoil view
        timeline.to(camera.position, {
            duration: 2,
            x: 6,
            y: 8, // Using your suggested values
            z: 7,
            ease: 'power2.inOut',
            onUpdate: () => controls.update()
        });

        // Pause at subsoil layer
        timeline.to({}, { duration: 2 });

        // Parent rock view
        timeline.to(camera.position, {
            duration: 2,
            x: 6,
            y: 2, // Using your suggested values
            z: 6,
            ease: 'power2.inOut',
            onUpdate: () => controls.update()
        });

        // Pause at parent rock layer
        timeline.to({}, { duration: 2 });

        // Bedrock view - going down, not up
        timeline.to(camera.position, {
            duration: 2,
            x: 8,
            y: -17, // Going down to see bedrock
            z: 8,
            ease: 'power2.inOut',
            onUpdate: () => controls.update()
        });

        // Pause at bedrock layer
        timeline.to({}, { duration: 2 });

        // Play whoosh sound before returning
        playWhooshSound();

        // Return to initial position
        timeline.to(camera.position, {
            duration: 3,
            x: initialPosition.x,
            y: initialPosition.y,
            z: initialPosition.z,
            ease: 'power1.out',
            onUpdate: () => controls.update(),
            onComplete: () => {
                // Close expanded layers after animation completes
                // And revert back the counter
                if (isExpanded) {
                    debugObject.expandLayers();
                    counter = 0
                }
            }
        });
    }
};

gui.add(debugObject, 'animateCamera')


const tick = () => {
    stats.begin(); // Start measuring

    // Info box is always at 80% zoom level
    for (let box of infoBox) {
        box.style.zoom = "80%";
    }

    const elapsedTime = clock.getElapsedTime();

    raycaster.setFromCamera(mouse, camera)

    const objectsToTest = [humusLayer, subsoil, topsoil, parentRock, bedRock]

    // Get ALL intersections and sort by distance (closest first)
    const intersects = raycaster.intersectObjects(objectsToTest)
        .sort((a, b) => a.distance - b.distance);

    // Only scale objects when not in zoomed state
    if (!isLayerZoomed) {
        // Bring it back to default on each frame.
        for (const object of objectsToTest) {
            object.scale.set(1, 1, 1)
        }

        // Only process if we have intersections and not in zoomed state
        if (intersects.length > 0) {
            currentIntersect = intersects[0];
            // Get only the closest object (first intersection)
            const closestObject = intersects[0].object;

            // Scale only the closest object
            closestObject.scale.set(1.1, 1.1, 1.1);
        } else {
            currentIntersect = null
        }
    }

    // Update controls
    controls.update();

    // Rotate the layers and models
    layersOfSoil.rotation.y -= 0.001

    if (model1) {
        model1.rotation.y -= 0.001
    }

    if (model2) {
        model2.rotation.y -= 0.001
    }

    // Render scene
    renderer.render(scene, camera);

    stats.end(); // End measuring

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();