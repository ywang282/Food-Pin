// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Recipe = require('./models/recipe');
var User = require('./models/user');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://ywang282:FPywang282@ds019471.mlab.com:19471/cs498finalproject');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

//Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

var loginRoute = router.route('/login');

// login: POST, Create a new user. Respond with details of the new user
loginRoute.post(function(req, res) {

  var name = req.body.name;
  var password = req.body.password;
  var email = req.body.email;

  // validate user input
  if (name === undefined || password === undefined || email === undefined){
    var result  = {};
    result.message = "Bad request. User cannot be created without a name, password or email.";
    result.data = [];
    res.status(400);
    res.json(result);
    return;
  }

  // create a new user
  var newUser = User({
    name: name,
    password: password,
    email: email,
    favorite: [],
    kitchen: "empty"
  });


  // check if another user of the same name exist in the same database
  User.find({ name: name }, function(err, user) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
    }
    if (JSON.stringify(user) === JSON.stringify([])){
      newUser.save(function(err) {
        if (err) {
          var result = {};
          result.message = "Mongo failed, error: " + err;
          result.data = [];
          res.status(500);
          res.json(result);
        }
        var result = {};
        result.message = "OK, a new user is created";
        result.data = newUser;
        res.status(201);
        res.json(result);
      });
    }
    else{
      var result  = {};
      result.message = "This user already exists";
      result.data = user;
      res.status(400);
      res.json(result);
    }
  });
});


loginRoute.get(function(req, res) {

  var query = req.query;
  var name = query.name;
  var password = query.password;

  User.find({name:name}, function(err, user) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
      return;
    }
    if (JSON.stringify(user) === JSON.stringify([])){
      var result = {};
      result.message = "You havent signed up yet.";
      result.data = [];
      res.status(404);
      res.json(result);
      return;
    }
    else{
      if (user[0].password === password){
        var result = {};
        result.message = "Successfully logged in";
        result.data = user;
        res.status(200);
        res.json(result);
        return;
      }
      else{
        var result = {};
        result.message = "Username does not match password.";
        result.data = [];
        res.status(200);
        res.json(result);
        return;
      }
    }
  });
});


var loginAllRoute = router.route('/logins');

loginAllRoute.get(function(req, res) {

  // check if another user of the same name exist in the same database
  User.find(function(err, user) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
    }
    
    var result = {};
    result.message = "OK, a list of user is returned";
    result.data = user;
    res.status(200);
    res.json(result);
  });
});

var userRoute = router.route('/logins/:name');

//DELETE: Delete specified recipe or 404 error
userRoute.delete(function(req, res) {
  var name = req.params.name;
  User.remove({name:name}, function(err, user) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
      return;
    }
    console.log(user);
    if (JSON.stringify(user) === JSON.stringify([])){
      var result = {};
      result.message = "FAIL, the user is not found";
      result.data = [];
      res.status(404);
      res.json(result);
      return;
    }
    else{
        var result = {};
        result.message = "Deleted";
        result.data = [];
        res.status(200);
        res.json(result);
    }
  });
});

//recipes route here
var recipesRoute = router.route('/recipes');

// recipes: GET, Respond with a list of recipe
recipesRoute.get(function(req, res) {
	Recipe.find({}, function(err, recipe) {
      if (err) {
        var result = {};
        result.message = "Mongo failed, error: " + err;
        result.data = [];
        res.status(500);
        res.json(result);
      }
      var result = {};
      result.message = "OK";
      result.data = recipe;
      res.status(200);
      res.json(result);
    });
});

