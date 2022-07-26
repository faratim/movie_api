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

app.get('/movies', (req, res) => {
    res.json(topMovies);
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