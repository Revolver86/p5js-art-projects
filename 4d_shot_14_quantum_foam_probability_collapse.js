// 4D SHADER SERIES - SHOT 14: Quantum Foam - Probability Collapse
// Visualizing quantum uncertainty in 4D space
// Probability clouds collapse into particles and reform with wave interference

let frag = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

// Performance-optimized constants
#define MAX_STEPS 35
#define MAX_DIST 20.0
#define SURF_DIST 0.02
#define VOL_SAMPLES 6
#define WAVE_ITERATIONS 3

// 4D rotation matrices
mat4 rotateXW(float a) {
  return mat4(
    cos(a), 0, 0, -sin(a),
    0, 1, 0, 0,
    0, 0, 1, 0,
    sin(a), 0, 0, cos(a)
  );
}

mat4 rotateYZ(float a) {
  return mat4(
    1, 0, 0, 0,
    0, cos(a), -sin(a), 0,
    0, sin(a), cos(a), 0,
    0, 0, 0, 1
  );
}

mat4 rotateZW(float a) {
  return mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, cos(a), -sin(a),
    0, 0, sin(a), cos(a)
  );
}

mat4 rotateXY(float a) {
  return mat4(
    cos(a), -sin(a), 0, 0,
    sin(a), cos(a), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );
}

// Optimized hash-based 4D noise (no nested loops)
float hash41(vec4 p) {
  p = fract(p * vec4(443.897, 441.423, 437.195, 443.129));
  p += dot(p, p.wzxy + 19.19);
  return fract((p.x + p.y) * (p.z + p.w));
}

// Simple 4D noise with single octave
float noise4d(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  // 2x2x2x2 sampling (optimized)
  float n0000 = hash41(i);
  float n1000 = hash41(i + vec4(1,0,0,0));
  float n0100 = hash41(i + vec4(0,1,0,0));
  float n1100 = hash41(i + vec4(1,1,0,0));
  float n0010 = hash41(i + vec4(0,0,1,0));
  float n1010 = hash41(i + vec4(1,0,1,0));
  float n0110 = hash41(i + vec4(0,1,1,0));
  float n1110 = hash41(i + vec4(1,1,1,0));

  float n0001 = hash41(i + vec4(0,0,0,1));
  float n1001 = hash41(i + vec4(1,0,0,1));
  float n0101 = hash41(i + vec4(0,1,0,1));
  float n1101 = hash41(i + vec4(1,1,0,1));
  float n0011 = hash41(i + vec4(0,0,1,1));
  float n1011 = hash41(i + vec4(1,0,1,1));
  float n0111 = hash41(i + vec4(0,1,1,1));
  float n1111 = hash41(i + vec4(1,1,1,1));

  // Interpolate
  vec4 u = f * f * (3.0 - 2.0 * f);

  float nx00 = mix(mix(n0000, n1000, u.x), mix(n0100, n1100, u.x), u.y);
  float nx10 = mix(mix(n0010, n1010, u.x), mix(n0110, n1110, u.x), u.y);
  float nx01 = mix(mix(n0001, n1001, u.x), mix(n0101, n1101, u.x), u.y);
  float nx11 = mix(mix(n0011, n1011, u.x), mix(n0111, n1111, u.x), u.y);

  return mix(mix(nx00, nx10, u.z), mix(nx01, nx11, u.z), u.w);
}

// 4D distance field for collapsed particle nodes
float sdSphere4D(vec4 p, float r) {
  return length(p) - r;
}

// Multiple particles in 4D space
float particleField(vec4 p) {
  float d = MAX_DIST;

  // 5 particle nodes positioned in 4D
  vec4 positions[5];
  positions[0] = vec4(2.0, 1.0, -1.5, 0.0);
  positions[1] = vec4(-1.5, -1.0, 2.0, 1.5);
  positions[2] = vec4(0.5, -2.0, -0.5, -1.0);
  positions[3] = vec4(-2.0, 0.5, 1.0, 0.5);
  positions[4] = vec4(1.0, 2.0, 0.0, -1.5);

  // Particle size pulses with time (collapse/expansion)
  float pulse = 0.3 + 0.2 * sin(u_time * 0.7);

  for(int i = 0; i < 5; i++) {
    float dist = sdSphere4D(p - positions[i], pulse);
    d = min(d, dist);
  }

  return d;
}

