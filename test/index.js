var test = require('tape')
var fetch = require('node-fetch')
var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')
var fs = require('fs')
var createHash = require('crypto').createHash

var caracal = fs.readFileSync(__dirname + '/caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')

var ntl
var keys
var _msg

test('setup', function (t) {
    ntl = spawn('npx', ['netlify', 'dev', '--port=8888'])

    ntl.stdout.on('data', function (d) {
        if (d.toString().includes('Server now ready')) {
            t.end()
        }
    })

    ntl.stdout.pipe(process.stdout)
    ntl.stderr.pipe(process.stderr)

    ntl.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
    })

    ntl.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
    })
})

// * create and sign msg client side
test('publish one message', function (t) {
    var hash = createHash('sha256')
    hash.update(base64Caracal)
    var _hash = hash.digest('base64')
    // console.log('******hash', hash, _hash)

    var content = {
        type: 'test',
        text: 'waaaa',
        mentions: [_hash]
    }
    keys = ssc.createKeys()

    _msg = ssc.createMsg(keys, null, content)

    // console.log('***the first msg***', _msg)

    // {
    //     previous: null,
    //     sequence: 1,
    //     author: '@x+KEmL4JmIKzK0eqR8vXLPUKSa87udWm+Enw2bsEiuU=.ed25519',
    //     timestamp: NaN,
    //     hash: 'sha256',
    //     content: { type: 'test', text: 'waaaa' },
    // eslint-disable-next-line
    //     signature: 'RQXRrMUMqRlANeSBrfZ1AVerC9xGJxEGscx1MZrJUqAVylwVfi5i5r1msyZzqi7FuDf7DYr3OOHrTIO2P6ufDQ==.sig.ed25519'
    //   }

    var reqBody = {
        keys: { public: keys.public },
        msg: _msg,
        // @TODO
        file: base64Caracal
    }

    // console.log('req body', reqBody)

    fetch('http://localhost:8888/.netlify/functions/post-one-message', {
        method: 'POST',
        body:    JSON.stringify(reqBody),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(res => res.json())
        .then(json => {
            return json
        })
        .then(function (res) {
            // var { msg } = res
            // console.log('res', res)
            t.pass('got a response', res)
            t.ok(res.res.mentionUrls, 'should have the image urls')
            // console.log('**the first msg in response**', res)
            // console.log('**the first msg in response again**', res.res.value.content)
            // t.equal(msg.value.signature, _msg.signature,
            //     'should send back the right signature')
            t.end()
        })
        .catch(err => t.error(err))
})


test('publish a second message', function (t) {
    // var ___hash = createHash('sha256')
    // ___hash.update(base64Caracal)
    // var _hash = ___hash.digest('base64')

    var req2 = {
        keys: { public: keys.public },
        // in here we pass in the previous msg we created
        // createMsg(keys, prevMsg, content)
        msg: ssc.createMsg(keys, _msg, {
            type: 'test2',
            text: 'ok'
            // mentions: [_hash]
        }),
        file: base64Caracal
    }

    // console.log('aaaaa what is the prev msg***', _msg)
    // console.log('***in here msg 2***', req2.msg)
    // console.log('***the key of prev***', ssc.getId(_msg))

    fetch('http://localhost:8888/.netlify/functions/post-one-message', {
        method: 'post',
        body:    JSON.stringify(req2),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(res => {
            // console.log('**res**', res)
            t.pass('got a response')
            // t.equal(res.msg.value.signature, req2.msg.signature,
            //     'should send back right signature')
            // if (!res.ok) return res.text()
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('get a feed', function (t) {
    console.log('todo')
    t.end()
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})

