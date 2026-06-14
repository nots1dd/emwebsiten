// Sunrise-shift transition — a sun rises across the scene and re-lights the
// whole area, sweeping sceneA -> sceneB under a golden-hour wash. Used for the
// About page's day <-> night theme flip.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

const float PIXEL = 3.0;
const float PI    = 3.14159265;

float hash(vec2 p)
{
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  uv     = block * PIXEL / resolution;
  float aspect = resolution.x / resolution.y;

  float t = smoothstep(0.0, 1.0, clamp(progress, 0.0, 1.0));

  /* the sun climbs from below the horizon to high in the sky */
  vec2  sun = vec2(0.5, mix(-0.18, 0.92, t));
  vec2  d   = (uv - sun) * vec2(aspect, 1.0);
  float sd  = length(d);

  /* terminator wipe rides up with the sun; a final settle guarantees full B */
  float jitter = (hash(vec2(floor(uv.x * 90.0), floor(progress * 12.0))) - 0.5) * 0.04;
  float blend  = clamp(
      smoothstep(sun.y + 0.30, sun.y - 0.30, uv.y + jitter)
    + smoothstep(0.85, 1.0, t), 0.0, 1.0);

  vec3 a = texture(sceneA, uv).rgb;
  vec3 b = texture(sceneB, uv).rgb;
  vec3 col = mix(a, b, blend);

  /* golden-hour wash, strongest mid-transition */
  float golden     = sin(t * PI);
  float light      = smoothstep(0.95, 0.0, sd);                 // closeness to the sun
  float horizonLit = smoothstep(0.45, 0.0, abs(uv.y - sun.y));  // band at the sun's height
  vec3  warm       = mix(vec3(1.0, 0.42, 0.22), vec3(1.0, 0.86, 0.55), light);
  col += warm * (light * 0.6 + horizonLit * 0.22) * golden;

  /* sun glow + disc */
  col += vec3(1.0, 0.9, 0.7) * exp(-sd * 4.0) * (0.45 + 0.55 * t);
  col  = mix(col, vec3(1.0, 0.97, 0.9), smoothstep(0.05, 0.044, sd));

  /* soft god rays fanning from the sun */
  float ray = 0.5 + 0.5 * sin(atan(d.y, d.x) * 16.0 + t * 2.0);
  col += vec3(1.0, 0.8, 0.5) * ray * smoothstep(0.65, 0.0, sd) * 0.12 * golden;

  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * PI);
  FragColor = vec4(col, 1.0);
}
