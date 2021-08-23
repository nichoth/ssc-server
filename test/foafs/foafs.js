// var base = 'http://localhost:8888'
require('dotenv').config()
require('isomorphic-fetch')
var fs = require('fs')
var createHash = require('crypto').createHash
var ssc = require('@nichoth/ssc')
var Client = require('../../src/client')
var { follow, getPostsWithFoafs, post, followMe } = Client()
var caracal = fs.readFileSync(__dirname + '/../caracal.jpg')
let base64Caracal = 'data:image/png;base64,' + caracal.toString('base64')

var hash = createHash('sha256')
hash.update(base64Caracal)
var fileHash = hash.digest('base64')

module.exports = function foafTests (test, ks) {
    var { keys, userOneKeys, userTwoKeys } = ks

    test('the server follows everyone', t => {
        Promise.all([
            followMe(keys, process.env.TEST_PW),
            followMe(userOneKeys, process.env.TEST_PW),
            followMe(userTwoKeys, process.env.TEST_PW)
        ])
            .then(() => {
                t.end()
            })
    })

    test('user follows a different user', function (t) {
        follow(keys, userOneKeys)
            .then(res => {
                t.equal(res.value.content.type, 'follow',
                    'should post a follow message')
                t.equal(res.value.content.contact, userOneKeys.id,
                    'should follow the right user ID')
                t.end()
            })
            .catch(err => {
                console.log('oh no', err)
                t.error(err)
                t.end()
            })
    })

    test('foaf follow', function (t) {
        follow(userOneKeys, userTwoKeys)
            .then(res => {
                t.equal(res.value.content.type, 'follow',
                    'userOne should follow userTwo')
                t.end()
            })
            .catch(err => {
                console.log('errr', err)
                t.error(err)
                t.end()
            })
    })

    test('get foaf messages', t => {
        // need to do a post by userTwo
        // test file -- smiling face
        var msg = ssc.createMsg(userTwoKeys, null, {
            type: 'test',
            text: 'a post from user 2',
            mentions: [fileHash]
        })

        post({ public: userTwoKeys.public }, msg, base64Caracal)
            .then(() => {
                return getPostsWithFoafs(keys.id)
            })
            .then(res => {
                var post = res.msg.find(msg => {
                    return msg.value.author === userTwoKeys.id
                })
                t.ok(post, 'should return a post by user two')
                t.end()
            })
            .catch(err => {
                console.log('aaaaaa errrrr', err)
                t.error(err)
                t.end()
            })

        // post({ public: userTwoKeys.public }, msg, base64Caracal)
        //     .then(() => {
        //         // console.log('**res to foaf puplish**', res)

        //         return getPostsWithFoafs(keys.id)
        //     })
        //     .then((res) => {
        //         // console.log('**got foaf posts**', JSON.stringify(res, null, 2))
        //         // author should be userTwo
        //         var post = res.msg.find(msg => {
        //             return msg.value.author === userTwoKeys.id
        //         })
        //         t.ok(post, 'should return a post by user two')
        //         t.end()
        //     })
        //     .catch(err => {
        //         console.log('errrrr', err)
        //         t.error(err)
        //         t.end()
        //     })
    })

}
