var STORAGE_KEY = 'ssc-profile'

var Identity = {
    save: function (id) {
        window.localStorage.setItem( STORAGE_KEY, JSON.stringify(id) )
        return id
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
