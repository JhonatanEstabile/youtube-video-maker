const readline = require('readline-sync');
const robots = {
    text: require('./robots/test')
}

function start() {
    const content = {}
    
    content.searchTerm = askAndRunSearchTerm()
    content.prefix = askAndReturnPrefix()

    robots.text(content)

    function askAndRunSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectPrefixIndex = readline.keyInSelect(prefixes, 'Chose one option: ')
        return prefixes[selectPrefixIndex]
    }
}

start()