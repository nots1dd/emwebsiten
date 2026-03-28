uniform float uTime;
uniform float uDelta;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform int   uFrame;
uniform mat4  uProjection;
uniform mat4  uView;
uniform vec3  uCameraPos;
uniform float uZoom;
out vec4      FragColor;

/* -----------------------------------------------
   HASH / NOISE
----------------------------------------------- */
vec2 hash2(vec2 p)
{
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

/* smooth value noise */
float vnoise(vec2 p)
{
  vec2  i = floor(p);
  vec2  f = fract(p);
  vec2  u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

/* fractal brownian motion — layered noise clouds */
float fbm(vec2 p, int oct)
{
  float v = 0.0, amp = 0.5, freq = 1.0, sum = 0.0;
  for (int i = 0; i < 8; i++)
  {
    if (i >= oct)
      break;
    v += amp * vnoise(p * freq);
    sum += amp;
    amp *= 0.48;
    freq *= 2.1;
    p += vec2(0.3, 0.17); /* offset each octave */
  }
  return v / sum;
}

/* domain-warped fbm — "nebula folding" */
float nebula(vec2 p)
{
  /* first warp pass */
  vec2 q = vec2(fbm(p, 5), fbm(p + vec2(5.2, 1.3), 5));
  /* second warp pass */
  vec2 r = vec2(fbm(p + q * 1.4 + vec2(1.7, 9.2), 5), fbm(p + q * 1.4 + vec2(8.3, 2.8), 5));
  return fbm(p + r * 1.2, 6);
}

/* -----------------------------------------------
   STAR FIELD
----------------------------------------------- */
float stars(vec2 p, float threshold)
{
  float densityScale = 75.0; // slightly lower = bigger stars visually
  vec2  cell         = floor(p * densityScale);
  vec2  local        = fract(p * densityScale) - 0.5;
  float h            = hash(cell);
  if (h < threshold)
    return 0.0;
  float sz    = 0.032 + hash(cell + 13.7) * 0.065;
  float speed = mix(1.0, 3.0, hash(cell + 7.1)); // per-star speed
  float phase = h * 100.0;

  /* layered flicker (less uniform) */
  float flicker =
    0.6 + 0.4 * sin(uTime * speed + phase) * (0.7 + 0.3 * sin(uTime * speed * 0.5 + phase * 1.3));

  /* occasional sparkle boost */
  float sparkle = smoothstep(0.85, 1.0, sin(uTime * speed * 2.0 + phase * 2.0));

  float twinkle = flicker + sparkle * 0.4;
  twinkle       = clamp(twinkle, 0.0, 1.2);
  float rare    = step(0.997, h);
  twinkle += rare * 1.2;
  float d    = length(local);
  float core = smoothstep(sz, sz * 0.3, d);
  core       = pow(core, 1.8);

  return core * twinkle * smoothstep(threshold, 1.0, h);
}

/* -----------------------------------------------
   DUST MOTES (sparse soft blobs)
----------------------------------------------- */
float dustMotes(vec2 p)
{
  float v = 0.0;
  for (int i = 0; i < 6; i++)
  {
    vec2 seed   = vec2(float(i) * 3.7, float(i) * 2.3);
    vec2 center = hash2(seed) * 4.0 - 2.0;
    center += vec2(sin(uTime * 0.07 + seed.x), cos(uTime * 0.05 + seed.y)) * 0.3;
    float d = length(p - center);
    v += exp(-d * d * 1.8) * (0.3 + 0.2 * sin(uTime * 0.2 + float(i)));
  }
  return v;
}

/* -----------------------------------------------
   MAIN
----------------------------------------------- */
void main()
{
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv *= uZoom;

  /* ---------------------------
     CAMERA RAY
  --------------------------- */
  vec3  ro   = uCameraPos;
  vec3  rd   = normalize((uView * vec4(uv, -1.0, 0.0)).xyz);
  float tHit = -ro.z / rd.z;
  vec3  hit  = ro + rd * tHit;
  vec2  p    = hit.xy;

  /* ---------------------------
     SLOW PARALLAX CAMERA DRIFT
  --------------------------- */
  float drift    = uTime * 0.018;
  vec2  camDrift = vec2(sin(drift) * 0.4, cos(drift * 0.7) * 0.3);
  p += camDrift;

  /* ---------------------------
     CURSOR (world space)
  --------------------------- */
  vec2 mouseUV = (uMouse - 0.5) * 2.0;
  mouseUV.x *= uResolution.x / uResolution.y;
  vec3  rdMouse = normalize((uView * vec4(mouseUV, -1.0, 0.0)).xyz);
  float tMouse  = -ro.z / rdMouse.z;
  vec2  cursor  = (ro + rdMouse * tMouse).xy + camDrift;

  float dist = length(p - cursor);
  vec2  dir  = normalize(p - cursor + 1e-5);

  /* ---------------------------
     BLACK HOLE LENSING
  --------------------------- */
  float influence = exp(-dist * 2.5);

  /* strong gravitational pull */
  p -= dir * influence * 0.6;

  /* tighter swirl (frame dragging feel) */
  float lensAngle = influence * 1.2;
  mat2  rot       = mat2(cos(lensAngle), -sin(lensAngle), sin(lensAngle), cos(lensAngle));
  p               = cursor + rot * (p - cursor);

  /* sharper ripple ring */
  p += dir * sin(dist * 18.0 - uTime * 4.0) * 0.035 * influence;

  /* event horizon (dark core) */
  float horizon = smoothstep(0.08, 0.02, dist);

  /* accretion disk glow */
  float ring = exp(-pow(dist - 0.12, 2.0) * 200.0);

  /* ---------------------------
     NEBULA CLOUD
  --------------------------- */
  float rotT    = uTime * 0.012;
  mat2  slowRot = mat2(cos(rotT), -sin(rotT), sin(rotT), cos(rotT));
  vec2  np      = slowRot * p * 0.9;

  float cloud  = nebula(np + vec2(uTime * 0.04, uTime * 0.025));
  float cloud2 = nebula(np * 1.7 + vec2(-uTime * 0.03, uTime * 0.02) + vec2(3.1, 1.7));

  float density = cloud * 0.7 + cloud2 * 0.35;
  density       = pow(density, 1.4); /* deepen cloud contrast */

  /* ---------------------------
     STARS
  --------------------------- */
  vec2  starP      = p * 0.5 + vec2(uTime * 0.004);
  float starField  = stars(starP, 0.92);
  float starField2 = stars(p * 1.3 + vec2(5.7, 2.1), 0.96) * 0.4;

  /* ---------------------------
     DUST MOTES
  --------------------------- */
  float motes = dustMotes(p) * 0.18;

  /* ---------------------------
     GALACTIC CORE GLOW
  --------------------------- */
  float coreDist = length(p - camDrift * 0.2);
  float coreGlow = exp(-coreDist * coreDist * 0.55) * 0.5;

  /* ---------------------------
     VIGNETTE
  --------------------------- */
  float vignette = 1.0 - smoothstep(0.5, 1.4, length(uv));

  /* ---------------------------
     ASSEMBLE
  --------------------------- */
  float col          = density * 0.7 + coreGlow + motes;
  float starCombined = starField + starField2;

  /* mild boost with clamp */
  starCombined *= 1.15;

  /* soft compression instead of clamp */
  starCombined = starCombined / (1.0 + starCombined);

  col += starCombined;

  /* apply black hole effects */
  col *= (1.0 - horizon); // dark center
  col += ring * 0.6;      // bright ring
  col = clamp(col, 0.0, 1.0);
  col *= vignette;
  col *= 0.94 + 0.06 * sin(uTime * 0.4); /* breathing pulse */

  /* invert base */
  float inv = 1.0 - col;

  /* clouds → dark gray */
  float clouds     = density * 0.7;
  float darkClouds = smoothstep(0.2, 0.8, clouds);

  /* stars → dark flicker */
  float darkStars = (starField + starField2) * 0.8;

  /* invert star behavior */
  darkStars = pow(darkStars, 0.6);

  /* base white space */
  vec3 bg = vec3(1.0);

  /* subtract clouds + stars */
  vec3 rgb = bg - vec3(darkClouds * 0.6) - vec3(darkStars * 0.9);

  /* preserve black hole */
  rgb *= (1.0 - horizon);
  rgb -= vec3(ring * 0.4);

  /* vignette (invert style) */
  rgb *= 1.0 - smoothstep(0.6, 1.5, length(uv)) * 0.1;

  /* subtle flicker */
  rgb *= 0.97 + 0.03 * sin(uTime * 0.6);

  rgb = clamp(rgb, 0.0, 1.0);

  FragColor = vec4(rgb, 1.0);
}
