const pg = require('pg-promise')({ promiseLib: require('bluebird') })
const db = pg('postgres://postgres:postgres@192.168.1.18:5432/soketi')

module.exports = db