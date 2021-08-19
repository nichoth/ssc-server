require('dotenv').config()
const client = require("../../src/client")()

var URL = 'http://localhost:8888'

describe('invitation route', () => {
    it('doesnt show the invitation nav if you dont have an id', () => {
        cy.visit(URL)

        cy.get('.nav-part').should('exist')
            .then(() => {
                return cy.get('.create-inv').should('not.exist');
            })
    })

    it('shows invitation nav if the server is following you', () => {
        cy.createId()

        cy.window()
            .then(win => {
                console.log('window', window)
                var myKeys = win.myKeys
                console.log('ma keys', myKeys)
                console.log('test pw', Cypress.env('TEST_PW'))

                return client.followMe(myKeys, Cypress.env('TEST_PW'))
            })
            .then(() => {
                // server is now following you,
                // so create an invitation

                cy.visit(URL)

                cy.get('.create-inv').should('exist');

            })

    })

    it('lets you create an invitation', () => {

        cy.get('.create-inv').click()



        // return fetch(URL + '/.netlify/functions/create-invitation', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         publicKey: keys.public,
        //         msg: ssc.createMsg(keys, null, {
        //             type: 'invitation',
        //             from: keys.id
        //         })
        //     })
        // })
        //     .then(res => res.json())
    })
})
