//read and set any environment variables using the dotenv package
var dotenv = require("dotenv").config(); // your API key should be stored there


var keys = require("./keys.js"); // had to specify "./" because it is a file not a module
var fs = require("fs");
var request = require("request");
var usrArgs = process.argv;
// var spotify = new Spotify(keys.spotify); // this statement errors out, 
// not sure if it related to keyword new, the uppercase "S", or a constructor issue



fs.readFile("random.txt", "utf8", function(error,data) {
    if(error) {
        return console.log(error);
    }
    console.log(data);
   
    var dataArr = data.split(",");
    console.log(dataArr);
});

console.log("Can you see your spotify keys here?" + JSON.stringify(keys.spotify));
console.log(JSON.stringify(keys.spotify.id));
console.log(JSON.stringify(keys.spotify.secret));