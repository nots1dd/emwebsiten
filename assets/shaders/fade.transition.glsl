precision mediump float;

uniform sampler2D sceneA;
uniform sampler2D sceneB;

uniform float progress;
uniform vec2 resolution;

out vec4 FragColor;

float ease(float t)
{
    return t * t * (3.0 - 2.0 * t);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution;

    float t = clamp(ease(progress), 0.0, 1.0);

    vec2 center = uv - 0.5;

    // normalized radial distance (0..1)
    float dist = length(center) * 1.4142;

    // ripple distortion
    float ripple = sin(dist * 25.0 - t * 8.0) * 0.015;

    vec2 offset = normalize(center + 0.0001) * ripple;

    vec2 uvA = clamp(uv + offset * (1.0 - t), 0.0, 1.0);
    vec2 uvB = clamp(uv - offset * t, 0.0, 1.0);

    vec3 colA = texture(sceneA, uvA).rgb;
    vec3 colB = texture(sceneB, uvB).rgb;

    // radial reveal
    float mask = smoothstep(t - 0.2, t + 0.2, dist);

    vec3 color = mix(colA, colB, mask);

    FragColor = vec4(color, 1.0);
}
