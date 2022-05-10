/// <reference types="cypress" />

describe('example to-do app', () => {
    it('starts', () => {
        cy.visit('https://example.cypress.io/todo')
        cy.get('body').should('exist')
    })
})
