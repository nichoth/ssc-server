var URL = 'http://localhost:8888'

describe('the first page you see, without an account', () => {
    it('should show some rubbish about making an account', () => {
        cy.visit(URL)
        cy.get('.home-route').should('exist')
            // .then(() => {
            //     return cy.get('.create-inv').should('not.exist');
            // })
    })
})
