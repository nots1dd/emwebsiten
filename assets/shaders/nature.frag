precision     highp float;
uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
out vec4      FragColor;

#define PI 3.14159265

/* ---- hash / noise ---- */
float hash(float n) { return fract(sin(n) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p)
{
  vec2 i = floor(p), f = fract(p);
  f       = f * f * (3.0 - 2.0 * f);
  float a = hash2(i), b = hash2(i + vec2(1, 0)), c = hash2(i + vec2(0, 1)),
        d = hash2(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p)
{
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++)
  {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

/* ---- day cycle ---- */
float dayTime() { return fract(uTime * 0.04); }
float sunY(float t) { return sin(t * PI); }
float nightness()
{
  float t = dayTime();
  return smoothstep(0.1, 0.4, 1.0 - t) + smoothstep(0.6, 0.9, t);
}

/* sky gradient */
vec3 skyColor(vec2 uv, float t)
{
  float night     = nightness();
  float horizon   = 1.0 - smoothstep(0.0, 0.55, uv.y);
  vec3  dayTop    = vec3(0.25, 0.55, 0.92);
  vec3  dayHor    = vec3(0.72, 0.86, 1.0);
  vec3  sunsetTop = vec3(0.15, 0.12, 0.45);
  vec3  sunsetHor = vec3(0.95, 0.42, 0.12);
  vec3  nightTop  = vec3(0.03, 0.04, 0.14);
  vec3  nightHor  = vec3(0.07, 0.08, 0.22);
  float ss        = smoothstep(0.0, 0.15, t) * smoothstep(0.35, 0.18, t) +
             smoothstep(0.65, 0.8, t) * smoothstep(1.0, 0.85, t);
  vec3 top = mix(mix(dayTop, sunsetTop, ss), nightTop, night);
  vec3 hor = mix(mix(dayHor, sunsetHor, ss), nightHor, night);
  return mix(top, hor, horizon);
}

/* sun */
float sunDisk(vec2 uv, float t)
{
  float angle  = t * PI;
  vec2  sunPos = vec2(0.5 + cos(angle) * 0.42, 0.62 + sunY(t) * 0.30);
  float d      = length(uv - sunPos);
  return smoothstep(0.045, 0.035, d);
}
vec3 sunColor(float t)
{
  float ss = smoothstep(0.0, 0.12, t) * smoothstep(0.30, 0.15, t) +
             smoothstep(0.70, 0.85, t) * smoothstep(1.0, 0.88, t);
  return mix(vec3(1.0, 0.95, 0.6), vec3(1.0, 0.4, 0.1), ss);
}

/* moon */
float moonDisk(vec2 uv, float t)
{
  float angle   = (t + 1.0) * PI;
  vec2  moonPos = vec2(0.5 + cos(angle) * 0.42, 0.62 + sunY(fract(t + 0.5)) * 0.30);
  float d       = length(uv - moonPos);
  return smoothstep(0.032, 0.022, d);
}

/* stars */
float stars(vec2 uv, float t)
{
  vec2  grid    = floor(uv * 80.0);
  float h       = hash2(grid);
  vec2  cell    = fract(uv * 80.0) - 0.5;
  float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + h * 43.0);
  float star    = smoothstep(0.18, 0.05, length(cell)) * twinkle;
  return step(0.82, h) * star;
}

/* clouds */
float cloud(vec2 uv)
{
  float c = 0.0;
  c += smoothstep(0.55, 0.65, fbm(uv * 3.0 + vec2(uTime * 0.012, 0.0)));
  return clamp(c, 0.0, 1.0);
}

/* ---- terrain ---- */
float groundLevel() { return 0.28; }

/* grass wave */
float grassField(vec2 p) { return fbm(p * 6.0 + vec2(0, uTime * 0.06)); }

/* tree helpers */
float treeTrunk(vec2 uv, vec2 base, float h, float w)
{
  vec2  d    = uv - base;
  float inX  = smoothstep(w, w * 0.7, abs(d.x));
  float inY  = step(0.0, d.y) * step(d.y, h);
  float bark = fbm(vec2(d.x * 40.0, d.y * 8.0 + base.x * 20.0)) * 0.35 + 0.05;
  return inX * inY * (bark + 0.6);
}
float treeCanopy(vec2 uv, vec2 center, float r)
{
  float d     = length(uv - center);
  float shape = smoothstep(r, r * 0.5, d);
  float tex   = fbm((uv - center) * 8.0 + center * 5.0) * 0.4 + 0.6;
  return shape * tex;
}

/* ---- MAIN ---- */
void main()
{
  vec2  uv     = gl_FragCoord.xy / uResolution;
  float t      = dayTime();
  float night  = nightness();
  float ground = groundLevel();

  vec3 col = vec3(0);

  /* --- SKY --- */
  if (uv.y > ground)
  {
    col = skyColor(uv, t);

    /* stars */
    float s = stars(uv * vec2(uResolution.x / uResolution.y, 1.0) * 1.6, t);
    col     = mix(col, vec3(1.0), s * night);

    /* moon */
    float m      = moonDisk(uv, t);
    col          = mix(col, vec3(0.94, 0.96, 1.0), m * night);
    float angle2 = (t + 1.0) * PI;
    vec2  moonP  = vec2(0.5 + cos(angle2) * 0.42, 0.62 + sunY(fract(t + 0.5)) * 0.30);
    float mglow  = exp(-length(uv - moonP) * 22.0) * 0.18 * night;
    col += vec3(0.5, 0.55, 0.7) * mglow;

    /* sun */
    float sunD  = sunDisk(uv, t);
    vec3  sc    = sunColor(t);
    col         = mix(col, sc, sunD * (1.0 - night));
    float angle = t * PI;
    vec2  sunP  = vec2(0.5 + cos(angle) * 0.42, 0.62 + sunY(t) * 0.30);
    float glow  = exp(-length(uv - sunP) * 14.0) * 0.22 * (1.0 - night);
    col += sc * glow;

    /* clouds */
    float cl       = cloud(uv * vec2(uResolution.x / uResolution.y, 1.0));
    vec3  cloudCol = mix(vec3(0.95, 0.96, 1.0), vec3(0.15, 0.13, 0.22), night);
    col            = mix(col, cloudCol, cl * 0.82 * (1.0 - night * 0.6));
  }

  /* --- GROUND --- */
  if (uv.y <= ground)
  {
    float gx = (uv.x - 0.5) * (uResolution.x / uResolution.y);
    float gy = uv.y;
    float g  = grassField(vec2(gx * 2.0, gy * 3.0));

    float dayLight   = mix(0.45, 1.0, 1.0 - night);
    vec3  grassLight = vec3(0.56, 0.78, 0.34) * dayLight;
    vec3  grassDark  = vec3(0.38, 0.58, 0.22) * dayLight;
    vec3  grassCol   = mix(grassDark, grassLight, g);

    float dirtBlend = smoothstep(0.04, 0.0, uv.y);
    vec3  dirtCol   = vec3(0.38, 0.26, 0.16) * dayLight;
    col             = mix(grassCol, dirtCol, dirtBlend);

    float shadeLine = smoothstep(ground, ground - 0.04, uv.y) * 0.3;
    col *= 1.0 - shadeLine;
  }

  /* --- TREES --- */
  float tx[5];
  tx[0] = 0.10;
  tx[1] = 0.25;
  tx[2] = 0.52;
  tx[3] = 0.70;
  tx[4] = 0.88;
  float th[5];
  th[0] = 0.14;
  th[1] = 0.10;
  th[2] = 0.16;
  th[3] = 0.09;
  th[4] = 0.12;
  float tw[5];
  tw[0] = 0.014;
  tw[1] = 0.011;
  tw[2] = 0.016;
  tw[3] = 0.010;
  tw[4] = 0.013;
  float cr[5];
  cr[0] = 0.09;
  cr[1] = 0.07;
  cr[2] = 0.10;
  cr[3] = 0.065;
  cr[4] = 0.08;

  float dayLight2 = mix(0.42, 1.0, 1.0 - night);
  for (int i = 0; i < 5; i++)
  {
    float bx  = tx[i];
    float by  = ground;
    float trH = th[i];
    float trW = tw[i];
    float cR  = cr[i];

    float ax = (uv.x - bx) * (uResolution.x / uResolution.y);
    float ay = uv.y - by;

    /* trunk */
    float trunk =
      treeTrunk(vec2(ax, ay), vec2(0.0, 0.0), trH, trW * (uResolution.x / uResolution.y));
    if (trunk > 0.0)
    {
      float barkH    = hash(float(i) * 3.7 + 0.1);
      vec3  barkBase = mix(vec3(0.28, 0.18, 0.10), vec3(0.42, 0.30, 0.18), barkH);
      vec3  barkCol  = barkBase * (0.65 + trunk * 0.35) * dayLight2;
      float line     = sin(ay * 120.0 + barkH * 10.0) * 0.5 + 0.5;
      barkCol *= 0.88 + line * 0.12;
      col = mix(col, barkCol, smoothstep(0.5, 0.7, trunk));
    }

    /* canopy */
    vec2 canopyCenter =
      vec2((uv.x - bx) * (uResolution.x / uResolution.y), uv.y - (by + trH * 0.82));
    float cy = treeCanopy(canopyCenter, vec2(0.0), cR);
    if (cy > 0.01)
    {
      float seed      = hash(float(i) * 5.3 + 0.6);
      vec3  leafDark  = mix(vec3(0.12, 0.28, 0.10), vec3(0.10, 0.24, 0.14), seed) * dayLight2;
      vec3  leafLight = mix(vec3(0.22, 0.44, 0.15), vec3(0.18, 0.38, 0.20), seed) * dayLight2;
      vec3  leafCol   = mix(leafDark, leafLight, cy * 0.7);
      col             = mix(col, leafCol, cy * 0.95);
    }
  }

  /* --- GRASS BLADES at horizon --- */
  {
    float bladeZone = smoothstep(ground + 0.01, ground - 0.005, uv.y) *
                      smoothstep(ground - 0.06, ground - 0.01, uv.y);
    float bladeNoise = fbm(vec2(uv.x * 28.0 + uTime * 0.08, uv.y * 12.0));
    float bladeCol   = bladeNoise * bladeZone;
    float dl         = mix(0.5, 1.0, 1.0 - night);
    col              = mix(col, vec3(0.45, 0.68, 0.24) * dl, bladeCol * 0.55);
  }

  /* --- HORIZON BLEND --- */
  if (abs(uv.y - ground) < 0.012)
  {
    float blend = smoothstep(0.012, 0.0, abs(uv.y - ground));
    vec3  horizCol =
      mix(vec3(0.30, 0.22, 0.14), vec3(0.52, 0.72, 0.30), 0.5) * mix(0.5, 1.0, 1.0 - night);
    col = mix(col, horizCol, blend * 0.6);
  }

  /* --- CURSOR RIPPLE --- */
  float mx = uMouse.x, my = uMouse.y;
  if (my < ground + 0.05)
  {
    float dx     = (uv.x - mx) * (uResolution.x / uResolution.y);
    float dy     = uv.y - my;
    float dist   = length(vec2(dx, dy));
    float ripple = sin(dist * 40.0 - uTime * 5.0) * exp(-dist * 12.0) * 0.06;
    col += vec3(0.3, 0.5, 0.1) * ripple;
  }

  /* --- VIGNETTE --- */
  float vign = 1.0 - smoothstep(0.55, 1.4, length(uv - 0.5) * 1.4);
  col *= mix(0.7, 1.0, vign);

  FragColor = vec4(col, 1.0);
}
