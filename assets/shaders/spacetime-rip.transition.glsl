// Spacetime-rip transition — sceneA collapses into a singularity, sceneB emerges.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

const float PIXEL = 3.0;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main()
{
  vec2  uv     = floor(gl_FragCoord.xy / PIXEL) * PIXEL / resolution;
  float aspect = resolution.x / resolution.y;
  vec2  p      = (uv - 0.5) * vec2(aspect, 1.0);
  float d      = length(p) + 1e-4;

  float t     = clamp(progress, 0.0, 1.0);
  bool  first = t < 0.5;
  float s     = first ? t * 2.0 : (t - 0.5) * 2.0;

  /* collapse shrinks into the centre; emerge expands back out */
  float scale = first ? max(1.0 - 0.92 * s, 0.06) : max(0.08 + 0.92 * s, 0.06);
  /* swirl strongest near the singularity, unwinds on the way out */
  float sw = (first ? s : -(1.0 - s)) * 3.2 / (d + 0.1);

  vec2 sp  = (rot(sw) * p) / scale;
  vec2 quv = sp / vec2(aspect, 1.0) + 0.5;

  /* radial chromatic rip */
  vec2 rd = normalize(p) * (0.008 + 0.05 * s);

  vec3 col;
  if (first)
  {
    col.r = texture(sceneA, quv + rd).r;
    col.g = texture(sceneA, quv).g;
    col.b = texture(sceneA, quv - rd).b;
  }
  else
  {
    col.r = texture(sceneB, quv + rd).r;
    col.g = texture(sceneB, quv).g;
    col.b = texture(sceneB, quv - rd).b;
  }

  /* darken the throat on collapse */
  col *= 1.0 - (first ? s : 0.0) * smoothstep(0.14, 0.0, d) * 0.85;

  /* singularity flash + ring at the pinch */
  float flash = smoothstep(0.34, 0.5, t) * smoothstep(0.66, 0.5, t);
  col += vec3(1.0, 0.92, 0.82) * flash *
         (exp(-d * 6.0) * 2.2 + exp(-pow((d - 0.05) / 0.02, 2.0)) * 1.2);

  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
