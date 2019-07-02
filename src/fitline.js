//https://docs.opencv.org/3.4/dc/dcf/tutorial_js_contour_features.html

var input = [[100,100],[200,200],[300,300],[400,400]]
pointsAsArray = []
input.forEach(element => {
    pointsAsArray.push(element[0])
    pointsAsArray.push(element[1])
});
let src = cv.imread('canvasInput');
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let newMat = cv.matFromArray(input.length, 2, cv.CV_8UC1, pointsAsArray) // rows, columns?
contours.push_back(newMat)

let line = new cv.Mat();
let cnt = contours.get(0);
// You can try more different parameters
cv.fitLine(cnt, line, cv.DIST_L2, 0, 0.01, 0.01);
let contoursColor = new cv.Scalar(255, 255, 255);
let lineColor = new cv.Scalar(255, 0, 0);
let vx2 = line.data32F[0];
let vy2 = line.data32F[1];
let x = line.data32F[2];
let y = line.data32F[3];
let lefty = Math.round((-x * vy2 / vx2) + y);
let righty = Math.round(((src.cols - x) * vy2 / vx2) + y);
let point1 = new cv.Point(src.cols - 1, righty);
let point2 = new cv.Point(0, lefty);
cv.line(dst, point1, point2, lineColor, 2, cv.LINE_AA, 0);


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


//dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
cv.line(dst, new cv.Point(fx,fy), new cv.Point(dx,dy), lineColor, 2, cv.LINE_AA, 0);
cv.line(dst, new cv.Point(jx,jy), new cv.Point(hx,hy), lineColor, 2, cv.LINE_AA, 0);


cv.imshow('canvasOutput', dst);
src.delete(); dst.delete(); contours.delete(); line.delete(); cnt.delete();
