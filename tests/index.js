const test = require('tape')
const { spawn } = require('child_process')
var onExit = require('signal-exit')

var ntl

test('setup', function (t) {
    require('./setup')(t.test, (netlify) => {
        ntl = netlify

        onExit(() => ntl.kill('SIGINT'))

        t.end()
    })
})

test('playwright', t => {
    var pw = spawn('npx', ['playwright', 'test'])

    pw.stdout.pipe(process.stdout)

    pw.on('close', (code) => {
        t.end()
        process.exit(code)
    })
})
