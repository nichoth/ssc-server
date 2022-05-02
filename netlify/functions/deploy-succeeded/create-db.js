require('dotenv').config()
var faunadb = require('faunadb')
var q = faunadb.query

if (require.main === module) {
    createFaunaDB(process.env.FAUNADB_SERVER_SECRET)
}

module.exports = createFaunaDB

function createFaunaDB (key) {
    console.log('node env', process.env.NODE_ENV)

    const client = new faunadb.Client({ secret: key })

    var collections = [
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

        ['profiles', [{
                name: 'profile-by-id',
                source: q.Collection('profiles'),
                terms: [ { field: ['data', 'value', 'content', 'about'] } ],
            },
            {
                name: 'profile-by-name',
                source: q.Collection('profiles'),
                terms: [{ field: ['data', 'value', 'content', 'name'] }]
            }]
        ],

        ['invitations'],

        // ['server-following', [
        //     {
        //         name: 'server-following-who',
        //         source: q.Collection('server-following'),
        //         terms: [ { field: ['data', 'contact'] } ]
        //     }
        // ]],

        // who is the given user following?
        ['follow', [
            {
                name: 'following',
                source: q.Collection('follow'),
                terms: [{ field: ['data', 'value', 'author'] }]
            },

            // who is following the given user?
            {
                name: 'followed',
                source: q.Collection('follow'),
                terms: [{ field: ['data', 'value', 'content', 'contact'] }]
            }
        ]]
    ]

    Promise.all(collections.map(([name, indexes]) => {
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

                return Promise.all(indexes.map(index => {
                    return client.query(
                        q.If(
                            q.Exists(q.Index(index.name)),
                            'collection -- ' + res +
                                ', index -- ' + index.name + ' exists',
                            q.CreateIndex(index)
                        )
                    )
                }))

            })
    }))
        .then((res) => {
            console.log('*created collections*', res)
        })
        .catch(err => console.log('errr', err))
}
