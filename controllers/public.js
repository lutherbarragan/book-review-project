//3RD-PARTY IMPORTS
const axios = require('axios')
const { parseString } = require('xml2js')

//MODELS 
const Review = require('../models/Review')

//GLOBAL VARIABLES
const API_KEY = process.env.GOODREADS_API


//---
exports.getIndex = (req, res, next) => {
    res.render('public/index', {
        pageTitle: 'Home',
        pageRoute: '/'
    })
}

exports.postSearch = (req, res, next) => {
    const search_query = req.body.search_query
    const search_by = req.body.search_by
    console.log("::>>POST SEARCH<<::", search_query, search_by)
    res.redirect(`/search?q=${search_query}&search_by=${search_by}&page=1`)
}

exports.getSearch = (req, res, next) => {
    const search_query = req.query.q
    const page = req.query.page
    const searchBy = req.query.search_by
    const url = req.url
    
    axios.get(`https://www.goodreads.com/search/index.xml?key=${API_KEY}&q=${search_query}&page=${page}&search[field]=${searchBy}`)
        .then(response => {
            parseString(response.data, (err, result) => {
                if(err) {
                    console.log(err)
                    res.status(500).redirect('/internal-error')
                }

                console.log("===>> RESONSE DATA <<====")
                console.log('Request', result.GoodreadsResponse.Request)
                console.log('Search', result.GoodreadsResponse.search[0])
                let books = [];

                // console.log(result.GoodreadsResponse.search[0]['total-results'][0])
                if(result.GoodreadsResponse.search[0]['total-results'][0] > 0) {
                    books = result.GoodreadsResponse.search[0].results[0].work.map(book => {
                        // console.log(book.best_book[0].id[0]._)
                        return {
                            title: book.best_book[0].title[0],
                            image_url: book.best_book[0].image_url[0],
                            author: book.best_book[0].author[0].name[0],
                            bookId: book.best_book[0].id[0]._
                        }
                    })
                }

                const pages = Math.ceil((result.GoodreadsResponse.search[0]['total-results'][0] / 20))
                const numOfPages = [];

                for(let i = 1; i <= pages; i++) {
                    numOfPages.push(i)
                }
                
                res.render('public/result', {
                    pageTitle: `Results for "${search_query}"`,
                    pageRoute: '/results',
                    books,
                    searchQuery: result.GoodreadsResponse.search[0].query[0],
                    numOfResults: result.GoodreadsResponse.search[0]['total-results'][0],
                    resultStart: result.GoodreadsResponse.search[0]['results-start'][0],
                    resultEnd: result.GoodreadsResponse.search[0]['results-end'][0],
                    url: url.split('&page=')[0],
                    
                    currentPage: +page,
                    isNextPage: +page < pages,
                    isPrevPage: +page > 1,
                    nextPage: +page + 1,
                    prevPage: +page - 1,
                    lastPage: numOfPages.length
                })

            })
        })
        .catch(error => {
            console.log('getHome Error:', error)
        });
}


exports.getBook = (req, res, next) => {
    const bookId = req.params.bookId;
    let reviewsArray;

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
            console.log(bookData.similar_books[0].book)

            const publicationYear = `${bookData.publication_month[0]} /${bookData.publication_day[0]}/${bookData.publication_year[0]}`

            
            Review.find({bookId: bookId})
                .populate('author')
                .exec((err, reviews) => {
                    let review = bookData.description[0].split('<br /><br />')
                    let isBookSaved = false;

                    //Round avg rating
                    let avgRating = +bookData.average_rating[0].split('.')[0]
                    let ratingArr = [];
                    
                    for(let i = 1; i <= 5; i++) {
                        if(i <= avgRating) {ratingArr.push("*")}
                        else {ratingArr.push("-")}
                    }

                    if(req.user) {
                        isBookSaved = req.user.savedBooks.find(b => b.bookId === bookId) ? true : false
                    }

                    console.log("::::::::::REVIEWS::::::::::")
                    console.log(reviews)
    
                    res.render('public/book', {
                        pageTitle: bookData.title[0],
                        pageRoute: '/book',
                        bookTitle: bookData.title[0],
                        author: bookData.authors[0].author[0].name,
                        authorId: bookData.authors[0].author[0].id,
                        bookCoverUrl: bookData.image_url[0],
                        numOfPages: bookData.num_pages[0],
                        avgRating: ratingArr,
                        review: review,
                        bookId,
                        reviews: reviews,
                        isBookSaved,
                        publicationYear,
                        publisher: bookData.publisher[0],
                        language: bookData.language_code[0],
                        format: bookData.format[0],
                        isbn: bookData.isbn[0]
                    })
                })
        })
    })
    .catch(err => console.log(err))
}

exports.postReview = (req, res, next) => {
    const bookId = +req.params.bookId
    const bookTitle = req.body.bookTitle
    const reviewTitle = req.body.title.trim()
    const reviewReview = req.body.review.trim()
    let reviewRating = [];

    for (let i = 1; i <= 5; i++) {
        if(i <= req.body.rating) {
            reviewRating.push('*')
        } else {
            reviewRating.push('-')
        }
    }

    console.log(reviewRating)

    console.log('BOOK TITLE', bookTitle)
    if(reviewTitle && reviewReview && reviewRating && req.user) {
        const newReview = new Review({
            bookId: bookId,
            bookTitle: bookTitle,
            title: reviewTitle,
            review: reviewReview,
            rating: reviewRating,
            author: req.user._id
        })
        newReview.save();
        req.user.reviews.push(newReview._id)
        req.user.save()
        console.log(':::::BOOK SAVED::::::')
        res.redirect(`/book/${bookId}`)

    } else {
        res.redirect(`/book/${bookId}`)
    }

}

exports.saveBook = (req, res, next) => {
    if(!req.user) {
        res.redirect('/login')
    }
    
    const bookId = req.params.bookId;
    const bookImage = req.body.bookImage;
    const bookTitle = req.body.bookTitle
    const user = req.user;

    user.savedBooks.push({
        bookId,
        bookTitle,
        bookImage
    })

    user.save();

    res.redirect(`/book/${bookId}`)
}

exports.deleteBook = (req, res, next) => {
    if(!req.user) {
        res.redirect('/login')
    }

    const bookId = req.params.bookId;
    const user = req.user;

    const newSavedBooks = user.savedBooks.filter(b => b.bookId !== bookId);

    user.savedBooks = newSavedBooks;
    user.save();

    res.redirect(`/book/${bookId}`)
}