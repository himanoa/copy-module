import { expect, describe, it  } from "vitest";
import { DependencyLeaf } from "./dependency-leaf";
import { makeIter } from "./dependency-tree";

describe("makeIter", () => {
  it("should be able to visit all dependency", () => {
    const leaf: DependencyLeaf[] = new Array(3).fill(
    {
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
    )

    expect(Array.from(makeIter([leaf])).map(s => s.filePath)).toMatchInlineSnapshot(`
      [
        "xxx3",
        "xxx2",
        "xxx1",
        "yyy3",
        "yyy2",
        "yyy1",
        "xxx",
        "xxx3",
        "xxx2",
        "xxx1",
        "yyy3",
        "yyy2",
        "yyy1",
        "xxx",
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
