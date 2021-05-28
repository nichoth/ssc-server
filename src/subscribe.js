var evs = require('./EVENTS')

function subscribe (bus, state) {

    bus.on(evs.identity.setName, name => {
        console.log('set name event', name)

    })

    bus.on(evs.feed.got, msgs => {
        console.log('got feed', msgs)
        state.feed.set(msgs)
    })

    bus.on(evs.keys.got, ev => {
        var { secrets, source } = ev
        console.log('key bus', secrets)
        Keys.save(secrets)
        state.me.secrets.set(secrets)
        state.me.source.set(source || null)
    })
}

module.exports = subscribe
