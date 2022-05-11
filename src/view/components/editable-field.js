import { html } from 'htm/preact'
import { useState } from 'preact/hooks';

function EditableField (props) {
    var { value, onSave, name } = props
    var [isEditing, setEditing] = useState(false)
    var [isResolving, setResolving] = useState(false)

    function _setEditing (ev) {
        ev.preventDefault()
        setEditing(true)
    }

    function stopEditing (ev) {
        ev.preventDefault()
        setEditing(false)
    }

    function _onSave (ev) {
        ev.preventDefault()
        var val = ev.target.elements[name].value
        setResolving(true)
        onSave(val)
            .then(() => {
                setResolving(false)
                setEditing(false)
            })
            .catch(err => {
                setResolving(false)
                console.log('errrrrr', err)
            })
    }

    var _class = 'editable-field' +
        (isResolving ? ' resolving' : '') +
        (props.class ? (' ' + props.class) : '')

    if (isEditing) {
        return html`<form onreset=${stopEditing}
            onsubmit=${_onSave}
            class=${_class}
        >
            <input name=${name} id=${name} placeholder="${value}" />
            <button type="reset" disabled=${isResolving}>cancel</button>
            <button type="submit" disabled=${isResolving}>save</button>
        </form>`;
    }

    return html`
        <h1>${value}</h1>

        <!-- pencil emoji -->
        <button class="edit-pencil"
            onClick=${_setEditing}
            title="edit"
        >
            ✏
        </button>
    `
}

module.exports = EditableField
