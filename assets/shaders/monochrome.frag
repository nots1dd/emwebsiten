precision highp float;

uniform float uTime;
uniform float uDelta;

uniform vec2 uResolution;
uniform vec2 uMouse;

uniform int uFrame;

uniform mat4  uProjection;
uniform mat4  uView;
uniform vec3  uCameraPos;
uniform float uZoom;

out vec4 FragColor;

float field(vec2 p)
{
  float t = uTime * 0.25;

  float v = 0.0;

  v += sin(p.x * 1.6 + t * 0.4);
  v += sin(p.y * 1.4 - t * 0.3);
  v += sin(p.x + p.y + t * 0.6);
  v += sin(length(p) * 2.2 - t * 0.8);

  return v;
}

void main()
{
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv *= uZoom;

  vec3 ro = uCameraPos;
  vec3 rd = normalize((uView * vec4(uv, -1.0, 0.0)).xyz);

  float t   = -ro.z / rd.z;
  vec3  hit = ro + rd * t;

  vec2 p = hit.xy;

  /* mouse → world */
  vec2 m = (uMouse / uResolution - 0.5) * 2.0;
  m.x *= uResolution.x / uResolution.y;

  vec2 cursor = m * 3.5;

  float dist = length(p - cursor);

  /* ---------------------------
     STRONGER FIELD INFLUENCE
  --------------------------- */

  float influence = exp(-dist * 1.2); // sharper falloff

  vec2 dir = normalize(p - cursor + 1e-5);

  /* push + pull effect */
  p += dir * influence * 1.2;

  /* ripple wave */
  float ripple = sin(dist * 8.0 - uTime * 3.0) * 0.08;
  p += dir * ripple * influence;

  /* swirl (NEW) */
  float angle = 0.6 * influence;
  mat2  rot   = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  p           = cursor + rot * (p - cursor);

  /* base warp */
  float warp = sin(p.x * 0.8 + uTime * 0.2) * sin(p.y * 0.6 - uTime * 0.15);

  p += warp * 0.15;

  /* field */
  float f = field(p + cursor * 0.3 * influence);

  float bands = sin(f * 2.4 + sin(uTime * 0.2));
  float shade = smoothstep(-0.25, 0.25, bands);

  float vignette = 1.0 - smoothstep(0.55 + sin(uTime * 0.3) * 0.05, 1.45, length(uv));

  float flicker = 0.97 + 0.03 * sin(float(uFrame) * 0.4);

  float col = shade * vignette * flicker;

  /* ---------------------------
     CURSOR VISUALIZATION
  --------------------------- */

  /* core glow */
  float core = exp(-dist * 12.0);

  /* ring */
  float ring = smoothstep(0.15, 0.14, abs(dist - 0.25));

  /* pulsing ring */
  float pulse = sin(uTime * 4.0) * 0.5 + 0.5;
  ring *= mix(0.6, 1.2, pulse);

  /* combine */
  float cursor_vis = core * 0.8 + ring * 0.6;

  /* highlight (bright but tasteful) */
  col += cursor_vis * 0.6;

  FragColor = vec4(vec3(col), 1.0);
}
