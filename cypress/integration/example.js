/// <reference types="cypress" />

describe('example test', () => {
    it('starts', () => {
        cy.visit('http://localhost:8888')
        cy.get('h1').should('have.text', 'Hello')
    })
})
