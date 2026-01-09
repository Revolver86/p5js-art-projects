// MARKET/SOCIAL SCENE - Characters mingling, trading, socializing
// Dynamic group interactions and natural social behaviors around alien entity

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

let characters = [];
let socialGroups = [];
let lightPositions = [];

// Social behaviors
const SOCIAL_BEHAVIORS = {
  CONVERSING: 'conversing',       // Standing in groups, talking
  WANDERING: 'wandering',         // Moving around, exploring
  TRADING: 'trading',             // Exchange gestures
  OBSERVING: 'observing',         // Watching entity or others
  GESTURING: 'gesturing',         // Animated conversation
  BROWSING: 'browsing',           // Moving between groups
  LINGERING: 'lingering',         // Staying in one spot
  APPROACHING: 'approaching'      // Moving toward someone
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
  initializeSocialGroups();
  initializeCharacters();
  initializeLights();
}

function initializeLights() {
  // Bright, marketplace-style lighting
  lightPositions = [
    { x: 0, y: -700, z: 0, r: 255, g: 240, b: 220, pattern: 'static', speed: 0, radius: 0 },
    { x: 600, y: 200, z: 600, r: 255, g: 220, b: 180, pattern: 'gentle_sway', speed: 0.15, radius: 100 },
    { x: -600, y: 200, z: -600, r: 220, g: 240, b: 255, pattern: 'gentle_sway', speed: 0.2, radius: 120 },
    { x: 0, y: 300, z: 800, r: 255, g: 230, b: 200, pattern: 'gentle_sway', speed: 0.18, radius: 80 },
    { x: 800, y: 100, z: 0, r: 240, g: 255, b: 220, pattern: 'gentle_sway', speed: 0.12, radius: 90 },
    { x: -800, y: 100, z: 0, r: 255, g: 225, b: 240, pattern: 'gentle_sway', speed: 0.16, radius: 110 }
  ];
}

function initializeSocialGroups() {
  // Define social gathering spots
  const groupCount = 15;

  for (let i = 0; i < groupCount; i++) {
    let angle = (i / groupCount) * TWO_PI + random(-0.3, 0.3);
    let radius = random(300, 800);
    let x = cos(angle) * radius;
    let z = sin(angle) * radius;
    let y = random(0, 200);

    socialGroups.push({
      id: i,
      centerX: x,
      centerY: y,
      centerZ: z,
      radius: random(80, 180),
      memberCount: floor(random(2, 8)),
      members: [],
      energy: random(0.3, 1.0),
      activity: random(['conversing', 'trading', 'observing'])
    });
  }
}

