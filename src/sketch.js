
const con = require('electron').remote.getGlobal('console');
const cv = require('../libs/opencv')

var canvas;
var capture;
var pg;
var ready = false;
var vidwidth = 640;
var vidheight = 480;
var linePoints = [];
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
        cv.fit
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
    tracker.minDimension = 5; // make this smaller to track smaller objects    
    tracker.maxDimension = 50; 
    tracking.track('video', tracker, {
        camera: false,
        audio: false
    });
    strokeWeight(2);
    stroke(255, 0, 0);
    noFill();
    tracker.on('track', function (event) {
        canvas.clear();
        if (event.data.length > 3){
            let points = []
            event.data.forEach(function (r) {
                rect(r.x, r.y, r.width, r.height);
                points.push(new cv.Point(r.x, r.y));
            });

            pointsAsArray = []
            points.forEach(element => {
                pointsAsArray.push(element.x)
                pointsAsArray.push(element.y)
            });
            let contours = new cv.MatVector();
            let newMat = cv.matFromArray(points.length, 2, cv.CV_16UC1, pointsAsArray) // rows, columns?
            contours.push_back(newMat)
            
            let myline = new cv.Mat();
            let cnt = contours.get(0);
            // You can try more different parameters
            cv.fitLine(cnt, myline, cv.DIST_L2, 0, 0.01, 0.01);
            
            let vx2 = myline.data32F[0];
            let vy2 = myline.data32F[1];
            let x = myline.data32F[2];
            let y = myline.data32F[3];
            let lefty = Math.round((-x * vy2 / vx2) + y);
            let righty = Math.round(((vidwidth - x) * vy2 / vx2) + y);
            let point1 = new cv.Point(vidwidth - 1, righty);
            let point2 = new cv.Point(0, lefty);

            
                    
            // get direction vector
            let vx = point2.x - point1.x
            let vy = point2.y - point1.y
            // Normalize the vector
            let mag = Math.sqrt(vx*vx + vy*vy);
            vx = vx / mag;
            vy = vy / mag;
            // rotate 90
            let temp = vx; 
            vx1 = -vy; 
            vy1 = temp;

            temp = vy; 
            vy2 = -vx; 
            vx2 = temp;

            let length = 20
            // get new line
            let cx = point2.x + vx1 * length; 
            let cy = point2.y + vy1 * length;

            let dx = point2.x + vx1 * -length;
            let dy = point2.y + vy1 * -length;

            // get new line
            let ex = point1.x + vx1 * length; 
            let ey = point1.y + vy1 * length;

            let fx = point1.x + vx1 * -length;
            let fy = point1.y + vy1 * -length;



            let gx = point2.x + vx2 * length; 
            let gy = point2.y + vy2 * length;

            let hx = point2.x + vx2 * -length;
            let hy = point2.y + vy2 * -length;

            // get new line
            let ix = point1.x + vx2 * length; 
            let iy = point1.y + vy2 * length;

            let jx = point1.x + vx2 * -length;
            let jy = point1.y + vy2 * -length;

            linePoints = [point1, point2, new cv.Point(fx,fy), new cv.Point(dx,dy), new cv.Point(jx,jy), new cv.Point(hx,hy)]

            line(linePoints[0].x, linePoints[0].y, linePoints[1].x, linePoints[1].y);
            line(linePoints[2].x, linePoints[2].y, linePoints[3].x, linePoints[3].y);
            line(linePoints[4].x, linePoints[4].y, linePoints[5].x, linePoints[5].y);
                
            
        }

        //cv.draw(line);
    });
}