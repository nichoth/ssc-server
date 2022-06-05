require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
const BASE = 'http://localhost:8888'
const { v4: uuidv4 } = require('uuid')
const getRedemptions = require('../src/client/get-redemptions')
const createHash = require('create-hash')

// var baseUrl = 'http://localhost:8888'
// var BASE = (process.env.NODE_ENV === 'test' ? baseUrl : '')

const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="
let _hash = createHash('sha256')
_hash.update(file)
const hash = _hash.digest('base64')

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
    var _code

    // keys here is for the 'admin' user
    test('create an invitaion as an admin', t => {
        const code = _code = uuidv4()

        ssc.createMsg(keys, null, {
            type: 'invitation',
            code
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

    test('create an invitaion as a random person', t => {
        ssc.createKeys().then(user => {
            const { keys } = user

            ssc.createMsg(keys, null, {
                type: 'invitation',
                code: uuidv4()
            })
                .then(msg => {
                    return fetch(BASE + '/.netlify/functions/invitation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(msg)
                    })
                })
                .then(res => {
                    if (res.ok) {
                        t.fail('response should not be ok')
                        t.end()
                    }
                    return res.text()
                })
                .then(res => {
                    if (!res) return
                    t.equal(res, 'invalid DID',
                        'should return the expected error message')
                    t.end()
                })
        })
    })


    test('redeem an invitation with a valid code', t => {
        var _alice
        const inviterDid = did

        let _hash = createHash('sha256')
        _hash.update(file)
        const hash = _hash.digest('base64')

        ssc.createKeys()
            .then(alice => {
                _alice = alice

                return ssc.exportKeys(alice.keys).then(exported => {
                    const aliceDid = ssc.publicKeyToDid(exported.public)
                    const username = 'alice'

                    return Promise.all([
                        ssc.createMsg(alice.keys, null, {
                            type: 'redemption',
                            inviter: inviterDid,
                            code: _code
                        }),

                        ssc.createMsg(alice.keys, null, {
                            type: 'follow',
                            contact: inviterDid
                        }),

                        ssc.createMsg(alice.keys, null, {
                            type: 'about',
                            about: aliceDid,
                            username,
                            desc: null,
                            image: hash
                        })
                    ])
                })
            })
            .then(([msg, follow, profile]) => {
                fetch(BASE + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        redemption: msg,
                        follow,
                        profile,
                        file
                    })
                })
                    .then(res => {
                        if (!res.ok) {
                            return res.text().then(text => {
                                t.fail(text)
                                t.end()
                                return
                            })
                        }

                        return res.json()
                    })
                    .then(res => {
                        if (!res) return
                        t.equal(res.value.content.type, 'about',
                            "should return 'about' message")
                        t.equal(res.value.content.about, _alice.did,
                            'should follow the right person')
                        t.end()
                    })
            })
    })


    test('redeem the same invitation code more than once', t => {
        const inviterDid = did

        var alice
        ssc.createKeys()
            .then(_alice => {
                alice = _alice
                return ssc.exportKeys(_alice.keys)
            }).then(exported => {
                const aliceDid = ssc.publicKeyToDid(exported.public)
                const username = 'alice'

                return Promise.all([
                    ssc.createMsg(alice.keys, null, {
                        type: 'redemption',
                        code: _code
                    }),

                    ssc.createMsg(alice.keys, null, {
                        type: 'follow',
                        contact: inviterDid
                    }),

                    ssc.createMsg(alice.keys, null, {
                        type: 'about',
                        about: aliceDid,
                        username,
                        desc: null,
                        image: hash
                    })
                ])
            })
            .then(([msg, follow, profile]) => {
                return fetch(BASE + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        redemption: msg,
                        follow,
                        profile,
                        file
                    })
                })
            })
            .then(res => {
                if (res.ok) {
                    t.fail('should not have an ok response')
                    t.end()
                    return
                }

                t.equal(res.status, 404, 'should return 404 code')
                return res.text()
            })
            .then(text => {
                if (!text) return
                t.ok(text.includes('not found'),
                    'should return a not found message')
                t.end()
            })
    })


    test('redeem an invitation with a bad code', t => {
        const inviterDid = did
        var alice

        ssc.createKeys()
            .then(_alice => {
                alice = _alice
                return ssc.exportKeys(_alice.keys)
            })
            .then(exported => {
                const aliceDid = ssc.publicKeyToDid(exported.public)
                const username = 'alice-two'

                return Promise.all([
                    ssc.createMsg(alice.keys, null, {
                        type: 'redemption',
                        code: _code
                    }),

                    ssc.createMsg(alice.keys, null, {
                        type: 'follow',
                        contact: inviterDid
                    }),

                    ssc.createMsg(alice.keys, null, {
                        type: 'about',
                        about: aliceDid,
                        username,
                        desc: null,
                        image: hash
                    })
                ])
            })
            .then(([msg, follow, profile]) => {
                return fetch(BASE + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        redemption: msg,
                        follow,
                        profile,
                        file
                    })
                })
            })
            .then(res => {
                if (res.ok) {
                    t.fail('should not be an ok response')
                    t.end()
                    return
                }

                t.equal(res.status, 404,
                    'should return a 404 code because the invitation code ' +
                        'does not exist'
                )
                return res.text()
            })
            .then(text => {
                if (!text) return
                t.ok(text.includes('invitation not found'),
                    'should return the right message')
                t.end()
            })
    })

    test('the admin gets redemptions', t => {
        getRedemptions(did).then(res => {
            t.equal(res.value.content.code, _code, 'should have the right code')
            t.equal(res.value.content.inviter, did,
                'should have the right inviter')
            t.end()
        })
    })
}
