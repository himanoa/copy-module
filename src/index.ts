import yargs from "yargs"

const args = yargs.option('dry-run', {
  alias: 'd',
  type: 'boolean',
  description: 'Run the script without making any changes',
}).parseSync()

console.dir(args)
