// Declaraciones
const disk = document.getElementById("disk"),
    arm = document.getElementById("arm"),
    btnStart = document.getElementById("btn-start"),
    btnStop = document.getElementById("btn-stop"),
    progressIndicator = document.getElementById("progress-indicator"),
    currentTimeIndicator = document.getElementById("current-time"),
    lastTimeIndicator = document.getElementById("last-time");

// Variables de utilidad
let currentSong = { index: -1, path: '' },
    isStarted = false,
    isLoaded= false,
    currentTime = 0,
    diskClientRect = null,
    rotationIncrement = 0,
    currentTimeInterval = null,
    songIndex = 0;

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
function discoTipo(value) {
    switch(value){
        case 1:
            return "disk1";
            break;
        case 2:
            return "disk2";
            break;
        case 3:
            return "disk3";
            break;
        default:
            return "";
    }
}
// Configuración del estilo de la aguja
function agujaTipo(value) {
    switch(value){
        case 1:
            return "arm1";
            break;
        case 2:
            return "arm2";
            break;
        case 3:
            return "arm3";
            break;
        default:
            return "";
    }
}

function agujaRotacion(value) {
    switch(value){
        case 1:
            // arm1
            return {
                inicio: -15,
                fin: 4,
                deg: 20
            };
            break;
        case 2:
            // arm2
            return {
                inicio: -12,
                fin: 12,
                deg: 20
            };
            break;
        case 3:
            // arm3
            return {
                inicio: -30,
                fin: -13,
                deg: 17
            };;
            break;
        default:
            return "";
    }
}

// Tipo de reproductor, dos opciones: 'playlist' o 'stream'
const ReproductorTipo = {
        get Playlist(){ return 1; },
        get Stream(){ return 2; }
    },
    // Configuración del tipo de reproducción
    EstiloReproduccion = {
        get Linear(){ return 1; }, // Reproducir de inicio a fin
        get LinearLoop(){ return 2; }, // Reproducir de inico a fin y repetir
        get Shuffle(){ return 3; } // Reproducir revolviendo la lista
    },
    // Tipo de visualización del tiempo final de la reproducción
    TiempoFinal = {
        get TiempoTotal(){ return 1; }, // Muestra el tiempo total de reproducción
        get TiempoRestante(){ return 2; } // Muestra el tiempo restante de la reproducción
    };

const Tocadiscos = {
    disco: 1, // Estilo del disco 1, 2, 3
    aguja: 1, // Estilo de la aguja 1, 2, 3
    reproductorTipo: 1, // Tipo de reproductor 1=lista, 2=radio
    estiloReproduccion: 2, // Tipo de reproducción 1=inicio a fin, 2=inicio a fin y repetir, 3=revolver lista
    tiempoFinal: 1, // Tipo de tiempo final 1=timepo total, 2=tiempo restante
    moverAguja: 1, // Mover aguja para adelantar/retrasar pista 1=si, 0=no
    canciones: SONGS, // Lista de canciones a reproducir para la opción 1 de 'reproductorTipo' o la dirección para la opción 2 de 'reproductorTipo'
    mostrarTiempoGeneral: 0, // Mostrar tiempo general de la reproducción, 1=sí, 0=no
    valorTiempoGeneral: 3600 // Tiempo de duración en segundos para el tipo de reproducción general, 1 hora = 3600 segundos
};

// Declaraciones para el audio
let player = new Audio(),
    oldShuffleSongs = new Array();


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
        arm.dispatchEvent(new CustomEvent('updaterotationarm', {
            detail: {
                rotate: currentTime * rotationIncrement
            }
        }));
        progressIndicator.dispatchEvent(new CustomEvent('updateprogresssong', {
            detail: {
                value: Math.floor((currentTime * 100) / player.duration)
            }
        }));

        if(Tocadiscos.tiempoFinal == TiempoFinal.TiempoRestante){
            let durationTotal = (Tocadiscos.reproductorTipo === ReproductorTipo.Playlist) ? player.duration : Tocadiscos.valorTiempoGeneral;
            
            lastTimeIndicator.dispatchEvent(
                new CustomEvent('updateTiempoRestante', {
                    detail: {
                        duration: durationTotal - currentTime
                    },
                    bubbles: true,
                    cancelable: true
                }));
        }
    }
}

function onUpdateTiempoRestante(e) {
    lastTimeIndicator.innerHTML = getReadableTime(e.detail.duration);
}

function onLoadPlayerData() {
    let duration = (Tocadiscos.reproductorTipo == ReproductorTipo.Playlist) ? player.duration : Tocadiscos.valorTiempoGeneral;

    duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? Tocadiscos.valorTiempoGeneral : duration;
    
    lastTimeIndicator.innerHTML = getReadableTime(duration);
    rotationIncrement = agujaRotacion(Tocadiscos.aguja).deg / duration;
    setTimeout(function(){ 
        arm.style.transform = 'rotate('+agujaRotacion(Tocadiscos.aguja).inicio+'deg)'; 
    }, 1500);
    isLoaded = true;
}

function onPlayPlayer() {
    if(!isStarted){
        if(Tocadiscos.reproductorTipo === ReproductorTipo.Playlist){
            if(Tocadiscos.canciones.length > 0){
                if(Tocadiscos.reproductorTipo === EstiloReproduccion.Shuffle){
                    Tocadiscos.canciones.shuffle();
                    console.log("----- Lista Inicial -----");
                    console.log(Tocadiscos.canciones);
                }

                currentSong = {
                    index: songIndex,
                    path: Tocadiscos.canciones[songIndex].path
                };
            }
        }else if(Tocadiscos.reproductorTipo === ReproductorTipo.Stream){
            currentSong = {
                index: -1,
                path: Tocadiscos.canciones
            }
        }

        player.src = currentSong.path;
        player.play();
        isStarted = true;
    }
}

