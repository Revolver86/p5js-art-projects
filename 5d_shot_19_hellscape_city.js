// 5D SCHIZOTECHNO HELLSCAPE METROPOLIS
// Dense nightmare city - camera flies THROUGH structures
// Acidpuke demon technicolor chaos

let hellscape;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  hellscape = createShader(vert, frag);
  shader(hellscape);
  noStroke();
  pixelDensity(1);
}

function draw() {
  shader(hellscape);
  hellscape.setUniform('uResolution', [width, height]);
  hellscape.setUniform('uTime', millis() / 1000.0);
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

#define MAX_STEPS 80
#define MAX_DIST 40.0
#define SURF_DIST 0.001
#define PI 3.14159265359

// MKULTRA TECHNICOLOR NIGHTMARE PALETTE
vec3 ACID_GREEN = vec3(0.2, 1.0, 0.3);
vec3 DEMON_RED = vec3(1.0, 0.08, 0.15);
vec3 ELECTRIC_MAGENTA = vec3(1.0, 0.0, 0.8);
vec3 TOXIC_YELLOW = vec3(0.95, 0.95, 0.1);
vec3 BRUISED_PURPLE = vec3(0.6, 0.15, 0.85);
vec3 NEON_CYAN = vec3(0.0, 0.9, 1.0);
vec3 CORRUPT_ORANGE = vec3(1.0, 0.4, 0.0);
vec3 VOID_BLACK = vec3(0.05, 0.02, 0.08);

mat2 rot2D(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// 5D HASH
float hash51(vec4 p, float v) {
  vec4 p4 = fract(p * vec4(443.897, 441.423, 437.195, 443.129));
  float pv = fract(v * 449.213);
  p4 += dot(p4, p4.wzxy + pv + 19.19);
  return fract((p4.x + p4.y) * (p4.z + p4.w + pv));
}

float noise5d(vec4 p, float v) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  float iv = floor(v);
  float fv = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  fv = fv * fv * (3.0 - 2.0 * fv);

  float n0 = hash51(i, iv);
  float n1 = hash51(i + vec4(1.0, 1.0, 1.0, 1.0), iv + 1.0);

  return mix(n0, n1, dot(f, f) * fv);
}

float fbm5d(vec4 p, float v) {
  float val = 0.0;
  float amp = 0.5;
  for(int i = 0; i < 4; i++) {
    val += amp * noise5d(p, v);
    p *= 2.1;
    v *= 2.1;
    amp *= 0.5;
  }
  return val;
}

// SMOOTH OPS
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

// BASIC SDFs
float sdBox(vec4 p, vec4 b) {
  vec4 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(max(max(d.x, d.y), d.z), d.w), 0.0);
}

float sdSphere(vec4 p, float r) {
  return length(p) - r;
}

// TWISTED DEMON TOWERS
float demonTowers(vec4 p, float v) {
  vec4 q = p;

  // Grid of towers
  q.xz = fract(q.xz / 6.0 - 0.5) * 6.0;

  // Twisted boxes
  float height = abs(p.y);
  q.xy *= rot2D(height * 0.5 + v);
  q.zw *= rot2D(height * 0.3 - v * 0.7);

  vec4 boxSize = vec4(0.8, 20.0, 0.8, 0.6);
  boxSize.x += sin(height * 2.0 + uTime) * 0.3;
  boxSize.z += cos(height * 2.5 - uTime) * 0.3;

  float towers = sdBox(q, boxSize);

  // Cut windows
  vec4 windowPos = q;
  windowPos.y = fract(windowPos.y / 2.0 - 0.5) * 2.0;
  float windows = sdBox(windowPos, vec4(0.5, 0.4, 0.5, 0.3));
  towers = smax(towers, -windows, 0.1);

  return towers;
}

// IMPOSSIBLE ARCHES
float hellArches(vec4 p, float v) {
  vec4 q = p;

  // Positioned between towers
  q.xz += vec2(3.0, 3.0);
  q.xz = fract(q.xz / 6.0 - 0.5) * 6.0;

  // Arching structure
  float arch = length(q.xz) - 2.0;
  arch = max(arch, abs(q.y) - 3.0);
  arch = max(arch, -length(q.xz) + 1.5);

  // Twist through W and V
  q.xw *= rot2D(q.y * 0.4 + v);
  arch = smin(arch, sdBox(q, vec4(0.3, 3.0, 0.3, 0.3)), 0.3);

  return arch;
}

// FRACTAL STREETS - recursive hell roads
float fractalStreets(vec4 p, float v) {
  vec4 q = p;

  q.y += 15.0; // At ground level

  float streets = abs(q.y) - 0.5;

  // Recursive grid patterns
  for(int i = 0; i < 3; i++) {
    q.xz = abs(fract(q.xz / 3.0) - 0.5) * 3.0;
    q *= 1.3;

    float gridLines = min(abs(q.x), abs(q.z)) - 0.05;
    streets = smin(streets, gridLines, 0.2);
  }

  // Pulsing holes
  float holes = length(fract(p.xz / 2.0) - 0.5) - 0.3;
  holes = max(holes, abs(p.y + 15.0) - 0.6);
  streets = smax(streets, -holes, 0.1);

  return streets;
}

