#!/usr/bin/env node
var minimist = require('minimist')

function createHash (arg) {
    return arg + ' '
}

// if (is running from the CLI)
if (require.main === module) {
    var argv = minimist(process.argv.slice(2))
    var pw = argv._[0]
    if (pw) {
        process.stdout.end(createHash(pw))
    } else {
        process.stdin.on('data', function (d) {
            process.stdout.end(createHash(d.toString().trim()))
        })
    }

}

module.exports = createHash
