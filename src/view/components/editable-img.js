import { html } from 'htm/preact'

function EditableImg (props) {
    var { url, onSelect, title, name, label } = props

    return html`
        <label for="avatar-input" class="my-avatar" id="avatar-label"
            title=${title}
        >
            <img class="avatar" src="${url}" title=${title} />
            ${label ? html`<span>${label}</span>` : null}
        </label>
        <input type="file" id="avatar-input" name="${name}"
            accept="image/png, image/jpeg"
            onchange=${onSelect}
        />
    `
}

module.exports = EditableImg
