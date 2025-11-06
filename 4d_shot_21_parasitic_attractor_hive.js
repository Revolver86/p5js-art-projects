// SHOT 21: 5D PARASITIC ATTRACTOR HIVE
// Strange attractors extended to 5D and made into living parasitic organisms
// Multiple attractor species (Lorenz, Rössler, Hénon) swimming through dimensional chaos
// Synaptic lightning connecting them into distributed consciousness
// Deterministic horror - trapped infinity that never repeats but never escapes

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
  attractorShader.setUniform('u_mouse', [mouseX / width, 1.0 - mouseY / height]);

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
    uniform vec2 u_mouse;

    #define PI 3.14159265359
    #define TAU 6.28318530718
    #define PHI 1.618033988749895

    #define MAX_STEPS 35
    #define MAX_DIST 35.0
    #define SURF_DIST 0.015
    #define EPSILON 0.001

    #define NUM_ENTITIES 9
    #define SYNAPSE_THRESHOLD 3.5
    #define MAX_SYNAPSES 15

    // Species IDs
    #define SPECIES_LORENZ 0
    #define SPECIES_ROSSLER 1
    #define SPECIES_HENON 2

    // === UTILITY FUNCTIONS ===

    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }

    float hash2(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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

    // === 5D ATTRACTOR INTEGRATION ===

    struct Attractor5D {
      vec4 pos;  // xyz + w
      float v;   // 5th dimension
      int species;
      float phase;
      float scale;
    };

    // 5D Lorenz integration (butterfly chaos)
    vec4 integrate5DLorenz(vec4 p, float v, float dt, out float vOut) {
      const float sigma = 10.0;
      const float rho = 28.0;
      const float beta = 2.667;
      const float eps1 = 0.3, eps2 = 0.2, eps3 = 0.15;
      const float eps4 = 0.25, eps5 = 0.18;

      vec4 deriv;
      deriv.x = sigma * (p.y - p.x) + eps1 * (p.w - v);
      deriv.y = p.x * (rho - p.z) - p.y + eps2 * (v * p.w);
      deriv.z = p.x * p.y - beta * p.z + eps3 * (p.w * p.w - v * v);
      deriv.w = eps4 * (p.x * p.z - p.w) + eps5 * (v - p.y);

      vOut = v + (eps4 * (p.y * p.w - v) + eps2 * (p.z - p.x)) * dt;

      return p + deriv * dt;
    }

    // 5D Rössler integration (spiral shell chaos)
    vec4 integrate5DRossler(vec4 p, float v, float dt, out float vOut) {
      const float a = 0.2;
      const float b = 0.2;
      const float c = 5.7;
      const float eps1 = 0.25, eps2 = 0.15, eps3 = 0.3;

      vec4 deriv;
      deriv.x = -p.y - p.z + eps1 * p.w;
      deriv.y = p.x + a * p.y + eps2 * v;
      deriv.z = b + p.z * (p.x - c) + eps3 * (v - p.w);
      deriv.w = eps1 * (p.x - p.w) + eps2 * (p.y * v);

      vOut = v + (eps3 * (p.z - v) + eps1 * p.x * p.w) * dt;

      return p + deriv * dt;
    }

    // 5D Hénon integration (boomerang chaos)
    vec4 integrate5DHenon(vec4 p, float v, float dt, out float vOut) {
      const float a = 1.4;
      const float b = 0.3;
      const float eps1 = 0.35, eps2 = 0.2, eps3 = 0.25;

      // Hénon is discrete map, convert to continuous
      float dx = a - p.x * p.x + b * p.y + eps1 * p.w;
      float dy = p.x + eps2 * v;
      float dz = eps3 * (p.y - p.z) + p.x * p.w;
      float dw = eps1 * (p.z - p.w) + eps2 * v * p.x;

      vOut = v + (eps3 * (p.x * p.y - v) + eps1 * p.w) * dt;

      return p + vec4(dx, dy, dz, dw) * dt * 0.5;
    }

    // Get entity parameters
    Attractor5D getEntity(int id, float time) {
      Attractor5D ent;
      float seed = float(id) * 123.456;

      // Assign species
      if (id < 5) {
        ent.species = SPECIES_LORENZ;  // 5 Lorenz butterflies
        ent.scale = 0.18 + hash(seed) * 0.08;
      } else if (id < 8) {
        ent.species = SPECIES_ROSSLER;  // 3 Rössler spirals
        ent.scale = 0.25 + hash(seed + 1.0) * 0.1;
      } else {
        ent.species = SPECIES_HENON;  // 1 Hénon boomerang
        ent.scale = 0.15 + hash(seed + 2.0) * 0.05;
      }

      // Initialize position with unique starting point
      ent.pos = vec4(
        hash(seed + 10.0) * 2.0 - 1.0,
        hash(seed + 20.0) * 2.0 - 1.0,
        hash(seed + 30.0) * 2.0 - 1.0,
        hash(seed + 40.0) * 2.0 - 1.0
      ) * 5.0;
      ent.v = (hash(seed + 50.0) * 2.0 - 1.0) * 5.0;

      // Phase offset for animation
      ent.phase = hash(seed + 60.0) * TAU;

      // Integrate forward based on species and time
      float t = time + ent.phase;
      float dt = 0.015;  // Integration step
      int steps = int(mod(t / dt, 500.0));  // Cycle trajectory

      for (int i = 0; i < 500; i++) {
        if (i >= steps) break;

        float vOut;
        if (ent.species == SPECIES_LORENZ) {
          ent.pos = integrate5DLorenz(ent.pos, ent.v, dt, vOut);
        } else if (ent.species == SPECIES_ROSSLER) {
          ent.pos = integrate5DRossler(ent.pos, ent.v, dt, vOut);
        } else {
          ent.pos = integrate5DHenon(ent.pos, ent.v, dt, vOut);
        }
        ent.v = vOut;
      }

      return ent;
    }

    // === CAMERA CHOREOGRAPHY ===

    void getCamera(float time, out vec3 ro, out vec3 lookAt) {
      float t = mod(time, 60.0);

      // Get primary entity to track
      Attractor5D tracked = getEntity(0, time);
      vec3 entityPos = tracked.pos.xyz * tracked.scale;

      if (t < 12.0) {
        // Shot 1: Hive Core Dive (0-12s)
        float s = t / 12.0;
        ro = vec3(
          sin(s * TAU * 0.5) * 8.0,
          20.0 - s * 25.0,  // Dive down
          cos(s * TAU * 0.5) * 8.0
        );
        lookAt = vec3(0.0, -5.0 + sin(s * PI) * 3.0, 0.0);

      } else if (t < 22.0) {
        // Shot 2: Trajectory Following (12-22s)
        float s = (t - 12.0) / 10.0;
        vec3 offset = vec3(
          cos(s * TAU + 1.0) * 2.5,
          sin(s * TAU * 1.5) * 1.8,
          -3.0 + sin(s * TAU * 0.5) * 1.0
        );
        ro = entityPos + offset;
        lookAt = entityPos + vec3(sin(time) * 0.5, 0.0, cos(time) * 0.5);

      } else if (t < 32.0) {
        // Shot 3: Synaptic Storm Orbit (22-32s)
        float s = (t - 22.0) / 10.0;
        float radius = 6.0 + sin(s * TAU) * 1.5;
        float angle = s * TAU * 1.5;
        float height = sin(s * TAU * 2.0) * 3.0;
        ro = vec3(
          cos(angle) * radius,
          height,
          sin(angle) * radius
        );
        lookAt = vec3(0.0, 0.0, 0.0);

      } else if (t < 42.0) {
        // Shot 4: Hénon Boomerang Chase (32-42s)
        float s = (t - 32.0) / 10.0;
        Attractor5D henon = getEntity(8, time);  // Hénon entity
        vec3 henonPos = henon.pos.xyz * henon.scale;
        vec3 chaseOffset = vec3(
          -cos(s * TAU * 2.0) * 3.0,
          sin(s * TAU * 3.0) * 2.0,
          -4.0 + sin(s * PI) * 2.0
        );
        ro = henonPos + chaseOffset;
        lookAt = henonPos + vec3(sin(time * 2.0), 0.0, cos(time * 2.0)) * 0.3;

      } else if (t < 50.0) {
        // Shot 5: Wide Ecosystem Shot (42-50s)
        float s = (t - 42.0) / 8.0;
        float dist = 18.0 + s * 8.0;  // Pull back
        float angle = s * PI * 0.5;
        ro = vec3(
          cos(time * 0.1) * dist,
          5.0 + s * 10.0,  // Crane up
          sin(time * 0.1) * dist
        );
        lookAt = vec3(0.0, 0.0, 0.0);

      } else {
        // Shot 6: Rössler Spiral Encounter (50-60s)
        float s = (t - 50.0) / 10.0;
        Attractor5D rossler = getEntity(5, time);  // Rössler entity
        vec3 rosslerPos = rossler.pos.xyz * rossler.scale;
        float orbitAngle = s * TAU;
        vec3 orbitOffset = vec3(
          cos(orbitAngle) * 4.0,
          sin(orbitAngle * 2.0) * 2.0,
          sin(orbitAngle) * 4.0
        );
        ro = rosslerPos + orbitOffset;
        lookAt = rosslerPos;
      }
    }

    // === ORGANIC BODY RENDERING ===

    float organicWarp(vec3 p, float seed) {
      return noise(p * 2.0 + seed) * 0.3 + noise(p * 4.0 + seed + 10.0) * 0.15;
    }

    // Distance to creature body (tubular structure following trajectory)
    float creatureBodySDF(vec3 p, Attractor5D ent, float time, out float chaosIntensity) {
      vec3 entPos = ent.pos.xyz * ent.scale;
      vec3 toPoint = p - entPos;

      // Calculate local chaos (velocity magnitude)
      float dt = 0.015;
      float vOut;
      vec4 nextPos;
      if (ent.species == SPECIES_LORENZ) {
        nextPos = integrate5DLorenz(ent.pos, ent.v, dt, vOut);
      } else if (ent.species == SPECIES_ROSSLER) {
        nextPos = integrate5DRossler(ent.pos, ent.v, dt, vOut);
      } else {
        nextPos = integrate5DHenon(ent.pos, ent.v, dt, vOut);
      }
      vec3 velocity = (nextPos.xyz - ent.pos.xyz) * ent.scale / dt;
      chaosIntensity = length(velocity) * 0.05;

      // Base radius by species
      float baseRadius;
      if (ent.species == SPECIES_LORENZ) {
        baseRadius = 0.4;
      } else if (ent.species == SPECIES_ROSSLER) {
        baseRadius = 0.6;
      } else {
        baseRadius = 0.35;
      }

      // Vary radius with chaos and animation
      float pulseFreq = (ent.species == SPECIES_LORENZ) ? 2.0 : (ent.species == SPECIES_ROSSLER) ? 1.5 : 3.0;
      float pulse = sin(time * pulseFreq + ent.phase) * 0.15 + 1.0;
      float radius = baseRadius * (1.0 + chaosIntensity * 0.4) * pulse;

      // Organic warping
      float warp = organicWarp(entPos, float(ent.species) * 100.0 + ent.phase);

      float d = length(toPoint) - (radius + warp * 0.2);

      return d;
    }

    // === SYNAPTIC ARCS ===

    float synapticArcSDF(vec3 p, vec3 pos1, vec3 pos2, float flickerSeed, float time) {
      float dist = length(pos1 - pos2);
      if (dist > SYNAPSE_THRESHOLD) return 1e10;

      // Bezier curve with electrical jitter
      vec3 start = pos1;
      vec3 end = pos2;
      vec3 dir = normalize(end - start);
      vec3 perp = normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
      vec3 mid = (start + end) * 0.5 + perp * dist * 0.3;

      // Find closest point on arc
      float minDist = 1e10;
      for (float t = 0.0; t < 1.0; t += 0.1) {
        float s = 1.0 - t;
        vec3 arcPoint = start * s * s + mid * 2.0 * s * t + end * t * t;

        // Electrical jitter
        float jitter = hash2(vec2(flickerSeed, floor(time * 10.0))) * 2.0 - 1.0;
        arcPoint += perp * jitter * 0.1;

        minDist = min(minDist, length(p - arcPoint));
      }

      return minDist - 0.08;  // Arc thickness
    }

    // === SCENE SDF ===

    float sceneSDF(vec3 p, float time, out int hitEntity, out float chaosOut) {
      float d = MAX_DIST;
      hitEntity = -1;
      chaosOut = 0.0;

      // Check all entities
      for (int i = 0; i < NUM_ENTITIES; i++) {
        Attractor5D ent = getEntity(i, time);
        float chaos;
        float entD = creatureBodySDF(p, ent, time, chaos);

        if (entD < d) {
          d = entD;
          hitEntity = i;
          chaosOut = chaos;
        }
      }

      // Check synaptic arcs
      int arcCount = 0;
      for (int i = 0; i < NUM_ENTITIES; i++) {
        if (arcCount >= MAX_SYNAPSES) break;
        for (int j = 0; j < NUM_ENTITIES; j++) {
          if (j <= i) continue;  // Only check j > i to avoid duplicates
          if (arcCount >= MAX_SYNAPSES) break;

          Attractor5D ent1 = getEntity(i, time);
          Attractor5D ent2 = getEntity(j, time);
          vec3 pos1 = ent1.pos.xyz * ent1.scale;
          vec3 pos2 = ent2.pos.xyz * ent2.scale;

          if (length(pos1 - pos2) < SYNAPSE_THRESHOLD) {
            float flickerSeed = float(i * 100 + j);
            float arcD = synapticArcSDF(p, pos1, pos2, flickerSeed, time);
            d = min(d, arcD);
            arcCount++;
          }
        }
      }

      return d;
    }

    // === RAY MARCHING ===

    float march(vec3 ro, vec3 rd, float time, out int hitEntity, out float chaosOut) {
      float dO = 0.0;
      hitEntity = -1;
      chaosOut = 0.0;

      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneSDF(p, time, hitEntity, chaosOut);
        dO += dS;

        if (dS < SURF_DIST || dO > MAX_DIST) break;
      }

      return dO;
    }

    vec3 calcNormal(vec3 p, float time) {
      int dummy;
      float chaos;
      float d = sceneSDF(p, time, dummy, chaos);
      vec2 e = vec2(EPSILON, 0.0);
      vec3 n = d - vec3(
        sceneSDF(p - e.xyy, time, dummy, chaos),
        sceneSDF(p - e.yxy, time, dummy, chaos),
        sceneSDF(p - e.yyx, time, dummy, chaos)
      );
      return normalize(n);
    }

    // === COLOR PALETTE ===

    vec3 getEntityColor(int entityID, float chaos, vec3 p, float time) {
      Attractor5D ent = getEntity(entityID, time);

      // Base colors by species
      vec3 col;
      if (ent.species == SPECIES_LORENZ) {
        // Lorenz: Crimson + Necrotic Purple + Cyan neural
        float segment = fract(sin(dot(p, vec3(12.9, 78.2, 45.6))) * 43758.5);
        if (segment < 0.5) {
          col = vec3(0.608, 0.059, 0.075);  // Crimson flesh
        } else if (segment < 0.8) {
          col = vec3(0.239, 0.071, 0.271);  // Necrotic purple
        } else {
          col = vec3(0.094, 0.639, 0.710);  // Electric cyan neural
        }
      } else if (ent.species == SPECIES_ROSSLER) {
        // Rössler: Toxic Green + Bile Yellow
        float blend = fract(sin(length(p) * 5.0 + time) * 123.456);
        col = mix(
          vec3(0.169, 0.561, 0.110),  // Toxic green
          vec3(0.722, 0.635, 0.082),  // Bile yellow
          blend
        );
      } else {
        // Hénon: Rust Orange armored
        col = vec3(0.722, 0.271, 0.063);  // Rust orange
      }

      // Chaos intensity adds cyan glow
      col += vec3(0.094, 0.639, 0.710) * chaos * 0.4;

      return col;
    }

    // === VOLUMETRIC FOG ===

    vec3 volumetricFog(vec3 ro, vec3 rd, float marchDist, float time) {
      vec3 fogColor = vec3(0.0);
      float fogDensity = 0.0;

      const int SAMPLES = 7;
      float step = marchDist / float(SAMPLES);

      for (int i = 0; i < SAMPLES; i++) {
        float t = float(i) * step;
        vec3 p = ro + rd * t;

        // Check proximity to entities for fog color
        float minDist = 1e10;
        int closestSpecies = SPECIES_LORENZ;
        for (int j = 0; j < NUM_ENTITIES; j++) {
          Attractor5D ent = getEntity(j, time);
          vec3 entPos = ent.pos.xyz * ent.scale;
          float d = length(p - entPos);
          if (d < minDist) {
            minDist = d;
            closestSpecies = ent.species;
          }
        }

        // Fog color based on region
        vec3 regionColor;
        if (minDist < 3.0) {
          // Dense swarm - green tint
          regionColor = vec3(0.1, 0.3, 0.15);
        } else {
          // Void - purple
          regionColor = vec3(0.15, 0.05, 0.2);
        }

        // Synaptic regions - cyan glow
        float synapseGlow = 0.0;
        for (int j = 0; j < NUM_ENTITIES; j++) {
          for (int k = 0; k < NUM_ENTITIES; k++) {
            if (k <= j) continue;  // Only check k > j to avoid duplicates

            Attractor5D ent1 = getEntity(j, time);
            Attractor5D ent2 = getEntity(k, time);
            vec3 pos1 = ent1.pos.xyz * ent1.scale;
            vec3 pos2 = ent2.pos.xyz * ent2.scale;

            if (length(pos1 - pos2) < SYNAPSE_THRESHOLD) {
              vec3 midpoint = (pos1 + pos2) * 0.5;
              float distToArc = length(p - midpoint);
              synapseGlow += exp(-distToArc * 0.5) * 0.3;
            }
          }
        }
        regionColor += vec3(0.094, 0.639, 0.710) * synapseGlow;

        // Accumulate fog
        float density = 0.015 * (1.0 + noise(p * 0.5 + time * 0.1) * 0.5);
        fogColor += regionColor * density;
        fogDensity += density;
      }

      return fogColor / float(SAMPLES);
    }

    // === MAIN ===

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      float time = u_time;

      // Camera
      vec3 ro, lookAt;
      getCamera(time, ro, lookAt);

      vec3 forward = normalize(lookAt - ro);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
      vec3 up = cross(forward, right);

      float fov = 80.0 * PI / 180.0;
      vec3 rd = normalize(forward + tan(fov * 0.5) * (uv.x * right + uv.y * up));

      // Ray march
      int hitEntity;
      float chaos;
      float d = march(ro, rd, time, hitEntity, chaos);

      vec3 col = vec3(0.031, 0.020, 0.063);  // Deep void black background

      if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 normal = calcNormal(p, time);

        // Get color
        if (hitEntity >= 0) {
          col = getEntityColor(hitEntity, chaos, p, time);

          // Lighting
          vec3 lightDir = normalize(vec3(0.5, 0.7, -0.3));
          float diff = max(dot(normal, lightDir), 0.0) * 0.6 + 0.4;
          col *= diff;

          // Rim light (cyan)
          float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
          col += vec3(0.094, 0.639, 0.710) * rim * 0.5;

          // Chaos glow
          col += vec3(0.094, 0.639, 0.710) * chaos * 0.3;
        } else {
          // Synaptic arc hit
          col = vec3(0.094, 0.639, 0.710);  // Electric cyan
          col *= 2.0 + sin(time * 20.0) * 0.5;  // Flickering
        }

        // Fog integration
        vec3 fog = volumetricFog(ro, rd, d, time);
        col = mix(col, fog, smoothstep(0.0, MAX_DIST * 0.6, d));
      } else {
        // Sky fog only
        col = volumetricFog(ro, rd, MAX_DIST * 0.8, time);
      }

      // Atmospheric depth fade
      col = mix(col, vec3(0.031, 0.020, 0.063), smoothstep(15.0, MAX_DIST, d));

      // Subtle vignette
      float vignette = 1.0 - length(uv) * 0.3;
      col *= vignette;

      // Synaptic flash overlay (random flicker)
      float flash = 0.0;
      for (int i = 0; i < NUM_ENTITIES; i++) {
        for (int j = 0; j < NUM_ENTITIES; j++) {
          if (j <= i) continue;  // Only check j > i to avoid duplicates

          Attractor5D ent1 = getEntity(i, time);
          Attractor5D ent2 = getEntity(j, time);
          vec3 pos1 = ent1.pos.xyz * ent1.scale;
          vec3 pos2 = ent2.pos.xyz * ent2.scale;

          if (length(pos1 - pos2) < SYNAPSE_THRESHOLD) {
            float flickerTime = time * 10.0 + float(i * 100 + j);
            if (fract(hash(floor(flickerTime))) > 0.8) {
              vec3 midpoint = (pos1 + pos2) * 0.5;
              vec3 screenDir = normalize(midpoint - ro);
              float flashIntensity = max(dot(rd, screenDir), 0.0);
              flash += pow(flashIntensity, 20.0) * 0.3;
            }
          }
        }
      }
      col += vec3(0.094, 0.639, 0.710) * flash;

      // Tone mapping
      col = col / (col + 1.0);
      col = pow(col, vec3(0.8));  // Slightly darker gamma

      gl_FragColor = vec4(col, 1.0);
    }
  `;
}
