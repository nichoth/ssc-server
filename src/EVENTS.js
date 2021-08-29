var namespace = require('@nichoth/events/namespace')

var evs = namespace({
    feed: ['got'],
    relevantPosts: ['got'],
    userFeed: ['got'],
    keys: ['got'],
    following: ['got', 'start', 'stop'],
    profile: ['got'],
    identity: ['setName', 'setAvatar', 'gotAvatar']
})

module.exports = evs
