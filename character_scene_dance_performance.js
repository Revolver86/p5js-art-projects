// DANCE PERFORMANCE SCENE - Individual characters with unique movement styles
// Characters perform synchronized and improvised movements around alien entity

let faceImages = [];
let textureImg;
let chamberTextures = [];
let loadedCount = 0;
let totalAssets = 0;
let isLoaded = false;

const faceURLs = [
  "https://cdn.midjourney.com/a9739827-6855-409a-950f-c8225c4dabb3/0_3.png",
  "https://cdn.midjourney.com/a9739827-6855-409a-950f-c8225c4dabb3/0_2.png",
  "https://cdn.midjourney.com/a9739827-6855-409a-950f-c8225c4dabb3/0_1.png",
  "https://cdn.midjourney.com/a9739827-6855-409a-950f-c8225c4dabb3/0_0.png",
  "https://cdn.midjourney.com/ed011247-c5d0-4f51-af18-ebb2e1bc6b91/0_3.png",
  "https://cdn.midjourney.com/ed011247-c5d0-4f51-af18-ebb2e1bc6b91/0_2.png",
  "https://cdn.midjourney.com/ed011247-c5d0-4f51-af18-ebb2e1bc6b91/0_1.png",
  "https://cdn.midjourney.com/ed011247-c5d0-4f51-af18-ebb2e1bc6b91/0_0.png",
  "https://cdn.midjourney.com/50111900-c1c1-4e99-a7ed-cafe710ba57d/0_3.png",
  "https://cdn.midjourney.com/50111900-c1c1-4e99-a7ed-cafe710ba57d/0_2.png",
  "https://cdn.midjourney.com/50111900-c1c1-4e99-a7ed-cafe710ba57d/0_1.png",
  "https://cdn.midjourney.com/50111900-c1c1-4e99-a7ed-cafe710ba57d/0_0.png",
  "https://cdn.midjourney.com/0bc8914d-6dea-4c16-bd4c-06e0cacddc3c/0_3.png",
  "https://cdn.midjourney.com/0bc8914d-6dea-4c16-bd4c-06e0cacddc3c/0_2.png",
  "https://cdn.midjourney.com/0bc8914d-6dea-4c16-bd4c-06e0cacddc3c/0_1.png",
  "https://cdn.midjourney.com/25f1c220-bd6a-4237-b76e-6a3420780853/0_3.png",
  "https://cdn.midjourney.com/25f1c220-bd6a-4237-b76e-6a3420780853/0_0.png",
  "https://cdn.midjourney.com/6044e689-4cad-43a1-aca9-ab181c9dc88b/0_3.png",
  "https://cdn.midjourney.com/6044e689-4cad-43a1-aca9-ab181c9dc88b/0_2.png",
  "https://cdn.midjourney.com/6044e689-4cad-43a1-aca9-ab181c9dc88b/0_1.png",
  "https://cdn.midjourney.com/6044e689-4cad-43a1-aca9-ab181c9dc88b/0_0.png",
  "https://cdn.midjourney.com/d25884b4-2c20-45fa-8778-97645aaa1152/0_3.png",
  "https://cdn.midjourney.com/d25884b4-2c20-45fa-8778-97645aaa1152/0_2.png",
  "https://cdn.midjourney.com/d25884b4-2c20-45fa-8778-97645aaa1152/0_0.png",
  "https://cdn.midjourney.com/7f7e826c-a405-48fe-a647-02e180053c16/0_2.png",
  "https://cdn.midjourney.com/7f7e826c-a405-48fe-a647-02e180053c16/0_1.png",
  "https://cdn.midjourney.com/7f7e826c-a405-48fe-a647-02e180053c16/0_0.png",
  "https://cdn.midjourney.com/d878d13d-f56b-407b-acc2-fca3e0f35415/0_3.png",
  "https://cdn.midjourney.com/d878d13d-f56b-407b-acc2-fca3e0f35415/0_2.png",
  "https://cdn.midjourney.com/d878d13d-f56b-407b-acc2-fca3e0f35415/0_1.png",
  "https://cdn.midjourney.com/d878d13d-f56b-407b-acc2-fca3e0f35415/0_0.png"
];

