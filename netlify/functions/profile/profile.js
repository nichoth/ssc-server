const faunadb = require('faunadb')
const xtend = require('xtend')

var q = faunadb.query
var client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = function (ev, ctx, cb) {
    if (ev.httpMethod === 'GET') {
        const did = ev.queryStringParameters.did

        return client.query(
            q.Get(q.Match(q.Index('profile-by-did'), did))
        )
            .then(doc => {
                const res = xtend(doc.data, {
                    value: xtend(doc.data.value, {
                        content: xtend(doc.data.value.content, {
                            avatar: doc.data.value.content.avatar || null
                        })
                    })
                })

                cb(null, {
                    statusCode: 200,
                    body: JSON.stringify(res)
                })
            })
            .catch(err => {
                console.log('errrrr', err)
                if (err.toString().includes('invalid ref')) {
                    cb(null, {
                        statusCode: 400,
                        body: 'invalid DID'
                    })
                }

                cb(null, {
                    statusCode: 500,
                    body: err.toString()
                })
            })
    }

    cb(null, {
        statusCode: 400,
        body: 'booo'
    })
}
