import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
import { generateFromString } from 'generate-avatar'
var evs = require('../../EVENTS')
var Client = require('../../client')
var { getFollowing, /*getRelevantPosts,*/ getPostsWithFoafs } = Client()

function Home (props) {
    var { me, emit, relevantPosts, following } = props;
    console.log('props in home', props);

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
                    console.log('**got foaf posts**', res)
                    emit(evs.relevantPosts.got, res.msg)
                })
                .catch(err => {
                    console.log('errrrrr', err)
                })
        }
    }, []);

    if (!me.secrets || !me.secrets.id) {
        return html`<div class="home-route">
            <p>It looks like you don't have an identity. Create one
                <a href="/whoami/create"> here</a></p>
        </div>`
    }

    var myAvatar = (me.avatar && me.avatar.url) ?
        me.avatar.url :
        ('data:image/svg+xml;utf8,' +
            generateFromString(me.secrets.public || ''))

    // need to have a user-name link instead of just `me`
    // keep a list of authors in memory? map of author -> avatar

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

                // var name = (following[post.value.author] &&
                //     following[post.value.author].name)
                var linkUrl = (post.value.author === me.secrets.id ?
                    '/' + me.profile.userName :
                    (name ?  ('/' + name) : null)
                )

                return html`<li class="post">
                    <a href="/post/${encodeURIComponent(post.key)}">
                        <img src="${url}" />
                    </a>
                    <div class="inline-avatar">
                        ${linkUrl ?
                            html`<a href="${linkUrl}">
                                <img src="${postAvatar}" />
                            </a>` :
                            html`<img src=${postAvatar} />`
                        }
                    </div>
                    <div class="content">
                        <a href="${linkUrl}">${name || 'Anonymous'}</a>
                        <p>${writing}</p>
                    </div>
                </li>`
            }))}
        </ul>
    </div>`;
}

module.exports = Home;
