// 4D DIMENSIONAL OSSUARY
// Multiple 4D topological structures: Klein bottle passages, hyperbolic architecture,
// recursive tesseract catacombs - complex geometric systems with sophisticated materials

let ossuary;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ossuary = createShader(vert, frag);
  shader(ossuary);
  noStroke();
  pixelDensity(1);
}

function draw() {
  shader(ossuary);
  ossuary.setUniform('uResolution', [width, height]);
  ossuary.setUniform('uTime', millis() / 1000.0);
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
#define MAX_DIST 50.0
#define SURF_DIST 0.001
#define PI 3.14159265359

// OSSUARY PALETTE - ancient dimensional architecture
vec3 BONE_WHITE = vec3(0.92, 0.88, 0.82);
vec3 AGED_BONE = vec3(0.78, 0.72, 0.62);
vec3 MARROW_RED = vec3(0.65, 0.12, 0.15);
vec3 DECAY_GREEN = vec3(0.15, 0.42, 0.28);
vec3 VOID_PURPLE = vec3(0.18, 0.08, 0.25);
vec3 RUST_ORANGE = vec3(0.75, 0.35, 0.12);
vec3 ELECTRIC_CYAN = vec3(0.08, 0.72, 0.85);

mat2 rot2D(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// 4D rotations
mat4 rotXW(float a) {
  return mat4(
    cos(a), 0, 0, -sin(a),
    0, 1, 0, 0,
    0, 0, 1, 0,
    sin(a), 0, 0, cos(a)
  );
}

mat4 rotYZ(float a) {
  return mat4(
    1, 0, 0, 0,
    0, cos(a), -sin(a), 0,
    0, sin(a), cos(a), 0,
    0, 0, 0, 1
  );
}

mat4 rotZW(float a) {
  return mat4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, cos(a), -sin(a),
    0, 0, sin(a), cos(a)
  );
}

float hash41(vec4 p) {
  p = fract(p * vec4(443.897, 441.423, 437.195, 443.129));
  p += dot(p, p.wzxy + 19.19);
  return fract((p.x + p.y) * (p.z + p.w));
}

float noise4d(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n0000 = hash41(i);
  float n1000 = hash41(i + vec4(1.0, 0.0, 0.0, 0.0));
  float n0100 = hash41(i + vec4(0.0, 1.0, 0.0, 0.0));
  float n1100 = hash41(i + vec4(1.0, 1.0, 0.0, 0.0));

  float nx00 = mix(n0000, n1000, f.x);
  float nx10 = mix(n0100, n1100, f.x);

  return mix(nx00, nx10, f.y);
}

float fbm4d(vec4 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for(int i = 0; i < 4; i++) {
    value += amplitude * noise4d(p);
    p = p * 2.1;
    amplitude *= 0.48;
  }
  return value;
}

// KLEIN BOTTLE PASSAGE in 4D
// A non-orientable surface twisted through 4D space
float kleinBottlePassage(vec4 p) {
  // Rotate ONLY in XY plane - keeps structure at same W coordinate
  // NO XW or ZW rotations - those move it away from camera's W slice
  p.xy *= rot2D(uTime * 0.15);
  p.zw *= rot2D(uTime * 0.18);

  // Klein bottle centered at origin, fills space from -3 to +3
  float u = atan(p.x, p.y);
  float v = atan(p.z, p.w);

  // Klein bottle surface - BIG radius so it's always visible
  float r = 3.0 + cos(u) * 0.8;
  vec4 surface;
  surface.x = r * cos(u) * cos(v);
  surface.y = r * sin(u) * cos(v);
  surface.z = r * cos(u) * sin(v);
  surface.w = r * sin(u) * sin(v) + sin(u * 2.0) * 0.5; // 4D twist

  float dist = length(p - surface);

  // Add passage holes
  float holes = sin(u * 6.0) * sin(v * 4.0);
  dist -= holes * 0.15;

  // Eroded surface
  dist += fbm4d(p * 2.0) * 0.08;

  return dist;
}

// HYPERBOLIC ARCHITECTURE
// Curved negative-space chambers in 4D
float hyperbolicChambers(vec4 p) {
  // Rotate in YZ and XY - both keep W coordinate stable
  p *= rotYZ(uTime * 0.12);
  p.xy *= rot2D(uTime * 0.08);

  // Hyperbolic tiling pattern - BIG cells that fill space
  vec4 q = p;
  q.xy = abs(fract(q.xy / 6.0) - 0.5) * 6.0;
  q.zw = abs(fract(q.zw / 6.0) - 0.5) * 6.0;

  // Hyperbolic surfaces
  float hyp = length(q.xy) * length(q.zw) - 3.0;

  // Architectural details - thick columns
  vec4 cols = abs(fract(p / 3.0) - 0.5) * 3.0;
  float columns = length(cols.xy) - 0.3;
  columns = min(columns, length(cols.zw) - 0.3);

  float arch = max(hyp, -columns);

  // Add decay
  arch += noise4d(p * 2.0 + uTime * 0.1) * 0.08;

  return arch;
}

// RECURSIVE TESSERACT CATACOMBS
// Nested hypercubes forming burial chambers
float tesseractCatacombs(vec4 p) {
  // Rotate in XY and YZ - both keep W stable
  // NO XW, YW, or ZW - those move structure away from camera's W slice
  p.xy *= rot2D(uTime * 0.1);
  p *= rotYZ(uTime * 0.13);

  float catacombs = MAX_DIST;

  // Multiple nested tesseracts - BIG scales that fill space
  for(int i = 0; i < 3; i++) {
    float scale = 4.5 - float(i) * 1.2;
    vec4 q = p;

    // Tesseract distance field
    vec4 d = abs(q) - vec4(scale);
    float tesseract = min(max(max(max(d.x, d.y), d.z), d.w), 0.0) +
                      length(max(d, 0.0));

    // Make it hollow (burial chambers)
    tesseract = abs(tesseract) - 0.25;

    catacombs = min(catacombs, tesseract);
  }

  // Add skeletal structures inside chambers
  vec4 bones = abs(fract(p * 0.4) - 0.5) * 2.5;
  float skeleton = min(length(bones.xy), length(bones.zw)) - 0.15;

  catacombs = min(catacombs, skeleton);

  // Fractal detail
  catacombs += sin(p.x * 8.0) * sin(p.y * 8.0) * sin(p.z * 8.0) * sin(p.w * 8.0) * 0.02;

  return catacombs;
}

// DIMENSIONAL RIFTS
// Tears in 4D spacetime showing the void
float dimensionalRifts(vec4 p) {
  // Flowing rifts through 4D space
  float rift = abs(sin(p.x * 0.5 + uTime * 0.3) * cos(p.y * 0.5) *
                   sin(p.z * 0.5) * cos(p.w * 0.5 + uTime * 0.2)) - 0.3;

  // Rift edges are sharp
  rift = pow(max(rift, 0.0), 0.3);

  return rift;
}

// SCENE SDF - combine all structures
float sceneSDF(vec4 p) {
  float klein = kleinBottlePassage(p);
  float hyper = hyperbolicChambers(p);
  float catacombs = tesseractCatacombs(p);
  float rifts = dimensionalRifts(p);

  // Combine structures
  float scene = min(klein, hyper);
  scene = min(scene, catacombs);
  scene = max(scene, -rifts); // Rifts cut through everything

  return scene;
}

// 4D NORMAL CALCULATION
vec4 getNormal4D(vec4 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec4(
    sceneSDF(p + e.xyyy) - sceneSDF(p - e.xyyy),
    sceneSDF(p + e.yxyy) - sceneSDF(p - e.yxyy),
    sceneSDF(p + e.yyxy) - sceneSDF(p - e.yyxy),
    sceneSDF(p + e.yyyx) - sceneSDF(p - e.yyyx)
  ));
}

