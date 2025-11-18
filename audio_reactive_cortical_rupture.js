// CORTICAL RUPTURE
// Audio-reactive schizophrenic visual torture
// The screen is a membrane being torn apart by sound

let mic;
let fft;
let amplitude;
let glitchShader;
let corruptionShader;
let feedbackBuffer;
let tearParticles = [];
let bassHistory = [];
let midHistory = [];
let highHistory = [];
let glitchIntensity = 0;
let tearForce = 0;
let colorCorruption = 0;

// Vertex shader - standard passthrough
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

// Fragment shader - the pain engine
const fragShader = `
precision highp float;

varying vec2 vTexCoord;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_bassIntensity;
uniform float u_midIntensity;
uniform float u_highIntensity;
uniform float u_glitchIntensity;
uniform float u_tearForce;
uniform float u_colorCorruption;
uniform vec2 u_tearPoints[32];
uniform int u_tearCount;

// Noise functions
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Displacement based on tear points (bass-driven)
vec2 getTearDisplacement(vec2 uv) {
  vec2 displacement = vec2(0.0);

  for(int i = 0; i < 32; i++) {
    if(i >= u_tearCount) break;

    vec2 tearPoint = u_tearPoints[i];
    float dist = length(uv - tearPoint);
    float strength = u_tearForce * 0.3 / (dist * 10.0 + 0.1);

    vec2 direction = normalize(uv - tearPoint);
    displacement += direction * strength * u_bassIntensity;
  }

  return displacement;
}

// RGB split and corruption (mid-driven)
vec3 getCorruptedColor(vec2 uv) {
  float chromaShift = u_midIntensity * u_colorCorruption * 0.05;

  float r = texture2D(u_texture, uv + vec2(chromaShift, 0.0)).r;
  float g = texture2D(u_texture, uv).g;
  float b = texture2D(u_texture, uv - vec2(chromaShift, 0.0)).b;

  // Color corruption - swap channels, invert, destroy
  float corruptionNoise = noise(uv * 50.0 + u_time);
  if(corruptionNoise > 0.98 - u_midIntensity * 0.3) {
    return vec3(b, r, g) * vec3(2.0, 0.5, 1.5);
  }

  return vec3(r, g, b);
}

// High frequency glitch (high-driven)
vec2 getGlitchOffset(vec2 uv) {
  float glitchLine = floor(uv.y * 100.0 * (1.0 + u_highIntensity * 5.0));
  float glitchRandom = random(vec2(glitchLine, floor(u_time * 10.0)));

  if(glitchRandom > 0.95 - u_highIntensity * 0.4 && u_glitchIntensity > 0.3) {
    float offset = (random(vec2(glitchLine, u_time)) - 0.5) * 0.3 * u_glitchIntensity;
    return vec2(offset, 0.0);
  }

  return vec2(0.0);
}

// Scanline interference
float getScanlineInterference(vec2 uv) {
  float scanline = sin(uv.y * 800.0 + u_time * 20.0) * 0.5 + 0.5;
  return scanline * 0.3 + 0.7;
}

// Block corruption
vec3 getBlockCorruption(vec2 uv) {
  vec2 blockSize = vec2(20.0, 20.0) * (1.0 + u_bassIntensity * 2.0);
  vec2 blockUV = floor(uv * u_resolution / blockSize);
  float blockNoise = random(blockUV + floor(u_time * 8.0));

  if(blockNoise > 0.97 - u_glitchIntensity * 0.2) {
    return vec3(random(blockUV), random(blockUV + 0.1), random(blockUV + 0.2));
  }

  return vec3(0.0);
}

void main() {
  vec2 uv = vTexCoord;

  // Apply tear displacement (BASS TEARS THE FABRIC)
  vec2 tearDisp = getTearDisplacement(uv);
  uv += tearDisp;

  // Apply high-frequency glitch (HIGHS CAUSE HORIZONTAL TEARS)
  vec2 glitchOffset = getGlitchOffset(uv);
  uv += glitchOffset;

  // Get corrupted color (MIDS CORRUPT THE SIGNAL)
  vec3 color = getCorruptedColor(uv);

  // Add block corruption
  vec3 blockCorrupt = getBlockCorruption(vTexCoord);
  color = mix(color, blockCorrupt, step(0.01, length(blockCorrupt)));

  // Scanline interference
  color *= getScanlineInterference(vTexCoord);

  // Vignette of pain
  float vignette = 1.0 - length(vTexCoord - 0.5) * 0.8;
  color *= vignette;

  // Overall intensity modulation
  float pulse = sin(u_time * 5.0) * 0.1 + 0.9;
  color *= pulse;

  // Add harsh contrast
  color = pow(color, vec3(1.0 + u_midIntensity * 0.5));

  gl_FragColor = vec4(color, 1.0);
}
`;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // Audio setup
  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.8, 256);
  fft.setInput(mic);

  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);

  // Shader setup
  glitchShader = createShader(vertShader, fragShader);

  // Feedback buffer for persistence
  feedbackBuffer = createGraphics(width, height);
  feedbackBuffer.pixelDensity(1);

  // Initialize history arrays
  for(let i = 0; i < 10; i++) {
    bassHistory.push(0);
    midHistory.push(0);
    highHistory.push(0);
  }

  // Create initial tear particles
  for(let i = 0; i < 50; i++) {
    tearParticles.push(new TearParticle());
  }

  console.log("CORTICAL RUPTURE INITIALIZED");
  console.log("Allow microphone access for audio reactivity");
}

