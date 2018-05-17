// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var searchTerms = require('./searchTerm.js');
var Bing = require('node-bing-api')({ accKey: "5f56806bd48c4a2faddcebb2172b9ea8" });

app.use(bodyParser.json());

//connect to database
var uri = 'mongodb://' + process.env.USER + ':' + process.env.PASS + '@ds035348.mlab.com:35348/image_searches';

mongoose.connect(uri, function (err, db) {
 if (err) {
  console.log("unable to connect to database", err); 
 }
  else {
   console.log("connection established to database @ ", uri); 
  }
});

// listen for requests 
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

//show history of searches
app.get('/api/latest/imagesearch', function (req, res, next) {
  searchTerms.find({}, function (err, data) {
    res.json(data);
  }).sort({searchDate:-1}); 
});

//handle search requests
app.get('/api/imagesearch/:searchTerm*', function (req, res, next) {
  var searchTerm = req.params.searchTerm,
      offset = req.query.offset,
      search = new searchTerms(
    {
      searchTerm: searchTerm,
      searchDate: new Date()
    }
  );
  //save search to database
  search.save(function (err) {
      if (err) {
       return console.log('failed to save to database'); 
      }
  });
  if(!offset) {
   offset = 0; 
  }
  //do image search and display results
  Bing.images(searchTerm, {
    count: 50,   // Number of results (max 50)
    offset: offset
  }, function(error, result, body){
    var imageData = [];
    for (var i = 0; i < 10; i++) {
     imageData.push({
       url: body.value[i].webSearchUrl,
       snippet: body.value[i].name,
       thumbnail: body.value[i].thumbnailUrl,
       context: body.value[i].hostPageDisplayUrl
     });
    }
    res.json(imageData);
  });
  
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

