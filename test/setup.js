const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const config = require('../src/config.json')
const { admins } = config
// const ssc = require('@nichoth/ssc')
const ssc = require('@nichoth/ssc-lambda')

function setup (test, cb) {
    test('setup the server', function (t) {
        var ntl = spawn('npx', ['netlify', 'dev', '--port=8888'])

        ntl.stdout.on('data', function (d) {
            if (d.toString().includes('Server now ready')) {
                ssc.createKeys().then(user => {
                    // console.log('**created keys**', user)
                    // user is
                    // {
                    // did: 'did:key:z82T5YHoUFJX4QxwZ2sSBLeqmTyiNqHZEWs4r4eoghJ2fgfpLGGz3VsK3zSXwWAtVZrZWQFSF4GrWNrZ61jFpuWjDFbKG',
                    // id: '@BJtIKGtmgLy5Ibk0erQLMWrJ2n+ZzZoLbAc2WGC5gbc3q0Ue+DDMip7KoSP1C2uNUgczmgy9pntd/Zfo/ZxLhFs=.ed25519',
                    // keys : {
                    //      publicKey,
                    //      privateKey
                    //    }
                    // }
                    keys = user.keys
                    ssc.exportKeys(keys).then(exported => {
                        // need to write this did to config.admins
                        const did = ssc.publicKeyToDid(exported.public)
                        // did = _did
                        const configPath = path.resolve(__dirname, '..', 'src',
                            'config.json')
                        admins.push({ did })

                        fs.writeFileSync( configPath, JSON.stringify(
                            Object.assign({}, config, { admins }), null, 2
                        ) )

                        t.end()

                        cb({ netlify: ntl, keys: user.keys, did })
                    })
                })

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

// export default setup
module.exports = setup
