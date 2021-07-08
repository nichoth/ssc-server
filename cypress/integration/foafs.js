var URL = 'http://localhost:8888'
var ssc = require('@nichoth/ssc')
var createHash = require('crypto').createHash
var Client = require('../../src/client')
var URL = 'http://localhost:8888'

var client = Client()

// a smiling face
var file = 'data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'

var hash = createHash('sha256')
hash.update(file)
var fileHash = hash.digest('base64')

describe('foafs on the home page', () => {
    var tempKeys = ssc.createKeys()
    var tempKeysTwo = ssc.createKeys()
    var tempKeysThree = ssc.createKeys()

    // first follow some people
    client.follow(tempKeys, tempKeysTwo)
        .then(() => {
            client.follow(tempKeysTwo, tempKeysThree)
                .then(() => {
                    console.log('everyone is followed')
                    doPosting()
                })
        })

    function doPosting () {
        // // then make some posts bu userThree
        // // post: function post (keys, msg, file) {
        var msg = ssc.createMsg(tempKeysThree, null, {
            type: 'test',
            text: 'test post content',
            mentions: [fileHash]
        })

        client.post(tempKeysThree, msg, file)
    }

    // // then visit the home page & get the posts


    it('should have foaf messages', () => {
        cy.createId()
        cy.followFoafs()
        cy.visit(URL)
    })


})
