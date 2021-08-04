var URL = 'http://localhost:8888'

describe('foafs on the home page', () => {

    it('should have foaf messages', () => {
        cy.createId()


        cy.window()
            .then(win => {
                console.log('window', window)
                var myKeys = win.myKeys
                console.log('ma keys', myKeys)

                // cy.serverFollow(myKeys)

                return cy.followFoafs(myKeys)

                // return cy.followFoafs(myKeys)
            })
            .then(() => {
                cy.foafPost()

                cy.visit(URL)

                cy.get('.post-list .post:first p')
                    .should('have.text', 'test post content')
            })



        // cy.get('.whoami pre').then($pre => {
        //     // this actually works
        //     const txt = $pre.text()
        //     var myKeys = JSON.parse(txt)

        //     // should be able to pass this from the front end

        //     console.log('got json', myKeys)

        //     return cy.followFoafs(myKeys)
        // })



        // need to have the server follow all the users


    })

})
