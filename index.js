const express = require('express'),
    morgan = require('morgan');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Models = require('./models.js');

mongoose.connect('mongodb://localhost:27017/myFlixDB', {
    useNewURLParser: true, useUnifiedTopology: true
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Movies = Models.Movie;
const Users = Models.User;

let allMovies = [
    {
        title: 'Shawshank Redemption',
        year: '1994'
    },
    {
        title: 'Forrest Gump',
        year: '1994'
    },
    {
        title: 'Inception',
        year: '2010'
    },
    {
        title: 'The Matrix',
        year: '1999'
    },
    {
        title: 'Star Wars',
        year: '1977'
    },
    {
        title: 'The Usual Suspects',
        year: '1995'
    },
    {
        title: 'Saw',
        year: '2004'
    },
    {
        title: 'Memento',
        year: '2000'
    },
    {
        title: 'Die Hard',
        year: '1988'
    },
    {
        title: 'Jurassic Park',
        year: '1993'
    }

];

app.use(morgan('common'));
app.use(express.static('public'));

//GET Requests
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!')
});

// GET list of all movies
app.get('/movies', (req, res) => {
    res.json(allMovies);
});

// GET data about a single movie
app.get('/movies/:title', (req, res) => {
    res.send('GET request returning all data for a specific movie.');
});

// GET data about a genre by name
app.get('/movies/genres/:name', (req, res) => {
    res.send('GET request returning all data for a specific genre.');
});

// GET data about a Director by name
app.get('/movies/directors/:name', (req, res) => {
    res.send('GET request returning all data for a specific director.');
});

// POST a new user to the user list
/* We'll expect JSON in the this format
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
        });
});


// POST a new movie to the favorites list
app.post('/users/:name/movies/:MovieID', (req, res) => {
    res.send('POST new movie name to list of favorite movies');
});

// DELETE a movie from the favorites list
app.delete('/users/:name/movies/:MovieID', (req, res) => {
    res.send('DELETE a movie from the favorites list.');
});

// DELETE a user from the database
app.delete('/users/:name', (req, res) => {
    res.send('DELETE a user from the database.');
});




//Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//Listen for Requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

