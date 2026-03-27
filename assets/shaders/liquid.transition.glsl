precision highp float;

uniform sampler2D sceneA;
uniform sampler2D sceneB;

uniform float progress;
uniform vec2  resolution;

out vec4 FragColor;

/* ---------------------------
   smooth noise
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

  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

/* ---------------------------
   main
--------------------------- */
void main()
{
  vec2 uv = gl_FragCoord.xy / resolution;

  float t = clamp(progress, 0.0, 1.0);

  /* ---------------------------
     center-based warp
  --------------------------- */
  vec2 center = vec2(0.5);
  vec2 dir = uv - center;

  float dist = length(dir);

  /* smooth radial influence */
  float ripple = sin(dist * 12.0 - t * 8.0);
  float warp = ripple * (1.0 - t) * 0.04;

  uv += normalize(dir + 1e-5) * warp;

  /* ---------------------------
     flow noise distortion
  --------------------------- */
  float n = noise(uv * 6.0 + t * 2.0);

  uv += (n - 0.5) * 0.05 * (1.0 - t);

  uv = clamp(uv, 0.0, 1.0);

  /* ---------------------------
     sample scenes
  --------------------------- */
  vec3 colA = texture(sceneA, uv).rgb;
  vec3 colB = texture(sceneB, uv).rgb;

  /* ---------------------------
     soft blend curve
  --------------------------- */
  float smoothT = smoothstep(0.0, 1.0, t);

  vec3 color = mix(colA, colB, smoothT);

  /* ---------------------------
     highlight edge glow
  --------------------------- */
  float edge = smoothstep(0.3, 0.7, smoothT);
  float glow = exp(-dist * 6.0) * (1.0 - smoothT);

  color += vec3(0.15, 0.2, 0.35) * glow * edge;

  /* ---------------------------
     subtle vignette
  --------------------------- */
  float vignette = smoothstep(1.2, 0.3, dist);
  color *= vignette;

  FragColor = vec4(color, 1.0);
}
