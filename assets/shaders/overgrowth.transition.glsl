// Overgrowth transition — foliage engulfs sceneA then recedes to reveal sceneB.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

const float PIXEL = 3.0;

float hash(vec2 p)
{
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float vnoise(vec2 p)
{
  vec2  i = floor(p), f = fract(p);
  vec2  u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0));
  float c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p)
{
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
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
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  uv     = block * PIXEL / resolution;
  float aspect = resolution.x / resolution.y;
  vec2  ar     = vec2(aspect, 1.0);

  float t = smoothstep(0.0, 1.0, clamp(progress, 0.0, 1.0));

  /* foliage field, biased to grow from the bottom */
  float fld = fbm(uv * ar * 7.0 + vec2(progress * 0.4, 0.0)) * 0.55 + uv.y * 0.5;

  /* coverage rises (engulf) then falls (recede) */
  float tri  = (t < 0.5) ? t * 2.0 : 2.0 - t * 2.0;
  float th   = tri * 1.25;
  float dith = (bayer4(block) - 0.5) * 0.12;
  float cover = smoothstep(fld - 0.10, fld + 0.10, th + dith);

  /* scene underneath flips while covered */
  vec3 scene = (progress < 0.5) ? texture(sceneA, uv).rgb : texture(sceneB, uv).rgb;

  /* leafy foliage with dappled light + veins */
  float leaf  = fbm(uv * ar * 14.0);
  vec3  fol   = mix(vec3(0.04, 0.22, 0.07), vec3(0.16, 0.45, 0.16), leaf);
  fol += vec3(0.25, 0.45, 0.12) * smoothstep(0.62, 0.92, fbm(uv * ar * 22.0 + 5.0)) * 0.6;
  fol *= 0.8 + 0.2 * leaf;

  vec3 col = mix(scene, fol, cover);

  /* drifting leaves around the growth front */
  float vis = sin(progress * 3.14159265);
  for (int i = 0; i < 10; i++)
  {
    float fi = float(i);
    float lx = fract(hash(vec2(fi, 1.0)) + progress * 0.2 * (0.5 + hash(vec2(fi, 2.0))));
    float ly = fract(hash(vec2(fi, 3.0)) - progress * 0.5);
    vec2  lp = rot(progress * 6.0 + fi) * ((uv - vec2(lx, ly)) * ar);
    float lm = smoothstep(0.016, 0.0, length(lp * vec2(1.0, 2.0)));
    col = mix(col, vec3(0.32, 0.55, 0.16), lm * vis * 0.85);
  }

  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159265);
  FragColor = vec4(col, 1.0);
}
