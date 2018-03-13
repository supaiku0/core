const commander = require('commander')
const packageJson = require('../package.json')
const logger = require('app/core/logger')
const ForgerManager = require('app/core/managers/forger')
const config = require('app/core/config')

commander
  .version(packageJson.version)
  .option('-c, --config <path>', 'config files path')
  .option('-b, --bip38 <bip38>', 'forger bip38')
  .option('-a, --address <address>', 'forger address')
  .option('-p, --password <password>', 'forger password')
  .option('-i, --interactive', 'launch cli')
  .parse(process.argv)

process.on('unhandledRejection', (reason, p) => {
  logger.error(`Unhandled Rejection at: ${JSON.stringify(p)} reason: ${reason}`)
})

const start = async () => {
  try {
    logger.init(config.server.logging, config.network.name + '-forger')

    const forgerManager = await new ForgerManager(config, commander.password)
    const forgers = await forgerManager.loadDelegates(commander.bip38, commander.address)

    logger.info('ForgerManager started with', forgers.length, 'forgers')
    forgerManager.startForging(`http://127.0.0.1:${config.server.port}`)
  } catch (error) {
    logger.error('Fatal Error', error.stack)
    process.exit(1)
  }
}

start()
