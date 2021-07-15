// var ssc = require('@nichoth/ssc')
var abouts = require('@nichoth/ssc-fauna/abouts')

exports.handler = async function (ev, ctx) {
    var name = ev.queryStringParameters.name

    return abouts.getByName(name)
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
