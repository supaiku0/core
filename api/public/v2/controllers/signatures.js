const Controller = require('./controller')

class SignaturesController extends Controller {
  index (req, res, next) {
    super.init(req, res, next).then(() => {
      super.respondWith('notImplemented', 'Method has not yet been implemented.')
    })
  }
}

module.exports = new SignaturesController()
