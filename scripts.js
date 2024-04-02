// Access the Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

var slider = document.getElementById("slider1");

class AmbiSource {
  audio;
  encoder;
  decoder;

  constructor(audio, audioContext) {
    // Create ambisonic encoder and decoder, and route signal flow
    this.audio = audio;
    this.encoder = new ambisonics.monoEncoder(audioContext, 2);
    this.decoder = new ambisonics.binDecoder(audioContext, 2);

    this.audio.connect(this.encoder.in);
    this.encoder.out.connect(this.decoder.in);
    this.decoder.out.connect(audioContext.destination);
  }

  UpdatePos(azimuth, elevation) {
    this.encoder.azim = azimuth;
    this.encoder.elev = elevation;
    this.encoder.updateGains();
  }
}

function classTest() {
  const osc = audioContext.createOscillator();
  const testInst = new AmbiSource(osc, audioContext);
  osc.start();
  slider.oninput = function() {
    testInst.UpdatePos(this.value, 0);
  }
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

// Event listener for the play button
document.getElementById('playButton').addEventListener('click', function() {
    classTest();
});