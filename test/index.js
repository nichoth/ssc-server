var test = require('tape')
var fetch = require('node-fetch')
var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')
var fs = require('fs')

var caracal = fs.readFileSync(__dirname + '/caracal.jpg')
let base64Caracal = caracal.toString('base64')

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
    var content = { type: 'test', text: 'waaaa' }
    keys = ssc.createKeys()

    // console.log('**keys**', keys)

    _msg = ssc.createMsg(keys, null, content)

    console.log('**msg**', _msg)

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
        file: 'data:image/png;base64,' + base64Caracal
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
            t.pass('got a response', res)
            // t.equal(msg.value.signature, _msg.signature,
            //     'should send back the right signature')
            t.end()
        })
        .catch(err => t.error(err))
})


test('publish a second message', function (t) {
    var req2 = {
        keys: { public: keys.public },
        // in here we pass in the previous msg we created
        // createMsg(keys, prevMsg, content)
        msg: ssc.createMsg(keys, _msg, { type: 'test2', text: 'ok' })
    }

    fetch('http://localhost:8888/.netlify/functions/post-one-message', {
        method: 'post',
        body:    JSON.stringify(req2),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(res => {
            t.pass('got a response')
            t.equal(res.msg.value.signature, req2.msg.signature,
                'should send back right signature')
            t.end()
        })
        .catch(err => {
            t.error(err)
            t.end()
        })
})

test('get a feed', function (t) {

})

test('all done', function (t) {
    ntl.kill()
    t.end()
})

