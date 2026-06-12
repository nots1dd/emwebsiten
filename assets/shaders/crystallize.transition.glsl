// Crystallize transition — frost freezes the screen over, then thaws to sceneB.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

const float PIXEL = 3.0;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
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

void main()
{
  vec2  block  = floor(gl_FragCoord.xy / PIXEL);
  vec2  uv     = block * PIXEL / resolution;
  float aspect = resolution.x / resolution.y;
  vec2  q      = uv * vec2(aspect, 1.0);

  float t = smoothstep(0.0, 1.0, clamp(progress, 0.0, 1.0));

  /* dendritic frost field */
  float warp    = fbm(q * 3.0 + progress * 0.2);
  float crystal = fbm(q * 5.5 + warp * 1.8);

  /* freeze from the edges inward */
  float edge  = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float field = crystal * 0.6 + edge * 0.9;

  float tri  = (t < 0.5) ? t * 2.0 : 2.0 - t * 2.0;
  float th   = tri * 1.25;
  float dith = (bayer4(block) - 0.5) * 0.10;
  float cover = smoothstep(field - 0.10, field + 0.10, th + dith);

  /* frost: pale blue -> white crystal + sparkles */
  vec3  frost = mix(vec3(0.55, 0.78, 1.0), vec3(0.95, 0.99, 1.0), crystal);
  float spk = step(0.96, hash(floor(q * 60.0) + floor(progress * 8.0)));
  frost += vec3(1.0) * spk * 0.6;

  /* scene flips underneath while frosted */
  vec3 scene = (progress < 0.5) ? texture(sceneA, uv).rgb : texture(sceneB, uv).rgb;

  vec3 col = mix(scene, frost, cover);
  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159265);
  FragColor = vec4(col, 1.0);
}
