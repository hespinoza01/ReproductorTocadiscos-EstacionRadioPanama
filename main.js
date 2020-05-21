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
    isMovingArm = false,
    currentTime = 0,
    acumulateTime = 0,
    diskClientRect = null,
    rotationIncrement = 0,
    currentTimeInterval = null,
    songIndex = 0;

// Arreglo con la lista de las canciones
const SONGS = new Array(
    {path: "https://vk.com/doc297826490_503417139", artist: "Nacho", song: "Bailame", duration: 207.877333},
    {path: "./canciones/010.txt", artist: "Nacho", song: "Bailame", duration: 279.048},
    {path: "./canciones/011.json", artist: "Nacho", song: "Bailame", duration: 287.701333},
    {path: "./canciones/011.mp3", artist: "Nacho", song: "Bailame", duration: 249.816},
    {path: "./canciones/012.mp3", artist: "Chino y Nacho ft. Daddy Yankee", song: "Andas en mi cabeza", duration: 266.4064},
    {path: "./canciones/013.mp3", artist: "Danny Ocean", song: "Me rehuso", duration: 223.172125},
    {path: "./canciones/014.mp3", artist: "Danny Ocean", song: "Dembow", duration: 263.496},
    {path: "./canciones/015.mp3", artist: "Danny Ocean", song: "Vuelve", duration: 219.744}
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

// Ajax Prototypes
window.XMLHttpRequest.prototype.on = window.on;
window.$ajax = window.XMLHttpRequest;

// Declaraciones para el audio
let player = new Audio(),
    oldShuffleSongs = new Array();

// Audio Prototypes
// - Load array of song's
player.songIndex = -1;
player.sourceList = null;
player.source = function(src) {
    if(src === undefined || (typeof src !== "string" && typeof src !== "object")) return;

    this.songIndex = 0;
    this.sourceList = src;
}

player.next = function() {
    if(this.songIndex < this.sourceList.length - 1){
        this.songIndex++;
        player.src = this.sourceList[this.songIndex].path;
        setTimeout(onClickBtnStart, 2000);
    }
}

// Detener la reproducción
player.isStop = true;
player.stop =function() {
    this.isStop = true;
    isStarted = false;
    songIndex = 0;
    acumulateTime = 0;
    currentTime = 0;
    rotationIncrement = 0;
    Clean();

    setTimeout(() => {
        currentTimeIndicator.innerHTML = getReadableTime(0);
        arm.style.transform = '';
    }, 10);
}


/***********************
**      Eventos       **
************************/
// Convertir los segundos a los valores de tiempo legibles
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

// carga el recurso de la pista, ya sea la direción del mp3 o el base64
function setSource(source, audio) {
    return new Promise((resolve, reject) => {
        // Si la dirección contiene extensión js|txt|json o si es una url normal sin extensión
        // Se carga el valor del base64
        if(source.match(/\w+.(txt|json|js)/g) || source.match(/^(ftp|http|https):\/\/[^ "]+[^mp3|ogg|wav]$/g)){
            let script = document.createElement("script");

            script.onload = _ => {
                audio.src = base64;
                script.remove();
                resolve();
            }

            script.src = source;
            document.body.appendChild(script);
        }else if(source.match(/.+(mp3|ogg|wav)/g)){
            // cargar el archivo .mp3
            audio.src = source;
            resolve();
        }else{
            // capturar un error
            reject();
        }
    });
}

// Actualizar las etiquetas y tiempos a partir del tiempo actual de la pista
function onCurrentTimeInterval() {
    let duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? Tocadiscos.valorTiempoGeneral : player.duration;

    currentTime = (Tocadiscos.mostrarTiempoGeneral == 1) ? acumulateTime + player.currentTime : player.currentTime;

    if(currentTime < duration - 1) {
        //currentTime++;
        currentTimeIndicator.innerHTML = getReadableTime(currentTime);
        // Actualizar la rotación del brazo
        arm.dispatchEvent(new CustomEvent('updaterotationarm', {
            detail: {
                rotate: currentTime * rotationIncrement
            }
        }));
        // Actualizar el porcentaje de avance
        progressIndicator.dispatchEvent(new CustomEvent('updateprogresssong', {
            detail: {
                value: Math.floor((currentTime * 100) / (duration - 1))
            }
        }));

        // Para actualizar el tiempo restante si está habilitado
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

// Actualiza la etiqueta del tiempo restante
function onUpdateTiempoRestante(e) {
    lastTimeIndicator.innerHTML = getReadableTime(e.detail.duration);
}

// Al cargar la pista actual, carga la duración y calcula el ángulo de rotación del brazo
function onLoadPlayerData() {
    let duration = (Tocadiscos.reproductorTipo == ReproductorTipo.Playlist) ? player.duration : Tocadiscos.valorTiempoGeneral;

    duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? Tocadiscos.valorTiempoGeneral : duration;
    
    lastTimeIndicator.innerHTML = getReadableTime(duration);
    rotationIncrement = agujaRotacion(Tocadiscos.aguja).deg / duration;
    isLoaded = true;
    
    if(isStarted && Tocadiscos.mostrarTiempoGeneral != 1) {
        setTimeout(function(){ 
            arm.style.transform = 'rotate('+agujaRotacion(Tocadiscos.aguja).inicio+'deg)'; 
        }, 1500);
    }
}

// Al iniciar la reproducción de la pista
function onPlayPlayer() {
    player.isStop = false;

    if(!isStarted){
        // Verificar si se va a reproducir por lista de canciones
        if(Tocadiscos.reproductorTipo === ReproductorTipo.Playlist){
            if(Tocadiscos.canciones.length > 0){
                if(Tocadiscos.estiloReproduccion === EstiloReproduccion.Shuffle){
                    Tocadiscos.canciones.shuffle();
                    console.log("----- Lista Inicial -----");
                    console.log(Tocadiscos.canciones);
                }

                // Valores de la canción actual en reproducción
                currentSong = {
                    index: songIndex,
                    path: Tocadiscos.canciones[songIndex].path
                };
            }

         // En caso de que se este reproduciendo por medio del enlace de la radio
        }else if(Tocadiscos.reproductorTipo === ReproductorTipo.Stream){
            currentSong = {
                index: -1,
                path: Tocadiscos.canciones
            }
        }

        setSource(currentSong.path, player)
            .then(() => player.play())
            .catch(() => console.error("Error on load source: ", currentSong.path));
        arm.style.transform = 'rotate('+agujaRotacion(Tocadiscos.aguja).inicio+'deg)';
        isStarted = true;
    }

    //currentTimeInterval = setInterval(onCurrentTimeInterval, 1000);
    btnStart.classList.add("to_pause");
    disk.classList.add("active");
    disk.style.animationPlayState = "running";
}

// Pausar la reproducción
function onPausePlayer() {
    //clearInterval(currentTimeInterval);
    btnStart.classList.remove("to_pause");
    disk.style.animationPlayState = "paused";
}

// Al finalizar la pista actual
function onEndedPlayerData() {
    let timeOutValue = 2000,
        oldTime = currentTime,
        armTransform = arm.style.transform;

    Clean();

    if(Tocadiscos.mostrarTiempoGeneral == 1 && !player.isStop){
        timeOutValue = 0;
        currentTime = oldTime;
        arm.style.transform = armTransform;
        acumulateTime += player.duration;
        currentTimeIndicator.textContent = getReadableTime(currentTime);
    }
    
    let playlistLength = Tocadiscos.canciones.length;

    // Al reproducir por lista de canciones
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

        // Se obtiene los valores de la siguiente canción
        if(songIndex < playlistLength - 1){
            songIndex++;
            currentSong = {
                index: songIndex,
                path: Tocadiscos.canciones[songIndex].path
            }

            setSource(currentSong.path, player)
                .then(() => setTimeout(onClickBtnStart, timeOutValue))
                .catch(() => console.error("Error on load source: ", currentSong.path));
        }
    }
}

// Obtener el total de duración para el modo de mostrarTiempoTotal
function getTotalDurationForPlaylist() {
    if(Tocadiscos.mostrarTiempoGeneral == 1 && Tocadiscos.reproductorTipo == ReproductorTipo.Playlist){
        let durationSum = 0;

        for(let i=0; i < Tocadiscos.canciones.length; i++){
            durationSum += Tocadiscos.canciones[i].duration;
            Tocadiscos.valorTiempoGeneral = durationSum;
        }

    }

    btnStart.removeAttribute("disabled");
    btnStop.removeAttribute("disabled");
    progressIndicator.removeAttribute("disabled");
}

// Presionar el botón de inicio/pausa
function onClickBtnStart(e) {
    if(btnStart.classList.contains("to_pause")){
        onPausePlayer();
    }else{
        onPlayPlayer();
    }
}

// Actualiza el valor de la etiqueta del porcentaje de progreso
function onUpdateProgressSong(e){
    let progressValue = e.detail.value;
    progressIndicator.textContent = progressValue + " %";
}

// Presionar el botón de detener
function onClickBtnStop(e) {
    player.stop();
}

// Reinicar los valores de las distintas etiquetas
function Clean() {
    player.pause();
    player.duration = 0;

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
// Se activa al presionar el click izquierdo
function onMouseDownArm(e) {
    player.pause();
    arm.style.cursor = "col-resize";
    isMovingArm = true;
    //console.log("down", e);
}

// Al mover el puntero se va leyendo los valores del adelantado/retroces0
function onMouseMoveArm(e) {
    if(isMovingArm)
        onClickDisk({x: e.x, y: e.y});
}

// Al soltar el click izquierdo se reanuda la reproducción
function onMouseUpArm(e) {
    player.play();
    arm.style.cursor = "";
    isMovingArm = false;
    //console.log("up", e);
}

// Calcular el tiempo de adelantado/retroceso de la pista
function onClickDisk(e) {
    if(Tocadiscos.moverAguja == 1 && player.paused){
        let newCurrentTime = 0;
        screenX = e.x,
        screenY = e.y,
        offsetLeft = disk.offsetParent.offsetLeft + disk.offsetLeft,
        //clientRect = disk.of,
        minX = 136,
        maxX = disk.offsetWidth,
        minY = 61,
        maxY = disk.offsetHeight - 61,
        moveMaxX = offsetLeft + minX,
        moveMinX = offsetLeft + maxX,
        distance = {
            x: screenX - offsetLeft,
            y: screenY - (disk.offsetParent.offsetTop + disk.offsetTop)
        };

        // Obtener la duración total
        let duration = (Tocadiscos.reproductorTipo == ReproductorTipo.Playlist) ? player.duration : Tocadiscos.valorTiempoGeneral;

        duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? Tocadiscos.valorTiempoGeneral : duration;
        //console.log(distance, minY, maxY);
        
        // Si los valores de X y Y del cursor están dentro del rango permitido
        if((distance.x >= minX && distance.x <= maxX) && (distance.y >= minY && distance.y <= maxY)){
            distance = Math.abs((distance.x - minX) - (maxX - minX));
            maxX = maxX - minX;

            newCurrentTime = Math.floor(distance * duration / maxX);
            newCurrentTime = (newCurrentTime > duration) ? duration : (newCurrentTime < 0) ? 0 : newCurrentTime;
            //console.log(newCurrentTime, distance, `min: ${minX}`, `max: ${maxX}`);

            player.currentTime = newCurrentTime;
            currentTime = newCurrentTime;
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
    //player.prototype.source = onSourcePlayer;

    // Cargar configuraciones del tocadiscos
    (function(){
        disk.classList.add(discoTipo(Tocadiscos.disco));
        arm.classList.add(agujaTipo(Tocadiscos.aguja));
        getTotalDurationForPlaylist();
    })();

    diskClientRect = disk.getBoundingClientRect();

    player
        .on("loadeddata", onLoadPlayerData)
        .on("timeupdate", onCurrentTimeInterval)
        .on("play", onPlayPlayer)
        .on("pause", onPausePlayer)
        .on("ended", onEndedPlayerData);

    //disk.on("click", onClickDisk);

    btnStart.on("click", onClickBtnStart);

    progressIndicator.on("updateprogresssong", onUpdateProgressSong);

    arm
        .on('updaterotationarm', onUpdateRotationArm)
        .on("mousedown", onMouseDownArm)
        .on("mousemove", onMouseMoveArm)
        .on("mouseup", onMouseUpArm);

    //document.body.on("mousemove", onMouseMoveArm);

    btnStop.on("click", onClickBtnStop);

    lastTimeIndicator.on("updateTiempoRestante", onUpdateTiempoRestante);
});