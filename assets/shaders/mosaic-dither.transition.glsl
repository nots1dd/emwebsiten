// Pixel mosaic-dither transition (used for the blog theme toggle).
// Blocks flip from sceneA -> sceneB in Bayer-ordered + hashed order; the block
// size pulses chunky through the middle and flipping cells flash a pixel tint.

precision highp float;

uniform sampler2D sceneA;
uniform sampler2D sceneB;

uniform float progress;
uniform vec2  resolution;

out vec4 FragColor;

/* 4x4 Bayer threshold matrix, normalized to (0,1) */
float bayer4(vec2 p)
{
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = x + y * 4;

  float m[16];
  m[0] = 0.0;  m[1] = 8.0;  m[2] = 2.0;  m[3] = 10.0;
  m[4] = 12.0; m[5] = 4.0;  m[6] = 14.0; m[7] = 6.0;
  m[8] = 3.0;  m[9] = 11.0; m[10] = 1.0; m[11] = 9.0;
  m[12] = 15.0; m[13] = 7.0; m[14] = 13.0; m[15] = 5.0;

  return (m[i] + 0.5) / 16.0;
}

float hash(vec2 p)
{
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main()
{
  float t = clamp(progress, 0.0, 1.0);

  // Mosaic block size pulses: chunky in the middle of the transition.
  float pulse = sin(t * 3.14159265);          // 0 -> 1 -> 0
  float px    = mix(4.0, 26.0, pulse);        // device px per block

  vec2 block   = floor(gl_FragCoord.xy / px);
  vec2 blockUv = (block * px + px * 0.5) / resolution;

  // Per-block reveal threshold: ordered dither jittered with a hash.
  float threshold = mix(bayer4(block), hash(block), 0.5);

  // Soft band so cells cross over instead of hard-popping.
  float reveal = smoothstep(threshold - 0.08, threshold + 0.08, t);

  vec3 colA = texture(sceneA, blockUv).rgb;
  vec3 colB = texture(sceneB, blockUv).rgb;
  vec3 color = mix(colA, colB, reveal);

  // Cells flipping right now glow with a pixel tint.
  float edge = (1.0 - abs(reveal - 0.5) * 2.0)   // peaks while a cell crosses
             * step(0.0001, reveal) * step(reveal, 0.9999);
  vec3 flash = vec3(0.55, 0.9, 1.0);             // cyan-ish spark
  color += flash * edge * 0.3 * pulse;

  // Keep the scanline/CRT vibe consistent with the pixel scene.
  color *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159265);

  FragColor = vec4(color, 1.0);
}
