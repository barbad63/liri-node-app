require("dotenv").config();

const keys = require('./keys.js');

console.log(don.twitter);
console.log(don.spotify);
console.log(don.twitter.consumer_key);
var request = require("request");
var fs = require("fs");
const inquirer = require("inquirer");

//Variables and defaults section:
//OMDB
var movieName = encodeURI("Mr Nobody"); //default movie
var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
var rotten; //rating we are looking for
var filePath = "./random.txt"

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
			console.log(JSON.parse(body));
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

inquirer.prompt([
  //list

  {
      type: "list",
      message: "What do you want to do?",
      choices: ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'],
      name: "todo"
  }
]).then(function(inquirerResponse) {
    // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
    console.log(inquirerResponse.todo);
		switch(inquirerResponse.todo) {
			case 'my-tweets':
				// rbv = this.crystals.ruby.value;
				break;
			case 'spotify-this-song':
				// rbv = this.crystals.diamond.value;
				break;
			case 'movie-this':
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
					console.log(ans.movie);


					// Then run a request to the OMDB API with the movie specified
					queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

					// This line is just to help us debug against the actual URL.
					console.log(queryUrl);
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
         					}              
         					console.log(data);
      					})
   					} else {console.log('File "' + filePath + '" does not exist!');}
				});
				// rbv = this.crystals.emerald.value;
				break;
			default:
				console.log("You Ediot!")
		}

  });
