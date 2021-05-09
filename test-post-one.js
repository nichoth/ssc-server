var ssc = require('@nichoth/ssc')
const fetch = require('node-fetch');

var keys = ssc.createKeys()

var url = 'http://localhost:8888/.netlify/functions/post-one-message'
// 'https://ssc-server.netlify.app/.netlify/functions/post-one-message'

// this works because we are making a new author every time,
// so starting a new feed on each call

// IRL you might want to authenticate requests first

function test () {
    var content = { text: 'testing', type: 'test' }
    var msg = ssc.createMsg(keys, null, content)


    const reqBody = {
        keys: { public: keys.public },
        msg: msg
    }
 
    fetch(url, {
            method: 'post',
            body:    JSON.stringify(reqBody),
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(json => {
            console.log('**content**', json.msg.value.content)
            console.log('**res**', json)
        });
}

test()
