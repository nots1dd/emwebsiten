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

  float star = smoothstep(0.995, 1.0, h);

  return star;
}

/* ---------------------------
   main
--------------------------- */
void main()
{
  vec2  uv = gl_FragCoord.xy / resolution;
  float t  = clamp(progress, 0.0, 1.0);

  vec2 center = vec2(0.5);
  vec2 dir    = uv - center;

  float dist = length(dir);
  vec2  nDir = normalize(dir + 1e-5);

  float strength = smoothstep(0.0, 1.0, t);

  /* ---------------------------
     GRAVITATIONAL LENSING
  --------------------------- */

  float pull = exp(-dist * 4.0) * strength;

  uv -= nDir * pull * 0.4;

  float angle = strength * exp(-dist * 3.0) * 2.5;
  mat2  rot   = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  uv          = center + rot * (uv - center);

  /* turbulence */
  float n = noise(uv * 6.0 + t * 3.0);
  uv += (n - 0.5) * 0.03 * (1.0 - t);

  uv = clamp(uv, 0.0, 1.0);

  /* ---------------------------
     CHROMATIC ABERRATION
  --------------------------- */

  float aberr = exp(-dist * 6.0) * strength * 0.01;

  vec2 offset = nDir * aberr;

  vec3 colA_r = texture(sceneA, uv + offset).rgb;
  vec3 colA_g = texture(sceneA, uv).rgb;
  vec3 colA_b = texture(sceneA, uv - offset).rgb;

  vec3 colA = vec3(colA_r.r, colA_g.g, colA_b.b);

  vec3 colB_r = texture(sceneB, uv + offset).rgb;
  vec3 colB_g = texture(sceneB, uv).rgb;
  vec3 colB_b = texture(sceneB, uv - offset).rgb;

  vec3 colB = vec3(colB_r.r, colB_g.g, colB_b.b);

  float smoothT = smoothstep(0.0, 1.0, t);

  /* smoother final blend */
  smoothT = smoothstep(0.0, 1.0, smoothT);

  vec3 color = mix(colA, colB, smoothT);

  /* ---------------------------
     RELATIVISTIC COLOR SHIFT
  --------------------------- */

  float redshift = exp(-dist * 5.0) * strength;

  vec3 shift = vec3(1.2, 0.9, 0.7); // warm shift
  color      = mix(color, color * shift, redshift * 0.6);

  /* ---------------------------
     BLACK HOLE CORE
  --------------------------- */

  float horizon = smoothstep(0.14, 0.03, dist);
  color *= (1.0 - horizon * strength);

  /* ---------------------------
     ACCRETION DISK
  --------------------------- */

  float ring      = exp(-pow(dist - 0.18, 2.0) * 100.0);
  vec3  diskColor = vec3(0.6, 0.8, 1.2);

  color += diskColor * ring * strength * 0.8;

  /* ---------------------------
     STAR STREAKING
  --------------------------- */

  float s = stars(uv);

  float stretch = exp(-dist * 3.0) * strength;

  float streak = s * stretch;

  color += vec3(streak) * 0.6;

  /* ---------------------------
     MOTION BLUR (toward center)
  --------------------------- */

  vec3 blur = vec3(0.0);

  for (int i = 0; i < 5; i++)
  {
    float f        = float(i) / 5.0;
    vec2  sampleUV = uv + nDir * f * 0.02 * strength;
    blur += texture(sceneB, sampleUV).rgb;
  }

  blur /= 5.0;

  color = mix(color, blur, strength * 0.3);

  /* ---------------------------
     LIGHT BENDING GLOW
  --------------------------- */

  float glow = exp(-dist * 5.0) * strength;
  color += vec3(0.2, 0.3, 0.6) * glow * 0.5;

  /* ---------------------------
     COLOR SPLASH ENDING
  --------------------------- */

  /* when splash starts */
  float splashT = smoothstep(0.75, 1.0, t);

  /* radial expansion */
  float wave = dist - (1.0 - splashT) * 0.6;

  /* sharp expanding front */
  float front = smoothstep(0.02, -0.02, wave);

  /* softer inner fill */
  float fill = smoothstep(0.25, 0.0, wave);

  /* combine mask */
  float splashMask = max(front, fill);

  /* add some breakup (organic look) */
  float breakup = noise(uv * 10.0 + t * 5.0);
  splashMask *= mix(0.8, 1.2, breakup);

  /* sample sceneB slightly warped for energy feel */
  vec2 splashUV  = uv + nDir * 0.05 * splashMask * strength;
  vec3 splashCol = texture(sceneB, splashUV).rgb;

  /* boost brightness slightly */
  splashCol *= 1.2;

  /* mix splash in */
  color = mix(color, splashCol, splashMask);

  /* shockwave ring */
  float shock = exp(-abs(wave) * 40.0);
  color += vec3(0.5, 0.7, 1.0) * shock * splashT * 0.6;

  /* ---------------------------
     vignette
  --------------------------- */

  float vignette = smoothstep(1.2, 0.3, dist);
  color *= vignette;

  FragColor = vec4(color, 1.0);
}
