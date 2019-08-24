const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content) {
        const algorithminaAutenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithminaAutenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaRespond = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaRespond.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkDown = removeBlanckLinesAndMarkDowns(content.sourceContentOriginal)
        const withoutDateInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkDown)

        content.sourceContentSanitized = withoutDateInParentheses

        function removeBlanckLinesAndMarkDowns(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkDown.join(' ')
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot