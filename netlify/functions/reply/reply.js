require('dotenv').config()
const ssc = require('@nichoth/ssc-lambda')
const faunadb = require('faunadb')
const serverFollows = require('../server-follows')
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})


// admin vs new user vs server


exports.handler = function (ev, ctx) {
    if (ev.httpMethod !== 'POST') return {
        statusCode: 405,
        body: 'bad http method'
    }

    var msg
    try {
        msg = JSON.parse(ev.body)
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid json'
        }
    }

    // console.log('the reply messageeeee', msg)
    const did = ssc.getAuthor(msg)

    return serverFollows(did)
        .then(follows => {
            if (!follows) {
                console.log('followwwwwwwwwwwws', follows, did)

                return {
                    statusCode: 403,
                    body: 'not allowed'
                }
            }

            // server does follow them, write the post
            const key = ssc.getId(msg)
            return writeMsg(key, msg)
        })
        .then(msg => {
            return {
                statusCode: 200,
                body: JSON.stringify(msg)
            }
        })
        .catch(err => {
            return {
                statusCode: 500,
                body: err.toString()
            }
        })

}

function writeMsg (key, msg) {
    return client.query(
        q.Create(
            q.Collection('reply'),
            { data: { key, value: msg } }
        )
    )
        .then(res => {
            return Object.assign(res.data, {
                value: Object.assign(res.data.value, {
                    previous: (res.data.value.previous || null)
                })
            })
        })
}
