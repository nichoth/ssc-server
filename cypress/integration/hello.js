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
        cy.get('.redeem-invitation-route').should('exist')
        cy.contains('need an invitation')
        cy.get('.redeem button').should('exist')
    })

    it('should redeem an invitation', () => {
        // console.log('bbbbbbb', Cypress.env('TEST_PW'))
        cy.get('.redeem input').type(Cypress.env('TEST_PW'))
        cy.get('.redeem button').click()
    })
})
