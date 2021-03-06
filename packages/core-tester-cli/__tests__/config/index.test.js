'use strict'

const config = require('../../lib/config')

describe('Config', () => {
  it('should be an object', () => {
    expect(config).toBeObject()
  })

  it('should have specific data', () => {
    expect(config).toContainAllEntries([
      ['baseUrlApi', 'http://localhost:4102'],
      ['baseUrlP2P', 'http://localhost:4000'],
      ['passphrase', 'prison tobacco acquire stone dignity palace note decade they current lesson robot'],
      ['publicKeyHash', 23],
      ['requestHeaders', {
        nethash: 'd9acd04bde4234a81addb8482333b4ac906bed7be5a9970ce8ada428bd083192',
        version: '1.0.1',
        port: 4000
      }],
      ['transactionWaitDelay', 15]
    ])
  })
})
