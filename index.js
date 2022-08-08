const express = require('express'),
    morgan = require('morgan');

const app = express();

let topMovies = [
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
app.post('/users', (req, res) => {
    res.send(`POST request that checks for existing user, if user doesn't exist, it adds the user to the list`);
})

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