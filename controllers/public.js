//3RD-PARTY IMPORTS
const axios = require('axios')
const { parseString } = require('xml2js')

//SCHEMA MODELS
const User = require('../models/User')

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


exports.getSignup = (req, res, next) => {
    res.render('public/signup', {
        pageTitle: 'Signup',
        inputValues: {
            username: '',
            email: '',
            password1: '',
            password2: '',
        },
        inputErrors: [
            {param: ''},
            {param: ''},
            {param: ''},
            {param: ''},
        ]
        
    })
}

exports.postSignup = (req, res, next) => {
    const username = req.body.username
    const email = req.body.email
    const password1 = req.body.password1
    const password2 = req.body.password2
    //VERIFICATIONS    
    let validUsername = false
    let validEmail = false
    let validPassword1Length = false
    let validPassword2Match = false
    
    //Check if username is not taken
    validUsername = true
    
    //Check if email is valid && not taken
    validEmail = true

    //Check if password length is valid
    if(password1.length >= 5) validPassword1Length = true

    //Check if password2 matches password 1
    if(password1 === password2) validPassword2Match = true
  
    console.log('Username:', validUsername)
    console.log('Email:', validEmail)
    console.log('Password1Length:', validPassword1Length)
    console.log('Password2Match:', validPassword2Match)


    //VERIFY ALL INPUTS
    if(
        validUsername 
        && validEmail 
        && validPassword1Length 
        && validPassword2Match
    ) {

        const newUser = new User({
            username: username,
            email: email,
            password: password1
        })

        newUser.save()

        res.redirect('/login', {
            missingEmail: false,
            missingPassword: false,
            wrongData: false,
        })

    } else {
        res.redirect('/signup')
    }
}



exports.getLogin = (req, res, next) => {
    res.render('public/login', {
        pageTitle: 'Login',
        errors: []
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = []

    //Verify if email & password are not empty or undefined (falsey)
    if(!email) {
        errors.push({
            param: 'email=false'
        })
    }
    if(!password) {
        errors.push({
            param: 'password=false'
        })
    }

    if(email && password) {

        User.findOne({email})
            .then(user => {
                if(!user) {
                    errors.push({
                        param: 'user=false'
                    })

                    res.render('public/login', {
                        pageTitle: 'Login',
                        errors: errors
                    })
                } else {
                    console.log(user)

                    if(user.password !== password) {

                        errors.push({
                            param: 'ValidUserPassword=false'
                        })
    
                        res.render('public/login', {
                            pageTitle: 'Login',
                            errors: errors
                        })
                        
                    }

                    //Do something (login)

                }



            })
            .catch(err => console.log(err))

    } else {
        res.render('public/login', {
            pageTitle: 'Login',
            errors: errors
        })
    }



    // 
}