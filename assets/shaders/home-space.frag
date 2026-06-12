// Home — black hole (dark)

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uCameraPos;
uniform float uZoom;

uniform sampler2D iChannel0;          // nebula / turbulence
uniform sampler2D iChannel1;          // astronaut sprite
uniform vec3      iChannelResolution[3];

out vec4 FragColor;

const float PIXEL  = 3.0;
const float LEVELS = 6.0;
const float RH     = 0.16;            // event-horizon radius

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
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

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

/* shaded sphere body; w = depth-fade weight */
void drawBody(inout vec3 col, vec2 p, vec2 pos, float r, vec3 c1, vec3 c2, vec3 ldir, float ts, float w)
{
  if (w <= 0.0) return;
  vec2  lp = p - pos;
  float dd = length(lp);
  float m  = smoothstep(r, r - 0.008, dd);
  if (m <= 0.0) return;
  vec3  n    = normalize(vec3(lp, sqrt(max(r * r - dd * dd, 1e-4))));
  float diff = clamp(dot(n, ldir), 0.0, 1.0);
  float band = det(lp * ts + 0.5) * 0.3 - 0.15;
  col = mix(col, mix(c1, c2, diff) + band, m * w);
}

vec2 orbit(float R, float a) { return vec2(cos(a) * R, sin(a) * R * 0.42); }

void drawSystem(inout vec3 col, vec2 p, vec2 pos, float pr, vec3 c1, vec3 c2, vec3 ldir, float ma, float w)
{
  drawBody(col, p, pos, pr, c1, c2, ldir, 16.0, w);
  vec2 mpos = pos + orbit(pr * 2.6, ma) * vec2(1.0, 0.7);
  drawBody(col, p, mpos, pr * 0.42, vec3(0.35, 0.35, 0.42), vec3(0.85, 0.86, 0.95), ldir, 22.0, w);
}

/* Saturn-style ring; `back` selects the arc behind the body */
void drawRing(inout vec3 col, vec2 p, vec2 pos, float pr, float w, bool back)
{
  vec2 lp = p - pos;
  if ((lp.y >= 0.0) != back) return;
  vec2  e   = vec2(lp.x, lp.y / 0.34);
  float re  = length(e);
  float rin = pr * 1.5, rout = pr * 2.7;
  float m   = smoothstep(rin, rin + 0.004, re) * (1.0 - smoothstep(rout - 0.004, rout, re));
  if (m <= 0.0) return;
  vec3 rc = mix(vec3(0.85, 0.72, 0.5), vec3(1.0, 0.95, 0.8), fract(re * 34.0));
  col = mix(col, rc, m * w * 0.9);
}

void drawRingedSystem(inout vec3 col, vec2 p, vec2 pos, float pr, vec3 c1, vec3 c2, vec3 ldir, float ma, float w)
{
  drawRing(col, p, pos, pr, w, true);
  drawBody(col, p, pos, pr, c1, c2, ldir, 16.0, w);
  drawRing(col, p, pos, pr, w, false);
  vec2 mpos = pos + orbit(pr * 2.6, ma) * vec2(1.0, 0.7);
  drawBody(col, p, mpos, pr * 0.42, vec3(0.35, 0.35, 0.42), vec3(0.85, 0.86, 0.95), ldir, 22.0, w);
}

