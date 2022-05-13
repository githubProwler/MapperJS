var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;
 
var elem = document.getElementById("atoms");
var labelX = document.getElementById("x");
var labelY = document.getElementById("y");
// var labelX2 = document.getElementById("x2");
// var labelY2 = document.getElementById("y2");
// var labelX3 = document.getElementById("x3");
// var labelY3 = document.getElementById("y3");


var state = {
    image:"https://i.ibb.co/51HgMyN/A.png",
    calibration:{
        x1  : 0,
        y1  : 0,
        xc1 : 0,
        yc1 : 0,
        x2  : 0,
        y2  : 0,
        xc2 : 0,
        yc2 : 0,
        count : 0,
        ongoing : false,
        calibrated : false,
    },
    savePoints:false,
    crosshair:true
}

var param = {
    width:window.innerWidth - 150,
    height:window.innerHeight - 20
}

var two = new Two(param).appendTo(elem);

// var styles = {
//   alignment: "center",
//   size: 36,
//   family: "Lato",
// };

var texture = new 
Two.Texture(state.image, 
function() {
    texture.image.width = param.width;
    texture.image.height = param.height;

    var shape = two.makeRectangle(
        two.width / 2,
        two.height / 2, 
        texture.image.width, 
        texture.image.height);     
    shape.noStroke().fill = texture;
    setTimeout(initRest, 30);
});

// console.log(circleA)
var text;
var lineX;
var lineY;

initRest();  

function initRest() {
    if (lineX != null) {
        two.remove(lineX)
        lineX = null;
    }
    if (lineY != null) {
        two.remove(lineY)
        lineY = null;
    }
    
    lineX = two.makeLine(0, 0, param.width, 0);
    lineY = two.makeLine(0, 0, 0, param.height);
    lineX.stroke = "red";
    lineY.stroke = "red";
    lineX.visible = state.crosshair;
    lineY.visible = state.crosshair;
}

document.addEventListener("click", onClick);
document.addEventListener("mousemove", onMove);

function onMove(e) {
    updateCrosshair(e);
    updateLabels(e);
}

function updateLabels(e) {
    var newPoint = calibratePoint({x:e.layerX, y:e.layerY});
    labelX.innerHTML = "" + newPoint.x;
    labelY.innerHTML = "" + newPoint.y;
}

function calibratePoint(pt) {
    if (!state.savePoints) {
        return pt;
    }

    var c = state.calibration;

    pt.x = c.xc1 + (pt.x - c.x1)*(c.xc1 - c.xc2)/(c.x1 - c.x2);
    pt.y = c.yc1 + (pt.y - c.y1)*(c.yc1 - c.yc2)/(c.y1 - c.y2);

    pt.x = myRound(pt.x);
    pt.y = myRound(pt.y);

    return pt;
}

function updateCrosshair(e) {
    lineX.translation.y = e.layerY;
    lineY.translation.x = e.layerX;
}

// Todo
function calibrate() {
    var elems = document.getElementsByClassName("text_field");
    var btn = document.getElementById("submit");
    for (elem of elems) {
        if (elem.classList.contains("text_field_disabled")) {
            elem.classList.remove("text_field_disabled");
            btn.disabled = false;
        } else {
            btn.disabled = true;
            elem.classList.add("text_field_disabled");
        }
    }

    state.calibration.ongoing = !state.calibration.ongoing;
}

function submit() {
    var field1 = document.getElementById("first_field").value;
    var field2 = document.getElementById("second_field").value;

    var point1 = getPairFromString(field1);
    if (point1 == NaN) {
        submitOnReturn();
        return;
    }
    var point2 = getPairFromString(field2);
    if (point2 == NaN) {
        submitOnReturn();
        return;
    }

    if (state.calibration.count < 2) {
        window.alert("Click points corresponding to the\n" + 
        "input coordinates");
        submitOnReturn();
        return
    }

    state.calibration.xc1 = point1.x;
    state.calibration.yc1 = point1.y;
    state.calibration.xc2 = point2.x;
    state.calibration.yc2 = point2.y;
    state.calibration.ongoing = false;
    state.calibration.calibrated = true;
    {
        var elems = document.getElementsByClassName("text_field");
        var btn = document.getElementById("submit");
        for (elem of elems) {
            elem.classList.add("text_field_disabled");
        }
        btn.disabled = true;
    }
    state.savePoints = true;
    submitOnReturn();
}

function submitOnReturn() {
    state.calibration.count -= state.calibration.count%2;
}

function getPairFromString(str) {
    var arr = str.split(":");

    var alertMsg = "Wrong input\n" + 
    "Input syntax is [number]:[number]." + 
    "For example, when point is (10;17.14): 10:17.14\n" + 
    "Found " + str + " instead";

    if (arr.length != 2) {
        window.alert(alertMsg);
    }
    var int1 = parseFloat(arr[0]);
    var int2 = parseFloat(arr[1]);

    if (int1 == NaN || int2 == NaN) {
        window.alert(alertMsg);
        return NaN;
    }

    return {x:int1, y:int2};
}

function onClick(e) {
    if (e.layerX != e.x && e.layerY != e.y) {
        sceneClickLogic(e);
    }
}

function sceneClickLogic(e) {
    var sc = state.calibration;
    if (sc.ongoing) {
        if (sc.count%2 == 0) {
            sc.x1 = e.layerX;
            sc.y1 = e.layerY;
            sc.count++;
        } else if (sc.count%2 == 1) {
            sc.x2 = e.layerX;
            sc.y2 = e.layerY;
            sc.count++;
        }
        if (sc.count > 5) {
            sc.count -= 2;
        }

        console.log(sc);
        return;
    }
}

function cbClick(cb) {
    lineX.visible = cb.checked;
    lineY.visible = cb.checked;
}

// two.bind("update", update);
two.play();

function myRound(num) {
    if (num == 0) {
        return num;
    }

    var multip = 1;

    if (num < 0) {
        num *= -1;
        multip = -1;
    }

    while (num >= 10000){
        num =  num /10;
    }
    var cnt = 0;
    while (num < 1000){
        cnt = cnt + 1;
        num = num * 10;
    }
    num = Math.round(num);
    num = num / (10**cnt);

    num *= multip;
    return num;
}