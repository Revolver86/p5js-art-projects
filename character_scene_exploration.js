// EXPLORATION SCENE - Characters investigating and examining the alien entity
// Curious movements, approaching and retreating, studying from different angles

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

let explorers = [];
let observers = [];
let lightPositions = [];

// Exploration behaviors
const EXPLORATION_MODES = {
  APPROACHING: 'approaching',       // Moving closer to entity
  RETREATING: 'retreating',        // Moving away cautiously
  CIRCLING: 'circling',            // Orbiting to see different angles
  EXAMINING_CLOSE: 'examining_close', // Very close inspection
  EXAMINING_FAR: 'examining_far',  // Studying from distance
  SCANNING: 'scanning',            // Moving up and down to scan
  CAUTIOUS: 'cautious',            // Careful approach-retreat cycles
  DARTING: 'darting'               // Quick movements, nervous energy
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
  initializeExplorers();
  initializeObservers();
  initializeLights();
}

function initializeLights() {
  // Searchlight-style lighting following the action
  lightPositions = [
    { x: 0, y: -600, z: 0, r: 255, g: 245, b: 230, pattern: 'spotlight', speed: 0.2, radius: 400 },
    { x: 500, y: 0, z: 500, r: 200, g: 230, b: 255, pattern: 'tracking', speed: 0.15, radius: 500, trackEntity: 0 },
    { x: -500, y: 0, z: -500, r: 255, g: 220, b: 200, pattern: 'tracking', speed: 0.18, radius: 500, trackEntity: 1 },
    { x: 0, y: 400, z: 700, r: 230, g: 240, b: 255, pattern: 'sweeping', speed: 0.12, radius: 600 },
    { x: -700, y: 200, z: 0, r: 255, g: 235, b: 220, pattern: 'sweeping', speed: 0.14, radius: 550 }
  ];
}

function initializeExplorers() {
  // Active investigators closely examining the entity
  const explorerCount = 24;
  const modes = Object.values(EXPLORATION_MODES);

  for (let i = 0; i < explorerCount; i++) {
    let angle = (i / explorerCount) * TWO_PI;

    explorers.push({
      id: i,
      size: random(36, 48),
      // Initial position
      baseAngle: angle,
      baseHeight: random(-100, 300),
      // Exploration mode
      mode: modes[i % modes.length],
      curiosity: random(0.6, 1.0),
      caution: random(0.3, 0.9),
      // Movement parameters
      approachSpeed: random(0.05, 0.15),
      minRadius: random(150, 250),
      maxRadius: random(400, 700),
      currentRadius: random(300, 500),
      cycleSpeed: random(0.03, 0.08),
      // Vertical scanning
      scanSpeed: random(0.1, 0.3),
      scanRange: random(80, 180),
      // Rotation around entity
      orbitSpeed: random(0.05, 0.2) * (random() > 0.5 ? 1 : -1),
      // Focus point on entity
      focusHeight: random(-400, 250),
      phaseOffset: random(TWO_PI)
    });
  }
}

