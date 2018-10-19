//read and set any environment variables using the dotenv package
var dotenv = require("dotenv").config(); // your API key should be stored there


var keys = require("./keys.js"); // had to specify "./" because it is a file not a module
var fs = require("fs");
var request = require("request");
var usrArgs = process.argv;
var inquirer = require("inquirer"); // need this for prompting user for info
var moment = require("moment");
var Spotify = require("node-spotify-api");

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
// CONCERT //
function concert() {
    // console.log("You are in the concert function");
    
    inquirer
    .prompt([
        // get artist or band name
        {
            type: "input",
            message: "Please enter an artist or band name: ",
            name: "userBand"
        }
        
    ]) // the callback function can be named whatever you want
    .then(function(processUserBand) {
        console.log(processUserBand.userBand);
        var artist = processUserBand.userBand;
        console.log("artist: " + artist);
        
        // request Bands in Town API with the user's artist/band specified
        request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=APP_ID", function(error, response, body) {
        
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            
            // Check that request was successful 
            console.log("Response: " + JSON.stringify(response.statusCode));
            // parse the body data for retrieval  
            var parsedBody = JSON.parse(body);
            // declare local variables
            var venueName = "";
            var venueCity = "";
            var venueRegion = "";
            var venueCountry = "";
            var venueDate = "";
            // cycle through all body data
            for (i = 0; i < parsedBody.length; i++) {
                venueName = JSON.stringify(parsedBody[i].venue.name);  
                venueCity =  JSON.stringify(parsedBody[i].venue.city);  
                venueRegion = JSON.stringify(parsedBody[i].venue.region);
                venueCountry = JSON.stringify(parsedBody[i].venue.country);
                rawDate = JSON.stringify(parsedBody[i].datetime);  
                venueDate = moment(rawDate, 'YYYYMMDDT00:00:00').format('MM/DD/YYYY');
                
                // remove the boundry quotes for each value before displaying to user
                console.log("\nVenue Name: " + venueName.substr(1, venueName.length -2));
                console.log("Venue Location: " + venueCity.substr(1, venueCity.length -2) + ", " + venueRegion.substr(1, venueRegion.length -2) + " " + venueCountry.substr(1, venueCountry.length -2));
                console.log("Concert Date: " + venueDate);
            }
            
        }
        else {
            console.log("Error retrieving request.");
        }
    });
    
}); // end of concert inquirer.prompt

} // end of concert()

// SPOTIFY //
function spotify() {
    //  console.log("You are in the spotify function");
    
    var spotify = new Spotify(keys.spotify); // crt new obj whose properties are my keys for the API 
    // see different ways to access the keys
    // console.log("spotify variable: " + spotify); // [object Object]
    // console.log("stringified keys.spotify variable:" + JSON.stringify(keys.spotify)); // { "id" : "xxx" , "secret" : "xxx"}
    // console.log(JSON.stringify(keys.spotify.id)); // shows code
    // console.log(JSON.stringify(keys.spotify.secret)); // shows code
    
    inquirer
    .prompt([
        {
            type: "input",
            message: "Please enter name of a song: ",
            name: "userSong"
        }
        
    ]) 
    // set a callback function, get user's song, call API
    .then(function(processUserSong) {
        console.log(processUserSong.userSong);
        var song = processUserSong.userSong;
        // if user didn't enter a song, default to The Sign by Ace of Base
        if (song === "") {
            song = "The Sign AND Ace of Base";
        }
        
        console.log("song: " + song);
        
        spotify
        // query request to spotify API
        .request("https://api.spotify.com/v1/search?q=" + song + "&type=track&market=US&offset=0&limit=10")
        
        // if request has no errors process and display information
        .then(function(response) {
            
            var stringifyResponse = JSON.stringify(response);
            //  console.log(stringifyResponse);
            var parsed = JSON.parse(stringifyResponse);
            //  console.log(parsed);
            
            // display requested info to reader - limit is 10 songs
            for (i = 0; i < parsed.tracks.items.length; i++) {
                
                if (parsed.tracks.items[i].preview_url === null) {
                    console.log("\nArtist's Name: " + parsed.tracks.items[i].album.artists[0].name); // artists name 
                    console.log("Song: " + parsed.tracks.items[i].name); // song name
                    console.log("Preview URL: no preview available");
                    console.log("Album Name: " + parsed.tracks.items[i].album.name);
                } else {
                    
                    console.log("\nArtist's Name: " + parsed.tracks.items[i].album.artists[0].name); // artists name 
                    console.log("Song: " + parsed.tracks.items[i].name); // song name
                    console.log("Preview URL: " + parsed.tracks.items[i].preview_url); // artists name or album name?
                    console.log("Album Name: " + parsed.tracks.items[i].album.name);
                }
            }    
            
        })
        .catch(function(err) {
            console.log("Error: " + err);
            
        })
        // END request song info using Spotify API with the user's song specified
        
    }); // END SONG inquirer.prompt
    
} // end of spotify()




// MOVIE //
function movie() {
    console.log("You are in the movie function");
    
    inquirer
    .prompt([
        {
            type: "input",
            message: "Please enter MOVIE name: ",
            name: "userMovie",
           // default: "Mr. Nobody"
        }
    ]) 
    
    // set a callback function, get user's MOVIE name, call API
    .then(function(processUserMovie) {
        console.log(processUserMovie.userMovie);
        var movie = processUserMovie.userMovie;
        // if user didn't enter a movie, pgm should default to Mr. Nobody
        if (movie === "") {
            movie = "Mr. Nobody";
        }
        
        // console.log("Movie: " + movie);
        
        var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";
        request(queryUrl, function(error, response, body) {
        
          // If successful request, get info
          if (!error && response.statusCode === 200) {
          
          // console.log(JSON.parse(body));
          // I know I could have just used the Year - but wanted practice with Moment.js again
          var rawMovieDate = JSON.parse(body).Released;
          var releasedYear = moment(rawMovieDate, 'DD-MMM-YYYY').format('YYYY');

          console.log("\nTitle: " + JSON.parse(body).Title);
          console.log("Release Year: " + releasedYear);
          console.log("IMDb Rating: " + JSON.parse(body).Ratings[0].Value);
          console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
          console.log("Country produced: " + JSON.parse(body).Country);
          console.log("Language: " + JSON.parse(body).Language);
          console.log("Movie Plot: " + JSON.parse(body).Plot);
          console.log("Actors: " + JSON.parse(body).Actors);
           }
        });
            
    }); // END MOVIE inquirer.prompt
        
} // end of movie()
    
    
    
    
    
    
    
    
    
    
    
    
    
    // WHAT //
    function what() {
        console.log("You are in the WHAT function");


    // Read random file to determine which action to perform
    fs.readFile("random.txt", "utf8", function(error,data) {
        if(error) {
            return console.log("Error: " + error);
        }
        console.log(data);

        var dataArr = data.split(",");

        var randomAction = (dataArr[0]);
        var randomInput = (dataArr[1]);

        

    });









    } // end of what()
    
    
    
    
    
    
    // third we have to process the information
    
    
    // present the correct information back to the user
    
    
    