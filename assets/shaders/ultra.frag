precision highp float;

uniform float uTime;
uniform vec2  uResolution;

out vec4 FragColor;

#define iTime       uTime
#define iResolution uResolution

float height = 1.3;
vec3  light  = vec3(0., .5, 0.1);

mat2 rotate2d(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

/* hash */
float hash(ivec3 p)
{
  int n = p.x * 3 + p.y * 113 + p.z * 311;
  n     = (n << 13) ^ n;
  n     = n * (n * n * 15731 + 789221) + 1376312589;
  return float(n & 0x0fffffff) / float(0x0fffffff);
}

/* noise */
float noise(vec3 x)
{
  ivec3 i = ivec3(floor(x));
  vec3  f = fract(x);
  f       = f * f * (3.0 - 2.0 * f);

  return mix(mix(mix(hash(i + ivec3(0, 0, 0)), hash(i + ivec3(1, 0, 0)), f.x),
                 mix(hash(i + ivec3(0, 1, 0)), hash(i + ivec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + ivec3(0, 0, 1)), hash(i + ivec3(1, 0, 1)), f.x),
                 mix(hash(i + ivec3(0, 1, 1)), hash(i + ivec3(1, 1, 1)), f.x), f.y),
             f.z);
}

/* messy noise */
float messyNoise(vec3 pos)
{
  mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);

  vec3 q = 8.0 * pos;

  float f = 0.5000 * noise(q);
  q       = m * q * 2.01;
  f += 0.2500 * noise(q);
  q = m * q * 2.02;
  f += 0.1250 * noise(q);
  q = m * q * 2.03;
  f += 0.0625 * noise(q);

  return f;
}

/* box sdf */
vec2 sdBox(vec3 p, vec3 b, float id)
{
  vec3 q = abs(p) - b;
  return vec2(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0), id);
}

/* round cone sdf (for falling stars) */
vec2 sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2, float id)
{
  vec3  ba  = b - a;
  float l2  = dot(ba, ba);
  float rr  = r1 - r2;
  float a2  = l2 - rr * rr;
  float il2 = 1.0 / l2;

  vec3  pa = p - a;
  float y  = dot(pa, ba);
  float z  = y - l2;

  float x2 = dot(pa * l2 - ba * y, pa * l2 - ba * y);
  float y2 = y * y * l2;
  float z2 = z * z * l2;

  float k = sign(rr) * rr * rr * x2;

  if (sign(z) * a2 * z2 > k)
    return vec2(sqrt(x2 + z2) * il2 - r2, id);

  if (sign(y) * a2 * y2 < k)
    return vec2(sqrt(x2 + y2) * il2 - r1, id);

  return vec2((sqrt(x2 * a2 * il2) + y * rr) * il2 - r1, id);
}

/* union */
vec2 opUnion(vec2 d1, vec2 d2) { return (d1.x < d2.x) ? d1 : d2; }

/* scene */
vec2 scene(vec3 p)
{
  vec2 sce;
  vec3 bulidcon = vec3(.5, 1.5, .5);

  vec3 q = (p + vec3(2., 0., 7.));
  q.xy *= rotate2d(.20);
  sce = sdBox(q, bulidcon, 2.);

  q = (p + vec3(-2., 0., 9.));
  q.xy *= rotate2d(.30);
  sce = opUnion(sce, sdBox(q, bulidcon, 2.));

  q = (p + vec3(-4., 0.1, 7.));
  q.xy *= rotate2d(.40);
  sce = opUnion(sce, sdBox(q, bulidcon, 2.));

  q = (p + vec3(6., 0.1, 7.));
  q.xy *= rotate2d(.40);
  sce = opUnion(sce, sdBox(q, bulidcon, 2.));

  q = (p + vec3(8., 0.1, 6.));
  q.xy *= rotate2d(.10);
  sce = opUnion(sce, sdBox(q, bulidcon, 2.));

  q = (p + vec3(-7., 0.1, 6.));
  q.xy *= rotate2d(.10);
  sce = opUnion(sce, sdBox(q, bulidcon, 2.));

  /* falling stars */
  int stars = 8;

  for (int o = 0; o < stars; o++)
  {
    float iTime2 = iTime + hash(ivec3(o)) * 10.;
    float h2     = hash(ivec3(int(floor(iTime2 / 15.0)) + o));

    q = p + vec3(mix(6., -12., h2), -10., mix(4., 10., float(o) / float(stars)));

    float y = mod(iTime2, 15.0);

    q += vec3(y, y, 0.);

    sce = opUnion(sce, sdRoundCone(q, vec3(0.), vec3(1., 1., 0.), .1, .01, 4.));
  }

  return sce;
}

/* ground */
float ground(vec2 p) { return noise(vec3(p.x, 1., p.y)) / 3.; }

/* raymarch */
vec2 raymarch(vec3 ro, vec3 rd)
{
  float id   = 0.0;
  float dist = 0.0;

  float mint = 2.2;
  float maxt = 10.;
  float dt   = .05;

  for (float t = mint; t < maxt; t += dt)
  {
    vec3 p = ro + rd * t;

    if (p.y < ground(p.xz))
    {
      dist = t - dt * 0.5;
      id   = 1.;
      break;
    }

    dist = t;
  }

  float dis2 = 0.;

  for (int i = 0; i < 24; i++)
  {
    vec2 depth = scene(ro + rd * dis2);

    if (depth.x < .001)
    {
      if (dist > dis2 || id == 0.)
        id = depth.y;
      break;
    }

    dis2 += depth.x;

    if (dis2 > 20.0)
      break;
  }

  dist = min(dis2, dist);

  return vec2(dist, id);
}

/* shading */
vec3 shade(vec2 t, vec3 rd, vec3 ro)
{
  vec3 col = vec3(0.);
  vec3 p   = ro + rd * t.x;

  float falloff = clamp(1. - distance(p, light) * .2, 0., 1.);

  if (t.y == 0.)
  {
    col = mix(vec3(0.702, 0., 0.) * .75, vec3(0.969, 0., 0.) * .75, smoothstep(0.3, .0, rd.y));
  }
  else if (t.y == 1.)
  {
    col = vec3(messyNoise(p / 2.)) * falloff;
  }
  else if (t.y >= 4.)
  {
    col = mix(vec3(1., 0.965, 0.361), vec3(1., 0.671, 0.239), t.y - 3.9);
  }

  return col;
}

void main()
{
  vec2 fragCoord = gl_FragCoord.xy;

  vec3 RO = vec3(.0, height, 2.0);
  vec3 ta = vec3(0.0, height, 0.0);

  vec3 ww = normalize(ta - RO);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);

  vec2 p = (-iResolution.xy + 2.0 * fragCoord) / iResolution.y;

  vec3 RD = normalize(p.x * uu + p.y * vv + 1.5 * ww);

  vec2 t = raymarch(RO, RD);

  vec3 col = shade(t, RD, RO);

  FragColor = vec4(col, 1.0);
}
