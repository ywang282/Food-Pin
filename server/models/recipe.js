// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var recipeSchema   = new mongoose.Schema({
	name: {type: String, required: true},
	ingredients: [{}],
	steps:[String],
	timers:[Number],
	imageURL:String,
	originalURL:String
});

// Export the Mongoose model
module.exports = mongoose.model('recipe', recipeSchema);


