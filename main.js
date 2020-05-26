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
    timeArmMoving = 0,
    diskClientRect = null,
    rotationIncrement = 0,
    currentTimeInterval = null,
    songIndex = 0;

// Arreglo con la lista de las canciones
const SONGS = new Array(
    {path: "https://vk.com/doc297826490_503417139", artist: "Nacho", song: "Bailame", duration: "03:27"},
    {path: "./canciones/010.txt", artist: "Nacho", song: "Bailame", duration: "04:39"},
    {path: "./canciones/011.json", artist: "Nacho", song: "Bailame", duration: "04:47"},
    {path: "./canciones/011.mp3", artist: "Nacho", song: "Bailame", duration: "04:09"},
    {path: "./canciones/012.mp3", artist: "Chino y Nacho ft. Daddy Yankee", song: "Andas en mi cabeza", duration: "04:26"},
    {path: "./canciones/013.mp3", artist: "Danny Ocean", song: "Me rehuso", duration: "03:43"},
    {path: "./canciones/014.mp3", artist: "Danny Ocean", song: "Dembow", duration: "04:23"},
    {path: "./canciones/015.mp3", artist: "Danny Ocean", song: "Vuelve", duration: "03:39"},
    {path: "https://vk.com/doc297826490_516662404", type:"mp3", artist: "Nacho", song: "Bailame", duration: "55:37"},
    {path: "https://drive.google.com/uc?export=download&id=1-HRTK8iCj9PZyNmw-RId10BotJuEoI15", type:"mp3", artist: "Nacho", song: "Bailame", duration: "01:52:34"}
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
        case 4:
            return "disk4";
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
                inicio: ([2,4].indexOf(Tocadiscos.disco) === -1) ? -15 : -12,
                fin: ([2,4].indexOf(Tocadiscos.disco) === -1) ? 4 : 0,
                deg: ([2,4].indexOf(Tocadiscos.disco) === -1) ? 20 : 13
            };
            break;
        case 2:
            // arm2
            return {
                inicio: ([2,4].indexOf(Tocadiscos.disco) === -1) ? -12 : -8,
                fin: ([2,4].indexOf(Tocadiscos.disco) === -1) ? 12 : 8,
                deg: ([2,4].indexOf(Tocadiscos.disco) === -1) ? 25 : 17
            };
            break;
        case 3:
            // arm3
            return {
                inicio: ([2,4].indexOf(Tocadiscos.disco) === -1) ? -30 : -28,
                fin: ([2,4].indexOf(Tocadiscos.disco) === -1) ? -13 : -15,
                deg: ([2,4].indexOf(Tocadiscos.disco) === -1) ? 17 : 13
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
        get Shuffle(){ return 3; }, // Reproducir revolviendo la lista
        get Sattolo(){ return 4; } // Reproducir revolviendo con Sattolo
    },
    // Tipo de visualización del tiempo final de la reproducción
    TiempoFinal = {
        get TiempoTotal(){ return 1; }, // Muestra el tiempo total de reproducción
        get TiempoRestante(){ return 2; } // Muestra el tiempo restante de la reproducción
    };

