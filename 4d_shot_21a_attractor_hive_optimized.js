// SHOT 21A: 5D Parasitic Attractor Hive (OPTIMIZED)
// Key fix: Cache all entity positions ONCE per pixel, reuse throughout shader
// No more calling getEntity() hundreds of times

let attractorShader;

function preload() {}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  attractorShader = createShader(vertexShader(), fragmentShader());
  shader(attractorShader);
  noStroke();
}

function draw() {
  attractorShader.setUniform('u_resolution', [width, height]);
  attractorShader.setUniform('u_time', millis() / 1000.0);

  rect(-width/2, -height/2, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function vertexShader() {
  return `
    precision highp float;
    attribute vec3 aPosition;
    void main() {
      vec4 positionVec4 = vec4(aPosition, 1.0);
      positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
      gl_Position = positionVec4;
    }
  `;
}

function fragmentShader() {
  return `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;

    #define PI 3.14159265359
    #define TAU 6.28318530718

    #define MAX_STEPS 25
    #define MAX_DIST 25.0
    #define SURF_DIST 0.02

    #define NUM_ENTITIES 4

    // === UTILITY ===

    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    vec3 hash3(vec3 p) {
      p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
               dot(p, vec3(269.5, 183.3, 246.1)),
               dot(p, vec3(113.5, 271.9, 124.6)));
      return fract(sin(p) * 43758.5453123);
    }

    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n = i.x + i.y * 157.0 + 113.0 * i.z;
      return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                     mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
                 mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                     mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
    }

    mat2 rot2D(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }

    // === 5D LORENZ ATTRACTOR ===

    vec4 integrateLorenz(vec4 p, float v, float dt, out float vOut) {
      const float sigma = 10.0;
      const float rho = 28.0;
      const float beta = 2.667;

      vec4 deriv;
      deriv.x = sigma * (p.y - p.x) + 0.3 * (p.w - v);
      deriv.y = p.x * (rho - p.z) - p.y + 0.2 * (v * p.w);
      deriv.z = p.x * p.y - beta * p.z + 0.15 * (p.w * p.w - v * v);
      deriv.w = 0.25 * (p.x * p.z - p.w) + 0.18 * (v - p.y);

      vOut = v + (0.25 * (p.y * p.w - v) + 0.2 * (p.z - p.x)) * dt;

      return p + deriv * dt;
    }

    // Calculate entity position (called ONCE per entity per frame)
    vec3 calcEntityPos(int id, float time) {
      float seed = float(id) * 123.456;

      vec4 pos = vec4(
        hash(seed + 10.0) * 2.0 - 1.0,
        hash(seed + 20.0) * 2.0 - 1.0,
        hash(seed + 30.0) * 2.0 - 1.0,
        hash(seed + 40.0) * 2.0 - 1.0
      ) * 5.0;
      float v = (hash(seed + 50.0) * 2.0 - 1.0) * 5.0;
      float phase = hash(seed + 60.0) * TAU;

      float t = time + phase;
      float dt = 0.03;
      int steps = int(mod(t / dt, 60.0));

      for (int i = 0; i < 60; i++) {
        if (i >= steps) break;
        float vOut;
        pos = integrateLorenz(pos, v, dt, vOut);
        v = vOut;
      }

      float scale = 0.28 + hash(seed) * 0.12;
      return pos.xyz * scale;
    }

    // === SCENE BUILDING ===

    float sphereSDF(vec3 p, vec3 center, float radius) {
      return length(p - center) - radius;
    }

    float smin(float a, float b, float k) {
      float h = max(k - abs(a - b), 0.0) / k;
      return min(a, b) - h * h * k * 0.25;
    }

    float tubeSDF(vec3 p, vec3 a, vec3 b, float r) {
      vec3 pa = p - a, ba = b - a;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      return length(pa - ba * h) - r;
    }

    // Build organic attractor body
    float attractorBodySDF(vec3 p, vec3 center, float time, float seed) {
      vec3 toCenter = p - center;

      // Core sphere
      float d = length(toCenter) - 0.6;

      // Add 4 tentacles radiating out
      for (int i = 0; i < 4; i++) {
        float angle = float(i) * PI * 0.5 + time * 0.5 + seed;
        vec3 tentacleDir = vec3(cos(angle), sin(angle + time), sin(angle * 0.7));
        tentacleDir = normalize(tentacleDir);

        vec3 tentacleStart = center + tentacleDir * 0.4;
        vec3 tentacleEnd = center + tentacleDir * 2.5;

        // Make tentacles writhe
        float writhe = sin(time * 2.0 + seed + float(i)) * 0.3;
        tentacleEnd += vec3(sin(time + seed), cos(time * 1.3 + seed), sin(time * 0.8)) * writhe;

        float tentacleThickness = 0.15;
        float tentacleD = tubeSDF(p, tentacleStart, tentacleEnd, tentacleThickness);

        d = smin(d, tentacleD, 0.3);
      }

      // Organic warping
      float warp = noise(p * 1.5 + seed + time * 0.2) * 0.2;
      d += warp;

      return d;
    }

    // Scene with cached positions
    float sceneSDF(vec3 p, float time, vec3 entPos[NUM_ENTITIES], out int hitID) {
      float d = MAX_DIST;
      hitID = -1;

      for (int i = 0; i < NUM_ENTITIES; i++) {
        float seed = float(i) * 123.456;
        float entD = attractorBodySDF(p, entPos[i], time, seed);

        if (entD < d) {
          d = entD;
          hitID = i;
        }
      }

      return d;
    }

    // === RAY MARCHING ===

    float march(vec3 ro, vec3 rd, float time, vec3 entPos[NUM_ENTITIES], out int hitID) {
      float dO = 0.0;
      hitID = -1;

      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneSDF(p, time, entPos, hitID);
        dO += dS;

        if (dS < SURF_DIST || dO > MAX_DIST) break;
      }

      return dO;
    }

    vec3 calcNormal(vec3 p, float time, vec3 entPos[NUM_ENTITIES]) {
      int dummy;
      float d = sceneSDF(p, time, entPos, dummy);
      vec2 e = vec2(0.001, 0.0);
      vec3 n = d - vec3(
        sceneSDF(p - e.xyy, time, entPos, dummy),
        sceneSDF(p - e.yxy, time, entPos, dummy),
        sceneSDF(p - e.yyx, time, entPos, dummy)
      );
      return normalize(n);
    }

    // === MAIN ===

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      float time = u_time;

      // === CACHE ALL ENTITY POSITIONS (ONCE!) ===
      vec3 entityPositions[NUM_ENTITIES];
      for (int i = 0; i < NUM_ENTITIES; i++) {
        entityPositions[i] = calcEntityPos(i, time);
      }

      // Simple orbit camera
      float radius = 10.0;
      float angle = time * 0.25;
      vec3 ro = vec3(
        cos(angle) * radius,
        sin(time * 0.18) * 4.0,
        sin(angle) * radius
      );
      vec3 lookAt = vec3(0.0, 0.0, 0.0);

      vec3 forward = normalize(lookAt - ro);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
      vec3 up = cross(forward, right);

      float fov = 75.0 * PI / 180.0;
      vec3 rd = normalize(forward + tan(fov * 0.5) * (uv.x * right + uv.y * up));

      // Ray march (using cached positions)
      int hitID;
      float d = march(ro, rd, time, entityPositions, hitID);

      vec3 col = vec3(0.05, 0.02, 0.08);  // Purple void

      if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 normal = calcNormal(p, time, entityPositions);

        // Color by entity
        vec3 baseCol;
        if (hitID == 0) {
          baseCol = vec3(0.608, 0.059, 0.075);  // Crimson
        } else if (hitID == 1) {
          baseCol = vec3(0.239, 0.071, 0.271);  // Necrotic purple
        } else if (hitID == 2) {
          baseCol = vec3(0.169, 0.561, 0.110);  // Toxic green
        } else {
          baseCol = vec3(0.094, 0.639, 0.710);  // Cyan
        }

        // Lighting
        vec3 lightDir1 = normalize(vec3(0.5, 0.7, -0.3));
        vec3 lightDir2 = normalize(vec3(-0.3, -0.5, 0.8));
        float diff1 = max(dot(normal, lightDir1), 0.0);
        float diff2 = max(dot(normal, lightDir2), 0.0) * 0.4;
        float diff = diff1 + diff2 + 0.3;

        col = baseCol * diff;

        // Rim light
        float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
        col += vec3(0.094, 0.639, 0.710) * rim * 0.5;

        // Subtle subsurface scattering
        float sss = pow(max(dot(normal, -lightDir1), 0.0), 2.0);
        col += baseCol * sss * 0.3;
      }

      // Simple atmospheric fog
      float fogAmount = smoothstep(8.0, MAX_DIST, d);
      vec3 fogCol = mix(
        vec3(0.08, 0.03, 0.12),  // Purple fog near
        vec3(0.05, 0.02, 0.08),  // Darker fog far
        fogAmount
      );
      col = mix(col, fogCol, fogAmount * 0.7);

      // Vignette
      float vignette = 1.0 - length(uv) * 0.25;
      col *= vignette;

      // Tone mapping
      col = col / (col + 1.0);
      col = pow(col, vec3(0.85));

      gl_FragColor = vec4(col, 1.0);
    }
  `;
}
