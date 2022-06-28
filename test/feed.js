require('dotenv').config()
const test = require('tape')
const onExit = require('signal-exit')
const ssc = require('@nichoth/ssc-lambda')
const Post = require('../src/client/post')
const Feed = require('../src/client/feed')
const u = require('./util')
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

    test('feed', t => {
        feedTests(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        allDone(ntl)
        t.end()
    })
}

function feedTests (test, keys) {
    // keys here is admin
    var _user
    var postOne
    test('first create a user with a profile', t => {
        ssc.createKeys()
            .then(user => {
                _user = user
                return u.inviteAndFollow({
                    adminKeys: keys,
                    user,
                    userProfile: { username: 'flob' }
                })
            })
            .then(() => {
                return Post.create(ssc, _user.keys, {
                    files: [file],
                    content: { text: 'a test post' },
                    prev: null
                })
            }).then(res => {
                postOne = res
                t.equal(res.value.author, _user.did,
                    'should have the expected post author')
                t.end()
            })
    })

    test("get the user's feed by DID", t => {
        Feed.get(_user.did)
            .then(feed => {
                t.equal(feed[0].value.content.text, 'a test post',
                    "should return the user's feed")
                t.end()
            })
            .catch(err => {
                console.log('rrrrrrrrr', err)
                t.fail(err)
                t.end()
            })
    })

    test('post a second message', t => {
        Post.create(ssc, _user.keys, {
            files: [file],
            content: { text: 'a test post' },
            prev: postOne.value
        })
            .then(res => {
                t.equal(postOne.key, res.value.previous,
                    'should create a message with the right `previous`')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test("get the user's feed again", t => {
        Feed.get(_user.did)
            .then(feed => {
                t.equal(feed[0].value.previous, postOne.key,
                    'should return the feed with newest first')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })


}
