import ts from "typescript"
import { DependencyLeaf } from "./dependency-leaf"
import { printDependencies } from "./printer"

export const analyseDependency = (sourceFile: ts.SourceFile, filePath: string, program: ts.Program) => {
  const results: DependencyLeaf[][] = []
  results.push(traverseSourceFile(sourceFile, filePath, program))

  for(const result of results) {
    console.log(`${filePath}`)
    printDependencies(result, 1)
  }
}

export const traverseSourceFile = (
  sourceFile:  ts.SourceFile,
  filePath: string,
  program: ts.Program
): DependencyLeaf[] => {
  const results: DependencyLeaf[] = []
  sourceFile.forEachChild((node) => {
    const deps = traverseNode(filePath, program)(node)
    if(deps != null) {
      results.push(deps)
    }
  })

  return results
}

export const traverseNode = (filePath: string, program: ts.Program) => (node: ts.Node): DependencyLeaf | null=> {
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
      return {
        filePath: fileName ?? '',
        deps: traverseSourceFile(sourceFile, fileName, program)
      }
    }
  }

  return null
}

