const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundryDetection = require('sbd')
const watsonApiKey = require('../credentials/watson-nlu.json').apikey

var NaturalLanguageUnderstandV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
var nlu = new NaturalLanguageUnderstandV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway-syd.watsonplatform.net/natural-language-understanding/api'
})

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeyWordsOfAllSentences(content)

    async function fetchContentFromWikipedia(content) {
        const algorithminaAutenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithminaAutenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()

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

    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeyWordsOfAllSentences(content) {
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeyWords(sentence.text)
        }
    }

    async function fetchWatsonAndReturnKeyWords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error
                }

                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
    
                resolve(keywords)
            })
        })
    }
}

module.exports = robot