function draw() {
  // Analyze audio
  let spectrum = fft.analyze();
  let amp = amplitude.getLevel();

  // Frequency bands
  let bass = fft.getEnergy("bass") / 255.0;
  let mid = fft.getEnergy("mid") / 255.0;
  let high = fft.getEnergy("treble") / 255.0;

  // Update histories
  bassHistory.shift();
  bassHistory.push(bass);
  midHistory.shift();
  midHistory.push(mid);
  highHistory.shift();
  highHistory.push(high);

  // Calculate intensities with smoothing
  let bassAvg = bassHistory.reduce((a, b) => a + b) / bassHistory.length;
  let midAvg = midHistory.reduce((a, b) => a + b) / midHistory.length;
  let highAvg = highHistory.reduce((a, b) => a + b) / highHistory.length;

  // Update global parameters
  glitchIntensity = lerp(glitchIntensity, highAvg * 2.0, 0.3);
  tearForce = lerp(tearForce, bassAvg * 3.0, 0.2);
  colorCorruption = lerp(colorCorruption, midAvg * 2.5, 0.25);

  // Draw to feedback buffer (the raw visual layer)
  feedbackBuffer.push();
  feedbackBuffer.translate(feedbackBuffer.width/2, feedbackBuffer.height/2);

  // Decay the feedback (painful persistence)
  feedbackBuffer.background(0, 0, 0, 25 + bass * 100);

  // Draw harsh geometric forms that respond to audio
  feedbackBuffer.noFill();
  feedbackBuffer.strokeWeight(2 + bass * 10);

  // Bass creates expanding brutal circles
  for(let i = 0; i < 5; i++) {
    let size = (frameCount % 100 + i * 20) * (1 + bass * 5);
    feedbackBuffer.stroke(
      255 * (noise(i * 100) + bass),
      50 + mid * 200,
      100 + high * 155,
      150 - i * 20
    );
    feedbackBuffer.circle(0, 0, size);
  }

  // Mids create violent lines
  for(let i = 0; i < 8; i++) {
    let angle = (frameCount * 0.02 + i * PI / 4) * (1 + mid * 2);
    let len = 100 + mid * 300;
    feedbackBuffer.stroke(
      100 + mid * 155,
      255 * (noise(i * 50 + frameCount * 0.01)),
      50,
      200
    );
    feedbackBuffer.strokeWeight(1 + mid * 8);
    feedbackBuffer.line(0, 0, cos(angle) * len, sin(angle) * len);
  }

  // Highs create jittering polygons
  let sides = 3 + floor(high * 10);
  feedbackBuffer.stroke(255, 255 * high, 255 * high, 180);
  feedbackBuffer.strokeWeight(1 + high * 5);
  feedbackBuffer.beginShape();
  for(let i = 0; i < sides; i++) {
    let angle = TWO_PI * i / sides + frameCount * 0.05;
    let r = 150 + sin(frameCount * 0.1 + i) * 50 + high * 100;
    let jitter = random(-high * 30, high * 30);
    feedbackBuffer.vertex(cos(angle) * r + jitter, sin(angle) * r + jitter);
  }
  feedbackBuffer.endShape(CLOSE);

  // Update and draw tear particles
  for(let p of tearParticles) {
    p.update(bass, mid, high);
    p.display(feedbackBuffer);
  }

  // Draw frequency spectrum as glitchy bars
  let barWidth = feedbackBuffer.width / spectrum.length;
  for(let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, -feedbackBuffer.width/2, feedbackBuffer.width/2);
    let h = map(spectrum[i], 0, 255, 0, feedbackBuffer.height);
    let hue = map(i, 0, spectrum.length, 0, 255);

    feedbackBuffer.fill(hue, 200 + spectrum[i] * 0.2, 255 - hue * 0.5, 100);
    feedbackBuffer.noStroke();
    feedbackBuffer.rect(x, feedbackBuffer.height/2 - h, barWidth, h);
  }

  feedbackBuffer.pop();

  // Apply shader to the feedback buffer
  shader(glitchShader);

  // Prepare tear points for shader
  let tearPoints = [];
  for(let i = 0; i < min(tearParticles.length, 32); i++) {
    tearPoints.push(tearParticles[i].x / width);
    tearPoints.push(tearParticles[i].y / height);
  }

  // Pad the array to 64 elements (32 vec2s)
  while(tearPoints.length < 64) {
    tearPoints.push(0.0);
  }

  // Set shader uniforms
  glitchShader.setUniform('u_texture', feedbackBuffer);
  glitchShader.setUniform('u_resolution', [width, height]);
  glitchShader.setUniform('u_time', frameCount * 0.01);
  glitchShader.setUniform('u_bassIntensity', bassAvg);
  glitchShader.setUniform('u_midIntensity', midAvg);
  glitchShader.setUniform('u_highIntensity', highAvg);
  glitchShader.setUniform('u_glitchIntensity', glitchIntensity);
  glitchShader.setUniform('u_tearForce', tearForce);
  glitchShader.setUniform('u_colorCorruption', colorCorruption);
  glitchShader.setUniform('u_tearPoints', tearPoints);
  glitchShader.setUniform('u_tearCount', min(tearParticles.length, 32));

  // Render the shader
  rect(-width/2, -height/2, width, height);

  // Spawn new tear particles on strong bass hits
  if(bass > 0.7 && random() > 0.7) {
    tearParticles.push(new TearParticle());
    if(tearParticles.length > 100) {
      tearParticles.shift();
    }
  }
}

