// 4D SHADER SERIES - SHOT 15: 5D Neural Symbiont Network
// Complex bio-technological 5D entities: living neural networks with signal propagation
// Dense substrate environment: synaptic fog, electrical dendrites, membrane layers

let frag = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

// Performance constants
#define MAX_STEPS 35
#define MAX_DIST 20.0
#define SURF_DIST 0.02
#define VOL_SAMPLES 7
#define DENDRITE_SAMPLES 4

// 5D rotation matrices
mat4 rotateXW(float a) {
  return mat4(cos(a), 0, 0, -sin(a), 0, 1, 0, 0, 0, 0, 1, 0, sin(a), 0, 0, cos(a));
}

mat4 rotateYZ(float a) {
  return mat4(1, 0, 0, 0, 0, cos(a), -sin(a), 0, 0, sin(a), cos(a), 0, 0, 0, 0, 1);
}

mat4 rotateZW(float a) {
  return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, cos(a), -sin(a), 0, 0, sin(a), cos(a));
}

mat4 rotateYW(float a) {
  return mat4(1, 0, 0, 0, 0, cos(a), 0, -sin(a), 0, 0, 1, 0, 0, sin(a), 0, cos(a));
}

// Hash functions for 4D/5D noise
float hash41(vec4 p) {
  p = fract(p * vec4(443.897, 441.423, 437.195, 443.129));
  p += dot(p, p.wzxy + 19.19);
  return fract((p.x + p.y) * (p.z + p.w));
}

float hash51(vec4 p, float v) {
  vec4 p4 = fract(p * vec4(443.897, 441.423, 437.195, 443.129));
  float pv = fract(v * 449.213);
  p4 += dot(p4, p4.wzxy + pv + 19.19);
  return fract((p4.x + p4.y) * (p4.z + p4.w + pv));
}

// 4D noise
float noise4d(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n0000 = hash41(i);
  float n1000 = hash41(i + vec4(1,0,0,0));
  float n0100 = hash41(i + vec4(0,1,0,0));
  float n1100 = hash41(i + vec4(1,1,0,0));
  float n0010 = hash41(i + vec4(0,0,1,0));
  float n1010 = hash41(i + vec4(1,0,1,0));
  float n0110 = hash41(i + vec4(0,1,1,0));
  float n1110 = hash41(i + vec4(1,1,1,0));
  float n0001 = hash41(i + vec4(0,0,0,1));
  float n1001 = hash41(i + vec4(1,0,0,1));
  float n0101 = hash41(i + vec4(0,1,0,1));
  float n1101 = hash41(i + vec4(1,1,0,1));
  float n0011 = hash41(i + vec4(0,0,1,1));
  float n1011 = hash41(i + vec4(1,0,1,1));
  float n0111 = hash41(i + vec4(0,1,1,1));
  float n1111 = hash41(i + vec4(1,1,1,1));

  float nx00 = mix(mix(n0000, n1000, f.x), mix(n0100, n1100, f.x), f.y);
  float nx10 = mix(mix(n0010, n1010, f.x), mix(n0110, n1110, f.x), f.y);
  float nx01 = mix(mix(n0001, n1001, f.x), mix(n0101, n1101, f.x), f.y);
  float nx11 = mix(mix(n0011, n1011, f.x), mix(n0111, n1111, f.x), f.y);

  return mix(mix(nx00, nx10, f.z), mix(nx01, nx11, f.z), f.w);
}

// 5D noise (p is vec4, v is 5th dimension)
float noise5d(vec4 p, float v) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  float iv = floor(v);
  float fv = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  fv = fv * fv * (3.0 - 2.0 * fv);

  // Sample at v and v+1, interpolate
  float n0 = noise4d(p);
  float n1 = hash51(i, iv + 1.0);

  return mix(n0, n1, fv);
}

// Neural network node positions in 5D
vec4 getNeuronPos(int id, float v) {
  float fid = float(id);
  float angle1 = fid * 2.39996; // Golden angle
  float angle2 = fid * 1.61803;
  float radius = 2.0 + sin(fid * 0.5) * 1.5;

  return vec4(
    cos(angle1) * radius,
    sin(angle1) * radius * 0.7,
    cos(angle2) * radius * 0.8,
    sin(angle2) * radius + v * 0.3
  );
}

// Neural signal pulse traveling along dendrites
float signalPulse(float dist, float time, float speed) {
  float wave = fract(time * speed - dist * 0.5);
  return exp(-50.0 * (wave - 0.5) * (wave - 0.5));
}