// WRITHING TENTACLE CABLES
float cableTentacles(vec4 p, float v) {
  float cables = MAX_DIST;

  // Multiple cables crossing space
  for(int i = 0; i < 5; i++) {
    float fi = float(i);
    vec4 cablePos = p;

    // Position in space
    cablePos.xz += vec2(sin(fi), cos(fi)) * 8.0;

    // Sine wave path
    float wave = sin(cablePos.y * 0.5 + uTime + fi) * 2.0;
    cablePos.x += wave;
    cablePos.z += cos(cablePos.y * 0.4 + uTime * 0.7 + fi) * 2.0;
    cablePos.w += sin(cablePos.y * 0.3 + v + fi) * 1.5;

    float cable = length(cablePos.xzw) - (0.2 + sin(cablePos.y * 3.0) * 0.05);
    cables = smin(cables, cable, 0.3);
  }

  return cables;
}

// PULSING DEMON SPHERES
float demonSpheres(vec4 p, float v) {
  vec4 q = p;

  // Positioned at intersections
  q.xz = fract(q.xz / 6.0) * 6.0;
  q.y = fract(q.y / 8.0) * 8.0;

  float pulse = 0.8 + sin(uTime * 2.0 + q.x + q.z + v) * 0.3;

  float spheres = sdSphere(q - vec4(3.0, 4.0, 3.0, 0.0), pulse);

  // Add spikes
  float spikes = length(q - vec4(3.0, 4.0, 3.0, 0.0)) - (pulse + 0.5);
  spikes = abs(spikes) - 0.05;

  spheres = smin(spheres, spikes, 0.1);

  return spheres;
}

// GLITCHING WALLS
float glitchWalls(vec4 p, float v) {
  vec4 q = p;

  // Walls at city edges
  float walls = MAX_DIST;

  walls = min(walls, abs(abs(q.x) - 18.0) - 0.5);
  walls = min(walls, abs(abs(q.z) - 18.0) - 0.5);

  // Glitch displacement
  float glitch = fbm5d(q * 2.0, v + uTime);
  walls += glitch * 0.5;

  // Cut glitch holes
  float holes = noise5d(q * 4.0, v + uTime * 0.5);
  if(holes > 0.7) walls = MAX_DIST;

  return walls;
}

// HELLSCAPE CITY SDF
vec4 hellscapeSDF(vec4 p, float v) {
  // 5D DOMAIN WARPING - everything shifts
  vec4 warp = vec4(
    fbm5d(p * 0.3, v),
    fbm5d(p * 0.3 + vec4(10.0, 10.0, 10.0, 10.0), v),
    fbm5d(p * 0.3 + vec4(20.0, 20.0, 20.0, 20.0), v),
    fbm5d(p * 0.3 + vec4(30.0, 30.0, 30.0, 30.0), v)
  );
  p += warp * 1.5;

  float towers = demonTowers(p, v);
  float arches = hellArches(p, v);
  float streets = fractalStreets(p, v);
  float cables = cableTentacles(p, v);
  float spheres = demonSpheres(p, v);
  float walls = glitchWalls(p, v);

  // Combine with smooth blending
  float scene = smin(towers, arches, 0.5);
  scene = smin(scene, streets, 0.4);
  scene = smin(scene, cables, 0.3);
  scene = smin(scene, spheres, 0.4);
  scene = smin(scene, walls, 0.6);

  // Material IDs
  float matID = 0.0;
  if(abs(towers - scene) < 0.01) matID = 1.0;
  else if(abs(arches - scene) < 0.01) matID = 2.0;
  else if(abs(streets - scene) < 0.01) matID = 3.0;
  else if(abs(cables - scene) < 0.01) matID = 4.0;
  else if(abs(spheres - scene) < 0.01) matID = 5.0;
  else if(abs(walls - scene) < 0.01) matID = 6.0;

  return vec4(scene, matID, towers, cables);
}

// RAY MARCH
vec4 rayMarch(vec4 ro, vec4 rd, float v) {
  float dO = 0.0;
  vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

  for(int i = 0; i < MAX_STEPS; i++) {
    vec4 p = ro + rd * dO;
    vec4 sceneData = hellscapeSDF(p, v);
    float dS = sceneData.x;

    dO += dS;
    result = sceneData;

    if(abs(dS) < SURF_DIST || dO > MAX_DIST) break;
  }

  result.x = dO;
  return result;
}

// 5D NORMAL
vec4 getNormal5D(vec4 p, float v) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec4(
    hellscapeSDF(p + e.xyyy, v).x - hellscapeSDF(p - e.xyyy, v).x,
    hellscapeSDF(p + e.yxyy, v).x - hellscapeSDF(p - e.yxyy, v).x,
    hellscapeSDF(p + e.yyxy, v).x - hellscapeSDF(p - e.yyxy, v).x,
    hellscapeSDF(p + e.yyyx, v).x - hellscapeSDF(p - e.yyyx, v).x
  ));
}

