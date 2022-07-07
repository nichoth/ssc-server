import { html } from 'htm/preact'

function EditableImg (props) {
    var { url, onSelect, title, name, label } = props

    return html`
        <label for=${name || 'avatar-input'} class="avatar-label"
            id=${name+'-label' || 'avatar-label'}
            title=${title}
        >
            <img class="avatar" src="${url}" title=${title} />
            ${label ? html`<span class="label-text">${label}</span>` : null}
        </label>

        <input type="file" id=${name || 'avatar-input'} name=${name}
            accept="image/png, image/jpeg"
            class="avatar-input"
            onchange=${onSelect}
        />
    `
}

module.exports = EditableImg
