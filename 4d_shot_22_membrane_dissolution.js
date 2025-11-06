// SHOT 22: 4D MEMBRANE DISSOLUTION
// A single 4D membrane slowly dissolving into holes
// Simple. Focused. Beautiful through restraint.

let membraneShader;

function preload() {}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  membraneShader = createShader(vertexShader(), fragmentShader());
  shader(membraneShader);
  noStroke();
}

function draw() {
  membraneShader.setUniform('u_resolution', [width, height]);
  membraneShader.setUniform('u_time', millis() / 1000.0);

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
    #define MAX_DIST 20.0
    #define SURF_DIST 0.01

    // === UTILITY ===

    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
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

    // === 4D MEMBRANE ===

    // 4D hypersphere surface SDF
    float membraneSDF(vec4 p) {
      // Hypersphere surface (hollow)
      float radius = 3.0;
      float thickness = 0.15;
      float d = abs(length(p) - radius) - thickness;

      // Gentle organic warping
      float warp = noise(p.xyz * 0.8 + p.w) * 0.3;
      warp += noise(p.xzw * 1.5) * 0.15;

      return d + warp;
    }

    // Calculate health at point (0-1, lower = more dissolved)
    float getHealth(vec4 p, float time) {
      // 2 octave noise for dissolution pattern
      float h = noise(p.xyz * 1.2 + p.w * 0.5) * 0.6;
      h += noise(p.xzw * 2.5 + time * 0.1) * 0.4;

      // Decrease health over time (more holes)
      float timeDecay = time * 0.05;
      h -= timeDecay;

      return h;
    }

    // === SCENE ===

    float sceneSDF(vec4 p) {
      return membraneSDF(p);
    }

    // === RAY MARCHING ===

    float march(vec3 ro, vec3 rd, float time, out vec4 hitPos4D, out bool isHole) {
      float dO = 0.0;
      isHole = true;

      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p3 = ro + rd * dO;

        // 4D position (camera at W=0)
        vec4 p4 = vec4(p3, 0.0);

        // Rotate membrane through 4D
        p4.xy *= rot2D(time * 0.15);
        p4.zw *= rot2D(time * 0.18);

        float dS = sceneSDF(p4);

        if (dS < SURF_DIST) {
          // Check if this point is a hole
          float health = getHealth(p4, time);
          if (health > 0.3) {
            // Solid membrane
            hitPos4D = p4;
            isHole = false;
            break;
          }
          // It's a hole - continue marching
        }

        dO += dS;
        if (dO > MAX_DIST) break;
      }

      return dO;
    }

    vec3 calcNormal(vec4 p) {
      vec2 e = vec2(0.001, 0.0);
      vec3 n = sceneSDF(p) - vec3(
        sceneSDF(p - e.xyyy),
        sceneSDF(p - e.yxyy),
        sceneSDF(p - e.yyxy)
      );
      return normalize(n);
    }

    // === MAIN ===

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      float time = u_time;

      // Simple orbital camera (60s loop)
      float angle = time * TAU / 60.0;
      float height = sin(time * 0.1) * 0.5;
      vec3 ro = vec3(
        cos(angle) * 8.0,
        1.0 + height,
        sin(angle) * 8.0
      );
      vec3 lookAt = vec3(0.0, 0.0, 0.0);

      vec3 forward = normalize(lookAt - ro);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
      vec3 up = cross(forward, right);

      float fov = 60.0 * PI / 180.0;
      vec3 rd = normalize(forward + tan(fov * 0.5) * (uv.x * right + uv.y * up));

      // Ray march
      vec4 hitPos4D;
      bool isHole;
      float d = march(ro, rd, time, hitPos4D, isHole);

      // Background (void black)
      vec3 col = vec3(0.039, 0.020, 0.063);

      if (!isHole && d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 normal = calcNormal(hitPos4D);

        // Calculate health for coloring
        float health = getHealth(hitPos4D, time);

        // 4 color palette based on health
        vec3 healthyCol = vec3(0.659, 0.125, 0.251);    // Pink-red
        vec3 necroticCol = vec3(0.290, 0.094, 0.271);   // Purple
        vec3 edgeCol = vec3(0.094, 0.647, 0.722);       // Cyan

        // Blend healthy -> necrotic based on health
        vec3 baseCol = mix(necroticCol, healthyCol, smoothstep(0.3, 0.8, health));

        // Simple lighting
        vec3 lightDir = normalize(vec3(0.5, 0.7, -0.3));
        float diff = max(dot(normal, lightDir), 0.0) * 0.7 + 0.3;

        col = baseCol * diff;

        // Cyan rim light on edges
        float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
        col += edgeCol * rim * 0.5;

        // Purple glow in necrotic zones
        float necroGlow = smoothstep(0.8, 0.3, health);
        col += necroticCol * necroGlow * 0.3;

        // Edge glow near holes
        float edgeProximity = smoothstep(0.5, 0.3, health);
        col += edgeCol * edgeProximity * 0.4;
      }

      // Simple depth fade
      col = mix(col, vec3(0.039, 0.020, 0.063), smoothstep(10.0, MAX_DIST, d));

      // Tone mapping
      col = col / (col + 1.0);
      col = pow(col, vec3(0.9));

      gl_FragColor = vec4(col, 1.0);
    }
  `;
}
