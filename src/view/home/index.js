import { html } from 'htm/preact'
const { marked } = require('marked')
// import { generateFromString } from 'generate-avatar'
// var evs = require('../../EVENTS')
// var Client = require('../../client')
// var FollowIcon = require('../follow-btn')
// var { getFollowing, /*getRelevantPosts,*/ getPostsWithFoafs } = Client()

function Home (props) {
    console.log('home props', props)
    const { me, pin } = props
    const { isAdmin } = me

    return html`<div class="route home">
        ${isAdmin ?
            html`
                <div>
                    <a href="/new-pin" class="click-new">
                        <i class="fa fa-solid fa-plus"></i>
                        <span>Pin a new post here</span>
                    </a>

                    ${pin ?
                        html`<div dangerouslySetInnerHTML=${{
                            __html: marked(pin)
                        }}></div>` :
                        null
                    }
                </div>
            `:
            html`<div>
                ${pin ?
                    html`<div dangerouslySetInnerHTML=${{
                        __html: marked(pin)
                    }}></div>` :
                    null
                }
            </div>`
        }
    </div>`
}

module.exports = Home;

// function Home (props) {
//     var { me, emit, relevantPosts, following } = props

//     // component did mount
//     useEffect(() => {
//         if (!me || !me.did) return

//         getFollowing(me.did)
//             .then(res => {
//                 emit(evs.following.got, res)
//             })
//             .catch(err => {
//                 emit(evs.following.err, err)
//             })

//         if (me.did) {
//             getPostsWithFoafs(me.did)
//                 .then(res => {
//                     // console.log('**got foaf posts**', res)
//                     emit(evs.relevantPosts.got, res.msg)
//                 })
//                 .catch(err => {
//                     console.log('aaa errrrrr', err)
//                 })
//         }
//     }, []);

//     if (!me.did) {
//         return html`<div class="home-route">
//             <p class="need-id">It looks like you don't have an identity.
//                 Create one <a href="/whoami/create">here</a>
//             </p>
//         </div>`
//     }

//     // if (!me.secrets || !me.secrets.id) {
//     //     return html`<div class="home-route">
//     //         <p class="need-id">It looks like you don't have an identity.
//     //             Create one <a href="/whoami/create">here</a>
//     //         </p>
//     //     </div>`
//     // }

//     function onFollow (userId) {
//         emit(evs.following.start, userId)
//     }

//     function onUnfollow (userId) {
//         // console.log('**unfollow them**', userId)
//         emit(evs.following.stop, userId)
//     }

//     var myAvatar = (me.avatar && me.avatar.url) ?
//         me.avatar.url :
//         ('data:image/svg+xml;utf8,' +
//             generateFromString(me.secrets.public || ''))

//     return html`<div class="home-route">

//         ${props.following && props.following.err ?
//             html`<p class="error">
//                 ${props.following.err.includes('NotFound') ?
//                     "There was an error getting who you're following" :
//                     props.following.err
//                 }
//             </p>` :
//             null
//         }

//         <ul class="post-list">
//             ${(following && relevantPosts && relevantPosts.map((post) => {
//                 var writing = post.value.content.text
//                 // var url = 'https://res.cloudinary.com/nichoth/image/upload/v1620969604/' + createURI(post.value.content.mentions[0]) + '.jpg'
//                 var url = (post.mentionUrls && post.mentionUrls[0])

//                 var postAvatar = (post.value.author === me.secrets.id ?
//                     myAvatar :
//                     (following[post.value.author] &&
//                         following[post.value.author].avatarUrl)
//                 )
//                 postAvatar = (postAvatar || 'data:image/svg+xml;utf8,' + 
//                     generateFromString(post.value.author))

//                 var name = post.value.author === me.secrets.id ?
//                     me.profile.userName :
//                     (following[post.value.author] &&
//                         following[post.value.author].name)

//                 var linkUrl = (post.value.author === me.secrets.id ?
//                     '/' + me.profile.userName :
//                     (name ?  ('/' + name) : null)
//                 )

//                 return html`<li class="post">
//                     <a href="/post/${encodeURIComponent(post.key)}"
//                         class="post-image"
//                     >
//                         <img src="${url}" />
//                     </a>

//                     <div class="post-metadata">
//                         <div class="inline-avatar">
//                             ${linkUrl ?
//                                 html`<a href="${linkUrl}">
//                                     <img src="${postAvatar}" />
//                                 </a>` :
//                                 html`<img src=${postAvatar} />`
//                             }
//                         </div>

//                         <div class="content">
//                             ${linkUrl ?
//                                 html`<a class="user-name" href="${linkUrl}">
//                                     ${name || 'Anonymous'}
//                                 </a>` :
//                                 html`<span class="user-name">
//                                     ${name || 'Anonymous'}
//                                 </span>`
//                             }
//                             <p>${writing}</p>
//                         </div>

//                         <div class="icons">
//                             <div class="follow-icon">
//                                 <${FollowIcon} me=${me}
//                                     author=${post.value.author}
//                                     following=${following}
//                                     onFollow=${onFollow}
//                                     onUnfollow=${onUnfollow}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </li>`
//             }))}
//         </ul>
//     </div>`;
// }

