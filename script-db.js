require('dotenv').config()
var faunadb = require('faunadb')

var q = faunadb.query
var sec = (process.env.BRANCH ==='test' || process.env.NODE_ENV === 'test') ?
    process.env.FAUNADB_SERVER_SECRET_TEST :
    process.env.FAUNADB_SERVER_SECRET

var client = new faunadb.Client({
    secret: sec,
    domain: 'db.us.fauna.com'
})

console.log('node env', process.env.NODE_ENV)
console.log('secret', process.env.FAUNADB_SERVER_SECRET_TEST)
console.log('sec', sec)

// this will create the necessary collections and indices for the
// DB defined by the env variable FAUNADB_SERVER_SECRET or
// FAUNADB_SERVER_SECRET_TEST

var collections = [
    // [ collectionName, index ]
    ['posts', {
        name: 'post-by-author',
        source: q.Collection('posts'),
        terms: [
            { field: ['data', 'value', 'author'] },
        ]
    }],
    ['abouts'],
    ['profiles'],
    ['invitations'],
    ['server-following'],
    ['follow']
]

Promise.all(collections.map(([name, index]) => {
    return client.query(
        q.If(
            q.Exists(q.Collection(name)),
            name + ' exists',
            // q.Do(
                // this doesn't work b/c of the cache
            //     q.Delete(q.Collection(name)),
            //     q.CreateCollection({ name })
            // ),
            q.CreateCollection({ name })
        )
    )
        .then((res) => {
            if (!index) return ('collection -- ' + res +
                ', no index')

            return client.query(
                q.If(
                    q.Exists(q.Index(index.name)),
                    'collection -- ' + res +
                        ', index -- ' + index.name + ' exists',
                    q.CreateIndex(index)
                )
            )
        })
}))
    .then((res) => {
        console.log('created collections', res)
    })
    .catch(err => console.log('errr', err))
