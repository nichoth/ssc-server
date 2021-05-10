
exports.handler = function (ev, ctx, cb) {

    var file = ev.body

    console.log('**file**', file)

    return cb(null, {
        statusCode: 200,
        body: JSON.stringify({
            ok: true,
            message: 'ok woo'
        })
    })

}
