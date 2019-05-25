//3RD-PARTY MODULES
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

//ROUTES
const publicRoutes = require('./routes/public')

//GLOBAL VARIABLES
const PORT = 3001
const app = express()

//APP SETUP
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

//ROUTES
app.use(publicRoutes)


mongoose.connect('mongodb+srv://Luther0211:testUser@cluster-node-course-oiwrr.mongodb.net/BookReviewApp?retryWrites=true', {useNewUrlParser: true})
    .then(() => {
        app.listen(PORT, console.log(`====>> APP LISTENING ON PORT ${PORT} <<====`))
    })
    .catch(err => {
        console.log('app.js line 28', err)
    })
