var createError = require('http-errors');
const cors = require('cors');
var express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


require('./initDB'); // 👈 triggers database and table setup

///////////// Connect API, routers ////////////////
const pokedexRouter = require('./routes/pokedex');
const gameQuesRouter = require('./routes/gameQues');
const { fetchAndCachePokemonData } = require('./services/pokedexService');
const authRouter = require('./routes/auth');
const favoriteRouter = require('./routes/favorites');
const adminRouter = require('./routes/admin');
const collectionRouter = require('./routes/myCollection');
const userRoutes = require('./routes/users');


var app = express();
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
})); // Allow frontend access

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Setup session middleware
app.use(session({
  secret: 'yourSecretKey', // keep this safe
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax', // helps with cookie delivery
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, JS) from the public folder
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
// Fetch and store Pokémon data when the server starts
fetchAndCachePokemonData();
app.use('/pokedex', pokedexRouter); // path: /pokedex
app.use('/game', gameQuesRouter);
app.use('/', authRouter);
app.use('/favorites', favoriteRouter);
app.use('/admin', adminRouter);
app.use('/collection', collectionRouter);
app.use('/user', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // for multer's uploads folder


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      // Include stack trace only in development
      error: req.app.get('env') === 'development' ? err : {}
    });
});



module.exports = app ; // exports app.js and connection (for db)
