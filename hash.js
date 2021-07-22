#!/usr/bin/env node

function createHash (arg) {
    return 'wooooo'
}

if (require.main === module) {
    console.log(createHash())
}

module.exports = createHash
