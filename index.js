// IMPORTS
const bodyParser = require('body-parser'),
    express = require('express'),
    morgan = require('morgan'),
    uuid = require('uuid'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    path = require('path'),
    Models = require(path.resolve(__dirname, './models'));
const { check, validationResult } = require('express-validator');

// Configure Express
const app = express();

// Configure Mongoose Module
const Movies = Models.Movie,
    Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect('mongodb+srv://faratim:timfara@myflixdb.iymuhs6.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'myFlixDB',
});

// Configure logging file access
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
    flags: 'a',
});

// Configure Date-Time Middleware
const requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
};

// Configuring CORS (Cross-Origin-Resource-Sharing)
const cors = require('cors');
//app.use(cors()); // Option 1: allow all domains
// Option 2: only allow domains in 'allowed origins'
let allowedOrigins = [
    '*',
    'http://localhost:4200',
    'http://localhost:54802/',
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:1234',
    'https://faraflix.herokuapp.com',
    'https://my-flixx.netlify.app',
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                // If a specific origin isn’t found on the list of allowed origins
                let message = 'The CORS policy for this application doesn"t allow access from origin ' + origin;
                return callback(new Error(message), false);
            }
            return callback(null, true);
        },
    })
);

// use Middleware
app.use(morgan('combined', { stream: accessLogStream }));
app.use(requestTime);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));

// Authentication
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//ROUTING
//Home
app.get('/', (req, res) => {
    res.send('Welcome to the myFlix App!');
});

// READ - Gets a list of all the movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// READ -Gets data about single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movie) => {
            if (movie) {
                res.status(200).json(movie);
            } else {
                res.status(404).send(`The movie titled "${req.params.title}" was not found in the database.`);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// READ - Get data about a genre by name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { genreName } = req.params;
    Movies.findOne({ 'Genre.Name': genreName })
        .then((movie) => {
            if (movie) {
                console.log(movie.Genre);
                res.status(200).json(movie.Genre);
            } else {
                res.status(404).send(`The genre "${genreName}" is not part of this database.`);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// READ - Get data about a director by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { directorName } = req.params;
    Movies.findOne({ 'Director.Name': directorName })
        .then((movie) => {
            if (movie) {
                res.status(200).json(movie.Director);
            } else {
                res.status(404).send(`A director with the name of "${directorName}" was not found in this database.`);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// CREATE - Allow new users to register
app.post(
    '/users',
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non-alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail(),
    ],
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + ' already exists');
                } else {
                    Users.create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday,
                    })
                        .then((user) => {
                            res.status(201).json(user);
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    }
);

// READ - Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// READ - Get user by username
app.get('/users/:userName', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { userName } = req.params;
    console.log(userName);
    Users.findOne({ Username: userName })
        .then((user) => {
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(401).send(`A user with the username "${userName}" does not exist.`);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// UPDATE - Allow users to update their user info
app.put(
    '/users/:Username',
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non-alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
    ],
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $set: {
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                },
            },
            { new: true },
            (err, updatedUser) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error ' + err);
                } else {
                    res.json(updatedUser);
                }
            }
        );
    }
);

// CREATE - Allow user to add a movie to their list of favorites
app.post('/users/:Username/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $push: { FavoriteMovies: req.params.MovieID } }, { new: true }, (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// DELETE - Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, movieID } = req.params;

    Users.findOneAndUpdate({ Username: req.params.Username }, { $pull: { FavoriteMovies: movieID } }, { new: true })
        .then((user) => {
            res.status(200).send(`The movie with ID ${movieID} has been successfully removed from ${user.Username}'s favorites list`);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// DELETE user by ID- Allow users to deregister
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ _id: req.params.id })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.id + ' was not found.');
            } else {
                res.status(200).send(req.params.id + ' was deleted.');
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error from delete' + err);
        });
});

// Server & Heroku
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
