// const { blobHash } = require('../util')
const { getHash: blobHash } = require('@nichoth/blob-store')
const BASE = 'http://localhost:8888'

module.exports = {
    create: createAlternate
}

async function createAlternate ({ ssc, keystore, newKeystore, profile }) {
    if (!newKeystore) return Promise.reject(new Error('Missing keystore'))
    if (!profile) return Promise.reject(new Error('Missing profile'))
    const { username, image, desc } = profile

    if (!username) return Promise.reject(
        new Error('must include username'))

    if (!image) return Promise.reject(
        new Error('must include an image')
    )

    // if we are passed an image, set _hash to the right hash
    const hash = await blobHash(image)

    // create a msg signed by the old DID
    return ssc.getDidFromKeys(keystore)
        .then(oldDid => {
            return ssc.getDidFromKeys(newKeystore)
                .then(newDid => {
                    return { oldDid, newDid }
                })
        })
        .then(({ newDid, oldDid }) => {
            // create a msg from oldDid that says
            // "newDid is an alternate ID for me"
            // (we sign with the existing `keystore` here)
            return Promise.all([
                ssc.createMsg(newKeystore, null, {
                    type: 'about',
                    about: newDid,
                    username,
                    desc: desc || null,
                    image: hash
                }),

                ssc.createMsg(keystore, null, {
                    type: 'alternate',
                    from: oldDid,
                    to: newDid
                })
            ])
        })
        .then(([newProfile, altMsg]) => {
            // @TODO -- need to create a second message for the profile

            // post the 'alternate' message
            // server-side -- need to check that the message is valid,
            //   and check that we are following the oldDid
            return fetch(BASE + '/api/alternate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    altMsg,
                    newProfile,
                    file: image
                })
            })
        })
        .then(res => {
            if (!res.ok) return res.text().then(text => {
                throw new Error(text)
            })

            return res.json()
        })
}
