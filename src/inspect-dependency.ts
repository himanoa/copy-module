import path from "path"
import ts from "typescript"
import { readFileSync } from "fs"
import { analyseDependency } from "./analyse-dependency"
import { printDependencies } from "./printer"
import { loadConfig } from 'tsconfig-paths'

export const inspectDependency = (filePath: string, verbose: boolean) => {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
  const tsconfig = ts.readConfigFile(tsconfigPath, (path) => readFileSync(path, 'utf8'))
  const configResult = loadConfig(tsconfigPath)
  if(tsconfig.error || configResult.resultType === 'failed') {
    console.error("Error reading tsconfig.json")
    process.exit(1)
  }

  const program = ts.createProgram([filePath], tsconfig.config)
  const sourceFile = program.getSourceFile(filePath)
  if(sourceFile == null) {
    console.error("Error reading source file")
    process.exit(1)
  }
  const dependencyTree = analyseDependency(sourceFile, filePath, program, configResult.absoluteBaseUrl, verbose)
  if(verbose) {
    console.log("## Source file")
    console.log(JSON.stringify(program, null, 2))
    console.log("## Analyse result")
    console.log(JSON.stringify(dependencyTree, null, 2))
  }
  for(const deps of dependencyTree) {
    console.log("")
    console.log(`${filePath}`)
    printDependencies(deps)
  }
}
