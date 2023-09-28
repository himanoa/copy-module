import { writeFileSync } from "fs"
import { Config } from "./config"
import path from "path"

export const initConfig = () => {
  const config: Config = {
    rules: [{
      from: 'src/(.+).ts',
      to: 'src/$1.js'
    }],
    ignorePatterns: [],
    entryPoints: []
  }

  const configDestPath = path.join(process.cwd(), 'dbc.config.json')
  const body = JSON.stringify(config, null, 2)
  writeFileSync(configDestPath, body)
  console.log("Created dbc.config.json")
}
