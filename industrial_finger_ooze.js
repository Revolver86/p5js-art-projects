// Industrial World of Fingers and Ooze
// Custom fluid dynamics with metaballs, viscosity, and surface tension
// Ray marching with custom shaders - no basic p5.js shapes

let shaderProgram;
let fingerTextures = [];
let metalTextures = [];
let oozeTextures = [];
let fluidDataTexture;

// Fluid particle system
let fluidParticles = [];
const NUM_FLUID_PARTICLES = 120;
const FLUID_VISCOSITY = 0.85;
const SURFACE_TENSION = 0.3;
const GRAVITY = 0.15;
const FLUID_RADIUS = 1.2;
const FLUID_TEX_SIZE = 16; // 16x16 = 256 particles max, using 120

function preload() {
  // Load finger textures
  const fingerURLs = [
    'https://cdn.midjourney.com/58283981-3d98-4e21-b0f5-38757db006a5/0_0.png',
    'https://cdn.midjourney.com/58283981-3d98-4e21-b0f5-38757db006a5/0_1.png',
    'https://cdn.midjourney.com/58283981-3d98-4e21-b0f5-38757db006a5/0_2.png',
    'https://cdn.midjourney.com/c96e376a-170a-49f1-ace0-2032b994a660/0_0.png',
    'https://cdn.midjourney.com/c96e376a-170a-49f1-ace0-2032b994a660/0_1.png',
    'https://cdn.midjourney.com/68b9aaca-f122-4e10-aec5-275817cc6c27/0_1.png',
    'https://cdn.midjourney.com/ed51d6bb-acaf-46a9-b445-b7140ba58791/0_0.png',
    'https://cdn.midjourney.com/ed51d6bb-acaf-46a9-b445-b7140ba58791/0_1.png'
  ];

  // Load metal architecture textures
  const metalURLs = [
    'https://cdn.midjourney.com/a15c2a6b-007e-45ac-8d13-7de9df4b3dfd/0_0.png',
    'https://cdn.midjourney.com/a15c2a6b-007e-45ac-8d13-7de9df4b3dfd/0_1.png',
    'https://cdn.midjourney.com/8b55e848-e016-4f0a-97ed-9d8b5f645db7/0_1.png',
    'https://cdn.midjourney.com/ae178329-b673-45e5-99f9-59db33245792/0_0.png',
    'https://cdn.midjourney.com/15a67145-941b-4a46-861a-59956fcb62f0/0_0.png',
    'https://cdn.midjourney.com/fdad85b4-b7ce-4a11-af86-bcd039ba09d3/0_0.png',
    'https://i.imgur.com/SlbqtD5.png',
    'https://i.imgur.com/3pupnHh.png'
  ];

  // Load ooze textures
  const oozeURLs = [
    'https://cdn.midjourney.com/fd9a92be-478d-490c-bf0c-6e2377a3b57b/0_0.png',
    'https://cdn.midjourney.com/fd9a92be-478d-490c-bf0c-6e2377a3b57b/0_1.png',
    'https://cdn.midjourney.com/c5ac02e1-97d7-4af9-987b-9ab61642f153/0_1.png',
    'https://cdn.midjourney.com/fac55597-b017-49d6-81b2-eb80a0db11f1/0_1.png',
    'https://cdn.midjourney.com/cb34b77f-5b21-4faa-b5da-6e830c270741/0_3.png',
    'https://cdn.midjourney.com/c00a6f7e-1ecb-4a8d-bd27-93d6bb45e8da/0_3.png',
    'https://cdn.midjourney.com/5e892a11-82db-4d42-a534-b1b8cfc2b6a1/0_1.png',
    'https://cdn.midjourney.com/3a68bdc7-9195-4b48-9778-afbfdbf57763/0_3.png',
    'https://cdn.midjourney.com/4b6e10f1-4e5a-4a97-88d6-c7fb54e075d7/0_3.png',
    'https://cdn.midjourney.com/4174822b-8641-4db7-991f-ec688b869536/0_3.png',
    'https://cdn.midjourney.com/76bf783a-2f2b-4c9e-8310-bf1b2203a8c3/0_3.png',
    'https://cdn.midjourney.com/c3cc8ddb-0ad6-4e2f-8558-9bee72559662/0_3.png'
  ];

  fingerURLs.forEach(url => fingerTextures.push(loadImage(url)));
  metalURLs.forEach(url => metalTextures.push(loadImage(url)));
  oozeURLs.forEach(url => oozeTextures.push(loadImage(url)));
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  // Initialize fluid particles
  for (let i = 0; i < NUM_FLUID_PARTICLES; i++) {
    fluidParticles.push({
      pos: createVector(
        random(-15, 15),
        random(-8, 8),
        random(-15, 15)
      ),
      vel: createVector(0, 0, 0),
      acc: createVector(0, 0, 0),
      density: 0,
      pressure: 0,
      id: i
    });
  }

  // Create data texture for fluid particles
  fluidDataTexture = createGraphics(FLUID_TEX_SIZE, FLUID_TEX_SIZE, WEBGL);
  fluidDataTexture.pixelDensity(1);

  // Create custom shader
  shaderProgram = createShader(vertexShader(), fragmentShader());
}

