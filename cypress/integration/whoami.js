var URL = 'http://localhost:8888'

describe('the whoami/import route', () => {
    it('should not tell you about your id if you dont have one', () => {
        cy.visit(URL + '/whoami/import')

        cy.get('.id-source').then(() => {
            cy.contains('get rid of your local ID').should('not.exist')
        })
    })
})

describe('the whoami/create route', () => {
    it('should not warn you if its irrelevant', () => {
        cy.visit(URL + '/whoami/create')

    })
})