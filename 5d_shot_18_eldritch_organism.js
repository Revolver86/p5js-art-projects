// 5D ELDRITCH ORGANISM
// Complex organic entity with multiple body parts, tentacles, asymmetry
// Living in an organic environment - NOT floating shapes

let organism;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  organism = createShader(vert, frag);
  shader(organism);
  noStroke();
  pixelDensity(1);
}

function draw() {
  shader(organism);
  organism.setUniform('uResolution', [width, height]);
  organism.setUniform('uTime', millis() / 1000.0);
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

#define MAX_STEPS 100
#define MAX_DIST 30.0
#define SURF_DIST 0.001
#define PI 3.14159265359

// ORGANIC HORROR PALETTE
vec3 PORCELAIN_WHITE = vec3(0.95, 0.92, 0.88);
vec3 FLESH_PALE = vec3(0.88, 0.82, 0.78);
vec3 VEIN_BLUE = vec3(0.35, 0.45, 0.62);
vec3 CRIMSON_EYE = vec3(0.85, 0.15, 0.12);
vec3 TENTACLE_PINK = vec3(0.78, 0.42, 0.52);
vec3 ARTERIAL_RED = vec3(0.72, 0.18, 0.22);
vec3 SLIME_GREEN = vec3(0.42, 0.55, 0.38);
vec3 DECAY_BROWN = vec3(0.35, 0.28, 0.22);

mat2 rot2D(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// 5D HASH NOISE
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

// SMOOTH MIN for organic blending
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// ORGANIC SDFs
float sdEllipsoid(vec4 p, vec4 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float sdSphere(vec4 p, float r) {
  return length(p) - r;
}

float sdCapsule(vec4 p, vec4 a, vec4 b, float r) {
  vec4 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// CREATURE BODY PARTS

// Compressed hunched torso
float creatureTorso(vec4 p, float v) {
  // Compressed ellipsoid
  vec4 radii = vec4(1.2, 0.8, 0.9, 1.0); // Compressed vertically

  // Add hunching deformation
  float hunch = noise5d(p * 2.0, v) * 0.3;
  p.y += hunch;

  // Breathing motion
  float breathe = sin(uTime * 1.5) * 0.15;
  radii *= (1.0 + breathe);

  return sdEllipsoid(p, radii);
}

// Bulbous asymmetric skull
float creatureSkull(vec4 p, float v) {
  // Offset upward from torso
  p.y -= 1.8;

  // Large bulbous sphere
  float skull = sdSphere(p, 1.4);

  // Asymmetric deformation - different noise on each side
  float deform1 = noise5d(p * 3.0 + vec4(100.0, 100.0, 100.0, 100.0), v) * 0.25;
  float deform2 = noise5d(p * 3.0 + vec4(200.0, 200.0, 200.0, 200.0), v + 1.0) * 0.25;

  if(p.x > 0.0) skull += deform1;
  else skull += deform2;

  return skull;
}

// Eye sockets - sunken crimson orbs
float creatureEyes(vec4 p, float v) {
  p.y -= 1.8; // At skull level

  // Asymmetric placement
  vec4 leftEye = p - vec4(-0.5, 0.2, 1.0, 0.0);
  vec4 rightEye = p - vec4(0.6, 0.15, 1.05, 0.0); // Slightly off

  float left = sdSphere(leftEye, 0.25);
  float right = sdSphere(rightEye, 0.22); // Different sizes

  return min(left, right);
}

// Cavernous maw
float creatureMaw(vec4 p, float v) {
  p.y -= 1.5;
  p.z -= 1.2;

  // Stretched ellipsoid opening
  vec4 radii = vec4(0.6, 0.4, 0.3, 0.2);
  float maw = sdEllipsoid(p, radii);

  // Gaping animation
  float gape = abs(sin(uTime * 0.8)) * 0.3;
  maw -= gape;

  return maw;
}

// Primary arms - elongated with hooked claws
float creatureArms(vec4 p, float v) {
  float arms = MAX_DIST;

  // Left arm
  vec4 shoulderL = vec4(-1.3, 0.5, 0.0, 0.0);
  vec4 elbowL = vec4(-2.0, -0.3, 0.5, 0.0) + vec4(sin(uTime) * 0.2, cos(uTime * 1.3) * 0.2, 0.0, 0.0);
  vec4 handL = vec4(-2.5, -1.2, 0.8, 0.0) + vec4(sin(uTime * 1.1) * 0.3, 0.0, 0.0, 0.0);

  float upperL = sdCapsule(p, shoulderL, elbowL, 0.18);
  float lowerL = sdCapsule(p, elbowL, handL, 0.12);
  arms = smin(upperL, lowerL, 0.2);

  // Right arm
  vec4 shoulderR = vec4(1.3, 0.5, 0.0, 0.0);
  vec4 elbowR = vec4(2.0, -0.3, 0.5, 0.0) + vec4(sin(uTime + 1.0) * 0.2, cos(uTime * 1.3 + 1.0) * 0.2, 0.0, 0.0);
  vec4 handR = vec4(2.5, -1.2, 0.8, 0.0) + vec4(sin(uTime * 1.1 + 1.0) * 0.3, 0.0, 0.0, 0.0);

  float upperR = sdCapsule(p, shoulderR, elbowR, 0.18);
  float lowerR = sdCapsule(p, elbowR, handR, 0.12);
  arms = smin(arms, smin(upperR, lowerR, 0.2), 0.2);

  return arms;
}

// TENTACLES - multiple writhing appendages
float creatureTentacles(vec4 p, float v) {
  float tentacles = MAX_DIST;

  // 10 tentacles erupting from lower torso/hips
  for(int i = 0; i < 10; i++) {
    float fi = float(i);
    float angle = fi * 0.628; // Spread around body

    // Base position at hips
    vec4 base = vec4(
      cos(angle) * 0.8,
      -0.5,
      sin(angle) * 0.8,
      sin(fi) * 0.3
    );

    // Writhing motion - domain warping
    vec4 offset = p - base;
    float phase = uTime + fi * 0.5;

    // Tentacle curves outward and downward with sine wave motion
    float dist = length(offset.xz);
    float wriggle = sin(dist * 3.0 - phase * 2.0 + v) * 0.4;
    float wriggle2 = cos(dist * 2.0 - phase * 1.5 + fi) * 0.3;

    offset.x += wriggle;
    offset.y += wriggle2 - dist * 0.5; // Droop downward
    offset.w += sin(dist * 4.0 - phase) * 0.2;

    // Tapered capsule - thick at base, thin at tip
    float len = 2.5 + sin(fi) * 0.8;
    vec4 tip = base + vec4(cos(angle), -1.5, sin(angle), 0.0) * len;

    float thickness = mix(0.15, 0.02, dist / len); // Taper
    float tentacle = sdCapsule(p, base, tip, thickness);

    // Add segmented bumps
    float segments = sin(dist * 8.0) * 0.02;
    tentacle += segments;

    tentacles = smin(tentacles, tentacle, 0.15);
  }

  return tentacles;
}

// CREATURE ASSEMBLY
vec4 creatureSDF(vec4 p, float v) {
  // Add 5D warping - creature morphs through V dimension
  p += vec4(
    noise5d(p * 0.5, v) * 0.3,
    noise5d(p * 0.5 + vec4(10.0, 10.0, 10.0, 10.0), v) * 0.2,
    noise5d(p * 0.5 + vec4(20.0, 20.0, 20.0, 20.0), v) * 0.3,
    noise5d(p * 0.5 + vec4(30.0, 30.0, 30.0, 30.0), v) * 0.2
  ) * 0.5;

  float torso = creatureTorso(p, v);
  float skull = creatureSkull(p, v);
  float eyes = creatureEyes(p, v);
  float maw = creatureMaw(p, v);
  float arms = creatureArms(p, v);
  float tentacles = creatureTentacles(p, v);

  // Organic blending
  float body = smin(torso, skull, 0.4);
  body = smin(body, arms, 0.3);
  body = smin(body, tentacles, 0.25);

  // Eyes and maw cut into surface
  body = max(body, -eyes * 0.8);
  body = max(body, -maw * 0.7);

  // Return distance + material ID
  // Store which part we're closest to for coloring
  float matID = 0.0;
  if(abs(tentacles - body) < 0.01) matID = 1.0; // Tentacle
  else if(abs(eyes - body * -0.8) < 0.01) matID = 2.0; // Eye
  else if(abs(arms - body) < 0.01) matID = 3.0; // Arm

  return vec4(body, matID, torso, tentacles);
}

// ORGANIC ENVIRONMENT
float organicEnvironment(vec4 p, float v) {
  // Flesh walls - undulating membranes
  float walls = MAX_DIST;

  // Floor - pooling slime and flesh
  float floor = p.y + 3.0;
  floor += noise5d(p * 2.0, v) * 0.5;
  walls = floor;

  // Membrane curtains hanging from above - pushed to background, much thinner
  vec4 memPos = p;
  memPos.y += 6.0;
  // Larger spacing, pushed further out from center
  memPos.xz = abs(fract(memPos.xz / 8.0) - 0.5) * 8.0;

  // Much thinner pillars - was 0.8, now 0.3
  float membrane = length(memPos.xz) - 0.3;
  membrane += sin(memPos.y * 3.0 + uTime + v) * 0.15;
  membrane = max(membrane, -p.y - 6.0); // Only hang down

  walls = smin(walls, membrane, 0.5);

  return walls;
}

// COMBINED SCENE
vec4 sceneSDF(vec4 p, float v) {
  vec4 creature = creatureSDF(p, v);
  float environment = organicEnvironment(p, v);

  float dist = smin(creature.x, environment, 0.3);

  // Material ID: creature parts vs environment
  float matID = creature.y;
  if(abs(environment - dist) < 0.01) matID = 4.0; // Environment

  return vec4(dist, matID, creature.z, creature.w);
}

// RAY MARCH
vec4 rayMarch(vec4 ro, vec4 rd, float v) {
  float dO = 0.0;
  vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

  for(int i = 0; i < MAX_STEPS; i++) {
    vec4 p = ro + rd * dO;
    vec4 sceneData = sceneSDF(p, v);
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
    sceneSDF(p + e.xyyy, v).x - sceneSDF(p - e.xyyy, v).x,
    sceneSDF(p + e.yxyy, v).x - sceneSDF(p - e.yxyy, v).x,
    sceneSDF(p + e.yyxy, v).x - sceneSDF(p - e.yyxy, v).x,
    sceneSDF(p + e.yyyx, v).x - sceneSDF(p - e.yyyx, v).x
  ));
}

// ORGANIC MATERIAL SYSTEM
vec3 getMaterial(vec4 p, vec4 n, float matID, float v) {
  vec3 col = PORCELAIN_WHITE;

  if(matID < 0.5) {
    // Main body - porcelain with veins
    col = FLESH_PALE;

    // Crack/vein patterns
    float veins = noise5d(p * 8.0, v);
    veins = pow(veins, 4.0);
    col = mix(col, VEIN_BLUE, veins * 0.4);

    // Decay spots
    float decay = noise5d(p * 5.0 + vec4(100.0, 100.0, 100.0, 100.0), v + 1.0);
    if(decay > 0.7) col = mix(col, DECAY_BROWN, (decay - 0.7) * 2.0);

  } else if(matID < 1.5) {
    // Tentacles - pink/crimson mottled
    col = TENTACLE_PINK;

    float mottle = noise5d(p * 6.0, v);
    col = mix(col, ARTERIAL_RED, mottle * 0.6);

    // Slime gradient from base to tip
    float dist = length(p.xz);
    col = mix(col, SLIME_GREEN, dist * 0.3);

  } else if(matID < 2.5) {
    // Eyes - glowing crimson
    col = CRIMSON_EYE;
    col *= 1.5 + sin(uTime * 3.0) * 0.3; // Pulsing glow

  } else if(matID < 3.5) {
    // Arms - pale with red membranes at joints
    col = FLESH_PALE;

    // Red membrane zones
    float membrane = abs(sin(p.y * 4.0 + uTime));
    if(membrane > 0.7) col = mix(col, ARTERIAL_RED, (membrane - 0.7) * 3.0);

  } else {
    // Environment - flesh walls
    col = mix(FLESH_PALE, DECAY_BROWN, 0.5);

    // Wet slime
    float wetness = noise5d(p * 3.0, v);
    col = mix(col, SLIME_GREEN, wetness * 0.4);
  }

  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

  // Camera orbits the creature, looking at torso center - zoomed out more
  float camAngle = uTime * 0.15;
  vec3 ro3d = vec3(
    10.0 * cos(camAngle),
    3.0 + sin(uTime * 0.3) * 1.5,
    10.0 * sin(camAngle)
  );
  vec3 ta3d = vec3(0.0, 0.5, 0.0); // Look at creature center mass

  vec3 ww = normalize(ta3d - ro3d);
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = normalize(cross(ww, uu));
  vec3 rd3d = normalize(uv.x * uu + uv.y * vv + 2.0 * ww);

  // 5D coordinates
  vec4 ro = vec4(ro3d, 0.0);
  vec4 rd = vec4(rd3d, 0.0);
  float v = sin(uTime * 0.2) * 1.5; // Travel through V dimension

  vec4 result = rayMarch(ro, rd, v);
  float d = result.x;
  float matID = result.y;

  // Organic atmospheric background
  vec3 col = mix(DECAY_BROWN, vec3(0.1, 0.08, 0.06), 0.5);

  if(d < MAX_DIST) {
    vec4 p = ro + rd * d;
    vec4 n = getNormal5D(p, v);

    col = getMaterial(p, n, matID, v);

    // Organic multi-source lighting
    vec4 light1 = normalize(vec4(3.0, 5.0, 2.0, 1.0));
    vec4 light2 = normalize(vec4(-2.0, 3.0, -1.0, -0.5));
    vec4 light3 = normalize(vec4(0.0, -2.0, 3.0, 1.5));

    float diff1 = max(dot(n, light1), 0.0);
    float diff2 = max(dot(n, light2), 0.0) * 0.4;
    float diff3 = max(dot(n, light3), 0.0) * 0.3;

    // Ambient for wet organic look
    float ambient = 0.3;

    // Subsurface scattering - flesh translucency
    vec4 viewDir = normalize(-rd);
    float sss = pow(max(dot(-n, light1), 0.0), 2.0);

    float lighting = ambient + diff1 + diff2 + diff3 + sss * 0.4;
    col *= lighting;

    // Wet specular highlights (slime)
    vec4 reflectDir = reflect(-light1, n);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
    col += SLIME_GREEN * spec * 0.5;

    // Fresnel rim light
    float fresnel = pow(1.0 - abs(dot(n, viewDir)), 3.0);
    col += ARTERIAL_RED * fresnel * 0.25;
  }

  // Organic atmospheric fog
  col = mix(col, DECAY_BROWN * 0.3, 1.0 - exp(-d * 0.12));

  // Pulsing ambient glow (creature's presence)
  col += CRIMSON_EYE * 0.05 * (0.5 + 0.5 * sin(uTime * 2.0));

  gl_FragColor = vec4(col, 1.0);
}
`;
