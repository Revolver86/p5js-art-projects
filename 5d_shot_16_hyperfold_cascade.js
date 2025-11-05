// 5D HYPERFOLD CASCADE
// Pure textural chaos - cross-sections through recursively folded 5D space
// NO floating shapes - immersive dimensional madness

let hypersigilShader;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noCursor();
  hypersigilShader = createShader(vert, frag);
}

function draw() {
  shader(hypersigilShader);
  hypersigilShader.setUniform('uResolution', [width, height]);
  hypersigilShader.setUniform('uTime', millis() / 1000.0);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

const vert = `
attribute vec3 aPosition;
void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}`;

const frag = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 uResolution;
uniform float uTime;

#define PI 3.14159265359
#define TAU 6.28318530718

// CHAOS PALETTE - industrial decay
const vec3 VOID_BLACK = vec3(0.01, 0.01, 0.02);
const vec3 BLOOD_CRIMSON = vec3(0.85, 0.05, 0.12);
const vec3 TOXIC_GREEN = vec3(0.08, 0.95, 0.25);
const vec3 STEEL_BLUE = vec3(0.15, 0.35, 0.65);
const vec3 RUST_ORANGE = vec3(0.8, 0.35, 0.1);
const vec3 BRUISED_PURPLE = vec3(0.4, 0.08, 0.5);
const vec3 CORRUPT_GOLD = vec3(0.95, 0.75, 0.15);
const vec3 ELECTRIC_CYAN = vec3(0.0, 0.85, 0.95);

// 2D ROTATION
mat2 rot2D(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

// 5D HASH NOISE
float hash5D(vec4 p, float v) {
  vec4 p4 = fract(p * vec4(443.897, 441.423, 437.195, 443.129));
  float pv = fract(v * 449.213);
  p4 += dot(p4, p4.wzxy + pv + 19.19);
  return fract((p4.x + p4.y) * (p4.z + p4.w + pv));
}

// 5D NOISE with interpolation
float noise5D(vec4 p, float v) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  float iv = floor(v);
  float fv = fract(v);

  f = f * f * (3.0 - 2.0 * f);
  fv = fv * fv * (3.0 - 2.0 * fv);

  // Sample corners of 5D hypercube
  float n00000 = hash5D(i, iv);
  float n10000 = hash5D(i + vec4(1.0, 0.0, 0.0, 0.0), iv);
  float n01000 = hash5D(i + vec4(0.0, 1.0, 0.0, 0.0), iv);
  float n00100 = hash5D(i + vec4(0.0, 0.0, 1.0, 0.0), iv);
  float n00010 = hash5D(i + vec4(0.0, 0.0, 0.0, 1.0), iv);
  float n11110 = hash5D(i + vec4(1.0, 1.0, 1.0, 1.0), iv);
  float n00001 = hash5D(i, iv + 1.0);
  float n11111 = hash5D(i + vec4(1.0, 1.0, 1.0, 1.0), iv + 1.0);

  // 5D interpolation
  float n = mix(
    mix(mix(mix(n00000, n10000, f.x), mix(n01000, n11110, f.x), f.y),
        mix(mix(n00100, n11110, f.z), n11110, f.w), f.z),
    mix(mix(mix(n00001, n11111, f.x), n11111, f.y),
        mix(n11111, n11111, f.z), f.w),
    fv
  );

  return n;
}

// 5D FRACTAL NOISE
float fbm5D(vec4 p, float v) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for(int i = 0; i < 5; i++) {
    value += amplitude * noise5D(p * frequency, v * frequency);
    frequency *= 2.1;
    amplitude *= 0.48;
  }

  return value;
}

