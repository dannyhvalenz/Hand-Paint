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

var color = "#000000";
var tamano = 10;
var pintura = false;
var pinturaCamara = false;
var anteriorX, anteriorY = 0;

const modelParams = {
    maxNumBoxes: 1, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
    flipHorizontal: true,
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

trackButton.addEventListener("click", function () {
    toggleVideo();
});

handTrack.load(modelParams).then(lmodel => {
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});

let windowXRange, worldXRange = 0
let windowYRange, worldYRange = 0
let Vec2
let accelFactor

windowXRange = [0, windowWidth]
worldXRange = [-(SPACE_WIDTH / 2), SPACE_WIDTH / 2]

windowYRange = [0, windowHeight]
worldYRange = [-(SPACE_HEIGHT / 2), SPACE_HEIGHT / 2]

windowHeight =  canvasPaint.clientHeight
windowWidth = canvasPaint.clientWidth

var scale_factor = 10
var SPACE_WIDTH = windowWidth / scale_factor;
var SPACE_HEIGHT = windowHeight / scale_factor;

accelFactor = 0.042 * SPACE_WIDTH;

function runDetection() {
    model.detect(video).then(predictions => {
        model.renderPredictions(predictions, canvas, context, video);
        if (predictions[0]) {
            let midvalH = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
            let midvalV = predictions[0].bbox[1] + (predictions[0].bbox[3] / 2)
            gamex = document.body.clientWidth * (midvalH / video.width)
            gamey = document.body.clientHeight * (midvalV / video.height)

            if (isVideo){
                updateNote.innerText = "Coordenadas MOUSEX y MOUSEY: " + gamex + "," + gamey
            }
            pintar(event,gamex,gamey)
            
        }
        if (isVideo) {
            setTimeout(() => {
                runDetection(video)
            }, videoInterval);
        }
    });
}

function pintar(event,gamex, gamey){
    if (isVideo){
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
            updateNote.innerText = "Coordenadas MOUSEX y MOUSEY: " + gamex + "," + gamey
        }
    } else {
        document.getElementById("canvasPaint").style.cursor = "pointer";
        pinturaCamara = false;
        var x = event.clientX;
        var y = event.clientY-20;
        updateNote.innerText = "Coordenadas mouse: " + x + "," + y
        if(!pinturaCamara){
            ctx.fillStyle = color;
            ctx.fillRect (x,y,tamano,tamano);
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


function borrador(){
    document.getElementById("canvasPaint").style.cursor = "cursor: url('../img/pencil.cur'), auto";
    color = "#FFFFFF";
    document.getElementById("colores").setAttribute("disable", "");
}

function lapiz(){
    color = document.getElementById("colores").value;
    document.getElementById("colores").removeAttribute("disable");
}

function scolor(){
    color = document.getElementById("colores").value;
}

function stamano(numero){
    tamano = numero;
}
function grosor(){
    var slider = document.getElementById("myRange");
    tamano = slider.value;
}

function relleno(){
    color = document.getElementById("colores").value;
    document.getElementById("canvasPaint").style.backgroundColor = color;
}

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