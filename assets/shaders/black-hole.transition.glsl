precision highp float;

uniform sampler2D sceneA;
uniform sampler2D sceneB;

uniform float progress;
uniform vec2  resolution;

out vec4 FragColor;

/* ---------------------------
   hash / noise
--------------------------- */
float hash(vec2 p)
{
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p)
{
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

/* ---------------------------
   star streaks
--------------------------- */
float stars(vec2 p)
{
  vec2  grid = floor(p * 60.0);
  float h    = hash(grid);
  return smoothstep(0.995, 1.0, h);
}

/* ---------------------------
   aspect-corrected distance
   keeps the black hole perfectly circular
--------------------------- */
float circDist(vec2 uv)
{
  vec2 d = uv - vec2(0.5);
  d.x *= resolution.x / resolution.y;
  return length(d);
}

/* ---------------------------
   main
--------------------------- */
void main()
{
  vec2  uv = gl_FragCoord.xy / resolution;
  float t  = clamp(progress, 0.0, 1.0);

  /* smooth ease in / ease out */
  float strength = t * t * (3.0 - 2.0 * t);

  vec2 center = vec2(0.5);
  vec2 dir    = uv - center;

  /* use aspect-corrected distance for all circular effects */
  float dist = circDist(uv);
  vec2  nDir = normalize(dir + 1e-5);

  /* ---------------------------
     GRAVITATIONAL LENSING
  --------------------------- */

  float pull = exp(-dist * 3.5) * strength;
  uv -= nDir * pull * 0.35;

  float angle = strength * exp(-dist * 2.8) * 2.0;
  mat2  rot   = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  uv          = center + rot * (uv - center);

  /* gentle turbulence - fades out as transition completes */
  float n = noise(uv * 5.0 + t * 2.5);
  uv += (n - 0.5) * 0.025 * (1.0 - t) * (1.0 - t);

  uv = clamp(uv, 0.0, 1.0);

  /* recalculate dist after lensing for screen-space effects */
  float distPost = length(uv - center);

  /* ---------------------------
     CHROMATIC ABERRATION
  --------------------------- */

  float aberr  = exp(-dist * 5.5) * strength * 0.009;
  vec2  offset = nDir * aberr;

  vec3 colA_r = texture(sceneA, uv + offset).rgb;
  vec3 colA_g = texture(sceneA, uv).rgb;
  vec3 colA_b = texture(sceneA, uv - offset).rgb;
  vec3 colA   = vec3(colA_r.r, colA_g.g, colA_b.b);

  vec3 colB_r = texture(sceneB, uv + offset).rgb;
  vec3 colB_g = texture(sceneB, uv).rgb;
  vec3 colB_b = texture(sceneB, uv - offset).rgb;
  vec3 colB   = vec3(colB_r.r, colB_g.g, colB_b.b);

  /* double-smooth the blend curve for a silky crossfade */
  float smoothT = strength * strength * (3.0 - 2.0 * strength);
  vec3  color   = mix(colA, colB, smoothT);

  /* ---------------------------
     RELATIVISTIC COLOR SHIFT
  --------------------------- */

  float redshift = exp(-dist * 4.5) * strength * 0.5;
  vec3  shift    = vec3(1.15, 0.92, 0.75);
  color          = mix(color, color * shift, redshift);

  /* ---------------------------
     ACCRETION DISK
     - thin, soft ring; no harsh brightness spikes
     - peak brightness capped and eased in slowly
  --------------------------- */

  float ringRadius = 0.155;
  float ringWidth  = 18.0; /* higher = narrower / softer */
  float ring       = exp(-pow(dist - ringRadius, 2.0) * ringWidth * ringWidth);

  /* wrap disk brightness smoothly — peaks around t=0.55, fades at t=1 */
  float diskEnvelope = smoothstep(0.0, 0.45, t) * (1.0 - smoothstep(0.75, 1.0, t));

  /* cooler, dimmer disk color — no oversaturation */
  vec3 diskColor = vec3(0.35, 0.55, 0.95);
  color += diskColor * ring * diskEnvelope * 0.45;

  /* secondary fainter outer halo for depth */
  float halo = exp(-pow(dist - 0.24, 2.0) * 6.0);
  color += vec3(0.12, 0.18, 0.35) * halo * diskEnvelope * 0.18;

  /* ---------------------------
     STAR STREAKING
  --------------------------- */

  float s       = stars(uv);
  float stretch = exp(-dist * 2.5) * strength;
  color += vec3(s * stretch) * 0.5;

  /* ---------------------------
     MOTION BLUR (toward center)
  --------------------------- */

  vec3 blur = vec3(0.0);
  for (int i = 0; i < 6; i++)
  {
    float f        = float(i) / 6.0;
    vec2  sampleUV = clamp(uv + nDir * f * 0.018 * strength, 0.0, 1.0);
    blur += texture(sceneB, sampleUV).rgb;
  }
  blur /= 6.0;
  color = mix(color, blur, strength * 0.25);

  /* ---------------------------
     LIGHT BENDING GLOW
  --------------------------- */

  float glow = exp(-dist * 4.5) * strength;
  color += vec3(0.1, 0.16, 0.38) * glow * 0.4;

  /* ---------------------------
     BLACK HOLE CORE
     - perfectly circular (uses circDist)
     - smooth cubic falloff, no hard edge
     - darkness rises and holds gracefully
  --------------------------- */

  float holeRadius = 0.055; /* controls apparent size */
  float holeEdge   = 0.085; /* soft penumbra outer edge */

  /* photon sphere brightening ring just outside the event horizon */
  float photonRing = exp(-pow(dist - holeRadius * 1.4, 2.0) * 80.0);
  float photonEnv  = smoothstep(0.1, 0.55, t) * (1.0 - smoothstep(0.85, 1.0, t));
  color += vec3(0.55, 0.65, 0.9) * photonRing * photonEnv * 0.6;

  /* event horizon — smooth step avoids the oval artifact from linear dist */
  float horizon      = 1.0 - smoothstep(holeRadius, holeEdge, dist);
  float horizonDepth = smoothstep(0.2, 0.75, t);
  color *= 1.0 - horizon * horizonDepth;

  /* ---------------------------
     COLOR SPLASH ENDING
  --------------------------- */

  float splashT    = smoothstep(0.72, 1.0, t);
  float wave       = dist - (1.0 - splashT) * 0.6;
  float front      = smoothstep(0.025, -0.025, wave);
  float fill       = smoothstep(0.28, 0.0, wave);
  float splashMask = max(front, fill);

  float breakup = noise(uv * 9.0 + t * 4.5);
  splashMask *= mix(0.85, 1.15, breakup);

  vec2 splashUV  = uv + nDir * 0.04 * splashMask * strength;
  vec3 splashCol = texture(sceneB, clamp(splashUV, 0.0, 1.0)).rgb * 1.1;
  color          = mix(color, splashCol, splashMask);

  float shock = exp(-abs(wave) * 35.0);
  color += vec3(0.35, 0.52, 0.85) * shock * splashT * 0.45;

  /* ---------------------------
     VIGNETTE
  --------------------------- */

  float vignette = smoothstep(1.3, 0.25, dist);
  color *= vignette;

  /* ---------------------------
     FINAL EXPOSURE CLAMP
     prevents any channel from blowing out
  --------------------------- */

  color = color / (color + vec3(0.85)); /* filmic tonemapping */
  color = pow(color, vec3(0.92));       /* gentle gamma lift */

  FragColor = vec4(color, 1.0);
}
