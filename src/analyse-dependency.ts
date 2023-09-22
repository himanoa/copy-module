import ts from "typescript"
import { DependencyLeaf } from "./dependency-leaf"

export const analyseDependency = (sourceFile: ts.SourceFile, filePath: string, program: ts.Program): DependencyLeaf[][] => {
  const results: DependencyLeaf[][] = []
  results.push(traverseSourceFile(sourceFile, filePath, program))
  return results
}

export const traverseSourceFile = (
  sourceFile:  ts.SourceFile,
  filePath: string,
  program: ts.Program,
  breadclumb: Set<string> | null = null
): DependencyLeaf[] => {
  const results: DependencyLeaf[] = []
  sourceFile.forEachChild((node) => {
    const deps = (() => {
      if(breadclumb == null) {
        return traverseNode(filePath, program, new Set([filePath]))(node)
      }
      return traverseNode(filePath, program, breadclumb)(node)
    })()
    if(deps != null) {
      results.push(deps)
    }
  })

  return results
}

const withBreadclumb = (breadclumb: Set<string>, fileName: string, op: (fileName: string) => DependencyLeaf): DependencyLeaf => {
  try {
    if(breadclumb.has(fileName)) {
      throw new Error(`Circular dependency detected: ${fileName}`)
    }
    breadclumb.add(fileName)
    return op(fileName)
  } catch(e) {
    console.error(e)
    return {
      filePath: fileName,
      deps: []
    }
  } finally {
    breadclumb.delete(fileName)
  }
}

export const traverseNode = (filePath: string, program: ts.Program, breadclumb: Set<string>) => (node: ts.Node): DependencyLeaf | null=> {
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

      return withBreadclumb(breadclumb, fileName, (fileName) => {
        return {
          filePath: fileName ?? '',
          deps: traverseSourceFile(sourceFile, fileName, program, breadclumb)
        }
      })
    }
  }

  return null
}