function onEndedPlayerData() {
    Clean();
    
    let playlistLength = Tocadiscos.canciones.length;

    if(Tocadiscos.reproductorTipo == ReproductorTipo.Playlist) {
        if(songIndex == playlistLength && EstiloReproduccion.Linear){
            onClickBtnStop();
            return;
        }

        // Si esta en modo LinearLoop o Shuffle, reinicia la reproducción de la lista al inicio
        if(Tocadiscos.estiloReproduccion != EstiloReproduccion.Linear){
            songIndex = (songIndex + 1 == playlistLength) ? -1 : songIndex;

            if(songIndex == -1 && Tocadiscos.estiloReproduccion == EstiloReproduccion.Shuffle){
                oldShuffleSongs = Array.from(Tocadiscos.canciones);

                let lastSOngFromOldList = oldShuffleSongs[oldShuffleSongs.length - 1];

                do{
                    Tocadiscos.canciones.shuffle();
                }while(Tocadiscos.canciones[0] === lastSOngFromOldList);

                console.log("----- Lista Antigua -----");
                console.log(oldShuffleSongs);
                console.log("----- Lista Nueva -----");
                console.log(Tocadiscos.canciones);
            }
        }

        if(songIndex < playlistLength - 1){
            songIndex++;
            currentSong = {
                index: songIndex,
                path: Tocadiscos.canciones[songIndex].path
            }

            player.src = currentSong.path;
            setTimeout(onClickBtnStart, 2000);
        }
    }
}

function onClickBtnStart(e) {
    if(btnStart.classList.contains("to_pause")){
        player.pause();
        clearInterval(currentTimeInterval);
        btnStart.classList.remove("to_pause");
        disk.style.animationPlayState = "paused";
    }else{
        player.play();
        currentTimeInterval = setInterval(onCurrentTimeInterval, 1000);
        btnStart.classList.add("to_pause");
        disk.classList.add("active");
        disk.style.animationPlayState = "running";
    }
}

function onUpdateProgressSong(e){
    let progressValue = e.detail.value;
    progressIndicator.textContent = progressValue + " %";
}

function onClickBtnStop(e) {
    isStarted = false;
    songIndex = 0;

    Clean();
}

function Clean() {
    player.pause();
    player.duration = 0;

    clearInterval(currentTimeInterval);
    currentTime = 0;
    rotationIncrement = 0;

    currentTimeIndicator.innerHTML = getReadableTime(0);
    lastTimeIndicator.innerHTML = getReadableTime(0);
    progressIndicator.textContent = 0 + " %";

    btnStart.classList.remove("to_pause");
    disk.classList.remove("active");
    arm.style.transform = '';
}

// Adelantar y retroceder la pista
function onClickDisk(e) {
    if(Tocadiscos.moverAguja == 1){
        let screenX = e.x,
        screenY = e.y,
        //clientRect = disk.of,
        minX = 136,
        maxX = disk.offsetWidth,
        minY = 61,
        maxY = disk.offsetHeight - 61,
        distance = {
            x: screenX - (disk.offsetParent.offsetLeft + disk.offsetLeft),
            y: screenY - (disk.offsetParent.offsetTop + disk.offsetTop)
        };

        let duration = (Tocadiscos.reproductorTipo == ReproductorTipo.Playlist) ? player.duration : Tocadiscos.valorTiempoGeneral;

        duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? Tocadiscos.valorTiempoGeneral : duration;
        //console.log(distance, minY, maxY);
        if(distance.x >= minX && (distance.y >= minY && distance.y <= maxY)){
            distance = Math.abs((distance.x - minX) - (maxX - minX));
            maxX = maxX - minX;

            let newCurrentTime = Math.floor(distance * duration / maxX);
            //console.log(newCurrentTime, distance, `min: ${minX}`, `max: ${maxX}`);

            onClickBtnStart();
            player.currentTime = newCurrentTime;
            currentTime = newCurrentTime;
            onClickBtnStart();
        }
    }
}

// Rotación de la aguja
function onUpdateRotationArm(e) {
    let rotate = agujaRotacion(Tocadiscos.aguja).inicio + e.detail.rotate;

    rotate = (rotate <= agujaRotacion(Tocadiscos.aguja).fin) ? rotate : agujaRotacion(Tocadiscos.aguja).fin;
    arm.style.transform = 'rotate('+ rotate +'deg)';
}


// Código a ejecutar después de terminar de cargar la página
window.addEventListener("load", function () {
    // Cargar configuraciones del tocadiscos
    (function(){
        disk.classList.add(discoTipo(Tocadiscos.disco));
        arm.classList.add(agujaTipo(Tocadiscos.aguja));
    })();

    diskClientRect = disk.getBoundingClientRect();

    player.onloadeddata = onLoadPlayerData;
    player.onplay = onPlayPlayer;
    player.onended = onEndedPlayerData;

    disk.on("click", onClickDisk);

    btnStart.on("click", onClickBtnStart);

    progressIndicator.on("updateprogresssong", onUpdateProgressSong);

    arm.on('updaterotationarm', onUpdateRotationArm);

    btnStop.on("click", onClickBtnStop);

    lastTimeIndicator.on("updateTiempoRestante", onUpdateTiempoRestante);
});