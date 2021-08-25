var ssc = require('@nichoth/ssc')
var abouts = require('@nichoth/ssc-fauna/abouts')

// return the most recent 'about' msg
exports.handler = async function (ev, ctx) {
    var lastAboutMsg = null

    if (ev.httpMethod === 'GET') {
        // return the head of the about messages
        var author = ev.queryStringParameters.author

        return abouts.get(author)
            .then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(res)
                }
            })
            .catch(err => {
                console.log('boooooooooo', err)
                t.error(err)
                t.end()
            })
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
        // try {
        //     var lastAboutMsg = await client.query(
        //         q.Get(
        //             q.Match(q.Index('about-author'), '@' + keys.public)
        //         )
        //     );
        // } catch (err) {
        //     if (err.message === 'instance not found') {
        //         // this means it's a new string of 'about' msgs
        //         // and there is no ancestor
        //         var lastAboutMsg = null
        //     } else {
        //         return {
        //             statusCode: 422,
        //             body: JSON.stringify({
        //                 ok: false,
        //                 error: err,
        //                 message: err.message
        //             })
        //         }
        //     }
        // }

        try {
            var isValid = ssc.verifyObj(keys, lastAboutMsg || null, msg)
        } catch (err) {
            console.log('!!!!!not isvalid!!!!!!', isValid, err)
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


        return abouts.post(keys, msg)
            .then((res) => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(res)
                }
            })
            .catch(err => {
                console.log('***** err', err)
                return {
                    statusCode: 500,
                    body: err.toString()
                }
            })
    }
}
