/**
 * Daniela Hernández Valenzuela
 * Valeria Sanchez García
 * Juan José Guzmán Landa
 * Bryan Alberto Durán Cuellar
 * Luis Pablo Reyes Fernández
 * 
 * Universidad Veracruzana
 * Materia: Interacción Humano Computadora
 * Fecha: 25 de noviembre del 2019
 * Facilitador: Dr. Rafael Rojano Cáceres
 */

document.getElementById("btnPintar").style.backgroundColor = "#FDC208";
document.getElementById("btnPintar").style.color = "black";
//document.getElementById("btnPintar").style.boxShadow = "none"; 
document.getElementById("btnBorrar").style.backgroundColor = "transparent";
document.getElementById("btnBorrar").style.color = "#FDC208";
//document.getElementById("btnBorrar").style.boxShadow = "none"; 
document.getElementById("btnRelleno").style.backgroundColor = "transparent";
document.getElementById("btnRelleno").style.color = "#FDC208";
//document.getElementById("btnRelleno").style.boxShadow = "none"; 

var relleno = new Boolean(false);
var pinta = new Boolean(true);
var borrar = new Boolean(false);
const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const canvasPaint = document.getElementById("canvasPaint");
const context = canvas.getContext("2d");
const ctx = canvasPaint.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let imgindex = 1
let isVideo = false;
let model = null;
let videoInterval = 100

// VALORES PREDETERMINADOS PARA PINTAR
var color = "#000000";
var tamano = 10;
var pintura = false;
var pinturaCamara = false;
var anteriorX, anteriorY = 0;

// PARAMETROS PARA EL VIDEO
const modelParams = {
    maxNumBoxes: 1, // Numero de manos que va a detectar
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
    flipHorizontal: true, // si el video va a ser como un espejo o no
}

// FUNCION QUE NOS PERMITE COMENZAR A DETECTAR LAS MANOS PARA PINTAR
function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            isVideo = true;
            runDetection();
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

// FUNCION QUE CAMBIA EL BOTON DE VIDEO DEPENDEINDO SI ESTA ACTIVADO O NO
function toggleVideo() {
    if (!isVideo) {
        document.getElementById("trackbutton").style.backgroundColor = "#167BFF";
        document.getElementById("trackbutton").style.borderColor = "#167BFF";
        document.getElementById("trackbutton").style.color = "white";
        document.getElementById("trackbutton").style.boxShadow = "none"; 
        startVideo();
    } else {
        document.getElementById("trackbutton").style.backgroundColor = "#FDC208";
        document.getElementById("trackbutton").style.borderColor = "#FDC208";
        document.getElementById("trackbutton").style.color = "black";
        handTrack.stopVideo(video);
        isVideo = false;
    }
}

trackButton.addEventListener("click", function () {
    toggleVideo();
});

// FUNCION QUE CARGA EL HANDTRACK AL PROYECTO
handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
    updatenote.style.display = "none";
    trackButton.disabled = false
});

let windowXRange, worldXRange = 0
let windowYRange, worldYRange = 0
let Vec2
let accelFactor

// MEDIDAS DEL CANVAS DONDE SE VA A PINTAR
windowHeight =  canvasPaint.clientHeight
windowWidth = canvasPaint.clientWidth

var scale_factor = 10
var SPACE_WIDTH = windowWidth / scale_factor;
var SPACE_HEIGHT = windowHeight / scale_factor;

windowXRange = [0, windowWidth]
worldXRange = [-(SPACE_WIDTH / 2), SPACE_WIDTH / 2]

windowYRange = [0, windowHeight]
worldYRange = [-(SPACE_HEIGHT / 2), SPACE_HEIGHT / 2]

accelFactor = 0.042 * SPACE_WIDTH;

// FUNCION QUE PERMITE CAPTAR LA MANO DESDE LA CAMARA Y PASARLO A COORDENADAS EN EL CANVAS
function runDetection() {
    model.detect(video).then(predictions => {
        model.renderPredictions(predictions, canvas, context, video);
        if (predictions[0]) {
            let midvalH = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
            let midvalV = predictions[0].bbox[1] + (predictions[0].bbox[3] / 2)
            //gamex = document.body.clientWidth * (midvalH / video.width)
            //gamey = document.body.clientHeight * (midvalV / video.height)

            var xVideo = (midvalH * windowWidth) / video.width;
            
            let yVideo = (midvalV * windowHeight) / video.height;
            //let x = convertToRange(xVideo,windowXRange, worldXRange);
            //console.log("x=" +x);

            //pintar(event,gamex,gamey);
            pintar(event,xVideo,yVideo);
            
        }
        if (isVideo) {
            setTimeout(() => {
                runDetection(video)
            }, videoInterval);
        }
    });
}