const Tocadiscos = {
    disco: 2, // Estilo del disco 1, 2, 3
    aguja: 1, // Estilo de la aguja 1, 2, 3
    reproductorTipo: 1, // Tipo de reproductor 1=lista, 2=radio
    canciones: SONGS, // Lista de canciones a reproducir para la opción 1 de 'reproductorTipo' o la dirección para la opción 2 de 'reproductorTipo'
    url: 'https://icecast.teveo.cu/b3jbfThq',//'http://198.27.83.198:5140/stream', // URL de la radio
    mostrarTiempoGeneral: 0, // Mostrar tiempo general de la reproducción, 1=sí, 0=no
    valorTiempoGeneral: "01:01:00", // Tiempo de duración en segundos para el tipo de reproducción general, 1 hora = 3600 segundos
    estiloReproduccion: 1, // Tipo de reproducción 1=inicio a fin, 2=inicio a fin y repetir, 3=revolver lista, 4=sattolo
    tiempoFinal: 2, // Tipo de tiempo final 1=timepo total, 2=tiempo restante
    moverAguja: 1 // Mover aguja para adelantar/retrasar pista 1=si, 0=no
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
Array.prototype.sattolo = function() {
    const len = this.length;

    for (let i = 0; i < len - 1; i++) { // 0 to n -1, exclusive because the last item doesn't need swapping
        let j = Math.floor(Math.random() * (len-(i+1)))+(i+1); // i+1 to len, exclusive
        const temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    
    return this;
}
Array.prototype.copy = function() {
    return Array.from(this);
}
Array.prototype.equalsTo = function(array) {
    if (this.length !== array.length) return false;

    for (let i = 0; i < this.length; i++) {
        if (this[i] !== array[i]) return false;
    }

    return true;
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
let player = null,
    oldShuffleSongs = new Array();



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

// Convertir el tiempo del formato "00:00:00" a segundos
function getSecondsTime(duration) {
    if(typeof duration === "number") return duration;
    if(typeof duration !== "string") return 0;

    duration = duration.split(":");
    let time = 0;

    if(duration.length === 2) {
        time += Number(duration[0]) * 60;
        time += Number(duration[1]);
    } else if(duration.length === 3) {
        time += Number(duration[0]) * 3600;
        time += Number(duration[1]) * 60;
        time += Number(duration[2]);
    }

    return time;
}

// carga el recurso de la pista, ya sea la direción del mp3 o el base64
function setSource(source, type) {
    let isNotStream = Tocadiscos.reproductorTipo !== ReproductorTipo.Stream,
        isType = type;
        
    return new Promise((resolve, reject) => {
        if(isNotStream){
            // Si la dirección contiene extensión js|txt|json o si es una url normal sin extensión
            // Se carga el valor del base64
            if(source.match(/\w+.(txt|json|js)/g) || (!source.match(/.+(mp3|ogg|opus|aac|m4a)/g)) && !isType){
                console.log("base64")
                let script = document.createElement("script");

                script.onload = _ => {
                    player.src = base64;
                    script.remove();
                    resolve();
                }

                script.src = source;
                document.body.appendChild(script);
            }else if(source.match(/.+(mp3|ogg|opus|aac|m4a)/g) || isType){
                // cargar el archivo mp3|ogg|opus|aac|m4a
                console.log("mp3")
                player.src = source;
                resolve();
            }else{
                // capturar un error
                reject();
            }
        }else{
            player.src = source;
            resolve();
        }
    });
}

function updateIndicators(currentTime, duration){
    let comodin = (duration >= 3600) ? "00<span style='color: yellow'>:</span>" : "";

    currentTimeIndicator.innerHTML = comodin + getReadableTime(currentTime);
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
        let durationTotal = (Tocadiscos.reproductorTipo === ReproductorTipo.Playlist) ? player.duration : getSecondsTime(Tocadiscos.valorTiempoGeneral);
        
        lastTimeIndicator.dispatchEvent(
            new CustomEvent('updateTiempoRestante', {
                detail: {
                    duration: durationTotal - currentTime,
                    total: durationTotal
                },
                bubbles: true,
                cancelable: true
            }));
    }
}

// Actualizar las etiquetas y tiempos a partir del tiempo actual de la pista
function onCurrentTimeInterval() {
    let duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? getSecondsTime(Tocadiscos.valorTiempoGeneral) : player.duration;

    if(Tocadiscos.reproductorTipo !== ReproductorTipo.Stream) {
        currentTime = (Tocadiscos.mostrarTiempoGeneral == 1) ? acumulateTime + player.currentTime : player.currentTime;
    }else{
        currentTime++;
    }

    if(Tocadiscos.reproductorTipo === ReproductorTipo.Stream){
        if(currentTime >= duration){
            updateIndicators(duration, duration);
            
            setTimeout(() => onClickBtnStop(), 500);

            setTimeout(() => { setSource(Tocadiscos.url).then(() => player.play()) }, 1500);
        }
    }
   
    //currentTime++;
    //console.log(currentTime, player.currentTime);
    if(currentTime < duration) {
        //currentTime++;
        updateIndicators(currentTime, duration);
    }
}

// Actualiza la etiqueta del tiempo restante
function onUpdateTiempoRestante(e) {
    let comodin = (e.detail.total >= 3600 && e.detail.duration < 3600) ? "00<span style='color: yellow'>:</span>" : "";
    lastTimeIndicator.innerHTML = comodin + getReadableTime(e.detail.duration);
}

// Al cargar la pista actual, carga la duración y calcula el ángulo de rotación del brazo
function onLoadPlayerData() {
    let duration = (Tocadiscos.reproductorTipo == ReproductorTipo.Playlist) ? player.duration : getSecondsTime(Tocadiscos.valorTiempoGeneral);

    duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? getSecondsTime(Tocadiscos.valorTiempoGeneral) : duration;
    
    let comodin = (duration >= 3600) ? "00<span style='color: yellow'>:</span>" : "";

    currentTimeIndicator.innerHTML = comodin + getReadableTime(0);
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
    let shuffleCheck = [EstiloReproduccion.Shuffle, EstiloReproduccion.Sattolo];

    if(!isStarted){
        // Verificar si se va a reproducir por lista de canciones
        if(Tocadiscos.reproductorTipo === ReproductorTipo.Playlist){
            if(Tocadiscos.canciones.length > 0){
                if(shuffleCheck.indexOf(Tocadiscos.estiloReproduccion) !== -1){
                    if(Tocadiscos.estiloReproduccion === EstiloReproduccion.Shuffle){
                        Tocadiscos.canciones.shuffle();
                    }else{
                        Tocadiscos.canciones.sattolo();
                    }
                    

                    console.log("----- Lista Inicial -----");
                    console.log(Tocadiscos.canciones);
                }

                // Valores de la canción actual en reproducción
                currentSong = {
                    index: songIndex,
                    path: Tocadiscos.canciones[songIndex].path,
                    type: (typeof Tocadiscos.canciones[songIndex].type == "undefined") ? false : true
                };
            }

         // En caso de que se este reproduciendo por medio del enlace de la radio
        }else if(Tocadiscos.reproductorTipo === ReproductorTipo.Stream){
            currentSong = {
                index: -1,
                path: Tocadiscos.url
            }
        }

        setSource(currentSong.path, currentSong.type)
            .then(() => player.play())
            .catch(() => console.error("Error on load source: ", currentSong.path));

        arm.style.transform = 'rotate('+agujaRotacion(Tocadiscos.aguja).inicio+'deg)';
        isStarted = true;
    }

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
        currentTimeIndicator.innerHTML = getReadableTime(currentTime);
        lastTimeIndicator.innerHTML = getReadableTime(Tocadiscos.valorTiempoGeneral);
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
            let shuffleCheck = [EstiloReproduccion.Shuffle, EstiloReproduccion.Sattolo];
            songIndex = (songIndex + 1 == playlistLength) ? -1 : songIndex;

            if(songIndex == -1 && shuffleCheck.indexOf(Tocadiscos.estiloReproduccion) !== -1){
                oldShuffleSongs = Tocadiscos.canciones.copy();

                let lastSOngFromOldList = oldShuffleSongs[oldShuffleSongs.length - 1];

                do{
                    if(Tocadiscos.estiloReproduccion === EstiloReproduccion.Shuffle){
                        Tocadiscos.canciones.shuffle();
                    }else{
                        Tocadiscos.canciones = oldShuffleSongs.copy();
                        Tocadiscos.canciones.sattolo();
                    }
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
                path: Tocadiscos.canciones[songIndex].path,
                type: (typeof Tocadiscos.canciones[songIndex].type == "undefined") ? false : true
            }

            setTimeout(() => {
                setSource(currentSong.path, currentSong.type)
                    .then(() => player.play())
                    .catch(() => console.error("Error on load source: ", currentSong.path));
            }, 2000);
        }
    }
}

// Obtener el total de duración para el modo de mostrarTiempoTotal
function getTotalDurationForPlaylist() {
    if(Tocadiscos.mostrarTiempoGeneral == 1 && Tocadiscos.reproductorTipo == ReproductorTipo.Playlist){
        let durationSum = 0;

        for(let i=0; i < Tocadiscos.canciones.length; i++){
            durationSum += getSecondsTime(Tocadiscos.canciones[i].duration);
            Tocadiscos.valorTiempoGeneral = durationSum;
        }

    }

    btnStart.removeAttribute("disabled");
    btnStop.removeAttribute("disabled");
    progressIndicator.removeAttribute("disabled");
}

// Presionar el botón de inicio/pausa
function onClickBtnStart(e) {
    if(Tocadiscos.reproductorTipo === ReproductorTipo.Stream){
        if(btnStart.classList.contains("to_pause")){
            clearInterval(currentTimeInterval);
            btnStart.classList.remove("to_pause");
            disk.style.animationPlayState = "paused";
            player.muted = true;
        }else{
            currentTimeInterval = setInterval(onCurrentTimeInterval, 1000);
            player.muted = false;
            btnStart.classList.add("to_pause");
            disk.classList.add("active");
            disk.style.animationPlayState = "running";
        }
    }

    if(btnStart.classList.contains("to_pause") && Tocadiscos.reproductorTipo !== ReproductorTipo.Stream){
        player.pause();
    }else{
        player.play();
    }
}

// Actualiza el valor de la etiqueta del porcentaje de progreso
function onUpdateProgressSong(e){
    let progressValue = e.detail.value;
    progressIndicator.textContent = ((progressValue <= 100) ? progressValue : 100) + " %";
}

// Presionar el botón de detener
function onClickBtnStop(e) {
    player.stop();
    player = new _Audio();

    if(Tocadiscos.reproductorTipo === ReproductorTipo.Stream)
        clearInterval(currentTimeInterval);
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
    if(Tocadiscos.mostrarTiempoGeneral === 1){
        window.dispatchEvent(
            new CustomEvent('locateSongToPlay', {
                detail: {
                    current: timeArmMoving
                },
                bubbles: true,
                cancelable: true
        }));

        timeArmMoving = 0;
    }else{
        player.play();
    }

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
        minX = ([2,4].indexOf(Tocadiscos.disco) === -1) ? 136 : 146,
        maxX = ([2,4].indexOf(Tocadiscos.disco) === -1) ? disk.offsetWidth : disk.offsetWidth - 10,
        minY = 61,
        maxY = disk.offsetHeight - 61,
        moveMaxX = offsetLeft + minX,
        moveMinX = offsetLeft + maxX,
        distance = {
            x: screenX - offsetLeft,
            y: screenY - (disk.offsetParent.offsetTop + disk.offsetTop)
        };

        // Obtener la duración total
        let duration = (Tocadiscos.reproductorTipo == ReproductorTipo.Playlist) ? player.duration : getSecondsTime(Tocadiscos.valorTiempoGeneral);

        duration = (Tocadiscos.mostrarTiempoGeneral == 1) ? getSecondsTime(Tocadiscos.valorTiempoGeneral) : duration;
        //console.log(distance, minY, maxY);

        // Si los valores de X y Y del cursor están dentro del rango permitido
        if((distance.x >= minX && distance.x <= maxX) && (distance.y >= minY && distance.y <= maxY)){
            distance = Math.abs((distance.x - minX) - (maxX - minX));
            maxX = maxX - minX;

            newCurrentTime = Math.floor(distance * duration / maxX);
            newCurrentTime = (newCurrentTime > duration) ? duration : (newCurrentTime < 0) ? 0 : newCurrentTime;
            //console.log(newCurrentTime, distance, `min: ${minX}`, `max: ${maxX}`);

            if(Tocadiscos.mostrarTiempoGeneral === 1){
                updateIndicators(newCurrentTime, duration);
                timeArmMoving = newCurrentTime;
            }else{
                player.currentTime = newCurrentTime;
                currentTime = newCurrentTime;
            }
        }
    }
}

