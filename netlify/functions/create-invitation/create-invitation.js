require('dotenv').config()
var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')
// var pwds = require('../passwords.json')
// var bcrypt = require('bcrypt')
var q = faunadb.query
var crypto = require('crypto')

exports.handler = function (ev, ctx, cb) {
    // check that method is POST
    if (ev.httpMethod !== 'POST') {
        return cb(null, {
            statusCode: 400,
            body: (new Error('should be a post request')).toString()
        })
    }

    var req = JSON.parse(ev.body)
    var { publicKey, msg } = req

    // check that the message is valid, that is really came from
    // who it says it did

    // msg needs `signature` field
    // could be like {
        // previous: null
        // author: "@abc",
        // content: { type: 'create-invite' },
        // signature: 123
    // }
    var isValid
    try {
        isValid = ssc.verifyObj(publicKey, null, msg)
    } catch(err) {
        console.log('errrrr', err)
        return cb(null, {
            statusCode: 400,
            body: err.toString()
        })
    }

    if (!isValid) {
        return cb(null, {
            statusCode: 400,
            body: new Error('Invalid message').toString()
        })
    }

    // check whether we are following the id in the req
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    client.query(
        q.Get(
            q.Match(q.Index('server-following-who'), msg.author)
        )
    ).then(() => {
        // we are following them, so create the invitation
        // using 10 bytes because 10 seems like a nice number
        var code = crypto.randomBytes(10).toString('hex')

        client.query(
            q.Create(q.Collection('invitations'), {
                data: { type: 'invitation', code: code }
            })
        )
            .then(() => {
                return cb(null, {
                    statusCode: 200,
                    body: JSON.stringify({
                        ok: true,
                        code: code
                    })
                })
            })
            .catch(err => {
                return cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
    })
    .catch(err => {
        // you are not following them, so don't create an invitation
        console.log('oh invitation narrr', err)
        return cb(null, {
            statusCode: 400,
            body: err.toString()
        })
    })

}

