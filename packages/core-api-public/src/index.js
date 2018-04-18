'use strict';

const Server = require('./server')

/**
 * [plugin description]
 * @type {Object}
 */
exports.plugin = {
  pkg: require('../package.json'),
  defaults: require('./defaults.json'),
  register: async (manager, hook, options) => {
    manager.get('logger').info('Starting Public API...')

    return await Server(options)
  }
}
