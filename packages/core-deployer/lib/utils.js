'use strict'

const _ = require('lodash')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)

/**
 * Update the contents of the given file.
 * @param  {String} file
 * @param  {Object} overwrites
 * @return {void}
 */
exports.updateConfig = async (file, overwrites) => {
  let config = require(`${process.env.ARK_PATH_CONFIG}/${file}.json`)

  for (let key in overwrites) {
    _.set(config, key, overwrites[key])
  }

  writeFile(`${process.env.ARK_PATH_CONFIG}/${file}.json`, JSON.stringify(config, null, 2))
}
