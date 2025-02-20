import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from 'stats.js'
import gsap from 'gsap'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: ms, 2: memory
document.body.appendChild(stats.dom);


/**
 * Base
 */

// Flag to Expand/contract layers
let isExpanded = false
let isLightMode = false

// Debug
const gui = new GUI()

const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()

const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace

const grassColorTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_Color.jpg')
grassColorTexture.colorSpace = THREE.SRGBColorSpace
const grassNormalTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_NormalGL.jpg')
const grassDisplacementTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_Displacement.jpg')
const grassRoughnessTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_Roughness.jpg')
const grassAOTexture = textureLoader.load('./textures/grass/Grass006_1K-JPG_AmbientOcclusion.jpg')

const humusLayerColorTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_diff_1k.jpg')
humusLayerColorTexture.colorSpace = THREE.SRGBColorSpace
const humusLayerARMTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_arm_1k.jpg')
const humusLayerNormalTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_nor_gl_1k.jpg')
const humusLayerDisplacementTexture = textureLoader.load('./textures/humusLayer/trident_maple_bark_disp_2k.jpg')

const topsoilColorTexture = textureLoader.load('./textures/topSoil/gravelly_sand_diff_1k.jpg')
topsoilColorTexture.colorSpace = THREE.SRGBColorSpace
const topsoilARMTexture = textureLoader.load('./textures/topSoil/gravelly_sand_arm_1k.jpg')
const topsoilNormalTexture = textureLoader.load('./textures/topSoil/gravelly_sand_nor_gl_1k.jpg')
const topsoilDisplacementTexture = textureLoader.load('./textures/topSoil/gravelly_sand_disp_1k.jpg')

const subsoilColorTexture = textureLoader.load('./textures/subSoil/red_mud_stones_diff_1k.jpg')
subsoilColorTexture.colorSpace = THREE.SRGBColorSpace
const subsoilARMTexture = textureLoader.load('./textures/subSoil/red_mud_stones_arm_1k.jpg')
const subsoilNormalTexture = textureLoader.load('./textures/subSoil/red_mud_stones_nor_gl_1k.jpg')
const subsoilDisplacementTexture = textureLoader.load('./textures/subSoil/red_mud_stones_disp_1k.jpg')

const parentRockColorTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_col_1k.jpg')
parentRockColorTexture.colorSpace = THREE.SRGBColorSpace
const parentRockARMTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_arm_1k.jpg')
const parentRockNormalTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_nor_gl_1k.jpg')
const parentRockDisplacementTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_height_1k.jpg')
const parentRockAOTexture = textureLoader.load('./textures/parentRock/rocks_ground_02_ao_1k.jpg')

const bedRockColorTexture = textureLoader.load('./textures/bedRock/broken_wall_diff_1k.jpg')
bedRockColorTexture.colorSpace = THREE.SRGBColorSpace
const bedRockARMTexture = textureLoader.load('./textures/bedRock/broken_wall_arm_1k.jpg')
const bedRockNormalTexture = textureLoader.load('./textures/bedRock/broken_wall_nor_gl_1k.jpg')
const bedRockDisplacementTexture = textureLoader.load('./textures/bedRock/broken_wall_disp_1k.jpg')
const bedRockAOTexture = textureLoader.load('./textures/bedRock/broken_wall_ao_1k.jpg')


// Repeat wrapping for parent rock textures
parentRockColorTexture.wrapS = THREE.RepeatWrapping;
parentRockColorTexture.wrapT = THREE.RepeatWrapping;
parentRockColorTexture.repeat.set(3, 3);

parentRockARMTexture.wrapS = THREE.RepeatWrapping;
parentRockARMTexture.wrapT = THREE.RepeatWrapping;
parentRockARMTexture.repeat.set(3, 3);

parentRockNormalTexture.wrapS = THREE.RepeatWrapping;
parentRockNormalTexture.wrapT = THREE.RepeatWrapping;
parentRockNormalTexture.repeat.set(3, 3);

parentRockDisplacementTexture.wrapS = THREE.RepeatWrapping;
parentRockDisplacementTexture.wrapT = THREE.RepeatWrapping;
parentRockDisplacementTexture.repeat.set(3, 3);

