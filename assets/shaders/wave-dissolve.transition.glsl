// ocean transition — pixel wave dissolve.
// A sine wavefront (with Bayer dither) sweeps the screen revealing sceneB, with
// a bright crest highlight riding the wave. Pixelated + scanlines.

precision         highp float;
uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;
out vec4          FragColor;

const float PIXEL = 3.0;

float bayer4(vec2 p)
{
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  int i = x + y * 4;
  float m[16];
  m[0]=0.0;  m[1]=8.0;  m[2]=2.0;  m[3]=10.0;
  m[4]=12.0; m[5]=4.0;  m[6]=14.0; m[7]=6.0;
  m[8]=3.0;  m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
  return (m[i] + 0.5) / 16.0;
}

void main()
{
  float t = clamp(progress, 0.0, 1.0);

  vec2 block = floor(gl_FragCoord.xy / PIXEL);
  vec2 uv    = block * PIXEL / resolution;

  /* wavefront sweeps bottom -> top; crest is displaced by stacked sines */
  float wave  = sin(uv.x * 12.0 + t * 6.0) * 0.5 + sin(uv.x * 27.0 - t * 4.0) * 0.25;
  float front = t * 1.3;
  float thr   = uv.y - wave * 0.06 + (bayer4(block) - 0.5) * 0.08;
  float reveal = step(thr, front);

  /* horizontal ripple on the not-yet-revealed side */
  float ripple = sin(uv.y * 26.0 + t * 5.0) * 0.012 * (1.0 - reveal);
  vec2  sUV    = clamp(uv + vec2(ripple, 0.0), 0.001, 0.999);

  vec3 colA = texture(sceneA, sUV).rgb;
  vec3 colB = texture(sceneB, sUV).rgb;
  vec3 col  = mix(colA, colB, reveal);

  /* bright foamy crest riding the wavefront */
  float crest = smoothstep(0.05, 0.0, abs(front - thr));
  col += vec3(0.4, 0.75, 1.0) * crest;

  col *= 0.85 + 0.15 * sin(gl_FragCoord.y * 3.14159);

  FragColor = vec4(col, 1.0);
}
