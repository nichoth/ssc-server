var ssc = require('@nichoth/ssc')
const fetch = require('node-fetch');

var keys = ssc.createKeys()

var url = 'http://localhost:8888/.netlify/functions/abouts'
// 'https://ssc-server.netlify.app/.netlify/functions/post-one-message'


function test () {
    var content = { about: keys.id, type: 'about', name: 'foooo' }
    var msg = ssc.createMsg(keys, null, content)


    const reqBody = {
        keys: { public: keys.public },
        msg: msg
    }

    return fetch(url, {
            method: 'post',
            body:    JSON.stringify(reqBody),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(json => {
            console.log('**res**', json.message)
        })

}

test()
