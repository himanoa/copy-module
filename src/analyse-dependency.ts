import ts, { createProgram } from "typescript"
import { relative } from 'path'
import { createMatchPath } from 'tsconfig-paths'
import { DependencyLeaf } from "./dependency-leaf"
import { DependencyTree } from "./dependency-tree"

export const analyseDependency = (
  sourceFile: ts.SourceFile,
  filePath: string, program: ts.Program,
  absoluteBaseUrl: string,

  verbose: boolean
): DependencyTree => {
  const results: DependencyTree = []
  results.push(traverseSourceFile(sourceFile, filePath, program, new Set<string>(), verbose, absoluteBaseUrl))
  return results
}

export const traverseSourceFile = (
  sourceFile:  ts.SourceFile,
  filePath: string,
  program: ts.Program,
  breadclumb: Set<string> | null = null,
  verbose: boolean,
  absoluteBaseUrl: string
): DependencyLeaf[] => {
  const results: DependencyLeaf[] = []
  sourceFile.forEachChild((node) => {
    const deps = (() => {
      if(breadclumb == null) {
        return traverseNode(filePath, program, new Set([filePath]), verbose, absoluteBaseUrl)(node)
      }
      return traverseNode(filePath, program, breadclumb, verbose , absoluteBaseUrl)(node)
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

const getModulePath = (absoluteBaseUrl: string,  program: ts.Program, modulePath: string): string => {
  const supportedExtensions = ['.ts', '.tsx']
  const paths = (program.getCompilerOptions() as any).compilerOptions.paths
  if(paths == null) {
    return modulePath
  }

  const absPath = createMatchPath(absoluteBaseUrl, paths)(modulePath, undefined, undefined, supportedExtensions)
  if(absPath == null) {
    return modulePath
  }
  return absPath
}

export const traverseNode = (
  filePath: string, program: ts.Program, breadclumb: Set<string>, verbose: boolean, absoluteBaseUrl: string) => (node: ts.Node): DependencyLeaf | null=> {
  switch(node.kind) {
    case ts.SyntaxKind.ImportDeclaration: {
      const importDeclaration = node as ts.ImportDeclaration
      const ms = importDeclaration.moduleSpecifier

      if(ms.kind !== ts.SyntaxKind.StringLiteral) {
        return null
      }
      const modulePath = getModulePath(absoluteBaseUrl, program, (ms as ts.StringLiteral).text)
      const resolved = ts.resolveModuleName(modulePath, filePath, program.getCompilerOptions(), ts.sys)
      const fileName = resolved.resolvedModule?.resolvedFileName
      if(fileName == null || fileName.includes('node_modules')) {
        return null
      }
      const sourceFilePath = relative(process.cwd(), fileName)
      const sourceFile = ts.createSourceFile(sourceFilePath, ts.sys.readFile(sourceFilePath, 'utf-8') || '', ts.ScriptTarget.ESNext)
      if(sourceFile == null) {
        if(verbose) {
          console.log(`Skip: sourceFile is undefined ${sourceFilePath}`)
        }
        return null
      }

      return withBreadclumb(breadclumb, fileName, (fileName) => {
        return {
          filePath: relative(process.cwd(), fileName) ?? '',
          deps: traverseSourceFile(sourceFile, fileName, program, breadclumb, verbose, absoluteBaseUrl)
        }
      })
    }
  }

  return null
}

