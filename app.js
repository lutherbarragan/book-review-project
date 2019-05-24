//3RD-PARTY MODULES
const express = require('express')

//ROUTES
const publicRoutes = require('./routes/public')

//GLOBAL VARIABLES
const PORT = 3001
const app = express()

//APP SETUP
app.set('view engine', 'ejs')
app.use(express.static('public'))

//ROUTES
app.use(publicRoutes)



app.listen(PORT, console.log(`====>> APP LISTENING ON PORT ${PORT} <<====`))