// Distance to neural network structure
float neuralNetworkSDF(vec4 p, float v) {
  float d = MAX_DIST;

  // 8 neuron nodes
  for(int i = 0; i < 8; i++) {
    vec4 neuronPos = getNeuronPos(i, v);

    // Soma (cell body) - pulsing with electrical activity
    float pulse = 0.15 + 0.08 * sin(u_time * 3.0 + float(i) * 0.7);
    float soma = length(p - neuronPos) - pulse;
    d = min(d, soma);

    // Dendrite connections to nearby neurons
    for(int j = 0; j < 8; j++) {
      if(i == j) continue;
      vec4 targetPos = getNeuronPos(j, v);
      float dist = length(neuronPos - targetPos);
      if(dist < 4.0) { // Only nearby connections
        // Tubular dendrite
        vec4 dir = normalize(targetPos - neuronPos);
        vec4 toPoint = p - neuronPos;
        float along = clamp(dot(toPoint, dir), 0.0, dist);
        vec4 closest = neuronPos + dir * along;
        float dendriteThickness = 0.03 + 0.02 * sin(along * 2.0 + u_time);
        float dendrite = length(p - closest) - dendriteThickness;
        d = min(d, dendrite);
      }
    }
  }

  return d;
}

// Ray march through neural network
float rayMarch(vec4 ro, vec4 rd, float v) {
  float dO = 0.0;
  for(int i = 0; i < MAX_STEPS; i++) {
    vec4 p = ro + rd * dO;
    float dS = neuralNetworkSDF(p, v);
    dO += dS;
    if(dO > MAX_DIST || abs(dS) < SURF_DIST) break;
  }
  return dO;
}

// Get normal for lighting
vec4 getNormal5D(vec4 p, float v) {
  float d = neuralNetworkSDF(p, v);
  vec2 e = vec2(0.01, 0);
  vec4 n = d - vec4(
    neuralNetworkSDF(p - e.xyyy, v),
    neuralNetworkSDF(p - e.yxyy, v),
    neuralNetworkSDF(p - e.yyxy, v),
    neuralNetworkSDF(p - e.yyyx, v)
  );
  return normalize(n);
}

// Synaptic fog density (volumetric neurotransmitters)
float synapticFog(vec4 p, float v) {
  // Multi-scale fog
  float fog1 = noise5d(p * 0.8, v);
  float fog2 = noise5d(p * 2.0 + vec4(100.0), v * 1.3);
  float fog = fog1 * 0.6 + fog2 * 0.4;

  // Denser fog near neurons
  float nearNeurons = 0.0;
  for(int i = 0; i < 8; i++) {
    vec4 neuronPos = getNeuronPos(i, v);
    float dist = length(p - neuronPos);
    nearNeurons += 1.0 / (1.0 + dist * dist * 0.5);
  }

  fog += nearNeurons * 0.2;

  return smoothstep(0.25, 0.75, fog);
}

// Electrical dendrite discharge effects
vec3 dendriteDischarge(vec4 p, float v) {
  vec3 discharge = vec3(0.0);

  // Sample electrical arcs between neurons
  for(int i = 0; i < DENDRITE_SAMPLES; i++) {
    int idx = i * 2;
    vec4 neuron1 = getNeuronPos(idx, v);
    vec4 neuron2 = getNeuronPos(idx + 1, v);

    vec4 dir = normalize(neuron2 - neuron1);
    vec4 toPoint = p - neuron1;
    float along = dot(toPoint, dir);
    float dist12 = length(neuron2 - neuron1);

    if(along > 0.0 && along < dist12) {
      vec4 closest = neuron1 + dir * along;
      float distToLine = length(p - closest);

      // Traveling signal pulse
      float pulse = signalPulse(along, u_time, 0.4 + float(i) * 0.1);

      // Electric glow based on proximity and pulse
      float intensity = pulse * exp(-distToLine * 8.0);

      // Toxic green electrical discharge
      discharge += vec3(0.0, 1.0, 0.3) * intensity;
    }
  }

  return discharge;
}

// Membrane layers (bio-substrate)
vec3 membraneLayers(vec4 p, float v) {
  // Undulating membrane surfaces in 5D
  float membrane1 = sin(p.x * 2.0 + u_time * 0.3) * cos(p.y * 1.8 + v) * sin(p.z * 2.2);
  float membrane2 = sin(p.y * 1.5 - u_time * 0.4) * cos(p.z * 2.3 + v * 1.2) * sin(p.w * 1.7);

  float layer1 = abs(membrane1 - 0.3);
  float layer2 = abs(membrane2 + 0.2);

  vec3 color = vec3(0.0);

  // Rust orange membrane
  if(layer1 < 0.1) {
    float intensity = (0.1 - layer1) * 10.0;
    color += vec3(0.8, 0.3, 0.1) * intensity * 0.15;
  }

  // Bruised purple membrane
  if(layer2 < 0.1) {
    float intensity = (0.1 - layer2) * 10.0;
    color += vec3(0.4, 0.1, 0.5) * intensity * 0.12;
  }

  return color;
}