// FUNCION QUE PERMITE PINTAR O BORRAR SEGUN SEA EL CASO YA SEA CON LA MANO O CON EL MOUSE
function pintar(event,gamex, gamey){
    if (pinta == true){
        if (isVideo){
            //PINTAR CON LA MANO
            pinturaCamara = true;
            document.getElementById("canvasPaint").style.cursor = "none";
            //mouseX = convertToRange(gamex, windowXRange, worldXRange);
            if(pinturaCamara){
                //ctx.fillStyle = color;
                //ctx.fillRect (gamex, gamey, tamano, tamano);
                if (anteriorX == 0){
                    anteriorX = event.clientX;
                    anteriorY = event.clientY-20;
                }
                
                ctx.beginPath();
                ctx.moveTo(anteriorX, anteriorY);
                ctx.lineTo(gamex, gamey);
                ctx.lineWidth = tamano;
                ctx.strokeStyle = color;
                ctx.stroke();
                // ACTUALIZAR ANTERIOR
                anteriorX = gamex;
                anteriorY = gamey;
            }
        } else {
            //PINTAR CON EL MOUSE
            document.getElementById("canvasPaint").style.cursor = "pointer";
            pinturaCamara = false;
            var x = event.clientX;
            var alturaBarra = document.getElementById("barra_navegacion").clientHeight;
            var y = event.clientY-alturaBarra;
            if(!pinturaCamara){
                ctx.fillStyle = color;
                ctx.fillRect(x,y,tamano,tamano);
            }
        }
    } else if (borrar == true){
        if (isVideo){
            //BORRAR CON LA MANO
            pinturaCamara = true;
            document.getElementById("canvasPaint").style.cursor = "none";
            if(pinturaCamara){
                if (anteriorX == 0){
                    anteriorX = event.clientX;
                    anteriorY = event.clientY-20;
                }
                ctx.clearRect(anteriorX,anteriorY,tamano, tamano);
                // ACTUALIZAR ANTERIOR
                anteriorX = gamex;
                anteriorY = gamey;
            }
        } else {
            //BORRAR CON EL MOUSE
            document.getElementById("canvasPaint").style.cursor = "pointer";
            pinturaCamara = false;
            var x = event.clientX;
            var alturaBarra = document.getElementById("barra_navegacion").clientHeight;
            var y = event.clientY-alturaBarra;
            if(!pinturaCamara){
                ctx.fillStyle = color;
                ctx.clearRect(x,y,tamano,tamano);
            }
        }
    }
}


function activar(){
    pintura = true;
    pinturaCamara = true;
}

function desactivar(){
    pintura = false;
    pinturaCamara = false;
}

// FUNCION QUE CAMBIA EL COLOR DEL BOTON DE BORRADOR Y HABILITA LA FUNCION DE BORRAR
function borrador(){
    relleno = false;
    pinta = false;
    borrar = true;
    document.getElementById("btnPintar").style.backgroundColor = "transparent";
    document.getElementById("btnPintar").style.color = "#FDC208";
    document.getElementById("btnBorrar").style.backgroundColor = "#FDC208";
    document.getElementById("btnBorrar").style.color = "black";
    document.getElementById("btnRelleno").style.backgroundColor = "transparent";
    document.getElementById("btnRelleno").style.color = "#FDC208";
    document.getElementById("canvasPaint").style.cursor = "cursor: url('../img/pencil.cur'), auto";
    color = "#FFFFFF";
    document.getElementById("colores").setAttribute("disable", "");
}

// FUNCION QUE CAMBIA EL COLOR DEL BOTON DE LAPIZ Y HABILITA LA FUNCION DE PINTAR
function lapiz(){
    relleno = false;
    pinta = true;
    borrar = false;
    document.getElementById("btnPintar").style.backgroundColor = "#FDC208";
    document.getElementById("btnPintar").style.color = "black";
    document.getElementById("btnBorrar").style.backgroundColor = "transparent";
    document.getElementById("btnBorrar").style.color = "#FDC208";
    document.getElementById("btnRelleno").style.backgroundColor = "transparent";
    document.getElementById("btnRelleno").style.color = "#FDC208";
    color = document.getElementById("colores").value;
    document.getElementById("colores").removeAttribute("disable");
}

// FUNCION QUE DETECTA EL COLOR DEL COLORPICKER Y HACE QUE SE PUEDA PINTAR CON ESE COLOR
function scolor(){
    color = document.getElementById("colores").value;
    if(relleno == true){
        document.getElementById("canvasPaint").style.backgroundColor = color;
    }
}

// FUNCION QUE DETECTA EL VALOR DEL RANGE Y LO PONE COMO GROSOR DE LA LINEA
function stamano(numero){
    tamano = numero;
}

function grosor(){
    var slider = document.getElementById("myRange");
    tamano = slider.value;
}

// FUNCION QUE CAMBIA EL COLOR DEL BOTON DE RELLENO Y HABILITA LA FUNCION DE RELLENAR
function rellenar(){
    document.getElementById("btnPintar").style.backgroundColor = "transparent";
    document.getElementById("btnPintar").style.color = "#FDC208";
    document.getElementById("btnBorrar").style.backgroundColor = "transparent";
    document.getElementById("btnBorrar").style.color = "#FDC208";
    document.getElementById("btnRelleno").style.backgroundColor = "#FDC208";
    document.getElementById("btnRelleno").style.color = "black";
    //color = document.getElementById("colores").value;
    document.getElementById("canvasPaint").style.backgroundColor = color;
    relleno = true;
    pinta = false;
    borrar = false;
}


// CONVIERTE VALORES A UN RANGO MAS ACERTADO
// NO SE HA LOGRADO IMPLEMENTAR
function convertToRange(value, srcRange, dstRange) {
    // value is outside source range return
    if (value < srcRange[0] || value > srcRange[1]) {
        return NaN;
    }

    var srcMax = srcRange[1] - srcRange[0],
        dstMax = dstRange[1] - dstRange[0],
        adjValue = value - srcRange[0];

    return (adjValue * dstMax / srcMax) + dstRange[0];

}