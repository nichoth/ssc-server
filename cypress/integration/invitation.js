require('dotenv').config()
const client = require("../../src/client")

var URL = 'http://localhost:8888'

describe('create an invitation', () => {

    it('', () => {
        cy.createId()

        cy.window()
            .then(win => {
                console.log('window', window)
                var myKeys = win.myKeys
                console.log('ma keys', myKeys)

                console.log('test pw', process.env.TEST_PW)

                return client.followMe(myKeys, process.env.TEST_PW)

                // return cy.followFoafs(myKeys)
            })

        cy.visit(URL)
    })
})
