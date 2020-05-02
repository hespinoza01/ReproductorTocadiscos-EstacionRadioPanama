window.addEventListener("load", function () {
    var songs = new Array(
       {ruta:"canciones/011.mp3",artista:"Nacho",cancion:"Bailame"},
{ruta:"canciones/012.mp3",artista:"Chino y Nacho ft. Daddy Yankee",cancion:"Andas en mi cabeza"},
{ruta:"canciones/013.mp3",artista:"Danny Ocean",cancion:"Me rehuso"},
{ruta:"canciones/014.mp3",artista:"Danny Ocean",cancion:"Dembow"},
{ruta:"canciones/015.mp3",artista:"Danny Ocean",cancion:"Vuelve"}
//{ruta:"canciones/016.mp3",artista:"J Balvin, Willy William",cancion:"Mi gente"},
//{ruta:"canciones/017.mp3",artista:"Piso 21 ft. Manuel Turizo",cancion:"Dejala que Vuelva"}
    ); //Canciones
    var songsModify = songs.splice();
    var shuffle = true;//Shufle
    var loop = true;// Ciclo
    var nSong = 0; // Numero de la cancion
    var lastSong = songs[songs.length - 1];//Ultima cancion
    var recordar = new Array();//Combinaciones ya hechas 
    var console2 = new Array();// para console
    var interval;
    var seeking;
    if (shuffle) {
        songs.shuffle(songsModify,recordar,lastSong,console2,true);
        lastSong = songsModify[songs.length - 1];//Ultima cancion
    }
    var player = new Audio(songsModify[nSong].ruta); //Instancia de la clase Audio
    //-----------------Input-------------------//
    var nuevaHojaDeEstilo = document.createElement("style");
    document.head.appendChild(nuevaHojaDeEstilo);
    var elementoPadre1 = document.querySelector(".inputDiv.i1");
    var elementoPadre2 = document.querySelector(".inputDiv.i2");
    var inputsRy = [];
    var i = new Input("itr1","#df25d9","#5f2f5c",0); //SeekingBar
    var i2 = new Input("itr2","#ffd000","#fffd8a",100);//VolumeBar
    i.crear(elementoPadre1);
    i2.crear(elementoPadre2);
    inputsRy.push(i);
    inputsRy.push(i2);
    actualizarCSS();
    for (var n = 0; n < inputsRy.length; n++) {
        (function (n) {
            inputsRy[n].input.addEventListener("input", function () {
                inputsRy[n].actualizar();
                actualizarCSS();
            }, false)
        }(n));
    }
    //_-----------------------------------------------------------
    //Cuando carga el elemento
    player.onloadeddata = function () {
        // Control de Tiempo
        var inpClick = false;
        document.getElementById("timeTt").innerHTML = convertToTime(player.duration);
        var progressBarSong =  document.getElementById("itr1");
        interval = setInterval(function () {
            document.getElementById("timeR").innerHTML = convertToTime(player.duration - player.currentTime);
            document.getElementById("timeT").innerHTML = convertToTime(player.currentTime);
            if(inpClick == false){
                progressBarSong.value = (player.currentTime / player.duration) * 100;
                i.actualizar();
                actualizarCSS();
            }
        }, 1000);
        progressBarSong.addEventListener("mousedown",function(){
            inpClick = true;
        });
        progressBarSong.addEventListener("mouseup",function(){
            inpClick = false;
        });
        //Control de posicion de audio
        document.getElementById("itr1").addEventListener("mouseup", function (event) {
            player.currentTime = (this.value * player.duration) / 100;
        });
    }
    //Cuando termina un evento
    player.onended = function () {
        nSong++;
        if (nSong == songs.length && loop == true) {
            if (shuffle == true) {
                nSong = 0;
                songs.shuffle(songsModify, recordar, lastSong,console2);
                lastSong = songsModify[songsModify.length - 1];
                player.src = songsModify[nSong].ruta;
                player.play();
            } else {
                nSong = 0;
                player.src = songsModify[nSong].ruta;
                player.play();
            }
        } else if (nSong == songs.length && loop == false) {
            alert("termino");
        } else {
            player.src = songsModify[nSong].ruta;
            player.play();
        }
    }
    //Click en siguiente
    document.querySelector("#next img").addEventListener("click", function () {
        if (nSong == songs.length - 1) {
            if (shuffle == true) {
                songs.shuffle(songsModify, recordar, lastSong,console2);
                lastSong = songsModify[songsModify.length - 1];
                nSong = 0;
            } else {
                nSong = 0;
            }
        } else {
            nSong++;
        }
        clearInterval(interval);
        document.getElementById("timeTt").innerHTML = "00<span class='slash'>:</span>00";
        document.getElementById("timeR").innerHTML = "00<span class='slash'>:</span>00";
        document.getElementById("timeT").innerHTML = "00<span class='slash'>:</span>00";
        player.src = songsModify[nSong].ruta;
        player.play();
    });
    //Click en Anterior
    document.querySelector("#prev img").addEventListener("click", function () {
        if (nSong == 0) {
            if (shuffle == true) {
                songs.shuffle(songsModify, recordar, lastSong,console2);
                lastSong = songsModify[songsModify.length - 1];
                nSong = songs.length - 1;
            } else {
                nSong = songs.length - 1;
            }
        } else {
            nSong--;
        }
        clearInterval(interval);
        document.getElementById("timeTt").innerHTML = "00<span class='slash'>:</span>00";
        document.getElementById("timeR").innerHTML = "00<span class='slash'>:</span>00";
        document.getElementById("timeT").innerHTML = "00<span class='slash'>:</span>00";
        player.src = songsModify[nSong].ruta;
        player.play();
    });
    //Click en Play
    document.getElementById("playPause").addEventListener("click", function () {
        if (player.paused == true) {
            player.play();
            document.querySelector("#playPause img").src = "img/PLAY.png";
        }else{
            player.pause();
            document.querySelector("#playPause img").src = "img/PAUSA.png";
        }
    });
    //Click en Pause
    document.getElementById("itr2").addEventListener("input",function(){
        i2.actualizarVolumen();
    });
    //----------------------------------------------------------------------------------
    function Input(id,c1,c2,value) {
        //<input type="range" value="35" min="0" max="100" autocomplete="off" step="1">
        this.att = {};
        this.att.type = "range";
        this.att.id = id;
        this.att.value = value;
        this.att.min = 0;
        this.att.max = 100;
        this.att.autocomplete = "off";
        this.att.step = "1";
        this.color = {};
        this.color.a = c1; // la parte "baja" del slider
        this.color.b = c2; // la parte "alta" del slider
        this.input;
        this.interval = this.att.max - this.att.min;

        this.crear = function (elementoPadre) {
            this.input = document.createElement("input");
            this.output = document.createElement("div");
            this.output.innerHTML = this.att.value;
            this.output.setAttribute("class", "output");
            for (var name in this.att) {
                if (this.att.hasOwnProperty(name)) {
                    this.input.setAttribute(name, this.att[name]);
                }
            }
            elementoPadre.appendChild(this.input);
            this.CSSstyle();
        }
        this.actualizar = function () {
            this.att.value = this.input.value;
            this.CSSstyle();
        }
        this.actualizarVolumen = function(value = this.input.value){
            document.getElementById("volPorcent").innerHTML = value+"%"; // control de volumen
            document.getElementById("vol-tuner").value = value;
            player.volume = value/100;
        };
        this.CSSstyle = function () {
            // calcula la posición del thumb en porcentajes
            this.porcentaje = ((this.att.value - this.att.min) / this.interval) * 100;
            // establece las nuevas reglas CSS
            this.style = "#" + this.att.id + "::-webkit-slider-runnable-track{ background-image:-webkit-linear-gradient(left, " + this.color.a + " " + this.porcentaje + "%, " + this.color.b + " " + this.porcentaje + "%)}\n";
            this.style += "#" + this.att.id + "::-moz-range-track{ background-image:-moz-linear-gradient(left, " + this.color.a + " " + this.porcentaje + "%, " + this.color.b + " " + this.porcentaje + "%)}\n";
        }
    }
    function actualizarCSS() {
        // una cadena de texto donde guardar los estilos
        var HojaCSS = "";
        for (var i = 0; i < inputsRy.length; i++) {
            HojaCSS += inputsRy[i].style;
        }
        nuevaHojaDeEstilo.textContent = HojaCSS;
    }
    
    /*document.getElementById("volume").addEventListener("mouseout",function(){

    });*/
});
Array.prototype.shuffle = function (newObj, recordar, lastSong,console2, first = false) {//Array para recordar , ultima cancion
    var last;
    if (recordar.length == this.length) {
        recordar.splice(0, recordar.length);
        console2.splice(0, console2.length);
    }
    var arrOriginal = this;
    var conssole = new Array();
    this.forEach(element => {
        if (element.ruta == lastSong.ruta) {
            last = this.indexOf(lastSong);
            if(first == false){
                console.log("ultima cancion del array anterior--->"+(last+1));
            } 
        }
    });
    var objeToN = Object.keys(this.slice());
    var arr = new Array();
    objeToN.forEach(element => {
        arr.push(parseInt(element));
    });
    var fijo = Math.round(Math.random() * (arr.length - 1 - 0) + 0);
    var n = fijo;
    if (recordar.includes(fijo) == false) {
        recordar.push(fijo);
        console2.push(fijo+1);
        var pos = arr.indexOf(fijo);
    } else {
        while (recordar.includes(n)) {
            n = Math.round(Math.random() * (arr.length - 1 - 0) + 0);
        }
        fijo = n;
        recordar.push(fijo);
        console2.push(fijo+1);
        var pos = arr.indexOf(fijo); // indice antes de fijo
    }
    console.log(fijo + 1 + " Numero fijo");
    console.log(console2 + "--> Nuemeros ya usados");
    //Numero fijo elejido aleatoriamente

    //Primer paso Array normal
    arr.forEach(element => {
        conssole.push(element + 1);
    });
    console.log(conssole + "---> Array Original");
    //Segundo paso Shuffling el array
   /* for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];                                // FISHERRRR YATESSS
        arr[j] = temp;
    }*/
    var len = arr.length;  // VARIANTE DE FISHER YATES!
    for (let i = 0; i < len - 1; i++) { // 0 to n -1, exclusive because the last item doesn't need swapping
        let j = Math.floor(Math.random() *  (len-(i+1)))+(i+1); // i+1 to len, exclusive
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    if (arr[pos] != fijo) {
        var replace = arr[pos];
        arr.splice(arr.indexOf(fijo), 1, replace);
        arr.splice(pos, 1, fijo);
    }
    conssole.splice(0, conssole.length);
    arr.forEach(element => {
        conssole.push(element + 1);
    });
    console.log(conssole + "--->Array Desordenado");
    //Tercer paso array Acomodar el array
    if (arr.length % 2 == 0) {
        var mitad1 = arr.slice(0, arr.length / 2);
        var mitad2 = arr.slice((arr.length / 2));
        var arraySize = arr.length;
        mitad1.forEach(element => {
            arr.push(mitad2[arr.indexOf(element)]);
            arr.push(mitad1[arr.indexOf(element)]);
        });
        arr.splice(0, arraySize);
    } else {
        var mitad1 = arr.slice(0, Math.floor(arr.length / 2));
        var mitad2 = arr.slice(Math.ceil(arr.length / 2));
        var rest = arr[Math.floor(arr.length / 2)];
        var arraySize = arr.length;
        mitad1.forEach(element => {
            arr.push(mitad2[arr.indexOf(element)]);
            arr.push(mitad1[arr.indexOf(element)]);
        });
        arr.push(parseInt(rest));
        arr.splice(0, arraySize);
    }
    conssole.splice(0, conssole.length);
    arr.forEach(element => {
        conssole.push(element + 1);
    });
    console.log(conssole + "--->Array acomodado");
    if (last == arr[0] && first == false) {
        console.log("Se repitio el primero con el ultimo numero---revolviendo de nuevo");
        recordar.splice(newObj.indexOf(fijo), 1);
        console2.splice(newObj.indexOf(fijo + 1), 1);
        arrOriginal.shuffle(newObj, recordar,lastSong,console2);
    } else {
        newObj.splice(0, newObj.length);
        arr.forEach(element => {
            newObj.push(arrOriginal[element]);

        });
        console.log(newObj);
        console.log("-------------------------------------");
        return newObj;
    }
}
function convertToTime(dur) {
    var num_segs = parseInt(dur);
    var horas = Math.floor(num_segs / 3600);
    var minutos = Math.floor((num_segs - (horas * 3600)) / 60);
    var segundos = num_segs - (horas * 3600) - (minutos * 60);
    if (horas < 10) { horas = "0" + horas; }
    if (minutos < 10) { minutos = "0" + minutos; }
    if (segundos < 10) { segundos = "0" + segundos; }
    if (horas == "00") {
        var tiempo = minutos + "<span class='slash'>:</span>" + segundos;
    } else {
        var tiempo = horas + "<span class='slash'>:</span>" + minutos + "<span class='slash'>:</span>" + segundos;
    }
    return tiempo;
}