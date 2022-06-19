require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
// const faunadb = require('faunadb')
const { getLatest } = require('./feed')
// var createHash = require('create-hash')
// const upload = require('../upload')
// var q = faunadb.query
// var client = new faunadb.Client({
//     secret: process.env.FAUNADB_SERVER_SECRET
// })
const { admins } = require('../../../src/config.json')


exports.handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') return {
        statusCode: 405,
        body: 'bad http method'
    }

    // is a POST request
    var msg, files
    try {
        const body = JSON.parse(ev.body)
        msg = body.msg
        files = body.files
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    const msgAuthor = ssc.getAuthor(msg)

    getLatest(author).then(lastMsg => {

    })
    
    // need to get the `prev` message from the DB, and check it against the
    // new message

    return {
        statusCode: 400,
        body: 'aaa'
    }
}