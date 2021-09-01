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
                // @TODO
                // could do the foafoaf post here too
                cy.foafPost()
                cy.visit(URL)
                cy.get('.post-list .post').first().within(() => {
                    cy.get('.follow-btn')
                        .should('not.have.class', 'is-following')
                })
            })
    })

    // this selector works because there is only 1 post in the list,
    // and it's from the foaf
    it('should let you follow a foaf directly', () => {
        cy.get('.post-list .post').first().within(() => {
            cy.get('.follow-btn').click()
        })

        cy.get('.post-list .post').first().within(() => {
            cy.get('.follow-btn')
                .should('have.class', 'is-following')
        })

        // @TODO
        // now that we are following the foaf,
        // need to check the list to make sure the foafoaf is there

        cy.followFoafoaf()
            .then(() => cy.window())
            .then(win => {
                var bus = win.bus
                cy.foafoafPost().then((res) => {
                    console.log('foafoaf post', res)
                    bus.emit('relvantPosts.got', [res.msg])
                    // cy.get('.post-list .post').contains('foafoaf')
                })
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
