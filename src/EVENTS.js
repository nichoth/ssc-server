var namespace = require('@nichoth/events/namespace')

var evs = namespace({
    feed: ['got'],
    relevantPosts: ['got'],
    userFeed: ['got'],
    keys: ['got'],
    pin: ['post', 'got', 'error'],
    following: ['got', 'start', 'stop', 'err'],
    // profile: ['got'],
    // identity: ['setName', 'setAvatar', 'gotAvatar']
    identity: ['setUsername', 'setAvatar', 'setProfile', 'setDesc', 'setId',
        'newId']
})

module.exports = evs
