// AUDIO REACTIVE SCHIZO PAIN
// A disturbing journey through broken reality
// Raw, glitchy, painful, fucked up

let song;
let fft;
let amplitude;
let shader;
let feedbackLayer;
let glitchLayer;
let prevFrame;

// Audio reactive parameters
let bassEnergy = 0;
let midEnergy = 0;
let trebleEnergy = 0;
let overallAmp = 0;
let peakDetect = 0;

// Chaos parameters
let chaosTime = 0;
let glitchIntensity = 0;
let painLevel = 0;
let fragmentationIndex = 0;

// Vertex shader - distorted geometry
const vertShader = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uPain;
varying vec2 vTexCoord;
varying vec3 vPos;

// Distortion noise
float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(
        mix(mix(hash(n+0.0), hash(n+1.0), f.x),
            mix(hash(n+57.0), hash(n+58.0), f.x), f.y),
        mix(mix(hash(n+113.0), hash(n+114.0), f.x),
            mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
}

void main() {
    vec3 pos = aPosition;

    // Bass-driven convulsions
    float bassDisp = uBass * 3.0 * sin(pos.y * 8.0 + uTime * 5.0);

    // Mid-frequency tearing
    float midTear = noise(vec3(pos.xy * 10.0, uTime * 2.0)) * uMid * 2.0;

    // Treble disintegration
    float trebleShatter = noise(vec3(pos * 15.0 + uTime * 8.0)) * uTreble * 1.5;

    // Painful distortion
    float pain = uPain * noise(vec3(pos * 5.0, uTime)) * 0.5;

    // Combine distortions
    pos += vec3(bassDisp + midTear * 0.3, trebleShatter + pain, midTear);

    // Glitch displacement
    if (mod(uTime * 10.0 + pos.y * 20.0, 1.0) < uTreble * 0.3) {
        pos.x += sin(uTime * 50.0) * uBass * 0.5;
    }

    vPos = pos;
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
}
`;

// Fragment shader - painful visual effects
const fragShader = `
precision highp float;
varying vec2 vTexCoord;
varying vec3 vPos;
uniform sampler2D uFeedback;
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uAmp;
uniform float uPain;
uniform float uGlitch;
uniform vec2 uResolution;

// Hash for randomness
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Chromatic aberration
vec3 chromaticAberration(sampler2D tex, vec2 uv, float amount) {
    float r = texture2D(tex, uv + vec2(amount, 0.0)).r;
    float g = texture2D(tex, uv).g;
    float b = texture2D(tex, uv - vec2(amount, 0.0)).b;
    return vec3(r, g, b);
}

void main() {
    vec2 uv = vTexCoord;
    vec2 center = vec2(0.5);

    // Audio-reactive UV distortion
    float bassWarp = sin(uv.y * 20.0 + uTime * 3.0) * uBass * 0.1;
    float midWarp = noise(uv * 10.0 + uTime) * uMid * 0.08;
    vec2 distortedUV = uv + vec2(bassWarp, midWarp);

    // Treble creates glitch blocks
    float glitchBlock = step(0.95, noise(vec2(floor(uv.x * 20.0), floor(uv.y * 20.0 + uTime * 10.0))));
    if (glitchBlock > 0.5 && uTreble > 0.3) {
        distortedUV.x += sin(uTime * 100.0) * 0.1;
        distortedUV.y += cos(uTime * 100.0) * 0.1;
    }

    // Feedback with chromatic aberration
    float aberrationAmount = uTreble * 0.02 + uPain * 0.03;
    vec3 feedback = chromaticAberration(uFeedback, distortedUV, aberrationAmount);

    // Feedback decay (audio-reactive)
    float decay = 0.92 - uBass * 0.15;
    feedback *= decay;

    // Create base pattern - fragmented circles
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    float angle = atan(toCenter.y, toCenter.x);

    // Bass-driven radial segments
    float segments = 8.0 + floor(uBass * 20.0);
    float radialPattern = sin(angle * segments + uTime * 2.0) * cos(dist * 15.0 - uTime * 3.0);

    // Mid-frequency creates interference patterns
    float interference = sin(uv.x * 30.0 + uTime + uMid * 10.0) *
                        cos(uv.y * 30.0 - uTime + uMid * 10.0);

    // Treble creates static/noise
    float staticNoise = noise(uv * 100.0 + uTime * 10.0) * uTreble;

    // Combine patterns
    float pattern = radialPattern * 0.5 + interference * 0.3 + staticNoise * 0.2;

    // Painful color palette (harsh, discordant)
    vec3 color1 = vec3(1.0, 0.0, 0.3); // Painful magenta
    vec3 color2 = vec3(0.0, 1.0, 0.8); // Sickly cyan
    vec3 color3 = vec3(1.0, 0.9, 0.0); // Acidic yellow
    vec3 color4 = vec3(0.2, 0.0, 0.8); // Deep purple

    // Audio-reactive color mixing
    vec3 baseColor = mix(color1, color2, sin(uTime + uBass * 5.0) * 0.5 + 0.5);
    baseColor = mix(baseColor, color3, uMid);
    baseColor = mix(baseColor, color4, uTreble);

    // Apply pattern to color
    vec3 patternColor = baseColor * (pattern * 0.5 + 0.5);

    // Mix with feedback (creates visual trails and artifacts)
    vec3 finalColor = mix(patternColor, feedback, 0.7 + uPain * 0.2);

    // Amplitude-driven intensity
    finalColor *= (0.5 + uAmp * 2.0);

    // Random color inversion (glitch effect)
    float inversionChance = noise(vec2(floor(uTime * 5.0), floor(uv.y * 10.0)));
    if (inversionChance > 0.9 - uGlitch * 0.2) {
        finalColor = 1.0 - finalColor;
    }

    // Scanlines
    float scanline = sin(uv.y * 500.0 + uTime * 10.0) * 0.05;
    finalColor += scanline;

    // RGB split on peaks
    if (uAmp > 0.8) {
        finalColor.r += sin(uTime * 20.0) * 0.3;
        finalColor.b -= cos(uTime * 20.0) * 0.3;
    }

    // Vignette (painful)
    float vignette = 1.0 - dist * 0.8;
    finalColor *= vignette;

    // Clamp but allow some oversaturation for harshness
    finalColor = clamp(finalColor, 0.0, 1.5);

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

function preload() {
    song = loadSound('DEMO2.m4a');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    pixelDensity(1);

    // Create shader
    shader = createShader(vertShader, fragShader);

    // Create feedback layer
    feedbackLayer = createGraphics(width, height, WEBGL);
    feedbackLayer.pixelDensity(1);

    // Audio analysis
    fft = new p5.FFT(0.8, 256);
    amplitude = new p5.Amplitude();

    // Start song
    song.loop();
    song.setVolume(0.7);

    // Dark background
    background(0);
}

function draw() {
    // Analyze audio
    let spectrum = fft.analyze();

    // Get frequency bands
    bassEnergy = fft.getEnergy("bass") / 255.0;
    midEnergy = fft.getEnergy("mid") / 255.0;
    trebleEnergy = fft.getEnergy("treble") / 255.0;
    overallAmp = amplitude.getLevel();

    // Smooth the values for less jitter
    bassEnergy = lerp(bassEnergy, fft.getEnergy("bass") / 255.0, 0.3);
    midEnergy = lerp(midEnergy, fft.getEnergy("mid") / 255.0, 0.3);
    trebleEnergy = lerp(trebleEnergy, fft.getEnergy("treble") / 255.0, 0.3);

    // Detect peaks for glitch effects
    if (overallAmp > 0.7) {
        peakDetect = 1.0;
        glitchIntensity = min(glitchIntensity + 0.2, 1.0);
    } else {
        peakDetect *= 0.9;
        glitchIntensity *= 0.95;
    }

    // Accumulate pain over time
    painLevel = (bassEnergy + midEnergy + trebleEnergy) / 3.0;
    fragmentationIndex += overallAmp * 0.01;

    // Increment chaos
    chaosTime += 0.016 + overallAmp * 0.05;

    // Apply shader to feedback layer
    feedbackLayer.shader(shader);

    // Set uniforms
    shader.setUniform('uTime', chaosTime);
    shader.setUniform('uBass', bassEnergy);
    shader.setUniform('uMid', midEnergy);
    shader.setUniform('uTreble', trebleEnergy);
    shader.setUniform('uAmp', overallAmp);
    shader.setUniform('uPain', painLevel);
    shader.setUniform('uGlitch', glitchIntensity);
    shader.setUniform('uResolution', [width, height]);
    shader.setUniform('uFeedback', feedbackLayer);

    // Draw to feedback layer
    feedbackLayer.push();
    feedbackLayer.noStroke();
    feedbackLayer.rect(-width/2, -height/2, width, height);
    feedbackLayer.pop();

    // Draw to main canvas
    push();
    shader(shader);
    shader.setUniform('uTime', chaosTime);
    shader.setUniform('uBass', bassEnergy);
    shader.setUniform('uMid', midEnergy);
    shader.setUniform('uTreble', trebleEnergy);
    shader.setUniform('uAmp', overallAmp);
    shader.setUniform('uPain', painLevel);
    shader.setUniform('uGlitch', glitchIntensity);
    shader.setUniform('uResolution', [width, height]);
    shader.setUniform('uFeedback', feedbackLayer);

    // Draw multiple planes at different depths for schizo effect
    noStroke();

    // Main plane
    translate(0, 0, 0);
    rect(-width/2, -height/2, width, height);

    // Additional glitchy planes
    if (glitchIntensity > 0.5) {
        push();
        translate(sin(chaosTime * 3) * 50, cos(chaosTime * 2) * 50, -100);
        rotateZ(sin(chaosTime) * bassEnergy * 0.5);
        rect(-width/2, -height/2, width, height);
        pop();
    }

    if (trebleEnergy > 0.6) {
        push();
        translate(cos(chaosTime * 5) * 30, sin(chaosTime * 4) * 30, 50);
        rotateX(midEnergy * 0.3);
        rect(-width/2, -height/2, width, height);
        pop();
    }

    pop();

    // Add 3D geometric chaos on top
    drawGeometricChaos();

    // Glitch overlay
    if (random() < glitchIntensity * 0.3) {
        drawGlitchBars();
    }
}

function drawGeometricChaos() {
    push();

    // Audio-reactive camera rotation
    rotateX(sin(chaosTime * 0.5) * bassEnergy * 0.5);
    rotateY(cos(chaosTime * 0.3) * midEnergy * 0.5);
    rotateZ(sin(chaosTime * 0.7) * trebleEnergy * 0.3);

    // Create fragmented wireframe shapes
    noFill();

    let numShapes = floor(5 + trebleEnergy * 10);
    for (let i = 0; i < numShapes; i++) {
        push();

        // Audio-driven positioning
        let x = sin(chaosTime * (i * 0.1) + bassEnergy * 10) * (200 + overallAmp * 300);
        let y = cos(chaosTime * (i * 0.15) + midEnergy * 8) * (200 + overallAmp * 300);
        let z = sin(chaosTime * (i * 0.2) + trebleEnergy * 12) * (200 + overallAmp * 200);

        translate(x, y, z);

        // Harsh colors
        let r = (sin(chaosTime + i) * 0.5 + 0.5) * 255 * (1 + bassEnergy);
        let g = (cos(chaosTime * 1.3 + i) * 0.5 + 0.5) * 255 * (1 + midEnergy);
        let b = (sin(chaosTime * 1.7 + i) * 0.5 + 0.5) * 255 * (1 + trebleEnergy);
        stroke(r, g, b, 100 + overallAmp * 155);
        strokeWeight(1 + bassEnergy * 3);

        // Audio-reactive rotation
        rotateX(chaosTime * (i * 0.5) + bassEnergy * 5);
        rotateY(chaosTime * (i * 0.7) + midEnergy * 4);
        rotateZ(chaosTime * (i * 0.3) + trebleEnergy * 6);

        // Audio-reactive size
        let size = 30 + overallAmp * 100 + bassEnergy * 50;

        // Different shapes based on frequency content
        if (bassEnergy > midEnergy && bassEnergy > trebleEnergy) {
            box(size);
        } else if (midEnergy > bassEnergy && midEnergy > trebleEnergy) {
            sphere(size / 2, 8, 6);
        } else {
            cone(size / 2, size * 1.5, 8, 1);
        }

        pop();
    }

    pop();
}

function drawGlitchBars() {
    // Random horizontal glitch bars
    push();
    noStroke();

    let numBars = floor(random(3, 10));
    for (let i = 0; i < numBars; i++) {
        let y = random(-height/2, height/2);
        let h = random(5, 40);
        let offset = random(-50, 50) * glitchIntensity;

        fill(random(255), random(255), random(255), random(100, 200));
        rect(-width/2 + offset, y, width, h);
    }

    pop();
}

function mousePressed() {
    // Toggle play/pause
    if (song.isPlaying()) {
        song.pause();
    } else {
        song.play();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    feedbackLayer = createGraphics(width, height, WEBGL);
    feedbackLayer.pixelDensity(1);
}
