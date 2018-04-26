'use strict';

const winston = require('winston')
const { LoggerInterface } = require('@arkecosystem/core-logger')
require('colors')

module.exports = class Logger extends LoggerInterface {
  /**
   * [make description]
   * @return {Winston.Logger}
   */
  make () {
    this.driver = new (winston.Logger)()

    this.__registerTransports()

    this.__registerFilters()

    this.driver.printTracker = this.printTracker
    this.driver.stopTracker = this.stopTracker

    return this.driver
  }

  /**
   * [printTracker description]
   * @param  {String} title
   * @param  {Number} current
   * @param  {Number} max
   * @param  {String} posttitle
   * @param  {Number} figures
   * @return {void}
   */
  printTracker (title, current, max, posttitle, figures = 0) {
    const progress = 100 * current / max
    let line = '\u{1b}[0G  '
    line += title.blue
    line += ' ['
    line += ('='.repeat(progress / 2)).green
    line += ' '.repeat(50 - progress / 2) + '] '
    line += progress.toFixed(figures) + '% '
    if (posttitle) line += posttitle + '                     '
    process.stdout.write(line)
    this.tracker = line
  }

  /**
   * [stopTracker description]
   * @param  {String} title
   * @param  {Number} current
   * @param  {Number} max
   * @return {void}
   */
  stopTracker (title, current, max) {
    const progress = 100 * current / max
    let line = '\u{1b}[0G  '
    line += title.blue
    line += ' ['
    line += ('='.repeat(progress / 2)).green
    line += ' '.repeat(50 - progress / 2) + '] '
    line += progress.toFixed(0) + '% '
    if (current === max) line += '✔️'
    line += '                              \n'
    process.stdout.write(line)
    this.tracker = null
  }

  /**
   * [__registerTransports description]
   * @return {void}
   */
  __registerTransports () {
    Object.values(this.options.transports).forEach(transport => {
      if (transport.package) {
        require(transport.package)
      }

      this.driver.add(winston.transports[transport.constructor], transport.options)
    })
  }

  /**
   * [__registerFilters description]
   * @return {void}
   */
  __registerFilters () {
    this.driver.filters.push((level, message, meta) => {
      if (this.tracker) {
        process.stdout.write('\u{1b}[0G                                                                                                     \u{1b}[0G')
        this.tracker = null
      }

      return message
    })
  }
}