const chamberTextureURLs = [
  "https://cdn.midjourney.com/175aa6b8-5850-427c-bdd8-9e6a0493f07b/0_0.png",
  "https://cdn.midjourney.com/175aa6b8-5850-427c-bdd8-9e6a0493f07b/0_1.png",
  "https://cdn.midjourney.com/175aa6b8-5850-427c-bdd8-9e6a0493f07b/0_2.png",
  "https://cdn.midjourney.com/175aa6b8-5850-427c-bdd8-9e6a0493f07b/0_3.png",
  "https://cdn.midjourney.com/f15d9ad7-ef7e-4f30-a005-0b72695c989f/0_0.png",
  "https://cdn.midjourney.com/f15d9ad7-ef7e-4f30-a005-0b72695c989f/0_1.png",
  "https://cdn.midjourney.com/f15d9ad7-ef7e-4f30-a005-0b72695c989f/0_2.png",
  "https://cdn.midjourney.com/f15d9ad7-ef7e-4f30-a005-0b72695c989f/0_3.png"
];

let dancers = [];
let audience = [];
let lightPositions = [];

// Movement archetypes for different dance styles
const MOVEMENT_STYLES = {
  FLUID: 'fluid',           // Smooth, wave-like movements
  SHARP: 'sharp',           // Angular, staccato movements
  SPINNING: 'spinning',     // Rotation-focused
  BOUNCING: 'bouncing',     // Vertical, rhythmic
  FLOWING: 'flowing',       // Large sweeping arcs
  TWITCHY: 'twitchy',       // Quick, nervous energy
  GRACEFUL: 'graceful',     // Slow, elegant
  ENERGETIC: 'energetic'    // Fast, high-energy
};