parentRockAOTexture.wrapS = THREE.RepeatWrapping;
parentRockAOTexture.wrapT = THREE.RepeatWrapping;
parentRockAOTexture.repeat.set(3, 3);


/** 
 * Lights
 */

// Increase ambient light intensity
const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Increased from 1 to 2
scene.add(ambientLight)

// Add multiple directional lights from different angles
const frontLight = new THREE.DirectionalLight(0xffffff, 1);
frontLight.position.set(0, 5, 5);
scene.add(frontLight);

// const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
// backLight.position.set(0, 5, -5);
// scene.add(backLight);

// const sideLight = new THREE.DirectionalLight(0xffffff, 0.8);
// sideLight.position.set(5, 5, 0);
// scene.add(sideLight);



/**
 * Layers of soil
 */


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
        scene.add(text)

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
scene.add(grassLayer)

// Humus
// Increase segments, especially on the y-axis
const humusLayer = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.5, 3, 64, 64, 64), // More segments
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: humusLayerColorTexture,
        aoMap: humusLayerARMTexture,
        roughnessMap: humusLayerARMTexture,
        metalnessMap: humusLayerARMTexture,
        normalMap: humusLayerNormalTexture,
        displacementMap: humusLayerDisplacementTexture,
        displacementScale: 0.1,
        displacementBias: -0.07 // Add this to push displacement inward
    })
)
scene.add(humusLayer)

// Topsoil
const topsoil = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        map: topsoilColorTexture,
        roughnessMap: topsoilARMTexture,
        metalnessMap: topsoilARMTexture,
        normalMap: topsoilNormalTexture,
        displacementMap: topsoilDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.1 // Add this to push displacement inward
    })
)
scene.add(topsoil)

// Subsoil
const subsoil = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.5, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        map: subsoilColorTexture,
        roughnessMap: subsoilARMTexture,
        metalnessMap: subsoilARMTexture,
        normalMap: subsoilNormalTexture,
        displacementMap: subsoilDisplacementTexture,
        displacementScale: 0.2,
        displacementBias: -0.09
    })
)
scene.add(subsoil)

// Parent Rock
const parentRock = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.5, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: parentRockColorTexture,
        roughnessMap: parentRockARMTexture,
        metalnessMap: parentRockARMTexture,
        aoMap: parentRockAOTexture,
        normalMap: parentRockNormalTexture,
        displacementMap: parentRockDisplacementTexture,
        displacementScale: 0.1,
        displacementBias: -0.08
    })
)
scene.add(parentRock)

// Bedrock
const bedRock = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2.5, 3, 64, 64, 64),
    new THREE.MeshStandardMaterial({
        transparent: true,
        map: bedRockColorTexture,
        roughnessMap: bedRockARMTexture,
        metalnessMap: bedRockARMTexture,
        aoMap: bedRockAOTexture,
        normalMap: bedRockNormalTexture,
        displacementMap: bedRockDisplacementTexture,
        displacementScale: 0.5,
        displacementBias: -0.45
    })
)
scene.add(bedRock)


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
        scene.background = new THREE.Color(0xffffff); // White

    } else {
        scene.background = new THREE.Color(0x000000); // Black
    }
};

gui.add(debugObject, 'lightMode').name('Light/Dark Mode')
gui.add(debugObject, 'expandLayers').name('Expand Layers')

// Default positions
grassLayer.position.y += 2.3
humusLayer.position.y += 2
topsoil.position.y += 1.25
subsoil.position.y -= 0
parentRock.position.y -= 1.5
bedRock.position.y -= 3.5

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
camera.position.y = 3
camera.position.z = 8
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
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
audioLoader.load('./sounds/avala-trail-forest-nature.mp3', function (buffer) {
    sound.setBuffer(buffer) // Attach the loaded sound
    sound.setLoop(true) // Make it loop
    sound.setVolume(0.5)
})


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
const soundFolder = gui.addFolder('Sound Controls');
soundFolder.add(soundControls, 'play').name('▶ Play');
soundFolder.add(soundControls, 'pause').name('⏸ Pause');
soundFolder.add(soundControls, 'stop').name('⏹ Stop');
soundFolder.add(soundControls, 'volume', 0, 1, 0.01).onChange((value) => {
    sound.setVolume(value);
});

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    stats.begin(); // Start measuring

    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);

    stats.end(); // End measuring

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();



