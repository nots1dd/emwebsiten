// glitch transition — datamosh pixel glitch.
// Pixel blocks tear and shift per row with an RGB channel split; the corruption
// peaks mid-transition then settles onto sceneB.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

const float PIXEL = 4.0;

float hash(vec2 p)
{
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main()
{
  float t = clamp(progress, 0.0, 1.0);

  /* corruption envelope: 0 -> 1 -> 0 across the transition */
  float glitch = sin(t * 3.14159265);

  /* chunky block grid (blocks grow while glitching) */
  float px    = PIXEL * (1.0 + 3.0 * glitch);
  vec2  block = floor(gl_FragCoord.xy / px);
  vec2  uv    = (block * px) / resolution;

  /* per-row datamosh: random horizontal shift + occasional vertical jump */
  float row    = block.y;
  float seed   = hash(vec2(row, floor(t * 24.0)));
  float tear   = step(0.6, seed);
  float shiftX = (hash(vec2(row, 7.0)) - 0.5) * 0.3 * tear * glitch;
  float shiftY = (hash(vec2(row, 3.0)) - 0.5) * 0.08 * step(0.85, seed) * glitch;
  vec2  sUV    = clamp(uv + vec2(shiftX, shiftY), 0.001, 0.999);

  /* which scene this block shows — flips over progress with block-random bias */
  float reveal = step(hash(block) * 0.7 + 0.15, t);

  /* RGB channel split grows with the glitch */
  float ca = (0.01 + 0.03 * glitch) * (0.5 + tear);
  vec3  col;
  vec3  src;
  // sample chosen scene per channel with horizontal aberration
  for (int c = 0; c < 3; c++)
  {
    float off = (float(c) - 1.0) * ca;
    vec2  q   = clamp(sUV + vec2(off, 0.0), 0.001, 0.999);
    vec3  a   = texture(sceneA, q).rgb;
    vec3  b   = texture(sceneB, q).rgb;
    src       = mix(a, b, reveal);
    col[c]    = src[c];
  }

  /* block flicker + scanlines */
  col *= 0.8 + 0.2 * hash(block + floor(t * 40.0));
  col *= 0.85 + 0.15 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
