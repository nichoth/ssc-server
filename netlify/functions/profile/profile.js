var ssc = require('@nichoth/ssc')
// var abouts = require('@nichoth/ssc-fauna/abouts')
var profile = require('@nichoth/ssc-fauna/profile')

// return the most recent 'about' msg
exports.handler = async function (ev, ctx) {
    var lastAboutMsg = null

    // ------------ GET --------------------------------

    if (ev.httpMethod === 'GET') {
        // return the head of the about messages
        // var author = ev.queryStringParameters.author
    }

    // ------------ /GET --------------------------------

    // ------------------------ POST --------------------------
    if (ev.httpMethod === "POST") {
        try {
            var { keys, msg, file } = JSON.parse(ev.body)
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

        // profile.post(keys.id, null, msg)
        return profile.post(keys.id, file || null, msg)
            .then(res => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(res)
                }
            })

        // ------------------------ /POST --------------------------
    }

    return {
        statusCode: 400,
        body: 'Invalid http method'
    }
}

