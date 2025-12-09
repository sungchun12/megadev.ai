import { vi } from 'vitest'

// Mock THREE.js core - must be a class for `new` to work
export class Color {
  r = 0
  g = 0
  b = 0
  constructor() {}
  set = vi.fn().mockReturnThis()
  copy = vi.fn().mockReturnThis()
}

export class Vector3 {
  x = 0
  y = 0
  z = 0
  constructor() {}
  set = vi.fn().mockReturnThis()
  copy = vi.fn().mockReturnThis()
  add = vi.fn().mockReturnThis()
  sub = vi.fn().mockReturnThis()
  multiplyScalar = vi.fn().mockReturnThis()
  normalize = vi.fn().mockReturnThis()
}

export class Shape {
  constructor() {}
  moveTo = vi.fn()
  lineTo = vi.fn()
  closePath = vi.fn()
}

export class ExtrudeGeometry {
  constructor() {}
}

export class ShaderMaterial {
  uniforms = {
    time: { value: 0 },
    color: { value: new Color() },
    intensity: { value: 1.0 },
  }
  constructor() {}
}

export const Group = vi.fn()
export const Mesh = vi.fn()
export const Points = vi.fn()

export const DoubleSide = 2
export const AdditiveBlending = 2

export default {
  Color,
  Vector3,
  Shape,
  ExtrudeGeometry,
  ShaderMaterial,
  Group,
  Mesh,
  Points,
  DoubleSide,
  AdditiveBlending,
}

