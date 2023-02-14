// *------- IMPORTS ------- //

const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
require('./passport');

/**
 * Creates JWT (expiring in 7 days, using HS256 algorithm to encode)
 * @param {object} user
 * @returns user object, jwt, and additional information on token
 * @function generateJWTToken
 */
const generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256',
    });
};

/**
 * Handles user login, generating a JWT upon login
 * Request body: A JSON object holding Username and Password.
 * @name postLogin
 * @kind function
 * @param router
 * @returns A JSON object holding the user object and JWT
 * @requires passport
 */
module.exports = (router) => {
    router.post(
        '/login',
        [
            check('Username', 'Username is required').isLength({ min: 5 }),
            check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
            check('Password', 'Password is required').not().isEmpty(),
        ],
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            passport.authenticate('local', { session: false }, (error, user, info) => {
                if (error || !user) {
                    return res.status(400).json({
                        message: 'Something is not right.',
                        user: user,
                    });
                }
                req.login(user, { session: false }, (err) => {
                    if (err) {
                        res.send(err);
                    }
                    const token = generateJWTToken(user.toJSON());
                    return res.json({ user, token });
                });
            })(req, res);
        }
    );
};
