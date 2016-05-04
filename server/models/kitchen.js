// Load required packages
var mongoose = require('mongoose');

var kitcheSchema   = new mongoose.Schema({
	kitchenItem:[{}]
});

// Export the Mongoose model
module.exports = mongoose.model('kitchen', kitcheSchema);