function preload() {
  totalAssets = faceURLs.length + 1 + chamberTextureURLs.length;

  for (let i = 0; i < faceURLs.length; i++) {
    loadImage(faceURLs[i], img => {
      faceImages[i] = img;
      loadedCount++;
    }, () => {
      loadedCount++;
    });
  }

  loadImage('https://i.imgur.com/JodlSDf.png', img => {
    textureImg = img;
    loadedCount++;
  }, () => {
    loadedCount++;
  });

  for (let i = 0; i < chamberTextureURLs.length; i++) {
    loadImage(chamberTextureURLs[i], img => {
      chamberTextures[i] = img;
      loadedCount++;
    }, () => {
      loadedCount++;
    });
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  initializeDancers();
  initializeAudience();
  initializeLights();
}

function initializeLights() {
  // Stage lighting - dramatic and colorful
  lightPositions = [
    { x: 0, y: -800, z: 0, r: 255, g: 50, b: 150, pattern: 'orbit', speed: 0.3, radius: 600 },
    { x: 600, y: -400, z: 600, r: 50, g: 200, b: 255, pattern: 'figure8', speed: 0.4, radius: 700 },
    { x: -600, y: -400, z: -600, r: 255, g: 200, b: 50, pattern: 'vertical', speed: 0.5, radius: 500 },
    { x: 0, y: 200, z: 800, r: 150, g: 50, b: 255, pattern: 'drift', speed: 0.2, radius: 400 },
    { x: 400, y: 300, z: -300, r: 255, g: 100, b: 100, pattern: 'pulse', speed: 0.6, radius: 400 },
    { x: -400, y: 300, z: 400, r: 100, g: 255, b: 200, pattern: 'pulse', speed: 0.8, radius: 500 }
  ];
}

function initializeDancers() {
  // Main performers - each with unique movement personality
  const dancerCount = 12;
  const styles = Object.values(MOVEMENT_STYLES);

  for (let i = 0; i < dancerCount; i++) {
    let angle = (i / dancerCount) * TWO_PI;
    let radius = 300 + (i % 3) * 80;

    dancers.push({
      id: i,
      size: random(35, 50),
      // Base position on circle
      baseRadius: radius,
      baseAngle: angle,
      baseHeight: 100,
      // Movement personality
      style: styles[i % styles.length],
      energy: random(0.5, 1.5),
      amplitude: random(40, 120),
      frequency: random(0.3, 1.2),
      phaseOffset: random(TWO_PI),
      // Individual movement parameters
      verticalAmp: random(30, 100),
      radialAmp: random(20, 60),
      spinSpeed: random(0.2, 0.8) * (random() > 0.5 ? 1 : -1),
      bobSpeed: random(0.4, 1.0),
      // Interaction
      interactionRadius: random(50, 150),
      awarenessRadius: 200,
      nearbyDancers: []
    });
  }
}

function initializeAudience() {
  // Audience members watching and responding to the performance
  const audienceCount = 119;

  for (let i = 0; i < audienceCount; i++) {
    let angle = random(TWO_PI);
    let radius = random(600, 1200);
    let x = cos(angle) * radius;
    let z = sin(angle) * radius;
    let y = random(-200, 300);

    // Some audience members are closer, more engaged
    let distance = sqrt(x*x + z*z);
    let engagement = map(distance, 600, 1200, 1.0, 0.2);

    audience.push({
      id: i,
      baseX: x,
      baseY: y,
      baseZ: z,
      size: random(28, 38),
      swayAmount: random(8, 25),
      swaySpeed: random(0.15, 0.5),
      engagement: engagement,
      focusPoint: { x: 0, y: 100, z: 0 },
      reactionDelay: random(0, PI)
    });
  }
}

function draw() {
  if (loadedCount < totalAssets) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(`LOADING: ${loadedCount}/${totalAssets}`, 0, 0);

    let barWidth = width * 0.6;
    let barHeight = 20;
    let progress = loadedCount / totalAssets;

    push();
    translate(-barWidth/2, 40);
    stroke(255);
    noFill();
    rect(0, 0, barWidth, barHeight);
    noStroke();
    fill(255);
    rect(0, 0, barWidth * progress, barHeight);
    pop();

    return;
  }

  if (!isLoaded) {
    isLoaded = true;
  }

  background(0);
  noStroke();

  // DYNAMIC LIGHTING
  ambientLight(10, 10, 15);

  let t = frameCount * 0.001;

  for (let light of lightPositions) {
    let lx, ly, lz;

    if (light.pattern === 'orbit') {
      lx = cos(t * light.speed) * light.radius;
      ly = light.y;
      lz = sin(t * light.speed) * light.radius;
    } else if (light.pattern === 'figure8') {
      lx = sin(t * light.speed) * light.radius;
      ly = sin(t * light.speed * 2) * 200;
      lz = cos(t * light.speed) * light.radius;
    } else if (light.pattern === 'vertical') {
      lx = light.x;
      ly = sin(t * light.speed) * 500;
      lz = light.z;
    } else if (light.pattern === 'drift') {
      lx = sin(t * light.speed * 0.7) * light.radius;
      ly = cos(t * light.speed * 0.5) * 300 + 200;
      lz = cos(t * light.speed * 0.9) * light.radius;
    } else if (light.pattern === 'pulse') {
      let intensity = (sin(t * light.speed * 5) + 1) * 0.5;
      lx = light.x;
      ly = light.y;
      lz = light.z;
      pointLight(light.r * intensity, light.g * intensity, light.b * intensity, lx, ly, lz);
      continue;
    }

    pointLight(light.r, light.g, light.b, lx, ly, lz);
  }

  // DYNAMIC CAMERA - sweeping shots of the performance
  let camAngle = t * 0.15;
  let camRadius = 700 + sin(t * 0.1) * 200;
  let camHeight = 250 + cos(t * 0.08) * 150;

  let camX = cos(camAngle) * camRadius;
  let camY = camHeight;
  let camZ = sin(camAngle) * camRadius;

  // Sometimes focus on specific dancers
  let focusMode = floor(t * 0.1) % 4;
  let lookX, lookY, lookZ;

  if (focusMode === 0) {
    // Center stage
    lookX = 0;
    lookY = 100;
    lookZ = 0;
  } else if (focusMode === 1 && dancers.length > 0) {
    // Follow a specific dancer
    let focusDancer = dancers[floor(t * 0.5) % dancers.length];
    let pos = getDancerPosition(focusDancer, t);
    lookX = pos.x;
    lookY = pos.y;
    lookZ = pos.z;
  } else if (focusMode === 2) {
    // Wide shot showing everyone
    lookX = sin(t * 0.3) * 100;
    lookY = 50;
    lookZ = cos(t * 0.3) * 100;
  } else {
    // Alien entity focus
    lookX = 0;
    lookY = 0;
    lookZ = 0;
  }

  camera(camX, camY, camZ, lookX, lookY, lookZ, 0, 1, 0);

  drawChamber();

  // Alien entity at center
  push();
  rotateY(frameCount * 0.001);
  rotateX(frameCount * 0.0005);
  texture(textureImg);
  drawAlienEntity();
  pop();

  // Draw all characters
  drawDancers(camX, camY, camZ, t);
  drawAudience(camX, camY, camZ, t);
}

