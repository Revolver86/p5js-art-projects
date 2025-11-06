// SHOT 20: 5D PENROSE FLESH LABYRINTH
// Living 5D Penrose tiling that has grown FLESH
// Non-repeating impossible geometry become BIOLOGICAL
// Mathematical perfection corrupted into meat

let labyrinth;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  labyrinth = createShader(vert, frag);
  shader(labyrinth);
  noStroke();
  pixelDensity(1);
}

function draw() {
  shader(labyrinth);
  labyrinth.setUniform('uResolution', [width, height]);
  labyrinth.setUniform('uTime', millis() / 1000.0);
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

#define MAX_STEPS 35
#define MAX_DIST 22.0
#define SURF_DIST 0.015
#define PI 3.14159265359
#define PHI 1.618033988749895

// DISEASED PENROSE FLESH SPECTRUM (8 colors)
vec3 VANTA_BLACK = vec3(0.02, 0.008, 0.03);
vec3 ARTERIAL_CRIMSON = vec3(0.72, 0.02, 0.04);
vec3 NECROTIC_PURPLE = vec3(0.29, 0.05, 0.31);
vec3 GANGRENOUS_GREEN = vec3(0.17, 0.32, 0.1);
vec3 BILE_YELLOW = vec3(0.56, 0.47, 0.09);
vec3 CORRUPTED_CYAN = vec3(0.1, 0.3, 0.32);
vec3 RUST_ORANGE = vec3(0.63, 0.25, 0.06);
vec3 BONE_WHITE = vec3(0.83, 0.78, 0.75);

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

// Simplified 3D noise for performance (using xyz from 5D point)
float noise3d(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n = hash51(vec4(i, 0.0), 0.0);
  return n;
}

// Multi-octave noise (2 octaves for performance)
float fbm3d(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  for(int i = 0; i < 2; i++) {
    val += amp * noise3d(p);
    p *= 2.1;
    amp *= 0.5;
  }
  return val;
}

// SMOOTH MIN - flesh connection between tiles
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// 5D RHOMBIC TILE SDF
float rhombicTileSDF(vec4 p, float v, float aspectRatio) {
  // Create rhombic structure using golden ratio proportions
  vec4 q = abs(p);

  // Rhombic dodecahedron in 4D extended to 5D
  float d = max(max(q.x, q.y), max(q.z, q.w)) - aspectRatio;
  d = max(d, abs(v) - aspectRatio * 0.8);

  // Add rhombic face cuts
  vec4 diag = (q.xyzw + q.yzwx) / sqrt(2.0);
  d = max(d, max(max(diag.x, diag.y), max(diag.z, diag.w)) - aspectRatio * PHI);

  return d;
}

// ORGANIC FLESH WARPING
vec4 organicWarp5D(vec4 p, float v, float seed, float time, out float vOut) {
  // Multi-scale warping
  float warp1 = fbm3d(p.xyz * 0.8 + seed);
  float warp2 = fbm3d(p.xzw * 1.2 + seed + 10.0);

  vec4 warped = p;
  warped.x += noise3d(p.yzw + time + seed) * warp1 * 0.3;
  warped.y += noise3d(p.xzw + time + seed + 5.0) * warp1 * 0.3;
  warped.z += noise3d(p.xyw + time + seed + 10.0) * warp2 * 0.3;
  warped.w += noise3d(p.xyz + time + seed + 15.0) * warp2 * 0.3;

  vOut = v + noise3d(p.xyz + time + seed + 20.0) * warp1 * 0.2;

  return warped;
}

// 5D PENROSE FLESH LABYRINTH SDF
vec4 penroseLabyrinthSDF(vec4 p, float v) {
  float minDist = MAX_DIST;
  float closestTileType = 0.0;
  float totalDeform = 0.0;

  // Breathing motion - whole labyrinth pulses
  float breathe = sin(uTime * 0.8) * 0.15;
  p *= (1.0 + breathe);

  // Tile grid scale
  float tileScale = 2.5;
  vec4 gridPos = p / tileScale;
  vec4 gridCell = floor(gridPos);

  // Evaluate nearby tiles only (spatial culling)
  for(int i = -1; i <= 1; i++) {
    for(int j = -1; j <= 1; j++) {
      for(int k = -1; k <= 1; k++) {
        vec4 cellOffset = vec4(float(i), float(j), float(k), 0.0);
        vec4 cell = gridCell + cellOffset;

        // Determine tile type based on cell position (aperiodic pattern)
        float tileHash = hash51(cell, v);
        float tileType = step(0.5, fract(tileHash * PHI)); // 0 or 1

        // Tile aspect ratio - thick vs thin
        float aspect = (tileType < 0.5) ? PHI : (1.0 / PHI);

        // Center of this tile in world space
        vec4 tileCenter = cell * tileScale;
        vec4 localPos = p - tileCenter;

        // Apply organic warping
        float vWarped;
        vec4 warpedPos = organicWarp5D(localPos, v, tileHash * 100.0, uTime * 0.5, vWarped);

        // Calculate tile distance
        float tileDist = rhombicTileSDF(warpedPos, vWarped - v, aspect);

        // Track deformation amount
        float deform = length(warpedPos - localPos);

        if(tileDist < minDist) {
          minDist = tileDist;
          closestTileType = tileType;
          totalDeform = deform;
        }
      }
    }
  }

  return vec4(minDist, closestTileType, totalDeform, 0.0);
}

// RAY MARCH
vec4 rayMarch(vec4 ro, vec4 rd, float v) {
  float dO = 0.0;
  vec4 result = vec4(0.0, 0.0, 0.0, 0.0);

  for(int i = 0; i < MAX_STEPS; i++) {
    vec4 p = ro + rd * dO;
    vec4 data = penroseLabyrinthSDF(p, v);
    float dS = data.x;

    dO += dS;
    result = data;

    if(abs(dS) < SURF_DIST || dO > MAX_DIST) break;
  }

  result.x = dO;
  return result;
}

// 5D NORMAL
vec4 getNormal5D(vec4 p, float v) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec4(
    penroseLabyrinthSDF(p + e.xyyy, v).x - penroseLabyrinthSDF(p - e.xyyy, v).x,
    penroseLabyrinthSDF(p + e.yxyy, v).x - penroseLabyrinthSDF(p - e.yxyy, v).x,
    penroseLabyrinthSDF(p + e.yyxy, v).x - penroseLabyrinthSDF(p - e.yyxy, v).x,
    penroseLabyrinthSDF(p + e.yyyx, v).x - penroseLabyrinthSDF(p - e.yyyx, v).x
  ));
}

