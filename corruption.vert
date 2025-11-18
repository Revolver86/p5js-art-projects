// Vertex shader for corruption effect
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  // Pass texture coordinates to fragment shader
  vTexCoord = aTexCoord;

  // Standard vertex position
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  gl_Position = positionVec4;
}
