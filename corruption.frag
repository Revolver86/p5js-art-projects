precision highp float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_bass;
uniform float u_lowMid;
uniform float u_mid;
uniform float u_highMid;
uniform float u_treble;
uniform float u_amplitude;
uniform float u_chaos;
uniform float u_tear;
uniform float u_corruption;
uniform sampler2D u_feedbackTex;

// Noise functions for chaos
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal noise
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Value noise 3D for more chaos
float noise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n = i.x + i.y * 57.0 + i.z * 113.0;

    return mix(
        mix(mix(hash(n), hash(n + 1.0), f.x),
            mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
            mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y),
        f.z);
}

// RGB split / chromatic aberration
vec3 chromaticAberration(vec2 uv, float amount) {
    float r = fbm(uv * 20.0 + u_time * 0.3 + u_bass * 5.0);
    float g = fbm(uv * 20.0 + u_time * 0.3 + u_mid * 3.0);
    float b = fbm(uv * 20.0 + u_time * 0.3 + u_treble * 7.0);

    vec2 rOffset = vec2(cos(u_time + u_bass * 10.0), sin(u_time + u_bass * 10.0)) * amount * u_bass;
    vec2 bOffset = vec2(cos(u_time + u_treble * 15.0), sin(u_time + u_treble * 15.0)) * amount * u_treble;

    return vec3(r + rOffset.x, g, b + bOffset.x);
}

// Glitch displacement - tears and breaks the image
vec2 glitchDisplace(vec2 uv) {
    // Horizontal tears from bass hits
    float tear = step(0.98, noise(vec2(uv.y * 50.0 + u_time * 2.0, u_tear)));
    float tearOffset = tear * (hash(floor(uv.y * 50.0)) - 0.5) * u_bass * 0.5;

    // Vertical fractures from mids
    float fracture = step(0.97, noise(vec2(uv.x * 40.0 + u_time * 3.0, u_mid * 10.0)));
    float fractureOffset = fracture * (hash(floor(uv.x * 40.0)) - 0.5) * u_mid * 0.3;

    // Chaotic displacement from high frequencies
    vec2 chaosDisplace = vec2(
        noise(vec2(uv.x * 30.0, u_time + u_treble * 20.0)) - 0.5,
        noise(vec2(uv.y * 30.0, u_time + u_highMid * 15.0)) - 0.5
    ) * u_treble * 0.1;

    return uv + vec2(tearOffset, fractureOffset) + chaosDisplace;
}

// Data corruption - pixelation and bit crushing
vec3 dataCorrupt(vec3 color, vec2 uv) {
    // Pixelation that increases with corruption
    float pixelSize = mix(1.0, 50.0, u_corruption * u_treble);
    vec2 pixelatedUV = floor(uv * u_resolution / pixelSize) * pixelSize / u_resolution;

    // Bit crushing - reduce color depth
    float bitDepth = mix(256.0, 4.0, u_corruption * u_highMid);
    color = floor(color * bitDepth) / bitDepth;

    // Random pixel death
    float pixelDeath = step(0.99, noise(pixelatedUV * 100.0 + u_time * 5.0));
    color *= (1.0 - pixelDeath * u_corruption);

    return color;
}

// Posterize and destroy color
vec3 colorDestroy(vec3 color) {
    // Harsh posterization
    float levels = mix(32.0, 3.0, u_bass * u_chaos);
    color = floor(color * levels) / levels;

    // Channel swapping based on audio
    if (mod(u_time * u_mid * 10.0, 3.0) < 1.0) {
        color = color.gbr;
    } else if (mod(u_time * u_mid * 10.0, 3.0) < 2.0) {
        color = color.brg;
    }

    // Invert randomly
    float invertChance = step(0.7, u_amplitude) * step(0.95, noise(vec2(u_time * 2.0, 0.0)));
    color = mix(color, 1.0 - color, invertChance);

    return color;
}

