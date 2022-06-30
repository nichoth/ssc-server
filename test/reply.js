require('dotenv').config()
require('isomorphic-fetch')
const test = require('tape')
const onExit = require('signal-exit')
const ssc = require('@nichoth/ssc-lambda')
const Post = require('../src/client/post')
const Reply = require('../src/client/reply')
const Invitation = require('../src/client/invitation')
const { setup, allDone } = require('./setup')

const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

if (require.main === module) {
    var _keys
    var ntl
    var _did

    test('setup', function (t) {
        setup(t.test, ({ netlify, keys, did }) => {
            ntl = netlify
            _keys = keys
            _did = did

            onExit(() => {
                ntl.kill('SIGINT')
            })

            t.end()
        })
    })

    test('replies', t => {
        replyTest(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        allDone(ntl)
        t.end()
    })
}


function replyTest (test, keys) {
    var rootPost, user

    test('save a valid post from an admin', t => {
        Post.create(ssc, keys, {
            files: [file],
            content: { text: 'a test post' }
        })
            .then(res => {
                rootPost = res
                t.equal(res.value.content.type, 'post',
                    "should have type='post'")
                t.equal(res.value.content.text, 'a test post',
                    'should return the newly created message')
                t.end()
            })
            .catch(err => {
                console.log('errrrrrrrrrrrr', err)
                t.fail(err.toString())
                t.end()
            })
    })

    test('save a valid reply to the post', t => {
        Promise.all([
            Invitation.create(ssc, keys, { note: 'reply-test' }),
            ssc.createKeys()
        ])
            .then(([inv, newUser]) => {
                user = newUser
                const { code } = inv.value.content
                return Invitation.redeem(ssc, newUser.keys, code, {
                    did: newUser.did,
                    username: 'alice',
                }, file)
            })
            .then((res) => {
                const { username, type, about } = res.value.content
                t.equal(username, 'alice', 'should return the new username')
                t.equal(type, 'about', 'should return the new profile message')
                t.equal(about, user.did,
                    'should set profile for the new user')


                // the server is now following the new user

                // post: async function postReply (ssc, keys, prev, content) {
                Reply.post(ssc, user.keys, null, {
                    replyTo: rootPost.key,
                    text: 'woo replying to things'
                })
                    .then(res => {
                        t.equal(res.value.content.text,
                            'woo replying to things',
                            'should have the right message content'
                        )
                        t.equal(res.value.author, user.did,
                            'should have the correct reply author')
                        t.equal(res.value.content.replyTo, rootPost.key,
                            'should have `replyTo` set to the right message')
                        t.end()
                    })
                    .catch(err => {
                        t.fail(err)
                        t.end()
                    })
            })
    })


    test('can get the root message with all replies', t => {
        Post.getWithReplies(rootPost.key)
            .then(res => {
                t.equal(res[0].key, rootPost.key,
                    'should return the root post first')
                t.equal(res[1].value.content.type, 'reply',
                    'should return the reply after the root post')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test('get a post with multiple replies', t => {
        Reply.post(ssc, user.keys, null, {
            replyTo: rootPost.key,
            text: 'another reply'
        })
            .then(() => {
                return Post.getWithReplies(rootPost.key)
            })
            .then(res => {
                t.equal(res.length, 3, 'should return 2 posts total')
                t.equal(res[2].value.content.text, 'another reply',
                    'should return the replies with oldest first')
                t.end()
            })
    })
}
