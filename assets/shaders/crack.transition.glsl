precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

/* ---------------------------
   hash / noise
--------------------------- */
float hash(vec2 p)
{
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p)
{
  vec2  i = floor(p);
  vec2  f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2  u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p)
{
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++)
  {
    v += amp * noise(p);
    p *= 2.1;
    amp *= 0.5;
  }
  return v;
}

/* ---------------------------
   luminance
--------------------------- */
float luminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

/* ---------------------------
   CRT scanlines — hard, doubled, phosphor-gap style
--------------------------- */
float scanlines(vec2 uv)
{
  /* each "line" = 3px bright + 1px dark gap */
  float line = mod(uv.y * resolution.y, 4.0);
  float dark = smoothstep(2.8, 3.2, line); /* dark gap on every 4th row */
  return 1.0 - dark * 0.45;                /* 45% brightness loss on gap row */
}

/* ---------------------------
   phosphor RGB mask (slot mask)
--------------------------- */
float phosphorMask(vec2 uv)
{
  float col = mod(uv.x * resolution.x, 3.0);
  /* dim the sub-pixel channels that aren't "active" */
  return 0.85 + 0.15 * step(col, 1.0);
}

/* ---------------------------
   screen curvature (barrel distortion)
--------------------------- */
vec2 curveUV(vec2 uv)
{
  uv          = uv * 2.0 - 1.0;
  vec2 offset = uv.yx * uv.yx * uv * 0.08;
  uv += offset;
  return uv * 0.5 + 0.5;
}

/* ---------------------------
   vignette — tighter, more dramatic
--------------------------- */
float vignette(vec2 uv)
{
  uv = uv * 2.0 - 1.0;
  return pow(1.0 - dot(uv * vec2(0.9, 1.0), uv * vec2(0.9, 1.0)) * 0.55, 1.4);
}

/* ---------------------------
   horizontal glitch bands
--------------------------- */
float glitchBand(vec2 uv, float t)
{
  float y    = fract(uv.y * 8.0 + t * 3.7);
  float band = step(0.92, hash(vec2(floor(uv.y * 8.0), floor(t * 4.0))));
  return band * smoothstep(0.0, 0.1, y) * smoothstep(0.2, 0.1, y);
}

/* ---------------------------
   rolling bar (VHS-style dark band)
--------------------------- */
float rollingBar(vec2 uv, float t)
{
  float barY  = fract(t * 0.4);
  float width = 0.04;
  float d     = abs(uv.y - barY);
  return smoothstep(width, width * 0.3, d) * 0.5;
}

/* ---------------------------
   edge burn / corner glow
--------------------------- */
float edgeBurn(vec2 uv)
{
  float e = 0.0;
  e += smoothstep(0.08, 0.0, uv.x);
  e += smoothstep(0.92, 1.0, uv.x);
  e += smoothstep(0.06, 0.0, uv.y);
  e += smoothstep(0.94, 1.0, uv.y);
  return clamp(e, 0.0, 1.0);
}

/* ---------------------------
   main
--------------------------- */
void main()
{
  vec2  uv = gl_FragCoord.xy / resolution;
  float t  = clamp(progress, 0.0, 1.0);

  /* ---------------------------
     BARREL DISTORTION
  --------------------------- */
  vec2 cUV = curveUV(uv);
  /* kill pixels outside curved screen */
  float inScreen = step(0.0, cUV.x) * step(cUV.x, 1.0) * step(0.0, cUV.y) * step(cUV.y, 1.0);

  /* ---------------------------
     TRANSITION PHASES
       0.0–0.15  fade to static
       0.15–0.85 full static with glitch
       0.85–1.0  static clears to sceneB
  --------------------------- */
  float fadeIn    = smoothstep(0.0, 0.18, t);
  float fadeOut   = 1.0 - smoothstep(0.80, 1.0, t);
  float staticAmt = fadeIn * fadeOut;
  float blendAmt  = smoothstep(0.82, 1.0, t);

  /* ---------------------------
     HORIZONTAL DRIFT + GLITCH OFFSET
  --------------------------- */
  float drift = sin(cUV.y * 60.0 + t * 25.0) * 0.003 * staticAmt;
  /* stronger random glitch bands */
  float gBand  = glitchBand(cUV, t);
  float gShift = (hash(vec2(t * 13.7, cUV.y * 5.0)) - 0.5) * 0.025 * gBand * staticAmt;
  vec2  sUV    = cUV + vec2(drift + gShift, 0.0);
  sUV          = clamp(sUV, 0.001, 0.999);

  /* ---------------------------
     SCENE SAMPLING
  --------------------------- */
  vec3 colA = texture(sceneA, sUV).rgb;
  vec3 colB = texture(sceneB, sUV).rgb;

  /* chromatic aberration on sceneA during transition */
  float aberr = staticAmt * 0.008;
  float rA    = texture(sceneA, sUV + vec2(aberr, 0.0)).r;
  float bA    = texture(sceneA, sUV - vec2(aberr, 0.0)).b;
  colA        = vec3(rA, colA.g, bA);

  float gA = luminance(colA);
  float gB = luminance(colB);

  /* ---------------------------
     STATIC NOISE — layered
  --------------------------- */
  float n1 = noise(cUV * resolution * 0.4 + t * 80.0);
  float n2 = noise(cUV * resolution * 0.1 + t * 30.0 + 7.3);
  float n3 = fbm(cUV * 6.0 + t * 4.0);
  /* combine: fine grain + coarse blobs + structure */
  float rawNoise    = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
  float staticNoise = (rawNoise - 0.5) * 1.6 * staticAmt; /* strong static */

  /* ---------------------------
     ROLLING BAR (VHS)
  --------------------------- */
  float bar = rollingBar(cUV, t) * staticAmt;

  /* ---------------------------
     SCENE BLEND
  --------------------------- */
  float gray = mix(gA, gB, blendAmt);
  /* during static: push toward noise */
  gray = mix(gray, rawNoise, staticAmt * 0.75);
  gray += staticNoise * (1.0 - blendAmt) * 0.4;
  gray -= bar;

  /* ---------------------------
     PHOSPHOR BLOOM
     bright areas bleed outward on CRT phosphor
  --------------------------- */
  float bloom = smoothstep(0.55, 1.0, gray);
  gray += bloom * 0.18;

  /* ---------------------------
     CRT EFFECTS
  --------------------------- */
  /* scanlines — applied twice for extra punch */
  float sl = scanlines(cUV);
  gray *= sl * sl;

  /* phosphor slot mask */
  gray *= phosphorMask(cUV);

  /* vignette */
  gray *= vignette(cUV);

  /* edge burn — bright halo at screen boundary */
  float burn = edgeBurn(cUV);
  gray       = mix(gray, 0.85, burn * 0.4);

  /* ---------------------------
     CONTRAST + GAMMA
  --------------------------- */
  gray = (gray - 0.5) * 1.15 + 0.5; /* contrast boost */
  gray = clamp(gray, 0.0, 1.0);
  gray = pow(gray, 0.9); /* slight gamma lift — phosphor warmth */

  /* ---------------------------
     SCREEN EDGE MASK
  --------------------------- */
  gray *= inScreen;

  /* very slight warm tint on phosphor whites */
  vec3 phosphorTint = vec3(gray * 1.0, gray * 0.97, gray * 0.91);

  FragColor = vec4(phosphorTint, 1.0);
}