// Feedback corruption
vec3 feedbackChaos(vec2 uv, vec3 currentColor) {
    // Sample feedback with displacement
    vec2 fbUV = uv;
    fbUV += vec2(
        noise(vec2(u_time * 0.5 + u_bass * 5.0, uv.y * 10.0)) - 0.5,
        noise(vec2(u_time * 0.5 + u_mid * 5.0, uv.x * 10.0)) - 0.5
    ) * 0.02 * u_chaos;

    vec3 feedback = texture2D(u_feedbackTex, fbUV).rgb;

    // Mix with feedback - more mixing with higher amplitude
    float feedbackAmount = u_amplitude * 0.7;
    return mix(currentColor, feedback, feedbackAmount);
}

void main() {
    vec2 uv = vTexCoord;

    // Apply glitch displacement
    vec2 displaceUV = glitchDisplace(uv);

    // Generate base color field - pure noise driven by audio
    vec3 color = vec3(0.0);

    // Layer 1: Bass-driven low frequency waves
    float bassWave = sin(displaceUV.x * 5.0 + u_time + u_bass * 20.0) *
                     cos(displaceUV.y * 5.0 + u_time + u_bass * 15.0);
    color.r = bassWave * u_bass * 2.0;

    // Layer 2: Mid-frequency chaos
    vec2 midCoord = displaceUV * 10.0 + vec2(u_time * 0.5, u_time * 0.3);
    float midNoise = fbm(midCoord + u_mid * 10.0);
    color.g = midNoise * u_mid * 3.0;

    // Layer 3: Treble creates high-frequency noise
    vec3 trebleCoord = vec3(displaceUV * 50.0, u_time * 2.0 + u_treble * 30.0);
    float trebleNoise = noise3d(trebleCoord);
    color.b = trebleNoise * u_treble * 4.0;

    // Add chromatic aberration
    vec3 aberration = chromaticAberration(displaceUV, 0.05);
    color += aberration * u_amplitude;

    // Mix with chaos noise
    float chaosNoise = fbm(displaceUV * 20.0 + u_time + u_chaos);
    color += chaosNoise * u_chaos * 0.5;

    // Apply feedback chaos
    color = feedbackChaos(uv, color);

    // Data corruption
    color = dataCorrupt(color, uv);

    // Destroy and posterize color
    color = colorDestroy(color);

    // Scanlines that pulse with low-mids
    float scanline = sin(uv.y * u_resolution.y * 2.0 + u_time * 10.0) * 0.05 * u_lowMid;
    color += scanline;

    // RGB split on steroids
    vec2 splitOffset = vec2(u_bass * 0.03, u_treble * 0.03);
    float splitR = fbm((uv + splitOffset) * 15.0 + u_time);
    float splitB = fbm((uv - splitOffset) * 15.0 + u_time);
    color.r += splitR * u_bass;
    color.b += splitB * u_treble;

    // Vignette that breathes with amplitude
    float vignette = length(uv - 0.5);
    vignette = 1.0 - smoothstep(0.3, 0.8 + u_amplitude * 0.3, vignette);
    color *= vignette;

    // Edge enhancement/sharpening with chaos
    float edge = abs(dFdx(color.r)) + abs(dFdy(color.r)) +
                 abs(dFdx(color.g)) + abs(dFdy(color.g)) +
                 abs(dFdx(color.b)) + abs(dFdy(color.b));
    color += edge * u_chaos * 2.0;

    // Final chaos injection - complete signal destruction at high energy
    if (u_amplitude > 0.7 && u_chaos > 2.0) {
        float destruction = noise3d(vec3(uv * 100.0, u_time * 10.0));
        color = mix(color, vec3(destruction), 0.3);
    }

    // Clamp to valid range (but allow some overflow for bloom effect)
    color = clamp(color, 0.0, 2.0);

    gl_FragColor = vec4(color, 1.0);
}
