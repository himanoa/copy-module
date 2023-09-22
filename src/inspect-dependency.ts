import path from "path"
import ts from "typescript"
import { readFileSync } from "fs"
import { analyseDependency } from "./analyse-dependency"
import { printDependencies } from "./printer"

export const inspectDependency = (filePath: string) => {
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
  const { deps } = analyseDependency(sourceFile, filePath, program)
  for(const dep of deps) {
    console.log(`${filePath}`)
    printDependencies(dep)
  }
}
