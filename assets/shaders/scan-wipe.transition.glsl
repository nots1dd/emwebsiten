// fade transition — CRT scan-wipe.
// A bright horizontal scan bar sweeps down the screen; sceneB is revealed behind
// it as if a CRT is repainting the picture line by line. Pixelated + scanlines.

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

void main()
{
  float t = clamp(progress, 0.0, 1.0);

  vec2 block = floor(gl_FragCoord.xy / PIXEL) * PIXEL;
  vec2 uv    = block / resolution;

  /* sweep travels slightly more than the screen so it fully clears */
  float sweep = t * 1.15;
  float d     = sweep - uv.y;             // >0 below the bar (already painted)

  /* pixels above the bar still show sceneA, below show sceneB */
  float reveal = step(0.0, d);

  /* small horizontal jitter right at the scan bar (analog wobble) */
  float nearBar = smoothstep(0.06, 0.0, abs(d));
  float jit     = (hash(vec2(block.y, floor(t * 30.0))) - 0.5) * 0.04 * nearBar;
  vec2  sUV     = clamp(uv + vec2(jit, 0.0), 0.001, 0.999);

  vec3 colA = texture(sceneA, sUV).rgb;
  vec3 colB = texture(sceneB, sUV).rgb;
  vec3 col  = mix(colA, colB, reveal);

  /* bright scan bar with a soft trailing glow */
  col += vec3(0.7, 0.95, 1.0) * nearBar;
  col += vec3(0.2, 0.35, 0.4) * smoothstep(0.18, 0.0, abs(d)) * step(0.0, d);

  /* scanlines */
  col *= 0.85 + 0.15 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
