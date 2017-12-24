const blockchain = require(__root + 'core/blockchainManager')
const config = require(__root + 'core/config')
const responder = require(__root + 'api/responder')
const blocks = require(__root + 'repositories/blocks')
const transactions = require(__root + 'repositories/transactions')
const Paginator = require(__root + 'api/paginator')

class BlocksController {
  index(req, res, next) {
    let page = parseInt(req.query.page || 1)
    let perPage = parseInt(req.query.perPage || 100)

    blocks.paginate({}, page, perPage).then(result => {
      const paginator = new Paginator(req, result.count, page, perPage)

      responder.ok(req, res, {
        data: result.rows,
        links: paginator.links(),
        meta: Object.assign(paginator.meta(), {
          count: result.count
        }),
      })
    })

    next()
  }

  search(req, res, next) {
    responder.notImplemented('Method has not yet been implemented.');

    next()
  }

  show(req, res, next) {
    blocks.findById(req.params.id).then(result => {
      responder.ok(req, res, {
        data: result
      })
    })

    next()
  }

  transactions(req, res, next) {
    blocks.findById(req.params.id).then(result => {
      const page = parseInt(req.query.page || 1)
      const perPage = parseInt(req.query.perPage || 100)

      transactions.paginate({
        where: {
          blockId: result.id
        }
      }, page, perPage).then(result => {
        const paginator = new Paginator(req, result.count, page, perPage)

        responder.ok(req, res, {
          data: result.rows,
          links: paginator.links(),
          meta: Object.assign(paginator.meta(), {
            count: result.count
          }),
        })
      })
    })

    next()
  }
}

module.exports = new BlocksController
