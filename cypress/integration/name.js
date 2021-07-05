var URL = 'http://localhost:8888'

describe('the name field', () => {

    it('should not have a button if you dont have and id', () => {
        cy.visit(URL)
        cy.get('button.edit-pencil').should('not.exist')
    })

})

describe('create a new identity', () => {
    it('should let you create an id', () => {
        cy.visit(URL + '/whoami/create')

        cy.get('.id-source:first button[type=submit]')
            .click()

        cy.url().should('eq', URL + '/whoami')

        // should be back at the home route or something
    })
})
