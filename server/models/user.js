// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var userSchema   = new mongoose.Schema({
	name: {type: String, required: true},
	password:{type: String, required: true},
	email:{type: String, required: true},
	favorite: [String],
	kitchen: String
});

// Export the Mongoose model
module.exports = mongoose.model('user', userSchema);