// Probability density field (volumetric)
float probabilityDensity(vec4 p) {
  // Multi-scale noise for cloud-like density
  float n1 = noise4d(p * 0.8);
  float n2 = noise4d(p * 1.6 + vec4(100.0));
  float density = n1 * 0.7 + n2 * 0.3;

  // Higher density near particle positions
  vec4 positions[5];
  positions[0] = vec4(2.0, 1.0, -1.5, 0.0);
  positions[1] = vec4(-1.5, -1.0, 2.0, 1.5);
  positions[2] = vec4(0.5, -2.0, -0.5, -1.0);
  positions[3] = vec4(-2.0, 0.5, 1.0, 0.5);
  positions[4] = vec4(1.0, 2.0, 0.0, -1.5);

  float proximity = 0.0;
  for(int i = 0; i < 5; i++) {
    float dist = length(p - positions[i]);
    proximity += 1.0 / (1.0 + dist * dist);
  }

  density += proximity * 0.3;

  return smoothstep(0.3, 0.7, density);
}

// Wave interference pattern in 4D
float waveInterference(vec4 p) {
  float waves = 0.0;
  float freq = 2.0;

  // 3 iterations for performance
  for(int i = 0; i < WAVE_ITERATIONS; i++) {
    vec4 offset = vec4(float(i) * 5.0);
    waves += sin(p.x * freq + u_time + offset.x) *
             cos(p.y * freq + u_time * 0.8 + offset.y) *
             sin(p.z * freq + u_time * 0.6 + offset.z) *
             cos(p.w * freq + u_time * 0.4 + offset.w);
    freq *= 1.3;
  }

  return waves / float(WAVE_ITERATIONS);
}

// Combined scene distance field
float sceneSDF(vec4 p) {
  return particleField(p);
}

// Ray march through 4D scene
float rayMarch(vec4 ro, vec4 rd) {
  float dO = 0.0;

  for(int i = 0; i < MAX_STEPS; i++) {
    vec4 p = ro + rd * dO;
    float dS = sceneSDF(p);
    dO += dS;
    if(dO > MAX_DIST || abs(dS) < SURF_DIST) break;
  }

  return dO;
}

// Get normal for lighting
vec4 getNormal4D(vec4 p) {
  float d = sceneSDF(p);
  vec2 e = vec2(0.01, 0);

  vec4 n = d - vec4(
    sceneSDF(p - e.xyyy),
    sceneSDF(p - e.yxyy),
    sceneSDF(p - e.yyxy),
    sceneSDF(p - e.yyyx)
  );

  return normalize(n);
}

// Environment background (distant quantum foam)
vec3 getBackground(vec4 rayDir) {
  // Distant foam texture
  float foam = noise4d(rayDir * 3.0 + vec4(u_time * 0.1));
  foam = pow(foam, 3.0); // Sparse peaks

  vec3 color = vec3(0.0);

  // Deep indigo base with foam flecks
  color = mix(vec3(0.05, 0.03, 0.15), vec3(0.1, 0.2, 0.3), foam);

  // Distant cyan glow
  float glow = noise4d(rayDir * 1.5 + vec4(u_time * 0.05));
  color += vec3(0.0, 0.3, 0.4) * pow(glow, 4.0) * 0.3;

  return color;
}

