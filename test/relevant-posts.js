require('dotenv').config()
const test = require('tape')
const onExit = require('signal-exit')
const ssc = require('@nichoth/ssc-lambda')
const Post = require('../src/client/post')
const RelevantPosts = require('../src/client/relevant-posts')
const Follow = require('../src/client/follow')
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
        relevantTests(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        allDone(ntl)
        t.end()
    })
}


function relevantTests (test, keys, did) {
    // keys here is admin
    var crob
    test('first create a user with a profile, and create a post', t => {
        ssc.createKeys()
            .then(user => {
                crob = user  // this is `crob`
                return u.inviteAndFollow({
                    adminKeys: keys,
                    user,
                    userProfile: { username: 'crob' }
                })
            })
            .then(() => {
                // create a post from admin
                return Post.create(ssc, keys, {
                    files: [file],
                    content: { text: 'wooo' },
                    prev: null
                })
            }).then(res => {
                // postOne = res
                t.equal(res.value.author, did,
                    'should have the expected post author')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
                console.log('errrrrrrrrrrrrrrrrrrrr', err)
            })
    })

    // now `crob` is following the admin
    test('get relevant posts', t => {
        RelevantPosts.get(crob.did)
            .then(res => {
                t.equal(res.length, 1, 'should get 1 post')
                t.equal(res[0].value.content.text, 'wooo',
                    'should have the expected message text')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    var dod
    test('get a post that is 2 hops out', t => {
        // first make a new user and post
        // this user also follows the admin
        // dod -> admin <- crob
        // we should be able to see posts from the admin

        // need to make an arrow from admin to `crob`
        // dod -> admin <-> crob
        // then get relevant posts to dod


        ssc.createKeys()
            .then(_dod => {
                dod = _dod
                // there is now a line from dod to admin
                return u.inviteAndFollow({
                    adminKeys: keys,
                    user: _dod,
                    userProfile: { username: 'dod' }
                })
            })
            .then(() => {
                // this makes admin follow crob
                return Follow.post(ssc, keys, [crob.did])
            })
            .then(res => {
                // now make a post from crob
                return Post.create(ssc, crob.keys, {
                    files: [file],
                    content: { text: 'from crob' },
                    prev: null
                })
            })
            .then(() => {
                // now need to check that dod can see posts from crob
                RelevantPosts.get(dod.did)
                    .then(res => {
                        const msg = res.find(msg => {
                            return msg.value.content.text === 'from crob'
                        })
                        t.ok(msg, 'dod should get messages from crob')
                        t.end()
                    })
                    .catch(err => {
                        t.fail(err)
                        t.end()
                    })
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test('crob can see their own messages', t => {
        // in this case, we have `dod -> admin <-> crob`

        // should check here if dod can see their own posts

        // should get 2 messages -- one by crob, one by admin
        RelevantPosts.get(crob.did)
            .then(posts => {
                t.equal(posts.length, 2, 'should show two posts')
                t.end()
            })
    })

    test('dod can see their own messages', t => {
        // the graph is now:
        // dod -> admin <-> crob,

        Post.create(ssc, dod.keys, {
            files: [file],
            content: { text: 'from dod' },
            prev: null
        })
            .then(() => {
                return RelevantPosts.get(dod.did)
            })
            .then(posts => {
                t.equal(posts.length, 3,
                    "should get 3 posts -- dod's, admin, and crob")

                t.ok(posts.find(post => post.value.content.text === 'from crob'),
                    "should see the post from crob")
                t.ok(posts.find(post => post.value.content.text === 'wooo'),
                    "should see the admin's post")
                t.ok(posts.find(post => post.value.content.text === 'from dod'),
                    "should see your own posts, regardless of following graph")

                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })
}

module.exports = relevantTests
