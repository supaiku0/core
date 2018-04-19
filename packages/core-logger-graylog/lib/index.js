'use strict';

const GraylogDriver = require('./driver')

/**
 * [plugin description]
 * @type {Object}
 */
exports.plugin = {
  pkg: require('../package.json'),
  defaults: require('./defaults.json'),
  alias: 'logger',
  register: async (manager, options) => {
    const logManager = manager.get('logManager')
    await logManager.makeDriver(new GraylogDriver(options))

    return logManager.driver()
  }
}
