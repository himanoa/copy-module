import yargs from "yargs"
import { inspectDependency } from "./inspect-dependency"

const args = yargs.option('inspectDependency', {
  alias: 'i',
  type: 'string',
  description: 'Inspect dependency',
}).parseSync()

const main = async () => {
  if(args.inspectDependency) {
    inspectDependency(args.inspectDependency)
  }
}

main()
