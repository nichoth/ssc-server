require('dotenv').config()
var faunadb = require('faunadb')
var pwds = require('../passwords.json')
var bcrypt = require('bcrypt')
var q = faunadb.query

exports.handler = function (ev, ctx, cb) {
    // check that method is POST
    if (ev.httpMethod !== 'POST') {
        return cb(null, {
            statusCode: 400,
            body: (new Error('should be a POST request')).toString()
        })
    }

    var req
    try {
        req = JSON.parse(ev.body)
    } catch (err) {
        console.log('**json err**', err)
    }

    var { password, user } = req
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    // check that savedPw === hash(req.pw)
    var ok = password && pwds.reduce((acc, pwdHash) => {
        // return true if any of them match
        return (acc || bcrypt.compare(password, pwdHash))
    }, false)

    // ok.then(ok.then(_ok => {
    //     console.log('aaaaaaaaaaaaaa', _ok)
    // }))

    ok.then(isOk => {
        // if equal, write a follow msg to the DB
        //   { type: 'follow', contact: userId }
        if (isOk) {
            // in here, write to DB
            client.query(
                q.Create(q.Collection('server-following'), {
                    data: { type: 'follow', contact: user }
                })
            )
                .then(res => {
                    return cb(null, {
                        statusCode: 200,
                        body: JSON.stringify(res.data)
                    })
                })
                .catch(err => {
                    // in here, handle the case where it is an existing user
                    // (we are already following them)
                    // should return a success in that case
                    // console.log('eeerrrppppp', err)
                    return cb(null, {
                        statusCode: 500,
                        body: err.toString()
                    })
                })

            return 
        } else {
            // they don't have the 'master' password, so check the DB invitations

            console.log('**TODO -- lookup in the DB if they have been invited**')

            return cb(null, {
                statusCode: 401,
                body: (new Error('Invalid password')).toString()
            })
        }

        // return cb(null, {
        //     statusCode: 401,
        //     body: (new Error('Invalid password')).toString()
        // })
    })

}
