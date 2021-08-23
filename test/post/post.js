// require('isomorphic-fetch')
// var base = 'http://localhost:8888'
var fs = require('fs')
var caracal = fs.readFileSync(__dirname + '/../caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')
var createHash = require('crypto').createHash
var ssc = require('@nichoth/ssc')
var Client = require('../../src/client')
var client = Client()

var hash = createHash('sha256')
hash.update(base64Caracal)
var fileHash = hash.digest('base64')

module.exports = function postTests (test) {
    test('a post from someone the server is not following', t => {
        var keys = ssc.createKeys()
        var content = { type: 'test', text: 'foo', mentions: [fileHash] }
        var msg = ssc.createMsg(keys, null, content)
        client.post(keys, msg, base64Caracal)
            .then(res => {
                console.log('resssss', res)
                t.fail('should not get an ok response')
                t.end()
            })
            .catch(err => {
                t.pass('should get an error response')
                t.end()
            })
    })
}
