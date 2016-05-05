// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define our user schema
var userSchema   = new mongoose.Schema({
	name: {type: String, required: true},
	password:{type: String, required: true},
	email:{type: String, required: true},
	favorite: [String],
	kitchen: String
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

// Export the Mongoose model
module.exports = mongoose.model('user', userSchema);


