const ark = require('../../../lib/client')
const transactionBuilderTests = require('./__shared__/transaction')

let builder

beforeEach(() => {
  builder = ark.getBuilder().transfer()

  global.builder = builder
})

describe('Transfer Transaction', () => {
  transactionBuilderTests()

  it('should have its specific properties', () => {
    expect(builder).toHaveProperty('data.amount')
    expect(builder).toHaveProperty('data.recipientId')
    expect(builder).toHaveProperty('data.senderPublicKey')
    expect(builder).toHaveProperty('data.expiration')
  })

  describe('create', () => {
    it('establishes the recipient id', () => {
      builder.create('homer')
      expect(builder.data.recipientId).toBe('homer')
    })

    it('establishes the amount', () => {
      builder.create(null, 'a lot of ARK')
      expect(builder.data.amount).toBe('a lot of ARK')
    })
  })

  describe('vendorField', () => {
    it('should set the vendorField', () => {
      builder.vendorField('fake')
      expect(builder.data.vendorField).toBe('fake')
    })
  })
})
