import * as THREE from "three";

const canvas = document.getElementById("galaxy");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    58,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

camera.position.set(0, 7.5, 28);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setClearColor(0x000000, 1);

const galaxy = new THREE.Group();

galaxy.rotation.x = 0.35;

scene.add(galaxy);

const PARTICLES = 120000;
const ARMS = 5;
const GALAXY_RADIUS = 20;

const positions =
    new Float32Array(PARTICLES * 3);

const colors =
    new Float32Array(PARTICLES * 3);

const sizes =
    new Float32Array(PARTICLES);

const randomness =
    new Float32Array(PARTICLES);

const galaxyColors = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#fff4cf"),
    new THREE.Color("#ffd3c4"),
    new THREE.Color("#ff8fc7"),
    new THREE.Color("#f43fa9"),
    new THREE.Color("#a84cff"),
    new THREE.Color("#6b45ff"),
    new THREE.Color("#386cff"),
    new THREE.Color("#20bfff"),
    new THREE.Color("#43e5ff"),
    new THREE.Color("#a2f5ff")
];

for (let i = 0; i < PARTICLES; i++) {
    const i3 = i * 3;

    const radius =
        Math.pow(Math.random(), 1.65) *
        GALAXY_RADIUS;

    const normalizedRadius =
        radius / GALAXY_RADIUS;

    const arm =
        Math.floor(Math.random() * ARMS);

    const armAngle =
        (arm / ARMS) *
        Math.PI *
        2;

    const spiral =
        normalizedRadius *
        Math.PI *
        5.8;

    const armSpread =
        (Math.random() - 0.5) *
        (
            0.28 +
            normalizedRadius * 2.2
        );

    const angle =
        armAngle +
        spiral +
        armSpread;

    const thickness =
        (Math.random() - 0.5) *
        (1.0 - normalizedRadius) *
        3.2;

    const finalRadius =
        radius + thickness;

    const x =
        Math.cos(angle) *
        finalRadius;

    const y =
        (Math.random() - 0.5) *
        (
            0.55 +
            normalizedRadius * 1.6
        );

    const z =
        Math.sin(angle) *
        finalRadius *
        0.58;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const color =
        new THREE.Color();

    const randomColor =
        Math.random();

    if (normalizedRadius < 0.08) {

        color.set("#fff8dc");

    } else if (normalizedRadius < 0.20) {

        const warmColors = [
            new THREE.Color("#fff4d0"),
            new THREE.Color("#ffd59a"),
            new THREE.Color("#ffb36b"),
            new THREE.Color("#ff9a9e")
        ];

        color.copy(
            warmColors[
                Math.floor(
                    Math.random() *
                    warmColors.length
                )
            ]
        );

    } else if (randomColor < 0.10) {

        color.set("#ffffff");

    } else if (randomColor < 0.28) {

        color.set("#ff75c8");

    } else if (randomColor < 0.43) {

        color.set("#b45cff");

    } else if (randomColor < 0.62) {

        color.set("#596cff");

    } else if (randomColor < 0.78) {

        color.set("#25cfff");

    } else if (randomColor < 0.90) {

        color.set("#82efff");

    } else {

        color.set("#ffd5b0");
    }

    const colorVariation =
        0.75 +
        Math.random() * 0.3;

    colors[i3] =
        Math.min(
            color.r *
            colorVariation,
            1
        );

    colors[i3 + 1] =
        Math.min(
            color.g *
            colorVariation,
            1
        );

    colors[i3 + 2] =
        Math.min(
            color.b *
            colorVariation,
            1
        );

    const isBrightStar =
        Math.random() < 0.035;

    const baseSize =
        isBrightStar
            ? 0.9 + Math.random() * 1.4
            : 0.22 + Math.random() * 0.55;

    const distanceSize =
        1.15 -
        normalizedRadius * 0.12;

    sizes[i] =
        baseSize *
        distanceSize;

    randomness[i] =
        Math.random();
}

const geometry =
    new THREE.BufferGeometry();

geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        positions,
        3
    )
);

geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
        colors,
        3
    )
);

geometry.setAttribute(
    "aSize",
    new THREE.BufferAttribute(
        sizes,
        1
    )
);

