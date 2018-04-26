'use strict';

const path = require('path')
const JsonDriver = require('../lib/driver')

const stubConfigPath = path.resolve(__dirname, './__stubs__')

const stubConfig = {
  delegates: require('./__stubs__/delegates'),
  genesisBlock: require('./__stubs__/genesisBlock'),
  network: require('./__stubs__/network')
}

describe('JSON Driver', () => {
  it('should fail without a config', async () => {
    try {
      console.log(stubConfigPath)
      const driver = new JsonDriver({ config: stubConfigPath })
      await driver.make()
    } catch (error) {
      await expect(error.message).toEqual('undefined (object) is required')
    }
  })

  it('should succeed with a config from a string', async () => {
    const driver = new JsonDriver({ config: stubConfigPath })
    const result = await driver.make()

    await expect(result.delegates).toEqual(stubConfig.delegates)
    await expect(result.genesisBlock).toEqual(stubConfig.genesisBlock)
    await expect(result.network).toEqual(stubConfig.network)
  })

  it('should succeed with a config from an object', async () => {
    const driver = new JsonDriver({ config: stubConfigPath })
    const result = await driver.make()

    await expect(result.delegates).toEqual(stubConfig.delegates)
    await expect(result.genesisBlock).toEqual(stubConfig.genesisBlock)
    await expect(result.network).toEqual(stubConfig.network)
  })
})
