var namespace = require('@nichoth/events/namespace')

var evs = namespace({
    feed: ['got'],
    keys: ['got'],
    following: ['got'],
    identity: ['setName', 'setAvatar', 'gotAvatar']
})

module.exports = evs
