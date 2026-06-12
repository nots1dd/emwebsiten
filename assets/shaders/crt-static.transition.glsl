// CRT-static transition — color TV "channel switch" between scenes.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

/* ---------- hash / noise ---------- */
float hash(vec2 p)
{
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p)
{
  vec2  i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1, 0));
  float c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  vec2  u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

/* ---------- CRT pieces ---------- */
vec2 curveUV(vec2 uv)
{
  uv          = uv * 2.0 - 1.0;
  vec2 offset = uv.yx * uv.yx * uv * 0.10;
  uv += offset;
  return uv * 0.5 + 0.5;
}
float scanlines(vec2 uv)
{
  float line = mod(uv.y * resolution.y, 3.0);
  return 1.0 - smoothstep(1.6, 2.4, line) * 0.5;
}
/* RGB aperture grille: each device-pixel column favors one phosphor */
vec3 apertureMask(float fragx)
{
  float c = mod(fragx, 3.0);
  vec3  m = c < 1.0 ? vec3(1.0, 0.35, 0.35) : (c < 2.0 ? vec3(0.35, 1.0, 0.35) : vec3(0.35, 0.35, 1.0));
  return mix(vec3(1.0), m, 0.55);
}
float vignette(vec2 uv)
{
  uv = uv * 2.0 - 1.0;
  return pow(1.0 - dot(uv * vec2(0.9, 1.0), uv * vec2(0.9, 1.0)) * 0.5, 1.3);
}
float glitchBand(vec2 uv, float t)
{
  float band = step(0.90, hash(vec2(floor(uv.y * 9.0), floor(t * 5.0))));
  float y    = fract(uv.y * 9.0 + t * 3.7);
  return band * smoothstep(0.0, 0.1, y) * smoothstep(0.2, 0.1, y);
}
float rollingBar(vec2 uv, float t)
{
  float d = abs(uv.y - fract(t * 0.5));
  return smoothstep(0.05, 0.012, d);
}

void main()
{
  vec2  uv = gl_FragCoord.xy / resolution;
  float t  = clamp(progress, 0.0, 1.0);

  vec2  cUV      = curveUV(uv);
  float inScreen = step(0.0, cUV.x) * step(cUV.x, 1.0) * step(0.0, cUV.y) * step(cUV.y, 1.0);

  /* signal phases: ramp into static, hold, then lock onto sceneB */
  float staticAmt = smoothstep(0.0, 0.18, t) * (1.0 - smoothstep(0.80, 1.0, t));
  float blendAmt  = smoothstep(0.55, 1.0, t);

  /* horizontal tearing + per-band glitch shift */
  float gBand  = glitchBand(cUV, t);
  float drift  = sin(cUV.y * 50.0 + t * 22.0) * 0.004 * staticAmt;
  float gShift = (hash(vec2(t * 13.7, cUV.y * 5.0)) - 0.5) * 0.05 * gBand;
  vec2  sUV    = clamp(cUV + vec2(drift + gShift, 0.0), 0.001, 0.999);

  /* chromatic aberration / channel desync (grows with static) */
  float ca = (0.002 + 0.012 * staticAmt) + 0.02 * gBand;

  vec3 colA, colB;
  colA.r = texture(sceneA, clamp(sUV + vec2(ca, 0.0), 0.001, 0.999)).r;
  colA.g = texture(sceneA, sUV).g;
  colA.b = texture(sceneA, clamp(sUV - vec2(ca, 0.0), 0.001, 0.999)).b;
  colB.r = texture(sceneB, clamp(sUV + vec2(ca, 0.0), 0.001, 0.999)).r;
  colB.g = texture(sceneB, sUV).g;
  colB.b = texture(sceneB, clamp(sUV - vec2(ca, 0.0), 0.001, 0.999)).b;

  vec3 col = mix(colA, colB, blendAmt);

  /* colored static snow */
  vec3 snow = vec3(noise(cUV * resolution * 0.5 + t * 90.0),
                   noise(cUV * resolution * 0.5 + t * 90.0 + 11.0),
                   noise(cUV * resolution * 0.5 + t * 90.0 + 23.0));
  col = mix(col, snow, staticAmt * 0.7);

  /* brief desaturated "channel switch" flash at mid transition */
  float flash = smoothstep(0.42, 0.5, t) * smoothstep(0.58, 0.5, t);
  col = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))) + 0.2, flash);

  /* phosphor bloom on highlights */
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += smoothstep(0.6, 1.0, lum) * 0.2;

  /* CRT glass */
  col *= apertureMask(gl_FragCoord.x);
  col *= scanlines(cUV);
  col *= vignette(cUV);
  col -= rollingBar(cUV, t) * staticAmt * 0.4;

  /* warm phosphor tint + gentle contrast */
  col *= vec3(1.02, 1.0, 0.95);
  col = clamp((col - 0.5) * 1.12 + 0.5, 0.0, 1.0);

  FragColor = vec4(col * inScreen, 1.0);
}
