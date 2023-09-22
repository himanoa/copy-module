import ts from "typescript"
import { DependencyLeaf } from "./dependency-leaf"

export const analyseDependency = (sourceFile: ts.SourceFile, filePath: string, program: ts.Program): {
  deps: DependencyLeaf[][],
  visitedFileCounts: Map<string, number>
} => {
  const deps: DependencyLeaf[][] = []
  const visitedFileCounts = new Map<string, number>()
  deps.push(traverseSourceFile(sourceFile, filePath, program, visitedFileCounts))
  return {
    deps,
    visitedFileCounts
  }
}

export const traverseSourceFile = (
  sourceFile:  ts.SourceFile,
  filePath: string,
  program: ts.Program,
  visitedFileCounts: Map<string, number>
): DependencyLeaf[] => {
  const results: DependencyLeaf[] = []
  visitedFileCounts.set(filePath, (visitedFileCounts.get(filePath) ?? 0) + 1)
  sourceFile.forEachChild((node) => {
    const deps = traverseNode(filePath, program, visitedFileCounts)(node)
    if(deps != null) {
      results.push(deps)
    }
  })

  return results
}

export const traverseNode = (filePath: string, program: ts.Program, visitedFileCounts: Map<string, number>) => (node: ts.Node): DependencyLeaf | null=> {
  switch(node.kind) {
    case ts.SyntaxKind.ImportDeclaration: {
      const importDeclaration = node as ts.ImportDeclaration
      const ms = importDeclaration.moduleSpecifier
      if(ms.kind !== ts.SyntaxKind.StringLiteral) {
        return null
      }
      const modulePath = (ms as ts.StringLiteral).text
      const fileName = ts.resolveModuleName(modulePath, filePath, program.getCompilerOptions(), ts.sys).resolvedModule?.resolvedFileName
      if(fileName == null || fileName.includes('node_modules')) {
        return null
      }
      const sourceFile = program.getSourceFile(fileName)
      if(sourceFile == null) {
        return null
      }
      const visitedCount = visitedFileCounts.get(fileName) ?? 0
      if(visitedCount > 0) {
        visitedFileCounts.set(fileName, visitedCount + 1)
        return {
          filePath: fileName,
          deps: []
        }
      }
      return {
        filePath: fileName ?? '',
        deps: traverseSourceFile(sourceFile, fileName, program, visitedFileCounts)
      }
    }
  }

  return null
}

