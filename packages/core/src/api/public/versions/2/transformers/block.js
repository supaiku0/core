const db = require('@arkecosystem/core-database').getInstance()
const formatTimestamp = require('./utils/format-timestamp')

module.exports = (model) => {
  const generator = db.walletManager.getWalletByPublicKey(model.generatorPublicKey)

  return {
    id: model.id,
    version: model.version,
    height: model.height,
    previous: model.previousBlock,
    forged: {
      reward: model.reward,
      fee: model.totalFee,
      total: model.reward + model.totalFee
    },
    payload: {
      hash: model.payloadHash,
      length: model.payloadLength
    },
    generator: {
      username: generator.username,
      address: generator.address,
      publicKey: generator.publicKey
    },
    signature: model.blockSignature,
    confirmations: model.confirmations,
    transactions: model.numberOfTransactions,
    timestamp: formatTimestamp(model.timestamp)
  }
}
