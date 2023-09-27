import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import { inspectDependency } from "./inspect-dependency"
import { replaceFilePathCommand } from "./replace-file-path"
import { initConfig } from "./init-config"

const args = yargs(hideBin(process.argv))
  .command('inspect', 'Inspect dependency', b => {
    b.positional('entryPointFilePath', {
      demandOption: true,
      string: true
    })
  })
  .command('clone', 'Clone module', b => {
    b.positional('entryPointFilePath', {
      demandOption: true,
      string: true
    })
    .option('verbose', {
      type: 'boolean',
      description: 'verbose logging'
    })
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      description: 'Enable dry run mode'
    })
  })
  .command('init-config', 'Initialize config')
  .parseSync()

const main = async () => {
  switch(args._[0]) {
    case 'inspect':{
      if(typeof args._[1] === 'string') {
        inspectDependency(args._[1] as any, args['verbose'] as any)
      }
      break
    }
    case 'clone':{
      if(typeof args._[1] === 'string' && args.dryRun !== undefined) {
        replaceFilePathCommand(args._[1] as any, args['dryRun'] as any)
      }
      break
    }
    case 'init-config': {
      initConfig()
      break
    }
  }
}

main()
