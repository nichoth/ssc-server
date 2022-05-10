var { spawn } = require('child_process')

function setup (test, cb) {
    test('setup the server', function (t) {
        var ntl = spawn('npx', ['netlify', 'dev', '--port=8888'], {
            env: { ...process.env, NODE_ENV: 'test' }
        })

        ntl.stdout.on('data', function (d) {
            if (d.toString().includes('Server now ready')) {
                t.end()
                cb(ntl)
            }
        })

        ntl.stdout.pipe(process.stdout)
        ntl.stderr.pipe(process.stderr)

        // ntl.stdout.on('data', (data) => {
        //     console.log('**data**', data.toString())
        // })

        ntl.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })

        ntl.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
        })
    })
}

module.exports = setup
