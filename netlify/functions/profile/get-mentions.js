function getMentions (msg) {
    return msg.content.mentions
}

getMentions.first = function getFirstMention (msg) {
    return msg.content.mentions[0]
}

module.exports = getMentions
