
function getId ({ name, password }) {
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
