import { DependencyLeaf, makeIter as makeLeafIter } from "./dependency-leaf";

export type DependencyTree = DependencyLeaf[][]

export function *makeIter(tree: DependencyTree): Generator<DependencyLeaf> {
  for(const leaf of tree) {
    yield *makeLeafIter(leaf)
  }
}