// ACIDPUKE TECHNICOLOR MATERIALS
vec3 getMaterial(vec4 p, vec4 n, float matID, float v) {
  vec3 col = VOID_BLACK;

  float pulse = sin(uTime * 3.0) * 0.5 + 0.5;

  if(matID < 0.5) {
    // Default - cycling colors
    col = mix(DEMON_RED, ELECTRIC_MAGENTA, pulse);
  } else if(matID < 1.5) {
    // Towers - toxic yellow with glitch
    col = TOXIC_YELLOW;
    float glitch = fbm5d(p * 8.0, v);
    col = mix(col, ACID_GREEN, glitch);
  } else if(matID < 2.5) {
    // Arches - electric magenta/cyan
    col = mix(ELECTRIC_MAGENTA, NEON_CYAN, sin(p.y * 3.0 + uTime));
  } else if(matID < 3.5) {
    // Streets - demon red with corrupt orange
    col = DEMON_RED;
    float pattern = fbm5d(p * 6.0, v);
    col = mix(col, CORRUPT_ORANGE, pattern);
  } else if(matID < 4.5) {
    // Cables - acid green with bruised purple
    col = ACID_GREEN;
    float stripe = sin(p.y * 10.0 + uTime * 5.0);
    col = mix(col, BRUISED_PURPLE, stripe * 0.5 + 0.5);
  } else if(matID < 5.5) {
    // Spheres - pulsing through all colors
    float cycle = fract(uTime * 0.5 + p.x + p.z);
    if(cycle < 0.2) col = DEMON_RED;
    else if(cycle < 0.4) col = TOXIC_YELLOW;
    else if(cycle < 0.6) col = ELECTRIC_MAGENTA;
    else if(cycle < 0.8) col = NEON_CYAN;
    else col = ACID_GREEN;
    col *= 1.5; // Extra bright
  } else {
    // Walls - glitching colors
    float glitch = hash51(floor(p * 4.0), v + floor(uTime * 2.0));
    if(glitch < 0.2) col = DEMON_RED;
    else if(glitch < 0.4) col = BRUISED_PURPLE;
    else if(glitch < 0.6) col = CORRUPT_ORANGE;
    else if(glitch < 0.8) col = NEON_CYAN;
    else col = ACID_GREEN;
  }

  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

  // CAMERA FLIES THROUGH THE CITY
  float t = uTime * 2.0; // Speed

  // Weaving path through structures
  vec3 ro3d = vec3(
    sin(t * 0.3) * 8.0,
    sin(t * 0.2) * 10.0 - 5.0,
    t * 3.0 // Moving forward
  );

  // Look ahead along path
  vec3 ta3d = vec3(
    sin((t + 1.0) * 0.3) * 8.0,
    sin((t + 1.0) * 0.2) * 10.0 - 5.0,
    (t + 3.0) * 3.0
  );

  vec3 ww = normalize(ta3d - ro3d);
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = normalize(cross(ww, uu));
  vec3 rd3d = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);

  // 5D coordinates
  vec4 ro = vec4(ro3d, 0.0);
  vec4 rd = vec4(rd3d, 0.0);
  float v = sin(t * 0.1) * 2.0;

  vec4 result = rayMarch(ro, rd, v);
  float d = result.x;
  float matID = result.y;

  // Technicolor chaos background
  vec3 col = mix(DEMON_RED, BRUISED_PURPLE, 0.3) * 0.2;
  col += ACID_GREEN * 0.1 * sin(uTime * 2.0);

  if(d < MAX_DIST) {
    vec4 p = ro + rd * d;
    vec4 n = getNormal5D(p, v);

    col = getMaterial(p, n, matID, v);

    // Harsh multi-colored lighting
    vec4 light1 = normalize(vec4(1.0, 1.0, 0.0, 1.0));
    vec4 light2 = normalize(vec4(-1.0, 0.5, 0.0, -0.5));

    float diff1 = max(dot(n, light1), 0.0);
    float diff2 = max(dot(n, light2), 0.0);

    col *= 0.4 + diff1 * 0.8 + diff2 * 0.4;

    // Electric rim light
    vec4 viewDir = normalize(-rd);
    float fresnel = pow(1.0 - abs(dot(n, viewDir)), 2.0);
    col += NEON_CYAN * fresnel;
  }

  // Aggressive color grading
  col = pow(col, vec3(0.9, 0.9, 0.9)); // Boost
  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114)), dot(col, vec3(0.299, 0.587, 0.114)), dot(col, vec3(0.299, 0.587, 0.114))), col, 1.8); // Supersaturate

  // Chromatic aberration for disorientation
  col.r += sin(uv.x * 10.0 + uTime * 5.0) * 0.1;
  col.b += cos(uv.y * 10.0 + uTime * 5.0) * 0.1;

  // Scanline glitch
  col *= 0.9 + 0.1 * sin(uv.y * 800.0 + uTime * 50.0);

  gl_FragColor = vec4(col, 1.0);
}
`;
