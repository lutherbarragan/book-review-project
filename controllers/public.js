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
                    // console.log(book.best_book[0].id[0]._)
                    return {
                        title: book.best_book[0].title[0],
                        image_url: book.best_book[0].image_url[0],
                        author: book.best_book[0].author[0].name[0],
                        bookId: book.best_book[0].id[0]._
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


exports.getBook = (req, res, next) => {
    const bookId = req.params.bookId;

    axios.get(`https://www.goodreads.com/book/show/${bookId}.json?key=${API_KEY}`)
    .then(book => {
        if(!book) {
            res.redirect('/')
        }
        parseString(book.data, (err, result) => {
            if(err) {
                console.log(err)
                res.status(500).redirect('/internal-error')
            }
            const bookData = result.GoodreadsResponse.book[0]
            console.log(bookData)

            //EXAMPLE RESPONSE
            // { 
            //     id: [ '7624' ],
            //     title: [ 'Lord of the Flies' ],
            //     isbn: [ '0140283331' ],
            //     isbn13: [ '9780140283334' ],
            //     asin: [ '' ],
            //     kindle_asin: [ '' ],
            //     marketplace_id: [ '' ],
            //     country_code: [ 'MX' ],
            //     image_url:
            //     [ 'https://images.gr-assets.com/books/1327869409m/7624.jpg' ],
            //     small_image_url:
            //     [ 'https://images.gr-assets.com/books/1327869409s/7624.jpg' ],
            //     publication_year: [ '1999' ],
            //     publication_month: [ '10' ],
            //     publication_day: [ '1' ],
            //     publisher: [ 'Penguin Books ' ],
            //     language_code: [ 'eng' ],
            //     is_ebook: [ 'false' ],
            //     description:
            //     [ 'At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys. At first, with no adult supervision, their freedom is something
            //     to celebrate; this far from civilization the boys can do anything they want. Anything. They attempt to forge their own society, failing, however, in the face of terror, sin and evil. And as order collapses, as strange howls echo in the night, as terror begins its reign, the hope of adventure seems as far from reality as the hope of being rescued. Labeled a parable, an allegory, a myth, a morality tale, a parody, a political treatise, even a vision of the apocalypse, Lord of the Flies is perhaps our most memorable novel about “the end of innocence, the darkness of man’s heart.”' ],
            //     work:
            //     [ { id: [Array],
            //         books_count: [Array],
            //         best_book_id: [Array],
            //         reviews_count: [Array],
            //         ratings_sum: [Array],
            //         ratings_count: [Array],
            //         text_reviews_count: [Array],
            //         original_publication_year: [Array],
            //         original_publication_month: [Array],
            //         original_publication_day: [Array],
            //         original_title: [Array],
            //         original_language_id: [Array],
            //         media_type: [Array],
            //         rating_dist: [Array],
            //         desc_user_id: [Array],
            //         default_chaptering_book_id: [Array],
            //         default_description_language_code: [Array] } ],
            //     average_rating: [ '3.67' ],
            //     num_pages: [ '182' ],
            //     format: [ 'Paperback' ],
            //     edition_information: [ 'Penguin Great Books of the 20th Century' ],
            //     ratings_count: [ '1862583' ],
            //     text_reviews_count: [ '24635' ],
            //     url:
            //     [ 'https://www.goodreads.com/book/show/7624.Lord_of_the_Flies' ],
            //     link:
            //     [ 'https://www.goodreads.com/book/show/7624.Lord_of_the_Flies' ],
            //     authors: [ { author: [Array] } ],
            //     popular_shelves: [ { shelf: [Array] } ],
            //     book_links: [ { book_link: [Array] } ],
            //     buy_links: [ { buy_link: [Array] } ],
            //     series_works: [ '\n    \n  ' ],
            //     similar_books: [ { book: [Array] } ] 
            // }

            res.render('public/book', {
                pageTitle: bookData.title[0],
                bookTitle: bookData.title[0],
                author: bookData.authors[0].author[0].name,
                authorId: bookData.authors[0].author[0].id,
                bookCoverUrl: bookData.image_url[0],
                numOfPages: bookData.num_pages[0],
                avgRating: bookData.average_rating[0],
                description: bookData.description[0]
            })

        })
    })
    .catch(err => console.log(err))


}