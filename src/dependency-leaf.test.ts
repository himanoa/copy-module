import { DependencyLeaf, makeIter } from "./dependency-leaf";
import { expect, describe, it  } from "vitest";

describe("makeIter", () => {
  it("should be able to visit all dependency", () => {
    const leaf: DependencyLeaf = {
      filePath: 'xxx',
      deps: [
        {
          filePath: 'xxx1',
          deps: [
            {
              filePath: 'xxx2',
              deps: [{
                filePath: 'xxx3',
                deps: []
              }],
            }
          ]
        },
        {
          filePath: 'yyy1',
          deps: [
            {
              filePath: 'yyy2',
              deps: [{
                filePath: 'yyy3',
                deps: []
              }],
            }
          ]
        }
      ]
    }

    expect(Array.from(makeIter([leaf])).map(s => s.filePath)).toMatchInlineSnapshot(`
      [
        "xxx3",
        "xxx2",
        "xxx1",
        "yyy3",
        "yyy2",
        "yyy1",
        "xxx",
      ]
    `)
  })
})
