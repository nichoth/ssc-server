var URL = 'http://localhost:8888'

describe('the name field', () => {
    it('should not have an edit button because you dont have an id', () => {
        cy.visit(URL)
        cy.get('button.edit-pencil').should('not.exist')
    })
})

describe('/whoami/create', () => {
    it('should let you create an id', () => {
        cy.visit(URL + '/whoami/create')

        // kind of wonky way of selecting the 'create an id' button
        cy.get('.id-source:first button[type=submit]')
            .click()
    })

    it('should go back to the /whoami route', () => {
        // should be back at the whoami route
        cy.url().should('eq', URL + '/whoami')
    })

    it('should show your keys in the UI', () => {
        cy.get('.whoami pre').should('exist')
    })
})

describe('the name field', () => {
    it('should have an edit button because you now have an identity', () => {
        cy.get('button.edit-pencil').should('exist')
    })

    it('should have the name "anonymous"', () => {
        cy.get('li.name h1').contains('Anonymous')
    })
})


