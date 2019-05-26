//3RD-PARTY IMPORTS
const axios = require('axios')
const { parseString } = require('xml2js')

//GLOBAL VARIABLES
const { API_KEY } = require('../keys')


//---
exports.getIndex = (req, res, next) => {
    res.render('public/index', {
        pageTitle: 'Home'
    })
}

exports.postSearch = (req, res, next) => {
    const search_query = req.body.search_query
    res.redirect(`/search?q=${search_query}&page=1`)
}

exports.getSearch = (req, res, next) => {
    const search_query = req.query.q
    const page = req.query.page
    const searchBy = 'title'
    const url = req.url
    
    axios.get(`https://www.goodreads.com/search/index.xml?key=${API_KEY}&q=${search_query}&page=${page}&search[field]=${searchBy}`)
        .then(response => {
            parseString(response.data, (err, result) => {
                if(err) {
                    console.log(err)
                    res.status(500).redirect('/internal-error')
                }
                
                if(!result.GoodreadsResponse.search[0].results[0].work) {
                    res.status(404).redirect('/not-found')
                }

                console.log("===>> RESONSE DATA <<====")
                console.log('Request', result.GoodreadsResponse.Request)
                console.log('Search', result.GoodreadsResponse.search[0])
                
                const books = result.GoodreadsResponse.search[0].results[0].work.map(book => {
                    return {
                        title: book.best_book[0].title[0],
                        image_url: book.best_book[0].image_url[0],
                        author: book.best_book[0].author[0].name[0]
                    }
                })

                const pages = Math.ceil((result.GoodreadsResponse.search[0]['total-results'][0] / 20))
                const numOfPages = [];

                for(let i = 1; i <= pages; i++) {
                    numOfPages.push(i)
                }
                
                res.render('public/result', {
                    pageTitle: `Results for "${search_query}"`,
                    books,
                    searchQuery: result.GoodreadsResponse.search[0].query[0],
                    numOfResults: result.GoodreadsResponse.search[0]['total-results'][0],
                    resultStart: result.GoodreadsResponse.search[0]['results-start'][0],
                    resultEnd: result.GoodreadsResponse.search[0]['results-end'][0],
                    currentPageNum: page,
                    numOfPages,
                    url: url.split('&page=')[0]
                })

            })
        })
        .catch(error => {
            console.log('getHome Error:', error)
        });
}