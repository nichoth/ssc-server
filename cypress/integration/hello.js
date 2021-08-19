var URL = 'http://localhost:8888'

describe('When you dont have an identity', () => {
    it('should show the `hello` route', () => {
        cy.visit(URL + '/')
        cy.url().should('equal', URL + '/hello')
    })
})
