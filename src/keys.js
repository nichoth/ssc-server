var Ssc = require('@nichoth/ssc/web')

module.exports = function Keys (keystore) {
    const ssc = Ssc(keystore)

    var sscKeys = {
        save: function (keys) {
            window.localStorage.setItem( 'ssc-keys', JSON.stringify(keys) );
            return keys
        },

        get: function () {
            // const cat = localStorage.getItem('myCat');
            var lsItem = localStorage.getItem('ssc-keys')
            return lsItem ? JSON.parse(lsItem) : null
        },

        create: function () {
            return ssc.createKeys();
        }
    }

    return sscKeys
}
