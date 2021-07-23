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


    // in real life this would need to be a DB operation so that
    // you can delete a password after it has been used once


    // check that savedPw === hash(req.pw)
    var ok = pwds.reduce((acc, pwdHash) => {
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
                // console.log('errrrr', err)
                return cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
    }

    return cb(null, {
        statusCode: 401,
        body: (new Error('Invalid password')).toString()
    })
}
