import ts from "typescript"
import { DependencyLeaf } from "./dependency-leaf"
import { DependencyTree } from "./dependency-tree"

export const analyseDependency = (sourceFile: ts.SourceFile, filePath: string, program: ts.Program, verbose: boolean): DependencyTree => {
  const results: DependencyTree = []
  results.push(traverseSourceFile(sourceFile, filePath, program, new Set<string>(), verbose))
  return results
}

export const traverseSourceFile = (
  sourceFile:  ts.SourceFile,
  filePath: string,
  program: ts.Program,
  breadclumb: Set<string> | null = null,
  verbose: boolean
): DependencyLeaf[] => {
  const results: DependencyLeaf[] = []
  sourceFile.forEachChild((node) => {
    const deps = (() => {
      if(breadclumb == null) {
        return traverseNode(filePath, program, new Set([filePath]), verbose)(node)
      }
      return traverseNode(filePath, program, breadclumb, verbose)(node)
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
  } catch(e: any) {
    console.error(e.message)
    return {
      filePath: fileName,
      deps: []
    }
  } finally {
    breadclumb.delete(fileName)
  }
}

export const traverseNode = (filePath: string, program: ts.Program, breadclumb: Set<string>, verbose: boolean) => (node: ts.Node): DependencyLeaf | null=> {
  switch(node.kind) {
    case ts.SyntaxKind.ImportDeclaration: {
      const importDeclaration = node as ts.ImportDeclaration
      if(verbose) {
        console.dir(node)
      }
      const ms = importDeclaration.moduleSpecifier
      if(ms.kind !== ts.SyntaxKind.StringLiteral) {
        return null
      }
      const modulePath = (ms as ts.StringLiteral).text
      const fileName = ts.resolveModuleName(modulePath, filePath, program.getCompilerOptions(), ts.sys).resolvedModule?.resolvedFileName
      if(fileName == null || fileName.includes('node_modules')) {
        if(verbose) {
          console.log(`Skip: filename is ${fileName}`)
        }
        return null
      }
      const sourceFile = program.getSourceFile(fileName)
      if(sourceFile == null) {
        if(verbose) {
          console.log(`Skip: sourceFile is undefined ${fileName}`)
        }
        return null
      }

      return withBreadclumb(breadclumb, fileName, (fileName) => {
        return {
          filePath: fileName ?? '',
          deps: traverseSourceFile(sourceFile, fileName, program, breadclumb, verbose)
        }
      })
    }
  }

  return null
}