function draw() {
  // Update fluid simulation
  updateFluidDynamics();

  // Encode fluid particle positions into texture
  updateFluidTexture();

  shader(shaderProgram);

  // Pass uniforms
  shaderProgram.setUniform('uResolution', [width, height]);
  shaderProgram.setUniform('uTime', millis() / 1000.0);

  // Camera uniforms
  let camX = cos(millis() / 3000.0) * 25.0;
  let camY = sin(millis() / 5000.0) * 8.0 + 5.0;
  let camZ = sin(millis() / 3000.0) * 25.0;
  shaderProgram.setUniform('uCameraPos', [camX, camY, camZ]);
  shaderProgram.setUniform('uCameraTarget', [0.0, 0.0, 0.0]);

  // Pass fluid data texture
  shaderProgram.setUniform('uFluidData', fluidDataTexture);
  shaderProgram.setUniform('uFluidTexSize', FLUID_TEX_SIZE);
  shaderProgram.setUniform('uNumFluidParticles', fluidParticles.length);

  // Pass textures (limited to 4 each to stay under 16 sampler limit)
  for (let i = 0; i < min(4, fingerTextures.length); i++) {
    shaderProgram.setUniform(`uFingerTex${i}`, fingerTextures[i]);
  }
  for (let i = 0; i < min(4, metalTextures.length); i++) {
    shaderProgram.setUniform(`uMetalTex${i}`, metalTextures[i]);
  }
  for (let i = 0; i < min(4, oozeTextures.length); i++) {
    shaderProgram.setUniform(`uOozeTex${i}`, oozeTextures[i]);
  }

  rect(0, 0, width, height);
}

function updateFluidTexture() {
  fluidDataTexture.loadPixels();

  // Clear texture
  for (let i = 0; i < fluidDataTexture.pixels.length; i++) {
    fluidDataTexture.pixels[i] = 0;
  }

  // Encode particle positions
  for (let i = 0; i < fluidParticles.length; i++) {
    let x = i % FLUID_TEX_SIZE;
    let y = floor(i / FLUID_TEX_SIZE);
    let idx = (y * FLUID_TEX_SIZE + x) * 4;

    // Encode position as color (normalized to 0-255)
    // Map world coords (-20 to 20) to 0-255
    fluidDataTexture.pixels[idx + 0] = map(fluidParticles[i].pos.x, -20, 20, 0, 255);
    fluidDataTexture.pixels[idx + 1] = map(fluidParticles[i].pos.y, -20, 20, 0, 255);
    fluidDataTexture.pixels[idx + 2] = map(fluidParticles[i].pos.z, -20, 20, 0, 255);
    fluidDataTexture.pixels[idx + 3] = 255;
  }

  fluidDataTexture.updatePixels();
}

