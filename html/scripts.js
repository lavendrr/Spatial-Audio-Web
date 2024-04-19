// Access the Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

var azimslider1 = document.getElementById("azimslider1");
var elevslider1 = document.getElementById("elevslider1");
var azimslider2 = document.getElementById("azimslider2");
var elevslider2 = document.getElementById("elevslider2");
var distanceslider1 = document.getElementById("distanceslider1");
var distanceslider2 = document.getElementById("distanceslider2");

class AmbiSource {
  audioContext;
  audioSource;
  audioElement;
  volumeNode;
  encoder;
  decoder;

  constructor(audioSource, audioContext) {
    // Create 2nd order ambisonic encoder and decoder, and route signal flow
    this.audioContext = audioContext;
    this.audioSource = audioSource;
    this.audioElement = audioContext.createMediaElementSource(this.audioSource);
    this.volumeNode = new GainNode(this.audioContext);
    this.encoder = new ambisonics.monoEncoder(this.audioContext, 2);
    this.decoder = new ambisonics.binDecoder(this.audioContext, 2);

    this.audioElement.connect(this.volumeNode);
    this.volumeNode.connect(this.encoder.in);
    this.encoder.out.connect(this.decoder.in);
    this.decoder.out.connect(audioContext.destination);
  }

  UpdatePos(azimuth, elevation) {
    this.encoder.azim = azimuth;
    this.encoder.elev = elevation;
    this.encoder.updateGains();
  }

  UpdateAzim(azimuth) {
    this.encoder.azim = azimuth;
    this.encoder.updateGains();
  }

  UpdateAzim2(radians) {
    var degrees = radians * (180/Math.PI);
    degrees += 90;
    if (degrees > 180)
    {
      degrees = -360 + degrees;
    }

    this.encoder.azim = degrees * -1;
    this.encoder.updateGains();
  }

  UpdateElev(elevation) {
    this.encoder.elev = elevation;
    this.encoder.updateGains();
  }

  UpdateDistance(value) {
    // Use inverse square law to simulate distance
    this.volumeNode.gain.value = parseFloat(1/((value/25)**2));
  }

  Play() {
    if (this.audioContext.state === "suspended")
    {
      this.audioContext.resume();
    }
    this.audioSource.play();
  }

  Pause() {
    this.audioSource.pause();
  }
}

// Must use a # when trying to match via ID
const source1 = new AmbiSource(document.querySelector("#source1"), audioContext);
const source2 = new AmbiSource(document.querySelector("#source2"), audioContext);

function enableSource1() {
  source1.Play();

  azimslider1.oninput = function() {
    source1.UpdateAzim(this.value * -1.0, 0);
  }
  elevslider1.oninput = function() {
    source1.UpdateElev(this.value * -1.0, 0);
  }

  distanceslider1.oninput = function() {
    source1.UpdateDistance(this.value);
  }
}

function pauseSource1() {
  source1.Pause();
}

function enableSource2() {
  source2.Play();

  azimslider2.oninput = function() {
    source2.UpdateAzim(this.value * -1.0, 0);
  }
  elevslider2.oninput = function() {
    source2.UpdateElev(this.value * -1.0, 0);
  }

  distanceslider2.oninput = function() {
    source2.UpdateDistance(this.value);
  }
}

function pauseSource2() {
  source2.Pause();
}

// Function to play a simple tone
function playTone() {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1); // Stop after 1 second
}

function ambiTest() {
  var encoder = new ambisonics.monoEncoder(audioContext, 1);
  encoder.azim = 90;
  encoder.elev = 0;
  encoder.updateGains();
  var binDecoder = new ambisonics.binDecoder(audioContext, 1);
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.connect(encoder.in);
  encoder.out.connect(binDecoder.in);
  binDecoder.out.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 2);
}

function ambiTest2() {
  var encoder = new ambisonics.monoEncoder(audioContext, 1);
  encoder.azim = -135;
  encoder.elev = 0;
  encoder.updateGains();
  var binDecoder = new ambisonics.binDecoder(audioContext, 1);
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.connect(encoder.in);
  encoder.out.connect(binDecoder.in);
  binDecoder.out.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 2);
}

// Event listeners for buttons
document.getElementById('playButton1').addEventListener('click', function() {
    enableSource1();
})

document.getElementById('pauseButton1').addEventListener('click', function() {
  pauseSource1();
})

document.getElementById('playButton2').addEventListener('click', function() {
  enableSource2();
})

document.getElementById('pauseButton2').addEventListener('click', function() {
  pauseSource2();
})

window.onload = function() {
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");

  // Circle parameters
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var radius = 100;

  // Initial point position
  var pointAngle = Math.PI / 4; // Angle in radians
  var pointX = centerX + radius * Math.cos(pointAngle);
  var pointY = centerY + radius * Math.sin(pointAngle);
  
  // Draw the circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw the draggable point
  drawPoint();

  // Function to draw the draggable point
  function drawPoint() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pointX, pointY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
  }

  // Mouse event listeners for dragging
  var isDragging = false;

  canvas.addEventListener("mousedown", function(event) {
      var rect = canvas.getBoundingClientRect();
      var mouseX = event.clientX - rect.left;
      var mouseY = event.clientY - rect.top;

      var dx = mouseX - pointX;
      var dy = mouseY - pointY;
      if (Math.sqrt(dx*dx + dy*dy) < 10) {
          isDragging = true;
      }
  });

  canvas.addEventListener("mousemove", function(event) {
      if (isDragging) {
          var rect = canvas.getBoundingClientRect();
          var mouseX = event.clientX - rect.left;
          var mouseY = event.clientY - rect.top;

          var dx = mouseX - centerX;
          var dy = mouseY - centerY;
          var newAngle = Math.atan2(dy, dx);
          var newRadius = Math.sqrt(dx*dx + dy*dy);

          if (newRadius < radius) {
              pointX = mouseX;
              pointY = mouseY;
              drawPoint();
          }
          
          source1.UpdateAzim2(newAngle);

      }
  });

  canvas.addEventListener("mouseup", function(event) {
      isDragging = false;
  });
};