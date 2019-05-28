//3RD-PARTY MODULES
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

//MODELS
const User = require('./models/User')

//ROUTES
const publicRoutes = require('./routes/public')
const privateUserRoutes = require('./routes/privateUser')
const authRoutes = require('./routes/auth')

//GLOBAL VARIABLES
const PORT = 3001
const MONGODB_URI = 'mongodb+srv://Luther0211:testUser@cluster-node-course-oiwrr.mongodb.net/BookReviewApp?retryWrites=true'
const app = express()
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
  });

//APP SETUP
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    
    if(res.locals.isAuthenticated) {
        res.locals.authenticatedUserUrl = req.session.profileUrl
        req.profileUrl = req.session.profileUrl
        // console.log('APP - USER_URL:', res.locals.authenticatedUserUrl)
    }

    next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user) {
        return next();
      }
      req.user = user;

      next();
    })
    .catch(err => { 
        next(new Error(err))
    });
});


//ROUTES
app.use(publicRoutes)
app.use(authRoutes)
app.use('/user', privateUserRoutes)


mongoose.connect(MONGODB_URI, {useNewUrlParser: true})
    .then(() => {
        app.listen(PORT, console.log(`====>> APP LISTENING ON PORT ${PORT} <<====`))
    })
    .catch(err => {
        console.log('app.js line 77', err)
    })
