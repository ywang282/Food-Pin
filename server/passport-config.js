var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField : 'name',
		passwordField : 'password',
        passReqToCallback : true
	},
	function(req, name, password, done) {
        
        User.findOne({'name' : name}, function(err, user) {
			if(err)
				return done(err);
            
            //check if user already exists in database
			if(user) {
				return done(null, false);
			} else {
				var newUser = new User();
				
				newUser.name = name;
				newUser.password = newUser.generateHash(password);
                newUser.email = req.body.email;
                newUser.favorite = [];
                newUser.kitchen = "empty";

				newUser.save(function(err) {
					if(err)
						throw err;
					return done(null, newUser);
				});
			}
			
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'name',
		passwordField: 'password',
	},
	function(name, password, done) {
		User.findOne({'name': name}, function(err, user) {
			if(err)
				return done(err);
			if(!user)
				return done(null, false);
			if(!user.validPassword(password))
				return done(null, false);
			return done(null, user);

		});
	}));

};