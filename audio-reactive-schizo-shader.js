// AUDIO REACTIVE SCHIZO SHADER ART
// Raw. Gritty. Painful. Fucked up.
// The sound corrupts everything.

let song;
let fft;
let amplitude;
let glitchShader;
let feedbackBuffer;
let mainBuffer;

// Shader code - fragment shader for post-processing
let fragShader = `
precision highp float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform sampler2D feedbackTex;
uniform vec2 resolution;
uniform float time;

// Audio uniforms
uniform float bass;
uniform float mid;
uniform float treble;
uniform float amp;
uniform float beat;
uniform vec4 spectrum[64]; // FFT spectrum data

// Chaos uniforms
uniform float glitchAmount;
uniform float corruption;
uniform float pain;

// Hash function for pseudo-random
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Noise function
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

// Chromatic aberration - driven by bass
vec3 chromaticAberration(vec2 uv, float amount) {
    float r = texture2D(tex0, uv + vec2(amount, 0.0)).r;
    float g = texture2D(tex0, uv).g;
    float b = texture2D(tex0, uv - vec2(amount, 0.0)).b;
    return vec3(r, g, b);
}

// Displacement mapping
vec2 displace(vec2 uv, float strength) {
    float n1 = noise(uv * 10.0 + time * 0.5);
    float n2 = noise(uv * 15.0 - time * 0.3);
    return uv + vec2(n1, n2) * strength;
}

// Pixel sorting effect
vec3 pixelSort(vec2 uv, float strength) {
    vec2 blockUV = floor(uv * resolution / 8.0) / (resolution / 8.0);
    float sortValue = hash(blockUV + floor(time * 2.0));

    if (sortValue < strength) {
        uv.x = blockUV.x;
    }
    return texture2D(tex0, uv).rgb;
}

// Glitch blocks
float glitchBlock(vec2 uv) {
    float block = floor(uv.y * 20.0 + time * 10.0);
    return step(0.95, hash(vec2(block, floor(time * 5.0))));
}

// Color corruption
vec3 corruptColor(vec3 col, float amount) {
    // Bit crushing
    col = floor(col * (32.0 - amount * 24.0)) / (32.0 - amount * 24.0);

    // Channel swapping based on audio
    if (mod(time * bass, 1.0) > 0.7) {
        col.rgb = col.gbr;
    }
    if (mod(time * mid, 1.3) > 0.8) {
        col.rgb = col.brg;
    }

    // Inversion spikes
    if (beat > 0.7) {
        col = 1.0 - col;
    }

    return col;
}

// Datamosh effect
vec3 datamosh(vec2 uv, float amount) {
    vec3 current = texture2D(tex0, uv).rgb;
    vec3 previous = texture2D(feedbackTex, uv).rgb;

    // Motion vector estimation (crude)
    vec2 motion = vec2(
        noise(uv * 20.0 + time) - 0.5,
        noise(uv * 20.0 - time) - 0.5
    ) * amount * bass;

    vec3 shifted = texture2D(feedbackTex, uv + motion).rgb;

    return mix(current, shifted, amount * 0.7);
}

// Scan lines with audio modulation
float scanlines(vec2 uv) {
    float line = sin(uv.y * resolution.y * 0.5 + time * 10.0) * 0.5 + 0.5;
    return line * (0.7 + mid * 0.3);
}

// Feedback distortion
vec3 feedbackDistort(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    vec2 toCenter = uv - center;
    float dist = length(toCenter);

    // Spiral distortion based on bass
    float angle = atan(toCenter.y, toCenter.x);
    angle += bass * 0.5 + sin(time * 2.0) * mid * 0.2;
    dist += sin(dist * 10.0 - time * 3.0) * treble * 0.02;

    vec2 distorted = center + vec2(cos(angle), sin(angle)) * dist;

    return texture2D(feedbackTex, distorted).rgb;
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y; // Flip Y coordinate

    // Initial UV distortion based on mid frequencies
    vec2 distortedUV = displace(uv, mid * 0.05 + pain * 0.02);

    // Glitch displacement
    if (glitchBlock(uv) > 0.5) {
        distortedUV.x += (hash(vec2(floor(time * 10.0), floor(uv.y * 20.0))) - 0.5) * glitchAmount;
    }

    // Chromatic aberration driven by bass
    vec3 color = chromaticAberration(distortedUV, bass * 0.02 + beat * 0.05);

    // Mix with feedback buffer for trails and smearing
    vec3 feedback = feedbackDistort(uv);
    color = mix(color, feedback, 0.3 + bass * 0.2);

    // Datamosh effect
    color = datamosh(distortedUV, corruption * 0.5);

    // Pixel sorting on high treble
    if (treble > 0.5) {
        color = mix(color, pixelSort(distortedUV, treble), 0.6);
    }

    // Color corruption
    color = corruptColor(color, corruption);

    // Harsh contrast and saturation
    color = (color - 0.5) * (1.5 + amp * 1.0) + 0.5;

    // Add spectrum data as visual artifacts
    float spectrumNoise = 0.0;
    for (int i = 0; i < 64; i++) {
        float bin = spectrum[i].x;
        if (mod(uv.x * 64.0, 64.0) < float(i) && mod(uv.x * 64.0, 64.0) > float(i) - 1.0) {
            spectrumNoise += bin * 0.5;
        }
    }
    color += vec3(spectrumNoise) * pain * 0.3;

    // Scan lines
    color *= scanlines(uv);

    // Vignette of pain
    float vignette = 1.0 - length(uv - 0.5) * (0.8 + bass * 0.5);
    color *= vignette;

    // Random RGB shift spikes on beat
    if (beat > 0.8 && mod(time * 100.0, 1.0) > 0.9) {
        color.r = texture2D(tex0, uv + vec2(0.05, 0.0)).r;
        color.b = texture2D(tex0, uv - vec2(0.05, 0.0)).b;
    }

    // Noise grain
    float grain = hash(uv * time * 100.0) * 0.1 * (1.0 + treble);
    color += vec3(grain);

    // Clamp to prevent over-bright
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
`;

