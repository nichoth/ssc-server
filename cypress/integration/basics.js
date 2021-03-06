/// <reference types="cypress" />

// this is for *after* you have saved a profile for the given admin,
// and added the DID to the `config.json.admins` list
// cypress uses the same DID on repeated runs

// this is something that you should do via the GUI in cypress
// after it boots for the first time

describe('example test', () => {
    it('starts', () => {
        cy.visit('http://localhost:8888')
        cy.get('.pin-content p').should('have.text', 'wooo')
        cy.get('h1').should('have.text', 'cypress-tester')
    })
})
