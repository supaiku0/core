'use strict'

const _ = require('lodash')
const filterObject = require('./utils/filter-object')

module.exports = class WalletsRepository {
  /**
   * Create a new wallet repository instance.
   * @param  {ConnectionInterface} connection
   */
  constructor (connection) {
    this.connection = connection
  }

  /**
   * Get all wallets.
   * @param  {Object} params
   * @return {Object}
   */
  findAll (params = {}) {
    let wallets = this.connection.walletManager.getLocalWallets()

    if (!Object.keys(params).length) {
      return wallets
    }

    wallets = wallets.slice(params.offset, params.offset + params.limit)

    return {
      count: wallets.length,
      rows: wallets
    }
  }

  /**
   * Get all wallets for the given vote.
   * @param  {String} publicKey
   * @param  {Object} params
   * @return {Object}
   */
  findAllByVote (publicKey, params = {}) {
    let wallets = this.findAll().filter(wallet => wallet.votes.includes(publicKey))

    if (!Object.keys(params).length) {
      return wallets
    }

    wallets = wallets.slice(params.offset, params.offset + params.limit)

    return {
      count: wallets.length,
      rows: wallets
    }
  }

  /**
   * Get a wallet by address, public key or username.
   * @param  {Number} id
   * @return {Object}
   */
  findById (id) {
    return this.findAll().find(wallet => (wallet.address === id || wallet.publicKey === id || wallet.username === id))
  }

  /**
   * Count all wallets.
   * @return {Number}
   */
  count () {
    return this.findAll().length
  }

  /**
   * Get all wallets sorted by balance.
   * @param  {Object}  params
   * @return {Object}
   */
  top (params = {}) {
    let wallets = this.findAll()

    wallets = _.sortBy(wallets, 'balance').reverse()

    wallets = wallets.slice(params.offset, params.offset + params.limit)

    return {
      count: wallets.length,
      rows: wallets
    }
  }

  /**
   * Search all wallets.
   * @param  {Object} params
   * @return {Object}
   */
  search (params) {
    let wallets = this.findAll()

    wallets = filterObject(wallets, params, {
      exact: ['address', 'publicKey', 'secondPublicKey', 'votes', 'username'],
      between: ['balance', 'votebalance']
    })

    return {
      count: wallets.length,
      rows: wallets
    }
  }
}
