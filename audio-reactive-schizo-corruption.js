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

function preload() {
  song = loadSound('DEMO2.m4a');
  corruptionShader = loadShader('corruption.vert', 'corruption.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

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