// Dynamic camera following neural signals
void getCameraShot(float t, out vec3 camPos, out vec3 lookAt, out float vCoord) {
  float cycle = mod(t, 70.0);

  // V-dimension travels through 5D layers
  vCoord = sin(t * 0.2) * 1.5;

  if(cycle < 15.0) {
    // Shot 1: Track along dendrite path following signal
    float progress = cycle / 15.0;
    vec4 start = getNeuronPos(0, vCoord);
    vec4 end = getNeuronPos(3, vCoord);
    vec4 pathPos = mix(start, end, progress);

    camPos = pathPos.xyz + vec3(0.5, 0.3, 0.5);
    lookAt = pathPos.xyz;

  } else if(cycle < 30.0) {
    // Shot 2: Spiral dive into neural cluster center
    float progress = (cycle - 15.0) / 15.0;
    float angle = progress * 6.28318 * 2.0;
    float radius = 5.0 - progress * 3.0;
    float height = 3.0 - progress * 4.0;

    camPos = vec3(cos(angle) * radius, height, sin(angle) * radius);
    lookAt = vec3(0.0, -0.5, 0.0);

  } else if(cycle < 47.0) {
    // Shot 3: Glide through synaptic gaps between neurons
    float progress = (cycle - 30.0) / 17.0;
    vec4 pos1 = getNeuronPos(2, vCoord);
    vec4 pos2 = getNeuronPos(5, vCoord);
    vec4 pos3 = getNeuronPos(7, vCoord);

    vec4 pathPos;
    if(progress < 0.5) {
      pathPos = mix(pos1, pos2, progress * 2.0);
    } else {
      pathPos = mix(pos2, pos3, (progress - 0.5) * 2.0);
    }

    camPos = pathPos.xyz + vec3(0.0, 0.2, 0.3);
    vec4 lookPos = pathPos + normalize(pos3 - pos1) * 0.8;
    lookAt = lookPos.xyz;

  } else {
    // Shot 4: Orbiting pullback revealing entire network
    float progress = (cycle - 47.0) / 23.0;
    float angle = progress * 6.28318 + 1.5;
    float radius = 3.0 + progress * 4.0;
    float height = -1.0 + sin(progress * 3.14159) * 2.5;

    camPos = vec3(cos(angle) * radius, height, sin(angle) * radius);
    lookAt = vec3(0.0, 0.0, 0.0);
  }
}

