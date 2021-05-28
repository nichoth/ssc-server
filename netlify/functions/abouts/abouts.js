var faunadb = require('faunadb')
var ssc = require('@nichoth/ssc')

// return the most recent 'about' msg
exports.handler = async function (ev, ctx) {
    var q = faunadb.query
    var client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })

    if (ev.httpMethod === 'GET') {
        // return the head of the about messages
        var author = ev.queryStringParameters.author

        console.log('***author***', author)

        try {
            var lastAboutMsg = await client.query(
                q.Get(
                    q.Match(q.Index('about-by-author-five'), author)
                )
            );
        } catch (err) {
            if (err.message === 'instance not found') {
                // this means it's a new string of 'about' msgs
                // and there is no ancestor
                console.log('~~~ not found ~~~~~')
                var lastAboutMsg = null
            } else {
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        ok: false,
                        error: err,
                        message: err.message
                    })
                }
            }
        }

        console.log('***last about msg***', lastAboutMsg)

        return {
            statusCode: 200,
            body: JSON.stringify({
                ok: true,
                msg: (lastAboutMsg && lastAboutMsg.data)
            })
        }
    }

    if (ev.httpMethod === "POST") {
        try {
            var { keys, msg } = JSON.parse(ev.body)
        } catch (err) {
            console.log('invalid json', err)
            return {
                statusCode: 422,
                body: JSON.stringify({
                    ok: false,
                    error: 'invalid json',
                    message: err.message
                })
            }
        }

        // get an existing about feed
        // to check if the merkle list matches up
        try {
            var lastAboutMsg = await client.query(
                q.Get(
                    q.Match(q.Index('about-author'), '@' + keys.public)
                )
            );
        } catch (err) {
            if (err.message === 'instance not found') {
                // this means it's a new string of 'about' msgs
                // and there is no ancestor
                var lastAboutMsg = null
            } else {
                return {
                    statusCode: 422,
                    body: JSON.stringify({
                        ok: false,
                        error: err,
                        message: err.message
                    })
                }
            }
        }

        try {
            var isValid = ssc.verifyObj(keys, lastAboutMsg || null, msg)
        } catch (err) {
            console.log('not isvalid', isValid, err)
            return {
                statusCode: 422,
                body: JSON.stringify({
                    ok: false,
                    error: err,
                    message: msg
                })
            }
        }

        if (!isValid) {
            console.log('!!!!invalid!!!!', isValid)
            return {
                statusCode: 422,
                body: JSON.stringify({
                    ok: false,
                    error: new Error('invalid message'),
                    message: msg
                })
            }
        }

        // write a new 'about' msg
        var msgHash = ssc.getId(msg)
        return client.query(
            q.Create(q.Collection('abouts'), {
                data: { value: msg, key: msgHash }
            })
        )
            .then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        ok: true,
                        message: res.data
                    })
                }
            })
            .catch(err => {
                console.log('errrr', err)
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        ok: false,
                        message: err.message
                    })
                }
            })
           
    }
}

