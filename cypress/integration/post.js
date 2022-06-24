/// <reference types="cypress" />

describe('make a post', () => {
    it('should navigate to the post form', () => {
        cy.visit('http://localhost:8888/new')
        cy.get('.route.new-post').should('exist')
        cy.get('#image-input').attachFile('coffee.jpg')
        cy.get('#caption').type('hello testing')

        cy.get('.controls button[type="submit"]').click()
        cy.url().should('include', '/post')
    })
})
