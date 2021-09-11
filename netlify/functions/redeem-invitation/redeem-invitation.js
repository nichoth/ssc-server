require('dotenv').config()
var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')
var bcrypt = require('bcrypt')
var q = faunadb.query
var pwds = require('../passwords.json')
var blocks = require('../block.json')

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

    var isBlocked = blocks.reduce((acc, val) => {
        return (acc || (val === '@' + publicKey))
    }, false)

    if (isBlocked) {
        return cb(null, {
            statusCode: 401,
            body: 'This id has been banished'
        })
    }

    // check that the message is valid, that it really came from
    // who it says it did

    var isValid
    try {
        isValid = ssc.verify({ public: publicKey }, signature, code)
    } catch(err) {
        console.log('errrrr in redeption', err)
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

    var comparisons = pwds.map(pwd => bcrypt.compare(code, pwd))
    Promise.all(comparisons)
        .then(res => {
            return (code && res.reduce((acc, comparison) => {
                return (acc || comparison)
            }, false))
        })
        .then(ok => {
            if (ok) {
                follow()
            } else {
                checkCodes()
            }
        })
        .catch(err => {
            console.log('aaaaaaaaaa', err)
        })

    // console.log('**it is ok***', ok.then(aaa => console.log('aaaaa', aaa)))

    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    function follow () {
        var doc = {
            data: { type: 'follow', contact: ('@' + publicKey) }
        }

        return client.query(
            q.Create(q.Collection('server-following'), doc)
        )
            .then(res => {
                cb(null, {
                    statusCode: 200,
                    body: JSON.stringify(res.data || res)
                })
            })
            .catch(err => {
                console.log('aaaaargggg', err)
                cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })

    }

    function checkCodes () {
        // its not a saved password, so query the DB, to check if it is
        // a user-created invitation
        return client.query(

            q.If(
                // check if we are already following them
                q.Exists(
                    q.Match(q.Index('server-following-who'), '@' + publicKey)
                ),

                // we are already following them, do nothing
                'Already following',

                // we're not following them yet, so follow them
                q.Do(
                    q.Delete(
                        // delete the invitation since it was used once now
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
                if (res === 'Already following') {
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

}
