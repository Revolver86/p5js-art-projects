// AUDIO REACTIVE SCHIZO CORRUPTION
// A brutal, glitching, self-destructing visual system
// that convulses and tears itself apart in response to audio

let song;
let fft;
let amplitude;
let corruptionShader;
let feedbackBuffer;
let glitchBuffer;

// Frequency band indices
let bassRange, lowMidRange, midRange, highMidRange, trebleRange;

// Audio analysis values
let bassLevel = 0;
let lowMidLevel = 0;
let midLevel = 0;
let highMidLevel = 0;
let trebleLevel = 0;
let overallAmp = 0;

// Chaos accumulators - these build up over time creating increasing destruction
let chaosAccum = 0;
let tearAccum = 0;
let corruptionAccum = 0;

// Vertex shader
const vertShader = `
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

// Fragment shader
const fragShader = `
precision highp float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_bass;
uniform float u_lowMid;
uniform float u_mid;
uniform float u_highMid;
uniform float u_treble;
uniform float u_amplitude;
uniform float u_chaos;
uniform float u_tear;
uniform float u_corruption;
uniform sampler2D u_feedbackTex;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

float noise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n = i.x + i.y * 57.0 + i.z * 113.0;

    return mix(
        mix(mix(hash(n), hash(n + 1.0), f.x),
            mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
            mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y),
        f.z);
}

vec3 chromaticAberration(vec2 uv, float amount) {
    float r = fbm(uv * 20.0 + u_time * 0.3 + u_bass * 5.0);
    float g = fbm(uv * 20.0 + u_time * 0.3 + u_mid * 3.0);
    float b = fbm(uv * 20.0 + u_time * 0.3 + u_treble * 7.0);

    vec2 rOffset = vec2(cos(u_time + u_bass * 10.0), sin(u_time + u_bass * 10.0)) * amount * u_bass;
    vec2 bOffset = vec2(cos(u_time + u_treble * 15.0), sin(u_time + u_treble * 15.0)) * amount * u_treble;

    return vec3(r + rOffset.x, g, b + bOffset.x);
}

vec2 glitchDisplace(vec2 uv) {
    float tear = step(0.98, noise(vec2(uv.y * 50.0 + u_time * 2.0, u_tear)));
    float tearOffset = tear * (hash(floor(uv.y * 50.0)) - 0.5) * u_bass * 0.5;

    float fracture = step(0.97, noise(vec2(uv.x * 40.0 + u_time * 3.0, u_mid * 10.0)));
    float fractureOffset = fracture * (hash(floor(uv.x * 40.0)) - 0.5) * u_mid * 0.3;

    vec2 chaosDisplace = vec2(
        noise(vec2(uv.x * 30.0, u_time + u_treble * 20.0)) - 0.5,
        noise(vec2(uv.y * 30.0, u_time + u_highMid * 15.0)) - 0.5
    ) * u_treble * 0.1;

    return uv + vec2(tearOffset, fractureOffset) + chaosDisplace;
}

vec3 dataCorrupt(vec3 color, vec2 uv) {
    float pixelSize = mix(1.0, 50.0, u_corruption * u_treble);
    vec2 pixelatedUV = floor(uv * u_resolution / pixelSize) * pixelSize / u_resolution;

    float bitDepth = mix(256.0, 4.0, u_corruption * u_highMid);
    color = floor(color * bitDepth) / bitDepth;

    float pixelDeath = step(0.99, noise(pixelatedUV * 100.0 + u_time * 5.0));
    color *= (1.0 - pixelDeath * u_corruption);

    return color;
}

vec3 colorDestroy(vec3 color) {
    float levels = mix(32.0, 3.0, u_bass * u_chaos);
    color = floor(color * levels) / levels;

    if (mod(u_time * u_mid * 10.0, 3.0) < 1.0) {
        color = color.gbr;
    } else if (mod(u_time * u_mid * 10.0, 3.0) < 2.0) {
        color = color.brg;
    }

    float invertChance = step(0.7, u_amplitude) * step(0.95, noise(vec2(u_time * 2.0, 0.0)));
    color = mix(color, 1.0 - color, invertChance);

    return color;
}

