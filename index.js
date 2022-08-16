// **~~~~~~~  IMPORTS  ~~~~~~~** //

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');


// Initiate Express
const app = express();


// Initiate Mongoose Module
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', {
    useNewURLParser: true, useUnifiedTopology: true
});


// Use Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('common'));
app.use(express.static('public'));



// **~~~~~~~  REQUESTS  ~~~~~~~** //

app.get('/', (req, res) => {
    res.send('Welcome to myFlix!')
});


// -- Movie Requests -- //

// GET - All Movies
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
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
app.get('/genres/:Genre', (req, res) => {
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
app.get('/directors/:Director', (req, res) => {
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
app.get('/year/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(toString(movie.ReleaseYear));
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
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists.');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
        
                
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
    })
});


//PUT - Update User Info by Username
    /* Expects JSON in this format:
    {
        Username: String, (required)
        Password: String, (required)
        Email: String, (required)
        Birthday: Date
    }*/
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set:
            {
                Username: req.body.Username,
                Password: req.body.Password,
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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


// GET - All Users
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// GET - User by Username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});