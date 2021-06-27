var namespace = require('@nichoth/events/namespace')

var evs = namespace({
    feed: ['got'],
    relevantPosts: ['got'],
    keys: ['got'],
    following: ['got'],
    profile: ['got'],
    identity: ['setName', 'setAvatar', 'gotAvatar']
})

module.exports = evs
