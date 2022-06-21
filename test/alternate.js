require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
// const BASE = 'http://localhost:8888'
// const u = require('./util')
const Alternate = require('../src/client/alternate')

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
                // console.log('exit')
            })

            t.end()
        })
    })

    test('alternates', t => {
        alt(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        ntl.kill()
        t.end()
    })
}

module.exports = alt

const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

function alt (test, keys, did) {
    // keys here is for the 'admin' user
    test('save a new alt/profile for an admin', t => {
        ssc.createKeys().then(async user => {

            const profile = {
                username: 'test-user',
                image: file
            }

            return Alternate.create({
                ssc,
                keystore: keys,
                newKeystore: user.keys,
                profile
            })

        })
            .then(async res => {
                const did = await ssc.getDidFromKeys(keys) 
                t.equal(did, res.alt.value.content.from,
                    "should have the correct 'from' user in the message")
                t.ok(res.alt, 'should return alternate message')
                t.ok(res.profile, 'should return the new profile')
                t.end()
            })
    })
}



// function alt (test, keys, did) {
//     // keys here is for the 'admin' user
//     // (the one creating an alt)
//     test('save an alt message as an admin', t => {
//         ssc.createMsg(keys, null, {
//             type: 'alternate',
//             from: did,
//             to: '123'
//         }).then(msg => {
//             fetch(BASE + '/.netlify/functions/alternate', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ altMsg: msg })
//             }).then(res => {
//                 if (!res.ok) {
//                     res.text().then(text => {
//                         console.log('errrrrrrrrrrr', text)
//                         t.fail()
//                         return t.end()
//                     })
//                 }
//                 return res.json()
//             }).then(res => {
//                 t.equal(res.key, ssc.getId(res.value),
//                     'should return the expected key')
//                 t.equal(res.value.content.to, '123',
//                     'should have the right "to" in msg content')
//                 t.equal(res.value.content.type, 'alternate',
//                     'should return the right message type')
//                 t.end()
//             })
//         })
//     })

//     test('save an alt message as a random user', t => {
//         ssc.createKeys().then(user => {
//             return ssc.createMsg(user.keys, null, {
//                 type: 'alternate',
//                 from: user.did,
//                 to: '123'
//             })
//         })
//             .then(msg => {
//                 return fetch(BASE + '/.netlify/functions/alternate', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(msg)
//                 })
//             })
//             .then(res => {
//                 t.notOk(res.ok, 'should not return an ok response')
//                 t.equal(res.status, 403, 'should return 403 code')
//                 t.end()
//             })
//     })

//     test('save an alternate message as a standard user', t => {
//         ssc.createKeys()
//             .then(user => {
//                 return u.inviteAndFollow({ adminKeys: keys, user })
//             })
//             .then(() => {
//                 return ssc.createMsg(keys, null, {
//                     type: 'alternate',
//                     from: did,
//                     to: '123'
//                 })
//             })
//             .then(msg => {
//                 return fetch(BASE + '/api/alternate', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(msg)
//                 })
//             })
//             .then(res => {
//                 t.ok(res.ok, 'should return an ok response')
//                 t.end()
//             })
//     })
// }
