precision mediump float;

uniform float uTime;
uniform float uDelta;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform int   uFrame;

out vec4 FragColor;

void main() {

    vec2 uv = gl_FragCoord.xy / uResolution;

    // center coordinates
    vec2 p = uv - 0.5;

    // mouse influence
    vec2 m = uMouse / uResolution - 0.5;

    // animated distortion
    float warp = sin(length(p + m) * 10.0 - uTime * 2.0);

    float v =
        sin((p.x + warp) * 10.0 + uTime) +
        sin((p.y - warp) * 10.0 + uTime) +
        sin((p.x + p.y) * 10.0 + uTime);

    // animated color palette
    vec3 col = vec3(
        sin(v + uTime * 0.3),
        sin(v + 2.0 + uTime * 0.2),
        sin(v + 4.0 + uTime * 0.1)
    );

    // subtle frame flicker
    float flicker = 0.97 + 0.03 * sin(float(uFrame) * 0.5);

    FragColor = vec4(col * 0.5 + 0.5, 1.0) * flicker;
}
