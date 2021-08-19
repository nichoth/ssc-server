var Client = require('./client')
var { getFollowing, follow, setNameAvatar, testPost,
    getRelevantPosts, getPostsWithFoafs } = Client()

// TODO
// do a foaf follow. This means you follow userOne, userOne
// follows userTwo, and userTwo creates a post

function testStuff (state) {
    var me = state.me()
    var myKeys = me.secrets

    console.log('**my keys**', myKeys)

    var userOneKeys = window.userOneKeys = {
        "curve": "ed25519",
        "public": "g+Aw6QpfN+hlXTUQUlXZ3z6d56se+I8JQiRrJo/nfIE=.ed25519",
        "private": "aQGqFH0HXj+zNaQbRbBbGjACzU92KprVetem9ji0jJyD4DDpCl836GVdNRBSVdnfPp3nqx74jwlCJGsmj+d8gQ==.ed25519",
        "id": "@g+Aw6QpfN+hlXTUQUlXZ3z6d56se+I8JQiRrJo/nfIE=.ed25519"
    }

    var userTwoKeys = window.userTwoKeys = {
        "curve": "ed25519",
        "public": "u0MOa3J2abucXDHblubJh48kDuGpU2ZhuPA9ioNp/OY=.ed25519",
        "private": "kuZuJORTMJuZzJKqHX1qbr4AGvPTbYfgx1/JV90lw3a7Qw5rcnZpu5xcMduW5smHjyQO4alTZmG48D2Kg2n85g==.ed25519",
        "id": "@u0MOa3J2abucXDHblubJh48kDuGpU2ZhuPA9ioNp/OY=.ed25519"
    }

    window.followUserOne = function () {
        follow(myKeys, userOneKeys)
            .then(res => {
                console.log('success follow user one', res)
            })
            .catch(err => {
                console.log('oh no', err)
            })
    }

    // post a msg where userOne follows another user
    window.followFoaf = function () {
        // console.log('foafing')

        // have userOne follow userTwo
        follow(userOneKeys, userTwoKeys)
            .then(res => {
                console.log('success following foaf', res)
            })
    }

    window.userOneName = function () {
        // console.log('user one keys', userOneKeys)
        setNameAvatar('userOne', userOneKeys)
            .then(res => {
                if (!res.ok) {
                    return res.text().then(t => console.log('tttt', t))
                }
                // console.log('success', res)
            })
            .catch(err => {
                console.log('errrrr', err)
            })
    }

    window.userTwoName = function () {
        setNameAvatar('userTwo', userTwoKeys)
            .then(res => {
                // console.log('success user two name', res)
            })
            .catch(err => {
                console.log('errrrr', err)
            })
    }

    window.user2Post = function () {
        testPost('test content', userTwoKeys)
            .then(res => {
                // console.log('posted user 2 msg', res)
            })
    }


    window.getFoafPosts = function () {
        // console.log('my id', state().me.secrets.id)
        getPostsWithFoafs(state.me.secrets().id)
            .then(res => {
                console.log('**got foaf posts**', res.msg)
                // emit(evs.relevantPosts.got, res.msg)
            })
    }

    window.setNameAvatar = setNameAvatar

    window.testStuff = function testStuff (text) {
        follow(myKeys, userOneKeys)
            .then(json => {
                getFollowing(state().me.secrets.id)
                    .then(res => {
                        console.log('**got following**', res)
                        emit(evs.following.got, res)
                    })
                    .catch(err => {
                        console.log('oh no following errrrr', err)
                    })

                console.log('jsonnnnnnnnnn follow post res', json)
                // once you're following userTwo, check that their post
                // shows up on the home page
                // call get `relevantPosts` after posting
                testPost('', userOneKeys)
                    .then(res => {
                        console.log('**test post res**', res)

                        getRelevantPosts(me.secrets.id)
                            .then(res => {
                                // console.log('**got relevant posts**', res)
                                emit(evs.feed.got, res.msg)
                            })
                            .catch(err => {
                                console.log('errrrrr', err)
                            })
                    })
            })
            .catch(err => {
                console.log('oh noooooooooo', err)
            })
    }

}

module.exports = testStuff
