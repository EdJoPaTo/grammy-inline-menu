const enabledEmojiTrue = '✅'
const enabledEmojiFalse = '🚫'
function enabledEmoji(truthy) {
  return truthy ? enabledEmojiTrue : enabledEmojiFalse
}

module.exports = {
  enabledEmoji,
  enabledEmojiTrue,
  enabledEmojiFalse
}
