// AUDIO REACTIVE CORRUPTION CHAMBER
// A visceral descent into sonic flesh
// For p5.js Web Editor with DEMO2.m4a

let corruptionShader;
let song;
let fft;
let amp;
let peakDetect;

// Audio analysis arrays
let spectrum = [];
let waveform = [];
let bassEnergy = 0;
let midEnergy = 0;
let highEnergy = 0;
let totalEnergy = 0;

// Accumulated corruption over time
let corruption = 0;
let glitchIntensity = 0;
let tearAmount = 0;

function preload() {
  song = loadSound('DEMO2.m4a');

  // Vertex shader - simple passthrough
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

  // Fragment shader - where the horror lives
  const fragShader = `
    precision highp float;
    varying vec2 vTexCoord;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_bass;
    uniform float u_mid;
    uniform float u_high;
    uniform float u_totalEnergy;
    uniform float u_corruption;
    uniform float u_glitch;
    uniform float u_tear;
    uniform float u_spectrum[128];

    // Noise functions for organic chaos
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

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

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for(int i = 0; i < 6; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    // Voronoi for cellular decay
    vec2 voronoi(vec2 x) {
      vec2 n = floor(x);
      vec2 f = fract(x);

      float minDist = 1.0;
      vec2 minPoint;

      for(int j = -1; j <= 1; j++) {
        for(int i = -1; i <= 1; i++) {
          vec2 b = vec2(float(i), float(j));
          vec2 r = b + hash(n + b) * vec2(1.0) - f;
          float d = length(r);

          if(d < minDist) {
            minDist = d;
            minPoint = r;
          }
        }
      }

      return vec2(minDist, hash(n + minPoint));
    }

    // Distortion field - audio warps reality
    vec2 distortionField(vec2 uv, float time) {
      float bassWarp = u_bass * 0.3;
      float midPulse = u_mid * 0.15;

      // Multiple layers of distortion
      vec2 d = uv;

      // Bass creates tectonic shifts
      d += vec2(
        sin(uv.y * 3.0 + time) * bassWarp,
        cos(uv.x * 3.0 - time) * bassWarp
      );

      // Mid frequencies create cellular distortion
      float cellular = voronoi(d * 8.0 + time * 0.5).x;
      d += (cellular - 0.5) * midPulse;

      // High frequencies add jitter
      d += (noise(d * 50.0 + time * 10.0) - 0.5) * u_high * 0.05;

      // Corruption tears the fabric
      float tearNoise = fbm(uv * 4.0 + time * 0.3);
      d += vec2(
        sin(tearNoise * 20.0) * u_tear * 0.2,
        cos(tearNoise * 15.0) * u_tear * 0.2
      );

      return d;
    }

    // Chromatic aberration - frequencies split light
    vec3 chromaticSample(vec2 uv, float offset) {
      vec2 distorted = distortionField(uv, u_time);

      float r = fbm(distorted * 3.0 + u_time * 0.2 + offset);
      float g = fbm(distorted * 3.0 + u_time * 0.2);
      float b = fbm(distorted * 3.0 + u_time * 0.2 - offset);

      return vec3(r, g, b);
    }

    // Flesh corruption pattern
    float fleshPattern(vec2 uv, float time) {
      vec2 warpedUV = distortionField(uv, time);

      // Organic layering
      float pattern = 0.0;

      // Veins (bass driven)
      float veins = fbm(warpedUV * 8.0 + time * 0.1);
      veins = smoothstep(0.4, 0.6, veins) * u_bass;

      // Pustules (mid driven)
      vec2 vor = voronoi(warpedUV * 12.0 + time * 0.2);
      float pustules = smoothstep(0.1, 0.2, vor.x) * u_mid;

      // Decay (high driven)
      float decay = noise(warpedUV * 30.0 + time * 5.0) * u_high;

      pattern = veins + pustules + decay;
      return pattern;
    }

    // Glitch corruption
    vec3 glitchCorrupt(vec2 uv, vec3 color, float time) {
      // Horizontal tears
      float row = floor(uv.y * 100.0);
      float rowHash = hash(vec2(row, floor(time * 10.0)));

      if(rowHash < u_glitch * 0.3) {
        // Displaced scanline
        uv.x += (rowHash - 0.5) * u_glitch * 0.5;

        // Color corruption
        color.rgb = color.bgr;
        color *= 1.0 + u_glitch * 2.0;
      }

      // Digital artifacts
      float blockNoise = hash(floor(uv * 20.0 + time * 30.0));
      if(blockNoise < u_glitch * 0.1) {
        color = vec3(blockNoise);
      }

      return color;
    }

    void main() {
      vec2 uv = vTexCoord;
      uv.y = 1.0 - uv.y;

      // Center coordinates
      vec2 centered = (uv - 0.5) * 2.0;
      centered.x *= u_resolution.x / u_resolution.y;

      // Time modulation
      float t = u_time * 0.5;

      // Chromatic aberration based on total energy
      float chromaOffset = u_totalEnergy * 0.05;
      vec3 color = chromaticSample(uv, chromaOffset);

      // Base flesh corruption
      float flesh = fleshPattern(uv, t);
      color *= flesh + 0.3;

      // Spectral frequency visualization - like organs pulsing
      float spectrumViz = 0.0;
      for(int i = 0; i < 128; i++) {
        float freq = float(i) / 128.0;
        float dist = abs(length(centered) - freq * 2.0);
        if(dist < 0.05) {
          spectrumViz += u_spectrum[i] * (1.0 - dist / 0.05);
        }
      }
      color += vec3(spectrumViz * 2.0, spectrumViz * 0.5, spectrumViz * 0.1);

      // Corruption accumulation - progressive degradation
      float corruptPattern = fbm(uv * 5.0 + t);
      color += vec3(
        corruptPattern * u_corruption * 0.5,
        0.0,
        -corruptPattern * u_corruption * 0.3
      );

      // Radial energy burst from center
      float radial = length(centered);
      float energyPulse = u_totalEnergy * exp(-radial * 2.0);
      color += vec3(energyPulse * 2.0, energyPulse * 0.5, 0.0);

      // Vignette corruption
      float vignette = 1.0 - smoothstep(0.5, 1.5, radial);
      color *= vignette + u_bass * 0.3;

      // Apply glitch corruption
      color = glitchCorrupt(uv, color, t);

      // Bass hits create inverse flashes
      if(u_bass > 0.8) {
        color = vec3(1.0) - color;
        color += vec3(u_bass - 0.8) * 5.0;
      }

      // Tear effect - rip reality apart
      float tearPattern = step(0.95, noise(vec2(uv.x * 100.0, floor(uv.y * 50.0)) + t * 20.0));
      if(tearPattern > 0.0 && u_tear > 0.5) {
        color = vec3(1.0, 0.0, 0.0) * u_tear;
      }

      // Pain palette - sickly, wrong colors
      color.r = pow(color.r, 0.8);
      color.g = pow(color.g, 1.3);
      color.b *= 0.7;

      // Add grain for that raw analog corruption
      float grain = (noise(uv * 1000.0 + t * 100.0) - 0.5) * 0.1;
      color += grain;

      // High energy whites out like overexposure agony
      color += u_high * u_high * vec3(1.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  corruptionShader = createShader(vertShader, fragShader);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  // Audio analysis setup
  fft = new p5.FFT(0.8, 128);
  amp = new p5.Amplitude();
  peakDetect = new p5.PeakDetect(20, 250, 0.6, 20);

  // Start the song
  song.loop();

  pixelDensity(1); // Performance optimization
  noStroke();
}

function draw() {
  // Analyze audio
  spectrum = fft.analyze();
  waveform = fft.waveform();
  let level = amp.getLevel();
  peakDetect.update(fft);

  // Extract frequency bands
  bassEnergy = fft.getEnergy("bass") / 255.0;
  midEnergy = fft.getEnergy("mid") / 255.0;
  highEnergy = fft.getEnergy("treble") / 255.0;
  totalEnergy = fft.getEnergy(20, 20000) / 255.0;

  // Accumulate corruption over time
  corruption += totalEnergy * 0.01;
  corruption = min(corruption, 1.0);

  // Glitch intensity spikes on peaks
  if(peakDetect.isDetected) {
    glitchIntensity = 1.0;
    tearAmount = random(0.5, 1.0);
  }
  glitchIntensity *= 0.9; // Decay
  tearAmount *= 0.95;

  // Apply shader
  shader(corruptionShader);

  // Set uniforms
  corruptionShader.setUniform('u_resolution', [width, height]);
  corruptionShader.setUniform('u_time', millis() / 1000.0);
  corruptionShader.setUniform('u_bass', bassEnergy);
  corruptionShader.setUniform('u_mid', midEnergy);
  corruptionShader.setUniform('u_high', highEnergy);
  corruptionShader.setUniform('u_totalEnergy', totalEnergy);
  corruptionShader.setUniform('u_corruption', corruption);
  corruptionShader.setUniform('u_glitch', glitchIntensity);
  corruptionShader.setUniform('u_tear', tearAmount);

  // Send spectrum array
  let spectrumNormalized = spectrum.map(val => val / 255.0);
  corruptionShader.setUniform('u_spectrum', spectrumNormalized);

  // Draw fullscreen quad
  rect(-width/2, -height/2, width, height);
}

function mousePressed() {
  // Toggle playback
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
