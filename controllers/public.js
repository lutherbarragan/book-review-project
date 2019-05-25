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
    const username = req.body.username || '';
    const email = req.body.email || '';
    const password1 = req.body.password1 || '';
    const password2 = req.body.password2 || '';
    //VERIFICATIONS    
    let validUsername = false
    let validEmail = false
    let validPasswordLength = false
    let validPasswordMatch = false
    
    const errors = []

    //Check if username is not taken or invalid
    if(username) {
        User.findOne({username: username})
            .then(user => {
                if(user) {
                    // console.log('USERNAMES:', user.username === username)
                    validUsername = false;
                    errors.push({
                        param: 'usernameTaken=true'
                    })
                    console.log('USERNAME CHECK', errors)
                } else {
                    validUsername = true;
                }
            })
            .catch(err => console.log(err))
    } else {
        validUsername = false;
        errors.push({
            param: 'invalidUsername=true'
        })
    }
    
    //Check if email is valid && not taken or invalid
    if(email) {
        User.findOne({email: email})
            .then(user => {
                if(user) {
                    validEmail = false;
                    errors.push({
                        param: 'validEmailTaken=true'
                    })
                } else {
                    validEmail = true;
                }
            })
            .catch(err => console.log(err))
    } else { //if there's an invalid email value..
        validEmail = false;
        errors.push({
            param: 'invalidEmail=true'
        })
    }

    //Check if password length is valid
    if(password1 && password1.length >= 5) {
        validPasswordLength = true
    } else {
        validPasswordLength = false
        errors.push({
            param: 'validPasswordLength=false'
        })
    }

    //Check if password2 matches password 1
    if(password1 === password2 && password2.length >= 5) {
        validPasswordMatch = true
    } else {
        validPasswordMatch = false
        errors.push({
            param: 'validPasswordMatch=false'
        })
    }
  
    console.log('Username:', validUsername)
    console.log('Email:', validEmail)
    console.log('PasswordLength:', validPasswordLength)
    console.log('Password2Match:', validPasswordMatch)


    //VERIFY ALL INPUTS

    setTimeout(() => {
        console.log('READY: ', errors)
        if(
            validUsername 
            && validEmail 
            && validPasswordLength 
            && validPasswordMatch
        ) {
            const newUser = new User({
                username: username,
                email: email,
                password: password1
            })

            newUser.save()

            res.redirect('/login')

        } else {
            res.render('public/signup', {
                pageTitle: 'Signup',
                inputValues: {
                    username,
                    email,
                    password1,
                    password2 
                },
                inputErrors: errors
            })
        }
    }, 100)
}



exports.getLogin = (req, res, next) => {
    res.render('public/login', {
        pageTitle: 'Login',
        errors: [],
        inputData: {
            email: '',
            password: ''
        }
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email || ''
    const password = req.body.password || ''

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
                        errors: errors,
                        inputData: {
                            email,
                            password
                        }
                    })
                } else {
                    console.log(user)

                    if(user.password !== password) {

                        errors.push({
                            param: 'ValidUserPassword=false'
                        })
    
                        res.render('public/login', {
                            pageTitle: 'Login',
                            errors: errors,
                            inputData: {
                                email,
                                password
                            }
                        })
                        
                    }
                    //Do something (login)

                }
            })
            .catch(err => console.log(err))

    } else {
        res.render('public/login', {
            pageTitle: 'Login',
            errors: errors,
            inputData: {
                email,
                password
            }
        })
    }
}