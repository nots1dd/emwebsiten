precision highp float;

uniform float uTime;
uniform float uDelta;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uZoom;

out vec4 FragColor;

#define speed                     10.0
#define audio_vibration_amplitude 0.125

float jTime;

/* --------------------------- */

float hash21(vec2 co) { return fract(sin(dot(co.xy, vec2(1.9898, 7.233))) * 45758.5433); }

float textureMirror(vec2 c)
{
  vec2 cf = fract(c);
  return hash21(mix(cf, 1. - cf, mod(floor(c), 2.)));
}

float amp(vec2 p) { return smoothstep(1., 8., abs(p.x)); }

float pow512(float a)
{
  a *= a;
  a *= a;
  a *= a;
  a *= a;
  a *= a;
  a *= a;
  a *= a;
  a *= a;
  return a * a;
}

float pow1d5(float a) { return a * sqrt(a); }

/* --------------------------- */

float hash(vec2 uv)
{
  float a = amp(uv);

  float w =
    a > 0. ? (1. - .4 * pow512(.51 + .49 * sin((.02 * (uv.y + .5 * uv.x) - jTime) * 2.))) : 0.;

  return (a > 0. ? a * pow1d5(hash21(uv)) * w : 0.) -
         (textureMirror(vec2((uv.x * 29. + uv.y) * .03125, 1.)) * audio_vibration_amplitude);
}

/* --------------------------- */

vec2 trinoise(vec2 uv)
{
  const float sq = sqrt(3. / 2.);
  uv.x *= sq;
  uv.y -= .5 * uv.x;

  vec2 d = fract(uv);
  uv -= d;

  bool c = dot(d, vec2(1)) > 1.;

  vec2 dd = 1. - d;
  vec2 da = c ? dd : d, db = c ? d : dd;

  float nn = hash(uv + float(c));
  float n2 = hash(uv + vec2(1, 0));
  float n3 = hash(uv + vec2(0, 1));

  float nmid = mix(n2, n3, d.y);
  float ns   = mix(nn, c ? n2 : n3, da.y);

  float dx = da.x / db.y;

  return vec2(mix(ns, nmid, dx), 0.0);
}

/* --------------------------- */

vec2 map(vec3 p)
{
  vec2 n = trinoise(p.xz);
  return vec2(p.y - 2. * n.x, n.y);
}

vec3 grad(vec3 p)
{
  const vec2 e = vec2(.005, 0);
  float      a = map(p).x;
  return vec3(map(p + e.xyy).x - a, map(p + e.yxy).x - a, map(p + e.yyx).x - a) / e.x;
}

/* --------------------------- */

vec2 intersect(vec3 ro, vec3 rd)
{
  float d = 0.;

  for (int i = 0; i < 200; i++)
  {
    vec3 p = ro + d * rd;
    vec2 s = map(p);

    float h = s.x;
    d += h * .5;

    if (abs(h) < .003 * d)
      return vec2(d, s.y);

    if (d > 150. || p.y > 2.)
      break;
  }

  return vec2(-1);
}

/* --------------------------- */
/* INVERTED SUN (dark) */

void addsun(vec3 rd, vec3 ld, inout vec3 col)
{
  float sun = smoothstep(.21, .2, distance(rd, ld));

  if (sun > 0.)
  {
    float yd = (rd.y - ld.y);
    float a  = sin(3.1 * exp(-(yd) * 14.));
    sun *= smoothstep(-.8, 0., a);

    // dark sun
    col = mix(col, vec3(0.0), sun * 0.8);
  }
}

/* --------------------------- */
/* DARK STARS */

float starnoise(vec3 rd)
{
  float c = 0.;
  vec3  p = normalize(rd) * 300.;

  for (float i = 0.; i < 4.; i++)
  {
    vec3 q  = fract(p) - .5;
    vec3 id = floor(p);

    float c2 = smoothstep(.5, 0., length(q));
    c2 *= step(hash21(id.xz / id.y), .05);

    c += c2;
    p = p * .6;
  }

  return c * c;
}

/* --------------------------- */
/* LIGHT SKY */

vec3 gsky(vec3 rd, vec3 ld, bool mask)
{
  float haze = exp2(-5. * abs(rd.y));

  float st = mask ? starnoise(rd) * (1. - min(haze, 1.)) : 0.;

  float t = clamp(rd.y * 0.5 + 0.5, 0.0, 1.0);

  vec3 skyLight = vec3(0.95);
  vec3 skyDark  = vec3(0.75);

  vec3 col = mix(skyDark, skyLight, t);

  // dark stars
  col -= st * 0.4;

  if (mask)
    addsun(rd, ld, col);

  return clamp(col, 0.0, 1.0);
}

/* --------------------------- */

void main()
{
  vec2 uv = (2. * gl_FragCoord.xy - uResolution.xy) / uResolution.y;
  uv *= uZoom;

  float dt = fract(hash21(gl_FragCoord.xy) + uTime) * 0.25;

  jTime = mod(uTime - dt * uDelta, 4000.);

  vec3 ro = vec3(0., 1., (-20000. + jTime * speed));

  vec3 rd = normalize(vec3(uv, 0.9));

  vec2  i = intersect(ro, rd);
  float d = i.x;

  vec3 ld = normalize(vec3(0, .125 + .05 * sin(.1 * jTime), 1));

  vec3 fog = d > 0. ? exp2(-d * vec3(.14, .1, .28)) : vec3(0.);
  vec3 sky = gsky(rd, ld, d < 0.);

  vec3 col;

  if (d > 0.0)
  {
    vec3 p = ro + d * rd;
    vec3 n = normalize(grad(p));

    float diff = dot(n, ld) + .1 * n.y;

    // light terrain
    float shade = diff * 0.6 + 0.4;
    col         = vec3(shade);

    vec3 rfd   = reflect(rd, n);
    vec3 rfcol = gsky(rfd, ld, true);

    col = mix(col, rfcol, .4);

    col = mix(col, vec3(0.8), smoothstep(.05, .0, i.y) * 0.2);

    col = mix(sky, col, fog);
  }
  else
  {
    col = sky;
  }

  FragColor = vec4(clamp(col, 0., 1.), 1.0);
}