function updateFluidDynamics() {
  const dt = 0.016;
  const h = 2.5; // Smoothing radius
  const restDensity = 1.0;
  const k = 0.08; // Pressure constant

  // Calculate densities
  for (let i = 0; i < fluidParticles.length; i++) {
    let density = 0;
    for (let j = 0; j < fluidParticles.length; j++) {
      let r = p5.Vector.dist(fluidParticles[i].pos, fluidParticles[j].pos);
      if (r < h) {
        let q = r / h;
        let kernel = max(0, 1 - q * q);
        kernel = kernel * kernel * kernel;
        density += kernel;
      }
    }
    fluidParticles[i].density = density;
    fluidParticles[i].pressure = k * (density - restDensity);
  }

  // Calculate forces
  for (let i = 0; i < fluidParticles.length; i++) {
    let pressureForce = createVector(0, 0, 0);
    let viscosityForce = createVector(0, 0, 0);

    for (let j = 0; j < fluidParticles.length; j++) {
      if (i === j) continue;

      let diff = p5.Vector.sub(fluidParticles[i].pos, fluidParticles[j].pos);
      let r = diff.mag();

      if (r < h && r > 0.001) {
        let q = r / h;
        let kernelGrad = -3 * (1 - q) * (1 - q) / h;

        // Pressure force
        let avgPressure = (fluidParticles[i].pressure + fluidParticles[j].pressure) / 2;
        let pf = p5.Vector.mult(diff, kernelGrad * avgPressure / (r * fluidParticles[j].density));
        pressureForce.add(pf);

        // Viscosity force
        let velDiff = p5.Vector.sub(fluidParticles[j].vel, fluidParticles[i].vel);
        let vf = p5.Vector.mult(velDiff, FLUID_VISCOSITY * kernelGrad / fluidParticles[j].density);
        viscosityForce.add(vf);
      }
    }

    // Gravity
    let gravity = createVector(0, -GRAVITY, 0);

    // Surface tension
    let surfaceTension = createVector(0, 0, 0);
    if (fluidParticles[i].density < restDensity * 0.8) {
      surfaceTension = p5.Vector.mult(fluidParticles[i].vel, -SURFACE_TENSION);
    }

    // Total acceleration
    fluidParticles[i].acc = p5.Vector.add(gravity, pressureForce);
    fluidParticles[i].acc.add(viscosityForce);
    fluidParticles[i].acc.add(surfaceTension);
  }

  // Update positions
  for (let p of fluidParticles) {
    p.vel.add(p5.Vector.mult(p.acc, dt));
    p.pos.add(p5.Vector.mult(p.vel, dt));

    // Collisions with industrial boundaries
    // Floor (with fingers growing through)
    if (p.pos.y < -10) {
      p.pos.y = -10;
      p.vel.y *= -0.3;
    }

    // Ceiling
    if (p.pos.y > 12) {
      p.pos.y = 12;
      p.vel.y *= -0.3;
    }

    // Walls - but with gaps for industrial feeling
    let wallDist = 18;
    if (abs(p.pos.x) > wallDist) {
      p.pos.x = sign(p.pos.x) * wallDist;
      p.vel.x *= -0.3;
    }
    if (abs(p.pos.z) > wallDist) {
      p.pos.z = sign(p.pos.z) * wallDist;
      p.vel.z *= -0.3;
    }
  }
}

function sign(x) {
  return x < 0 ? -1 : 1;
}

function vertexShader() {
  return `
    precision highp float;
    attribute vec3 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 1.0);
    }
  `;
}

