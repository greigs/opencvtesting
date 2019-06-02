
const con = require('electron').remote.getGlobal('console');
const cv = require('../libs/opencv')

var canvas;
var capture;
var pg;
var ready = false;
var vidwidth = 640;
var vidheight = 480;
async function setup() {
    canvas = createCanvas(vidwidth, vidheight);
    //canvas.canvas.style.display = "block";
    //pg = createGraphics(width, height);
    //background(0);
    //document.getElementById('defaultCanvas0').style.display = 'none'; 
    let options = {}
    await navigator.mediaDevices.enumerateDevices().then(function (sources) {
       //console.log(sources);
        let source = sources.filter(x => x.label.startsWith('VGA USB Camera')).pop();
        console.log(source);
        options = {
            video: {
                width: {exact: vidwidth},
                height: {exact: vidheight},
                frameRate: { min: 60, max: 60 },
                deviceId: source.deviceId,
            }
        };
    });
    console.log(options);
    capture = createCapture(options);
    
    capture.size(vidwidth, vidheight);
    //capture.hide();
    trackingSetup();
    //ready = true;
}

function draw() {
    
    if (ready){
        background(0);
        pg.image(capture, 0, 0);
        var mat = cv.imread(pg.canvas);
        cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
        cv.blur(mat, mat, new cv.Size(3,3), new cv.Point(-1,-1), cv.BORDER_DEFAULT);
        //cv.Canny(mat, mat, 50, 100, 3, false);
        cv.imshow(canvas.canvas, mat);
        mat.delete();
    }
}

function println(s) {
    con.log(s);
}


var tracker;

var rhi, ghi, bhi;
var rlo, glo, blo;

function setTarget(r, g, b, range) {
    range = range || 32;
    rhi = r + range, rlo = r - range;
    ghi = g + range, glo = g - range;
    bhi = b + range, blo = b - range;
}

function trackingSetup(){
    
    //cnv = createCanvas(320, 240);
    //cnv.parent('container');

    setTarget(255, 255, 255); // by default track white
    tracking.ColorTracker.registerColor('match', function (r, g, b) {
        if (r <= rhi && r >= rlo &&
            g <= ghi && g >= glo &&
            b <= bhi && b >= blo) {
            return true;
        }
        return false;
    });
    tracker = new tracking.ColorTracker(['match']);
    tracker.minDimension = 20; // make this smaller to track smaller objects    
    tracking.track('video', tracker, {
        camera: false,
        audio: false
    });
    tracker.on('track', function (event) {
        event.data.forEach(function (r) {
            canvas.clear();
            strokeWeight(1);
            stroke(255, 0, 0);
            noFill();
            event.data.forEach(function (r) {
                rect(r.x, r.y, r.width, r.height);
            })
        })
    });
}