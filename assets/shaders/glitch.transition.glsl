precision highp float;

uniform sampler2D sceneA;
uniform sampler2D sceneB;

uniform float progress;
uniform vec2  resolution;

out vec4 FragColor;

/* stable hash */
float hash(vec2 p)
{
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main()
{
  vec2 uv = gl_FragCoord.xy / resolution;

  float t = clamp(progress, 0.0, 1.0);

  /* row-based glitch */
  float row = floor(uv.y * resolution.y);

  float noise = hash(vec2(row, floor(t * 40.0)));

  float glitchStrength = (1.0 - t);

  /* horizontal displacement */
  uv.x += (noise - 0.5) * 0.12 * glitchStrength;

  uv = clamp(uv, 0.0, 1.0);

  vec3 colA = texture(sceneA, uv).rgb;
  vec3 colB = texture(sceneB, uv).rgb;

  /* mix scenes */
  vec3 color = mix(colA, colB, t);

  FragColor = vec4(color, 1.0);
}
