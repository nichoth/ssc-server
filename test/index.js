var test = require('tape')
var fetch = require('node-fetch')
var { spawn } = require('child_process')
var ssc = require('@nichoth/ssc')

test('setup', function (t) {
    ntl = spawn('npx', ['netlify', 'dev', '--port=8888'])

    // ntl.stdout.on('data', function (d) {
    //     console.log('stdout', d.toString('utf8'))
    // })

    ntl.stdout.once('data', (/* data */) => {
        t.end()
    })

    ntl.stdout.pipe(process.stdout)
    ntl.stderr.pipe(process.stderr)

    ntl.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    })

    ntl.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    })
})

// * create and sign msg client side
test('publish', function (t) {
    var url = 'http://localhost:8888/.netlify/functions/post-one-message'
    var content = { type: 'test', text: 'waaaa' }
    var keys = ssc.createKeys()

    var _msg = ssc.createMsg(keys, null, content)

    // {
    //     previous: null,
    //     sequence: 1,
    //     author: '@x+KEmL4JmIKzK0eqR8vXLPUKSa87udWm+Enw2bsEiuU=.ed25519',
    //     timestamp: NaN,
    //     hash: 'sha256',
    //     content: { type: 'test', text: 'waaaa' },
    //     signature: 'RQXRrMUMqRlANeSBrfZ1AVerC9xGJxEGscx1MZrJUqAVylwVfi5i5r1msyZzqi7FuDf7DYr3OOHrTIO2P6ufDQ==.sig.ed25519'
    //   }

    var reqBody = {
        keys: { public: keys.public },
        msg: _msg
    }

    fetch(url, {
            method: 'post',
            body:    JSON.stringify(reqBody),
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(json => {
            return json
        })
            .then(function ({ msg }) {
                t.pass('got a response')
                t.equal(msg.value.signature, _msg.signature,
                    'should send back the right signature')
                t.end()
            })
            .catch(err => t.error(err));
})

test('all done', function (t) {
    ntl.kill()
    t.end()
})
