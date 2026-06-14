// About — forest lake (day)

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uMouseTrail[16];   // recent cursor path: .xy = pos (0..1), .z = age (s)
uniform vec3  uCameraPos;
uniform float uZoom;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec3      iChannelResolution[3];

out vec4 FragColor;

const float PIXEL   = 3.0;
const float LEVELS  = 6.0;
const float HORIZON = 0.52;
const float BANK    = 0.24;

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
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.02; a *= 0.5; }
  return v;
}
float det(vec2 q)
{
  if (iChannelResolution[0].x > 0.0) return textureLod(iChannel0, q, 0.0).r;
  return fbm(q * 4.0);
}
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

float conifer(vec2 uv, vec2 base, float h, float w)
{
  if (uv.y >= base.y - 0.02 && uv.y < base.y + 0.04 && abs(uv.x - base.x) < w * 0.16)
    return 1.0;
  float m = 0.0;
  for (int k = 0; k < 3; k++)
  {
    float fk = float(k);
    float y0 = base.y + h * 0.20 * fk;
    float th = h * (0.62 - 0.12 * fk);
    float tw = w * (1.0 - 0.18 * fk);
    float yy = (uv.y - y0) / th;
    if (yy >= 0.0 && yy <= 1.0 && abs(uv.x - base.x) < tw * (1.0 - yy)) m = 1.0;
  }
  return m;
}

void treeline(inout vec3 c, vec2 uv, float baseY, float spacing, vec3 ca, vec3 cb, float seed)
{
  int c0 = int(floor(uv.x / spacing));
  for (int k = -1; k <= 1; k++)
  {
    float cell = float(c0 + k);
    vec2  hsd  = hash22(vec2(cell, seed));
    float cx   = (cell + 0.5 + (hsd.x - 0.5) * 0.5) * spacing;
    float th   = 0.14 + 0.12 * hsd.y;
    float m    = conifer(uv, vec2(cx, baseY), th, spacing * 0.42);
    if (m > 0.0)
    {
      float t  = det(vec2(uv.x * 3.0, uv.y * 3.0) + cell);
      vec3  tc = mix(ca, cb, t) * (0.75 + 0.5 * clamp((uv.y - baseY) / th, 0.0, 1.0));
      c = mix(c, tc, m);
    }
  }
}

vec3 upperScene(vec2 uv)
{
  float aspect = uResolution.x / uResolution.y;
  vec3 c = mix(vec3(0.62, 0.82, 0.97), vec3(0.32, 0.58, 0.88), smoothstep(HORIZON, 1.0, uv.y));

  /* warm haze hugging the horizon */
  c += vec3(1.0, 0.85, 0.6) * smoothstep(0.16, 0.0, abs(uv.y - HORIZON)) * 0.22;

  vec2  sc = vec2(0.74, 0.82);
  float sd = length((uv - sc) * vec2(aspect, 1.0));
  c += vec3(1.0, 0.95, 0.7) * exp(-sd * 5.0) * 0.7;
  c = mix(c, vec3(1.0, 0.97, 0.8), smoothstep(0.06, 0.052, sd));

  float cl = det(uv * vec2(3.0, 2.0) + vec2(uTime * 0.02, 0.0));
  c = mix(c, vec3(1.0), smoothstep(0.62, 0.95, cl) * 0.5 * step(HORIZON, uv.y));

  /* shooting star */
  float cyc = floor(uTime / 5.0);
  float lt  = fract(uTime / 5.0);
  vec2  sdir = normalize(vec2(0.8, -0.45));
  vec2  spos = vec2(0.05 + hash21(vec2(cyc, 4.0)) * 0.5, 0.98) + sdir * lt * 1.3;
  vec2  dl   = uv - spos;
  float al   = clamp(dot(dl, -sdir), 0.0, 0.22);
  float vis  = smoothstep(0.0, 0.08, lt) * smoothstep(0.72, 0.45, lt);
  c += vec3(1.0, 1.0, 0.92)
     * (smoothstep(0.010, 0.0, length(dl + sdir * al)) * 0.7 + smoothstep(0.012, 0.0, length(dl)) * 1.3)
     * vis;

  /* distant hazy ridge for depth, then the two nearer treelines */
  treeline(c, uv, HORIZON + 0.02, 0.10, vec3(0.40, 0.56, 0.52), vec3(0.30, 0.48, 0.46), 31.0);
  treeline(c, uv, HORIZON, 0.18, vec3(0.12, 0.34, 0.16), vec3(0.05, 0.20, 0.10), 7.0);
  treeline(c, uv, HORIZON - 0.01, 0.13, vec3(0.22, 0.46, 0.22), vec3(0.10, 0.30, 0.14), 17.0);
  return c;
}

void drawGrass(inout vec3 col, vec2 uv, vec3 ga, vec3 gb)
{
  float spacing = 0.013;
  int   c0 = int(floor(uv.x / spacing));
  for (int k = -1; k <= 1; k++)
  {
    float cell = float(c0 + k);
    vec2  h  = hash22(vec2(cell, 3.0));
    float bx = (cell + 0.5 + (h.x - 0.5) * 0.7) * spacing;
    float bh = 0.05 + 0.06 * h.y;
    float yy = (uv.y - BANK) / bh;
    if (yy < 0.0 || yy > 1.0) continue;
    float sway  = 0.03 * sin(uTime * 1.5 + cell) * yy;
    float halfw = 0.0045 * (1.0 - yy);
    if (abs(uv.x - (bx + sway)) < halfw)
      col = mix(col, mix(ga, gb, h.y) * (0.7 + 0.4 * yy), 1.0);
  }
}

