var STORAGE_KEY = 'ssc-profile'

var Identity = {
    save: function (profile) {
        console.log('in identity', profile)
        window.localStorage.setItem( STORAGE_KEY, JSON.stringify(profile) )
        return profile
    },

    get: function () {
        var lsItem = localStorage.getItem(STORAGE_KEY)
        return lsItem ? JSON.parse(lsItem) : null
    },

    create: function (name) {
        return { name }
    }
}

module.exports = Identity
