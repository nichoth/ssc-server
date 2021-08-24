var base = 'http://localhost:8888'
require('dotenv').config()
require('isomorphic-fetch')
// var fs = require('fs')
// var caracal = fs.readFileSync(__dirname + '/../caracal.jpg')
// let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')
// var createHash = require('crypto').createHash
var ssc = require('@nichoth/ssc')
var Client = require('../../src/client')
var client = Client()

// var hash = createHash('sha256')
// hash.update(base64Caracal)
// var fileHash = hash.digest('base64')

module.exports = function invitationTests (test) {
    var keys = ssc.createKeys()
    // var userOneKeys = ssc.createKeys()
    // var userTwoKeys = ssc.createKeys()
    // var ks = { keys, userOneKeys, userTwoKeys }

    test('create an invitation if the server doesnt follow you', t => {
        client.createInvitation(keys)
            .then(res => {
                console.log('**invitation create**', res)
                t.fail('should not get an ok response')
                t.end()
            })
            .catch(() => {
                t.pass('should get an error b/c the server doesnt follow us')
                t.end()
            })
    })

    test('create an invitation when the server does follow you', t => {
        client.followMe(keys, process.env.TEST_PW)
            .then(() => client.createInvitation(keys))
            .then(res => {
                t.pass('should get an ok response')
                t.ok(res.code, 'should return an invitation code')
                t.end()
            })
            .catch(err => {
                t.fail('should not get an error')
                t.end()
            })
    })
}
