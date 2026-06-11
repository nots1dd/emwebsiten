// About — pixel forest path (day). Light variant: bright emerald sky, a sun
// with light shafts through the trees, lighter fog, no fireflies.

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uCameraPos;
uniform float uZoom;

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
float treeLine(float x, float seed, float density)
{
  float h = 0.0;
  h += 0.5 * vnoise(vec2(x * density, seed));
  h += 0.25 * vnoise(vec2(x * density * 2.3, seed + 5.0));
  float tip = abs(fract(x * density * 3.0 + seed) - 0.5) * 2.0;
  h += 0.18 * (1.0 - tip);
  return h;
}
float disc(vec2 p, vec2 c, float r) { return smoothstep(r, r - 0.012, length(p - c)); }

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  res    = uResolution / PIXEL;
  float aspect = res.x / res.y;
  vec2  par    = (uMouse - 0.5) * 0.05;

  vec2 cam = vec2(uCameraPos.x, -uCameraPos.z) * 0.12;
  vec2 cuv = (block / res - 0.5) * uZoom + cam;
  vec2 uv  = cuv + 0.5;
  vec2 p   = vec2(cuv.x * aspect, cuv.y);

  /* bright day sky: pale sky-blue -> warm green near horizon */
  vec3 col = mix(vec3(0.75, 0.95, 0.7), vec3(0.55, 0.85, 0.95), pow(uv.y, 0.6));

  /* sun + god rays */
  vec2  sc   = vec2(0.28, 0.30) + par * 0.4;
  float glow = exp(-length(p - sc) * 3.0);
  col += vec3(1.0, 0.95, 0.7) * glow * 0.8;
  float ray = 0.5 + 0.5 * sin(atan(p.y - sc.y, p.x - sc.x) * 14.0 + uTime * 0.5);
  col += vec3(1.0, 0.97, 0.7) * ray * smoothstep(0.7, 0.0, length(p - sc)) * 0.18;
  col = mix(col, vec3(1.0, 0.98, 0.8), disc(p, sc, 0.1));

  /* light fog */
  float fog = vnoise(vec2(uv.x * 4.0 + uTime * 0.05, uv.y * 6.0));
  col = mix(col, vec3(0.9, 1.0, 0.92), smoothstep(0.5, 0.95, fog) * (1.0 - uv.y) * 0.5);

  /* tree layers — lighter, greener in daylight */
  for (int L = 0; L < 3; L++)
  {
    float fl      = float(L);
    float horizon = 0.18 + fl * 0.10;
    float amp     = 0.10 + fl * 0.07;
    float x       = uv.x + par.x * (0.4 + fl * 0.6) + fl * 0.13;
    float line    = horizon + treeLine(x, fl * 9.0, 6.0 + fl * 4.0) * amp;
    float mask    = step(uv.y, line);
    vec3  treeCol = mix(vec3(0.22, 0.5, 0.25), vec3(0.06, 0.2, 0.12), fl / 2.0);
    col = mix(col, treeCol, mask);
  }

  col = posterize(col, block);
  col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
