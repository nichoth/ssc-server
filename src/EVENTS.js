var namespace = require('@nichoth/events/namespace')

var evs = namespace({
    feed: ['got'],
    keys: ['got'],
    identity: ['setName', 'setAvatar']
})

module.exports = evs
