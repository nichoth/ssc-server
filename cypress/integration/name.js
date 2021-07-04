var URL = 'http://localhost:8888'

describe('the name field', () => {

    it('should not have a button if you dont have and id', () => {
        cy.visit(URL)
        cy.get('button.edit-pencil')
            .should('not.exist')
    })

})

