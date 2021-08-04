var URL = 'http://localhost:8888'

describe('foafs on the home page', () => {

    it('should show foaf posts', () => {
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

                cy.get('.post-list .post:first p')
                    .should('have.text', 'foaf test')
            })
    })

})
