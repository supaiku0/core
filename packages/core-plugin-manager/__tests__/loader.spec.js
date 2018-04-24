'use strict';

const path = require('path')
const pluginManager = require('../lib')

const stubPlugins = require('./stubs/plugins.js')
const stubPluginPath = path.resolve(__dirname, './stubs')

describe('PluginLoader', () => {
  it('should be an object', async () => {
    await expect(pluginManager).toBeObject()
  })

  it('should register plugin list from file', async () => {
    await pluginManager.init(stubPluginPath)

    await expect(pluginManager.plugins).toEqual(stubPlugins)
  })

  it('should register a hook', async () => {
    await pluginManager.init(stubPluginPath)
    await pluginManager.hook('init')

    await expect(pluginManager.has('stub-plugin')).toBeTruthy()
  })

  it('should register a plugin', async () => {
    const pluginName = './__tests__/stubs/plugin'
    const pluginConfig = stubPlugins.init[pluginName]

    await pluginManager.init(stubPluginPath)
    await pluginManager.register(pluginName, pluginConfig)

    await expect(pluginManager.has('stub-plugin')).toBeTruthy()
  })
})
