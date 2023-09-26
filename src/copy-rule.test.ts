import { describe, it, expect } from 'vitest'
import { isMatchPattern, replaceFilePath } from './copy-rule'

describe('isMatchPattern', () => {
  it('should return true if pattern matches path', () => {
    expect(isMatchPattern('(.+).txt', 'foo.txt')).toBe(true)
  })

  it('should return false unless pattern matches path', () => {
    expect(isMatchPattern('(.+).ts', 'foo.txt')).toBe(false)
  })
})

describe("replaceFilePath", () => {
  it('should replace the match pattern with the destination pattern', () => {
    expect(replaceFilePath('src/(.+).txt', "modules/$1.txt", 'src/foo.txt')).toBe("modules/foo.txt")
  })

  it('should not replace unless matched', () => {
    expect(replaceFilePath('src/(.+).txt', "modules/$1.txt", 'src/foo.ts')).toBe("src/foo.ts")
  })
})
