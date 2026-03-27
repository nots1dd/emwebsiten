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

/* ---------------------------
   FIELD (height function)
--------------------------- */
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

/* ---------------------------
   NORMAL from height field
--------------------------- */
vec3 getNormal(vec2 p)
{
  float e = 0.002;

  float h  = field(p);
  float hx = field(p + vec2(e, 0.0));
  float hy = field(p + vec2(0.0, e));

  vec3 n = normalize(vec3(h - hx, h - hy, e));
  return n;
}

void main()
{
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv *= uZoom;

  /* ---------------------------
     CAMERA RAY
  --------------------------- */
  vec3 ro = uCameraPos;
  vec3 rd = normalize((uView * vec4(uv, -1.0, 0.0)).xyz);

  float t   = -ro.z / rd.z;
  vec3  hit = ro + rd * t;

  vec2 p = hit.xy;

  /* ---------------------------
     CURSOR (world space)
  --------------------------- */
  vec2 mouseUV = (uMouse - 0.5) * 2.0;
  mouseUV.x *= uResolution.x / uResolution.y;

  /* build ray from mouse */
  vec3 rdMouse = normalize((uView * vec4(mouseUV, -1.0, 0.0)).xyz);

  /* intersect same plane as scene */
  float tMouse   = -ro.z / rdMouse.z;
  vec3  hitMouse = ro + rdMouse * tMouse;

  vec2 cursor = hitMouse.xy;

  float dist = length(p - cursor);
  vec2  dir  = normalize(p - cursor + 1e-5);

  /* ---------------------------
     FORCE FIELD (cleaner)
  --------------------------- */

  float influence = exp(-dist * 2.5); // tighter

  /* push */
  p += dir * influence * 0.8;

  /* swirl */
  float angle = influence * 0.8;
  mat2  rot   = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  p           = cursor + rot * (p - cursor);

  /* subtle ripple */
  p += dir * sin(dist * 10.0 - uTime * 4.0) * 0.05 * influence;

  /* ---------------------------
     HEIGHT → 3D SURFACE
  --------------------------- */
  float h   = field(p);
  vec3  pos = vec3(p, h * 0.4);

  vec3 normal = getNormal(p);

  /* ---------------------------
     LIGHTING
  --------------------------- */

  vec3 lightPos = vec3(2.0, 2.0, 3.0);
  vec3 lightDir = normalize(lightPos - pos);

  vec3 viewDir = normalize(uCameraPos - pos);

  /* diffuse */
  float diff = max(dot(normal, lightDir), 0.0);

  /* specular */
  vec3  reflectDir = reflect(-lightDir, normal);
  float spec       = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

  /* ambient */
  float ambient = 0.2;

  float lighting = ambient + diff * 0.8 + spec * 0.6;

  /* ---------------------------
     BASE COLOR
  --------------------------- */

  float bands = sin(h * 2.2 + uTime * 0.3);
  float shade = smoothstep(-0.2, 0.2, bands);

  float vignette = 1.0 - smoothstep(0.6, 1.5, length(uv));

  float col = shade * lighting * vignette;

  /* ---------------------------
     FINAL
  --------------------------- */

  FragColor = vec4(vec3(col), 1.0);
}
