
function getId ({ name, password }) {
    // ev.preventDefault()
    // var els = ev.target.elements
    // // console.log('ev', ev)
    // // console.log('els', els)
    // console.log('name', els['login-name'].value)
    // console.log('pword', els['password'].value)

    // var name = els['login-name'].value
    // var password = els['password'].value

    return fetch('/.netlify/functions/id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            loginName: name,
            password: password
        })
    })
        .then(res => res.json())
}

module.exports = getId
