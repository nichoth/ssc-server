require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const { setup, allDone } = require('./setup')
const BASE = 'http://localhost:8888'
const Follow = require('../src/client/follow')
const Profile = require('../src/client/profile')
const u = require('./util')

const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

if (require.main === module) {
    var _keys
    var ntl
    var _did

    test('setup', function (t) {
        // keys from `setup` is automatically written to `admins` array
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

    test('follow', t => {
        followTests(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        allDone(ntl)
        t.end()
    })
}

module.exports = followTests

function followTests (test, keys, did) {
    // `keys` here is an admin
    test('create a profile for the admin', t => {
        // save: function (ssc, user, prev, profile, file) {
        Profile.save(ssc, { did, keys }, null, { username: 'adminA' }, file)
            .then(res => {
                t.ok(res.db, 'should create a profile')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })


    test('follow a DID', t => {
        ssc.createMsg(keys, null, {
            type: 'follow',
            contact: '123'  // DID of who you're following
        }).then(msg => {
            return fetch(BASE + '/.netlify/functions/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([msg])
            })
        })
        .then(res => {
            if (!res.ok) {
                res.text().then(text => {
                    t.fail(text)
                    t.end()
                })
            }
            return res.json()
        })
        .then(json => {
            t.equal(json[0].value.author, did,
                'should have the expected author')
            t.equal(json[0].value.content.contact, '123',
                'should return the new follow message')
            t.end()
        })
    })


    test('follow multiple DIDs', t => {
        Promise.all([
            ssc.createMsg(keys, null, {
                type: 'follow',
                contact: '123'  // DID of who you're following
            }),
            ssc.createMsg(keys, null, {
                type: 'follow',
                contact: 'abc'
            })
        ]).then(msgs => {
            return fetch(BASE + '/.netlify/functions/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgs)
            })
        })
            .then(res => {
                if (!res.ok) {
                    res.text().then(text => {
                        t.fail(text)
                        t.end()
                    })
                }
                return res.json()
            })
            .then(json => {
                t.equal(json.length, 2, 'should return the expected number of msgs')
                t.ok(json.every(msg => msg.value.author === did),
                    'should return the expected author')
                t.equal(json[1].value.content.contact, 'abc',
                    'should return follow messages in the expected order')
                t.end()
            })
    })

    var alice
    test('create a new person', t => {
        ssc.createKeys()
            .then(_alice => {
                alice = _alice
                const userProfile = { username: 'alice' }
                return u.inviteAndFollow({ adminKeys: keys, user: alice,
                    userProfile })
            })
            .then(() => {
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test('client.follow', t => {
        Follow.post(ssc, keys, [alice.did])
            .then((res) => {
                t.equal(res[0].value.author, did,
                    'should have the expected message author')
                t.equal(res[0].value.content.contact, alice.did,
                    'should have the correct `contact` in message')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test('client.getFollowing', t => {
        Follow.get(did)
            .then(res => {
                t.equal(res.length, 1, 'should be following 1 person')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test('client.unfollow', t => {
        Follow.unFollow(ssc, keys, [alice.did])
            .then(res => {
                t.equal(res[0].value.author, did,
                    'should return the expected message author')
                t.equal(res[0].value.content.contact, alice.did,
                    'should have the expected message contact')
                t.equal(res[0].value.content.type, 'follow',
                    'should return the deleted "follow" message')
                t.end()
            })
            .catch(err => {
                console.log('errrrrrrrrrrrrrrrrrr')
                t.fail(err)
                t.end()
            })
    })

    test('client.getFollowing', t => {
        Follow.get(did)
            .then(res => {
                t.equal(res.length, 0, 'should not be following anyone')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })
}