// 5D RECURSIVE FOLDING (Mandelbox-style)
vec3 fold5D(vec4 p, float v) {
  vec4 z = p;
  float zv = v;
  float foldLimit = 1.0;
  float minRadius = 0.5;
  float fixedRadius = 1.0;
  float scale = 2.0 + sin(uTime * 0.3) * 0.5;

  float orbitTrap = 1000.0;
  float foldDepth = 0.0;

  // Recursive folding iterations
  for(int i = 0; i < 8; i++) {
    // Box fold in all 5 dimensions
    if(z.x > foldLimit) z.x = 2.0 * foldLimit - z.x;
    else if(z.x < -foldLimit) z.x = -2.0 * foldLimit - z.x;

    if(z.y > foldLimit) z.y = 2.0 * foldLimit - z.y;
    else if(z.y < -foldLimit) z.y = -2.0 * foldLimit - z.y;

    if(z.z > foldLimit) z.z = 2.0 * foldLimit - z.z;
    else if(z.z < -foldLimit) z.z = -2.0 * foldLimit - z.z;

    if(z.w > foldLimit) z.w = 2.0 * foldLimit - z.w;
    else if(z.w < -foldLimit) z.w = -2.0 * foldLimit - z.w;

    if(zv > foldLimit) zv = 2.0 * foldLimit - zv;
    else if(zv < -foldLimit) zv = -2.0 * foldLimit - zv;

    // Sphere fold in 5D
    float r2 = dot(z, z) + zv * zv;
    orbitTrap = min(orbitTrap, r2);
    foldDepth += r2 * 0.1;

    if(r2 < minRadius * minRadius) {
      float temp = (fixedRadius * fixedRadius) / (minRadius * minRadius);
      z *= temp;
      zv *= temp;
    } else if(r2 < fixedRadius * fixedRadius) {
      float temp = (fixedRadius * fixedRadius) / r2;
      z *= temp;
      zv *= temp;
    }

    // Scale
    z = z * scale;
    zv = zv * scale;

    // Offset
    z += p * 0.3;
    zv += v * 0.3;

    // Rotate between folds
    float t = uTime * 0.1 + float(i) * 0.1;
    z.xy = rot2D(t) * z.xy;
    z.zw = rot2D(t * 1.3) * z.zw;
    vec2 wv = rot2D(t * 0.7) * vec2(z.w, zv);
    z.w = wv.x;
    zv = wv.y;
  }

  float finalDist = (length(z) + abs(zv)) / pow(scale, 8.0);

  return vec3(finalDist, orbitTrap, foldDepth);
}

// CROSS-SECTION PATTERN GENERATOR
vec3 crossSection5D(vec2 uv, float time) {
  // Build 5D coordinate from screen UV
  vec4 pos = vec4(
    uv.x * 4.0,
    uv.y * 4.0,
    sin(uv.x * 8.0 + time * 0.4) * 0.6,
    cos(uv.y * 6.0 + time * 0.5) * 0.6
  );
  float v = time * 0.3;

  // Apply 5D rotations in multiple planes
  float t1 = time * 0.12;
  float t2 = time * 0.18;
  float t3 = time * 0.21;

  pos.xy = rot2D(t1) * pos.xy;
  pos.zw = rot2D(t2) * pos.zw;
  vec2 wv1 = rot2D(t3) * vec2(pos.w, v);
  pos.w = wv1.x;
  v = wv1.y;

  // Domain warp
  float warp1 = fbm5D(pos * 0.8, v * 0.8);
  float warp2 = fbm5D(pos * 1.5 + vec4(100.0, 100.0, 100.0, 100.0), v * 1.5 + 50.0);

  vec4 offset = vec4(
    warp1 * cos(warp2 * TAU),
    warp1 * sin(warp2 * TAU),
    warp2 * cos(warp1 * TAU),
    warp2 * sin(warp1 * TAU)
  );

  pos += offset * 0.4;
  v += warp1 * 0.5 - warp2 * 0.3;

  // Second rotation
  float t4 = time * -0.08;
  float t5 = time * 0.15;
  float t6 = time * -0.13;

  pos.xy = rot2D(t4) * pos.xy;
  pos.zw = rot2D(t5) * pos.zw;
  vec2 wv2 = rot2D(t6) * vec2(pos.w, v);
  pos.w = wv2.x;
  v = wv2.y;

  // Get hyperfold structure
  vec3 foldData = fold5D(pos, v);
  float foldDist = foldData.x;
  float orbitTrap = foldData.y;
  float foldDepth = foldData.z;

  // Multiple noise layers
  float noise1 = fbm5D(pos * 1.2, v * 1.2);
  float noise2 = fbm5D(pos * 2.5 + vec4(100.0, 100.0, 100.0, 100.0), v * 2.5 + 50.0);
  float noise3 = fbm5D(pos * 0.6 + vec4(200.0, 200.0, 200.0, 200.0), v * 0.6 + 100.0);

  // Combine into textural chaos
  float pattern = 0.0;
  pattern += foldDist * 0.3;
  pattern += orbitTrap * 0.15;
  pattern += foldDepth * 0.2;
  pattern += noise1 * 0.15;
  pattern += noise2 * 0.1;
  pattern += noise3 * 0.1;

  // V dimension interference
  pattern += sin(v * 5.0 + time) * 0.05;
  pattern += cos(v * 3.0 + orbitTrap * 10.0) * 0.05;

  return vec3(pattern, orbitTrap, foldDepth);
}

// GLITCH DISTORTION
vec2 glitchDistort(vec2 uv, float time) {
  float glitchIntensity = sin(time * 4.3) * 0.5 + 0.5;
  glitchIntensity = pow(glitchIntensity, 6.0) * 0.15;

  float scanline = floor(uv.y * 120.0);
  float glitchOffset = hash5D(vec4(scanline, floor(time * 3.0), 0.0, 0.0), 0.0) * glitchIntensity;

  float vertGlitch = floor(uv.x * 80.0);
  float vertOffset = hash5D(vec4(vertGlitch, floor(time * 2.5), 10.0, 0.0), 0.0) * glitchIntensity * 0.5;

  uv.x += glitchOffset;
  uv.y += vertOffset;

  return uv;
}

