//3RD-PARTY IMPORTS
const axios = require('axios')
const { parseString } = require('xml2js')

//GLOBAL VARIABLES
const { API_KEY } = require('../keys')


//---
exports.getIndex = (req, res, next) => {
    res.render('public/index')
}

exports.postSearch = (req, res, next) => {
    const search_query = req.body.search_query
    res.redirect(`/search?q=${search_query}&page=1`)
}

exports.getSearch = (req, res, next) => {
    const search_query = req.query.q
    const page = req.query.page
    
    axios.get(`https://www.goodreads.com/search/index.xml?key=${API_KEY}&q=${search_query}&page=${page}`)
        .then(response => {
            parseString(response.data, (err, result) => {
                if(err) {
                    console.log(err)
                    res.status(500).redirect('/internal-error')
                }
                
                if(!result.GoodreadsResponse.search[0].results[0].work) {
                    res.status(404).redirect('/not-found')
                }

                // console.log(result.GoodreadsResponse.Request)
                console.log(result.GoodreadsResponse.search[0])
                
                const books = result.GoodreadsResponse.search[0].results[0].work.map(book => {
                    return {
                        title: book.best_book[0].title[0],
                        image_url: book.best_book[0].image_url[0],
                        author: book.best_book[0].author[0].name[0]
                    }
                })
                
                res.render('public/result', {
                    books,
                    searchQuery: result.GoodreadsResponse.search[0].query[0],
                    numOfResults: result.GoodreadsResponse.search[0]['total-results'][0],
                    resultStart: result.GoodreadsResponse.search[0]['results-start'][0],
                    resultEnd: result.GoodreadsResponse.search[0]['results-end'][0]
                })

            })
        })
        .catch(error => {
            console.error('getHome Error:', error)
        });
}