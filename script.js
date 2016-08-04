

$(document).ready(function(){
    //audio environment
    createContext();
    //getting song's properties to front-end
    querySongs();
});

var context;
//init context
function createContext() {
    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
}

var querySongs = function(){
    $.ajax({
       method: "GET",
       url: "/songs",
       dataType: "json",
       success: function(data, textStatus){
           parseSongs(data);
       }
    });
};

function parseSongs(data){
    console.log(data);
    for(var i = 0; i<data.length; i++){
        var section = document.createElement('div');
        section.className = "song";
        var minSec = countMinutes(data[i].duration);
        section.innerHTML = "<span class='songtitle'>" + data[i].artist[0] + " " + data[i].title + "</span>" +
            "<a href='#' title='Play video' onclick='mainRun(this)' class='play run'></a>" +
           "<span class='songstart'>0:00</span>" +
        "<input class='soundprog' onclick='changeProg(this)' type='range' name='points' value='0' min='0' max='"+data[i].duration+"' step='1'>" +
            "<span class='songend'>" + minSec.min + ":" + minSec.sec + "</span>" +
        "<input class='volume vVertical' type='range' name='points' min='1' max='100' value='50' step='1'/>";

        $(".music").append(section);
    }
}

function countMinutes(sec) {
    var minutes = sec/60;
    var intMin = parseInt(minutes);
    var minSec = minutes - intMin;
    var seconds = minSec*60;
    seconds = parseInt(seconds);
    var time = {
        min: intMin,
        sec: seconds
    };
    return time;
}


var playing = false;

var start = 0;
var end = 0;
var time = 0;
//contains this val of cur song
var song = null;


function mainRun(self) {
    $(self).toggleClass('active');

    //music run
    if( $(self).attr("class").indexOf("active") !== -1 ){
        //if new song run
        if(song != self){
            song = self;
            start = 0;
            time = 0;
            end = 0;
            $(self).siblings(".soundprog").val(0);
            $(self).siblings(".soundstart").val("0:00");
            var soundName = $(self).siblings(".songtitle").text();
            loadSoundFile(soundName + ".mp3");
        }
        if(start == 0){
            setTimeout(function(){
                play(null);
            }, 1000);

            time = 0;
        }
        else {
            play(time/1000);
        }

        start = new Date().getTime();
        playing = true;
    }
    //music stopped
    else {
        end = new Date().getTime();
        if(time == 0) {
            time = end - start;
        }
        else {
            time = time + ((end - start)/1000);
        }
        playing = false;
        stop();
    }
    return false;
}

//getting current proggress of song
function changeProg() {
    // self – soundproggress
    var prog = $(song).siblings(".soundprog").val();
var setTime = countMinutes(prog);
    $(song).siblings(".songstart").text(setTime.min + ":" + setTime.sec );
    time = prog;
    if (playing){
        stop();
        playing = false;
        setTimeout(function(){
            play(time);
            playing = true;
        }, 200);
    }
}

//main components
var buffer,
    source,
    destination,
    gainNode; //volume

var gainValue = 0.5; //volume lvl

//direct playing function
var play = function(from){
    source = context.createBufferSource();
    // connect buffer to source
    source.buffer = buffer;
    // connect default destination
    destination = context.destination;
    gainNode = context.createGain();
    gainNode.gain.value = gainValue;
    source.connect(gainNode);
    gainNode.connect(destination);
    // connect destination to source
    source.connect(destination);
    // play
    if(from != null){
        source.start(0, from);
    }
    else {
        source.start(0);
    }
    progtimer();
};

var stop = function(){
    source.stop(0);
};

function progtimer(){
    if(playing){
        var v = $(song).siblings(".soundprog").val();
        v++;
        $(song).siblings(".soundprog").val(v);
        var getMin = countMinutes(v);
        $(song).siblings(".songstart").text(getMin.min + ":" + getMin.sec);
        setTimeout("progtimer()", 1000);
    }
    else {
        return;
    }
}


//getting sound file (query to server)
var loadSoundFile = function(url) {
    // делаем XMLHttpRequest (AJAX) на сервер
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer'; // важно
    xhr.onload = function(e) {
        // декодируем бинарный ответ
        context.decodeAudioData(this.response,
            function(decodedArrayBuffer) {
                // получаем декодированный буфер
                buffer = decodedArrayBuffer;
            }, function(e) {
                console.log('Error decoding file', e);
            });
    };
    xhr.send();
};