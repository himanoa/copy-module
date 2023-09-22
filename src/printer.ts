import { DependencyLeaf } from "./dependency-leaf"

let lastPrintedFile: string | null = null

export const printDependencies = (dependencies: DependencyLeaf[], depth: number = 0) => {
  for(const mod of dependencies) {
    if(mod.filePath !== lastPrintedFile) {
      const margin = ' '.repeat(depth * 2)
      console.log(`${margin}|- ${mod.filePath}`)
    }
    printDependencies(mod.deps, depth + 1)
  }
}
