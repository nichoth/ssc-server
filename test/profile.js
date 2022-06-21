require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
const BASE = 'http://localhost:8888'
// var createHash = require('create-hash')
// const { v4: uuidv4 } = require('uuid')
const u = require('./util')
const { getHash } = require('@nichoth/multihash')

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
        ntl.kill()
        t.end()
    })
}

module.exports = profileTests

function profileTests (test, keys, did) {
    // keys here is admin
    const imgExample = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

    // var hash
    // let _hash = createHash('sha256')
    // _hash.update(imgExample)
    // hash = _hash.digest('base64')

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
                console.log('ressssssssss', res)
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

    test('follow someone then save a profile for them', t => {
        var _user
        ssc.createKeys()
            .then(user => {
                _user = user
                return u.inviteAndFollow({ adminKeys: keys, user, userProfile: {
                    username: 'aaa',
                } })
            })
            .then(() => {
                // console.log('respondingggggggggggg', res)
                return ssc.createMsg(_user.keys, null, {
                    type: 'about',
                    about: _user.did,
                    username: 'alice',
                    desc: null,
                    image: hash
                })
            })
            .then(profileMsg => {
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
                console.log('respnseeeeeeeeeeeeeee', res)
                t.end()
            })
    })

//     test('follow someone then save a profile for them', t => {
//         const code = did + '--' + uuidv4()
//         var alice

//         // ssc.createMsg(keys, null, { type: 'invitation', code })
//         //     .then(msg => {
//         //         return fetch(BASE + '/.netlify/functions/invitation', {
//         //             method: 'POST',
//         //             headers: { 'Content-Type': 'application/json' },
//         //             body: JSON.stringify(msg)
//         //         })
//         //         .then(res => {
//         //             t.ok(res.ok, 'should create an invitation')
//         //             return ssc.createKeys()
//         //         })
//         //         .then(_alice => {
//         //             alice = _alice
//         //             return ssc.exportKeys(_alice.keys)
//         //         })
//         //         .then(exported => {
//         //             const aliceDid = ssc.publicKeyToDid(exported.public)

//         //             return Promise.all([
//         //                 ssc.createMsg(alice.keys, null, {
//         //                     type: 'redemption',
//         //                     inviter: did,
//         //                     code
//         //                 }),

//         //                 ssc.createMsg(alice.keys, null, {
//         //                     type: 'follow',
//         //                     contact: did
//         //                 }),

//         //                 ssc.createMsg(alice.keys, null, {
//         //                     type: 'about',
//         //                     about: aliceDid,
//         //                     username: 'alice',
//         //                     desc: null,
//         //                     image: hash
//         //                 })
//         //             ])
//         //         })
//         //         .then(([redemption, follow, profile]) => {
//         //             return fetch(BASE + '/api/redeem-invitation', {
//         //                 method: 'POST',
//         //                 headers: { 'Content-Type': 'application/json' },
//         //                 body: JSON.stringify({
//         //                     redemption,
//         //                     follow,
//         //                     profile,
//         //                     file
//         //                 })
//         //             })
//         //         })
//         //         .then(res => {
//         //             if (!res.ok) {
//         //                 t.fail()
//         //                 t.end()
//         //                 return
//         //             }

//         //             return ssc.createMsg(alice.keys, null, {
//         //                 type: 'about',
//         //                 about: alice.did,
//         //                 username: 'test-save-profile',
//         //                 desc: null,
//         //                 image: hash
//         //             })
//         //         })

//         ssc.createKeys().then(user => {

//             // u.inviteAndFollow({ adminKeys: keys, user })
//             //     .then(res => {
//             //         console.log('profilemsg*****', res)
//             //         if (res.ok) {
//             //             return res.json()
//             //         }
//             //         return res.text().then(text => console.log('text', text))
//             //     })
//             //     .then(profileMsg => {
//             //         return fetch(BASE + '/api/profile', {
//             //             method: 'POST',
//             //             headers: { 'Content-Type': 'application/json' },
//             //             body: JSON.stringify({
//             //                 msg: profileMsg,
//             //                 file
//             //             })
//             //         })
//             //     })
//             //     .then(res => {
//             //         console.log('statussssssssss', res.status)
//             //         if (!res.ok) {
//             //             return res.text().then(text => {
//             //                 t.fail(text)
//             //                 return t.end()
//             //             })
//             //         }
//             //         return res.json()
//             //     })
//             //     .then(json => {
//             //         const { db } = json
//             //         // console.log('response from db', db)
//             //         t.equal(db.value.content.username, 'test-save-profile',
//             //             'should update a profile for a user')
//             //         t.end()
//             //     })

//         })
//     })
}
