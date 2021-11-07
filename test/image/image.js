var createHash = require('../../netlify/functions/create-hash')
var fs = require('fs')
var caracal = fs.readFileSync(__dirname + '/../caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')

module.exports = function imageTests (test) {
    test('create hash', t => {
        var hash = createHash(base64Caracal)
        console.log('hash', hash)
        t.ok(hash, 'should create a hash')
        t.equal(hash, '7602e0d96bdcb35fc90e085840fcbe8873d8ce342efe7ec24a446b269093eb47',
            'should create the right hash')
        t.end()
    })
}