function getDancerPosition(dancer, t) {
  let time = t + dancer.phaseOffset;
  let pos = { x: 0, y: 0, z: 0 };

  // Base circular position
  let angle = dancer.baseAngle + time * 0.1 * dancer.energy;
  let radius = dancer.baseRadius;

  // Apply movement style
  switch(dancer.style) {
    case MOVEMENT_STYLES.FLUID:
      // Smooth wave-like motion
      pos.x = cos(angle) * (radius + sin(time * dancer.frequency) * dancer.radialAmp);
      pos.y = dancer.baseHeight + sin(time * dancer.bobSpeed) * dancer.verticalAmp;
      pos.z = sin(angle) * (radius + sin(time * dancer.frequency) * dancer.radialAmp);
      break;

    case MOVEMENT_STYLES.SHARP:
      // Angular, geometric movements
      let sharpAngle = floor(time * dancer.frequency * 2) * (PI / 4);
      pos.x = cos(angle + sharpAngle) * radius;
      pos.y = dancer.baseHeight + (floor(sin(time * dancer.bobSpeed) * 4) / 4) * dancer.verticalAmp;
      pos.z = sin(angle + sharpAngle) * radius;
      break;

    case MOVEMENT_STYLES.SPINNING:
      // Rapid rotation with vertical motion
      let spinAngle = angle + time * dancer.spinSpeed * 3;
      pos.x = cos(spinAngle) * radius;
      pos.y = dancer.baseHeight + sin(time * dancer.bobSpeed * 2) * dancer.verticalAmp * 0.5;
      pos.z = sin(spinAngle) * radius;
      break;

    case MOVEMENT_STYLES.BOUNCING:
      // Emphasis on vertical movement
      pos.x = cos(angle) * radius;
      pos.y = dancer.baseHeight + abs(sin(time * dancer.bobSpeed * 2)) * dancer.verticalAmp * 1.5;
      pos.z = sin(angle) * radius;
      break;

    case MOVEMENT_STYLES.FLOWING:
      // Large sweeping arcs
      let flowRadius = radius + cos(time * dancer.frequency * 0.5) * dancer.amplitude;
      let flowAngle = angle + sin(time * 0.3) * PI * 0.5;
      pos.x = cos(flowAngle) * flowRadius;
      pos.y = dancer.baseHeight + sin(time * dancer.bobSpeed * 0.5) * dancer.verticalAmp;
      pos.z = sin(flowAngle) * flowRadius;
      break;

    case MOVEMENT_STYLES.TWITCHY:
      // Quick, jittery movements
      pos.x = cos(angle) * radius + sin(time * 10) * 20;
      pos.y = dancer.baseHeight + (sin(time * 8) * 0.5 + 0.5) * dancer.verticalAmp;
      pos.z = sin(angle) * radius + cos(time * 12) * 20;
      break;

    case MOVEMENT_STYLES.GRACEFUL:
      // Slow, elegant curves
      let graceAngle = angle + sin(time * 0.2) * PI * 0.3;
      pos.x = cos(graceAngle) * (radius + sin(time * 0.3) * dancer.radialAmp * 0.5);
      pos.y = dancer.baseHeight + (sin(time * 0.4) * 0.5 + 0.5) * dancer.verticalAmp;
      pos.z = sin(graceAngle) * (radius + sin(time * 0.3) * dancer.radialAmp * 0.5);
      break;

    case MOVEMENT_STYLES.ENERGETIC:
      // Fast, high-energy
      let energyAngle = angle + sin(time * dancer.frequency * 2) * PI * 0.2;
      pos.x = cos(energyAngle) * (radius + sin(time * 2) * dancer.radialAmp);
      pos.y = dancer.baseHeight + abs(sin(time * dancer.bobSpeed * 3)) * dancer.verticalAmp * 1.2;
      pos.z = sin(energyAngle) * (radius + sin(time * 2) * dancer.radialAmp);
      break;
  }

  return pos;
}

