require('dotenv').config()
require('isomorphic-fetch')
var ssc = require('@nichoth/ssc')
var Client = require('../../src/client')
var client = Client()

module.exports = function invitationTests (test) {
    var keys = ssc.createKeys()
    var userOneKeys = ssc.createKeys()

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

    var code
    test('create an invitation when the server does follow you', t => {
        client.followMe(keys, process.env.TEST_PW)
            .then(() => client.createInvitation(keys))
            .then(res => {
                t.pass('should get an ok response')
                t.ok(res.code, 'should return an invitation code')
                code = res.code
                t.end()
            })
            .catch(err => {
                t.fail('should not get an error')
                t.end()
            })
    })

    test('redeem an invalid invitation', t => {
        client.redeemInvitation(userOneKeys, 'bad-code')
            .then(() => {
                t.fail('should not get an ok response')
                t.end()
            })
            .catch(err => {
                t.pass('should get an error response')
                t.ok(err.includes('Invalid invitation'),
                    'should return the right error message')
                t.end()
            })
    })

    test('use a good invitation', t => {
        client.redeemInvitation(userOneKeys, code)
            .then(res => {
                t.pass('should redeem the invitation')
                t.equal(res.contact, userOneKeys.id,
                    'should return the right message')
                t.end()
            })
            .catch(() => {
                t.fail('should not get an error')
                t.end()
            })
    })
}
