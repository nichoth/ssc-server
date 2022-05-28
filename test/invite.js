require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
const BASE = 'http://localhost:8888'
const { v4: uuidv4 } = require('uuid');

if (require.main === module) {
    var _keys
    var ntl
    var _did

    test('setup', function (t) {
        setup(t.test, ({ netlify, keys, did }) => {
            ntl = netlify
            _keys = keys
            _did = did

            onExit(() => {
                ntl.kill('SIGINT')
            })

            t.end()
        })
    })

    test('invitations', t => {
        invite(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        ntl.kill()
        t.end()
    })
}


function invite (test, keys, did) {
    // keys here is for the 'admin' user
    test('create an invitaion', t => {
        ssc.createMsg(keys, null, {
            type: 'invitation',
            code: uuidv4()
        }).then(msg => {
            fetch(BASE + '/.netlify/functions/invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            })
                .then(res => {
                    // check http error code
                    if (!res.ok) {
                        res.text().then(text => {
                            console.log('not ok', text)
                            t.fail(text)
                            t.end()
                        })
                    }

                    return res.json()
                })
                .then(res => {
                    if (!res) return
                    t.equal(res.value.content.code, msg.content.code, 
                        'should return the message after writing it')
                    t.end()
                })
        })
    })

}
