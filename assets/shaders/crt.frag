#include "common.glsl"

uniform float uTime;
uniform vec2 uResolution;
out vec4 outColor;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    outColor = vec4(uv, 0.5 + 0.5 * sin(uTime), 1.0);
}
