import { html } from 'htm/preact'
import { useState } from 'preact/hooks';

function EditableTextarea (props) {
    const { value, onSave, name } = props
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

    var _class = 'editable-textarea' +
        (isResolving ? ' resolving' : '') +
        (props.class ? (' ' + props.class) : '')

    if (isEditing) {
        return html`<form onreset=${stopEditing}
            onsubmit=${_onSave}
            class=${_class}
        >
            <textarea id=${name} name=${name} placeholder=${value} autofocus>
            </textarea>
            <button type="reset" disabled=${isResolving}>cancel</button>
            <button type="submit" disabled=${isResolving}>save</button>
        </form>`
    }

    return html`
        <${EditPencil} onClick=${_setEditing} />
        <p class="editable-textarea">${value}</p>
    `
}
    
function EditPencil (props) {
    const { onClick } = props

    return html`<button ...${props} class="edit-pencil"
        onClick=${onClick}
    >
        ✏
    </button>`
}

module.exports = EditableTextarea
// module.exports.EditPencil = EditPencil
