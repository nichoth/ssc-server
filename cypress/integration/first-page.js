var URL = 'http://localhost:8888'

describe('the first page you see, without an account', () => {
    it('should show some rubbish about making an account', () => {
        cy.visit(URL)
        cy.get('.need-id').should('exist')
    })

    it('should have a link to create an id', () => {
        cy.get('.need-id a').click()
    })

    it('should create a local id', () => {
        cy.get('.create-id button').click()
        cy.url().should('equal', URL + '/whoami')
    })
})
