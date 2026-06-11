// Home — pixel starfield (night). Indigo/violet deep space with a ringed
// planet, a small moon, twinkling stars, a periodic shooting star and low
// nebula dither bands. Pixelated + ordered-dithered for a retro look.

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uCameraPos; // WASD pan
uniform float uZoom;      // scroll zoom

out vec4 FragColor;

const float PIXEL  = 3.0; // device px per art pixel
const float LEVELS = 6.0; // posterize steps per channel

/* ---------- hash / noise ---------- */
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2  hash22(vec2 p)
{
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float vnoise(vec2 p)
{
  vec2  i = floor(p), f = fract(p);
  vec2  u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1, 0));
  float c = hash21(i + vec2(0, 1)), d = hash21(i + vec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p)
{
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++)
  {
    v += a * vnoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

/* ---------- pixel-art helpers ---------- */
float bayer4(vec2 p)
{
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  int i = x + y * 4;
  float m[16];
  m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
  m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
  m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
  return (m[i] + 0.5) / 16.0;
}
vec3 posterize(vec3 c, vec2 block)
{
  float d = (bayer4(block) - 0.5) / LEVELS;
  return floor(clamp(c + d, 0.0, 1.0) * (LEVELS - 1.0) + 0.5) / (LEVELS - 1.0);
}

/* circle sprite mask with soft pixel edge */
float disc(vec2 p, vec2 c, float r) { return smoothstep(r, r - 0.012, length(p - c)); }

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  res    = uResolution / PIXEL;
  float aspect = res.x / res.y;

  // camera: WASD pans (uCameraPos.xz), scroll zooms (uZoom) about center.
  vec2 cam = vec2(uCameraPos.x, -uCameraPos.z) * 0.12;
  vec2 cuv = (block / res - 0.5) * uZoom + cam;
  vec2 uv  = cuv + 0.5;                 // world uv (may exit 0..1)
  vec2 p   = vec2(cuv.x * aspect, cuv.y);

  vec2 par = (uMouse - 0.5) * 0.06;    // subtle parallax

  /* sky gradient: deep indigo at bottom -> violet up */
  vec3 col = mix(vec3(0.04, 0.03, 0.12), vec3(0.16, 0.07, 0.27), uv.y);

  /* nebula dither bands */
  float neb = fbm(p * 3.0 + vec2(uTime * 0.02, 0.0) + par);
  col += vec3(0.32, 0.10, 0.40) * smoothstep(0.45, 0.95, neb) * (0.35 + 0.4 * uv.y);

  /* star layers */
  for (int L = 0; L < 3; L++)
  {
    float fl    = float(L);
    float scale = mix(60.0, 150.0, fl / 2.0);
    vec2  sp    = (uv + par * (0.3 + fl * 0.4)) * scale;
    vec2  cell  = floor(sp);
    vec2  h     = hash22(cell + fl * 17.0);
    float star  = step(0.86 + fl * 0.04, h.x);
    float tw    = 0.5 + 0.5 * sin(uTime * (1.5 + h.y * 3.0) + h.x * 30.0);
    float d     = length(fract(sp) - 0.5);
    col += vec3(0.8, 0.85, 1.0) * star * smoothstep(0.18, 0.0, d) * (0.4 + 0.6 * tw);
  }

  /* ringed planet (upper right) */
  vec2  pc   = vec2(0.32, 0.18) + par * 0.5;
  float pl   = disc(p, pc, 0.16);
  vec2  pn   = (p - pc);
  float shade = 0.5 + 0.5 * dot(normalize(vec3(pn, 0.1)), normalize(vec3(-0.6, 0.5, 0.6)));
  vec3  planet = mix(vec3(0.45, 0.18, 0.5), vec3(0.95, 0.55, 0.85), shade);
  planet += 0.15 * fbm(pn * 30.0); // banding texture
  col = mix(col, planet, pl);

  /* planet ring (thin ellipse) */
  vec2  rp   = (p - pc) * vec2(1.0, 2.6);
  float rd   = length(rp);
  float ring = smoothstep(0.02, 0.0, abs(rd - 0.26)) * step(0.0, p.x - pc.x + 0.3);
  col = mix(col, vec3(0.9, 0.7, 1.0), ring * (1.0 - pl) * 0.7);

  /* small moon (lower left) */
  vec2  mc   = vec2(-0.34, -0.16) + par * 0.7;
  float mo   = disc(p, mc, 0.05);
  float ms   = 0.5 + 0.5 * dot(normalize(vec3(p - mc, 0.06)), normalize(vec3(0.6, 0.4, 0.6)));
  col = mix(col, mix(vec3(0.35, 0.33, 0.45), vec3(0.85, 0.86, 0.95), ms), mo);

  /* periodic shooting star */
  float cyc   = floor(uTime / 4.0);
  float lt    = fract(uTime / 4.0);
  vec2  sStart = hash22(vec2(cyc, 3.0)) * vec2(aspect, 1.0) - vec2(aspect * 0.5, 0.0);
  vec2  spos   = sStart + vec2(0.9, -0.5) * lt;
  vec2  d2     = p - spos;
  float along  = clamp(dot(d2, normalize(vec2(-0.9, 0.5))), 0.0, 0.18);
  float trail  = smoothstep(0.02, 0.0, length(d2 + normalize(vec2(-0.9, 0.5)) * along));
  col += vec3(0.9, 0.95, 1.0) * trail * smoothstep(1.0, 0.0, abs(lt - 0.5) * 2.0);

  col = posterize(col, block);

  /* faint scanline for the CRT vibe */
  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