// MATERIAL SYSTEM - 8 Color Diseased Flesh
vec3 getMaterial(vec4 p, vec4 n, float tileType, float deform, float v) {
  vec3 baseColor;

  // Base color by tile type
  if(tileType < 0.5) {
    baseColor = BILE_YELLOW; // Thick tiles
  } else {
    baseColor = NECROTIC_PURPLE; // Thin tiles
  }

  // W-dimension depth modulation
  float wDepth = abs(p.w) * 0.2;
  baseColor = mix(baseColor, RUST_ORANGE, wDepth);

  // V-dimension depth
  float vDepth = abs(v) * 0.15;
  baseColor = mix(baseColor, NECROTIC_PURPLE, vDepth);

  // Deformation-based color shift
  if(deform > 0.2) {
    baseColor = mix(baseColor, GANGRENOUS_GREEN, (deform - 0.2) * 2.0);
  }

  // Surface vein network
  float veins = fbm3d(p.xyz * 8.0);
  veins = pow(veins, 3.0);
  baseColor = mix(baseColor, ARTERIAL_CRIMSON, veins * 0.6);

  // Cellular texture
  float cells = fbm3d(p.xzw * 12.0 + uTime * 0.1);
  cells = smoothstep(0.4, 0.6, cells);
  baseColor = mix(baseColor, BONE_WHITE, cells * 0.3);

  // Edge highlighting - detect edges via normal variation
  vec4 edgeTest = abs(n);
  float edgeness = max(max(edgeTest.x, edgeTest.y), max(edgeTest.z, edgeTest.w));
  if(edgeness > 0.9) {
    baseColor = mix(baseColor, ARTERIAL_CRIMSON, 0.6);
  }

  // Regional variation based on position
  float regionHash = noise3d(floor(p.xyz / 6.0));

  // Arterial zones - more red
  if(regionHash < 0.25) {
    baseColor = mix(baseColor, ARTERIAL_CRIMSON, 0.4);
  }
  // Infected cores - green glow
  else if(regionHash < 0.5) {
    baseColor = mix(baseColor, GANGRENOUS_GREEN, 0.5);
    baseColor *= 1.3; // Brighter
  }
  // Skeletal regions - bone exposed
  else if(regionHash < 0.75) {
    baseColor = mix(baseColor, BONE_WHITE, 0.5);
  }
  // Necrotic default

  return baseColor;
}

