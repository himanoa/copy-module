import ts from "typescript"
import { readFileSync } from "fs"
import source from "path"
import fs from 'fs/promises'
import { Config } from "./config"
import { CopyRule, isMatchPattern, replaceFilePath } from "./copy-rule"
import { analyseDependency } from "./analyse-dependency"
import { makeIter } from "./dependency-tree"

export const replaceFilePathCommand = (filePath: string) => {
  const config = JSON.parse(readFileSync(source.join(process.cwd(), "copymod.config.json"), "utf-8")) as Config
  const tsconfigPath = source.join(process.cwd(), 'tsconfig.json')
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

  Promise.all(
    Array.from(new Set(Array.from(makeIter(dependencyTree)).map(({ filePath }) => filePath))).map((filePath) => copyModuleFromRules(config.rules, filePath))
  )
}

export const copyModuleFromRules = async (rules: ReadonlyArray<CopyRule>, source: string): Promise<void> => {
  for(const rule of rules) {
    if(!isMatchPattern(rule.from, source)) {
      continue
    }

    const destinationPath = replaceFilePath(rule.from, rule.to, source)
    await fs.copyFile(source, destinationPath)
    return
  }
  console.error(`${source} is not matched with any rules.`)
}
