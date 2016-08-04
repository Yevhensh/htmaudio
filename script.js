
$(document).ready(function(){
    createContext();
    querySongs();
});

var playing = false;
var musicPlayed = null;

function resumePause(self) {
    $(self).toggleClass('active');
    if( $(self).attr("class").indexOf("active") !== -1 ){
        playing = true;
        musicPlayed = self;
        countProg();
    }
    else {
        musicPlayed = null;
        playing = false;
    }
    return false;
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
        section.innerHTML = "<span class='songtitle'>" + data[i].artist[0] + "  " + data[i].title + "</span>" +
            "<a href='#' title='Play video' onclick='resumePause(this)' class='play run'></a>" +
           "<span class='songstart'>0:00</span>" +
        "<input class='soundprog' type='range' name='points' value='0' min='0' max='"+data[i].duration+"' step='1'>" +
            "<span class='songend'>" + minSec.min + ":" + minSec.sec + "</span>" +
        "<input class='volume vVertical' type='range' name='points' min='1' max='100' value='50' step='1'/>";

        $(".music").append(section);
    }
    //var songs = data.parseJSON();
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

var running = false;
var self;

$(function(){
   $('#run').on('click', function(){
       //query song prefs; self – current song
       if($(this)!= self) {
           self = this;
           var songNum = $(this).val();
           var songName = querySongPrefs(songNum);
       }
       if(running == false){
           running = true;
           play();
       }
       else {
           running = false;
           stop();
       }
   }
   );
   $('#volume').on('change', function(){
       var vol = $(this).val();
       gainValue = vol/100;
       gainNode.gain.value = gainValue;
       source.connect(gainNode);
   });
});



var gainNode;
var gainValue = 0.5;
var context;
//3 main components
var buffer, source, destination;

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

var st;
var end;
var time = 0;

// music start
var play = function(){
    source = context.createBufferSource();
    // connect buffer to source
    source.buffer = buffer;
    // дефолтный получатель звука
    destination = context.destination;
    gainNode = context.createGain();
    gainNode.gain.value = gainValue;
    source.connect(gainNode);
    gainNode.connect(destination);
    // подключаем источник к получателю
    source.connect(destination);
    // програємо
    if(time == 0) {
        source.start(0);
        st = new Date().getTime();
    }
    // після паузи
    else {
        st = new Date().getTime();
        st = st - time;
        source.start(0, time/1000);
    }
};

// функция остановки воспроизведения
var stop = function(){
    end = new Date().getTime();
    time = end - st;
    source.stop(0);
};

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