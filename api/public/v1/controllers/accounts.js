const accounts = requireFrom('repositories/accounts')
const arkjs = require('arkjs')
const blockchain = requireFrom('core/blockchainManager')
const config = requireFrom('core/config')
const logger = requireFrom('core/logger')
const responder = requireFrom('api/responder')
const transformer = requireFrom('api/transformer')

class WalletsController {
  index(req, res, next) {
    accounts.all({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      order: [
        ['balance', 'DESC']
      ],
      offset: parseInt(req.query.offset || 1),
      limit: parseInt(req.query.limit || 100)
    }).then(result => {
      responder.ok(req, res, {
        accounts: new transformer(req).collection(result.rows, 'account')
      })
    })

    next()
  }

  show(req, res, next) {
    if (arkjs.crypto.validateAddress(req.query.address, config.network.pubKeyHash)) {
      accounts.findById(req.query.address)
        .then(result => {
          responder.ok(req, res, {
            account: new transformer(req).resource(result, 'account')
          })
        })
        .catch(error => {
          logger.error(error)

          responder.error(req, res, {
            error: error
          })
        })
    } else {
      responder.error(req, res, {
        error: 'Object didn\'t pass validation for format address: ' + req.query.address
      })
    }

    next()
  }

  balance(req, res, next) {
    if (arkjs.crypto.validateAddress(req.query.address, config.network.pubKeyHash)) {
      accounts.findById(req.query.address)
        .then(account => {
          responder.ok(req, res, {
            balance: account ? account.balance : '0',
            unconfirmedBalance: account ? account.balance : '0'
          })
        })
        .catch(error => {
          logger.error(error)

          responder.error(req, res, {
            error: error
          })
        })
    } else {
      responder.error(req, res, {
        error: 'Object didn\'t pass validation for format address: ' + req.query.address,
      })
    }

    next()
  }

  publicKey(req, res, next) {
    if (arkjs.crypto.validateAddress(req.query.address, config.network.pubKeyHash)) {
      accounts.findById(req.query.address)
        .then(account => {
          responder.ok(req, res, {
            publicKey: account.publicKey,
          })
        })
        .catch(error => {
          logger.error(error)

          responder.error(req, res, {
            error: error
          })
        })
    } else {
      responder.error(req, res, {
        error: 'Object didn\'t pass validation for format address: ' + req.query.address,
      })
    }

    next()
  }

  fee(req, res, next) {
    res.send(200, {
      fee: config.getConstants(blockchain.getInstance().lastBlock.data.height).fees.delegate,
    })

    next()
  }

  delegates(req, res, next) {
    if (arkjs.crypto.validateAddress(req.query.address, config.network.pubKeyHash)) {
      accounts.findById(req.query.address)
        .then(account => {
          if (!account.vote) {
            responder.ok(req, res, {
              delegates: []
            })
          } else {

            // TODO fix with balance and productivity calculation
            // https://github.com/ArkEcosystem/ark-node/blob/development/modules/delegates.js#L494
            // https://github.com/fix/ark-core/blob/master/api/p2p/up.js#L149
            accounts.findDelegate(arkjs.crypto.getAddress(account.vote, config.network.pubKeyHash))
              .then(delegate => {
                responder.ok(req, res, {
                  delegates: [ delegate ],
                })
              })
          }
        })
        .catch(error => {
          logger.error(error)

          responder.error(req, res, {
            error: error
          })
        })
    } else {
      responder.error(req, res, {
        error: 'Object didn\'t pass validation for format address: ' + req.query.address,
      })
    }

    next()
  }

  top(req, res, next) {
    accounts.all({
      attributes: ['address', 'balance', 'publicKey'],
      order: [
        ['balance', 'DESC']
      ],
      offset: parseInt(req.query.offset || 1),
      limit: parseInt(req.query.limit || 100),
    }).then(result => {
      responder.ok(req, res, {
        accounts: result.rows
      })
    })

    next()
  }

  count(req, res, next) {
    accounts.all().then(result => {
      responder.ok(req, res, {
        count: result.count,
      })
    })

    next()
  }
}

module.exports = new WalletsController()
