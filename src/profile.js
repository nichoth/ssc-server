const config = require('./config.json')
var { appName } = config
appName = appName || 'ssc-demo'
const { LS_NAME } = require('./constants')

var dids = null
try {
    dids = JSON.parse(window.localStorage.getItem(LS_NAME))
} catch (err) {
    // do nothing
}

const lastUser = dids ? dids.lastUser : null

module.exports = {
    set: function (profile) {
        const { about: did, username, image } = profile
        const _dids = dids || {}
        const storeName = (dids ? dids[lastUser] : {}).storeName || appName
        _dids[did] = { storeName, username, image, did }
        _dids.lastUser = did
        window.localStorage.setItem(LS_NAME, JSON.stringify(_dids))
    }
}
