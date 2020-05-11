// Declaraciones
const disk = document.getElementById("disk"),
    arm = document.getElementById("arm"),
    btnStart = document.getElementById("btn-start"),
    btnStop = document.getElementById("btn-stop"),
    volumeControl = document.getElementById("volume-control"),
    volumeIndicator = document.getElementById("volume-indicator"),
    currentTimeIndicator = document.getElementById("current-time"),
    lastTimeIndicator = document.getElementById("last-time");

// Objetos de configuración para los estilos de los discos y las agujas
const diskStyle = {
        get Disk1(){ return "disk1"; },
        get Disk2(){ return "disk2"; },
        get Disk3(){ return "disk3"; }
    },
    armStyle = {
        get Arm1(){ return "arm1"; },
        get Arm2(){ return "arm2"; },
        get Arm3(){ return "arm3"; }
    };

const turntableConfig = {
    disk: diskStyle.Disk2,
    arm: armStyle.Arm3
};

// Declaraciones para el audio
let player = new Audio(),
    shuffleSongs = new Array();

// Arreglo con la lista de las canciones
const SONGS = new Array(
       {ruta:"./canciones/011.mp3",artista:"Nacho",cancion:"Bailame"},
       {ruta:"./canciones/012.mp3",artista:"Chino y Nacho ft. Daddy Yankee",cancion:"Andas en mi cabeza"},
       {ruta:"./canciones/013.mp3",artista:"Danny Ocean",cancion:"Me rehuso"},
       {ruta:"./canciones/014.mp3",artista:"Danny Ocean",cancion:"Dembow"},
       {ruta:"./canciones/015.mp3",artista:"Danny Ocean",cancion:"Vuelve"}
    );

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

function onLoadPlayerData() {
    lastTimeIndicator.innerHTML = getReadableTime(player.duration);
    arm.style.animationDuration = player.duration + "s";
}

function onClickBtnStart(e) {
    if(btnStart.classList.contains("to_pause")){
        player.pause();
        btnStart.classList.remove("to_pause");
        disk.style.animationPlayState = "paused";
        arm.style.animationPlayState = "paused";
    }else{
        player.play();
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
    btnStart.classList.remove("to_pause");
    disk.classList.remove("active");
    arm.classList.remove("active");
}


// Código a ejecutar después de terminar de cargar la página
window.addEventListener("load", function () {
    // Cargar configuraciones del tocadiscos
    (function(){
        disk.classList.add(turntableConfig.disk);
        arm.classList.add(turntableConfig.arm);
    })();

    player.onloadeddata = onLoadPlayerData;

    btnStart.on("click", onClickBtnStart);

    volumeControl.on("input", onInputVolumeControl);

    volumeIndicator.on("updatevolumecontrol", onUpdateVolumeControl);

    btnStop.on("click", onClickBtnStop);

    player.src = SONGS[1].ruta;
});