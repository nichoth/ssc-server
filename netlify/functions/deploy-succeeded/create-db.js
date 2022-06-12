require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query

if (require.main === module) {
    createFaunaDB(process.env.FAUNADB_SERVER_SECRET)
}

module.exports = createFaunaDB

// https://github.com/netlify/netlify-faunadb-example/blob/master/scripts/bootstrap-fauna-database.js

function createFaunaDB (key) {
    const client = new faunadb.Client({ secret: key })

    const collections = [
        // [ collectionName, indices ]
        ['posts', [{
                name: 'post-by-author',
                source: q.Collection('posts'),
                terms: [ { field: ['data', 'value', 'author'] } ]
            },
            {
                name: 'post-by-key',
                source: q.Collection('posts'),
                terms: [{ field: ['data', 'key'] }]
            }]
        ],

        // get all profiles created by the given DID
        ['alternate', [{
                name: 'alternate-from',
                source: q.Collection('alternate'),
                terms: [ { field: ['data', 'value', 'content', 'from'] } ]
            },
            // get the DID that created this one
            {
                name: 'alternate-to',
                source: q.Collection('alternate'),
                terms: [ { field: ['data', 'value', 'content', 'to'] } ]
            }]
        ],

        ['pin'],

        ['profiles', [{
                name: 'profile-by-did',
                source: q.Collection('profiles'),
                terms: [ { field: ['data', 'value', 'content', 'about'] } ],
            },
            {
                name: 'profile-by-name',
                source: q.Collection('profiles'),
                terms: [{ field: ['data', 'value', 'content', 'name'] }]
            }]
        ],

        ['invitations', [
            {
                name: 'invitation-by-code',
                source: q.Collection('invitations'),
                terms: [{ field: ['data', 'value', 'content', 'code'] }]
            }
        ]],

        ['redemption', [
            {
                name: 'redemption-by-inviter',
                source: q.Collection('redemption'),
                terms: [{ field: ['data', 'value', 'content', 'inviter'] }]
            },
            {
                name: 'redemption-by-redeemer',
                source: q.Collection('redemption'),
                terms: [{ field: ['data', 'value', 'author'] }]
            }
        ]],

        // ['server-following', [
        //     {
        //         name: 'server-following-who',
        //         source: q.Collection('server-following'),
        //         terms: [ { field: ['data', 'contact'] } ]
        //     }
        // ]],

        ['follow', [
            // who is the given user following?
            {
                name: 'following',
                source: q.Collection('follow'),
                terms: [{ field: ['data', 'value', 'author'] }]
            },

            // does person-a follow person-b?
            {
                name: 'a_follows_b',
                source: q.Collection('follow'),
                terms: [
                    { field: ['data', 'value', 'author'] },
                    { field: ['data', 'value', 'content', 'contact'] }
                ]
            },

            // who is the given user followed by?
            {
                name: 'followed',
                source: q.Collection('follow'),
                terms: [{ field: ['data', 'value', 'content', 'contact'] }]
            }
        ]]
    ]

    return Promise.all(collections.map(([name, indexes]) => {
        return client.query(
            q.If(
                q.Exists(q.Collection(name)),
                name + ' exists',
                q.CreateCollection({ name })
            )
        )
            .then((res) => {
                // @TODO -- every collection should have an index
                if (!indexes) return ('collection -- ' + res +
                    ', no index')

                return indexes.reduce((p, index) => {
                    return p.then(() => {
                        return client.query(
                            q.If(
                                q.Exists(q.Index(index.name)),
                                'collection -- ' + res +
                                    ', index -- ' + index.name + ' exists',
                                q.CreateIndex(index)
                            )
                        )
                    })
                }, Promise.resolve())
            })
    }))
        .then((res) => {
            console.log('*created collections*', res)
            return res
        })
        .catch(err => console.log('errr', err))
}
