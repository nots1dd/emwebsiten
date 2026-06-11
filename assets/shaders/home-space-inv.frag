// Home — pixel starfield (day / cosmic dawn). Light variant: pale lilac->peach
// sky, a warm sun, soft clouds and only a few faint stars.

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uCameraPos;
uniform float uZoom;

out vec4 FragColor;

const float PIXEL  = 3.0;
const float LEVELS = 6.0;

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
float disc(vec2 p, vec2 c, float r) { return smoothstep(r, r - 0.012, length(p - c)); }

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  res    = uResolution / PIXEL;
  float aspect = res.x / res.y;
  vec2  par    = (uMouse - 0.5) * 0.06;

  vec2 cam = vec2(uCameraPos.x, -uCameraPos.z) * 0.12;
  vec2 cuv = (block / res - 0.5) * uZoom + cam;
  vec2 uv  = cuv + 0.5;
  vec2 p   = vec2(cuv.x * aspect, cuv.y);

  /* pale dawn sky: peach near horizon -> lilac up */
  vec3 col = mix(vec3(1.0, 0.82, 0.7), vec3(0.72, 0.68, 0.95), uv.y);

  /* soft clouds */
  float cl = fbm(p * 2.5 + vec2(uTime * 0.03, 0.0) + par);
  col = mix(col, vec3(1.0, 0.97, 1.0), smoothstep(0.55, 0.95, cl) * 0.6);

  /* warm sun (upper right) with glow */
  vec2  sc   = vec2(0.34, 0.22) + par * 0.4;
  float glow = exp(-length(p - sc) * 3.2);
  col += vec3(1.0, 0.85, 0.5) * glow * 0.7;
  float sun = disc(p, sc, 0.13);
  col = mix(col, vec3(1.0, 0.93, 0.6), sun);

  /* a few faint daytime stars */
  vec2  sp   = (uv + par * 0.5) * 70.0;
  vec2  cell = floor(sp);
  vec2  h    = hash22(cell);
  float star = step(0.93, h.x);
  float tw   = 0.5 + 0.5 * sin(uTime * 2.0 + h.y * 30.0);
  col += vec3(1.0) * star * smoothstep(0.16, 0.0, length(fract(sp) - 0.5)) * 0.25 * tw;

  col = posterize(col, block);
  col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
