var faunadb = require('faunadb')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.BRANCH ==='test' ?
        process.env.FAUNADB_SERVER_SECRET_TEST :
        process.env.FAUNADB_SERVER_SECRET
})
