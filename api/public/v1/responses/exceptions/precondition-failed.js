const response = require('../response')

class PreconditionFailedHttpException {
    send(req, res, data)
    {
        response.send(req, res, Object.assign(data, {
            success: false
        }), 412)
    }
}

module.exports = new PreconditionFailedHttpException
