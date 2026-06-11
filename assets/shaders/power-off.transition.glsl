// black-hole transition — CRT power-off / power-on.
// sceneA collapses vertically into a bright horizontal line (then a dot); then
// sceneB powers back out of the line. Classic retro TV switch.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

const float PIXEL = 3.0;

void main()
{
  float t = clamp(progress, 0.0, 1.0);

  vec2 uv = floor(gl_FragCoord.xy / PIXEL) * PIXEL / resolution;
  vec2 c  = uv - 0.5;

  bool  second = t >= 0.5;
  float ph     = second ? (t - 0.5) * 2.0 : 1.0 - t * 2.0; // openness: 1->0 then 0->1
  float s      = max(ph, 0.001);                           // vertical scale
  float hs     = max(smoothstep(0.0, 0.25, ph), 0.001);    // horizontal pinch near close

  vec3 col = vec3(0.0);

  bool inside = abs(c.y) <= 0.5 * s && abs(c.x) <= 0.5 * hs;
  if (inside)
  {
    vec2 q = clamp(vec2(c.x / hs, c.y / s) + 0.5, 0.001, 0.999);
    col = second ? texture(sceneB, q).rgb : texture(sceneA, q).rgb;
  }

  /* bright pinch flash: a glowing line, then a hot dot at full collapse */
  float closed = 1.0 - ph;
  col += vec3(0.8, 0.95, 1.0) * smoothstep(0.5 * s + 0.03, 0.5 * s, abs(c.y)) * pow(closed, 1.5);
  col += vec3(1.0) * smoothstep(0.04, 0.0, length(c)) * pow(closed, 6.0);

  /* scanlines */
  col *= 0.85 + 0.15 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
