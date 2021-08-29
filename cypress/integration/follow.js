var URL = 'http://localhost:8888'

describe('foafs on the home page', () => {

    it('show the foafs as not directly followed', () => {
        cy.createId()

        cy.window()
            .then(win => {
                var myKeys = win.myKeys
                console.log('ma keys', myKeys)
                return cy.followFoafs(myKeys)
            })
            .then(() => {
                cy.foafPost()
                cy.visit(URL)
                cy.get('.post-list .post').first().within(() => {
                    cy.get('.follow-btn')
                        .should('not.have.class', 'is-following')
                })
            })
    })

    it('should let you follow a foaf directly', () => {
        cy.get('.post-list .post').first().within(() => {
            cy.get('.follow-btn').click()
        })

        cy.get('.post-list .post').first().within(() => {
            cy.get('.follow-btn')
                .should('have.class', 'is-following')
        })
    })

    it('should let you unfollow people', () => {
        cy.get('.post-list .post').first().within(() => {
            cy.get('.follow-btn').click()
        })

        cy.get('.post-list .post').first().within(() => {
            cy.get('.follow-btn')
                .should('not.have.class', 'is-following')
        })
    })
})
