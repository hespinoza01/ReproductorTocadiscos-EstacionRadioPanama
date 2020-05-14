// Declaraciones
const disk = document.getElementById("disk"),
    arm = document.getElementById("arm"),
    btnStart = document.getElementById("btn-start"),
    btnStop = document.getElementById("btn-stop"),
    volumeControl = document.getElementById("volume-control"),
    volumeIndicator = document.getElementById("volume-indicator"),
    currentTimeIndicator = document.getElementById("current-time"),
    lastTimeIndicator = document.getElementById("last-time");

// Variables de utilidad
let currentSong = { index: -1, path: '' },
    isStarted = false,
    isLoaded= false,
    currentTime = 0,
    currentTimeInterval = null;

// Arreglo con la lista de las canciones
const SONGS = new Array(
    {path:"./canciones/011.mp3",artist:"Nacho",song:"Bailame"},
    {path:"./canciones/012.mp3",artist:"Chino y Nacho ft. Daddy Yankee",song:"Andas en mi cabeza"},
    {path:"./canciones/013.mp3",artist:"Danny Ocean",song:"Me rehuso"},
    {path:"./canciones/014.mp3",artist:"Danny Ocean",song:"Dembow"},
    {path:"./canciones/015.mp3",artist:"Danny Ocean",song:"Vuelve"}
 );

// Objetos de configuración para las distintas opciones del tocadiscos
// Configuración del estilo del disco
const diskStyle = {
        get Disk1(){ return "disk1"; },
        get Disk2(){ return "disk2"; },
        get Disk3(){ return "disk3"; }
    },
    // Configuración del estilo de la aguja
    armStyle = {
        get Arm1(){ return "arm1"; },
        get Arm2(){ return "arm2"; },
        get Arm3(){ return "arm3"; }
    },
    // Tipo de reproductor, dos opciones: 'playlist' o 'stream'
    playerType = {
        get Playlist(){ return 'playlist'; },
        get Stream(){ return 'stream'; }
    },
    // Configuración del tipo de reproducción
    reproductionType = {
        get Linear(){ return 1; }, // Reproducir de inicio a fin
        get LinearLoop(){ return 2; }, // Reproducir de inico a fin y repetir
        get Shuffle(){ return 3; } // Reproducir revolviendo la lista
    },
    // Tipo de visualización del tiempo final de la reproducción
    lastTimeType = {
        get TotalTime(){ return 1; }, // Muestra el tiempo total de reproducción
        get RemainingTime(){ return 2; } // Muestra el tiempo restante de la reproducción
    };

const Turntable = {
    disk: diskStyle.Disk2, // Estilo del disco
    arm: armStyle.Arm3, // Estilo de la aguja
    playerType: playerType.Playlist, // Tipo de reproductor
    reproductionType: reproductionType.Linear, // Tipo de reproducción
    lastTimeType: lastTimeType.TotalTime, // Tipo de tiempo final
    source: SONGS, // Recurso a reproducir, lista de canciones para la opción de 'playlist' o la url para la opción de 'stream'
    streamTime: 3600 // Tiempo de duración en segundos para el tipo de reproducción de radio, 1 hora = 3600 segundos
};

// Declaraciones para el audio
let player = new Audio(),
    shuffleSongs = new Array();


