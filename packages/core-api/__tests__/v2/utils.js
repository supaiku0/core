'use strict'

const axios = require('axios')

class Helpers {
  request (method, path, params = {}) {
    const url = `http://localhost:4003/api/${path}`
    const headers = { 'API-Version': 2 }
    const request = axios[method.toLowerCase()]

    return ['GET', 'DELETE'].includes(method)
      ? request(url, { params, headers })
      : request(url, params, { headers })
  }

  expectJson (response) {
    expect(response.data).toBeObject()
  }

  expectStatus (response, code) {
    expect(response.status).toBe(code)
  }

  assertVersion (response, version) {
    expect(response.headers).toBeObject()
    expect(response.headers).toHaveProperty('api-version', version)
  }

  expectResource (response) {
    expect(response.data.data).toBeObject()
  }

  expectCollection (response) {
    expect(Array.isArray(response.data.data)).toBe(true)
  }

  expectPaginator (response, firstPage = true) {
    expect(response.data.meta).toBeObject()
    expect(response.data.meta).toHaveProperty('count')
    expect(response.data.meta).toHaveProperty('pageCount')
    expect(response.data.meta).toHaveProperty('totalCount')
    expect(response.data.meta).toHaveProperty('next')
    expect(response.data.meta).toHaveProperty('previous')
    expect(response.data.meta).toHaveProperty('self')
    expect(response.data.meta).toHaveProperty('first')
    expect(response.data.meta).toHaveProperty('last')
  }

  expectSuccessful (response, statusCode = 200) {
    this.expectStatus(response, statusCode)
    this.expectJson(response)
    this.assertVersion(response, '2')
  }

  expectError (response, statusCode = 404) {
    this.expectStatus(response, statusCode)
    this.expectJson(response)
    expect(response.data.statusCode).toBeNumber()
    expect(response.data.error).toBeString()
    expect(response.data.message).toBeString()
  }

  expectTransaction (transaction) {
    expect(transaction).toBeObject()
    expect(transaction).toHaveProperty('id')
    expect(transaction).toHaveProperty('blockId')
    expect(transaction).toHaveProperty('type')
    expect(transaction).toHaveProperty('amount')
    expect(transaction).toHaveProperty('fee')
    expect(transaction).toHaveProperty('sender')

    if ([1, 2].indexOf(transaction.type) === -1) {
      expect(transaction.recipient).toBeString()
    }

    expect(transaction.signature).toBeString()
    expect(transaction.confirmations).toBeNumber()
  }

  expectBlock (block) {
    expect(block).toBeObject()
    expect(block).toHaveProperty('id')
    expect(block).toHaveProperty('version')
    expect(block).toHaveProperty('height')
    expect(block).toHaveProperty('previous')
    expect(block).toHaveProperty('forged')
    expect(block.forged).toHaveProperty('reward')
    expect(block.forged).toHaveProperty('fee')
    expect(block).toHaveProperty('payload')
    expect(block.payload).toHaveProperty('length')
    expect(block.payload).toHaveProperty('hash')
    expect(block).toHaveProperty('generator')
    expect(block.generator).toHaveProperty('publicKey')
    expect(block).toHaveProperty('signature')
    expect(block).toHaveProperty('transactions')
  }

  expectWallet (wallet) {
    expect(wallet).toBeObject()
    expect(wallet).toHaveProperty('address')
    expect(wallet).toHaveProperty('publicKey')
    expect(wallet).toHaveProperty('balance')
    expect(wallet).toHaveProperty('isDelegate')
  }
}

/**
 * @type {Helpers}
 */
module.exports = new Helpers()