function initializeObservers() {
  // Characters observing from a distance
  const observerCount = 107;

  for (let i = 0; i < observerCount; i++) {
    let angle = random(TWO_PI);
    let radius = random(800, 1500);
    let x = cos(angle) * radius;
    let z = sin(angle) * radius;
    let y = random(-300, 400);

    // Interest level determines movement
    let interest = random(0.2, 1.0);

    observers.push({
      id: i,
      baseX: x,
      baseY: y,
      baseZ: z,
      size: random(30, 40),
      interest: interest,
      // Slight movement toward entity based on interest
      driftSpeed: random(0.02, 0.08),
      driftAmount: interest * random(30, 80),
      swayAmount: random(8, 20),
      swaySpeed: random(0.15, 0.4),
      // Occasionally look away
      attentionCycle: random(0.05, 0.15),
      phaseOffset: random(TWO_PI)
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

  // INVESTIGATION LIGHTING
  ambientLight(18, 18, 22);

  let t = frameCount * 0.001;

  for (let i = 0; i < lightPositions.length; i++) {
    let light = lightPositions[i];
    let lx, ly, lz;

    if (light.pattern === 'spotlight') {
      lx = sin(t * light.speed) * light.radius;
      ly = light.y;
      lz = cos(t * light.speed) * light.radius;
    } else if (light.pattern === 'tracking' && explorers[light.trackEntity]) {
      let explorer = explorers[light.trackEntity];
      let explorerPos = getExplorerPosition(explorer, t);
      lx = explorerPos.x + light.x * 0.3;
      ly = explorerPos.y + 300;
      lz = explorerPos.z + light.z * 0.3;
    } else if (light.pattern === 'sweeping') {
      lx = light.x + cos(t * light.speed) * light.radius;
      ly = light.y + sin(t * light.speed * 0.7) * 200;
      lz = light.z + sin(t * light.speed) * light.radius * 0.5;
    } else {
      lx = light.x;
      ly = light.y;
      lz = light.z;
    }

    pointLight(light.r, light.g, light.b, lx, ly, lz);
  }

  // DYNAMIC CAMERA - following the exploration
  let camMode = floor(t * 0.12) % 4;
  let camX, camY, camZ, lookX, lookY, lookZ;

  if (camMode === 0) {
    // Wide shot - see all explorers
    let camAngle = t * 0.1;
    camX = cos(camAngle) * 900;
    camY = 350 + sin(t * 0.08) * 100;
    camZ = sin(camAngle) * 900;
    lookX = 0;
    lookY = 50;
    lookZ = 0;

  } else if (camMode === 1 && explorers.length > 0) {
    // Follow a specific explorer
    let followExplorer = explorers[floor(t * 0.3) % explorers.length];
    let explorerPos = getExplorerPosition(followExplorer, t);
    let camAngle = followExplorer.baseAngle + PI;
    camX = explorerPos.x + cos(camAngle) * 300;
    camY = explorerPos.y + 100;
    camZ = explorerPos.z + sin(camAngle) * 300;
    lookX = explorerPos.x;
    lookY = explorerPos.y;
    lookZ = explorerPos.z;

  } else if (camMode === 2) {
    // Low angle looking up at entity
    let camAngle = t * 0.15;
    camX = cos(camAngle) * 400;
    camY = -100 + sin(t * 0.1) * 50;
    camZ = sin(camAngle) * 400;
    lookX = 0;
    lookY = 150;
    lookZ = 0;

  } else {
    // High angle overview
    let camAngle = t * 0.08;
    camX = cos(camAngle) * 700;
    camY = 500 + cos(t * 0.05) * 150;
    camZ = sin(camAngle) * 700;
    lookX = sin(t * 0.12) * 100;
    lookY = 0;
    lookZ = cos(t * 0.12) * 100;
  }

  camera(camX, camY, camZ, lookX, lookY, lookZ, 0, 1, 0);

  drawChamber();

  // Alien entity - subject of investigation
  push();
  rotateY(frameCount * 0.0006);
  rotateX(frameCount * 0.0003);
  texture(textureImg);
  drawAlienEntity();
  pop();

  // Draw all characters
  drawExplorers(camX, camY, camZ, t);
  drawObservers(camX, camY, camZ, t);
}

function getExplorerPosition(explorer, t) {
  let time = t + explorer.phaseOffset;
  let pos = { x: 0, y: 0, z: 0 };

  // Apply exploration mode
  switch(explorer.mode) {
    case EXPLORATION_MODES.APPROACHING:
      // Gradually moving closer
      let approachProgress = (sin(time * explorer.cycleSpeed) * 0.5 + 0.5);
      explorer.currentRadius = lerp(explorer.maxRadius, explorer.minRadius, approachProgress);
      break;

    case EXPLORATION_MODES.RETREATING:
      // Pulling back
      let retreatProgress = (sin(time * explorer.cycleSpeed) * 0.5 + 0.5);
      explorer.currentRadius = lerp(explorer.minRadius, explorer.maxRadius, retreatProgress);
      break;

    case EXPLORATION_MODES.CIRCLING:
      // Maintaining distance, rotating
      explorer.currentRadius = (explorer.minRadius + explorer.maxRadius) / 2;
      explorer.currentRadius += sin(time * 0.2) * 30;
      break;

    case EXPLORATION_MODES.EXAMINING_CLOSE:
      // Very close, minimal movement
      explorer.currentRadius = explorer.minRadius + sin(time * 0.15) * 20;
      break;

    case EXPLORATION_MODES.EXAMINING_FAR:
      // Distant observation
      explorer.currentRadius = explorer.maxRadius + sin(time * 0.1) * 40;
      break;

    case EXPLORATION_MODES.SCANNING:
      // Moving up and down while maintaining distance
      explorer.currentRadius = (explorer.minRadius + explorer.maxRadius) / 2;
      break;

    case EXPLORATION_MODES.CAUTIOUS:
      // Approach-retreat cycles
      let cautiousCycle = sin(time * explorer.cycleSpeed * 2);
      if (cautiousCycle > 0) {
        explorer.currentRadius = lerp(explorer.maxRadius, explorer.minRadius, cautiousCycle);
      } else {
        explorer.currentRadius = lerp(explorer.minRadius, explorer.maxRadius, -cautiousCycle);
      }
      break;

    case EXPLORATION_MODES.DARTING:
      // Quick, jerky movements
      explorer.currentRadius = (explorer.minRadius + explorer.maxRadius) / 2 +
                              sin(time * 3) * 80 + cos(time * 5) * 40;
      break;
  }

  // Calculate position
  let angle = explorer.baseAngle + time * explorer.orbitSpeed;
  pos.x = cos(angle) * explorer.currentRadius;
  pos.z = sin(angle) * explorer.currentRadius;

  // Height behavior
  if (explorer.mode === EXPLORATION_MODES.SCANNING) {
    pos.y = explorer.baseHeight + sin(time * explorer.scanSpeed) * explorer.scanRange;
  } else if (explorer.mode === EXPLORATION_MODES.DARTING) {
    pos.y = explorer.baseHeight + sin(time * 2.5) * 60 + cos(time * 3.8) * 40;
  } else {
    pos.y = explorer.baseHeight + sin(time * 0.3) * 30;
  }

  return pos;
}

function drawExplorers(camX, camY, camZ, t) {
  for (let i = 0; i < explorers.length; i++) {
    if (!faceImages[i] || !explorers[i]) continue;

    let explorer = explorers[i];
    let pos = getExplorerPosition(explorer, t);

    push();
    translate(pos.x, pos.y, pos.z);

    // Always face the entity - they're studying it
    let dx = -pos.x;
    let dy = explorer.focusHeight - pos.y;
    let dz = -pos.z;

    let angleToEntity = atan2(dx, dz);
    let horizontalDist = sqrt(dx*dx + dz*dz);
    let pitch = -atan2(dy, horizontalDist);

    rotateY(angleToEntity + PI);
    rotateX(pitch * 0.6); // Slight vertical tilt

    texture(faceImages[i]);
    sphere(explorer.size, 24, 24);
    pop();
  }
}

function drawObservers(camX, camY, camZ, t) {
  let observerStart = explorers.length;

  for (let i = 0; i < observers.length; i++) {
    let imgIndex = observerStart + i;
    if (!faceImages[imgIndex] || !observers[i]) continue;

    let observer = observers[i];
    let time = t + observer.phaseOffset;

    // Drift slightly toward entity based on interest
    let driftX = sin(time * observer.driftSpeed) * observer.driftAmount;
    let driftZ = cos(time * observer.driftSpeed * 0.7) * observer.driftAmount;

    // Direction toward entity
    let angleToEntity = atan2(-observer.baseZ, -observer.baseX);
    let driftTowardEntity = observer.interest * 0.3;

    let x = observer.baseX + driftX + cos(angleToEntity) * driftTowardEntity * 100;
    let y = observer.baseY + sin(time * observer.swaySpeed) * observer.swayAmount;
    let z = observer.baseZ + driftZ + sin(angleToEntity) * driftTowardEntity * 100;

    push();
    translate(x, y, z);

    // Attention cycle - sometimes look away
    let attention = (sin(time * observer.attentionCycle) * 0.5 + 0.5);
    let lookAtEntity = attention > 0.3;

    if (lookAtEntity) {
      // Look at entity
      let dx = -x;
      let dz = -z;
      let angle = atan2(dx, dz);
      rotateY(angle + PI);
    } else {
      // Face camera
      let dxCam = camX - x;
      let dzCam = camZ - z;
      let angle = atan2(dxCam, dzCam);
      rotateY(angle + PI);
    }

    texture(faceImages[imgIndex]);
    sphere(observer.size, 24, 24);
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