// Tear Particle - represents points where audio tears the visual fabric
class TearParticle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.life = 255;
    this.size = random(5, 20);
    this.rotationSpeed = random(-0.1, 0.1);
    this.rotation = random(TWO_PI);
  }

  update(bass, mid, high) {
    // Bass affects position violently
    this.vx += random(-bass * 5, bass * 5);
    this.vy += random(-bass * 5, bass * 5);

    // Mids affect velocity
    this.vx *= (1 - mid * 0.05);
    this.vy *= (1 - mid * 0.05);

    // Highs affect rotation
    this.rotation += this.rotationSpeed * (1 + high * 10);

    this.x += this.vx;
    this.y += this.vy;

    // Decay
    this.life -= 1 + mid * 3;

    // Wrap around
    if(this.x < 0) this.x = width;
    if(this.x > width) this.x = 0;
    if(this.y < 0) this.y = height;
    if(this.y > height) this.y = 0;

    // Respawn if dead
    if(this.life <= 0) {
      this.x = random(width);
      this.y = random(height);
      this.life = 255;
    }
  }

  display(buffer) {
    buffer.push();
    buffer.translate(this.x - buffer.width/2, this.y - buffer.height/2);
    buffer.rotate(this.rotation);

    // Draw harsh X marks
    buffer.stroke(255, 50, 50, this.life);
    buffer.strokeWeight(2);
    buffer.line(-this.size, -this.size, this.size, this.size);
    buffer.line(-this.size, this.size, this.size, -this.size);

    buffer.pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  feedbackBuffer = createGraphics(width, height);
  feedbackBuffer.pixelDensity(1);
}

function mousePressed() {
  // Click to add tear points
  tearParticles.push(new TearParticle());
}

function keyPressed() {
  // Press any key to save a frame of the madness
  if(key === 's' || key === 'S') {
    saveCanvas('cortical_rupture', 'png');
  }
}
