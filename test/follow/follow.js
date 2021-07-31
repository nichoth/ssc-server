var ssc = require('@nichoth/ssc')
require('isomorphic-fetch')
var base = 'http://localhost:8888'

// var keys = ssc.createKeys()
// // var userOneKeys = ssc.createKeys()
// var userTwoKeys = ssc.createKeys()

module.exports = function followTests (test, ks) {
    var { keys, userTwoKeys } = ks

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
                if (!res.ok) {
                    console.log('**not ok**')
                    res.text().then(t => console.log('ttt', t))
                }
                res.json().then(json => {
                    t.equal(json.type, 'follow', 'should return the message')
                    t.equal(json.contact, keys.id, 'should return the right id')
                })
            })
            .catch(err => {
                console.log('errrrrrr', err)
                t.error(err)
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

    var code
    test('create an invitation as a user', function (t) {
        fetch(base + '/.netlify/functions/create-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: keys.public,
                msg: ssc.createMsg(keys, null, {
                    type: 'invitation',
                    from: keys.id
                })
            })
        })
            .then(res => res.json())
            .then(res => {
                console.log('****create invitation res****', res)
                code = res.code
                t.ok(res.code, 'should return an invitation code')
                t.end()
            })
            .catch(err => {
                t.error(err, 'should not have an error')
                t.end()
            })
    })

    test("create an invitation from someone we're not following", t => {
        var failureKeys = ssc.createKeys()

        fetch(base + '/.netlify/functions/create-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: failureKeys.public,
                msg: ssc.createMsg(failureKeys, null, {
                    type: 'invitation',
                    from: failureKeys.id
                })
            })
        })
            .then(res => {
                t.notOk(res.ok, 'should have a "not ok" status')
                t.equal(res.status, 401, 'should have the error code 401')
                t.end()
            })
            .catch(err => {
                console.log('errrrr', err)
                t.error(err, 'should not return an error')
                t.end()
            })

    })

    var redeemer
    test('redeem an invitation', function (t) {
        redeemer = ssc.createKeys()
        var signature = ssc.sign(redeemer, code)

        fetch(base + '/.netlify/functions/redeem-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: redeemer.public,
                code: code,
                signature: signature
            })
        })
            .then(res => {
                res.json().then(json => {
                    console.log('redeemed invitation', json)
                    t.ok(json, 'should redeem the invitation')
                    t.equal(json.contact, redeemer.id,
                        'should return a correct messsage')
                    t.end()
                })
            })
            .catch(err => {
                t.error(err, 'should not return error')
                t.end()
            })

    })


    test('redeem an invitation with a bad code', function (t) {
        // first create an invitation code
        var url = base + '/.netlify/functions/create-invitation'
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: keys.public,
                msg: ssc.createMsg(keys, null, {
                    type: 'invitation',
                    from: keys.id
                })
            })
        })
            .then(res => res.json())
            .then(json => {
                var { code } = json
                // then call 'redeem' with a different code
                var newPerson = ssc.createKeys()
                var signature = ssc.sign(newPerson, code + 'bad')
                fetch(base + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        publicKey: newPerson.public,
                        code: code + 'bad',
                        signature: signature
                    })
                })
                    .then(res => {
                        t.equal(res.status, 400, 'should have 400 status code')
                        res.text().then(text => {
                            t.ok(text.includes('Invalid invitation'),
                                'should return the right error')
                            t.end()
                        })
                    })
                    .catch(err => {
                        console.log('in here errr', err)
                        t.end()
                    })
            })
    })

    test('redeem an invitation with a bad signature', t => {
        // first create an invitation code
        // then try redeeming it with a bad signature

        var url = base + '/.netlify/functions/create-invitation'
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: keys.public,
                msg: ssc.createMsg(keys, null, {
                    type: 'invitation',
                    from: keys.id
                })
            })
        })
            .then(res => res.json())
            .then(res => {
                var { code } = res
                var newPerson = ssc.createKeys()
                var signature = ssc.sign(newPerson, code)

                fetch(base + '/.netlify/functions/redeem-invitation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        publicKey: newPerson.public,
                        code: code,
                        signature: 'bad' + signature
                    })
                })
                    .then(res => {
                        if (!res.ok) {
                            t.pass('should have an error response')
                            res.text().then(text => {
                                t.ok(text.includes('Invalid message'),
                                    'should return a good error message')
                                t.end()
                            })
                        } else {
                            console.log('res.status', res.status)
                            res.json().then(json => console.log('**json**', json))
                            t.fail('should have an error response')
                            t.end()
                        }
                    })
                    .catch(err => {
                        console.log('oh no', err)
                        t.error(err)
                        t.end()
                    })
            })

    })


    var _code
    test('someone youre already following redeems an invitation', t => {
        // first create a new invitation
        fetch(base + '/.netlify/functions/create-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: keys.public,
                msg: ssc.createMsg(keys, null, {
                    type: 'invitation',
                    from: keys.id
                })
            })
        })
            .then(res => res.json())
            .then(res => {
                redeem(res.code)
            })
            .catch(err => {
                console.log('oh no', err)
                t.error(err, 'should not have an error')
                t.end()
            })

        function redeem (code) {
            // then redeem it with the same person
            _code = code // set this for the next test
            // use the same id as the last test
            var signature = ssc.sign(redeemer, code)
            fetch(base + '/.netlify/functions/redeem-invitation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    publicKey: redeemer.public,
                    code: code,
                    signature: signature
                })
            })
                .then(res => {
                    t.equal(res.status, 400, 'should have 400 status code')
                    
                    if (!res.ok) {
                        res.text().then(text => {
                            t.equal('Already following', text,
                                'should send back the right error')
                            t.end()
                        })
                    } else {
                        t.fail('should send a "not ok" response')
                        t.end()
                    }
                })
                .catch(err => {
                    console.log('**redeem again err***', err)
                    t.error(err)
                    t.end()
                })
        }
    })


    test('use that code with a new person after it failed on someone else', t => {
        var newPerson = ssc.createKeys()
        var signature = ssc.sign(newPerson, _code)

        fetch(base + '/.netlify/functions/redeem-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: newPerson.public,
                code: _code,
                signature: signature
            })
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(t => {
                        console.log('texttttt', t)
                        t.end()
                    })
                }

                res.json().then(json => {
                    t.ok(json, 'should redeem the invitation')
                    t.equal(json.contact, newPerson.id,
                        'should return a correct messsage')
                    t.end()
                })
            })
            .catch(err => {
                console.log('errrr', err)
                t.error(err, 'should not return error')
                t.end()
            })

    })

}
