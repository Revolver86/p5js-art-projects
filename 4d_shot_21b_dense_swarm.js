// SHOT 21B: Dense Parasitic Attractor Swarm
// Multiple unique organism models filling the screen
// Dynamic animated background

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

    #define MAX_STEPS 30
    #define MAX_DIST 30.0
    #define SURF_DIST 0.02

    #define NUM_ENTITIES 8

    // Model types
    #define MODEL_TENTACLES 0
    #define MODEL_SEGMENTED 1
    #define MODEL_SPIRAL 2
    #define MODEL_SPIKY 3
    #define MODEL_CLUSTER 4

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

    // Calculate entity position (cached)
    vec3 calcEntityPos(int id, float time) {
      float seed = float(id) * 123.456;

      vec4 pos = vec4(
        hash(seed + 10.0) * 2.0 - 1.0,
        hash(seed + 20.0) * 2.0 - 1.0,
        hash(seed + 30.0) * 2.0 - 1.0,
        hash(seed + 40.0) * 2.0 - 1.0
      ) * 6.0;
      float v = (hash(seed + 50.0) * 2.0 - 1.0) * 6.0;
      float phase = hash(seed + 60.0) * TAU;

      float t = time * 0.8 + phase;  // Slower evolution
      float dt = 0.03;
      int steps = int(mod(t / dt, 50.0));

      for (int i = 0; i < 50; i++) {
        if (i >= steps) break;
        float vOut;
        pos = integrateLorenz(pos, v, dt, vOut);
        v = vOut;
      }

      float scale = 0.4 + hash(seed) * 0.2;
      return pos.xyz * scale;
    }

    // Get model type for entity
    int getModelType(int id) {
      float h = hash(float(id) * 456.789);
      if (h < 0.25) return MODEL_TENTACLES;
      if (h < 0.45) return MODEL_SEGMENTED;
      if (h < 0.65) return MODEL_SPIRAL;
      if (h < 0.85) return MODEL_SPIKY;
      return MODEL_CLUSTER;
    }

    // === SDF PRIMITIVES ===

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

    // === ORGANISM MODELS ===

    // Model 1: Tentacled mass
    float tentacleModel(vec3 p, vec3 center, float time, float seed) {
      float d = sphereSDF(p, center, 0.7);

      for (int i = 0; i < 6; i++) {
        float angle = float(i) * TAU / 6.0 + seed;
        vec3 dir = vec3(cos(angle), sin(angle + time * 0.5), sin(angle * 1.3));
        dir = normalize(dir);

        vec3 start = center + dir * 0.5;
        vec3 end = center + dir * (2.0 + sin(time + seed + float(i)) * 0.5);

        float tentacleD = tubeSDF(p, start, end, 0.12);
        d = smin(d, tentacleD, 0.25);
      }

      d += noise(p * 2.0 + seed) * 0.15;
      return d;
    }

    // Model 2: Segmented worm
    float segmentedModel(vec3 p, vec3 center, float time, float seed) {
      float d = 1e10;

      for (int i = 0; i < 8; i++) {
        float t = float(i) / 8.0;
        vec3 offset = vec3(
          sin(t * TAU + time + seed) * 0.5,
          cos(t * PI * 2.0 + time * 0.7) * 0.3,
          t * 3.0 - 1.5
        );
        vec3 segCenter = center + offset;
        float segRadius = 0.3 + sin(t * PI) * 0.15;
        float segD = sphereSDF(p, segCenter, segRadius);
        d = smin(d, segD, 0.3);
      }

      d += noise(p * 3.0 + seed + time * 0.2) * 0.1;
      return d;
    }

    // Model 3: Spiral shell
    float spiralModel(vec3 p, vec3 center, float time, float seed) {
      vec3 q = p - center;
      q.xy *= rot2D(time * 0.3 + seed);

      float d = 1e10;
      for (int i = 0; i < 10; i++) {
        float t = float(i) / 10.0;
        float angle = t * TAU * 2.0;
        float radius = t * 1.5;
        vec3 spiralPos = vec3(
          cos(angle) * radius,
          sin(angle) * radius,
          t * 2.0 - 1.0
        );
        float shellRadius = 0.2 + t * 0.15;
        float spiralD = sphereSDF(q, spiralPos, shellRadius);
        d = smin(d, spiralD, 0.2);
      }

      d += noise(q * 2.5 + seed) * 0.12;
      return d;
    }

    // Model 4: Spiky mass
    float spikyModel(vec3 p, vec3 center, float time, float seed) {
      float d = sphereSDF(p, center, 0.6);

      for (int i = 0; i < 12; i++) {
        float phi = float(i) * PI / 6.0;
        float theta = float(i) * TAU / 12.0 + time * 0.2;
        vec3 spikeDir = vec3(
          sin(phi) * cos(theta),
          sin(phi) * sin(theta),
          cos(phi)
        );

        vec3 spikeStart = center + spikeDir * 0.5;
        vec3 spikeEnd = center + spikeDir * (1.5 + sin(time * 2.0 + seed + float(i)) * 0.3);

        float spikeD = tubeSDF(p, spikeStart, spikeEnd, 0.08);
        d = min(d, spikeD);
      }

      d += noise(p * 2.5 + seed) * 0.1;
      return d;
    }

    // Model 5: Bulbous cluster
    float clusterModel(vec3 p, vec3 center, float time, float seed) {
      float d = sphereSDF(p, center, 0.5);

      for (int i = 0; i < 8; i++) {
        float angle = float(i) * TAU / 8.0 + time * 0.3 + seed;
        vec3 bulbPos = center + vec3(
          cos(angle) * 0.8,
          sin(angle * 1.3) * 0.7,
          sin(angle) * 0.8
        );
        float bulbSize = 0.35 + sin(time + float(i) + seed) * 0.1;
        float bulbD = sphereSDF(p, bulbPos, bulbSize);
        d = smin(d, bulbD, 0.3);
      }

      d += noise(p * 2.0 + seed + time * 0.1) * 0.15;
      return d;
    }

    // Route to correct model
    float organismSDF(vec3 p, vec3 center, int modelType, float time, float seed) {
      if (modelType == MODEL_TENTACLES) return tentacleModel(p, center, time, seed);
      if (modelType == MODEL_SEGMENTED) return segmentedModel(p, center, time, seed);
      if (modelType == MODEL_SPIRAL) return spiralModel(p, center, time, seed);
      if (modelType == MODEL_SPIKY) return spikyModel(p, center, time, seed);
      return clusterModel(p, center, time, seed);
    }

    // === BACKGROUND ===

    float backgroundNebula(vec3 p, float time) {
      float n = 0.0;
      n += noise(p * 0.3 + time * 0.05) * 0.5;
      n += noise(p * 0.8 - time * 0.08) * 0.25;
      n += noise(p * 1.5 + time * 0.1) * 0.125;
      return n;
    }

    // === SCENE ===

    float sceneSDF(vec3 p, float time, vec3 entPos[NUM_ENTITIES], out int hitID) {
      float d = MAX_DIST;
      hitID = -1;

      for (int i = 0; i < NUM_ENTITIES; i++) {
        float seed = float(i) * 123.456;
        int modelType = getModelType(i);
        float entD = organismSDF(p, entPos[i], modelType, time, seed);

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

    // === COLOR PALETTE ===

    vec3 getEntityColor(int id) {
      float h = hash(float(id) * 234.567);
      if (h < 0.15) return vec3(0.608, 0.059, 0.075);  // Crimson
      if (h < 0.30) return vec3(0.239, 0.071, 0.271);  // Purple
      if (h < 0.45) return vec3(0.169, 0.561, 0.110);  // Green
      if (h < 0.60) return vec3(0.094, 0.639, 0.710);  // Cyan
      if (h < 0.75) return vec3(0.722, 0.635, 0.082);  // Yellow
      if (h < 0.90) return vec3(0.722, 0.271, 0.063);  // Orange
      return vec3(0.8, 0.75, 0.7);  // Bone
    }

    // === MAIN ===

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      float time = u_time;

      // === CACHE POSITIONS ===
      vec3 entityPositions[NUM_ENTITIES];
      for (int i = 0; i < NUM_ENTITIES; i++) {
        entityPositions[i] = calcEntityPos(i, time);
      }

      // Closer orbit camera
      float radius = 7.0;
      float angle = time * 0.3;
      vec3 ro = vec3(
        cos(angle) * radius,
        sin(time * 0.22) * 3.0,
        sin(angle) * radius
      );
      vec3 lookAt = vec3(0.0, 0.0, 0.0);

      vec3 forward = normalize(lookAt - ro);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
      vec3 up = cross(forward, right);

      float fov = 85.0 * PI / 180.0;  // Wider FOV
      vec3 rd = normalize(forward + tan(fov * 0.5) * (uv.x * right + uv.y * up));

      // Dynamic background
      float bgNebula = backgroundNebula(rd * 5.0, time);
      vec3 bgCol = mix(
        vec3(0.05, 0.02, 0.08),   // Deep purple
        vec3(0.12, 0.05, 0.15),   // Lighter purple
        bgNebula * 0.6
      );

      // Add moving clouds
      float clouds = noise(rd * 8.0 + time * 0.2);
      bgCol += vec3(0.08, 0.03, 0.1) * clouds * 0.3;

      // Distant particle field
      float particles = 0.0;
      for (int i = 0; i < 20; i++) {
        vec3 particlePos = hash3(vec3(float(i), 0.0, 0.0)) * 20.0 - 10.0;
        particlePos.xy *= rot2D(time * 0.5 + float(i));
        vec3 particleDir = normalize(particlePos);
        float alignment = max(dot(rd, particleDir), 0.0);
        particles += pow(alignment, 150.0) * 0.5;
      }
      bgCol += vec3(0.094, 0.639, 0.710) * particles;

      vec3 col = bgCol;

      // Ray march
      int hitID;
      float d = march(ro, rd, time, entityPositions, hitID);

      if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 normal = calcNormal(p, time, entityPositions);

        vec3 baseCol = getEntityColor(hitID);

        // Multi-light
        vec3 light1 = normalize(vec3(0.5, 0.7, -0.3));
        vec3 light2 = normalize(vec3(-0.4, -0.3, 0.8));
        vec3 light3 = normalize(vec3(0.0, -1.0, 0.0));

        float diff1 = max(dot(normal, light1), 0.0);
        float diff2 = max(dot(normal, light2), 0.0) * 0.5;
        float diff3 = max(dot(normal, light3), 0.0) * 0.3;
        float diff = diff1 + diff2 + diff3 + 0.2;

        col = baseCol * diff;

        // Rim
        float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
        col += vec3(0.094, 0.639, 0.710) * rim * 0.6;

        // SSS
        float sss = pow(max(dot(normal, -light1), 0.0), 2.0);
        col += baseCol * sss * 0.4;

        // Atmospheric scattering
        float scatter = smoothstep(0.0, MAX_DIST * 0.5, d);
        col = mix(col, bgCol, scatter * 0.5);
      }

      // Vignette
      float vignette = 1.0 - length(uv) * 0.2;
      col *= vignette;

      // Tone mapping
      col = col / (col + 1.0);
      col = pow(col, vec3(0.85));

      gl_FragColor = vec4(col, 1.0);
    }
  `;
}
