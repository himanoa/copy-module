export type DependencyLeaf = {
  filePath: string
  deps: DependencyLeaf[]
}

export function *makeIter(tree: DependencyLeaf[]): Generator<DependencyLeaf> {
  for(const leaf of tree) {
    yield *makeIter(leaf.deps)
    yield leaf
  }
}
