#!/usr/bin/env node
var ssc = require('@nichoth/ssc')
var minimist = require('minimist')

function keys () {
    return ssc.createKeys()
}

if (require.main === module) {
    // if this is running from the CLI
    var argv = minimist(process.argv.slice(2))
    var arg = argv._[0]
    if (arg !== 'keys') process.exit(1)

    process.stdout.end(JSON.stringify(ssc.createKeys(), null, 2) + '\n')
}

module.exports = {
    keys
}
