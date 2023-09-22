import yargs from "yargs"

const args = yargs.option('inspect-dependency [entry-point]', {
  alias: 'i',
  type: 'string',
  description: 'Inspect dependency',
}).parseSync()

const main = async () => {
}
