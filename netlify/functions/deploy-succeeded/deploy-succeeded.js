// import chalk from 'chalk'
const createDB = require('./create-db')

console.log('aaaaaaaaaaaaaaaaaaa')

exports.handler = async function (ev, ctx) {
    console.log('wooooooooooooooooooooo')
    console.log('deploy success')

    console.log('Creating your FaunaDB Database...\n')
    // console.log(chalk.cyan('Creating your FaunaDB Database...\n'))

    // 1. Check for required enviroment variables
    if (!process.env.FAUNADB_SERVER_SECRET) {
        console.log('Required FAUNADB_SERVER_SECRET enviroment variable not found.')
        // console.log(chalk.yellow('Required FAUNADB_SERVER_SECRET enviroment variable not found.'))
        console.log(`Run "npm run bootstrap" to setup your database schema after
            adding an enironment variable "FAUNADB_SERVER_SECRET"`)
        process.exit(1)
    }

    // Has var. Do the thing
    console.log('has the env var')
    createDB(process.env.FAUNADB_SERVER_SECRET).then(() => {
        console.log('Fauna Database schema has been created')
        // console.log(chalk.green('Fauna Database schema has been created'))
    })
}
