// Projects — pixel lava cave (day / cooled). Light variant: lighter grey rock,
// dim cooled lava (deep red, little glow), cooler ambient, faint crystal glints.

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uCameraPos;
uniform float uZoom;

uniform sampler2D iChannel0;          // shared molten/rock detail map
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
  vec2 block = floor(gl_FragCoord.xy / PIXEL);
  vec2 res   = uResolution / PIXEL;
  vec2 par   = (uMouse - 0.5) * 0.04;

  // camera: WASD pans (uCameraPos.xz), scroll zooms (uZoom).
  vec2 cam = vec2(uCameraPos.x, -uCameraPos.z) * 0.12;
  vec2 uv  = (block / res - 0.5) * uZoom + cam + 0.5;

  float lavaTop = 0.30 + 0.015 * sin(uv.x * 8.0 + uTime * 0.5);

  /* cool, lit grey rock with bumpy obsidian detail */
  vec3 col = vec3(0.32, 0.30, 0.34);
  float rockN = fbm(uv * 6.0 + par);
  col = mix(col, vec3(0.5, 0.48, 0.55), rockN * 0.6);
  col = mix(col, vec3(0.20, 0.18, 0.24), detail(uv * 3.0 + par) * 0.4); // obsidian veins
  col *= 0.7 + 0.5 * uv.y;                     // ambient gradient from above

  /* faint crystal glints in the rock */
  vec2  cp   = floor((uv + par) * 40.0);
  float cr   = step(0.97, hash21(cp));
  col += vec3(0.6, 0.8, 0.9) * cr * (0.5 + 0.5 * sin(uTime * 3.0 + cp.x));

  /* stalactites */
  float st = stalactite(uv.x + par.x, 3.0);
  col = mix(col, vec3(0.22, 0.20, 0.24), step(1.0 - st, uv.y));

  /* cooled lava — deep dim red crust, only faint veins still glow */
  if (uv.y < lavaTop)
  {
    vec2  lp   = vec2(uv.x * 1.5 + par.x, uv.y * 1.5 - uTime * 0.06);
    float flow = mix(detail(lp), detail(lp * 2.0 + 3.0), 0.5) * 0.7 + 0.3 * fbm(lp * 4.0);
    vec3  lava = mix(vec3(0.14, 0.05, 0.05), vec3(0.45, 0.17, 0.12), smoothstep(0.3, 0.95, flow));
    float veins = smoothstep(0.03, 0.0, abs(flow - 0.5));
    lava += vec3(0.85, 0.4, 0.18) * veins * 0.5;       // dim molten seams
    col = lava;
  }

  col = posterize(col, block);
  col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
