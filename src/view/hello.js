var MY_URL = 'https://ssc-server.netlify.app'
import { html } from 'htm/preact'
var Keys = require('../keys')
var evs = require('../EVENTS')
// import { useEffect, useState } from 'preact/hooks';
import { useEffect } from 'preact/hooks';

function Hello (props) {
    console.log('hello props', props)
    var { emit, setRoute } = props

    function createLocalId (ev) {
        ev.preventDefault()
        var keys = Keys.create()
        console.log('create local id', keys)
        emit(evs.keys.got, { source: null, secrets: keys })

        // set this here for the cypress tests
        if (process.env.NODE_ENV === 'test') {
            window.myKeys = keys
        }

        setRoute('/invitation')
    }

    useEffect(() => {
        document.body.classList.add('hello')
        
        // returned function will be called on component unmount 
        return () => {
            document.body.classList.remove('hello')
        }
    }, [])

    return html`<div class="hello">
        <h1>Hello</h1>
        <p class="need-id">It looks like you don't have an identity. You
            can create one here.
        </p>

        <div class="id-sources">
            <div class="id-source create-id">
                <h2>Create a local identity</h2>
                ${(props.me.secrets && props.me.secrets.id) ?
                    html`<p>This will destroy your current ID</p>` :
                    null
                } 
                <button type="submit" onClick=${createLocalId}>Create</button>
            </div>

            <div class="id-source">
                <h2>Load an identity from a server</h2>
                <h2>Use <code>${MY_URL}</code> as an ID server</h2>
            </div>
        </div>
    </div>`
}

module.exports = Hello
