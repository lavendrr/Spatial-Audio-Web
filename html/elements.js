let customElementRegistry = window.customElements;
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

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

class AmbiElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode : "open"});
      this.shadowRoot.innerHTML = `

      <link rel="stylesheet" href="styles.css" />
      <div class="AmbiSource">
        <!-- UI Elements for Source 1 -->

        <audio crossorigin="anonymous" id="source1" src="" loop>
        </audio>

        <select name="test" id="test">
          <option value="https://cdn.freesound.org/previews/730/730814_5674468-lq.mp3">speech</option>
          <option value="https://cdn.freesound.org/previews/730/730753_1648170-lq.mp3">music</option>
        </select>
  
        <span class="slidecontainer">
          <button id="playButton1">Play Source 1</button> 
          <button id="pauseButton1">Pause Source 1</button>
          <p>
            <input type="range" min="-180" max="180" value="0" class="slider" id="azimslider1" name="azimuth1">
            <label for="azimuth1">Azimuth (-180 to 180 degrees)</label>
  
          <br>
            <input type="range" min="-90" max="90" value="0" class="slider" id="elevslider1" name="elevation1">
            <label for="elevation1">Elevation (-90 to 90 degrees)</label>
  
          <br>
            <input type="range" min="25" max="125" value="25" class="slider" id="distanceslider1" name="distance1">
            <label for="distance1">Distance (1 to 5 meters)</label>
          </p>
  
        </span>
      
      </div>
      `;
    };

    connectedCallback() {
      // const script = document.createElement("script");
      // script.src = "canvas.js";
      // this.appendChild(script);

      const audioElement = this.shadowRoot.querySelector("#source1");
      // audioElement.setAttribute("src", "https://cdn.freesound.org/previews/730/730814_5674468-lq.mp3");
      const ambiSource = new AmbiSource(audioElement, audioContext);

      const div = this.shadowRoot.querySelector(".AmbiSource");

      const select = this.shadowRoot.querySelector("#test");

      select.addEventListener("change", function() {
        audioElement.setAttribute("src", this.value);
        console.log(this.value);
      });

      const span = document.createElement("span");
      div.appendChild(span);
      span.classList.add("radar");

      const canvas = document.createElement("canvas");
      canvas.width = 210;
      canvas.height = 210;
      span.appendChild(canvas);
      var ctx = canvas.getContext("2d");

      // Circle parameters
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = 100;

      // Initial point position
      var pointX = centerX;
      var pointY = centerY;

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
          ambiSource.Play();
          var rect = canvas.getBoundingClientRect();
          var mouseX = event.clientX - rect.left;
          var mouseY = event.clientY - rect.top;

          var dx = mouseX - pointX;
          var dy = mouseY - pointY;
          if (Math.sqrt(dx*dx + dy*dy) < 10) {
              isDragging = true;
          } else {
            // Jump to mouse position if clicked inside the circle
            var distance = Math.sqrt(dx*dx + dy*dy);
            if (distance <= radius) {
                pointX = mouseX;
                pointY = mouseY;
                drawPoint();
                isDragging = true;
            }
          }
      });

      canvas.addEventListener("mousemove", function(event) {
          if (isDragging) {
              var rect = canvas.getBoundingClientRect();
              var mouseX = event.clientX - rect.left;
              var mouseY = event.clientY - rect.top;

              // Check if mouse is inside or outside the circle
              var dx = mouseX - centerX;
              var dy = mouseY - centerY;
              var distance = Math.sqrt(dx*dx + dy*dy);
              var angle = Math.atan2(dy, dx);

              if (distance <= radius) {
                  // Mouse is inside the circle, allow free movement
                  pointX = mouseX;
                  pointY = mouseY;
              } else {
                  // Mouse is outside the circle, constrain to circumference
                  pointX = centerX + radius * Math.cos(angle);
                  pointY = centerY + radius * Math.sin(angle);
                  distance = 100;
              }

              ambiSource.UpdateAzim2(angle);
              ambiSource.UpdateDistance(distance + 25);

              drawPoint();
          }
      });

      canvas.addEventListener("mouseup", function(event) {
          isDragging = false;
      });

    }
  };
  
  customElements.define('ambi-element', AmbiElement);
  document.body.appendChild(new AmbiElement());
  document.body.appendChild(new AmbiElement());