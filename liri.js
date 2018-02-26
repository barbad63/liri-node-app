require("dotenv").config();
const keys = require('./keys.js');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var fs = require("fs");
const inquirer = require("inquirer");

//Variables and defaults section:
//Twitter
var params = {screen_name: 'DonBarbarits', count: 20};
var client = new Twitter(keys.twitter);
var twitterInfo;
//OMDB
var movieName = encodeURI("Mr Nobody"); //default movie
var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
var rotten; //rating we are looking for
var filmInfo; //String containing the requested film information
//Spotify
var spotify = new Spotify(keys.spotify);
var songReq; //Song requested by the user
var spotifyInfo; //String containing the requested song information
//Do what it says
var filePath = "./random.txt"
var cmdInput =[];
var cmdLine = [];

function twitLiri(){
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if(error) {
			throw error;
   		} else {
   			//This will show your last 20 tweets and when they were created
   			twitterInfo = "\nDon Barbarits' last 20 tweets: ";
   			for (var i = 0; i < tweets.length; i++) { 
   				twitterInfo += "\n" + i + ". Tweet created at: " + tweets[i].created_at +
   								"\n   Tweet Text: " + tweets[i].text;
   			}
   			console.log(twitterInfo);  // Last 20 to console
   			writeLog(twittersInfo)
   		}
	});
}

function spotifyLiri(){
	spotify.search({ type:'track', query:songReq }, function(err, data) {
 		if (err) {
   			return console.log('Error occurred: ' + err);
 		}
 		spotifyInfo = "\nArtist Name(s): ";
		var nmbr_artists =  data.tracks.items[0].artists.length;
 		for (var i = 0; i < nmbr_artists; i++) {
			spotifyInfo += data.tracks.items[0].artists[i].name + " ";
		}
 		spotifyInfo += "\nSong Name: " + data.tracks.items[0].name +
 						"\nPreview Link of the song: " + data.tracks.items[0].preview_url +
 						"\nAlbum Name: " + data.tracks.items[0].album.name;
		console.log(spotifyInfo);
		writeLog(spotifyInfo);

	});
}

function movieLiri(){
	// Then create a request to the queryUrl
	request(queryUrl, function(err, resp, body){
	// If request is successful then process the body data
		if (!err && resp.statusCode == 200){
			var filmData = JSON.parse(body)
			for (var i = 0; i < filmData.Ratings.length; i++) {
				if(filmData.Ratings[i].Source === 'Rotten Tomatoes') {
					rotten = filmData.Ratings[i].Value;
				} else {
					rotten = "unknown";
				}
			}
			filmInfo = "\nTitle of the movie: "+filmData.Title+
					"\nYear the movie came out: "+filmData.Year+
					"\nIMDB Rating of the movie: "+filmData.imdbRating+
					"\nRotten Tomatoes Rating of the movie: "+rotten+
					"\nCountry where the movie was produced: "+filmData.Country+
					"\nLanguage of the movie: "+filmData.Language+
					"\nPlot of the movie: "+filmData.Plot+
					"\nActors in the movie: "+filmData.Actors;
					console.log(filmInfo);
			writeLog(filmInfo);
		}
	});
}
function writeLog(data) {
	fs.appendFile("log.txt", data, function(err){
		if (err){
			console.log(err);
		}
	});
}

function parsExec() {
// In case there were more commands in the test file, process each line in the cmdLine array
	for (var i = 0; i < cmdLine.length; i++) {
	//cmdInput is a global variable array type
        cmdInput = cmdLine[i].split(",");

		var todoCmd = cmdInput[0];
	    var todoInp = cmdInput[1];
	    console.log("cmdIn0 " + cmdInput[0]);
	    console.log("cmdIn1 " + cmdInput[1]);
		switch(todoCmd) {
			case 'my-tweets':
				// Get the last 20 Tweets
				twitLiri();
				break;
			case 'spotify-this-song':
				//Set the global variable songReq. Make sure it is URI encoded
				songReq = encodeURI(todoInp);
				//Run the spotify search request
				spotifyLiri();
				break;
			case 'movie-this':
				// Set the global variable movieName. Make sure it is URI encoded			
				movieName = encodeURI(todoInp);
				// Then run a request to the OMDB API with the movie specified
				queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
				// Then run a request to the OMDB API with the movie specified
				movieLiri();
				break;
			default:
				console.log("You Ediot! You did not provide the correct file content")
		}
	}	
}

inquirer.prompt([
  //list

  {
      type: "list",
      message: "What do you want to do?",
      choices: ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'],
      name: "todo"
  }
]).then(function(inquirerResponse) {
    // Check the user response
		switch(inquirerResponse.todo) {
			case 'my-tweets':
				twitLiri();
				break;
			case 'spotify-this-song':
				inquirer.prompt([
  				// basic input
  				{
 					type: "input",
   					message: "Which song are you interested in?",
    				name: "song"
  				}
  				]).then(function(ans) {

					if(ans.song){
						songReq = encodeURI(ans.song);
					} else {
						console.log("\nThere was no song specified! ");
					}

					// Then run a search request to the spotify api for the song specified
					spotifyLiri();
				});
				break;
			case 'movie-this':
			//Get the movie name from the user
				inquirer.prompt([
  				// basic input
  				{
 					type: "input",
   					message: "Which movie are you interested in?",
    				name: "movie"
  				}
  				]).then(function(ans) {

					if(ans.movie){
						movieName = encodeURI(ans.movie);
					}

					// Then run a request to the OMDB API with the movie specified
					queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

					// This line is just to help us debug against the actual URL.
					movieLiri();
				});
				break;
			case 'do-what-it-says':
				//First check if the file exists
				fs.exists(filePath, function(exists){ 
   					if(exists){ // if exists, then read the file
      					fs.readFile(filePath, {encoding: "utf8"}, function(err, data){
         					if(err){
            					console.log(err)
         					} else {
         						console.log(data);
         						cmdLine = data.split("\n");
         						parsExec();
         					}               
      					})
   					} else {console.log('File "' + filePath + '" does not exist!');}
				});
				// rbv = this.crystals.emerald.value;
				break;
			default:
				console.log("You Ediot!")
		}

  });