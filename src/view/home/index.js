import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
import { generateFromString } from 'generate-avatar'
var evs = require('../../EVENTS')
var Client = require('../../client')
var FollowIcon = require('../follow-btn')
var { getFollowing, /*getRelevantPosts,*/ getPostsWithFoafs } = Client()

function Home (props) {
    var { me, emit, relevantPosts, following } = props;

    // component did mount
    useEffect(() => {
        if (!me || !me.secrets) return

        getFollowing(me.secrets.id)
            .then(res => {
                // console.log('**got following**', res)
                emit(evs.following.got, res)
            })
            .catch(err => {
                console.log('oh no following errrrr', err)
            })

        if (me.secrets.id) {
            getPostsWithFoafs(me.secrets.id)
                .then(res => {
                    // console.log('**got foaf posts**', res)
                    emit(evs.relevantPosts.got, res.msg)
                })
                .catch(err => {
                    console.log('errrrrr', err)
                })
        }
    }, []);

    if (!me.secrets || !me.secrets.id) {
        return html`<div class="home-route">
            <p class="need-id">It looks like you don't have an identity.
                Create one <a href="/whoami/create"> here</a>
            </p>
        </div>`
    }

    function onFollow (userId) {
        console.log('****follow this person', userId)
        emit(evs.following.start, userId)
    }

    function onUnfollow (userId) {
        console.log('**unfollow them**', userId)
        emit(evs.following.stop, userId)
    }

    var myAvatar = (me.avatar && me.avatar.url) ?
        me.avatar.url :
        ('data:image/svg+xml;utf8,' +
            generateFromString(me.secrets.public || ''))

    return html`<div class="home-route">
        <ul class="post-list">
            ${(following && relevantPosts && relevantPosts.map((post) => {
                var writing = post.value.content.text
                // var url = 'https://res.cloudinary.com/nichoth/image/upload/v1620969604/' + createURI(post.value.content.mentions[0]) + '.jpg'
                var url = (post.mentionUrls && post.mentionUrls[0])

                var postAvatar = (post.value.author === me.secrets.id ?
                    myAvatar :
                    (following[post.value.author] &&
                        following[post.value.author].avatarUrl)
                )
                postAvatar = (postAvatar || 'data:image/svg+xml;utf8,' + 
                    generateFromString(post.value.author))

                var name = post.value.author === me.secrets.id ?
                    me.profile.userName :
                    (following[post.value.author] &&
                        following[post.value.author].name)

                var linkUrl = (post.value.author === me.secrets.id ?
                    '/' + me.profile.userName :
                    (name ?  ('/' + name) : null)
                )

                return html`<li class="post">
                    <a href="/post/${encodeURIComponent(post.key)}"
                        class="post-image"
                    >
                        <img src="${url}" />
                    </a>

                    <div class="post-metadata">
                        <div class="inline-avatar">
                            ${linkUrl ?
                                html`<a href="${linkUrl}">
                                    <img src="${postAvatar}" />
                                </a>` :
                                html`<img src=${postAvatar} />`
                            }
                        </div>

                        <div class="content">
                            ${linkUrl ?
                                html`<a class="user-name" href="${linkUrl}">
                                    ${name || 'Anonymous'}
                                </a>` :
                                html`<span class="user-name">
                                    ${name || 'Anonymous'}
                                </span>`
                            }
                            <p>${writing}</p>
                        </div>

                        <div class="icons">
                            <div class="follow-icon">
                                <${FollowIcon} me=${me}
                                    author=${post.value.author}
                                    following=${following}
                                    onFollow=${onFollow}
                                    onUnfollow=${onUnfollow}
                                />
                            </div>
                        </div>
                    </div>
                </li>`
            }))}
        </ul>
    </div>`;
}

module.exports = Home;
