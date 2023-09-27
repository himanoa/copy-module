import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import { inspectDependency } from "./inspect-dependency"
import { replaceFilePathCommand } from "./replace-file-path"

const args = yargs(hideBin(process.argv))
  .command('inspect', 'Inspect dependency', b => {
    b.positional('entryPointFilePath', {
      demandOption: true,
      string: true
    })
  })
  .command('copy-module', 'Copy module', b => {
    b.positional('entryPointFilePath', {
      demandOption: true,
      string: true
    })
  })
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Enable dry run mode'
  })
  .parseSync()

const main = async () => {
  switch(args._[0]) {
    case 'inspect':{
      if(typeof args._[1] === 'string') {
        inspectDependency(args._[1] as any)
      }
      break
    }
    case 'copy-module':{
      if(typeof args._[1] === 'string' && args.dryRun !== undefined) {
        replaceFilePathCommand(args._[1] as any, args.dryRun)
      }
      break
    }
  }
}

main()
