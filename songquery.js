var mm = require('musicmetadata');
var fs = require('fs');
var playlist;


//direct function to read songs from file system
function songs(){
    var songList = [];
    var responseArr = [];
    //read titles of songs
    fs.readdir("music", function(err, files){
        var j=0;
        for(var i=0; i<files.length; i++){
            if(files[i].indexOf(".mp3") !== -1) {
                songList[j] = files[i];
                j++;
            }
        }

        //console.log(songList);
        var i = 0;
        songList.forEach(function(item){
            //console.log(item);
            //getting song properties
            var parser = mm(fs.createReadStream("music/" + item), { duration: true }, function (err, metadata){
                if (err) throw err;
                var songObj = {
                    title: metadata.title,
                    artist: metadata.artist,
                    duration: metadata.duration
                };
                responseArr[i] = songObj;
                i++;
            });
        });
        playlist = responseArr;
        exports.music = playlist;
    });
}
songs();