require('dotenv').config()
var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')
// var pwds = require('../passwords.json')
// var bcrypt = require('bcrypt')
var q = faunadb.query
// var crypto = require('crypto')

exports.handler = function (ev, ctx, cb) {
    // check that method is POST
    if (ev.httpMethod !== 'POST') {
        return cb(null, {
            statusCode: 400,
            body: (new Error('should be a post request')).toString()
        })
    }

    var req = JSON.parse(ev.body)
    var { publicKey, code, signature } = req

    // check that the message is valid, that is really came from
    // who it says it did

    var isValid
    try {
        isValid = ssc.verify({ public: publicKey }, signature, code)
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

    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    // find the random code from the message, if it exists, then follow
    // the user

    // can you del the invitation code, and also follow the user in one
    // atomic transaction?
    client.query(

        q.If(
            // check if we are already following them
            q.Exists(
                q.Match(q.Index('server-following-who'), '@' + publicKey)
            ),

            // we are already following them, do nothing
            'already following',

            // we're not following them yet, so follow them
            q.Do(
                q.Delete(
                    q.Select(
                        ["ref"],
                        q.Get(
                            q.Match( q.Index('invitation-by-code'), code )
                        )
                    )
                ),
                q.Create(q.Collection('server-following'), {
                    data: { type: 'follow', contact: ('@' + publicKey) }
                })
            )

        )

    )
        .then(res => {
            if (res === 'already following') {
                return cb(null, {
                    statusCode: 400,
                    body: 'Already following'
                })
            }
            return cb(null, {
                statusCode: 200,
                body: JSON.stringify(res.data ? res.data : res)
            })
        })
        .catch(err => {
            console.log('errrrrrrrr', err)

            if (err.name === 'NotFound') {
                return cb(null, {
                    statusCode: 400,
                    body: new Error('Invalid invitation').toString()
                })
            }

            return cb(null, {
                statusCode: 500,
                body: err.toString()
            })
        })
}


