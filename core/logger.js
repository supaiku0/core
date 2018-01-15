const winston = require('winston')
require('winston-daily-rotate-file')
require('colors')

let logger = null

class Logger {
  constructor () {
    if (!logger) {
      logger = this
    }
    return logger
  }

  init (level, network) {
    const rotatetransport = new winston.transports.DailyRotateFile({
      filename: `${__dirname}/../logs/ark-node-${network}`,
      datePattern: '.yyyy-MM-dd.log',
      level: level,
      zippedArchive: true
    })

    Object.assign(this, new winston.Logger({
      transports: [
        new winston.transports.Console({
          colorize: true,
          level: level,
          timestamp: true
        }),
        rotatetransport
      ]
    }))
  }

  printTracker (title, current, max, posttitle, figures = 0) {
    const progress = 100 * current / max
    let line = '\u{1b}[0G  '
    line += title.blue
    line += ' ['
    line += ('='.repeat(progress / 2)).green
    line += ' '.repeat(50 - progress / 2) + '] '
    line += progress.toFixed(figures) + '% '
    const hundred = 100
    if (progress.toFixed(4) === hundred.toFixed(4)) line += '                              \n'
    else if (posttitle) line += posttitle + ' '
    process.stdout.write(line)
  }
}

module.exports = new Logger()
