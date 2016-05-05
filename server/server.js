// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Recipe = require('./models/recipe');
var Kitchen = require('./models/kitchen');
var User = require('./models/user');
var bodyParser = require('body-parser');
var router = express.Router();
var passport = require('passport');
var session = require('express-session');

//replace this with your Mongolab URL
mongoose.connect('mongodb://ywang282:FPywang282@ds019471.mlab.com:19471/cs498finalproject');

require('./passport-config')(passport);

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

//Initialize express session
app.use(session({ secret: 'recipe treasure trove' }));

//Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

function isLoggedIn(req, res, next) {
		if(req.isAuthenticated())
			return next();

		res.json({
			error: "User not logged in"
		});
}

//Login route
var loginRoute = router.route('/login');
loginRoute.post(passport.authenticate('local-login'), function(req, res) {
    var result = {};
    result.data = req.user._id;
    res.status(200);
    res.json(result);
    return;
});

//User route

//Signup route
var signupRoute = router.route('/signup');
// signup: POST, Create a new user. Respond with details of the new user
signupRoute.post(function(req, res) {
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
  
  //use passport authentication
  passport.authenticate('local-signup', function(err, user, info) {
        if (err) {
          return next(err); // will generate a 500 error
        }
        // Generate a JSON response reflecting authentication status
        if (! user) {
          return res.send({ success : false, message : 'authentication failed' });
        }
        // ***********************************************************************
        // "Note that when using a custom callback, it becomes the application's
        // responsibility to establish a session (by calling req.login()) and send
        // a response."
        // Source: http://passportjs.org/docs
        // ***********************************************************************
        req.login(user, function(err){
          if (err) {
            return next(loginErr);
          }
          var result  = {};
            result.message = "Successfully signed up";
            result.data = req.user;
            res.status(200);
            res.json(result);
            return;
        });      
      })(req, res);
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

var userRoute = router.route('/login/:id');

userRoute.get(function(req, res) {
  var id = req.params.id;
  User.find({_id:id}, function(err, user) {
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
      result.message = "FAIL, the user is not found";
      result.data = [];
      res.status(404);
      res.json(result);
      return;
    }
    else{
        var result = {};
        result.message = "Found the user successfully";
        result.data = user;
        res.status(200);
        res.json(result);
    }
  });
});

var kitchensRoute = router.route('/kitchens');

kitchensRoute.get(function(req, res) {

  Kitchen.find(function(err, kitchen) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
    }
    
    var result = {};
    result.message = "OK, a list of kitchens is returned";
    result.data = kitchen;
    res.status(200);
    res.json(result);
  });
});

var kitchenRoute = router.route('/kitchen/:id');

kitchenRoute.get(function(req, res) {
  var id = req.params.id;
  Kitchen.find({_id:id}, function(err, kitchen) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
      return;
    }
    if (JSON.stringify(kitchen) === JSON.stringify([])){
      var result = {};
      result.message = "FAIL, the kitchen is not found";
      result.data = [];
      res.status(404);
      res.json(result);
      return;
    }
    else{
        var result = {};
        result.message = "Found the kitchen successfully";
        result.data = kitchen;
        res.status(200);
        res.json(result);
    }
  });
});

kitchenRoute.put(function(req, res) {
  var id = req.params.id;
  var item = req.body.item;
  var amount = req.body.amount;
  var unit = req.body.unit;

  Kitchen.findOne({_id:id}, function(err, kitchen) {
    if (err) {
      var result = {};
      result.message = "Mongo failed, error: " + err;
      result.data = [];
      res.status(500);
      res.json(result);
      return;
    }
    if (kitchen === null){
      var result = {};
      result.message = "FAIL, the kitchen is not found";
      result.data = [];
      res.status(404);
      res.json(result);
      return;
    }
    else{
        var addFlag = true;

        for (var i = 0; i < kitchen.kitchenItem.length; ++i){
          if (kitchen.kitchenItem[i].item===item){
            kitchen.kitchenItem[i].amount = amount;
            kitchen.kitchenItem[i].unit = unit;
            addFlag = false;
          }
        }

        if (addFlag){
          var newItem = {
            "item":item,
            "amount":amount,
            "unit":unit
          };
          kitchen.kitchenItem.push(newItem);
        }
        
        kitchen.save(function(err) {
          if (err) {
            var result = {};
            result.message = "Mongo failed, error: " + err;
            result.data = [];
            res.status(500);
            res.json(result);
            return;
          }
            var result = {};
            result.message = "updated kitchen";
            result.data = kitchen;
            res.status(200);
            res.json(result);
            return;
        });
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
