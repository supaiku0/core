const container = require('@arkecosystem/core-container')
const logger = container.resolvePlugin('logger')
const { camelCase, upperFirst } = require('lodash')
const escape = require('./utils/escape')

class SqlBuilder {
  /**
   * Build the clauses.
   * @param  {Object} clauses
   * @return {String}
   */
  build (clauses) {
    this.__replacements = []

    const clauseOrder = [
      'select', 'from', 'where',
      'groupBy', 'orderBy', 'limit', 'offset'
    ]

    const query = clauseOrder
      .map(clause => {
        if (!clauses[clause]) {
          return false
        }

        return this[`__build${upperFirst(camelCase(clause))}`](clauses)
      })
      .filter(item => !!item)
      .join('')
      .trim()

    logger.info(`Query: ${query}`);

    return { query, replacements: this.__replacements }
  }

  /**
   * Build the "SELECT" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildSelect (clauses) {
    const columns = clauses.select.columns
      .map(column => escape(column))

    const aggregates = clauses.select.aggregates
      .map(column => column)

    return `SELECT ${columns.concat(aggregates).join(',')} `
  }

  /**
   * Build the "FROM" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildFrom (clauses) {
    return `FROM ${escape(clauses.from)} `
  }

  /**
   * Build the "WHERE" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildWhere (clauses) {
    const map = (item) => {
      if (item.hasOwnProperty('from') && item.hasOwnProperty('to')) {
        this.__replacements.push(item.from)
        this.__replacements.push(item.to)

        return `${escape(item.column)} ${item.operator} ? AND ?`
      }

      if (['IN', 'NOT IN'].includes(item.operator)) {
        if (Array.isArray(item.value)) {
          item.value = item.value.map(value => {
            this.__replacements.push(value)
            return '?'
          }).join(',')
        }

        return `${escape(item.column)} ${item.operator} (${item.value})`
      }

      if (['IS NULL', 'IS NOT NULL'].includes(item.operator)) {
        return `${escape(item.column)} ${item.operator}`
      }

      this.__replacements.push(item.value)
      return `${escape(item.column)} ${item.operator} ?`
    }

    const andQuery = Object
      .values(clauses.where.and)
      .map(item => map(item))
      .join(' AND ')

    const orQuery = Object
      .values(clauses.where.or)
      .map(item => map(item))
      .join(' OR ')

    if (!andQuery && !orQuery) {
      return ''
    }

    let query = 'WHERE '

    if (andQuery) {
      query += andQuery
    }

    if (orQuery) {
      query += ` OR ${orQuery}`
    }

    return `${query} `
  }

  /**
   * Build the "GROUP BY" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildGroupBy (clauses) {
    return `GROUP BY "${clauses.groupBy}" `
  }

  /**
   * Build the "ORDER BY" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildOrderBy (clauses) {
    const values = Object
      .values(clauses.orderBy)
      .map(item => `${escape(item.column)} ${item.direction.toUpperCase()}`)

    return `ORDER BY ${values.join(',')} `
  }

  /**
   * Build the "LIMIT" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildLimit (clauses) {
    return `LIMIT ${clauses.limit} `
  }

  /**
   * Build the "OFFSET" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildOffset (clauses) {
    return `OFFSET ${clauses.offset} `
  }
}

module.exports = new SqlBuilder()
