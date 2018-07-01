'use strict'
const container = require('@arkecosystem/core-container')
const config = container.resolvePlugin('config')
const logger = container.resolvePlugin('logger')
const { slots } = require('@arkecosystem/crypto')

module.exports = (p2pMonitor, lastBlock) => {
  if (process.env.ARK_ENV === 'test') {
    return 1
  }

  const start = new Date()

  logger.debug('start quorum math')
  const networkHeight = p2pMonitor.getNetworkHeight()
  const peers = p2pMonitor.getPeers()
  const minimumNetworkReach = config.peers.minimumNetworkReach || 20

  const currentSlot = slots.getSlotNumber()

  let quorum = 0
  let noquorum = 0

  if (peers.length < minimumNetworkReach) {
    logger.info(`Network reach is not sufficient to get quorum. Network reach of ${peers.length} peers.`)
    return 0
  }

  for (const peer of peers) {
    if (peer.state.height === lastBlock.data.height) {
      if (peer.state.header.id === lastBlock.data.id && peer.state.currentSlot === currentSlot && peer.state.forgingAllowed) {
        quorum = quorum + 1
      } else {
        noquorum = noquorum + 1
      }
    } else if (peer.state.height > lastBlock.data.height) {
      noquorum = noquorum + 1
      // overheightquorum = overheightquorum + 1;
      // overheightblock = peer.blockheader;
    } else if (lastBlock.data.height - peer.state.height < 3) { // suppose the max network elasticity accross 3 blocks
      noquorum = noquorum + 1
    }
  }
  // PBFT: most nodes are on same branch, no other block have been forged and we are on forgeable currentSlot

  const calculatedQuorum = quorum / (quorum + noquorum)
  const duration = new Date() - start
  logger.info(`Network height: ${networkHeight}, CalcQuorum: ${calculatedQuorum}, Quorum: ${quorum}, NQuorum: ${noquorum} Last Block id: ${lastBlock.data.id}, duration ${duration}`)

  // TODO: move to forger
  /* if (calculatedQuorum > 0.66) {
      letsforge = true
  } else {
    // We are forked!
   const lastBlock = container.resolvePlugin('blockchain').getLastBlock()
   logger.info(`Fork 6 - Not enough quorum to forge next block. Network height: ${networkHeight}, Quorum: ${calculatedQuorum}, Last Block id: ${lastBlock.data.id}`)
  }
  */
  return calculatedQuorum
}