// Rich background environment
vec3 getBackground(vec4 rayDir, float v) {
  // Deep substrate field
  float substrate = noise5d(rayDir * 1.2, v * 0.5);
  vec3 color = mix(
    vec3(0.02, 0.01, 0.03), // Deep black-purple
    vec3(0.1, 0.05, 0.15),  // Bruised purple
    substrate
  );

  // Distant neural aurora
  float aurora = pow(noise5d(rayDir * 2.5 + vec4(u_time * 0.1), v), 3.0);
  color += vec3(0.0, 0.4, 0.5) * aurora * 0.4; // Cyan glow

  // Steel blue distant structures
  float structures = pow(noise5d(rayDir * 4.0, v * 1.5), 6.0);
  color += vec3(0.2, 0.3, 0.5) * structures * 0.3;

  return color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  // Dynamic camera system
  vec3 camPos, lookAt;
  float vCoord;
  getCameraShot(u_time, camPos, lookAt, vCoord);

  vec3 forward = normalize(lookAt - camPos);
  vec3 right = normalize(cross(vec3(0, 1, 0), forward));
  vec3 up = cross(forward, right);
  vec3 rayDir3D = normalize(forward + uv.x * right + uv.y * up);

  // Convert to 5D (v is 5th dimension)
  vec4 ro = vec4(camPos, 0.0);
  vec4 rd = vec4(rayDir3D, 0.0);

  // Apply 5D rotations
  float t = u_time * 0.25;
  ro = rotateXW(t * 0.6) * rotateYZ(t * 0.8) * ro;
  rd = rotateXW(t * 0.6) * rotateYZ(t * 0.8) * rd;
  ro = rotateZW(t * 0.5) * rotateYW(t * 0.4) * ro;
  rd = rotateZW(t * 0.5) * rotateYW(t * 0.4) * rd;

  // Start with rich background
  vec3 color = getBackground(rd, vCoord);

  // Add membrane layers to environment
  vec4 membranePoint = ro + rd * 8.0;
  color += membraneLayers(membranePoint, vCoord);

  // Volumetric synaptic fog (7 samples)
  float volDist = 0.0;
  float stepSize = MAX_DIST / float(VOL_SAMPLES);
  vec3 fogColor = vec3(0.0);

  for(int i = 0; i < VOL_SAMPLES; i++) {
    volDist += stepSize;
    vec4 p = ro + rd * volDist;

    float density = synapticFog(p, vCoord);

    if(density > 0.01) {
      // Color varies by depth and V-dimension
      float depth = volDist / MAX_DIST;
      float vDepth = abs(p.w + vCoord) * 0.15;

      // Electric cyan fog with indigo depth
      vec3 fogCol = mix(
        vec3(0.0, 0.6, 0.8),   // Electric cyan
        vec3(0.15, 0.08, 0.35), // Deep indigo
        vDepth
      );

      // Add some orange variation (bio-organic)
      float variation = noise5d(p * 3.0, vCoord);
      fogCol = mix(fogCol, vec3(0.6, 0.25, 0.1), variation * 0.2);

      fogColor += fogCol * density * 0.22;
    }
  }

  color += fogColor;

  // Add electrical dendrite discharges
  vec4 dischargePoint = ro + rd * 4.0;
  color += dendriteDischarge(dischargePoint, vCoord);

  // Ray march neural network structures
  float d = rayMarch(ro, rd, vCoord);

  if(d < MAX_DIST) {
    vec4 p = ro + rd * d;
    vec4 normal = getNormal5D(p, vCoord);

    // Determine if we hit soma or dendrite
    float nearestSoma = MAX_DIST;
    int somaID = 0;
    for(int i = 0; i < 8; i++) {
      vec4 neuronPos = getNeuronPos(i, vCoord);
      float dist = length(p - neuronPos);
      if(dist < nearestSoma) {
        nearestSoma = dist;
        somaID = i;
      }
    }

    vec3 neuralColor;

    if(nearestSoma < 0.3) {
      // Hit soma (cell body) - blood red with electrical activity
      neuralColor = vec3(0.7, 0.05, 0.1); // Blood crimson

      // Pulsing electrical activity
      float pulse = sin(u_time * 3.0 + float(somaID) * 0.7) * 0.5 + 0.5;
      neuralColor += vec3(0.3, 0.3, 0.0) * pulse * 0.5; // Gold pulse

    } else {
      // Hit dendrite - steel blue bio-tech
      neuralColor = vec3(0.2, 0.4, 0.6); // Steel blue

      // Signal traveling along dendrite
      float signalDist = length(p.xy);
      float signal = signalPulse(signalDist, u_time, 0.5);
      neuralColor += vec3(0.0, 0.8, 0.4) * signal * 0.7; // Green signal
    }

    // Multiple light sources for organic feel
    vec4 light1 = normalize(vec4(3.0, 4.0, 2.0, 1.0));
    vec4 light2 = normalize(vec4(-2.0, -1.0, 3.0, -1.5));
    vec4 light3 = normalize(vec4(1.0, -3.0, -1.0, 2.0));

    float diff1 = max(dot(normal, light1), 0.0);
    float diff2 = max(dot(normal, light2), 0.0) * 0.4;
    float diff3 = max(dot(normal, light3), 0.0) * 0.3;

    // Subsurface scattering (organic translucency)
    float sss = pow(max(dot(normal, -rd), 0.0), 2.0) * 0.4;

    // Ambient (no pure black)
    float ambient = 0.25;

    float lighting = ambient + diff1 + diff2 + diff3 + sss;

    // Specular highlights (harsh white on wet bio-surfaces)
    vec4 viewDir = normalize(-rd);
    vec4 reflectDir = reflect(-light1, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);

    neuralColor = neuralColor * lighting + vec3(1.0) * spec * 0.6;

    // Add fresnel glow (electric cyan rim light)
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
    neuralColor += vec3(0.0, 0.5, 0.7) * fresnel * 0.4;

    // Mix with fog/environment based on depth
    float fogMix = smoothstep(5.0, 15.0, d);
    color = mix(neuralColor, color, fogMix * 0.3);
  }

  // Slight vignette for focus
  float vignette = 1.0 - length(uv) * 0.25;
  color *= vignette;

  // Output
  gl_FragColor = vec4(color, 1.0);
}
`;

let vert = `
attribute vec3 aPosition;
void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

let theShader;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  theShader = createShader(vert, frag);
}

function draw() {
  shader(theShader);
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform('u_time', millis() / 1000.0);
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
