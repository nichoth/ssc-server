import { html } from 'htm/preact'

function EditableImg (props) {
    var { url, onSelect, title, name } = props

    return html`
        <label for="avatar-input" class="my-avatar" id="avatar-label"
            title=${title}
        >
            <img class="avatar" src="${url}" title="set avatar" />
        </label>
        <input type="file" id="avatar-input" name="${name}"
            accept="image/png, image/jpeg"
            onchange=${onSelect}
        />
    `
}

module.exports = EditableImg