// VOLUMETRIC FOG (6 samples)
vec3 volumetricFog(vec4 ro, vec4 rd, float v, float marchDist) {
  vec3 fog = vec3(0.0, 0.0, 0.0);
  float stepSize = marchDist / 6.0;

  for(int i = 0; i < 6; i++) {
    float dist = float(i) * stepSize;
    vec4 p = ro + rd * dist;

    // Fog density increases in narrow spaces
    float density = noise3d(p.xyz * 0.5 + uTime * 0.1);
    density = smoothstep(0.3, 0.7, density);

    // Fog color - purple/green mix
    vec3 fogColor = mix(NECROTIC_PURPLE, GANGRENOUS_GREEN, density);
    fog += fogColor * density * 0.08;
  }

  return fog;
}

// ELECTRICAL DISCHARGE along vertices
vec3 electricalDischarge(vec4 p, float v) {
  // Detect vertices - where tiles meet
  vec4 gridPos = p / 2.5;
  vec4 nearVertex = fract(gridPos) - vec4(0.5, 0.5, 0.5, 0.5);
  float distToVertex = length(nearVertex);

  if(distToVertex < 0.3) {
    float discharge = sin(distToVertex * 20.0 - uTime * 10.0) * 0.5 + 0.5;
    discharge = pow(discharge, 4.0);
    return CORRUPTED_CYAN * discharge * 0.5;
  }

  return vec3(0.0, 0.0, 0.0);
}

