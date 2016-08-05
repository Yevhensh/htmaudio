var express = require('express'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    mm = require('musicmetadata');


var app = express();
var songquery = require('./songquery.js');

app.use(express.static(__dirname + "/"));
app.set('port', 3000);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server port listening on port ' + app.get('port'));
});

app.use(function(req, res, next){
    if(req.url == '/') {
        sendFile("doctype.html", res);
    }
    else {
        next();
    }
});

//getting song props
app.use(function(req, res, next){
    if(req.url == '/songs') {
        var songs = songquery.music;
        var resJson = JSON.stringify(songs);
        res.send(songs);
    }
    else {
        next();
    }
});

//sending .mp3 file to front
app.use(function(req, res, next){
    //song file query
    if(req.url.toString().indexOf(".mp3") !== -1){
        var r = req.url;
        r = r.replace(/%20/g, " ");
        sendFile("music" + r, res);
    }
    else {
        next();
    }
});

app.use(function(req, res, next){
    if(req.url){
        sendFile("doctype.html", res);
    }
    else {
        res.status(404).send("Page Not Found");
    }
});

function sendFile(fileName, res) {
    var fileStream = fs.createReadStream(fileName);
    fileStream
        .on('error', function() {
            res.statusCode = 500;
            res.end("Server error");
        })
        .pipe(res)
        .on('close', function() {
            fileStream.destroy();
        });
}