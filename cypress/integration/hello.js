var URL = 'http://localhost:8888'

describe('When you dont have an identity', () => {
    it('should show the `hello` route', () => {
        cy.visit(URL + '/')
        cy.url().should('equal', URL + '/hello')
        cy.contains('looks like you').should('exist')
    })

    it('should let you create a new id', () => {
        cy.get('.create-id button').click()
    })

    it ('should take you to the invitation screen', () => {
        cy.url().should('equal', URL + '/invitation')
        cy.get('.redeem-invitation-route').should('exist')
        cy.contains('need an invitation')
        cy.get('.redeem button').should('exist')
    })

    it('should show an error if the invitation is bad', () => {
        cy.get('.redeem input').type('foooooo')
        cy.get('.redeem button').click()
        cy.contains('.error', 'Error: Invalid invitation')
    })

    it('should redeem an invitation', () => {
        cy.visit(URL + '/hello')
        cy.get('.create-id button').click()
        cy.get('.redeem input').clear().type(Cypress.env('TEST_PW'))
        // console.log('bbbbbbb', Cypress.env('TEST_PW'))
        cy.get('.redeem button').click()
        cy.get('.shell').should('exist')
        cy.url().should('equal', URL + '/')
    })
})
