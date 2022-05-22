require('dotenv').config()
require('isomorphic-fetch')
// const client = require('../src/client')
const path = require('path')
const ssc = require('@nichoth/ssc-lambda')
const test = require('tape')
const fs = require('fs')
const { admins } = require('../src/config.json')
const base = 'http://localhost:8888'

module.exports = alt

function alt (test, keys, did) {
    // keys here is for the 'admin' user
    // (the one creating an alt)
    test('save an alt message as an admin', t => {
        ssc.createMsg(keys, null, {
            type: 'alternate',
            from: did,
            to: '123'
        }).then(msg => {
            fetch(base + '/.netlify/functions/alternate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            }).then(res => {
                return res.json()
            }).then(res => {
                t.equal(res.key, ssc.getId(res.value),
                    'should return the expected key')
                t.equal(res.value.content.type, 'alternate',
                    'should return the right message type')
                t.end()
            })
        })
    })
}
