precision highp float;

uniform sampler2D sceneA;
uniform sampler2D sceneB;

uniform float progress;
uniform vec2  resolution;

out vec4 FragColor;

float ease(float t) { return t * t * (3.0 - 2.0 * t); }

void main()
{
  vec2 uv = gl_FragCoord.xy / resolution;

  float t = clamp(ease(progress), 0.0, 1.0);

  vec2  center = uv - 0.5;
  float dist   = length(center) * 1.4142;

  float ripple = sin(dist * 30.0 - t * 10.0) * (1.0 - t) * 0.02;

  float len = length(center);
  vec2  dir = (len > 0.0001) ? center / len : vec2(0.0);

  vec2 uvA = clamp(uv + dir * ripple * (1.0 - t), 0.0, 1.0);
  vec2 uvB = clamp(uv - dir * ripple * t, 0.0, 1.0);

  vec3 colA = texture(sceneA, uvA).rgb;
  vec3 colB = texture(sceneB, uvB).rgb;

  float mask = smoothstep(t - 0.15, t + 0.15, dist);

  vec3 color = mix(colA, colB, mask);

  FragColor = vec4(color, 1.0);
}
