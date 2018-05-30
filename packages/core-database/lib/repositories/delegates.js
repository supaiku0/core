'use strict'

const { calculateApproval, calculateProductivity } = require('./utils/delegate-calculator')
const limitRows = require('./utils/limit-rows')
const wrapRows = require('./utils/wrap-rows')
const orderBy = require('lodash/orderBy')

module.exports = class DelegatesRepository {
  /**
   * Create a new delegate repository instance.
   * @param  {ConnectionInterface} connection
   */
  constructor (connection) {
    this.connection = connection
  }

  /**
   * Get all local delegates.
   * @return {Array}
   */
  getLocalDelegates () {
    return this.connection.walletManager.getLocalWallets().filter(wallet => !!wallet.username)
  }

  /**
   * Find all delegates.
   * @param  {Object} params
   * @return {Object}
   */
  findAll (params = {}) {
    const rows = limitRows(this.getLocalDelegates(), params)

    const order = params.orderBy
      ? params.orderBy.split(':')
      : ['rank', 'asc']

    return {
      rows: orderBy(rows, [order[0]], [order[1]]),
      count: rows.length
    }
  }

  /**
   * Paginate all delegates.
   * @param  {Object} params
   * @return {Object}
   */
  paginate (params) {
    return this.findAll(params)
  }

  /**
   * Search all delegates.
   * @param  {Object} params
   * @return {Object}
   */
  search (params) {
    let delegates = this.getLocalDelegates().filter(delegate => delegate.username.indexOf(params.q) > -1)

    if (params.orderBy) {
      const orderByField = params.orderBy.split(':')[0]
      const orderByDirection = params.orderBy.split(':')[1] || 'desc'

      delegates = delegates.sort((a, b) => {
        if (orderByDirection === 'desc' && (a[orderByField] < b[orderByField])) {
          return -1
        }

        if (orderByDirection === 'asc' && (a[orderByField] > b[orderByField])) {
          return 1
        }

        return 0
      })
    }

    return wrapRows(limitRows(delegates, params))
  }

  /**
   * Find a delegate.
   * @param  {String} id
   * @return {Object}
   */
  findById (id) {
    return this.getLocalDelegates().find(a => (a.address === id || a.publicKey === id || a.username === id))
  }

  /**
   * Find all active delegates at height.
   * @param  {Number} height
   * @return {Array}
   */
  getActiveAtHeight (height) {
    const delegates = this.connection.getActiveDelegates(height)

    return delegates.map(delegate => {
      const wallet = this.connection.wallets.findById(delegate.publicKey)

      return {
        username: wallet.username,
        approval: calculateApproval(delegate, height),
        productivity: calculateProductivity(wallet)
      }
    })
  }
}