function fragmentShader() {
  return `
    precision highp float;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec3 uCameraPos;
    uniform vec3 uCameraTarget;
    uniform sampler2D uFluidData;
    uniform float uFluidTexSize;
    uniform int uNumFluidParticles;
    uniform sampler2D uFingerTex0;
    uniform sampler2D uFingerTex1;
    uniform sampler2D uFingerTex2;
    uniform sampler2D uFingerTex3;
    uniform sampler2D uMetalTex0;
    uniform sampler2D uMetalTex1;
    uniform sampler2D uMetalTex2;
    uniform sampler2D uMetalTex3;
    uniform sampler2D uOozeTex0;
    uniform sampler2D uOozeTex1;
    uniform sampler2D uOozeTex2;
    uniform sampler2D uOozeTex3;

    #define MAX_STEPS 150
    #define MAX_DIST 100.0
    #define SURF_DIST 0.001
    #define NUM_FINGERS 24

    // Get fluid particle position from texture
    vec3 getFluidParticle(int index) {
      float x = mod(float(index), uFluidTexSize);
      float y = floor(float(index) / uFluidTexSize);
      vec2 uv = (vec2(x, y) + 0.5) / uFluidTexSize;
      vec3 encoded = texture2D(uFluidData, uv).rgb;
      // Decode from 0-1 range back to -20 to 20
      return encoded * 40.0 - 20.0;
    }

    // Noise function
    float hash(vec3 p) {
      p = fract(p * vec3(443.537, 537.247, 247.428));
      p += dot(p, p.yxz + 19.19);
      return fract((p.x + p.y) * p.z);
    }

    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec3(1, 0, 0));
      float c = hash(i + vec3(0, 1, 0));
      float d = hash(i + vec3(1, 1, 0));
      float e = hash(i + vec3(0, 0, 1));
      float f2 = hash(i + vec3(1, 0, 1));
      float g = hash(i + vec3(0, 1, 1));
      float h = hash(i + vec3(1, 1, 1));

      return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y),
                 mix(mix(e, f2, f.x), mix(g, h, f.x), f.y), f.z);
    }

    float fbm(vec3 p) {
      float val = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        val += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
      }
      return val;
    }

    // Smooth minimum for organic blending
    float smin(float a, float b, float k) {
      float h = max(k - abs(a - b), 0.0) / k;
      return min(a, b) - h * h * k * 0.25;
    }

    // Capsule SDF for finger segments
    float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
      vec3 pa = p - a;
      vec3 ba = b - a;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      return length(pa - ba * h) - r;
    }

    // Box SDF for industrial structures
    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    // Torus for pipes
    float sdTorus(vec3 p, vec2 t) {
      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return length(q) - t.y;
    }

    // Custom finger with joints, bending, fingernail
    float sdFinger(vec3 p, float seed, float bendAmount) {
      // Base parameters
      float baseRadius = 0.4 + hash(vec3(seed)) * 0.2;
      float tipRadius = baseRadius * 0.6;

      // Organic bending
      float bend = sin(p.y * 0.5 + uTime * 0.3 + seed) * bendAmount;
      p.x += bend;
      p.z += cos(p.y * 0.4 + uTime * 0.2 + seed * 1.3) * bendAmount * 0.7;

      // Noise deformation for organic surface
      float surfaceNoise = fbm(p * 3.0 + vec3(seed * 10.0, uTime * 0.1, 0)) * 0.08;

      // Segment 1 (palm to first knuckle)
      vec3 a1 = vec3(0, 0, 0);
      vec3 b1 = vec3(0, 1.5, 0);
      float seg1 = sdCapsule(p, a1, b1, baseRadius);

      // Segment 2 (first to second knuckle)
      vec3 a2 = b1;
      vec3 b2 = vec3(0, 3.2, 0);
      float seg2 = sdCapsule(p, a2, b2, baseRadius * 0.85);

      // Segment 3 (second knuckle to tip)
      vec3 a3 = b2;
      vec3 b3 = vec3(0, 4.5, 0);
      float seg3 = sdCapsule(p, a3, b3, tipRadius);

      // Fingernail
      vec3 nailPos = p - vec3(0, 4.3, -tipRadius * 0.5);
      float nail = sdBox(nailPos, vec3(tipRadius * 0.8, 0.3, tipRadius * 0.3)) - 0.05;

      // Knuckle bulges
      float knuckle1 = length(p - vec3(0, 1.5, 0)) - baseRadius * 1.2;
      float knuckle2 = length(p - vec3(0, 3.2, 0)) - baseRadius * 1.05;

      // Combine segments with smooth blending
      float finger = smin(seg1, seg2, 0.3);
      finger = smin(finger, seg3, 0.3);
      finger = smin(finger, knuckle1, 0.2);
      finger = smin(finger, knuckle2, 0.2);
      finger = min(finger, nail);

      return finger + surfaceNoise;
    }

    // Metaball fluid field
    float sdFluid(vec3 p) {
      float field = 100.0;

      for (int i = 0; i < 120; i++) {
        if (i >= uNumFluidParticles) break;

        vec3 particlePos = getFluidParticle(i);

        float dist = length(p - particlePos);
        // Metaball formula
        float influence = 1.2 / (dist * dist + 0.1);
        field -= influence;
      }

      return -field + 0.5; // Threshold for surface
    }

    // Industrial architecture
    float sdArchitecture(vec3 p) {
      float arch = 100.0;

      // Floor with grates
      float floor = p.y + 10.0;
      float gratePattern = max(
        abs(mod(p.x + 0.5, 2.0) - 1.0) - 0.1,
        abs(mod(p.z + 0.5, 2.0) - 1.0) - 0.1
      );
      floor = max(floor, -gratePattern + 0.05);
      arch = min(arch, floor);

      // Ceiling
      arch = min(arch, -p.y + 12.0);

      // Walls with industrial panels
      float wallX = abs(p.x) - 18.0;
      float wallZ = abs(p.z) - 18.0;
      float panelNoise = fbm(vec3(p.x * 0.3, p.y * 0.5, p.z * 0.3)) * 0.3;
      arch = min(arch, wallX + panelNoise);
      arch = min(arch, wallZ + panelNoise);

      // Pipes
      for (float i = 0.0; i < 6.0; i++) {
        float angle = i * 1.047; // 60 degrees
        vec3 pipeP = p;
        pipeP.y -= 8.0;
        pipeP.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * pipeP.xz;
        float pipe = sdTorus(pipeP, vec2(12.0, 0.4));
        arch = min(arch, pipe);
      }

      // Support beams
      for (float i = -15.0; i <= 15.0; i += 5.0) {
        float beam = sdBox(p - vec3(i, 0, 0), vec3(0.3, 12.0, 0.3));
        arch = min(arch, beam);
      }

      return arch;
    }

    // Main SDF
    vec2 map(vec3 p) {
      float matID = 0.0;
      float d = MAX_DIST;

      // Industrial architecture
      float arch = sdArchitecture(p);
      if (arch < d) {
        d = arch;
        matID = 1.0; // Metal
      }

      // Fingers growing from floor and walls
      for (float i = 0.0; i < float(NUM_FINGERS); i++) {
        float seed = i * 7.531;

        // Position fingers on floor and walls
        vec3 fingerBase;
        if (mod(i, 3.0) < 1.0) {
          // Floor fingers
          fingerBase = vec3(
            (hash(vec3(seed, 0, 0)) - 0.5) * 30.0,
            -10.0,
            (hash(vec3(0, seed, 0)) - 0.5) * 30.0
          );
        } else if (mod(i, 3.0) < 2.0) {
          // Wall X fingers
          fingerBase = vec3(
            sign(hash(vec3(seed)) - 0.5) * 18.0,
            (hash(vec3(0, seed, 0)) - 0.5) * 15.0,
            (hash(vec3(0, 0, seed)) - 0.5) * 30.0
          );
        } else {
          // Wall Z fingers
          fingerBase = vec3(
            (hash(vec3(seed, 0, 0)) - 0.5) * 30.0,
            (hash(vec3(0, seed, 0)) - 0.5) * 15.0,
            sign(hash(vec3(0, 0, seed)) - 0.5) * 18.0
          );
        }

        // Rotation for variety
        float angle = hash(vec3(seed * 2.0)) * 6.28;
        vec3 fingerP = p - fingerBase;
        fingerP.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * fingerP.xz;

        float bendAmt = 0.3 + hash(vec3(seed * 3.0)) * 0.4;
        float finger = sdFinger(fingerP, seed, bendAmt);

        if (finger < d) {
          d = finger;
          matID = 2.0 + mod(i, 4.0); // Finger textures
        }
      }

      // Fluid ooze
      float fluid = sdFluid(p);
      if (fluid < d) {
        d = fluid;
        matID = 10.0; // Ooze
      }

      return vec2(d, matID);
    }

    // Normal calculation
    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(0.001, 0);
      return normalize(vec3(
        map(p + e.xyy).x - map(p - e.xyy).x,
        map(p + e.yxy).x - map(p - e.yxy).x,
        map(p + e.yyx).x - map(p - e.yyx).x
      ));
    }

    // Triplanar texture mapping
    vec3 triplanarMap(sampler2D tex, vec3 p, vec3 n) {
      vec3 blending = abs(n);
      blending = normalize(max(blending, 0.00001));
      float b = blending.x + blending.y + blending.z;
      blending /= b;

      float scale = 0.3;
      vec3 xaxis = texture2D(tex, p.yz * scale).rgb;
      vec3 yaxis = texture2D(tex, p.xz * scale).rgb;
      vec3 zaxis = texture2D(tex, p.xy * scale).rgb;

      return xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
    }

    // Material color
    vec3 getMaterial(vec3 p, vec3 n, float matID) {
      // Metal architecture
      if (matID < 1.5) {
        int texIdx = int(mod(p.x * 0.2 + p.z * 0.3, 4.0));
        if (texIdx == 0) return triplanarMap(uMetalTex0, p, n);
        if (texIdx == 1) return triplanarMap(uMetalTex1, p, n);
        if (texIdx == 2) return triplanarMap(uMetalTex2, p, n);
        return triplanarMap(uMetalTex3, p, n);
      }

      // Fingers
      if (matID >= 2.0 && matID < 10.0) {
        int texIdx = int(mod(matID - 2.0, 4.0));
        if (texIdx == 0) return triplanarMap(uFingerTex0, p, n);
        if (texIdx == 1) return triplanarMap(uFingerTex1, p, n);
        if (texIdx == 2) return triplanarMap(uFingerTex2, p, n);
        return triplanarMap(uFingerTex3, p, n);
      }

      // Ooze
      int texIdx = int(mod(p.x + p.y * 2.0 + p.z, 4.0));
      if (texIdx == 0) return triplanarMap(uOozeTex0, p, n);
      if (texIdx == 1) return triplanarMap(uOozeTex1, p, n);
      if (texIdx == 2) return triplanarMap(uOozeTex2, p, n);
      return triplanarMap(uOozeTex3, p, n);
    }

    // Ray marching
    vec2 rayMarch(vec3 ro, vec3 rd) {
      float dO = 0.0;
      float matID = 0.0;

      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        vec2 res = map(p);
        float dS = res.x;
        matID = res.y;
        dO += dS;
        if (dS < SURF_DIST || dO > MAX_DIST) break;
      }

      return vec2(dO, matID);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

      // Camera setup
      vec3 ro = uCameraPos;
      vec3 lookAt = uCameraTarget;
      vec3 forward = normalize(lookAt - ro);
      vec3 right = normalize(cross(vec3(0, 1, 0), forward));
      vec3 up = cross(forward, right);
      vec3 rd = normalize(forward + uv.x * right + uv.y * up);

      // Ray march
      vec2 res = rayMarch(ro, rd);
      float d = res.x;
      float matID = res.y;

      vec3 color = vec3(0.02, 0.01, 0.015); // Dark industrial background

      if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = calcNormal(p);

        // Get material color from texture
        vec3 albedo = getMaterial(p, n, matID);

        // Lighting
        vec3 lightPos = vec3(sin(uTime * 0.5) * 15.0, 15.0, cos(uTime * 0.5) * 15.0);
        vec3 lightDir = normalize(lightPos - p);
        float diff = max(dot(n, lightDir), 0.0);

        // Ambient occlusion
        float ao = 1.0;
        for (float i = 1.0; i <= 5.0; i++) {
          float dist = i * 0.15;
          ao -= (dist - map(p + n * dist).x) * 0.15;
        }
        ao = clamp(ao, 0.0, 1.0);

        // Specular for ooze
        float spec = 0.0;
        if (matID >= 10.0) {
          vec3 viewDir = normalize(ro - p);
          vec3 halfDir = normalize(lightDir + viewDir);
          spec = pow(max(dot(n, halfDir), 0.0), 32.0) * 0.5;
        }

        // Final color
        vec3 ambient = albedo * 0.3 * ao;
        vec3 diffuse = albedo * diff * 0.7;
        color = ambient + diffuse + vec3(spec);

        // Atmospheric depth
        float fogAmount = 1.0 - exp(-d * 0.02);
        color = mix(color, vec3(0.02, 0.01, 0.015), fogAmount);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