// RAY MARCH through 4D space
float rayMarch(vec4 ro, vec4 rd) {
  float dO = 0.0;
  for(int i = 0; i < MAX_STEPS; i++) {
    vec4 p = ro + rd * dO;
    float dS = sceneSDF(p);
    dO += dS;
    if(abs(dS) < SURF_DIST || dO > MAX_DIST) break;
  }
  return dO;
}

// SOPHISTICATED MATERIAL SYSTEM
vec3 getMaterial(vec4 p, vec4 n) {
  // Determine which structure we hit
  float kleinDist = abs(kleinBottlePassage(p));
  float hyperDist = abs(hyperbolicChambers(p));
  float catacombsDist = abs(tesseractCatacombs(p));
  float riftsDist = abs(dimensionalRifts(p));

  vec3 col = VOID_PURPLE;

  // Klein Bottle material - aged bone with decay
  if(kleinDist < 0.02) {
    float age = fbm4d(p * 2.0);
    col = mix(AGED_BONE, DECAY_GREEN, age * 0.4);

    // Add surface patterns from 4D twist
    float pattern = sin(p.x * 5.0 + p.w * 3.0) * cos(p.y * 5.0 + p.w * 2.0);
    col = mix(col, RUST_ORANGE, pattern * 0.3);
  }

  // Hyperbolic Architecture material - clean bone with electric traces
  if(hyperDist < 0.02) {
    col = BONE_WHITE;

    // Electric current traces along W dimension
    float current = abs(sin(p.w * 10.0 + uTime * 2.0));
    current = pow(current, 8.0);
    col = mix(col, ELECTRIC_CYAN, current * 0.7);

    // Architectural weathering
    float weather = noise4d(p * 4.0);
    col = mix(col, AGED_BONE, weather * 0.3);
  }

  // Catacomb material - marrow and bone
  if(catacombsDist < 0.02) {
    // Interior chambers are dark
    float depth = length(p) / 5.0;
    col = mix(MARROW_RED, BONE_WHITE, depth);

    // Skeletal structures
    vec4 bones = abs(fract(p * 0.5) - 0.5) * 2.0;
    float skeleton = min(length(bones.xy), length(bones.zw));
    if(skeleton < 0.1) {
      col = BONE_WHITE;
      col = mix(col, AGED_BONE, fbm4d(p * 3.0));
    }
  }

  // Rift material - void bleeding through
  if(riftsDist < 0.05) {
    col = VOID_PURPLE;

    // Rift edges glow
    float edge = 1.0 - smoothstep(0.0, 0.05, riftsDist);
    col = mix(col, ELECTRIC_CYAN, edge * 0.8);
    col = mix(col, MARROW_RED, edge * edge * 0.5);
  }

  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

  // Camera movement - multiple shot types that ALWAYS show geometry
  float camTime = uTime * 0.15;
  float shotCycle = mod(camTime, 40.0);

  vec3 ro3d, ta3d;

  if(shotCycle < 10.0) {
    // Shot 1: Wide orbit showing Klein bottle - closer now that structures are bigger
    float t = shotCycle / 10.0;
    float angle = t * 6.28;
    ro3d = vec3(8.0 * cos(angle), 3.0, 8.0 * sin(angle));
    ta3d = vec3(0.0, 0.0, 0.0);
  } else if(shotCycle < 20.0) {
    // Shot 2: Close approach to hyperbolic chambers
    float t = (shotCycle - 10.0) / 10.0;
    float angle = t * 3.14;
    ro3d = vec3(6.0 * cos(angle), 2.0 + sin(t * 6.28) * 1.5, 6.0 * sin(angle));
    ta3d = vec3(1.5 * cos(angle * 2.0), 0.0, 1.5 * sin(angle * 2.0));
  } else if(shotCycle < 30.0) {
    // Shot 3: Circling tesseract catacombs
    float t = (shotCycle - 20.0) / 10.0;
    float angle = t * 6.28 * 1.5;
    ro3d = vec3(7.0 * sin(angle), 2.5 * cos(t * 3.14), 7.0 * cos(angle));
    ta3d = vec3(0.0, 0.0, 0.0);
  } else {
    // Shot 4: Slow pullback revealing everything
    float t = (shotCycle - 30.0) / 10.0;
    float angle = t * 6.28;
    float dist = 8.0 + t * 4.0;
    ro3d = vec3(dist * cos(angle), 4.0 + t * 2.0, dist * sin(angle));
    ta3d = vec3(0.0, 0.0, 0.0);
  }

  vec3 ww = normalize(ta3d - ro3d);
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = normalize(cross(ww, uu));

  vec3 rd3d = normalize(uv.x * uu + uv.y * vv + 2.0 * ww);

  // Convert to 4D - W stays near 0 so geometry stays visible
  vec4 ro = vec4(ro3d, 0.0);
  vec4 rd = vec4(rd3d, 0.0);

  // NO 4D ray rotations - they make geometry disappear
  // The structures themselves rotate, that's enough

  float d = rayMarch(ro, rd);

  // Atmospheric background with glow to prevent pure black
  vec3 col = VOID_PURPLE * 0.25 + ELECTRIC_CYAN * 0.08;

  if(d < MAX_DIST) {
    vec4 p = ro + rd * d;
    vec4 n = getNormal4D(p);

    col = getMaterial(p, n);

    // SOPHISTICATED LIGHTING

    // Primary light - moving through W dimension
    vec4 light1 = normalize(vec4(3.0, 4.0, 2.0, sin(uTime * 0.3) * 3.0));
    float diff1 = max(dot(n, light1), 0.0);

    // Secondary light - opposite side
    vec4 light2 = normalize(vec4(-2.0, -1.0, 3.0, cos(uTime * 0.4) * 2.0));
    float diff2 = max(dot(n, light2), 0.0) * 0.5;

    // W-dimension lighting (4D specific)
    float wLight = abs(n.w) * 0.3;

    // Ambient occlusion
    float ao = 1.0;
    for(int i = 1; i <= 3; i++) {
      float dist = sceneSDF(p + n * float(i) * 0.1);
      ao -= (1.0 / float(i)) * max(0.0, float(i) * 0.1 - dist) * 2.0;
    }
    ao = max(ao, 0.0);

    // Combine lighting - higher ambient to prevent blackness
    float lighting = 0.45 + diff1 * 0.7 + diff2 * 0.35 + wLight;
    col *= lighting * (0.7 + ao * 0.3); // Soften AO impact

    // Specular highlights on bone
    vec4 viewDir = normalize(-rd);
    vec4 reflectDir = reflect(-light1, n);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    col += BONE_WHITE * spec * 0.4;

    // 4D fresnel effect
    float fresnel = pow(1.0 - abs(dot(n, viewDir)), 3.0);
    col += ELECTRIC_CYAN * fresnel * 0.2;

    // Subsurface scattering for bone
    float sss = pow(max(0.0, dot(n, -viewDir)), 2.0);
    col += MARROW_RED * sss * 0.15;
  }

  // Atmospheric depth
  col = mix(col, VOID_PURPLE * 0.2, 1.0 - exp(-d * 0.08));

  // Dimensional flickering
  col *= 0.95 + 0.05 * sin(uTime * 15.0 + uv.y * 50.0);

  // Subtle vignette
  float vignette = 1.0 - length(uv) * 0.3;
  col *= vignette;

  gl_FragColor = vec4(col, 1.0);
}
`;