function drawDancers(camX, camY, camZ, t) {
  for (let i = 0; i < dancers.length; i++) {
    if (!faceImages[i] || !dancers[i]) continue;

    let dancer = dancers[i];
    let pos = getDancerPosition(dancer, t);

    push();
    translate(pos.x, pos.y, pos.z);

    // Face camera with slight offset based on movement
    let dxCam = camX - pos.x;
    let dzCam = camZ - pos.z;
    let angleToCamera = atan2(dxCam, dzCam);

    // Add rotation based on movement style
    let extraRotation = 0;
    if (dancer.style === MOVEMENT_STYLES.SPINNING) {
      extraRotation = t * dancer.spinSpeed * 2;
    }

    rotateY(angleToCamera + PI + extraRotation);

    texture(faceImages[i]);
    sphere(dancer.size, 24, 24);
    pop();
  }
}

function drawAudience(camX, camY, camZ, t) {
  let audienceStart = dancers.length;

  for (let i = 0; i < audience.length; i++) {
    let imgIndex = audienceStart + i;
    if (!faceImages[imgIndex] || !audience[i]) continue;

    let member = audience[i];

    // Gentle swaying, more for engaged audience
    let x = member.baseX + sin(t * member.swaySpeed + i) * member.swayAmount;
    let y = member.baseY + cos(t * member.swaySpeed * 0.7 + i) * member.swayAmount * 0.5;
    let z = member.baseZ + cos(t * member.swaySpeed * 0.8 + i) * member.swayAmount * 0.6;

    // React to performance energy
    let performanceEnergy = abs(sin(t * 0.5)) * member.engagement;
    y += sin(t * 2 + member.reactionDelay) * 20 * performanceEnergy;

    push();
    translate(x, y, z);

    // Look toward stage
    let dx = member.focusPoint.x - x;
    let dz = member.focusPoint.z - z;
    let angleToStage = atan2(dx, dz);

    // Blend between camera and stage
    let dxCam = camX - x;
    let dzCam = camZ - z;
    let angleToCamera = atan2(dxCam, dzCam);

    let finalAngle = lerp(angleToCamera, angleToStage, member.engagement);
    rotateY(finalAngle + PI);

    texture(faceImages[imgIndex]);
    sphere(member.size, 24, 24);
    pop();
  }
}

