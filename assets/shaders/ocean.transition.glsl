uniform sampler2D sceneA;
uniform sampler2D sceneB;
uniform float     progress;
uniform vec2      resolution;

out vec4 FragColor;

void main()
{
  vec2 uv = gl_FragCoord.xy / resolution;

  vec3 dayCol   = texture(sceneA, uv).rgb;
  vec3 nightCol = texture(sceneB, uv).rgb;

  float t = smoothstep(0.0, 1.0, progress);

  /* subtle wave distortion */
  vec2 distortion = vec2(sin(uv.y * 12.0 + t * 6.0), cos(uv.x * 8.0 + t * 4.0)) * 0.003 * t;

  dayCol   = texture(sceneA, uv + distortion).rgb;
  nightCol = texture(sceneB, uv - distortion).rgb;

  /* cinematic fade */
  vec3 col = mix(dayCol, nightCol, t);

  /* twilight tint */
  vec3 twilight = vec3(1.0, 0.45, 0.2);

  float twilightAmt = sin(t * 3.141592);

  col = mix(col, col + twilight * 0.08, twilightAmt * 0.35);

  FragColor = vec4(col, 1.0);
}
