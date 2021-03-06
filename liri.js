////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  liri.js - MAIN ENTRY POINT for liri-node-app   
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ================================ BEGIN GLOBAL and ENVIRONMENT VARIABLE DEFINITIONS =======================================================
// 
//read and set any environment variables using the dotenv package
var dotenv = require('dotenv').config(); // your API key should be stored there
var keys = require('./keys.js'); // had to specify './' because it is a file not a module
var fs = require('fs');
var request = require('request');
var inquirer = require('inquirer'); // need this for prompting user for info
var moment = require('moment');
var Spotify = require('node-spotify-api');

// ================================ BEGIN FUNCTION DEFINITIONS ===============================================================================
// 
// CONCERT PROMPT //
function concert() {
        
    inquirer
    .prompt([
        // get artist or band name
        {
            type: 'input',
            message: 'Search for Upcoming Concerts: (enter artist or band name): ',
            name: 'userBand',
                                     
        } // end prompt
        
    ]) 
    
    .then(function(processUserBand) {
       
        var artist = processUserBand.userBand;
        findConcert(artist);
        
    }); // end of concert inquirer.prompt
    
} // END CONCERT PROMPT


// BEGIN FIND CONCERT 
// created separate function to re-use code by option 4, random selection - keeping the user prompt section separate
function findConcert (searchConcert) {
    console.log(searchConcert);
    var artist = searchConcert;
    
    // request Bands in Town API with the user's artist/band specified
    request('https://rest.bandsintown.com/artists/' + artist + '/events?app_id=APP_ID', function(error, response, body) {
    
    // If the request is successful (i.e. if the response status code is 200)
    if (!error && response.statusCode === 200) {
        
        // Check that request was successful 
        console.log('Response: ' + JSON.stringify(response.statusCode));
        // parse the body data for retrieval  
        var parsedBody = JSON.parse(body);
        // declare local variables
        var venueName = '';
        var venueCity = '';
        var venueRegion = '';
        var venueCountry = '';
        var venueDate = '';
        // cycle through all body data
        for (i = 0; i < parsedBody.length; i++) {
            venueName = JSON.stringify(parsedBody[i].venue.name);  
            venueCity =  JSON.stringify(parsedBody[i].venue.city);  
            venueRegion = JSON.stringify(parsedBody[i].venue.region);
            venueCountry = JSON.stringify(parsedBody[i].venue.country);
            rawDate = JSON.stringify(parsedBody[i].datetime);  
            venueDate = moment(rawDate, 'YYYYMMDDT00:00:00').format('MM/DD/YYYY');
            
            // remove the boundry quotes for each value before displaying to user
            console.log('\nVenue Name: ' + venueName.substr(1, venueName.length -2));
            console.log('Venue Location: ' + venueCity.substr(1, venueCity.length -2) + ', ' + venueRegion.substr(1, venueRegion.length -2) + ' ' + venueCountry.substr(1, venueCountry.length -2));
            console.log('Concert Date: ' + venueDate);
          
            
            var venueData = ('\nVenue Name: ' + venueName.substr(1, venueName.length -2))
            + ', ' + ('Venue Location: ' + venueCity.substr(1, venueCity.length -2) + ', ' + venueRegion.substr(1, venueRegion.length -2) + ' ' + venueCountry.substr(1, venueCountry.length -2))
            + ', ' + ('Concert Date: ' + venueDate);
            
            
            // add Venue Data to log.txt
            fs.appendFile('./log.txt', venueData, 'utf8', 
            function(err) {
                if (err) throw err;
            }); // end appendFile
            
        } // end of the for loop
        
    }
   
    else {
        console.log('Error processing request.');
    }
});
} // END FIND CONCERT

// SONG PROMPT //
function spotify() {
        
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'Please enter name of a song: ',
            name: 'userSong'
        }
    ]) 
    // set a callback function, get user's song, call API
    .then(function(processUserSong) {
        // console.log(processUserSong.userSong);
        var song = processUserSong.userSong;
        // if user didn't enter a song, default to The Sign by Ace of Base
        if (song === '') {
            song = 'Ace of Base The Sign';
        }
              
        findSong(song);
        
    }); // END SONG inquirer.prompt
    
} // END SONG PROMPT //

