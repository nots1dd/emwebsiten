// Fractal-bloom transition — sceneA dissolves into sceneB along an animated
// Julia set (z = z^2 + c). The reveal boundary is the fractal's own contour,
// so the wipe blooms outward from the centre through intricate, self-similar
// filaments. Same z^2+c family as the projects scene, so they feel of a piece.

precision highp float;

uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;

out vec4 FragColor;

const float PIXEL = 3.0;
const int   ITERS = 64;
const float PI    = 3.14159265;

// IQ cosine palette — vivid, smoothly cycling hues for the fractal edge glow.
vec3 palette(float t)
{
  return 0.55 + 0.45 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

// Smooth (continuous) Julia escape time in [0,1]; 1.0 = inside the set.
float julia(vec2 z, vec2 c)
{
  float n = 0.0;
  for (int i = 0; i < ITERS; i++)
  {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 256.0) break;
    n += 1.0;
  }
  float sn = n - log2(max(log2(dot(z, z)), 1.0)) + 4.0; // continuous smoothing
  return clamp(sn / float(ITERS), 0.0, 1.0);
}

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  uv     = block * PIXEL / resolution;
  float aspect = resolution.x / resolution.y;

  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);            // centred complex plane

  float t = smoothstep(0.0, 1.0, clamp(progress, 0.0, 1.0)); // eased in/out

  // animate the Julia constant so the fractal morphs as it blooms
  float ang = 2.20 + t * 1.6;
  vec2  c   = 0.7885 * vec2(cos(ang), sin(ang));

  float zoom = mix(2.4, 1.7, t);                      // gentle live zoom
  float f    = julia(p * zoom, c);

  // bloom field: fractal contour blended with a radial term so the reveal
  // always grows from the centre and finishes covering the whole screen.
  float radial = length(p) / (0.5 * aspect + 0.5);
  float field  = mix(radial, 1.0 - f, 0.55);

  // moving threshold; pushed past 1.0 at the ends so the wipe fully completes.
  float level  = t * 1.35 - 0.18;
  float band   = 0.10;
  float reveal = 1.0 - smoothstep(level - band, level + band, field);

  vec3 a   = texture(sceneA, uv).rgb;
  vec3 b   = texture(sceneB, uv).rgb;
  vec3 col = mix(a, b, reveal);

  // glowing fractal edge riding the moving boundary, brightest mid-transition
  float edge = exp(-pow((field - level) / band, 2.0)) * (1.0 - abs(t * 2.0 - 1.0));
  col += palette(f * 3.0 + t) * edge * 0.9;

  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * PI);        // scanlines for cohesion
  FragColor = vec4(col, 1.0);
}
