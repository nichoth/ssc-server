require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const { setup, allDone } = require('./setup')
const BASE = 'http://localhost:8888'
// var createHash = require('create-hash')
// const { v4: uuidv4 } = require('uuid')
const u = require('./util')
const { getHash } = require('@nichoth/multihash')
const Profile = require('../src/client/profile')
// var stringify = require('json-stable-stringify')

const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="
const hash = getHash(file)

if (require.main === module) {
    // keys here is admin
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

    test('profile', t => {
        profileTests(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        allDone(ntl)
        t.end()
    })
}

module.exports = profileTests

function profileTests (test, keys, did) {
    // keys here is admin
    const imgExample = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

    test('save a profile as an admin', t => {
        ssc.createMsg(keys, null, {
            type: 'about',
            about: did,
            username: 'test-user',
            desc: null,
            image: hash
        }).then(msg => {
            fetch(BASE + '/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    msg,
                    file: imgExample
                })
            }).then(res => {
                if (res.ok) return res.json()

                return res.text().then(text => {
                    console.log('***bad response***', text)
                    t.end()
                })
            })
            .then(res => {
                const { image, db } = res
                t.equal(db.value.author, did, 'should a good response from DB')
                t.ok(image.asset_id, 'should have the image in response')
                t.end()
            })
            .catch(err => {
                console.log('errrrrrrrrrrrrr', err)
                t.end()
            })

        })
    })

    test('client.saveProfile', t => {
        ssc.getDidFromKeys(keys)
            .then(did => {
                const user = { did, keys }
                const profile = { username: 'client-user' }

                return Promise.all([
                    Promise.resolve(did),
                    // save: function (ssc, user, prev, profile, file) {
                    Profile.save(ssc, user, null, profile, file)
                ])
            })
            .then(([did, res]) => {
                const { content } = res.db.value
                t.equal(content.username, 'client-user',
                    'should set the right username')

                const pubKey = ssc.didToPublicKey(did).publicKey

                ssc.isValidMsg(res.db.value, null, pubKey)
                    .then(isVal => {
                        t.equal(isVal, true, 'should return a valid message')
                        t.end()
                    })
            })
            .catch(err => {
                console.log('err', err)
                t.fail(err)
                t.end()
            })
    })

    test('save a profile from the admin, but with a bad signature', t => {
        ssc.createMsg(keys, null, {
            type: 'about',
            about: did,
            username: 'test-user',
            desc: null,
            image: hash
        }).then(msg => {
            msg.signature = msg.signature + 'aaaa'

            fetch(BASE + '/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    msg,
                    file: imgExample
                })
            }).then(res => {
                t.equal(res.status, 422, 'should return code 422')
                res.text().then(text => {
                    t.equal(text,  'invalid signature',
                        'should have the expected error message')
                    t.end()
                })
            })
        })
    })


    test('save a profile as a random person', t => {
        ssc.createKeys().then(user => {
            ssc.exportKeys(user.keys).then(exported => {
                const did = ssc.publicKeyToDid(exported.public)

                ssc.createMsg(user.keys, null, {
                    type: 'about',
                    about: did,
                    username: 'random-person',
                    desc: null,
                    image: hash
                }).then(msg => {
                    return fetch(BASE + '/api/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            msg,
                            file: imgExample
                        })
                    }).then(res => {
                        if (res.ok) {
                            t.fail('should return a bad response')
                            t.end()
                            return
                        }
                        t.equal(res.status, 401, 'should return code 401')
                        t.end()
                    })
                })
            })

        })
    })

    var _user
    test('follow someone then save a profile for them', t => {
        ssc.createKeys()
            .then(user => {
                _user = user
                return u.inviteAndFollow({ adminKeys: keys, user, userProfile: {
                    username: 'aaa',
                } })
            })
            .then(() => {
                return ssc.createMsg(_user.keys, null, {
                    type: 'about',
                    about: _user.did,
                    username: 'alice',
                    desc: null,
                    image: hash
                })
            })
            .then(profileMsg => {
                // then we update the profile for the new user
                return fetch(BASE + '/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        msg: profileMsg,
                        file
                    })
                })
            })
            .then(res => {
                t.equal(res.status, 200, 'should have 200 response')
                if (res.ok) return res.json()
                res.text().then(text => {
                    console.log('status', res.status)
                    console.log('boooo', text)
                    t.end()
                })
            })
            .then(json => {
                const msgContent = json.db.value.content
                t.equal(msgContent.username, 'alice',
                    'should set the username')
                t.end()
            })
    })

    test('client.getByName -- get a profile by username', t => {
        Profile.getByName('alice')
            .then(res => {
                const match = res.find(profile => {
                    return profile.value.author === _user.did
                })
                t.ok(match, 'should contain the new user')
                t.equal(res[res.length - 1].value.author, _user.did,
                    'should have the expected did at the end of the array')
                t.end()
            })
            .catch(err => {
                console.log('aaaarrrrrrrrrrrr', err)
                t.fail(err.toString())
                t.end()
            })
    })
}
