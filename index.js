/* eslint-disable no-console */

// *------- IMPORTS -------* //
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const Models = require('./models');

// Express Module
const app = express();

// Mongoose Module
const Movies = Models.Movie;
const Users = Models.User;
// const URI = 'mongodb://localhost:27017/movie-api'; // Database Option 1: Local DB
// const URI = process.env.CONNECTION_URI; // Database Option 2: Hosted DB

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// File logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// Allowed Domains for Cross-Origin Resource Sharing (CORS)
const allowedOrigins = ['localhost:1234','http://localhost:8080', 'https://faraflix.herokuapp.com'];

// Date-Time Middleware
const requestTime = (req, res, next) => {
  req.requestTime = Date.now();
  next();
};

// Middleware
app.use(morgan('combined', { stream: accessLogStream }));
app.use(requestTime);
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static('public'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

app.use(cors()); // CORS Option 1: Allow all domains
// app.use(cors({ // CORS Option 2: Only allow specific domains (see the variable: allowedOrigins)
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const message = `The CORS policy for this application doesnt allow access from this origin: ${origin}`;
//       return callback(new Error(message), false);
//     }
//     return callback(null, true);
//   },
// }));

// Authentication
const auth = require('./auth')(app);
require('./passport');


// *------- REQUESTS -------* //

app.get('/', (req, res) => {
    res.send('Welcome to myFlix!')
});


// -- Movie Requests -- //

// GET - All Movies
app.get('/movies',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// GET - Single Movie Data by Name
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// GET - Genre Data by Name
app.get('/genres/:Genre', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Genre })
        .then((movie) => {
            res.json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    console.log(req);
});


// GET - Director Data by Name
app.get('/directors/:Director', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Director })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    console.log(req);
});


// GET - Release Year by Movie Name
app.get('/year/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie.ReleaseYear);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// -- User Requests -- //

// POST - New User to User List
    /* Expects JSON in the this format:
    {
        ID: Integer,
        Username: String,
        Password: String,
        Email: String,
        Birthday: Date
    }*/
    app.post(
        '/users',
        [
          check('Username', 'Username is required').isLength({ min: 5 }),
          check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
          check('Password', 'Password is required').not().isEmpty(),
          check('Email', 'Email does not appear to be valid').isEmail(),
        ],
      
        (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
          }
          const hashedPassword = Users.hashPassword(req.body.Password);
          Users.findOne({ Username: req.body.Username })
            .then((user) => {
              if (user) {
                res.status(400).send(`${req.body.Username} already exists`);
              }
              Users.create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
              })
                .then((createdUser) => { res.status(201).json(createdUser); })
                .catch((error) => {
                  console.error(error);
                  res.status(500).send(`Error: ${error}`);
                });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send(`Error: ${error}`);
            });
        },
      );


//PUT - Update User Info by Username
    /* Expects JSON in this format:
    {
        Username: String, (required)
        Password: String, (required)
        Email: String, (required)
        Birthday: Date
    }*/
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    [
        check('Username', 'Username is required.').isLength({ min: 5 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required.').not().isEmpty(),
        check('Email', 'Email does not appear to be valid.').isEmail()
    ], (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    }
    
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set:
            {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                console.log(updatedUser);
                res.json(updatedUser);
            }
        });
});


// POST - Add Movie to Favorites List
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $push: { FavoriteMovies: req.params.MovieID }
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


// DELETE - Remove Movie from Favorites List
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $pull: { FavoriteMovies: req.params.MovieID }
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


// DELETE - User by Username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for Requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});

/* FOR LOCAL HOSTING IF NEEDED */
// app.listen(8080, () => {
//     console.log('Your app is listening on port 8080.');
// });