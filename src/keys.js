var ssc = require('@nichoth/ssc')

var sscKeys = {
    save: function (keys) {
        window.localStorage.setItem( 'ssc', JSON.stringify(keys) );

        return keys
    },

    get: function () {
        // const cat = localStorage.getItem('myCat');
        var lsItem = localStorage.getItem('ssc')
        return lsItem ? JSON.parse(lsItem) : null
    },

    create: function () {
        return ssc.createKeys();
    }
}

module.exports = sscKeys