/* sitter sprite */
void drawCreeper(inout vec3 col, vec2 uv)
{
  if (iChannelResolution[1].x <= 0.0) return;
  vec2  sc = vec2(0.30, 0.085);
  float sh = 0.06, sw = sh * (24.0 / 14.0);
  vec2  t  = vec2((uv.x - sc.x) / sw * 0.5 + 0.5, 0.5 + (uv.y - sc.y) / sh * 0.5);
  if (t.x > 0.0 && t.x < 1.0 && t.y > 0.0 && t.y < 1.0)
  {
    vec4 s = textureLod(iChannel1, t, 0.0);
    col = mix(col, s.rgb, s.a);
  }
}

/* datamosh trail that fades along the cursor's recent path; each sample dims
   with its age, so the trail vanishes when idle and is left behind on a jump */
void cursorMosh(inout vec3 col, vec2 scr, float aspect)
{
  vec2 sa = vec2(aspect, 1.0);
  for (int i = 0; i < 16; i++)
  {
    vec3  s   = uMouseTrail[i];
    float age = s.z;
    if (age > 1.10) continue;                     // gone (idle too long / moved away)
    float life = 1.0 - age / 1.10;                // 1 -> 0 with age
    float taper = 1.0 - float(i) / 16.0;          // head brighter than tail

    float r    = length((scr - s.xy) * sa);
    float spot = smoothstep(0.05, 0.0, r);
    if (spot <= 0.0) continue;

    vec2  cell = floor(scr * 90.0 + vec2(0.0, floor(uTime * 10.0)));
    float n    = hash21(cell + float(i) * 7.0);
    float band = step(0.5, fract(n + uTime * 0.9));
    vec3  dm   = mix(vec3(1.0, 0.05, 0.55), vec3(0.05, 0.95, 0.95), fract(n * 3.0));
    dm = mix(dm, vec3(0.95, 0.9, 0.15), step(0.80, fract(n * 5.0)));

    col = mix(col, dm, spot * band * life * taper * 0.85);
  }
}

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  res    = uResolution / PIXEL;
  float aspect = res.x / res.y;
  vec2  par    = (uMouse - 0.5) * 0.04;

  vec2 cam = vec2(uCameraPos.x, -uCameraPos.z) * 0.12;
  vec2 cuv = (block / res - 0.5) * uZoom + cam;
  vec2 uv  = cuv + 0.5;

  vec3 col;
  if (uv.y >= HORIZON)
  {
    col = upperScene(uv);

    /* drifting birds */
    for (int i = 0; i < 3; i++)
    {
      float fi = float(i);
      vec2  bp = vec2(fract(0.2 + fi * 0.33 + uTime * 0.03),
                      0.80 + 0.04 * sin(uTime * 0.6 + fi));
      float v = smoothstep(0.004, 0.0, abs(uv.y - bp.y + abs(uv.x - bp.x) * 0.5))
              * step(abs(uv.x - bp.x), 0.018);
      col = mix(col, vec3(0.15, 0.15, 0.2), v);
    }
  }
  else if (uv.y >= BANK)
  {
    float rip = 0.010 * sin(uv.x * 36.0 + uTime * 2.0)
              + 0.012 * (det(vec2(uv.x * 6.0, uv.y * 18.0 - uTime * 0.5)) - 0.5);
    vec2  ruv  = vec2(uv.x + rip * 0.6, 2.0 * HORIZON - uv.y + rip);
    col = mix(upperScene(ruv), vec3(0.45, 0.65, 0.82), 0.45);
    col *= 0.78 + 0.22 * (uv.y - BANK) / (HORIZON - BANK);
    float shimmer = smoothstep(0.6, 0.95, det(vec2(uv.x * 9.0, uv.y * 26.0 - uTime)));
    col += vec3(1.0) * shimmer * 0.22;
    /* sunlight glittering in a column beneath the sun */
    float glit = smoothstep(0.12, 0.0, abs(uv.x - 0.74))
               * smoothstep(0.55, 1.0, det(vec2(uv.x * 28.0, uv.y * 70.0 - uTime * 1.6)));
    col += vec3(1.0, 0.92, 0.7) * glit * 0.5;
  }
  else
  {
    float g = det(vec2(uv.x * 5.0, uv.y * 10.0) + par);
    col = mix(vec3(0.22, 0.42, 0.16), vec3(0.32, 0.55, 0.22), g);
    col *= 0.78 + 0.4 * uv.y / BANK;
  }

  /* drifting ground mist over the far water / shoreline */
  float mist = smoothstep(0.10, 0.0, abs(uv.y - (HORIZON - 0.03)))
             * smoothstep(0.40, 0.80, fbm(vec2(uv.x * 4.0 + uTime * 0.04, uv.y * 9.0)));
  col = mix(col, vec3(0.85, 0.90, 0.92), mist * 0.40);

  drawGrass(col, uv, vec3(0.28, 0.55, 0.22), vec3(0.45, 0.72, 0.30));
  drawCreeper(col, uv);

  cursorMosh(col, block / res, aspect);

  col = posterize(col, block);
  col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 3.14159);
  FragColor = vec4(col, 1.0);
}
