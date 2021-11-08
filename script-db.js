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

client.query(
    q.CreateCollection({ name: 'posts' })
)
    .then((ret) => console.log('**create posts**', ret))
    .catch((err) => console.error('Error: %s', err))

client.query(
    q.CreateCollection({ name: 'abouts' })
)
    .then((ret) => console.log('**create abouts**', ret))
    .catch((err) => console.error('Error: %s', err))

client.query(
    q.CreateCollection({ name: 'profiles' })
)
    .then((ret) => console.log('**create profiles**', ret))
    .catch((err) => console.error('Error: %s', err))

client.query(
    q.CreateCollection({ name: 'invitations' })
)
    .then((ret) => console.log('**create invitations**', ret))
    .catch((err) => console.error('Error: %s', err))

client.query(
    q.CreateCollection({ name: 'server-following' })
)
    .then((ret) => console.log('**create server-following**', ret))
    .catch((err) => console.error('Error: %s', err))

client.query(
    q.CreateCollection({ name: 'follow' })
)
    .then((ret) => console.log('**create follow**', ret))
    .catch((err) => console.error('Error: %s', err))
