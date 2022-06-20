require('dotenv').config()
require('isomorphic-fetch')
const ssc = require('@nichoth/ssc-lambda')
const { getHash } = require('@nichoth/multihash')
const test = require('tape')
const onExit = require('signal-exit')
const setup = require('./setup')
const Invitation = require('../src/client/invitation')
const Post = require('../src/client/post')
const BASE = 'http://localhost:8888'

const { CLOUDINARY_CLOUD_NAME } = require('../src/config.json')
const { Cloudinary } = require('@cloudinary/url-gen')
const cld = new Cloudinary({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
      secure: true // force https, set to false to force http
    }
})

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

    test('posts', t => {
        postTest(t.test, _keys, _did)
        t.end()
    })

    test('all done', function (t) {
        ntl.kill()
        t.end()
    })
}

function postTest (test, keys) {
    // `keys` here is an admin user
    var firstPost
    const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

    test('save a valid post from an admin', t => {
        Post.create(ssc, keys, {
            files: [file],
            content: { text: 'a test post' }
        })
            .then(res => {
                firstPost = res.value
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

    test('create a second valid post from the same admin user', t => {
        Post.create(ssc, keys, {
            files: [file],
            content: { text: 'test post 2' },
            prev: firstPost
        })
            .then(res => {
                t.equal(res.value.content.text, 'test post 2',
                    'should return the new message')
                t.end()
            })
            .catch(err => {
                t.fail(err)
                t.end()
            })
    })

    test('post an invalid message from a valid user', t => {
        ssc.createMsg(keys, null, {
            type: 'post',
            text: 'bad merkle sequence',
            mentions: [getHash(file)]
        }).then(msg => {
            fetch(BASE + '/api/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [file], msg })
            })
                .then(res => {
                    if (res.ok) {
                        t.fail('response should not be ok')
                        t.end()
                    }

                    res.text().then(text => {
                        t.equal(text, 'invalid signature',
                            'should return the expected error message')
                        t.end()
                    })
                })
                .catch(err => {
                    console.log('errrrrr', err)
                    t.fail('err')
                    t.end()
                })
            })
    })

    test('a valid message from a random user', t => {
        ssc.createKeys().then(alice => {
            return ssc.createMsg(alice.keys, null, {
                type: 'post',
                mentions: [getHash(file)],
                text: 'random user message'
            })
        }).then(msg => {
            fetch(BASE + '/api/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [file], msg })
            }).then(res => {
                if (res.ok) {
                    t.fail('should return an error code')
                    t.end()
                    return
                }

                t.equal(res.status, 403, 'should return code 403')

                res.text().then(text => {
                    t.equal(text, 'not allowed', 'should return expected error')
                    t.end()
                })
            })
        })
        .catch(err => {
            console.log('errrrrrrrr', err)
            t.end()
        })
    })

    // * create an invitation
    // * create a new user
    // * have the new user redeem the invitation
    // * post a message from the new user
    var _newUser
    var _post
    test("post a message from a 'followed' user, not an 'admin'", t => {
        const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

        Promise.all([
            Invitation.create(ssc, keys, { note: 'test' }),
            ssc.createKeys()
        ])
            .then(([inv, newUser]) => {
                const { code } = inv.value.content
                return Promise.all([
                    Invitation.redeem(ssc, newUser.keys, code, {
                        did: newUser.did,
                        username: 'alice',
                        file
                    }),

                    Promise.resolve(newUser)
                ])
            })
            .then(([res, newUser]) => {
                const { username, type, about } = res.value.content
                t.equal(username, 'alice', 'should return the new username')
                t.equal(type, 'about', 'should return the new profile message')
                t.equal(about, newUser.did,
                    'should set profile as the new user')
                return Promise.all([
                    Promise.resolve(newUser),
                    Post.create(ssc, newUser.keys, {
                        files: [file],
                        content: { text: 'a test post' },
                        prev: null
                    })
                ])
            })
            .then(([newUser, post]) => {
                _post = post
                _newUser = newUser

                const { type, text } = post.value.content
                t.equal(post.value.author, newUser.did,
                    'should create the message with the right author')
                t.equal(type, 'post', 'should create the right type message')
                t.equal(text, 'a test post', 'should return the new message')
                t.end()
            })
    })

    var mention

    test('a second post from the same user', t => {
        const file = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="

        Post.create(ssc, _newUser.keys, {
            files: [file],
            content: { text: 'sequence two post' },
            prev: _post.value
        })
            .then(res => {
                mention = res.value.content.mentions[0]
                t.equal(res.value.sequence, 2, 'should have the right sequence')
                t.equal(res.value.content.text, 'sequence two post',
                    'should return the right message')
                t.equal(res.value.author, _newUser.did,
                    'should have the expected author')
                t.end()
            })
            .catch(err => {
                console.log('errrrrrrrrrrrrrr', err)
                t.end()
            })
    })

    test('image was uploaded', t => {
        const url = (cld
            .image(encodeURIComponent(mention))
            .toURL())

        fetch(url)
            .then(res => {
                t.equal(res.status, 200, 'should have 200 response for image')
                t.end()
            })
    })
}
