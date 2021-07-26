var fs = require('fs')
require('dotenv').config()
require('isomorphic-fetch')
var test = require('tape')
var base = 'http://localhost:8888'


test('follow me', t => {
    t.plan(3)

    fetch(base + '/.netlify/functions/follow-me', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: keys.id,
            password: process.env.TEST_PW
        })
    })
        .then(res => {
            res.json().then(json => {
                t.equal(json.type, 'follow', 'should return the message')
                t.equal(json.contact, keys.id, 'should return the right id')
            })
        })
        .catch(err => {
            console.log('errrrrrr', err)
            e.error(err)
        })

    // we follow userTwo here also just because the later tests depend on it
    // (the foaf test)
    fetch(base + '/.netlify/functions/follow-me', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: userTwoKeys.id,
            password: process.env.TEST_PW
        })
    })
        .then(res => {
            res.json().then(json => {
                t.equal(json.contact, userTwoKeys.id,
                    'should follow user two')
            })
        })
        .catch(err => {
            t.error(err)
        })
})


test('follow the same user again', t => {
    fetch(base + '/.netlify/functions/follow-me', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: keys.id,
            password: process.env.TEST_PW
        })
    })
        .then(res => {
            t.equal(res.ok, false, 'should get an error response')
            res.text().then(text => {
                t.ok(text.includes('instance not unique'),
                    'should return the right error')
                t.end()
            })
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})
