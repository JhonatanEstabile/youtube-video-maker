const readline = require('readline-sync')
const state = require('./state.js')

function robot() {
    const content = {
        maximumSentences: 7
    }

    content.searchTerm = askAndRunSearchTerm()
    content.prefix = askAndReturnPrefix()

    state.save(content)

    function askAndRunSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectPrefixIndex = readline.keyInSelect(prefixes, 'Chose one option: ')
        return prefixes[selectPrefixIndex]
    }
}

module.exports = robot