function onLocateSongToPlay(e){
    let current = e.detail.current,
        oldSum = 0;
        sum = 0;

    if(Tocadiscos.reproductorTipo === ReproductorTipo.Playlist){
        for(let i=0; i<Tocadiscos.canciones.length; i++){
            oldSum = sum;
            sum += getSecondsTime(Tocadiscos.canciones[i].duration);

            if(sum >= current){
                acumulateTime = oldSum;

                setSource(Tocadiscos.canciones[i].path)
                    .then(() => player.play())
                    .catch(() => console.error("Error to load source: ", Tocadiscos.canciones[i].path));
                break;
            }
        }
    }
}

// Rotación de la aguja
function onUpdateRotationArm(e) {
    let rotate = agujaRotacion(Tocadiscos.aguja).inicio + e.detail.rotate;

    rotate = (rotate <= agujaRotacion(Tocadiscos.aguja).fin) ? rotate : agujaRotacion(Tocadiscos.aguja).fin;
    arm.style.transform = 'rotate('+ rotate +'deg)';
}

// Audio Prototypes
function _Audio() {
    let _audio = new Audio();

    // - Load array of song's
    _audio.songIndex = -1;
    // Detener la reproducción
    _audio.isStop = true;
    _audio.stop =function() {
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
            progressIndicator.textContent = "0 %"
        }, 10);
    }

    _audio
        .on("loadeddata", onLoadPlayerData)
        .on("timeupdate", (Tocadiscos.reproductorTipo !== ReproductorTipo.Stream) ? onCurrentTimeInterval : function(){})
        .on("play", onPlayPlayer)
        .on("pause", onPausePlayer)
        .on("ended", onEndedPlayerData);

    return _audio;
}