vec3 feedbackChaos(vec2 uv, vec3 currentColor) {
    vec2 fbUV = uv;
    fbUV += vec2(
        noise(vec2(u_time * 0.5 + u_bass * 5.0, uv.y * 10.0)) - 0.5,
        noise(vec2(u_time * 0.5 + u_mid * 5.0, uv.x * 10.0)) - 0.5
    ) * 0.02 * u_chaos;

    vec3 feedback = texture2D(u_feedbackTex, fbUV).rgb;

    float feedbackAmount = u_amplitude * 0.7;
    return mix(currentColor, feedback, feedbackAmount);
}

void main() {
    vec2 uv = vTexCoord;

    vec2 displaceUV = glitchDisplace(uv);

    vec3 color = vec3(0.0);

    float bassWave = sin(displaceUV.x * 5.0 + u_time + u_bass * 20.0) *
                     cos(displaceUV.y * 5.0 + u_time + u_bass * 15.0);
    color.r = bassWave * u_bass * 2.0;

    vec2 midCoord = displaceUV * 10.0 + vec2(u_time * 0.5, u_time * 0.3);
    float midNoise = fbm(midCoord + u_mid * 10.0);
    color.g = midNoise * u_mid * 3.0;

    vec3 trebleCoord = vec3(displaceUV * 50.0, u_time * 2.0 + u_treble * 30.0);
    float trebleNoise = noise3d(trebleCoord);
    color.b = trebleNoise * u_treble * 4.0;

    vec3 aberration = chromaticAberration(displaceUV, 0.05);
    color += aberration * u_amplitude;

    float chaosNoise = fbm(displaceUV * 20.0 + u_time + u_chaos);
    color += chaosNoise * u_chaos * 0.5;

    color = feedbackChaos(uv, color);

    color = dataCorrupt(color, uv);

    color = colorDestroy(color);

    float scanline = sin(uv.y * u_resolution.y * 2.0 + u_time * 10.0) * 0.05 * u_lowMid;
    color += scanline;

    vec2 splitOffset = vec2(u_bass * 0.03, u_treble * 0.03);
    float splitR = fbm((uv + splitOffset) * 15.0 + u_time);
    float splitB = fbm((uv - splitOffset) * 15.0 + u_time);
    color.r += splitR * u_bass;
    color.b += splitB * u_treble;

    float vignette = length(uv - 0.5);
    vignette = 1.0 - smoothstep(0.3, 0.8 + u_amplitude * 0.3, vignette);
    color *= vignette;

    // High frequency noise injection for chaos
    float highFreqChaos = noise3d(vec3(uv * 200.0, u_time * 5.0));
    color += highFreqChaos * u_chaos * 0.3;

    if (u_amplitude > 0.7 && u_chaos > 2.0) {
        float destruction = noise3d(vec3(uv * 100.0, u_time * 10.0));
        color = mix(color, vec3(destruction), 0.3);
    }

    color = clamp(color, 0.0, 2.0);

    gl_FragColor = vec4(color, 1.0);
}
`;

function preload() {
  song = loadSound('DEMO2.m4a');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // Create shader from embedded strings
  corruptionShader = createShader(vertShader, fragShader);

  // Audio analysis
  fft = new p5.FFT(0.8, 1024);
  amplitude = new p5.Amplitude();

  // Define frequency ranges (out of 1024 bins)
  bassRange = [0, 8];           // Deep bass
  lowMidRange = [8, 32];        // Low mids
  midRange = [32, 128];         // Mids
  highMidRange = [128, 256];    // High mids
  trebleRange = [256, 512];     // Treble

  // Create buffers for feedback and glitch effects
  feedbackBuffer = createGraphics(width, height, WEBGL);
  glitchBuffer = createGraphics(width, height, WEBGL);

  // Start paused - user must click to play
  song.loop();
  song.pause();

  noStroke();
  frameRate(60);
}

function draw() {
  // Analyze audio
  let spectrum = fft.analyze();
  overallAmp = amplitude.getLevel();

  // Get frequency band energies
  bassLevel = getFrequencyEnergy(spectrum, bassRange[0], bassRange[1]);
  lowMidLevel = getFrequencyEnergy(spectrum, lowMidRange[0], lowMidRange[1]);
  midLevel = getFrequencyEnergy(spectrum, midRange[0], midRange[1]);
  highMidLevel = getFrequencyEnergy(spectrum, highMidRange[0], highMidRange[1]);
  trebleLevel = getFrequencyEnergy(spectrum, trebleRange[0], trebleRange[1]);

  // Accumulate chaos - bass creates tears, treble creates corruption
  tearAccum += bassLevel * 0.01;
  corruptionAccum += trebleLevel * 0.008;
  chaosAccum += overallAmp * 0.02;

  // Periodic reset to prevent complete destruction (but keep it chaotic)
  if (frameCount % 600 === 0) {
    tearAccum *= 0.3;
    corruptionAccum *= 0.4;
    chaosAccum *= 0.5;
  }

  // Copy current frame to feedback buffer with decay
  feedbackBuffer.clear();
  feedbackBuffer.image(glitchBuffer, -width/2, -height/2, width, height);

  // Apply the corruption shader
  glitchBuffer.shader(corruptionShader);

  // Pass audio data and chaos to shader
  corruptionShader.setUniform('u_resolution', [width, height]);
  corruptionShader.setUniform('u_time', millis() / 1000.0);
  corruptionShader.setUniform('u_bass', bassLevel);
  corruptionShader.setUniform('u_lowMid', lowMidLevel);
  corruptionShader.setUniform('u_mid', midLevel);
  corruptionShader.setUniform('u_highMid', highMidLevel);
  corruptionShader.setUniform('u_treble', trebleLevel);
  corruptionShader.setUniform('u_amplitude', overallAmp);
  corruptionShader.setUniform('u_chaos', chaosAccum);
  corruptionShader.setUniform('u_tear', tearAccum);
  corruptionShader.setUniform('u_corruption', corruptionAccum);
  corruptionShader.setUniform('u_feedbackTex', feedbackBuffer);

  // Draw a full-screen quad to apply the shader
  glitchBuffer.push();
  glitchBuffer.noStroke();
  glitchBuffer.fill(255);
  glitchBuffer.rectMode(CENTER);
  glitchBuffer.rect(0, 0, width, height);
  glitchBuffer.pop();

  // Display the result
  push();
  imageMode(CENTER);
  image(glitchBuffer, 0, 0, width, height);
  pop();

  // Visual feedback of audio levels (optional debug - comment out if too clean)
  if (false) { // Set to true to see frequency bars
    drawFrequencyBars();
  }
}

function getFrequencyEnergy(spectrum, startBin, endBin) {
  let sum = 0;
  for (let i = startBin; i < endBin && i < spectrum.length; i++) {
    sum += spectrum[i];
  }
  return sum / ((endBin - startBin) * 255);
}

function drawFrequencyBars() {
  push();
  translate(-width/2, height/2 - 100);
  fill(255, 0, 0, 200);
  rect(0, 0, bassLevel * 100, 20);
  translate(0, -25);
  fill(255, 100, 0, 200);
  rect(0, 0, lowMidLevel * 100, 20);
  translate(0, -25);
  fill(255, 255, 0, 200);
  rect(0, 0, midLevel * 100, 20);
  translate(0, -25);
  fill(0, 255, 0, 200);
  rect(0, 0, highMidLevel * 100, 20);
  translate(0, -25);
  fill(0, 100, 255, 200);
  rect(0, 0, trebleLevel * 100, 20);
  pop();
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
  glitchBuffer = createGraphics(width, height, WEBGL);
}
