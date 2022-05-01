var { spawn } = require('child_process')

function setup (test, cb) {
    test('setup the server', function (t) {
        var ntl = spawn('npx', ['netlify', 'dev', '--port=8888'])

        ntl.stdout.on('data', function (d) {
            if (d.toString().includes('Server now ready')) {
                cb(ntl)
                t.end()
            }
        })

        ntl.stdout.pipe(process.stdout)
        ntl.stderr.pipe(process.stderr)

        ntl.stderr.on('data', (data) => {
            console.log('**data**', data)
        })

        ntl.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })

        ntl.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
        })
    })
}

module.exports = setup
