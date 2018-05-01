// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
// load up the user model
var User            = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {
    // passport session setup ==================================================

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'pwd',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
        function(req, email, password, done) {
        

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                logger.info('user found')
                return done({error:'This email is already taken.'} )
               // return done({message:'That email is already taken.'});
                //return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                let newUser  = new User();
                newUser.fname = req.body.fname
                newUser.lname = req.body.lname
                newUser.email    = req.body.email;
                newUser.pwd = newUser.generateHash(req.body.pwd);
                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });    

        });

    }));

// login
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'pwd',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done({error:'No user found.'} )
                // return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(req.body.pwd))
                return done({error:'Oops! Wrong password.'} )
                // return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};