geometry.setAttribute(
    "aRandom",
    new THREE.BufferAttribute(
        randomness,
        1
    )
);

const material =
    new THREE.ShaderMaterial({

        transparent: true,

        depthWrite: false,

        blending:
            THREE.AdditiveBlending,

        uniforms: {

            uPixelRatio: {
                value:
                    Math.min(
                        window.devicePixelRatio,
                        2
                    )
            },

            uZoom: {
                value: 0
            }
        },

        vertexShader: `
            uniform float uPixelRatio;
            uniform float uZoom;

            attribute float aSize;
            attribute float aRandom;
            attribute vec3 color;

            varying vec3 vColor;
            varying float vRandom;
            varying float vDepth;

            void main() {

                vec3 pos =
                    position;

                float radius =
                    length(pos.xz);

                float angle =
                    atan(
                        pos.z,
                        pos.x
                    );

                pos.x =
                    cos(angle) *
                    radius;

                pos.z =
                    sin(angle) *
                    radius *
                    0.58;

                float localWave =
                    sin(
                        radius * 2.8 +
                        aRandom * 20.0
                    );

                pos.y +=
                    localWave *
                    0.045 *
                    (
                        1.0 -
                        radius / 20.0
                    );

                vec4 mvPosition =
                    modelViewMatrix *
                    vec4(
                        pos,
                        1.0
                    );

                float distanceScale =
                    38.0 /
                    max(
                        -mvPosition.z,
                        0.01
                    );

                float zoomMultiplier =
                    mix(
                        1.0,
                        1.65,
                        uZoom
                    );

                float minimumSize =
                    mix(
                        1.0,
                        1.35,
                        uZoom
                    );

                gl_PointSize =
                    max(
                        aSize *
                        distanceScale *
                        uPixelRatio *
                        zoomMultiplier,
                        minimumSize
                    );

                gl_Position =
                    projectionMatrix *
                    mvPosition;

                vColor =
                    color;

                vRandom =
                    aRandom;

                vDepth =
                    clamp(
                        1.0 -
                        (
                            -mvPosition.z /
                            50.0
                        ),
                        0.18,
                        1.0
                    );
            }
        `,

        fragmentShader: `
            varying vec3 vColor;
            varying float vRandom;
            varying float vDepth;

            void main() {

                vec2 uv =
                    gl_PointCoord -
                    vec2(0.5);

                float distance =
                    length(uv);

                if (distance > 0.5) {
                    discard;
                }

                float edge =
                    1.0 -
                    smoothstep(
                        0.32,
                        0.5,
                        distance
                    );

                float core =
                    1.0 -
                    smoothstep(
                        0.0,
                        0.20,
                        distance
                    );

                float center =
                    1.0 -
                    smoothstep(
                        0.0,
                        0.07,
                        distance
                    );

                float intensity =
                    edge * 0.55 +
                    core * 0.65 +
                    center * 0.35;

                vec3 finalColor =
                    vColor;

                float sparkle =
                    0.94 +
                    0.06 *
                    sin(
                        vRandom * 70.0
                    );

                finalColor *=
                    sparkle;

                gl_FragColor =
                    vec4(
                        finalColor,
                        intensity *
                        vDepth
                    );
            }
        `
    });

const stars =
    new THREE.Points(
        geometry,
        material
    );

galaxy.add(stars);

const coreGeometry =
    new THREE.SphereGeometry(
        2.4,
        32,
        32
    );

const coreMaterial =
    new THREE.ShaderMaterial({

        transparent: true,

        blending:
            THREE.AdditiveBlending,

        depthWrite: false,

        vertexShader: `
            varying vec3 vPosition;

            void main() {

                vPosition =
                    position;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(
                        position,
                        1.0
                    );
            }
        `,

        fragmentShader: `
            varying vec3 vPosition;

            void main() {

                float distance =
                    length(vPosition) /
                    2.4;

                float glow =
                    1.0 -
                    smoothstep(
                        0.0,
                        1.0,
                        distance
                    );

                glow =
                    pow(
                        glow,
                        3.5
                    );

                vec3 inner =
                    vec3(
                        1.0,
                        0.28,
                        0.04
                    );

                vec3 outer =
                    vec3(
                        1.0,
                        0.95,
                        0.65
                    );

                vec3 color =
                    mix(
                        inner,
                        outer,
                        glow
                    );

                gl_FragColor =
                    vec4(
                        color,
                        glow * 0.8
                    );
            }
        `
    });

