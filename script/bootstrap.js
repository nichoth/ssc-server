const faunadb = require('faunadb')
const q = faunadb.query
const chalk = require('chalk')

console.log(chalk.cyan('Creating your FaunaDB Database...\n'))

// 1. Check for required enviroment variables
if (!process.env.FAUNADB_SERVER_SECRET) {
    console.log(chalk.yellow('Required FAUNADB_SERVER_SECRET enviroment variable not found.'))
    console.log(`Run "npm run bootstrap" to setup your database schema after
        adding an enironment variable "FAUNADB_SERVER_SECRET"`)
    process.exit(1)
}

// Has var. Do the thing
createFaunaDB(process.env.FAUNADB_SERVER_SECRET).then(() => {
    console.log('Fauna Database schema has been created')
})

function createFaunaDB (key) {
    console.log('Create the fauna database schema!')
    const client = new faunadb.Client({ secret: key })

    /* Based on your requirements, change the schema here */
    return client.query(q.Create(q.Ref('classes'), { name: 'todos' }))
        .then(() => {
            return client.query(
            q.Create(q.Ref('indexes'), {
                name: 'all_todos',
                source: q.Ref('classes/todos')
            }))
        }).catch((err) => {
            // Database already exists
            const notUnique = (err.requestResult.statusCode === 400 &&
                err.message === 'instance not unique')

            if (notUnique) {
                console.log('Fauna already setup! Good to go')
                console.log('Claim your fauna database with "netlify addons:auth fauna"')
                throw err
            }
        })
}