// Camera system with multiple shots
void getCameraShot(float t, out vec3 camPos, out vec3 lookAt) {
  float cycle = mod(t, 60.0);

  if(cycle < 15.0) {
    // Shot 1 (0-15s): Dolly forward through clouds toward center
    float progress = cycle / 15.0;
    float ease = smoothstep(0.0, 1.0, progress);
    camPos = vec3(0.0, 0.0, 8.0 - ease * 4.0);
    lookAt = vec3(0.0, 0.0, 0.0);

  } else if(cycle < 30.0) {
    // Shot 2 (15-30s): Spiral orbit around particle cluster, spiraling inward
    float progress = (cycle - 15.0) / 15.0;
    float angle = progress * 3.14159 * 2.0;
    float radius = 6.0 - progress * 2.0; // Spiral in
    float height = sin(progress * 3.14159) * 2.0;
    camPos = vec3(cos(angle) * radius, height, sin(angle) * radius);
    lookAt = vec3(1.0, 0.0, 0.0); // Look at particle cluster

  } else if(cycle < 45.0) {
    // Shot 3 (30-45s): Fast accelerating dive through interference patterns
    float progress = (cycle - 30.0) / 15.0;
    float ease = progress * progress; // Accelerate
    camPos = vec3(sin(progress * 3.0) * 3.0, 5.0 - ease * 8.0, cos(progress * 3.0) * 3.0);
    lookAt = vec3(0.0, -3.0, 0.0);

  } else {
    // Shot 4 (45-60s): Rising multi-angle orbit showing scale
    float progress = (cycle - 45.0) / 15.0;
    float angle = progress * 3.14159 * 3.0; // Multiple angles
    float radius = 7.0;
    float height = -2.0 + progress * 5.0; // Rise up
    camPos = vec3(cos(angle) * radius, height, sin(angle) * radius);
    lookAt = vec3(0.0, 0.0, 0.0);
  }
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Camera setup with shot system
  vec3 camPos, lookAt;
  getCameraShot(u_time, camPos, lookAt);

  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(cross(vec3(0, 1, 0), forward));
  vec3 up = cross(forward, right);

  vec3 rayDir3D = normalize(forward + uv.x * right + uv.y * up);

  // Convert to 4D
  vec4 ro = vec4(camPos, 0.0);
  vec4 rd = vec4(rayDir3D, 0.0);

  // Apply 4D rotations - multiple planes for quantum phase relationships
  float t = u_time * 0.3;
  ro = rotateXW(t * 0.5) * rotateYZ(t * 0.7) * ro;
  rd = rotateXW(t * 0.5) * rotateYZ(t * 0.7) * rd;
  ro = rotateZW(t * 0.4) * rotateXY(t * 0.6) * ro;
  rd = rotateZW(t * 0.4) * rotateXY(t * 0.6) * rd;

  // Start with background
  vec3 color = getBackground(rd);

  // Volumetric probability clouds (6 samples)
  float volDist = 0.0;
  float stepSize = MAX_DIST / float(VOL_SAMPLES);
  vec3 volColor = vec3(0.0);

  for(int i = 0; i < VOL_SAMPLES; i++) {
    volDist += stepSize;
    vec4 p = ro + rd * volDist;

    float density = probabilityDensity(p);

    if(density > 0.01) {
      // W-depth affects color (indigo in deep W)
      float wDepth = abs(p.w) * 0.2;

      // Electric cyan for high probability
      vec3 cloudColor = mix(
        vec3(0.0, 0.8, 1.0), // Electric cyan
        vec3(0.1, 0.05, 0.4), // Deep indigo
        wDepth
      );

      // Add some variation
      float variation = noise4d(p * 2.0 + vec4(u_time * 0.2));
      cloudColor = mix(cloudColor, vec3(0.0, 1.0, 0.8), variation * 0.3);

      volColor += cloudColor * density * 0.25;
    }
  }

  color += volColor;

  // Ray march for particles
  float d = rayMarch(ro, rd);

  if(d < MAX_DIST) {
    vec4 p = ro + rd * d;
    vec4 normal = getNormal4D(p);

    // Particle color - blood crimson (collapsed probability)
    vec3 particleColor = vec3(0.8, 0.05, 0.15); // Blood crimson

    // Multiple light sources for balanced illumination
    vec4 light1 = normalize(vec4(5.0, 5.0, 5.0, 2.0));
    vec4 light2 = normalize(vec4(-3.0, -2.0, 3.0, -1.0));
    vec4 light3 = normalize(vec4(0.0, -4.0, 0.0, 3.0));

    float diff1 = max(dot(normal, light1), 0.0);
    float diff2 = max(dot(normal, light2), 0.0) * 0.5;
    float diff3 = max(dot(normal, light3), 0.0) * 0.3;

    // Ambient lighting (no pure black)
    float ambient = 0.2;

    float lighting = ambient + diff1 + diff2 + diff3;

    // Specular highlights (harsh white)
    vec4 viewDir = normalize(-rd);
    vec4 reflectDir = reflect(-light1, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

    particleColor = particleColor * lighting + vec3(1.0, 1.0, 1.0) * spec * 0.8;

    // Mix with background/volumetric
    color = mix(color, particleColor, 0.7);

    // Add particle glow (crimson)
    color += vec3(0.5, 0.0, 0.1) * (1.0 - d / MAX_DIST) * 0.3;
  }

  // Wave interference overlay (toxic green at peaks)
  vec4 wavePoint = ro + rd * 5.0; // Sample at mid-distance
  float waves = waveInterference(wavePoint);

  // Only show at interference peaks
  if(waves > 0.5) {
    float intensity = (waves - 0.5) * 2.0;
    color += vec3(0.0, 1.0, 0.2) * intensity * 0.4; // Toxic acid green
  }

  // Substrate field (regional density variation)
  float substrate = noise4d(ro * 0.3 + vec4(u_time * 0.05));
  vec3 substrateColor = mix(
    vec3(0.02, 0.01, 0.05), // Dark
    vec3(0.1, 0.05, 0.2),   // Lighter indigo
    substrate
  );
  color += substrateColor * 0.1;

  // Certainty spikes (harsh white flashes at collapse moments)
  float collapse = sin(u_time * 2.0) * 0.5 + 0.5;
  collapse = pow(collapse, 8.0); // Sharp spikes
  if(collapse > 0.8 && d < MAX_DIST) {
    color += vec3(1.0) * (collapse - 0.8) * 2.0;
  }

  // Slight vignette for depth
  float vignette = 1.0 - length(uv) * 0.3;
  color *= vignette;

  // Output
  gl_FragColor = vec4(color, 1.0);
}
`;

let vert = `
attribute vec3 aPosition;
void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

let theShader;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  theShader = createShader(vert, frag);
}

function draw() {
  shader(theShader);
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform('u_time', millis() / 1000.0);
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
