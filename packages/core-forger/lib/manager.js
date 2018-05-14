'use strict'

const delay = require('delay')

const container = require('@arkecosystem/core-container')
const logger = container.resolvePlugin('logger')
const config = container.resolvePlugin('config')
const emitter = container.resolvePlugin('event-emitter')

const client = require('@arkecosystem/client')
const { slots } = client
const { Delegate, Transaction } = client.models

const Client = require('./client')

module.exports = class ForgerManager {
  /**
   * Create a new forger manager instance.
   * @param  {Object} options
   */
  constructor (options) {
    this.secrets = config.delegates ? config.delegates.secrets : null
    this.network = config.network
    this.client = new Client(options.host)
  }

  /**
   * Load all delegates that forge.
   * @param  {String} bip38
   * @param  {String} address
   * @param  {String} password
   * @return {Array}
   */
  async loadDelegates (bip38, address, password) {
    if (!bip38 && !this.secrets) {
      throw new Error('No delegate found')
    }

    this.delegates = this.secrets.map(passphrase => new Delegate(passphrase, this.network, password))

    if (bip38) {
      const bip38Delegate = new Delegate(bip38, this.network, password)

      if ((bip38Delegate.address && !address) || bip38Delegate.address === address) {
        logger.info('BIP38 Delegate loaded')

        this.delegates.push(bip38Delegate)
      }
    }

    return this.delegates
  }

  /**
   * Start forging on the given node.
   * @return {Object}
   */
  async startForging () {
    // TODO: assuming that blockTime = 8s
    const slot = slots.getSlotNumber()

    while (slots.getSlotNumber() === slot) {
      await delay(100)
    }

    return this.__monitor(null, null, {})
  }

  /**
   * Monitor the node for any actions that trigger forging.
   * @param  {Object} round
   * @param  {Object} transactionData
   * @param  {Object} data
   * @return {Function}
   */
  async __monitor (round, transactionData, data) {
    try {
      round = await this.client.getRound()

      if (!round.canForge) {
        // logger.debug('Block already forged in current slot')
        await delay(100) // basically looping until we lock at beginning of next slot

        return this.__monitor(round, transactionData, data)
      }

      const delegate = await this.__pickForgingDelegate(round)

      if (!delegate) {
        // logger.debug(`Next delegate ${round.delegate.publicKey} is not configured on this node`)
        await delay(7900) // we will check at next slot

        return this.__monitor(round, transactionData, data)
      }

      emitter.emit('forging.started', delegate)

      transactionData = await this.client.getTransactions()
      const transactions = transactionData.transactions ? transactionData.transactions.map(serializedTx => Transaction.fromBytes(serializedTx)) : []
      logger.debug(`Received ${transactions.length} transactions from the pool containing ${transactionData.poolSize}`)

      data.previousBlock = round.lastBlock
      data.timestamp = round.timestamp
      data.reward = round.reward

      const block = await delegate.forge(transactions, data)

      emitter.emit('block.forged', block)
      transactions.forEach(transaction => emitter.emit('transaction.forged', transaction))

      this.client.broadcast(block.toRawJson())
      await delay(7800) // we will check at next slot

      return this.__monitor(round, transactionData, data)
    } catch (error) {
      logger.debug(`Not able to forge: ${error.message}`)
      // console.log(round)
      // logger.info('round:', round ? round.current : '', 'height:', round ? round.lastBlock.height : '')
      await delay(2000) // no idea when this will be ok, so waiting 2s before checking again

      emitter.emit('forging.failed', error.message)

      return this.__monitor(round, transactionData, data)
    }
  }

  /**
   * Pick the delegate that will forge.
   * @param  {Object} round
   * @return {Object}
   */
  async __pickForgingDelegate (round) {
    return this.delegates.find(delegate => delegate.publicKey === round.delegate.publicKey)
  }
}
