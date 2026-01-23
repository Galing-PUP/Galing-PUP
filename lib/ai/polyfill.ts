/**
 * Polyfills for pdfjs-dist in server environment (Node.js/Bun)
 * These are required for text extraction to work in production
 */

// Suppress canvas warnings since we're only extracting text
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  const originalWarn = console.warn
  console.warn = function (...args: any[]) {
    if (
      args[0]?.includes?.('Cannot load') ||
      args[0]?.includes?.('Cannot polyfill')
    ) {
      return // Suppress pdfjs canvas warnings in production
    }
    originalWarn.apply(console, args)
  }
}

// Polyfill DOMMatrix
if (typeof global.DOMMatrix === 'undefined') {
  // @ts-ignore
  global.DOMMatrix = class DOMMatrix {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0

    constructor(init?: string | number[]) {
      if (Array.isArray(init)) {
        ;[this.a, this.b, this.c, this.d, this.e, this.f] = init
      }
    }

    toString() {
      return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`
    }

    multiply(other: any) {
      const a = this.a * other.a + this.c * other.b + 0 // + 0 for the z component
      const b = this.b * other.a + this.d * other.b + 0 // + 0 for the z component
      const c = this.a * other.c + this.c * other.d + 0 // + 0 for the z component
      const d = this.b * other.c + this.d * other.d + 0 // + 0 for the z component
      const e = this.a * other.e + this.c * other.f + this.e // + 0 for the z component
      const f = this.b * other.e + this.d * other.f + this.f // + 0 for the z component

      return new (global as any).DOMMatrix([a, b, c, d, e, f])
    }

    translate(x = 0, y = 0) {
      return this.multiply(new (global as any).DOMMatrix([1, 0, 0, 1, x, y]))
    }

    scale(x = 1, y = x) {
      return this.multiply(new (global as any).DOMMatrix([x, 0, 0, y, 0, 0]))
    }

    rotate(angle = 0) {
      const rad = (angle * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      return this.multiply(
        new (global as any).DOMMatrix([cos, sin, -sin, cos, 0, 0]),
      )
    }

    inverse() {
      const det = this.a * this.d - this.b * this.c
      if (det === 0) throw new Error('Matrix is not invertible')
      return new (global as any).DOMMatrix([
        this.d / det,
        -this.b / det,
        -this.c / det,
        this.a / det,
        (this.c * this.f - this.d * this.e) / det,
        (this.b * this.e - this.a * this.f) / det,
      ])
    }
  }
}

// Polyfill ImageData
if (typeof global.ImageData === 'undefined') {
  // @ts-ignore
  global.ImageData = class ImageData {
    data: Uint8ClampedArray
    width: number
    height: number

    constructor(
      data: Uint8ClampedArray | number,
      width: number,
      height?: number,
    ) {
      if (typeof data === 'number') {
        // ImageData(width, height) constructor
        this.width = width
        this.height = height || width
        this.data = new Uint8ClampedArray(this.width * this.height * 4)
      } else {
        // ImageData(data, width, height?) constructor
        this.data = data
        this.width = width
        this.height = height || data.length / (width * 4)
      }
    }
  }
}

// Polyfill Path2D
if (typeof global.Path2D === 'undefined') {
  // @ts-ignore
  global.Path2D = class Path2D {
    constructor() {
      // Minimal implementation for pdfjs to use
    }

    moveTo() {
      return this
    }
    lineTo() {
      return this
    }
    bezierCurveTo() {
      return this
    }
    quadraticCurveTo() {
      return this
    }
    arc() {
      return this
    }
    arcTo() {
      return this
    }
    closePath() {
      return this
    }
    rect() {
      return this
    }
    fill() {
      return this
    }
    stroke() {
      return this
    }
    fillRect() {
      return this
    }
    strokeRect() {
      return this
    }
    clearRect() {
      return this
    }
  }
}

// Polyfill CanvasGradient
if (typeof global.CanvasGradient === 'undefined') {
  // @ts-ignore
  global.CanvasGradient = class CanvasGradient {
    addColorStop() {
      return this
    }
  }
}

// Polyfill CanvasPattern
if (typeof global.CanvasPattern === 'undefined') {
  // @ts-ignore
  global.CanvasPattern = class CanvasPattern {}
}
