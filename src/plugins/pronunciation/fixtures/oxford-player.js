// Playback functions from https://www.oxfordlearnersdictionaries.com/common.js?version=2.3.78
function playSound(btn) {
    var src_mp3 = btn.attr("data-src-mp3");
    var src_ogg = btn.attr("data-src-ogg");

    if (supportAudioHtml5()){
        playHtml5(src_mp3, src_ogg);
    }else if (supportAudioFlash()){
        playFlash(src_mp3, src_ogg);
    }    else {
        playRaw(src_mp3, src_ogg);
    }
}

function supportAudioHtml5(){
    var audioTag  = document.createElement('audio');
    try{
        return ( !!(audioTag.canPlayType)
                 && ( ( audioTag.canPlayType("audio/mpeg") != "no" && audioTag.canPlayType("audio/mpeg") != "" )
                 || ( audioTag.canPlayType("audio/ogg") != "no" && audioTag.canPlayType("audio/ogg") != "" ) ) );     
    }catch(e){
        return false;
    } 
}

function playHtml5(src_mp3, src_ogg){
    //use appropriate source
    var audio = new Audio("");
    if (audio.canPlayType("audio/mpeg") != "no" && audio.canPlayType("audio/mpeg") != "")
        audio = new Audio(src_mp3);
    else if (audio.canPlayType("audio/ogg") != "no" && audio.canPlayType("audio/ogg") != "")
        audio = new Audio(src_ogg);

    //play
    audio.addEventListener("error", function(e){alert("Apologies, the sound is not available.");});
    audio.play();
}



