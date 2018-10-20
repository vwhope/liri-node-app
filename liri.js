////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  main entry point for liri-node-app
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ================================ BEGIN GLOBAL and ENVIRONMENT VARIABLE DEFINITIONS =======================================================
// 
//read and set any environment variables using the dotenv package
var dotenv = require("dotenv").config(); // your API key should be stored there


var keys = require("./keys.js"); // had to specify "./" because it is a file not a module
var fs = require("fs");
var request = require("request");
// var usrArgs = process.argv;
var inquirer = require("inquirer"); // need this for prompting user for info
var moment = require("moment");
var Spotify = require("node-spotify-api");

// ================================ BEGIN FUNCTION DEFINITIONS ===============================================================================
// 


// ================================ BEGIN MAIN PROCESSING ====================================================================================
// 
// apply "use strict" to entire program to throw errors in order to catch potential poor code (ex. undefined variable)
"use strict";
// 
inquirer
.prompt([
    // FIRST prompt user with four options
    {
        type: "checkbox",
        message: "What information are you seeking?",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
        name: "userSelection"
    }
]) 
.then(function(processUserInput) {
    
    // console.log(processUserInput.userSelection); // ex. [concert-this]
    
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


// CONCERT PROMPT //
function concert() {
    // console.log("You are in the concert function");
    
    inquirer
    .prompt([
        // get artist or band name
        {
            type: "input",
            message: "Search for Upcoming Concerts: (enter artist or band name): ",
            name: "userBand"
        }
        
    ]) // the callback function can be named whatever you want
    
    .then(function(processUserBand) {
        // console.log(processUserBand.userBand); // ex. U2
        var artist = processUserBand.userBand;
        // console.log("artist: " + artist);
        
        findConcert(artist);
        
    }); // end of concert inquirer.prompt
    
} // END CONCERT PROMPT

// BEGIN FIND CONCERT 
// created separate function to re-use code by option 4, random selection - keeping the user prompt section separate
function findConcert (searchConcert) {
    console.log(searchConcert);
    var artist = searchConcert;
    
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
} // END FIND CONCERT

// SONG PROMPT //
function spotify() {
    // console.log("You are in the spotify function");
    // var spotify = new Spotify(keys.spotify); // crt new obj whose properties are my keys for the API 
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
            song = "Ace of Base The Sign";
        }
        console.log("song: " + song);
        
        findSong(song);
        
    }); // END SONG inquirer.prompt
    
} // END SONG PROMPT //

// BEGIN FIND SONG  //     
function findSong (searchSong) {
    console.log(searchSong);
    var song = searchSong;
    var spotify = new Spotify(keys.spotify); // crt new obj whose properties are my keys for the API 
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
    
} // END SEARCH SONG


// MOVIE PROMPT //
function movie() {
    //  console.log("You are in the movie function");
    inquirer
    .prompt([
        {
            type: "input",
            message: "Please enter MOVIE name: ",
            name: "userMovie",
            // default: "Mr. Nobody" removed th is - didn't like how it worked on the screen - user has to type over it to enter their request
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
        findMovie(movie);
        
    }); // END MOVIE inquirer.prompt
    
} // END MOVIE PROMPT //

// BEGIN FIND MOVIE //
function findMovie (searchMovie) {
    console.log(searchMovie);
    var movie = searchMovie;
    
    
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
    
} // END FIND MOVIE // 

// WHAT //
function what() {
    // console.log("You are in the WHAT function");
    
    // Read random.txt file to determine which action to perform
    fs.readFile("random.txt", "utf8", function(error,data) {
        if(error) {
            return console.log("Error: " + error);
        }
        console.log(data);
        
        var dataArr = data.split(",");
        console.log(dataArr);
        console.log(dataArr[0]);
        console.log(dataArr[1]);
        console.log(dataArr[2]);
        console.log(dataArr[3]);
        console.log(dataArr[4]);
        console.log(dataArr[5]);
        
        

          var randomAction = (dataArr[0]);
          var randomInput = (dataArr[1]);
        
        // based on randomAction, call the matching function 
        if (randomAction === 'concert-this') {
            findConcert(randomInput);
        }
        
        else if (randomAction === 'spotify-this-song') {
            findSong(randomInput);
        }
        else if (randomAction === 'movie-this') {
            findMovie(randomInput);
        }
        else {
            console.log("Invalid Request");
        }
        
    });
     
} // END WHAT

