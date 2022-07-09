var namespace = require('@nichoth/events/namespace')

var evs = namespace({
    feed: ['got'],
    relevantPosts: ['got'],
    userFeed: ['got'],
    keys: ['got'],
    pin: ['post', 'got', 'error'],
    following: ['got', 'start', 'stop', 'err'],
    post: ['got', 'new', 'gotWithReplies'],
    // profile: ['got'],
    // identity: ['setName', 'setAvatar', 'gotAvatar']
    // profile: [ 'new' ],
    // identity: ['setUsername', 'setAvatar', 'setProfile', 'setDesc', 'newDid',
    //     'change']
    feed: ['got'],
    identity: ['setProfile', 'newDid', 'change', 'setUsername'],
    invitation: ['got', 'new'],
    reply: ['created'],
    installPrompt: ['hide']
})

module.exports = evs
