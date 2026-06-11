// Pixel / dithered-gradient background — inverted (light theme) variant.
// Same dither as pixel.frag but the palette lookup and tone are flipped so
// the near-white end dominates.

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;

uniform sampler2D iChannel0;
uniform vec3      iChannelResolution[3];

out vec4 FragColor;

const float PIXEL  = 5.0;
const float LEVELS = 8.0;

float bayer4(vec2 p)
{
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = x + y * 4;

  float m[16];
  m[0] = 0.0;  m[1] = 8.0;  m[2] = 2.0;  m[3] = 10.0;
  m[4] = 12.0; m[5] = 4.0;  m[6] = 14.0; m[7] = 6.0;
  m[8] = 3.0;  m[9] = 11.0; m[10] = 1.0; m[11] = 9.0;
  m[12] = 15.0; m[13] = 7.0; m[14] = 13.0; m[15] = 5.0;

  return (m[i] + 0.5) / 16.0;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float vnoise(vec2 p)
{
  vec2  i = floor(p);
  vec2  f = fract(p);
  vec2  u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec3 palette(float t)
{
  if (iChannelResolution[0].x > 0.0)
    return texture(iChannel0, vec2(clamp(t, 0.0, 1.0), 0.5)).rgb;

  return mix(vec3(0.05, 0.04, 0.16), vec3(0.91, 0.95, 1.0), t);
}

float gradient(vec2 blockUv)
{
  vec2 m = (uMouse - 0.5) * 0.3;
  float g = dot(blockUv + m, vec2(0.6, 0.4)) + uTime * 0.06;
  g += 0.12 * vnoise(blockUv * 4.0 + uTime * 0.15);
  return fract(g);
}

void main()
{
  vec2 block   = floor(gl_FragCoord.xy / PIXEL);
  vec2 blockUv = (block * PIXEL) / uResolution;

  float g = gradient(blockUv);

  float dithered = g + (bayer4(block) - 0.5) / LEVELS;
  float level    = floor(clamp(dithered, 0.0, 1.0) * (LEVELS - 1.0) + 0.5);

  // Inverted palette coordinate -> light end dominates.
  vec3 col = palette(1.0 - (level + 0.5) / LEVELS);

  // Lift toward white for the light theme, gentle scanline.
  col = mix(col, vec3(1.0), 0.35);
  col *= 0.92 + 0.08 * sin(gl_FragCoord.y * 3.14159);
  vec2 v = (gl_FragCoord.xy / uResolution) - 0.5;
  col *= 1.0 - 0.25 * dot(v, v);

  FragColor = vec4(col, 1.0);
}
