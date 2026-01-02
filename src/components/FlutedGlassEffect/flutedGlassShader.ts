import { Effect } from 'postprocessing'
import { Uniform, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three'

const fragmentShader = /* glsl */ `
precision highp float;

uniform float distortion;
uniform vec2 resolution;
uniform float time;
uniform vec3 lightPosition;
uniform float fill;

// Hash function for pseudo-random values
vec2 hash2(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

// Voronoi-based bubble distortion
vec2 bubbleDistortion(vec2 uv, float scale, float intensity) {
  vec2 id = floor(uv * scale);
  vec2 gv = fract(uv * scale) - 0.5;

  vec2 displacement = vec2(0.0);
  float minDist = 1.0;

  // Check neighboring cells for closest bubble center
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 cellId = id + offset;
      vec2 cellPos = hash2(cellId) - 0.5 + offset;

      float dist = length(gv - cellPos);

      if (dist < minDist) {
        minDist = dist;
        // Create spherical refraction effect
        vec2 dir = normalize(gv - cellPos);
        float refraction = 1.0 - smoothstep(0.0, 0.5, dist);
        displacement = dir * refraction * intensity;
      }
    }
  }

  return displacement;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Skip processing if distortion is zero
  if (distortion < 0.001) {
    outputColor = inputColor;
    return;
  }

  // Multi-scale bubble distortion for visual richness
  vec2 bubble1 = bubbleDistortion(uv + time * 0.01, 8.0, distortion * 0.08);
  vec2 bubble2 = bubbleDistortion(uv * 1.5 - time * 0.005, 12.0, distortion * 0.05);
  vec2 bubble3 = bubbleDistortion(uv * 0.7 + time * 0.008, 5.0, distortion * 0.1);

  vec2 totalDisplacement = bubble1 + bubble2 + bubble3;

  // Apply distortion to UV coordinates
  vec2 distortedUV = uv + totalDisplacement;

  // Clamp UV to prevent sampling outside bounds (fixes black border)
  vec2 clampedUV = clamp(distortedUV, 0.001, 0.999);

  // Chromatic aberration for glass realism
  float aberration = distortion * 0.015;

  // Clamp all sample coordinates to prevent black edges
  vec2 uvR = clamp(clampedUV + vec2(aberration, 0.0), 0.001, 0.999);
  vec2 uvB = clamp(clampedUV - vec2(aberration, 0.0), 0.001, 0.999);

  vec4 colorR = texture2D(inputBuffer, uvR);
  vec4 colorG = texture2D(inputBuffer, clampedUV);
  vec4 colorB = texture2D(inputBuffer, uvB);

  vec4 color = vec4(colorR.r, colorG.g, colorB.b, 1.0);

  // Calculate normal from displacement for lighting
  vec3 normal = normalize(vec3(totalDisplacement * 2.0, 1.0));

  // Lighting calculation with lightPosition uniform
  vec3 lightDir = normalize(lightPosition);
  float diffuse = max(dot(normal, lightDir), 0.0);
  float specular = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);

  // Apply lighting
  float ambient = 0.7;
  color.rgb *= (ambient + diffuse * 0.3);
  color.rgb += specular * distortion * 0.1;

  // Very subtle frosting effect at higher distortion
  if (distortion > 0.5) {
    float frost = (distortion - 0.5) * 0.1;
    color.rgb = mix(color.rgb, vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114))), frost * 0.3);
  }

  // Apply fill - only distort within fill area (0.0 = no effect, 1.0 = full effect)
  outputColor = mix(inputColor, color, fill);
}
`

export class BubblesGlassEffect extends Effect {
  constructor() {
    super('BubblesGlassEffect', fragmentShader, {
      uniforms: new Map<string, Uniform<number | Vector2 | Vector3>>([
        ['distortion', new Uniform(0.0)],
        ['resolution', new Uniform(new Vector2(1, 1))],
        ['time', new Uniform(0.0)],
        ['lightPosition', new Uniform(new Vector3(1.0, 0.0, 1.0))],
        ['fill', new Uniform(1.0)],
      ]),
    })
  }

  update(
    _renderer: WebGLRenderer,
    _inputBuffer: WebGLRenderTarget,
    deltaTime: number
  ) {
    const timeUniform = this.uniforms.get('time')
    if (timeUniform) {
      (timeUniform.value as number) += deltaTime
    }
  }

  set distortionValue(value: number) {
    const uniform = this.uniforms.get('distortion')
    if (uniform) {
      uniform.value = value
    }
  }

  get distortionValue(): number {
    const uniform = this.uniforms.get('distortion')
    return uniform ? (uniform.value as number) : 0
  }

  setResolution(width: number, height: number) {
    const uniform = this.uniforms.get('resolution')
    if (uniform) {
      (uniform.value as Vector2).set(width, height)
    }
  }

  setLightPosition(x: number, y: number, z: number) {
    const uniform = this.uniforms.get('lightPosition')
    if (uniform) {
      (uniform.value as Vector3).set(x, y, z)
    }
  }

  set fillValue(value: number) {
    const uniform = this.uniforms.get('fill')
    if (uniform) {
      uniform.value = value
    }
  }

  get fillValue(): number {
    const uniform = this.uniforms.get('fill')
    return uniform ? (uniform.value as number) : 1.0
  }
}
