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
    float t = uTime * 0.25;   // slower motion

    float v = 0.0;

    v += sin(p.x * 1.6 + t * 0.4);
    v += sin(p.y * 1.4 - t * 0.3);

    v += sin(p.x + p.y + t * 0.6);

    v += sin(length(p) * 2.2 - t * 0.8);

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


    /* subtle space warping */
    float warp =
        sin(p.x * 0.8 + uTime * 0.2) *
        sin(p.y * 0.6 - uTime * 0.15);

    p += warp * 0.15;


    float f = field(p);


    /* uneven contour bands */
    float bands = sin(f * 2.2 + sin(uTime * 0.2));


    float shade = smoothstep(-0.25, 0.25, bands);


    float vignette =
        1.0 - smoothstep(
            0.55 + sin(uTime * 0.3) * 0.05,
            1.45,
            length(uv)
        );


    /* faint flicker */
    float flicker =
        0.97 + 0.03 * sin(float(uFrame) * 0.4);


    float col = shade * vignette * flicker;

    FragColor = vec4(vec3(col), 1.0);
}
