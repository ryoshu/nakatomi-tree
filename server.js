#!/usr/bin/env node

var OPC = new require('./opc'),
    client = new OPC('localhost', 7890),
    five = require("johnny-five"),
    LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('diehard/pixels.txt'),
    count = 0,
    motion, 
    mic, 
    audioLevel,
    state;

const YIPPEE_KI_YAY = 0,
      HO_HO_HO = 1,
      THE_HARD_WAY = 2,
      NUM_PIXELS = 21,
      FPS = 24;

state = YIPPEE_KI_YAY;

five.Board().on("ready", function() {
  console.log("board ready");

  motion = new five.IR.Motion(3);

  mic = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  motion.on("calibrated", function(err, ts) {
    console.log("calibrated", ts);
  });

  motion.on("motionstart", function(err, ts) {
    console.log("motionstart", ts);
    if(audioLevel == 0) {
      state = HO_HO_HO;
    } else {
      state = THE_HARD_WAY;
    }
  });

  motion.on("motionend", function(err, ts) {
    console.log("motionend", ts);
    state = YIPPEE_KI_YAY;
  });

  mic.scale([0, 100]).on("data", function() {
    audioLevel = this.value;
  });
});

lr.on('error', function (err) {
  console.log(err);
});

lr.on('line', function (line) {
  lr.pause();
  colors = line.split(',');
  var r, g, b;
  for(var i = 0; i < colors.length - 1;) {
    for(var j = 0; j < 3; ++i, ++j) {
      r = colors[i];
      g = colors[i % 2];
      b = colors[i % 3];
    }
    
    pixelQueue.push([r, g, b]);
  }
});

lr.on('end', function () {
  lr = new LineByLineReader('diehard/pixels.txt');  
});

function draw() {
  var millis = new Date().getTime();
  switch (state) {
    case YIPPEE_KI_YAY:
      if(pixelQueue.length > 0) {
        var rgb, 
            str = "";
        for(var i = 0; i < NUM_PIXELS;) {
          for(var j = 0; j < 3; i++, j++) {
            rgb = pixelQueue.shift();
            str += rgb[0] + " " + rgb[1] + " " + rgb[2] + ",";
          }
        }

        console.log(pixelQueue.length, " | ", str);
        lr.resume();
      }
    break;
    case HO_HO_HO:
      for (var pixel = 0; pixel < NUM_PIXELS; pixel++) {
        var t = pixel * 0.2 + millis * 0.002;
        var red = 0;
        var green = 128 + 96 * Math.sin(t + 0.3);
        var blue = 0;

        client.setPixel(pixel, red, green, blue);
      }
    break;
    case THE_HARD_WAY:
      for (var pixel = 0; pixel < NUM_PIXELS; pixel++) {
        var t = pixel * 0.2 + millis * 0.002;
        var red = 128 + 96 * Math.sin(t + 0.3);
        var green = 0;
        var blue = 0;

        client.setPixel(pixel, red, green, blue);
      }
    break;
  }
  */
}

//setInterval(draw, 30);
setInterval(draw, 1000 / FPS);