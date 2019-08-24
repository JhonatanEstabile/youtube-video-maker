const readline = require('readline-sync');
const robots = {
    text: require('./robots/text')
}

async function start() {
    const content = {
        maximumSentences: 7
    }
    
    content.searchTerm = askAndRunSearchTerm()
    content.prefix = askAndReturnPrefix()

    await robots.text(content)

    function askAndRunSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectPrefixIndex = readline.keyInSelect(prefixes, 'Chose one option: ')
        return prefixes[selectPrefixIndex]
    }

    console.log(JSON.stringify(content, null, 4))
}

start()