// CHROMATIC ABERRATION
vec3 chromaticAberration5D(vec2 uv, float amount, float time) {
  vec2 offset = (uv - vec2(0.5, 0.5)) * amount;

  vec3 rData = crossSection5D(uv + offset, time);
  vec3 gData = crossSection5D(uv, time);
  vec3 bData = crossSection5D(uv - offset, time);

  return vec3(rData.x, gData.x, bData.x);
}

// COLOR MAPPING
vec3 mapColor(vec3 pattern, vec2 uv, float time) {
  float value = pattern.x;
  float orbit = pattern.y;
  float depth = pattern.z;

  // Create banding
  value = fract(value * 4.0 + orbit * 2.0);

  vec3 col = vec3(0.0, 0.0, 0.0);

  // Multi-zone color mapping
  if(value < 0.15) {
    col = mix(VOID_BLACK, BLOOD_CRIMSON, value / 0.15);
  } else if(value < 0.30) {
    col = mix(BLOOD_CRIMSON, TOXIC_GREEN, (value - 0.15) / 0.15);
  } else if(value < 0.45) {
    col = mix(TOXIC_GREEN, STEEL_BLUE, (value - 0.30) / 0.15);
  } else if(value < 0.60) {
    col = mix(STEEL_BLUE, BRUISED_PURPLE, (value - 0.45) / 0.15);
  } else if(value < 0.75) {
    col = mix(BRUISED_PURPLE, RUST_ORANGE, (value - 0.60) / 0.15);
  } else if(value < 0.90) {
    col = mix(RUST_ORANGE, CORRUPT_GOLD, (value - 0.75) / 0.15);
  } else {
    col = mix(CORRUPT_GOLD, ELECTRIC_CYAN, (value - 0.90) / 0.10);
  }

  // Modulate by orbit trap
  col *= 0.7 + orbit * 0.6;

  // Pulse based on fold depth
  float pulse = sin(depth * 10.0 + time * 2.0) * 0.5 + 0.5;
  col += col * pulse * 0.3;

  // Dimensional flicker
  float flicker = hash5D(vec4(uv * 10.0, 0.0, 0.0), depth);
  col += vec3(flicker, flicker, flicker) * 0.08;

  return col;
}

// SCANLINES
float scanlines(vec2 uv, float time) {
  float line = sin(uv.y * 600.0 + time * 12.0) * 0.5 + 0.5;
  return line * 0.15 + 0.85;
}

// CRT CURVE
vec2 crtCurve(vec2 uv) {
  uv = uv * 2.0 - vec2(1.0, 1.0);
  vec2 offset = abs(uv.yx) / vec2(5.0, 3.5);
  uv = uv + uv * offset * offset;
  uv = uv * 0.5 + vec2(0.5, 0.5);
  return uv;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  // CRT curve
  uv = crtCurve(uv);

  // Glitch
  uv = glitchDistort(uv, uTime);

  // Center and aspect
  uv -= vec2(0.5, 0.5);
  uv.x *= uResolution.x / uResolution.y;

  // Chromatic aberration
  float aberration = 0.015 + sin(uTime * 0.7) * 0.01;
  vec3 chromaticSample = chromaticAberration5D(uv, aberration, uTime);

  // Get pattern data
  vec3 patternData = crossSection5D(uv, uTime);

  // Map to colors
  vec3 col = mapColor(patternData, uv, uTime);

  // Blend chromatic
  col.r += chromaticSample.r * 0.25;
  col.b += chromaticSample.b * 0.25;

  // Scanlines
  col *= scanlines(uv, uTime);

  // Vignette
  vec2 vignetteUV = gl_FragCoord.xy / uResolution.xy;
  float vignette = length(vignetteUV - vec2(0.5, 0.5));
  col *= 1.0 - vignette * 0.7;

  // Digital noise
  float digitalNoise = hash5D(vec4(uv * 25.0, uTime * 6.0, 0.0), patternData.z);
  col += vec3(digitalNoise, digitalNoise, digitalNoise) * 0.06;

  // Contrast and saturation
  col = pow(col, vec3(1.3, 1.3, 1.3));
  vec3 gray = vec3(dot(col, vec3(0.299, 0.587, 0.114)), dot(col, vec3(0.299, 0.587, 0.114)), dot(col, vec3(0.299, 0.587, 0.114)));
  col = mix(gray, col, 1.5);

  // Clamp
  col = clamp(col, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;
