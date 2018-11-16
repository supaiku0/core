const { TRANSACTION_TYPES } = require('../../../constants')
const transaction = require('./base')

module.exports = joi => ({
  name: 'arkTransfer',
  base: transaction(joi).append({
    type: joi.number().valid(TRANSACTION_TYPES.VOTE),
    amount: joi.alternatives().try(joi.bignumber(), joi.number().valid(0)),
    asset: joi
      .object({
        votes: joi
          .array()
          .items(
            joi
              .string()
              .length(67)
              .regex(/^(\+|-)[a-zA-Z0-9]+$/),
          )
          .length(1)
          .required(),
      })
      .required(),
  }),
})