// BEGIN FIND SONG  //     
function findSong (searchSong) {
    
    var song = searchSong;
    var spotify = new Spotify(keys.spotify); // crt new obj whose properties are my keys for the API 
    spotify
    
    .request('https://api.spotify.com/v1/search?q=' + song + '&type=track&market=US&offset=0&limit=1')
    
    .then(function(response) {
        
        var stringifyResponse = JSON.stringify(response);
        //  console.log(stringifyResponse);
        var parsed = JSON.parse(stringifyResponse);
        //  console.log(parsed);
        
        // display requested info to reader - limit is 10 songs
        for (i = 0; i < parsed.tracks.items.length; i++) {
            
            if (parsed.tracks.items[i].preview_url === null) {
                console.log('\nArtist\'s Name: ' + parsed.tracks.items[i].album.artists[0].name); // artists name 
                console.log('Song: ' + parsed.tracks.items[i].name); // song name
                console.log('Preview URL: no preview available');
                console.log('Album Name: ' + parsed.tracks.items[i].album.name);
                
                var songData = ('\nArtist\'s Name: ' + parsed.tracks.items[i].album.artists[0].name)
                + ', ' + ('Song: ' + parsed.tracks.items[i].name)
                + ', ' + ('Preview URL: no preview available')
                + ', ' + ('Album Name: ' + parsed.tracks.items[i].album.name);
                
                // add Venue Data to log.txt
                fs.appendFile('./log.txt', songData, 'utf8', 
                function(err) {
                    if (err) throw err;
                }); // end appendFile
                
            } else {
                
                console.log('\nArtist\'s Name: ' + parsed.tracks.items[i].album.artists[0].name); // artists name 
                console.log('Song: ' + parsed.tracks.items[i].name); // song name
                console.log('Preview URL: ' + parsed.tracks.items[i].preview_url); 
                console.log('Album Name: ' + parsed.tracks.items[i].album.name);
                
                var songData = ('\nArtist\'s Name: ' + parsed.tracks.items[i].album.artists[0].name)
                + ', ' + ('Song: ' + parsed.tracks.items[i].name)
                + ', ' + ('Preview URL: ' + parsed.tracks.items[i].preview_url)
                + ', ' + ('Album Name: ' + parsed.tracks.items[i].album.name);
                
                // add Venue Data to log.txt
                fs.appendFile('./log.txt', songData, 'utf8', 
                function(err) {
                    if (err) throw err;
                }); // end appendFile
            }
        }    
        
    })
    .catch(function(err) {
        console.log('Error: ' + err);
        
    })
    // END request song info using Spotify API with the user's song specified
    
} // END SEARCH SONG


// MOVIE PROMPT //
function movie() {
    
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'Please enter MOVIE name: ',
            name: 'userMovie',
        }
    ]) 
    
    // set a callback function, get user's MOVIE name, call API
    .then(function(processUserMovie) {
        
        var movie = processUserMovie.userMovie;
        // if user didn't enter a movie, pgm should default to Mr. Nobody
        if (movie === '') {
            movie = 'Mr. Nobody';
        }
       
        findMovie(movie);
        
    }); // END MOVIE inquirer.prompt
    
} // END MOVIE PROMPT //

