import ts from "typescript"
import { copyFileSync, readFileSync, writeFileSync } from "fs"
import path from "path"
import { mkdirSync, existsSync } from "fs"
import { Config } from "./config"
import { CopyRule, isMatchPattern, replaceFilePath } from "./copy-rule"
import { analyseDependency } from "./analyse-dependency"
import { makeIter } from "./dependency-tree"
import { loadConfig } from 'tsconfig-paths'

export const replaceFilePathCommand = async (filePath: string | null, dryRun: boolean) => {
  const config = JSON.parse(readFileSync(path.join(process.cwd(), "dbc.config.json"), "utf-8")) as Config
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
  const tsconfig = ts.readConfigFile(tsconfigPath, (path) => readFileSync(path, 'utf8'))

  const configResult = loadConfig(tsconfigPath)
  if(tsconfig.error || configResult.resultType === 'failed') {
    console.error("Error reading tsconfig.json")
    process.exit(1)
  }

  const codes = (() => {
    if(filePath != null) {
      return [filePath]
    }
    return config.entryPoints || []
  })()

  const program = ts.createProgram(codes, tsconfig.config)
  const sourceToDestMap = new Map<string, string>()

  codes.forEach(async (filePath) => {
    const sourceFile = program.getSourceFile(filePath)
    if(sourceFile == null) {
      console.error("Error reading source file")
      process.exit(1)
    }
    const dependencyTree = analyseDependency(sourceFile, filePath, program, configResult.absoluteBaseUrl, false)
    Array.from(new Set(Array.from(makeIter(dependencyTree)).map(({ filePath }) => filePath))).map((filePath) => copyModuleFromRules(config.rules, filePath, dryRun, sourceToDestMap))
  })

  console.dir(sourceToDestMap)

  if(!dryRun) {
    const serializableSourceToDestMap = Array.from(sourceToDestMap.entries()).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: value
      }
    }, {})
    writeFileSync(path.join(process.cwd(), "dbc.map.json"), JSON.stringify(serializableSourceToDestMap, null, 2))
  }
}

export const copyModuleFromRules = (rules: ReadonlyArray<CopyRule>, source: string, dryRun: boolean, sourceToDestMap: Map<string, string>) => {
  for(const rule of rules) {
    if(!isMatchPattern(rule.from, source)) {
      continue
    }

    const destinationPath = replaceFilePath(rule.from, rule.to, source)
    if(!dryRun) {
      mkdirSync(path.dirname(destinationPath), { recursive: true })
      if(!existsSync(destinationPath)) {
        copyFileSync(source, destinationPath)
        console.log(`copied ${source} -> ${destinationPath}`)
      }
    }
    if(dryRun) {
      console.log(`${source} -> ${destinationPath}`)
    }
    sourceToDestMap.set(source, destinationPath)
    return
  }
  console.error(`${source} is not matched with any rules.`)
}
