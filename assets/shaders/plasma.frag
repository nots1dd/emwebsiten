precision highp float;

uniform float uTime;
uniform float uDelta;

uniform vec2  uResolution;
uniform vec2  uMouse;

uniform int   uFrame;

uniform mat4  uProjection;
uniform mat4  uView;
uniform vec3  uCameraPos;
uniform float uZoom;

out vec4 FragColor;

void main() {

    // normalized screen coordinates (-1..1)
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

    // apply zoom
    uv *= uZoom;

    // camera ray origin
    vec3 ro = uCameraPos;

    // camera ray direction (simple perspective)
    vec3 rd = normalize((uView * vec4(uv, -1.0, 0.0)).xyz);

    // project ray onto a plane at z = 0
    float t = -ro.z / rd.z;
    vec3 hit = ro + rd * t;

    // use hit position instead of raw screen UV
    vec2 p = hit.xy * 0.2;

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
