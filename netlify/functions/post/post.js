require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
var createHash = require('create-hash')
const upload = require('../upload')
var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})
const { admins } = require('../../../src/config.json')


exports.handler = async function (ev, ctx) {
    if (ev.httpMethod === 'GET') {
    }

    if (ev.httpMethod !== 'POST') return {
        statusCode: 405,
        body: 'bad http method'
    }

    // is a POST request
    var msg, file
    try {
        const body = JSON.parse(ev.body)
        msg = body.msg
        file = body.file
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

}