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
            body: (new Error('should be a post request')).toString()
        })
    }

    var req = JSON.parse(ev.body)

    var { password, user } = req
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    // check that savedPw === hash(req.pw)
    var ok = password && pwds.reduce((acc, pwdHash) => {
        // return true if any of them match
        return (acc || bcrypt.compare(password, pwdHash))
    }, false)

    // if equal, write a follow msg to the DB
    //   { type: 'follow', contact: userId }
    if (ok) {
        // in here, write to DB
        return client.query(
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
                // console.log('errrrr', err)
                // console.log('eeerrrppppp', err)
                return cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
    } else {
        // they don't have the 'master' password, so check the DB invitations

        // TODO -- in here, do the DB lookup for the `code`
        console.log('****hhhhhhhhh***')

    }

    return cb(null, {
        statusCode: 401,
        body: (new Error('Invalid password')).toString()
    })
}
