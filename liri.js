//read and set any environment variables using the dotenv package
var dotenv = require("dotenv").config(); // your API key should be stored there


var keys = require("./keys.js"); // had to specify "./" because it is a file not a module
var fs = require("fs");
var request = require("request");
var usrArgs = process.argv;
var inquirer = require("inquirer"); // need this for prompting user for info
var moment = require("moment");
// var spotify = new Spotify(keys.spotify); // this statement errors out, 
// not sure if it related to keyword new, the uppercase "S", or a constructor issue

/////////////////////////////
// this code works - should go in different section
// fs.readFile("random.txt", "utf8", function(error,data) {
//     if(error) {
//         return console.log(error);
//     }
//     console.log(data);
   
//     var dataArr = data.split(",");
//     console.log(dataArr);
// });

// console.log("Can you see your spotify keys here?" + JSON.stringify(keys.spotify));
// console.log(JSON.stringify(keys.spotify.id));
// console.log(JSON.stringify(keys.spotify.secret));
////////////////////////////////

// program starts here
// apply "use strict" to entire program to throw errors related to bad code (ex. undefined variable)
"use strict";
// first we have to present 4 possible options to the user
// will use .prompt - so added code at start to require the inquirer package
inquirer
  .prompt([
// FIRST prompt user with four options
{
    type: "checkbox",
    message: "What information are you seeking?",
    choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
    name: "userSelection"
}

]) // the callback function can be named whatever you want
.then(function(processUserInput) {
  console.log(processUserInput.userSelection);
 // SECOND based on userSelection, retrieve the requested information
  switch (processUserInput.userSelection[0]) {
    case "concert-this":
      concert();
      break;
    
    case "spotify-this-song":
      spotify();
      break;
    
    case "movie-this":
      movie();
      break;
    
    case "do-what-it-says":
      what();
      break;
    }
    
}); // end of inquirer.prompt

// start function definitions
// concert
function concert() {
    console.log("You are in the concert function");

    inquirer
    .prompt([
  // get artist or band name
  {
      type: "input",
      message: "Please enter an artist or band name",
      name: "userBand"
  }
  
  ]) // the callback function can be named whatever you want
  .then(function(processUserBand) {
    console.log(processUserBand.userBand);
    var artist = processUserBand.userBand;
    console.log("artist: " + artist);

    // request Bands in Town API with the user's artist/band specified
request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=0e4b38144ba15bd1c166d0dc3acd6c27", function(error, response, body) {

    // If the request is successful (i.e. if the response status code is 200)
    if (!error && response.statusCode === 200) {
  
      // Check that request was successful 
      console.log("Response: " + JSON.stringify(response.statusCode));
      // parse the body data for retrieval  
      var parsedBody = JSON.parse(body);
      var venueName = JSON.stringify(parsedBody[0].venue.name);  
      var venueCity =  JSON.stringify(parsedBody[0].venue.city);  
      var venueRegion = JSON.stringify(parsedBody[0].venue.region);
      var venueCountry = JSON.stringify(parsedBody[0].venue.country);
      var rawDate = JSON.stringify(parsedBody[0].datetime);
      //var formatDate = moment(venueDate, "20130208T09:30:00" ).format('MM/DD/YYYY');
      
      var venueDate = moment(rawDate, 'YYYYMMDDT00:00:00').format('MM/DD/YYYY'); 

    //  console.log("string venue: " + JSON.stringify(parsedBody[0].venue));

      console.log("Venue name: " + venueName);
      console.log("Venue city: " + venueCity);
      console.log("Venue region: " + venueRegion);
      console.log("Venue country: " + venueCountry);
      console.log("Concert Date: " + venueDate);
      
      
    }
    else {
        console.log("There was no event data for your selection. Enter a different artist or band");
    }
  });
  
  
  
}); // end of concert inquirer.prompt





} // end of concert()

// spotify
function spotify() {
    console.log("You are in the spotify function");
} // end of spotify()

// movie
function movie() {
    console.log("You are in the movie function");
} // end of movie()

// what
function what() {
    console.log("You are in the what function");
} // end of what()






// third we have to process the information


// present the correct information back to the user


