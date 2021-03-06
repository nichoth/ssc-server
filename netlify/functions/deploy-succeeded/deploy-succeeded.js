const createDB = require('./create-db')

exports.handler = function (ev, ctx) {
    console.log('Creating your FaunaDB Database...\n')

    // 1. Check for required enviroment variables
    if (!process.env.FAUNADB_SERVER_SECRET) {
        console.log('Required FAUNADB_SERVER_SECRET enviroment variable not found.')
        console.log(`Run "npm run bootstrap" to setup your database schema after
            adding an enironment variable "FAUNADB_SERVER_SECRET"`)
        process.exit(1)
    }

    // Has var. Do the thing
    return createDB(process.env.FAUNADB_SERVER_SECRET).then(() => {
        console.log('Fauna Database schema has been created')
    }).catch(err => {
        console.log('*db create err*', err)
    })
}
