var namespace = require('@nichoth/events/namespace')

var evs = namespace({
    feed: ['got'],
    relevantPosts: ['got'],
    userFeed: ['got'],
    keys: ['got'],
    pin: ['post', 'got', 'error'],
    following: ['got', 'start', 'stop', 'err'],
    post: ['got'],
    // profile: ['got'],
    // identity: ['setName', 'setAvatar', 'gotAvatar']
    // profile: [ 'new' ],
    // identity: ['setUsername', 'setAvatar', 'setProfile', 'setDesc', 'newDid',
    //     'change']
    identity: ['setProfile', 'newDid', 'change', 'setUsername']
})

module.exports = evs
