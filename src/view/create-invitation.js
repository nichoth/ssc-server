import { html } from 'htm/preact'
const { Button, TextInput } = require('@nichoth/forms/preact')
const { admins } = require('../config.json')
var ssc = require('@nichoth/ssc/web')
import { useState, useEffect } from 'preact/hooks'
const evs = require('../EVENTS')
const CopyIcon = require('./components/copy-solid.js')

function CreateInvitation (props) {
    const { me, feeds, emit, client, invitations } = props
    const [isResolving, setResolving] = useState(false)
    const [invCode, setInvCode] = useState(null)
    const [hasCopied, setCopied] = useState(false)
    const isAdmin = admins.some(admin => admin.did === me.did)

    console.log('invitation props', props)

    useEffect(() => {
        if (invitations) return
        if (!me || !me.did) return
        if (!isAdmin) return

        client.getInvitations()
            .then(res => emit(evs.invitation.got, res))
            .catch(err => {
                console.log('arg', err)
            })
    }, [me.did])

    if (!isAdmin) return html`<div class="route create-invitation">
        <div>You must have admin status to create an invitation</div>
    </div>`

    function createInv (ev) {
        ev.preventDefault()
        const note = ev.target.note.value

        client.createInvitation(me.keys, { note })
            .then(res => {
                setResolving(false)
                setCopied(false)
                setInvCode(res.value.content.code)
                emit(evs.invitation.new, res)
            })
            .catch(err => {
                console.log('err creating invitation', err)
            })
    }

    function copy (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(invCode)
        setCopied(true)
    }

    function revoke (ev) {

    }

    return html`<div class="route create-invitation">
        ${invCode ?
            html`<button class="copy" onClick=${copy} title="copy">
                <${CopyIcon} />
            </button>

            ${hasCopied ? html`<span class="has-copied">Copied!</span>` : null}

            <dl class="invitation-code">
                <dt>Invitation code</dt>
                <dd>${invCode}</dd>
            </dl>` :
            null
        }

        <p>
            This server is usable by invitation only. Create a new invitation here.
        </p>

        <p>
            This code should be copy and pasted to whoever you want to invite.
        </p>

        <form onsubmit=${createInv} class="invitation-form">
            <${TextInput} name="note" displayName="note"
                minlength="1" required=${false}
            />

            <${Button} disabled=${isResolving} type="submit"
                isSpinning=${isResolving}
            >
                Create an invitation
            <//>
        </form>

        ${invitations && invitations.length ?
            html`<h2>Pending Invitations</h2>
            <ul class="pending-invitations">
                ${[
                    html`<li class="inv-head">
                        <span>author</span>
                        <span>note</span>
                    </li>`
                ].concat(invitations.map(inv => {
                    console.log('inv.value.author', inv.value.author)
                    console.log('me.profile', me.profile)

                    console.log('eq???', inv.value.author === me.did)

                    const invAuthor = (inv.value.author === me.did ?
                        me.profile :
                        ((feeds || {})[inv.value.author] || {}).profile || {})

                    console.log('author', invAuthor)


                    // TODO -- use `feeds` key in state

                    return html`<li class="pending-invitation">
                        <span class="invitation-author">
                            <a href=${'/@' + invAuthor.username}>
                                ${invAuthor.username}
                            </a>
                        </span>

                        <span class="invitation-note">
                            ${inv.value.content.note || html`<em>none</em>`}
                        </span>

                        <span class="revoke-inv">
                            <button onclick=${revoke}>
                                revoke
                            </button>
                        </span>
                    </li>`
                }))}
            </ul>` :
            null
        }
    </div>`
}

module.exports = CreateInvitation
