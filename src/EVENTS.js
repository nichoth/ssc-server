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
    // profile: [ 'new' ],
    // identity: ['setUsername', 'setAvatar', 'setProfile', 'setDesc', 'newDid',
    //     'change']
    identity: ['setProfile', 'newDid', 'change']
})

module.exports = evs
