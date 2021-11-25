#!/usr/bin/env node
var minimist = require('minimist')
const bcrypt = require('bcrypt');

function createHash (pw) {
    const saltRounds = 10
    return bcrypt.hash(pw, saltRounds)
        .then(hash => {
            // console.log(hash);
            return hash
        })
}

// if this is running from the CLI
if (require.main === module) {
    var argv = minimist(process.argv.slice(2))
    var pw = argv._[0]
    if (pw) {  // if you pass in a password, use it
        createHash(pw)
            .then(h => process.stdout.end(h))
    } else {  // if not, read a password from stdin
        // in this case read from a pipe
        process.stdin.on('data', function (d) {
            createHash(d.toString().trim())
                .then(h => process.stdout.end(h))
        })
    }

}

module.exports = createHash

