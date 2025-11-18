# Audio Reactive Schizo Pain

A disturbing audio-reactive shader experience. Raw, glitchy, painful, fucked up.

## Audio Reactive Elements

### Bass Frequencies
- Drive convulsive geometry distortions in vertex shader
- Create radial segmentation patterns (more segments = more bass)
- Control feedback decay rate (more bass = less persistence)
- Trigger horizontal displacement glitches
- Influence geometric wireframe sizing and positioning
- Affect camera rotation chaos

### Mid Frequencies
- Generate tearing distortions across geometry
- Create interference wave patterns
- Drive UV warping and distortion
- Control color mixing with acidic yellow
- Influence 3D shape selection and behavior
- Affect secondary glitch plane positioning

### Treble Frequencies
- Cause geometric disintegration/shattering
- Create glitch blocks and static noise
- Drive chromatic aberration intensity
- Control color mixing with deep purple
- Trigger random glitch bars
- Determine number and behavior of wireframe chaos shapes
- Influence tertiary glitch plane appearance

### Overall Amplitude
- Controls global visual intensity and brightness
- Triggers RGB color split on peaks (>0.8)
- Drives fragmentationIndex accumulation
- Affects time progression speed
- Controls geometric shape sizing
- Determines 3D object positioning radius

### Peak Detection
- Triggers glitch intensity buildup
- Causes visual artifacts and feedback intensification
- Drives random color inversions

## Visual Effects

1. **Feedback Loop**: Previous frames feed back with chromatic aberration creating visual trails and artifacts
2. **Chromatic Aberration**: RGB channels split based on treble and pain levels
3. **Glitch Blocks**: Treble creates randomized displacement blocks
4. **Scanlines**: Constant moving scanlines for CRT corruption aesthetic
5. **Color Inversion**: Random sections invert based on glitch intensity
6. **Multi-plane Rendering**: Multiple shader planes at different depths create schizophrenic layering
7. **Geometric Chaos**: Wireframe shapes (boxes, spheres, cones) positioned and sized by audio
8. **Painful Palette**: Harsh magenta, sickly cyan, acidic yellow, deep purple
9. **Audio-reactive Camera**: Rotation driven by frequency bands

## Usage

1. Upload DEMO2.m4a to your p5.js web editor
2. Copy the entire script
3. Click play to start the experience
4. Click mouse to pause/play
5. Let the pain wash over you

## Technical Details

- Uses custom GLSL vertex and fragment shaders
- FFT analysis with 256 bins
- Feedback buffer for visual persistence
- Multi-layer rendering for depth and glitch effects
- Real-time audio analysis across bass, mid, treble bands
- Amplitude detection for peak-driven effects

The visuals are completely driven by the audio - every distortion, color shift, glitch, and geometric behavior is a direct response to the sound.
