'use strict'

let walletManager
const { Block, Wallet } = require('@arkecosystem/client').models

const block = new Block(require('./__fixtures__/block.json')) // eslint-disable-line no-unused-vars
const dummy1 = require('./__fixtures__/wallets.json')[0]
const dummy2 = require('./__fixtures__/wallets.json')[1]
const dummyFake = require('./__fixtures__/wallets.json')[2]

beforeAll(async (done) => {
  await require('./__support__/setup')()

  walletManager = new (require('../lib/wallet-manager'))()

  done()
})

function createWalletManager () {
  return new (require('../lib/wallet-manager'))()
}

describe('Wallet Manager', () => {
  it('should be an object', async () => {
    await expect(walletManager).toBeObject()
  })

  describe('reset', async () => {
    it('should be a function', async () => {
      await expect(walletManager.reset).toBeFunction()
    })

    it('should reset the index', () => {
      const wallet = new Wallet(dummy1.address)
      const manager = createWalletManager()

      manager.reindex(wallet)
      expect(manager.getLocalWallets()).toEqual([wallet])

      manager.reset()
      expect(manager.getLocalWallets()).toEqual([])
    })
  })

  describe('reindex', async () => {
    it('should be a function', async () => {
      await expect(walletManager.reindex).toBeFunction()
    })

    it('should index the wallets', () => {
      const wallet = new Wallet(dummy1.address)
      const manager = createWalletManager()

      expect(manager.getLocalWallets()).toEqual([])

      manager.reindex(wallet)
      expect(manager.getLocalWallets()).toEqual([wallet])
    })
  })

  describe('applyBlock', async () => {
    it('should be a function', async () => {
      await expect(walletManager.applyBlock).toBeFunction()
    })

    it('should apply transactions of the block', () => {

    })

    it('should apply the block to the delegate', () => {

    })

    describe('1 transaction fails while applying it', () => {
      it('should undo all transactions of the block', () => {

      })
    })

    describe('the delegate of the block is not indexed', () => {
      describe('not genesis block', () => {
        it('throw an Error', () => {

        })
      })

      describe('genesis block', () => {
        it('generates a new wallet', () => {

        })
      })
    })
  })

  describe('undoBlock', async () => {
    it('should be a function', async () => {
      await expect(walletManager.undoBlock).toBeFunction()
    })

    it('should undo all transactions of the block', () => {

    })

    it('should undo the block of the delegate', () => {

    })
  })

  describe('applyTransaction', async () => {
    it('should be a function', async () => {
      await expect(walletManager.applyTransaction).toBeFunction()
    })
  })

  describe('undoTransaction', async () => {
    it('should be a function', async () => {
      await expect(walletManager.undoTransaction).toBeFunction()
    })
  })

  describe('getWalletByAddress', async () => {
    it('should be a function', async () => {
      await expect(walletManager.getWalletByAddress).toBeFunction()
    })

    it('should index it by address', () => {
      const wallet = new Wallet(dummy1.address)
      const manager = createWalletManager()

      manager.reindex(wallet)
      expect(Object.keys(manager.walletsByAddress)[0]).toBe(wallet.address)
    })

    it('should return it by address', () => {
      const wallet = new Wallet(dummy1.address)
      const manager = createWalletManager()

      manager.reindex(wallet)
      expect(manager.getWalletByAddress(wallet.address).address).toBe(wallet.address)
    })
  })

  describe('getWalletByPublicKey', async () => {
    it('should be a function', async () => {
      await expect(walletManager.getWalletByPublicKey).toBeFunction()
    })

    it('should index it by publicKey', () => {
      const wallet = new Wallet(dummy1.address)
      wallet.publicKey = dummy1.publicKey
      const manager = createWalletManager()

      manager.reindex(wallet)
      expect(Object.keys(manager.walletsByPublicKey)[0]).toBe(wallet.publicKey)
    })

    it('should return it by publicKey', () => {
      const wallet = new Wallet(dummy1.address)
      wallet.publicKey = 'dummy-public-key'
      const manager = createWalletManager()

      manager.reindex(wallet)
      expect(manager.getWalletByPublicKey(wallet.publicKey).publicKey).toBe(wallet.publicKey)
    })
  })

  describe('getWalletByUsername', async () => {
    it('should be a function', async () => {
      await expect(walletManager.getWalletByUsername).toBeFunction()
    })

    it('should index it by username', () => {
      const wallet = new Wallet(dummy1.address)
      wallet.username = 'dummy-username'
      const manager = createWalletManager()

      manager.reindex(wallet)
      expect(Object.keys(manager.walletsByUsername)[0]).toBe(wallet.username)
    })

    it('should return it by username', () => {
      const wallet = new Wallet(dummy1.address)
      wallet.username = 'dummy-username'
      const manager = createWalletManager()

      manager.reindex(wallet)
      expect(manager.getWalletByUsername(wallet.username).username).toBe(wallet.username)
    })
  })

  describe('getLocalWallets', async () => {
    it('should be a function', async () => {
      await expect(walletManager.getLocalWallets).toBeFunction()
    })

    it('should return indexed', () => {
      const manager = createWalletManager()

      const wallet1 = new Wallet(dummy1.address)
      manager.reindex(wallet1)

      const wallet2 = new Wallet(dummy2.address)
      manager.reindex(wallet2)

      expect(manager.getLocalWallets()).toEqual([wallet1, wallet2])
    })
  })

  describe('__canBePurged', async () => {
    it('should be a function', async () => {
      await expect(walletManager.__canBePurged).toBeFunction()
    })

    it('should be removed if all criteria are satisfied', async () => {
      const wallet = new Wallet(dummy1.address)

      expect(createWalletManager().__canBePurged(wallet)).toBeTruthy()
    })

    it('should not be removed if wallet.secondPublicKey is set', async () => {
      const wallet = new Wallet(dummy1.address)
      wallet.secondPublicKey = 'secondPublicKey'

      expect(wallet.secondPublicKey).toBe('secondPublicKey')
      expect(createWalletManager().__canBePurged(wallet)).toBeFalsy()
    })

    it('should not be removed if wallet.multisignature is set', async () => {
      const wallet = new Wallet(dummy1.address)
      wallet.multisignature = 'multisignature'

      expect(wallet.multisignature).toBe('multisignature')
      expect(createWalletManager().__canBePurged(wallet)).toBeFalsy()
    })

    it('should not be removed if wallet.username is set', async () => {
      const wallet = new Wallet(dummy1.address)
      wallet.username = 'username'

      expect(wallet.username).toBe('username')
      expect(createWalletManager().__canBePurged(wallet)).toBeFalsy()
    })
  })

  describe('purgeEmptyNonDelegates', async () => {
    it('should be a function', async () => {
      await expect(walletManager.purgeEmptyNonDelegates).toBeFunction()
    })

    it('should be purged if all criteria are satisfied', async () => {
      const manager = createWalletManager()

      const wallet1 = new Wallet(dummy1.address)
      wallet1.publicKey = 'dummy-1-publicKey'
      manager.reindex(wallet1)

      const wallet2 = new Wallet(dummy2.address)
      wallet2.username = 'username'

      manager.reindex(wallet2)

      manager.purgeEmptyNonDelegates()

      expect(manager.getLocalWallets()).toEqual([wallet2])
    })

    it('should not be purged if wallet.secondPublicKey is set', async () => {
      const manager = createWalletManager()

      const wallet1 = new Wallet(dummy1.address)
      wallet1.publicKey = 'dummy-1-publicKey'
      wallet1.secondPublicKey = 'dummy-1-secondPublicKey'
      manager.reindex(wallet1)

      const wallet2 = new Wallet(dummy2.address)
      wallet2.username = 'username'

      manager.reindex(wallet2)

      manager.purgeEmptyNonDelegates()

      expect(manager.getLocalWallets()).toEqual([wallet1, wallet2])
    })

    it('should not be purged if wallet.multisignature is set', async () => {
      const manager = createWalletManager()

      const wallet1 = new Wallet(dummy1.address)
      wallet1.publicKey = 'dummy-1-publicKey'
      wallet1.multisignature = 'dummy-1-multisignature'
      manager.reindex(wallet1)

      const wallet2 = new Wallet(dummy2.address)
      wallet2.username = 'username'

      manager.reindex(wallet2)

      manager.purgeEmptyNonDelegates()

      expect(manager.getLocalWallets()).toEqual([wallet1, wallet2])
    })

    it('should not be purged if wallet.username is set', async () => {
      const manager = createWalletManager()

      const wallet1 = new Wallet(dummy1.address)
      wallet1.publicKey = 'dummy-1-publicKey'
      wallet1.username = 'dummy-1-username'
      manager.reindex(wallet1)

      const wallet2 = new Wallet(dummy2.address)
      wallet2.username = 'username'

      manager.reindex(wallet2)

      manager.purgeEmptyNonDelegates()

      expect(manager.getLocalWallets()).toEqual([wallet1, wallet2])
    })
  })

  describe('isGenesis', async () => {
    it('should be a function', async () => {
      await expect(walletManager.isGenesis).toBeFunction()
    })

    it('should be truthy', async () => {
      const wallet = new Wallet(dummy1.address)

      expect(createWalletManager().isGenesis(wallet)).toBeTruthy()
    })

    it('should be falsy', async () => {
      const wallet = new Wallet(dummyFake.address)

      expect(createWalletManager().isGenesis(wallet)).toBeFalsy()
    })
  })
})