// Vertex shader (standard passthrough)
let vertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}
`;

// Variables for visual generation
let beatDetect = 0;
let lastBass = 0;
let particles = [];

function preload() {
    song = loadSound('DEMO2.m4a');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    // Audio analysis
    fft = new p5.FFT(0.8, 256);
    amplitude = new p5.Amplitude();

    song.loop();

    // Create shader
    glitchShader = createShader(vertShader, fragShader);

    // Create buffers
    feedbackBuffer = createGraphics(width, height, WEBGL);
    mainBuffer = createGraphics(width, height, WEBGL);

    // Initialize particles for base layer
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            vx: random(-2, 2),
            vy: random(-2, 2),
            size: random(2, 10),
            color: color(random(255), random(255), random(255))
        });
    }

    pixelDensity(1);
}

function draw() {
    // Analyze audio
    let spectrum = fft.analyze();
    let waveData = fft.waveform();
    let level = amplitude.getLevel();

    // Extract frequency bands
    let bass = fft.getEnergy("bass") / 255;
    let mid = fft.getEnergy("mid") / 255;
    let treble = fft.getEnergy("treble") / 255;

    // Beat detection
    if (bass > lastBass + 0.15) {
        beatDetect = 1.0;
    }
    lastBass = bass;
    beatDetect *= 0.92; // Decay

    // Draw base layer to main buffer
    mainBuffer.push();
    mainBuffer.background(0);

    // Raw particle system affected by audio
    for (let p of particles) {
        // Audio reactive movement
        p.vx += (noise(p.x * 0.01, frameCount * 0.01) - 0.5) * bass * 2;
        p.vy += (noise(p.y * 0.01, frameCount * 0.01) - 0.5) * mid * 2;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Draw with audio-reactive properties
        mainBuffer.push();
        mainBuffer.translate(p.x - width/2, p.y - height/2);
        mainBuffer.noStroke();

        // Color shifts based on frequency
        let r = red(p.color) * (0.5 + bass * 0.5);
        let g = green(p.color) * (0.5 + mid * 0.5);
        let b = blue(p.color) * (0.5 + treble * 0.5);
        mainBuffer.fill(r, g, b, 150 + level * 105);

        let size = p.size * (1 + level * 3 + beatDetect * 2);
        mainBuffer.ellipse(0, 0, size, size);
        mainBuffer.pop();
    }

    // Raw waveform visualization
    mainBuffer.push();
    mainBuffer.stroke(255, 0, 255, 180);
    mainBuffer.strokeWeight(2 + bass * 4);
    mainBuffer.noFill();
    mainBuffer.beginShape();
    for (let i = 0; i < waveData.length; i += 4) {
        let x = map(i, 0, waveData.length, -width/2, width/2);
        let y = map(waveData[i], -1, 1, -height/4, height/4) * (1 + mid * 2);
        mainBuffer.vertex(x, y);
    }
    mainBuffer.endShape();
    mainBuffer.pop();

    // Spectrum bars (brutal)
    for (let i = 0; i < spectrum.length; i += 4) {
        let x = map(i, 0, spectrum.length, -width/2, width/2);
        let h = map(spectrum[i], 0, 255, 0, height/2);

        mainBuffer.push();
        mainBuffer.translate(x, height/4);
        mainBuffer.fill(
            (i * 4) % 255,
            255 - ((i * 4) % 255),
            128,
            100 + level * 155
        );
        mainBuffer.noStroke();
        mainBuffer.rect(0, 0, 4, -h);
        mainBuffer.pop();
    }

    mainBuffer.pop();

    // Apply shader with audio data
    push();
    shader(glitchShader);

    // Set uniforms
    glitchShader.setUniform('tex0', mainBuffer);
    glitchShader.setUniform('feedbackTex', feedbackBuffer);
    glitchShader.setUniform('resolution', [width, height]);
    glitchShader.setUniform('time', millis() / 1000.0);

    // Audio uniforms
    glitchShader.setUniform('bass', bass);
    glitchShader.setUniform('mid', mid);
    glitchShader.setUniform('treble', treble);
    glitchShader.setUniform('amp', level);
    glitchShader.setUniform('beat', beatDetect);

    // Chaos parameters driven by audio
    glitchShader.setUniform('glitchAmount', bass * 0.3 + beatDetect * 0.5);
    glitchShader.setUniform('corruption', mid * 0.7 + treble * 0.3);
    glitchShader.setUniform('pain', level * 1.5 + treble * 0.5);

    // Pass spectrum as vec4 array (packing 4 values per uniform)
    let spectrumPacked = [];
    for (let i = 0; i < 256; i += 4) {
        spectrumPacked.push([
            spectrum[i] / 255,
            spectrum[i+1] / 255,
            spectrum[i+2] / 255,
            spectrum[i+3] / 255
        ]);
    }
    glitchShader.setUniform('spectrum', spectrumPacked);

    // Draw fullscreen quad
    rect(0, 0, width, height);
    pop();

    // Copy current frame to feedback buffer for next frame
    feedbackBuffer.image(get(), -width/2, -height/2, width, height);
}

function mousePressed() {
    if (song.isPlaying()) {
        song.pause();
    } else {
        song.loop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    feedbackBuffer = createGraphics(width, height, WEBGL);
    mainBuffer = createGraphics(width, height, WEBGL);
}
