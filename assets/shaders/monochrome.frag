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

float field(vec2 p)
{
    float v = 0.0;

    v += sin(p.x * 2.0);
    v += sin(p.y * 2.0);

    v += sin(p.x + p.y + uTime * 0.4);
    v += sin(length(p) * 3.0 - uTime * 0.6);

    return v;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

    uv *= uZoom;

    vec3 ro = uCameraPos;
    vec3 rd = normalize((uView * vec4(uv, -1.0, 0.0)).xyz);

    float t = -ro.z / rd.z;
    vec3 hit = ro + rd * t;

    vec2 p = hit.xy;

    float f = field(p);

    // smooth contour bands
    float bands = sin(f * 3.0);

    float shade = smoothstep(-0.2, 0.2, bands);

    // subtle vignette
    float vignette = 1.0 - smoothstep(0.6, 1.4, length(uv));

    float col = shade * vignette;

    FragColor = vec4(vec3(col), 1.0);
}
