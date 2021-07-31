require('dotenv').config()
var test = require('tape')
var { spawn } = require('child_process')
var followTests = require('./follow')
var ssc = require('@nichoth/ssc')

var keys = ssc.createKeys()
var userOneKeys = ssc.createKeys()
var userTwoKeys = ssc.createKeys()

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

test('follow tests', t => {
    followTests(t.test, { keys, userOneKeys, userTwoKeys })
    t.end()
})
