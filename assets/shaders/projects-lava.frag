// Projects — pixel lava cave (night/hot). Textured molten pool (iChannel0 detail
// map): flowing veins, glowing cracks, bubbles, heat shimmer, rising embers,
// drifting smoke and a flickering cavern. Pixelated + dithered, camera pan/zoom.

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uCameraPos;
uniform float uZoom;

uniform sampler2D iChannel0;          // tileable molten detail / height map
uniform vec3      iChannelResolution[3];

out vec4 FragColor;

const float PIXEL  = 3.0;
const float LEVELS = 6.0;

float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
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
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}
/* tileable molten detail from the texture (fbm fallback if unbound) */
float detail(vec2 q)
{
  if (iChannelResolution[0].x > 0.0)
    return textureLod(iChannel0, q, 0.0).r;
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
float stalactite(float x, float seed)
{
  float c   = fract(x * 7.0 + seed);
  float tip = abs(c - 0.5) * 2.0;
  float len = 0.08 + 0.10 * hash21(vec2(floor(x * 7.0 + seed), seed));
  return len * (1.0 - tip);
}

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  res    = uResolution / PIXEL;
  float aspect = res.x / res.y;
  vec2  par    = (uMouse - 0.5) * 0.04;

  vec2 cam = vec2(uCameraPos.x, -uCameraPos.z) * 0.12;
  vec2 uv  = (block / res - 0.5) * uZoom + cam + 0.5;

  /* global molten flicker — drives the cavern lighting */
  float flicker = 0.82 + 0.18 * sin(uTime * 6.0) + 0.08 * sin(uTime * 13.0 + 1.3);

  /* wavy lava surface, perturbed by the detail texture */
  float lavaTop = 0.30 + 0.02 * sin(uv.x * 8.0 + uTime)
                + 0.02 * (detail(uv * vec2(3.0, 1.0) + vec2(uTime * 0.1, 0.0)) - 0.5);

  vec3 col = vec3(0.03, 0.02, 0.03);

  /* cavern rock: fbm body + bumpy texture detail */
  float rockN = fbm(uv * 6.0 + par);
  col = mix(col, vec3(0.10, 0.05, 0.05), rockN * 0.6);
  col = mix(col, vec3(0.15, 0.07, 0.06), detail(uv * 2.0 + par) * 0.4);

  /* warm rim light above the pool (flickers with the lava) */
  float rim = smoothstep(0.7, 0.0, uv.y - lavaTop);
  col += vec3(0.6, 0.22, 0.06) * rim * 0.5 * flicker;

  /* rising-heat shimmer on the rock just above the surface */
  float heat = smoothstep(0.28, 0.0, uv.y - lavaTop) * step(lavaTop, uv.y);
  float sh   = 0.5 + 0.5 * sin(uv.x * 40.0 + uTime * 4.0 + detail(uv * 4.0) * 6.2831);
  col += vec3(0.45, 0.16, 0.05) * heat * sh * 0.3 * flicker;

  /* stalactites */
  float st = stalactite(uv.x + par.x, 3.0);
  col = mix(col, vec3(0.02, 0.01, 0.02), step(1.0 - st, uv.y));

  /* drifting smoke haze near the ceiling */
  float smoke = fbm(uv * vec2(4.0, 3.0) + vec2(uTime * 0.05, -uTime * 0.15));
  col = mix(col, col * 0.35, smoothstep(0.55, 0.95, smoke) * smoothstep(0.65, 1.0, uv.y) * 0.7);

  /* lava pool */
  if (uv.y < lavaTop)
  {
    vec2  lp = vec2(uv.x * 1.5 + par.x, uv.y * 1.5 - uTime * 0.15);
    float t1 = detail(lp + vec2(uTime * 0.05, -uTime * 0.12));
    float t2 = detail(lp * 2.0 + vec2(-uTime * 0.07, uTime * 0.05));
    float flow = mix(t1, t2, 0.5) * 0.7 + 0.3 * fbm(lp * 4.0 - uTime * 0.2);

    vec3 lava = mix(vec3(0.45, 0.04, 0.0), vec3(1.0, 0.78, 0.18), smoothstep(0.25, 0.95, flow));

    /* glowing molten veins + finer crackle */
    float veins = smoothstep(0.03, 0.0, abs(flow - 0.5));
    lava += vec3(1.0, 0.85, 0.4) * veins * 1.1;
    float crack = smoothstep(0.62, 0.66, flow) - smoothstep(0.66, 0.70, flow);
    lava += vec3(1.0, 0.6, 0.2) * crack;

    /* bubbles that swell then pop on the surface */
    for (int i = 0; i < 8; i++)
    {
      float fi  = float(i);
      vec2  bp  = vec2(hash21(vec2(fi, 2.0)), lavaTop * (0.2 + 0.7 * hash21(vec2(fi, 5.0))));
      float cyc = fract(uTime * (0.3 + 0.2 * hash21(vec2(fi, 8.0))) + hash21(vec2(fi, 1.0)));
      float r   = 0.025 * sin(cyc * 3.14159);
      float bd  = length((uv - bp) * vec2(aspect, 1.0));
      lava += vec3(1.0, 0.9, 0.55) * smoothstep(r, 0.0, bd) * (1.0 - cyc);
    }

    float depth = smoothstep(lavaTop, lavaTop - 0.25, uv.y);
    col = mix(lava, lava * 0.45, depth) * (0.9 + 0.1 * flicker);
  }

  /* rising embers */
  for (int i = 0; i < 22; i++)
  {
    float fi = float(i);
    float sx = hash21(vec2(fi, 7.0));
    float sp = 0.15 + 0.30 * hash21(vec2(fi, 9.0));
    float ey = fract(uTime * sp + hash21(vec2(fi, 3.0)));
    float ex = sx + 0.03 * sin(uTime * 2.0 + fi);
    vec2  e  = vec2((uv.x - ex), (uv.y - ey * 0.7));
    float ed = length(e * vec2(aspect, 1.0));
    col += vec3(1.0, 0.5, 0.12) * smoothstep(0.012, 0.0, ed) * (1.0 - ey);
  }

  col = posterize(col, block);
  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