/* blue-giant star tidally devoured, with an infalling stream */
void drawStar(inout vec3 col, vec2 p, vec3 star, vec3 streamCol)
{
  float sa     = uTime * 0.22 + 0.5;
  vec2  pos    = orbit(0.34, sa);
  float a0     = atan(pos.y, pos.x), r0 = length(pos);
  vec2  toHole = normalize(-pos);

  float stream = 0.0;
  for (int i = 0; i < 18; i++)
  {
    float s   = float(i) / 17.0;
    float ang = a0 + s * s * 2.8;
    float rad = mix(r0, RH * 1.05, s);
    vec2  sp  = vec2(cos(ang) * rad, sin(ang) * rad * 0.5);
    stream += smoothstep(0.022 * (1.0 - s) + 0.004, 0.0, length(p - sp));
  }
  col += streamCol * clamp(stream, 0.0, 1.8) * 0.9;

  vec2  lp    = p - pos;
  float along = dot(lp, toHole);
  vec2  perp  = lp - along * toHole;
  float strc  = along > 0.0 ? 1.7 : 1.0;
  float sd    = length(perp + toHole * (along / strc));

  float R    = 0.095;                              // giant
  float gran = det(perp * 18.0 + vec2(uTime * 0.1, 0.0)) * 0.3;
  col += star * exp(-length(lp) * 6.0) * 0.9;      // smooth glow, no tangent rays
  col = mix(col, star * (1.0 + gran) + 0.2, smoothstep(R + 0.01, R - 0.008, sd));
}

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  res    = uResolution / PIXEL;
  float aspect = res.x / res.y;

  vec2 cam = vec2(uCameraPos.x, -uCameraPos.z) * 0.12;
  vec2 cuv = (block / res - 0.5) * uZoom + cam;
  vec2 p   = vec2(cuv.x * aspect, cuv.y);
  vec2 par = (uMouse - 0.5) * 0.05;

  float d = length(p);
  vec3  ldir = normalize(vec3(-0.5, 0.45, 0.7));

  /* ---- lensed background (swirls into the hole) ---- */
  float swirl = 0.30 / (d + 0.12);
  vec2  wp    = rot(swirl) * p;
  wp *= 1.0 + 0.02 / (d * d + 0.05);

  vec3 col = mix(vec3(0.03, 0.02, 0.10), vec3(0.10, 0.05, 0.20), block.y / res.y);

  /* nebula from texture */
  float neb = det(wp * 0.55 + vec2(uTime * 0.01, 0.0) + par)
            + 0.5 * det(wp * 1.3 - vec2(uTime * 0.015, 0.0));
  neb = smoothstep(0.55, 1.15, neb * 0.7);
  col += (vec3(0.30, 0.10, 0.45) + vec3(0.05, 0.12, 0.35) * wp.y) * neb;

  /* twinkling stars (also lensed) */
  for (int L = 0; L < 3; L++)
  {
    float fl = float(L);
    vec2  sp = (wp + par * (0.3 + fl * 0.4)) * mix(50.0, 130.0, fl / 2.0);
    vec2  h  = hash22(floor(sp) + fl * 17.0);
    float st = step(0.9, h.x);
    float tw = 0.5 + 0.5 * sin(uTime * (1.5 + h.y * 3.0) + h.x * 30.0);
    col += vec3(0.85, 0.9, 1.0) * st * smoothstep(0.16, 0.0, length(fract(sp) - 0.5)) * (0.4 + 0.6 * tw);
  }

  /* ---- orbiting bodies: a plain planet + a ringed planet, set well back ---- */
  float a0 = uTime * 0.25 + 0.0,  a1 = -uTime * 0.16 + 2.1;
  vec2  q0 = orbit(0.62, a0), q1 = orbit(0.85, a1);
  vec3  pc0 = vec3(0.55, 0.25, 0.6),  pc0b = vec3(0.95, 0.6, 1.0);
  vec3  pc1 = vec3(0.2, 0.4, 0.7),    pc1b = vec3(0.6, 0.85, 1.0);

  // depth weight (behind/front of the disk)
  float b0 = smoothstep(-0.22, 0.22, sin(a0));
  float b1 = smoothstep(-0.22, 0.22, sin(a1));

  /* behind the hole/disk (q0 plain, q1 ringed with a moon) */
  drawBody(col, p, q0, 0.05, pc0, pc0b, ldir, 16.0, b0);
  drawRingedSystem(col, p, q1, 0.065, pc1, pc1b, ldir, -uTime * 0.7 + 1.0, b1);

  /* ---- event horizon ---- */
  col = mix(col, vec3(0.0), smoothstep(RH, RH - 0.012, d));

  /* ---- accretion disk (tilted ellipse, swirling, doppler) ---- */
  vec2  e   = vec2(p.x, p.y / 0.30);
  float ed  = length(e);
  float ang = atan(p.y, p.x);
  float diskMask = smoothstep(0.17, 0.21, ed) * (1.0 - smoothstep(0.44, 0.52, ed));
  float turb = det(vec2(ang * 0.6 + ed * 2.0 - uTime * 0.25, ed * 3.0));
  float doppler = 0.55 + 0.45 * cos(ang);
  vec3  diskCol = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.95, 0.7), smoothstep(0.17, 0.5, ed));
  col = mix(col, diskCol * (0.55 + 0.7 * turb) * doppler + diskCol * 0.25, diskMask);

  /* photon ring + lensed top arc */
  col += vec3(1.0, 0.85, 0.6) * exp(-pow((d - RH) / 0.02, 2.0)) * 1.1;
  float arc = smoothstep(0.018, 0.0, abs(d - (RH + 0.045))) * step(0.0, p.y);
  col += vec3(1.0, 0.6, 0.25) * arc * (0.5 + 0.5 * turb);

  /* ---- blue giant being devoured ---- */
  drawStar(col, p, vec3(0.45, 0.65, 1.0), vec3(0.6, 0.8, 1.0));

  /* ---- bodies in front of the hole ---- */
  drawBody(col, p, q0, 0.05, pc0, pc0b, ldir, 16.0, 1.0 - b0);
  drawRingedSystem(col, p, q1, 0.065, pc1, pc1b, ldir, -uTime * 0.7 + 1.0, 1.0 - b1);

  /* ---- floating astronaut (iChannel1) ---- */
  float hh = 0.07, ww = hh * (16.0 / 24.0);
  // astronaut
  vec2  apos = orbit(0.74, uTime * 0.2 + 1.0) + vec2(0.0, 0.02 * sin(uTime * 1.6));
  vec2  lp   = rot(0.4 * sin(uTime * 0.5) + 0.2 * sin(uTime * 0.9)) * (p - apos);
  vec2  uvA  = vec2(lp.x / ww * 0.5 + 0.5, 0.5 + lp.y / hh * 0.5);
  if (iChannelResolution[1].x > 0.0 && uvA.x > 0.0 && uvA.x < 1.0 && uvA.y > 0.0 && uvA.y < 1.0)
  {
    vec4 spr = textureLod(iChannel1, uvA, 0.0);
    col = mix(col, spr.rgb, spr.a);
  }

  col = posterize(col, block);
  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
