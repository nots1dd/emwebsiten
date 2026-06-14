// Projects — ice fractal (dark)

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uMouseTrail[16];   // recent cursor path: .xy = pos (0..1), .z = age (s)
uniform vec3  uCameraPos;
uniform float uZoom;

uniform sampler2D iChannel0;
uniform vec3      iChannelResolution[3];

out vec4 FragColor;

const float PIXEL  = 3.0;
const float LEVELS = 8.0;
const int   MAXI   = 72;

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
  if (iChannelResolution[0].x > 0.0) return textureLod(iChannel0, q * 0.15, 0.0).r;
  return fbm(q);
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

/* night palette: the inverse of the day variant — mostly black, easing through
   dark navy to a dark blue for contrast (vs. white -> light gray -> gray) */
vec3 icePalette(float t)
{
  t = clamp(t, 0.0, 1.0);
  vec3 black = vec3(0.01, 0.02, 0.05);
  vec3 navy  = vec3(0.03, 0.07, 0.18);
  vec3 dblue = vec3(0.10, 0.20, 0.40);
  vec3 c = mix(black, navy, smoothstep(0.0, 0.50, t));
  c = mix(c, dblue, smoothstep(0.50, 1.0, t));
  return c;
}

/* gentle snow trailing the cursor — small, soft flakes that drift down with age */
void cursorTrail(inout vec3 col, vec2 scr, float aspect)
{
  vec2 sa = vec2(aspect, 1.0);
  for (int i = 0; i < 16; i++)
  {
    vec3 s = uMouseTrail[i];
    if (s.z > 1.30) continue;
    float life = 1.0 - s.z / 1.30;
    vec2  pos  = s.xy + vec2(0.012 * sin(s.x * 50.0 + uTime * 1.5), -0.05 * s.z);  // drift + fall
    float r    = length((scr - pos) * sa);
    float flake = smoothstep(0.013, 0.0, r);
    float tw    = 0.7 + 0.3 * sin(uTime * 4.0 + float(i) * 1.7);
    col = mix(col, vec3(0.92, 0.97, 1.0), flake * life * tw * 0.5);
  }
}

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  res    = uResolution / PIXEL;
  float aspect = res.x / res.y;

  /* screen -> complex plane */
  vec2 scr = block / res - 0.5;
  scr.x *= aspect;
  vec2 pan = vec2(uCameraPos.x, -uCameraPos.z) * 0.6;
  vec2 z   = scr * (1.7 * uZoom) + pan;

  /* animated Julia constant, morphed by the mouse */
  float a  = 0.6 + uTime * 0.045 + (uMouse.x - 0.5) * 0.4;
  vec2  jc = 0.7885 * vec2(cos(a), sin(a));

  float iter = 0.0, esc = 0.0;
  for (int i = 0; i < MAXI; i++)
  {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + jc;
    if (dot(z, z) > 16.0) { esc = 1.0; break; }
    iter += 1.0;
  }

  vec3 col;
  if (esc > 0.5)
  {
    float sn = iter - log2(log2(dot(z, z))) + 4.0;     // smooth iteration count
    float t  = clamp(sn / float(MAXI), 0.0, 1.0);
    col = icePalette(pow(t, 0.55));

    col *= 0.82 + 0.32 * detail(z * 6.0);              // crystalline grain
    col += vec3(0.16, 0.34, 0.55) * smoothstep(0.50, 0.95, t) * 0.22;  // soft boundary glow (visibility)
    col += vec3(0.20, 0.35, 0.60) * smoothstep(0.6, 1.0, abs(sin(sn * 0.7))) * 0.14;  // dark-blue contour

    float frost = smoothstep(0.6, 1.0, t);
    float spk   = step(0.94, hash21(floor(z * 40.0) + floor(uTime * 3.0)));
    col += vec3(0.40, 0.55, 0.85) * spk * frost * 0.30;   // dim blue sparkles
  }
  else
  {
    /* light-gray set body so it stays visible against the dark-blue field
       (the inverse of the day variant's dark blob on a light field) */
    col = vec3(0.84, 0.88, 0.94);
    col *= 0.90 + 0.12 * detail(z * 5.0);              // subtle texture
    col -= vec3(0.06, 0.05, 0.0) * (0.5 + 0.5 * sin(uTime * 0.5)) * 0.4;  // faint cool breathing
  }

  cursorTrail(col, block / res, aspect);

  col = posterize(col, block);
  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159);
  FragColor = vec4(col, 1.0);
}