// CAMERA CHOREOGRAPHY - 60 second loop, 6 distinct shots
void getCamera(float time, out vec3 ro, out vec3 ta, out float vCoord, out float roll) {
  float cycle = mod(time, 60.0);
  roll = 0.0;

  if(cycle < 10.0) {
    // SHOT 1: Arterial Corridor Dolly (0-10s)
    float t = cycle / 10.0;
    ro = vec3(0.0, 0.0, -15.0 + t * 30.0); // Fast forward
    ta = vec3(0.0, 0.0, ro.z + 5.0);
    vCoord = sin(time * 0.3) * 0.5;
    roll = sin(t * PI) * 0.15; // Subtle roll

  } else if(cycle < 20.0) {
    // SHOT 2: Spiral Descent (10-20s)
    float t = (cycle - 10.0) / 10.0;
    float angle = t * PI * 4.0; // 2 full spirals
    float radius = 3.0 - t * 2.0; // Spiral in
    ro = vec3(cos(angle) * radius, 10.0 - t * 20.0, sin(angle) * radius);
    ta = vec3(0.0, ro.y - 5.0, 0.0);
    vCoord = t * 2.0;
    roll = angle * 0.2;

  } else if(cycle < 32.0) {
    // SHOT 3: Multi-Angle Orbit (20-32s)
    float t = (cycle - 20.0) / 12.0;
    float angle = t * PI * 3.0; // 1.5 revolutions
    float radius = 8.0 + sin(t * PI * 2.0) * 2.0; // Varying radius
    float height = sin(t * PI) * 4.0;
    ro = vec3(cos(angle) * radius, height, sin(angle) * radius);
    ta = vec3(0.0, 0.0, 0.0);
    vCoord = cos(time * 0.2) * 1.5;

  } else if(cycle < 42.0) {
    // SHOT 4: Lateral Tracking (32-42s)
    float t = (cycle - 32.0) / 10.0;
    ro = vec3(-10.0 + t * 20.0, 2.0, 5.0); // Side to side
    ta = vec3(ro.x, ro.y, ro.z + 3.0);
    vCoord = sin(time * 0.4) * 1.0;

  } else if(cycle < 52.0) {
    // SHOT 5: Dive Through Membrane (42-52s)
    float t = (cycle - 42.0) / 10.0;
    float accel = t * t; // Acceleration
    ro = vec3(0.0, 0.0, -10.0 + accel * 25.0);
    ta = vec3(0.0, 0.0, ro.z + 8.0);
    vCoord = t * 3.0; // Dimensional shift during dive
    roll = t * PI * 0.5; // Rolling through

  } else {
    // SHOT 6: Rapid Cut Montage (52-60s)
    float t = (cycle - 52.0) / 8.0;
    float cutIndex = floor(t * 5.0); // 5 cuts

    if(cutIndex == 0.0) {
      // Extreme close-up
      ro = vec3(2.0, 1.0, 2.0);
      ta = vec3(2.5, 1.0, 2.0);
    } else if(cutIndex == 1.0) {
      // Wide shot
      ro = vec3(0.0, 15.0, 15.0);
      ta = vec3(0.0, 0.0, 0.0);
    } else if(cutIndex == 2.0) {
      // Vertex junction
      ro = vec3(3.0, 3.0, 3.0);
      ta = vec3(2.5, 2.5, 2.5);
    } else if(cutIndex == 3.0) {
      // Morphing texture
      ro = vec3(-5.0, 0.0, 5.0);
      ta = vec3(-4.0, 0.0, 5.0);
    } else {
      // Return to corridor
      ro = vec3(0.0, 0.0, -10.0);
      ta = vec3(0.0, 0.0, -5.0);
    }

    vCoord = sin(time * 0.5 + cutIndex) * 1.0;
  }
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

  // Get camera for current time
  vec3 ro3d, ta3d;
  float vCoord, roll;
  getCamera(uTime, ro3d, ta3d, vCoord, roll);

  // Camera basis with roll
  vec3 ww = normalize(ta3d - ro3d);
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = normalize(cross(ww, uu));

  // Apply roll
  vec2 uvRolled = uv;
  uvRolled = rot2D(roll) * uvRolled;

  vec3 rd3d = normalize(uvRolled.x * uu + uvRolled.y * vv + 1.5 * ww);

  // 5D coordinates
  vec4 ro = vec4(ro3d, 0.0);
  vec4 rd = vec4(rd3d, 0.0);

  // Ray march
  vec4 result = rayMarch(ro, rd, vCoord);
  float d = result.x;
  float tileType = result.y;
  float deform = result.z;

  // Background - vanta black with purple atmospheric perspective
  vec3 col = VANTA_BLACK + NECROTIC_PURPLE * 0.15;

  // Volumetric fog
  col += volumetricFog(ro, rd, vCoord, min(d, MAX_DIST));

  if(d < MAX_DIST) {
    vec4 p = ro + rd * d;
    vec4 n = getNormal5D(p, vCoord);

    // Get material
    col = getMaterial(p, n, tileType, deform, vCoord);

    // Lighting - multiple harsh sources
    vec4 light1 = normalize(vec4(3.0, 4.0, 2.0, 1.0));
    vec4 light2 = normalize(vec4(-2.0, 2.0, -1.0, -0.5));

    float diff1 = max(dot(n, light1), 0.0);
    float diff2 = max(dot(n, light2), 0.0);

    float ambient = 0.25;
    col *= ambient + diff1 * 0.8 + diff2 * 0.4;

    // Electrical discharge
    col += electricalDischarge(p, vCoord);

    // Specular highlight - wet flesh
    vec4 viewDir = normalize(-rd);
    vec4 reflectDir = reflect(-light1, n);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
    col += CORRUPTED_CYAN * spec * 0.4;

    // Fresnel rim - edge glow
    float fresnel = pow(1.0 - abs(dot(n, viewDir)), 3.0);
    col += ARTERIAL_CRIMSON * fresnel * 0.3;
  }

  // Atmospheric fog depth
  col = mix(col, NECROTIC_PURPLE * 0.3, 1.0 - exp(-d * 0.08));

  // Breathing ambient pulse
  col *= 0.95 + 0.05 * sin(uTime * 0.8);

  gl_FragColor = vec4(col, 1.0);
}
`;
