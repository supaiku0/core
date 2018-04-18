import bigi from 'bigi'
import crypto from '../../../lib/crypto'
import ECPair from '../../../lib/crypto/ecpair'

import configManager from '../../../lib/managers/config'
import network from '../../../lib/networks/ark/mainnet.json'

beforeEach(() => configManager.setConfig(network))

describe('Basic Crypto', () => {
  it('can generate a random ark address', () => {
    const keyPair = ECPair.makeRandom({
      rng: () => Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
    })

    expect(keyPair.getAddress()).toBe('ANoMWEJ9jSdE2FgohBLLXeLzci59BDFsP4')
  })

  it('can generate an address from a SHA256 hash', () => {
    const hash = crypto.sha256('correct horse battery staple')
    const keyPair = new ECPair(bigi.fromBuffer(hash))

    expect(keyPair.getAddress()).toBe('AG5AtmiNbgv51eLwAWnRGvkMudVd7anYP2')
  })

  it('can generate a random keypair for alternative networks', () => {
    const keyPair = ECPair.makeRandom({
      network,
      rng: () => Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
    })

    expect(keyPair.getAddress()).toBe('ANoMWEJ9jSdE2FgohBLLXeLzci59BDFsP4')
    expect(keyPair.toWIF()).toBe('SDgGxWHHQHnpm5sth7MBUoeSw7V7nbimJ1RBU587xkryTh4qe9ov')
  })

  it('can import an address via WIF', () => {
    const keyPair = ECPair.fromWIF('SDgGxWHHQHnpm5sth7MBUoeSw7V7nbimJ1RBU587xkryTh4qe9ov')

    expect(keyPair.getAddress()).toBe('ANoMWEJ9jSdE2FgohBLLXeLzci59BDFsP4')
  })
})
