#!/usr/bin/env node

// Simple red/blue fade with Node and opc.js

var OPC = new require('./opc')
var client = new OPC('localhost', 7890);
var Pixels = require('./Pixels');
var count = 0;
var five = require("johnny-five");

var motion, mic, audioLevel;

const YIPPEE_KI_YAY = 0;
const HO_HO_HO = 1;
const THE_HARD_WAY = 2;

const NUM_PIXELS = 21;

var state = YIPPEE_KI_YAY;

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

function draw() {
  var millis = new Date().getTime();
  switch (state) {
    case YIPPEE_KI_YAY:
      try {
          for(var i = 0; i < NUM_PIXELS; ++i) {
              var curPixel = i + count;
	      var t = i * 0.2 + millis * 0.002;
	      var r = Pixels.data[curPixel][0];
	      var g = Pixels.data[curPixel][1];
              var b = Pixels.data[curPixel][2];
  	      client.setPixel(i, r, g, b);
  	      //console.log(r + ", " + g + ", " + b);
          }
          client.writePixels();
        
	  if(count + 21 < Pixels.data.length) {
	    count += 21;
	  } else {
	    count = 0;
	  }
      } catch(e) {
          console.log(e);
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
}

setInterval(draw, 30);