// recipes: POST, Create a new recipe. Respond with details of the new recipe
recipesRoute.post(function(req, res) {

  var name = req.body.name;
  var ingredients = req.body.ingredients;
  var steps = req.body.steps;
  var timers = req.body.timers;
  var imageURL = req.body.imageURL === undefined? "NA" : req.body.imageURL;
  var originalURL =  req.body.originalURL === undefined? "NA" : req.body.originalURL;

  // validate recipe input
  if (name.length === 0){
    var result  = {};
    result.message = "Bad request. Recipe cannot be created without a name.";
    result.data = [];
    res.status(400);
    res.json(result);
    return;
  }

  // create a new recipe
  var newRecipe = Recipe({
    name: name,
    ingredients: ingredients,
    steps: steps,
    timers: timers,
    imageURL: imageURL,
    originalURL: originalURL
  });


  // check if another recipe of the same name exist in the same database
  Recipe.find({ name: name }, function(err, recipe) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
    }
    if (JSON.stringify(recipe) === JSON.stringify([])){
      newRecipe.save(function(err) {
        if (err) {
          var result = {};
          result.message = "Mongo failed, error: " + err;
          result.data = [];
          res.status(500);
          res.json(result);
        }
        var result = {};
        result.message = "OK, a new recipe is created";
        result.data = newRecipe;
        res.status(201);
        res.json(result);
      });
    }
    else{
      var result  = {};
      result.message = "This recipe already exists";
      result.data = recipe;
      res.status(400);
      res.json(result);
    }
  });
});


var recipeRoute = router.route('/recipes/:id');

//GET: Respond with details of specified recipe or 404 error
recipeRoute.get(function(req, res) {
  var id = req.params.id;
  Recipe.findById(id, function(err, recipe) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
      return;
    }
    if (JSON.stringify(recipe) === JSON.stringify([])){
      var result = {};
      result.message = "FAIL, the recipe is not found";
      result.data = [];
      res.status(404);
      res.json(result);
      return;
    }
    else{
      var result = {};
      result.message = "OK";
      result.data = recipe;
      res.status(200);
      res.json(result);
      return;
    }
  });
});

//PUT: Replace recipe user with supplied recipe or 404 error
recipeRoute.put(function(req, res) {

  // get all the parameter values
  var name = req.body.name;
  var ingredients = req.body.ingredients;
  var steps = req.body.steps;
  var timers = req.body.timers;
  var imageURL = req.body.imageURL === undefined? "NA" : req.body.imageURL;
  var originalURL =  req.body.originalURL === undefined? "NA" : req.body.originalURL;

  var id = req.params.id;

  // validate user input
  if (name.length === 0){
    var result  = {};
    result.message = "FAIL. Recipe cannot be created (or updated) without a name";
    result.data = [];
    res.status(400);
    res.json(result);
    return;
  }


  Recipe.findById(id, function(err, recipe) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
      return;
    }
    
    if ( recipe === null){
      var result = {};
      result.message = "FAIL, the recipe is not found";
      result.data = [];
      res.status(404);
      res.json(result);
      return;
    }
    else{
      recipe.name = name;
      recipe.ingredients = ingredients;
      recipe.steps = steps;
      recipe.timers = timers;
      recipe.imageURL = imageURL;
      recipe.originalURL = originalURL;


      recipe.save(function(err) {
        if (err) {
          var result = {};
          result.message = "Mongo failed, error: " + err;
          result.data = [];
          res.status(500);
          res.json(result);
          return;
        }
        var result = {};
        result.message = "updated recipe";
        result.data = [];
        res.status(200);
        res.json(result);
        return;
      });
    }
  });
});

//DELETE: Delete specified recipe or 404 error
recipeRoute.delete(function(req, res) {

  var id = req.params.id;
  Recipe.findById(id, function(err, recipe) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
      return;
    }
    if ( recipe === null){
      var result = {};
      result.message = "FAIL, the recipe is not found";
      result.data = [];
      res.status(404);
      res.json(result);
    }
    else{
      recipe.remove(function(err) {
        if (err) {
          var result = {};
          result.message = "Mongo failed, error: " + err;
          result.data = [];
          res.status(500);
          res.json(result);
          return;
        }
        var result = {};
        result.message = "Deleted";
        result.data = [];
        res.status(200);
        res.json(result);
        return
      });
    }
  });
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