// Prototipo de la función shuffle para crear el arreglo aleatorio de las canciones
Array.prototype.shuffle = function() {
    let i = this.length, j, temp;

    // si no hay elementos en el arreglo, se termina la función
    if (i == 0) return this;

    for (i = i - 1; i > 0; i--) {
        j = Math.floor( Math.random() * (i + 1) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }

    return this;
}

// Acortador para 'addEventListener'
window.Node.prototype.on = function(eventType, callback){
    if(eventType === undefined || typeof eventType !== "string") return;
    if(callback === undefined || typeof callback !== "function") return;

    this.addEventListener(`${eventType}`, callback);
    return this;
};
window.on = window.Node.prototype.on;


/***********************
**      Eventos       **
************************/
function getReadableTime(duration) {
    duration = parseInt(duration);

    let horas = Math.floor(duration / 3600),
        minutos = Math.floor((duration - (horas * 3600)) / 60),
        segundos = duration - (horas * 3600) - (minutos * 60),
        tiempo = "";

    if (horas < 10) { horas = "0" + horas; }
    if (minutos < 10) { minutos = "0" + minutos; }
    if (segundos < 10) { segundos = "0" + segundos; }

    if (horas === "00") {
        tiempo = minutos + "<span style='color: yellow'>:</span>" + segundos;
    } else {
        tiempo = horas + "<span style='color: yellow'>:</span>" + minutos + "<span style='color: yellow'>:</span>" + segundos;
    }
    return tiempo;
}

function onCurrentTimeInterval() {
    if(currentTime < player.duration - 1) {
        currentTime++;
        currentTimeIndicator.innerHTML = getReadableTime(currentTime);

        if(Turntable.lastTimeType === lastTimeType.RemainingTime){
            let durationTotal = (Turntable.playerType === playerType.Playlist) ? player.duration : Turntable.streamTime;
            
            lastTimeIndicator.dispatchEvent(
                new CustomEvent('updateremainingtime', {
                    detail: {
                        duration: durationTotal - currentTime
                    },
                    bubbles: true,
                    cancelable: true
                }));
        }
    }
}

function onUpdateRemainingTime(e) {
    lastTimeIndicator.innerHTML = getReadableTime(e.detail.duration);
}

function onLoadPlayerData() {
    let duration = (Turntable.playerType === playerType.Playlist) ? player.duration : Turntable.streamTime;
    
    lastTimeIndicator.innerHTML = getReadableTime(duration);
    arm.style.animationDuration = player.duration + "s";
    isLoaded = true;
}

function onPlayPlayer() {
    if(!isStarted){
        if(Turntable.playerType === playerType.Playlist){
            if(Turntable.source.length > 0){
                currentSong = {
                    index: 0,
                    path: Turntable.source[0].path
                };
            }
        }else if(Turntable.playerType === playerType.Stream){
            currentSong = {
                index: -1,
                path: Turntable.source[0].path
            }
        }

        player.src = currentSong.path;
        isStarted = true;
    }
}

function onEndedPlayerData() {
    onClickBtnStop();
    
    let playlistLength = Turntable.source.length,
        currentSongIndex = currentSong.index;

    if(Turntable.playerType === playerType.Playlist) {
        if(currentSongIndex < playlistLength - 1){
            currentSong = {
                index: (currentSongIndex + 1),
                path: Turntable.source[currentSongIndex + 1].path
            }

            player.src = currentSong.path;
            setTimeout(onClickBtnStart, 1500);
        }
    }
}

function onClickBtnStart(e) {
    if(btnStart.classList.contains("to_pause")){
        player.pause();
        clearInterval(currentTimeInterval);
        btnStart.classList.remove("to_pause");
        disk.style.animationPlayState = "paused";
        arm.style.animationPlayState = "paused";
    }else{
        player.play();
        currentTimeInterval = setInterval(onCurrentTimeInterval, 1000);
        btnStart.classList.add("to_pause");
        disk.classList.add("active");
        arm.classList.add("active");
        disk.style.animationPlayState = "running";
        arm.style.animationPlayState = "running";
    }
}

function onInputVolumeControl(e){
    let volumeValue = e.target.value;

    player.volume = volumeValue;
    volumeIndicator.dispatchEvent(
        new CustomEvent('updatevolumecontrol', {
            detail: {
                volume: Math.floor(volumeValue * 100)
            },
            bubbles: true,
            cancelable: true
        })
    );
}

function onUpdateVolumeControl(e){
    let volumeValue = e.detail.volume;
    volumeIndicator.textContent = volumeValue + " %";
}

function onClickBtnStop(e) {
    player.pause();
    player.currentTime = 0;

    clearInterval(currentTimeInterval);
    currentTime = 0;
    isStarted = false;

    currentTimeIndicator.innerHTML = getReadableTime(0);
    lastTimeIndicator.innerHTML = getReadableTime(0);

    btnStart.classList.remove("to_pause");
    disk.classList.remove("active");
    arm.classList.remove("active");
}


// Código a ejecutar después de terminar de cargar la página
window.addEventListener("load", function () {
    // Cargar configuraciones del tocadiscos
    (function(){
        disk.classList.add(Turntable.disk);
        arm.classList.add(Turntable.arm);
    })();

    player.onloadeddata = onLoadPlayerData;
    player.onplay = onPlayPlayer;
    player.onended = onEndedPlayerData;

    btnStart.on("click", onClickBtnStart);

    volumeControl.on("input", onInputVolumeControl);

    volumeIndicator.on("updatevolumecontrol", onUpdateVolumeControl);

    btnStop.on("click", onClickBtnStop);

    lastTimeIndicator.on("updateremainingtime", onUpdateRemainingTime);
});