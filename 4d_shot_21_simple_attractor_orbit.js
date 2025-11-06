// SHOT 21 (SIMPLIFIED): 5D Parasitic Attractor Orbit
// Stripped down version - simple orbit camera, 3 attractors, basic effects
// Focus: Get it WORKING without browser crash

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

    #define MAX_STEPS 25
    #define MAX_DIST 25.0
    #define SURF_DIST 0.02

    #define NUM_ENTITIES 3

    // === UTILITY ===

    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
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

    // Get entity state
    vec3 getEntityPos(int id, float time) {
      float seed = float(id) * 123.456;

      // Initialize
      vec4 pos = vec4(
        hash(seed + 10.0) * 2.0 - 1.0,
        hash(seed + 20.0) * 2.0 - 1.0,
        hash(seed + 30.0) * 2.0 - 1.0,
        hash(seed + 40.0) * 2.0 - 1.0
      ) * 5.0;
      float v = (hash(seed + 50.0) * 2.0 - 1.0) * 5.0;
      float phase = hash(seed + 60.0) * TAU;

      // Integrate
      float t = time + phase;
      float dt = 0.025;
      int steps = int(mod(t / dt, 80.0));

      for (int i = 0; i < 80; i++) {
        if (i >= steps) break;
        float vOut;
        pos = integrateLorenz(pos, v, dt, vOut);
        v = vOut;
      }

      float scale = 0.25 + hash(seed) * 0.1;
      return pos.xyz * scale;
    }

    // === SCENE SDF ===

    float sphereSDF(vec3 p, vec3 center, float radius) {
      return length(p - center) - radius;
    }

    float sceneSDF(vec3 p, float time, out int hitID) {
      float d = MAX_DIST;
      hitID = -1;

      // Check all entities
      for (int i = 0; i < NUM_ENTITIES; i++) {
        vec3 entPos = getEntityPos(i, time);
        float entD = sphereSDF(p, entPos, 0.5);

        if (entD < d) {
          d = entD;
          hitID = i;
        }
      }

      return d;
    }

    // === RAY MARCHING ===

    float march(vec3 ro, vec3 rd, float time, out int hitID) {
      float dO = 0.0;
      hitID = -1;

      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneSDF(p, time, hitID);
        dO += dS;

        if (dS < SURF_DIST || dO > MAX_DIST) break;
      }

      return dO;
    }

    vec3 calcNormal(vec3 p, float time) {
      int dummy;
      float d = sceneSDF(p, time, dummy);
      vec2 e = vec2(0.001, 0.0);
      vec3 n = d - vec3(
        sceneSDF(p - e.xyy, time, dummy),
        sceneSDF(p - e.yxy, time, dummy),
        sceneSDF(p - e.yyx, time, dummy)
      );
      return normalize(n);
    }

    // === MAIN ===

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      float time = u_time;

      // Simple orbit camera
      float radius = 8.0;
      float angle = time * 0.2;
      vec3 ro = vec3(
        cos(angle) * radius,
        sin(time * 0.15) * 3.0,
        sin(angle) * radius
      );
      vec3 lookAt = vec3(0.0, 0.0, 0.0);

      vec3 forward = normalize(lookAt - ro);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
      vec3 up = cross(forward, right);

      float fov = 70.0 * PI / 180.0;
      vec3 rd = normalize(forward + tan(fov * 0.5) * (uv.x * right + uv.y * up));

      // Ray march
      int hitID;
      float d = march(ro, rd, time, hitID);

      vec3 col = vec3(0.03, 0.02, 0.06);  // Void background

      if (d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 normal = calcNormal(p, time);

        // Color by entity
        vec3 baseCol;
        if (hitID == 0) {
          baseCol = vec3(0.608, 0.059, 0.075);  // Crimson
        } else if (hitID == 1) {
          baseCol = vec3(0.239, 0.071, 0.271);  // Purple
        } else {
          baseCol = vec3(0.094, 0.639, 0.710);  // Cyan
        }

        // Simple lighting
        vec3 lightDir = normalize(vec3(0.5, 0.7, -0.3));
        float diff = max(dot(normal, lightDir), 0.0) * 0.6 + 0.4;
        col = baseCol * diff;

        // Rim light
        float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
        col += vec3(0.094, 0.639, 0.710) * rim * 0.4;
      }

      // Simple distance fog
      col = mix(col, vec3(0.03, 0.02, 0.06), smoothstep(10.0, MAX_DIST, d));

      // Tone mapping
      col = col / (col + 1.0);
      col = pow(col, vec3(0.85));

      gl_FragColor = vec4(col, 1.0);
    }
  `;
}