function initializeCharacters() {
  const totalCharacters = 131;
  const behaviors = Object.values(SOCIAL_BEHAVIORS);

  // Assign some characters to groups
  let characterIndex = 0;

  for (let group of socialGroups) {
    for (let i = 0; i < group.memberCount; i++) {
      if (characterIndex >= totalCharacters) break;

      let angleInGroup = (i / group.memberCount) * TWO_PI + random(-0.5, 0.5);
      let distFromCenter = random(20, group.radius);

      characters.push({
        id: characterIndex,
        size: random(32, 45),
        // Position in group
        groupId: group.id,
        angleInGroup: angleInGroup,
        distFromCenter: distFromCenter,
        // Behavior
        behavior: SOCIAL_BEHAVIORS.CONVERSING,
        energy: random(0.5, 1.2),
        gestureFrequency: random(0.5, 2.0),
        gestureAmount: random(15, 40),
        // Movement within group
        swaySpeed: random(0.2, 0.6),
        bobAmount: random(8, 20),
        phaseOffset: random(TWO_PI),
        // Who they're interacting with
        focusCharacter: null,
        lookAtCenter: random() > 0.5
      });

      group.members.push(characterIndex);
      characterIndex++;
    }
  }

  // Remaining characters are wanderers
  for (let i = characterIndex; i < totalCharacters; i++) {
    let angle = random(TWO_PI);
    let radius = random(400, 1100);

    // Path for wandering
    let pathType = random(['circular', 'figure8', 'meandering']);
    let pathRadius = random(100, 300);
    let pathSpeed = random(0.05, 0.2);

    characters.push({
      id: i,
      size: random(30, 42),
      // Wandering behavior
      groupId: null,
      behavior: random([SOCIAL_BEHAVIORS.WANDERING, SOCIAL_BEHAVIORS.BROWSING, SOCIAL_BEHAVIORS.OBSERVING]),
      baseAngle: angle,
      baseRadius: radius,
      baseHeight: random(50, 250),
      // Path parameters
      pathType: pathType,
      pathRadius: pathRadius,
      pathSpeed: pathSpeed,
      phaseOffset: random(TWO_PI),
      // Movement
      energy: random(0.3, 0.9),
      bobAmount: random(10, 25),
      swaySpeed: random(0.3, 0.8)
    });
  }

  // Set focus characters for group members
  for (let char of characters) {
    if (char.groupId !== null) {
      let group = socialGroups[char.groupId];
      // Look at another random member of the group
      let otherMembers = group.members.filter(id => id !== char.id);
      if (otherMembers.length > 0) {
        char.focusCharacter = random(otherMembers);
      }
    }
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

  // BRIGHT AMBIENT LIGHTING
  ambientLight(25, 25, 28);

  let t = frameCount * 0.001;

  for (let light of lightPositions) {
    let lx, ly, lz;

    if (light.pattern === 'static') {
      lx = light.x;
      ly = light.y;
      lz = light.z;
    } else if (light.pattern === 'gentle_sway') {
      lx = light.x + sin(t * light.speed) * light.radius;
      ly = light.y + cos(t * light.speed * 0.7) * light.radius * 0.5;
      lz = light.z + cos(t * light.speed * 0.9) * light.radius;
    }

    pointLight(light.r, light.g, light.b, lx, ly, lz);
  }

  // DYNAMIC CAMERA - touring the marketplace
  let camAngle = t * 0.12;
  let camRadius = 850 + sin(t * 0.08) * 250;
  let camHeight = 250 + cos(t * 0.06) * 120;

  // Sometimes focus on specific groups
  let focusMode = floor(t * 0.15) % 5;
  let camX, camY, camZ, lookX, lookY, lookZ;

  if (focusMode === 0 && socialGroups.length > 0) {
    // Focus on a specific social group
    let focusGroup = socialGroups[floor(t * 0.2) % socialGroups.length];
    camX = focusGroup.centerX + cos(camAngle) * 400;
    camY = focusGroup.centerY + 200;
    camZ = focusGroup.centerZ + sin(camAngle) * 400;
    lookX = focusGroup.centerX;
    lookY = focusGroup.centerY + 50;
    lookZ = focusGroup.centerZ;
  } else {
    // General marketplace view
    camX = cos(camAngle) * camRadius;
    camY = camHeight;
    camZ = sin(camAngle) * camRadius;
    lookX = sin(t * 0.1) * 200;
    lookY = 100;
    lookZ = cos(t * 0.1) * 200;
  }

  camera(camX, camY, camZ, lookX, lookY, lookZ, 0, 1, 0);

  drawChamber();

  // Alien entity at center - marketplace centerpiece
  push();
  rotateY(frameCount * 0.0008);
  rotateX(frameCount * 0.0004);
  texture(textureImg);
  drawAlienEntity();
  pop();

  // Draw all characters
  drawCharacters(camX, camY, camZ, t);
}

function getCharacterPosition(char, t) {
  let time = t + char.phaseOffset;
  let pos = { x: 0, y: 0, z: 0, lookAtX: 0, lookAtY: 0, lookAtZ: 0 };

  if (char.groupId !== null) {
    // Character in a social group
    let group = socialGroups[char.groupId];

    // Position within group with natural movement
    let angle = char.angleInGroup + sin(time * char.swaySpeed * 0.3) * 0.2;
    let dist = char.distFromCenter + cos(time * char.swaySpeed * 0.4) * 15;

    pos.x = group.centerX + cos(angle) * dist;
    pos.y = group.centerY + sin(time * char.swaySpeed) * char.bobAmount;
    pos.z = group.centerZ + sin(angle) * dist;

    // Gesturing - vertical movement during conversation
    if (char.behavior === SOCIAL_BEHAVIORS.CONVERSING || char.behavior === SOCIAL_BEHAVIORS.GESTURING) {
      pos.y += abs(sin(time * char.gestureFrequency)) * char.gestureAmount;
    }

    // Look at focus character or group center
    if (char.focusCharacter !== null && characters[char.focusCharacter]) {
      let focusPos = getCharacterPosition(characters[char.focusCharacter], t);
      pos.lookAtX = focusPos.x;
      pos.lookAtY = focusPos.y;
      pos.lookAtZ = focusPos.z;
    } else {
      pos.lookAtX = group.centerX;
      pos.lookAtY = group.centerY;
      pos.lookAtZ = group.centerZ;
    }

  } else {
    // Wandering character
    let baseAngle = char.baseAngle + time * char.pathSpeed;

    if (char.pathType === 'circular') {
      pos.x = cos(baseAngle) * char.baseRadius;
      pos.y = char.baseHeight + sin(time * char.swaySpeed) * char.bobAmount;
      pos.z = sin(baseAngle) * char.baseRadius;
    } else if (char.pathType === 'figure8') {
      pos.x = sin(baseAngle) * char.baseRadius;
      pos.y = char.baseHeight + sin(time * char.swaySpeed) * char.bobAmount;
      pos.z = sin(baseAngle * 2) * char.baseRadius * 0.5 + char.baseRadius * 0.5;
    } else { // meandering
      pos.x = cos(baseAngle) * char.baseRadius + sin(time * 0.3) * char.pathRadius;
      pos.y = char.baseHeight + sin(time * char.swaySpeed) * char.bobAmount;
      pos.z = sin(baseAngle) * char.baseRadius + cos(time * 0.25) * char.pathRadius;
    }

    // Wanderers look ahead in their direction of travel
    let futureTime = time + 0.5;
    let futureAngle = char.baseAngle + futureTime * char.pathSpeed;
    pos.lookAtX = cos(futureAngle) * char.baseRadius;
    pos.lookAtY = pos.y;
    pos.lookAtZ = sin(futureAngle) * char.baseRadius;
  }

  return pos;
}

function drawCharacters(camX, camY, camZ, t) {
  for (let i = 0; i < characters.length; i++) {
    if (!faceImages[i] || !characters[i]) continue;

    let char = characters[i];
    let pos = getCharacterPosition(char, t);

    push();
    translate(pos.x, pos.y, pos.z);

    // Calculate where to look
    let dx = pos.lookAtX - pos.x;
    let dz = pos.lookAtZ - pos.z;
    let angleToTarget = atan2(dx, dz);

    // Camera angle
    let dxCam = camX - pos.x;
    let dzCam = camZ - pos.z;
    let angleToCamera = atan2(dxCam, dzCam);

    // Blend based on behavior
    let blendToTarget = 0.5;
    if (char.behavior === SOCIAL_BEHAVIORS.CONVERSING || char.behavior === SOCIAL_BEHAVIORS.GESTURING) {
      blendToTarget = 0.9; // Mostly face conversation partner
    } else if (char.behavior === SOCIAL_BEHAVIORS.OBSERVING) {
      blendToTarget = 0.3; // Mostly face camera
    } else if (char.behavior === SOCIAL_BEHAVIORS.WANDERING) {
      blendToTarget = 0.7; // Face direction of travel
    }

    let finalAngle = lerp(angleToCamera, angleToTarget, blendToTarget);
    rotateY(finalAngle + PI);

    texture(faceImages[i]);
    sphere(char.size, 24, 24);
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
