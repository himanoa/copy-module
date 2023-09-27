import path from "path"
import ts from "typescript"
import { readFileSync } from "fs"
import { analyseDependency } from "./analyse-dependency"
import { printDependencies } from "./printer"

export const inspectDependency = (filePath: string, verbose: boolean) => {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
  const tsconfig = ts.readConfigFile(tsconfigPath, (path) => readFileSync(path, 'utf8'))

  if(tsconfig.error) {
    console.error("Error reading tsconfig.json")
    console.error(tsconfig.error.messageText)
    process.exit(1)
  }

  const program = ts.createProgram([filePath], tsconfig.config)
  const sourceFile = program.getSourceFile(filePath)
  if(sourceFile == null) {
    console.error("Error reading source file")
    process.exit(1)
  }
  const dependencyTree = analyseDependency(sourceFile, filePath, program)
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