let touch = null;
// Código a ejecutar después de terminar de cargar la página
window.addEventListener("load", function () {
    //player.prototype.source = onSourcePlayer;

    // Cargar configuraciones del tocadiscos
    (function(){
        disk.classList.add(discoTipo(Tocadiscos.disco));
        arm.classList.add(agujaTipo(Tocadiscos.aguja));
        Tocadiscos.mostrarTiempoGeneral = (Tocadiscos.reproductorTipo == ReproductorTipo.Stream) ? 1 : Tocadiscos.mostrarTiempoGeneral;
        getTotalDurationForPlaylist();
    })();

    diskClientRect = disk.getBoundingClientRect();
    player = new _Audio();

    //disk.on("click", onClickDisk);

    btnStart.on("click", onClickBtnStart);

    progressIndicator.on("updateprogresssong", onUpdateProgressSong);

    arm
        .on('updaterotationarm', onUpdateRotationArm)
        .on("mousedown", onMouseDownArm)
        .on("mousemove", onMouseMoveArm)
        .on("mouseup", onMouseUpArm)
        .on("touchstart", onMouseDownArm)
        .on("touchmove", function(e){ onMouseMoveArm({x: e.touches[0].clientX, y: e.touches[0].clientY}) })
        .on("touchend", onMouseUpArm);

    //document.body.on("mousemove", onMouseMoveArm);

    btnStop.on("click", onClickBtnStop);

    lastTimeIndicator.on("updateTiempoRestante", onUpdateTiempoRestante);

    window.on("locateSongToPlay", onLocateSongToPlay);
});