// BEGIN FIND MOVIE //
function findMovie (searchMovie) {
    
    var movie = searchMovie;
        
    var queryUrl = 'http://www.omdbapi.com/?t=' + movie + '&y=&plot=short&apikey=trilogy';
    request(queryUrl, function(error, response, body) {
        
        // If successful request, get info
        if (!error && response.statusCode === 200) {
            
            // console.log(JSON.parse(body));
            // I know I could have just used the Year - but wanted practice with Moment.js again
            var rawMovieDate = JSON.parse(body).Released;
            var releasedYear = moment(rawMovieDate, 'DD-MMM-YYYY').format('YYYY');
            
            console.log('\nTitle: ' + JSON.parse(body).Title);
            console.log('Release Year: ' + releasedYear);
            console.log('IMDb Rating: ' + JSON.parse(body).Ratings[0].Value);
            console.log('Rotten Tomatoes Rating: ' + JSON.parse(body).Ratings[1].Value);
            console.log('Country produced: ' + JSON.parse(body).Country);
            console.log('Language: ' + JSON.parse(body).Language);
            console.log('Movie Plot: ' + JSON.parse(body).Plot);
            console.log('Actors: ' + JSON.parse(body).Actors);
            
            var movieData = ('\nTitle: ' + JSON.parse(body).Title)
            + ', ' + ('Release Year: ' + releasedYear)
            + ', ' + ('IMDb Rating: ' + JSON.parse(body).Ratings[0].Value)
            + ', ' + ('Rotten Tomatoes Rating: ' + JSON.parse(body).Ratings[1].Value)
            + ', ' + ('Country produced: ' + JSON.parse(body).Country)
            + ', ' + ('Language: ' + JSON.parse(body).Language)
            + ', ' + ('Movie Plot: ' + JSON.parse(body).Plot)
            + ', ' + ('Actors: ' + JSON.parse(body).Actors)
            
            // add Movie Data to log.txt
            fs.appendFile('./log.txt', movieData, 'utf8', 
            function(err) {
                if (err) throw err;
            }); // end appendFile
            
        }
    });
    
} // END FIND MOVIE // 

// WHAT //
function what() {
    // this part is extra - I added data to the random.txt file for each option type (band, song, movie), 
    // and then used random number genertor to determine which action to perform (band, song, or movie).
    // this also helped me test all options via the what() function to be sure they all worked.

    fs.readFile('random.txt', 'utf8', function(error,data) {
        if(error) {
            return console.log('Error: ' + error);
        }
        // console.log(data);
           
        var dataArr = data.split(',');
        
        // console.log('dataArr: ' + dataArr);
        // console.log(dataArr[0]);
        // console.log(dataArr[1]);
        // console.log(dataArr[2]);
        // console.log(dataArr[3]);
        // console.log(dataArr[4]);
        // console.log(dataArr[5]);
        
        // The random.txt file holds information for the 3 possible search options (band, song or movie).
        // Using math.random() - pgm will determine which of the three commands to run and then run it.
        // At this time, this will only work with the 3 options, all within one record.
        
        if (Math.floor(Math.random() * 3) === 0) {
            var randomAction = (dataArr[0]);
            var randomInput = (dataArr[1]);
        }
        else if (Math.floor(Math.random() * 3) === 1) {
            var randomAction = (dataArr[2]);
            var randomInput = (dataArr[3]);
        }
        else if (Math.floor(Math.random() * 3) === 2) {
            var randomAction = (dataArr[4]);
            var randomInput = (dataArr[5]);
        }
        else {
            var randomAction = (dataArr[0]);
            var randomInput = (dataArr[1]);
        };
        
        console.log('Random Action: ' + randomAction);
        console.log('Random Input: ' + randomInput);
        
        
        // based on randomAction, call the matching function 
        if (randomAction === 'concert-this') {
            randomInput = randomInput.substr(1, randomInput.length -2);
            findConcert(randomInput);
        }
        
        else if (randomAction === 'spotify-this-song') {
            findSong(randomInput);
        }
        else if (randomAction === 'movie-this') {
            findMovie(randomInput);
        }
        else {
            console.log('Invalid Request');
        }
        
    });
    
} // END WHAT
//
// ================================ BEGIN MAIN PROCESSING ====================================================================================
// 
// apply 'use strict' to entire program to throw errors in order to catch potential poor code (ex. undefined variable)
'use strict';
// 
// in the future, it might be prudent to delete the log.txt file here before each run through, and/or find ways to use/clear the log.txt file
// could use fs.unlink - example:
// fs.unlink('log.txt', function (err) {
//     if (err) throw err;
//     console.log('File log.txt deleted!');
//   });

inquirer
.prompt([
    // FIRST prompt user with four options
    {
        type: 'checkbox',
        message: 'Please select a search type.',
        choices: ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says'],
        name: 'userSelection'
    }
]) 
.then(function(processUserInput) {
    
    // console.log(processUserInput.userSelection); // ex. [concert-this]
    
    switch (processUserInput.userSelection[0]) {
        case 'concert-this':
        concert();
        break;
        
        case 'spotify-this-song':
        spotify();
        break;
        
        case 'movie-this':
        movie();
        break;
        
        case 'do-what-it-says':
        what();
        break;
    }
    
}); // end of inquirer.prompt

