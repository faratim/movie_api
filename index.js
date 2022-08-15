const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');


const app = express();

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', {
    useNewURLParser: true, useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('common'));
app.use(express.static('public'));

//GET Requests
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!')
});

// GET list of all movies
app.get('/movies', (req, res) => {
    res.json('Get request returning all data for all movies');
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
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
    })
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

//Get all users
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

//Get user by username
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

//Update a user's info, by username
/* We'll expect JSON in this format
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
                req.json(updatedUser);
        }
    })
})


//Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//Listen for Requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