function drawChamber() {
  let phi = (1 + sqrt(5)) / 2;
  let outerRadius = 2800;

  let vertices = [];
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      vertices.push([i * outerRadius * 0.6, j * outerRadius * 0.6, 0]);
      vertices.push([0, i * outerRadius * 0.6, j * outerRadius * 0.6]);
      vertices.push([i * outerRadius * 0.6, 0, j * outerRadius * 0.6]);

      for (let k = -1; k <= 1; k += 2) {
        vertices.push([i * outerRadius * 0.6 / phi, j * outerRadius * 0.6 * phi, k * outerRadius * 0.6]);
        vertices.push([k * outerRadius * 0.6, i * outerRadius * 0.6 / phi, j * outerRadius * 0.6 * phi]);
        vertices.push([j * outerRadius * 0.6 * phi, k * outerRadius * 0.6, i * outerRadius * 0.6 / phi]);
      }
    }
  }

  let faceGroups = [
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19],
    [0, 5, 10, 15, 1], [2, 7, 12, 17, 3], [4, 9, 14, 19, 0], [1, 6, 11, 16, 2]
  ];

  for (let i = 0; i < 8; i++) {
    if (!chamberTextures[i % chamberTextures.length]) continue;
    push();
    texture(chamberTextures[i % chamberTextures.length]);
    beginShape();
    for (let idx of faceGroups[i]) {
      if (vertices[idx]) {
        vertex(vertices[idx][0], vertices[idx][1], vertices[idx][2], vertices[idx][0] * 2, vertices[idx][1] * 2);
      }
    }
    endShape(CLOSE);
    pop();
  }

  let t = (1 + sqrt(5)) / 2;
  let innerRadius = 2200;
  let icoVerts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ].map(v => [v[0] * innerRadius * 0.5, v[1] * innerRadius * 0.5, v[2] * innerRadius * 0.5]);

  let icoFaces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  for (let i = 0; i < icoFaces.length; i++) {
    if (!chamberTextures[i % chamberTextures.length]) continue;
    push();
    texture(chamberTextures[i % chamberTextures.length]);
    beginShape(TRIANGLES);
    for (let idx of icoFaces[i]) {
      let v = icoVerts[idx];
      vertex(v[0], v[1], v[2], v[0] + 1000, v[1] + 1000);
    }
    endShape();
    pop();
  }
}

function drawAlienEntity() {
  push();
  translate(0, 250, 0);
  scale(1.5, 0.8, 1.5);
  sphere(90, 32, 32);
  pop();

  push();
  translate(0, 150, 0);
  rotateX(PI * 0.05);
  cylinder(70, 200, 24, 1);
  pop();

  push();
  translate(0, 50, 0);
  scale(1.2, 1, 1.2);
  sphere(75, 32, 32);
  pop();

  push();
  translate(0, -50, 0);
  cylinder(55, 180, 24, 1);
  pop();

  push();
  translate(0, -140, 0);
  scale(1.3, 1.5, 1.1);
  sphere(85, 32, 32);
  pop();

  push();
  translate(0, -240, 0);
  rotateX(-PI * 0.03);
  cylinder(45, 160, 24, 1);
  pop();

  push();
  translate(0, -320, 0);
  scale(1, 1.3, 1);
  sphere(60, 32, 32);
  pop();

  push();
  translate(0, -400, 0);
  rotateX(PI);
  cylinder(25, 100, 16, 1);
  pop();

  for (let i = 0; i < 6; i++) {
    let angle = (i / 6) * TWO_PI;
    push();
    translate(cos(angle) * 80, 230, sin(angle) * 80);
    rotateZ(angle + PI/2);
    rotateX(PI * 0.4);
    drawFlowingLimb(140, 35, 8);
    pop();
  }

  for (let i = 0; i < 8; i++) {
    let angle = (i / 8) * TWO_PI + 0.3;
    push();
    translate(cos(angle) * 65, 120, sin(angle) * 65);
    rotateZ(angle + PI/2);
    rotateY(PI * 0.2);
    drawFlowingLimb(100, 28, 6);
    pop();
  }
}

function drawFlowingLimb(length, startRadius, endRadius) {
  let segments = 12;
  for (let i = 0; i < segments; i++) {
    let t = i / segments;
    let nextT = (i + 1) / segments;
    let x1 = sin(t * PI * 2) * 15 * t;
    let y1 = t * length;
    let z1 = cos(t * PI * 3) * 10 * t;
    let x2 = sin(nextT * PI * 2) * 15 * nextT;
    let y2 = nextT * length;
    let z2 = cos(nextT * PI * 3) * 10 * nextT;
    let r1 = lerp(startRadius, endRadius, t);
    push();
    translate(x1, y1, z1);
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dz = z2 - z1;
    let angle = atan2(sqrt(dx*dx + dz*dz), dy);
    let heading = atan2(dz, dx);
    rotateY(heading);
    rotateZ(angle);
    cylinder(r1, abs(y2 - y1) * 1.2, 16, 1);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