const core =
    new THREE.Mesh(
        coreGeometry,
        coreMaterial
    );

galaxy.add(core);

const interaction = {

    dragging: false,

    moved: false,

    previousX: 0,

    previousY: 0,

    rotationX: 0,

    rotationY: 0,

    targetRotationX: 0,

    targetRotationY: 0,

    zoomed: false,

    cameraZ: 28,

    targetCameraZ: 28,

    cameraY: 7.5,

    targetCameraY: 7.5,

    cameraX: 0,

    targetCameraX: 0
};

canvas.addEventListener(
    "pointerdown",
    event => {

        interaction.dragging =
            true;

        interaction.moved =
            false;

        interaction.previousX =
            event.clientX;

        interaction.previousY =
            event.clientY;

        canvas.setPointerCapture(
            event.pointerId
        );
    }
);

canvas.addEventListener(
    "pointermove",
    event => {

        if (
            !interaction.dragging
        ) {
            return;
        }

        const deltaX =
            event.clientX -
            interaction.previousX;

        const deltaY =
            event.clientY -
            interaction.previousY;

        if (
            Math.abs(deltaX) > 2 ||
            Math.abs(deltaY) > 2
        ) {

            interaction.moved =
                true;
        }

        interaction.targetRotationY +=
            deltaX * 0.006;

        interaction.targetRotationX +=
            deltaY * 0.004;

        interaction.targetRotationX =
            THREE.MathUtils.clamp(
                interaction.targetRotationX,
                -1.25,
                1.25
            );

        interaction.previousX =
            event.clientX;

        interaction.previousY =
            event.clientY;
    }
);

canvas.addEventListener(
    "pointerup",
    event => {

        interaction.dragging =
            false;

        if (
            !interaction.moved
        ) {

            toggleZoom();
        }

        if (
            canvas.hasPointerCapture(
                event.pointerId
            )
        ) {

            canvas.releasePointerCapture(
                event.pointerId
            );
        }
    }
);

canvas.addEventListener(
    "pointercancel",
    event => {

        interaction.dragging =
            false;

        if (
            canvas.hasPointerCapture(
                event.pointerId
            )
        ) {

            canvas.releasePointerCapture(
                event.pointerId
            );
        }
    }
);

function toggleZoom() {

    interaction.zoomed =
        !interaction.zoomed;

    if (
        interaction.zoomed
    ) {

        interaction.targetCameraZ =
            3.2;

        interaction.targetCameraY =
            0.7;

        material.uniforms.uZoom.value =
            1;

    } else {

        interaction.targetCameraZ =
            28;

        interaction.targetCameraY =
            7.5;

        material.uniforms.uZoom.value =
            0;
    }
}

function animate() {

    requestAnimationFrame(
        animate
    );

    interaction.rotationX +=
        (
            interaction.targetRotationX -
            interaction.rotationX
        ) * 0.08;

    interaction.rotationY +=
        (
            interaction.targetRotationY -
            interaction.rotationY
        ) * 0.08;

    galaxy.rotation.x =
        0.35 +
        interaction.rotationX;

    galaxy.rotation.y =
        interaction.rotationY;

    interaction.cameraZ +=
        (
            interaction.targetCameraZ -
            interaction.cameraZ
        ) * 0.045;

    interaction.cameraY +=
        (
            interaction.targetCameraY -
            interaction.cameraY
        ) * 0.045;

    interaction.cameraX +=
        (
            interaction.targetCameraX -
            interaction.cameraX
        ) * 0.045;

    camera.position.z =
        interaction.cameraZ;

    camera.position.y =
        interaction.cameraY;

    camera.position.x =
        interaction.cameraX;

    camera.lookAt(
        0,
        0,
        0
    );

    renderer.render(
        scene,
        camera
    );
}

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

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

        material.uniforms
            .uPixelRatio
            .value =
                Math.min(
                    window.devicePixelRatio,
                    2
                );
    }
);

animate();