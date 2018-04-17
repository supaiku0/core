const pino = require('pino')

class Logger {
  init (config) {
    const pretty = pino.pretty()
    pretty.pipe(process.stdout)

    this.pino = pino({
      name: 'ark-core',
      safe: true
    }, pretty)

    return this
  }

  error (message) {
    return this.pino.error(message)
  }

  warning (message) {
    return this.pino.warn(message)
  }

  info (message) {
    return this.pino.info(message)
  }

  debug (message) {
    return this.pino.debug(message)
  }

  printTracker (title, current, max, posttitle, figures = 0) {}

  stopTracker (title, current, max) {}
}

module.exports = new Logger()
