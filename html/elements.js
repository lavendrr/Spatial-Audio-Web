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
    // Create 3rd order ambisonic encoder and decoder, volume and distance gain nodes, and route signal flow
    this.audioContext = audioContext;
    this.audioSource = audioSource;
    this.audioElement = audioContext.createMediaElementSource(this.audioSource);
    this.distanceNode = new GainNode(this.audioContext);
    this.volumeNode = new GainNode(this.audioContext);
    this.volumeNode.gain.value = 0;
    this.encoder = new ambisonics.monoEncoder(this.audioContext, 3);
    this.decoder = new ambisonics.binDecoder(this.audioContext, 3);

    this.audioElement.connect(this.distanceNode);
    this.distanceNode.connect(this.encoder.in);
    this.encoder.out.connect(this.decoder.in);
    this.decoder.out.connect(this.volumeNode);
    this.volumeNode.connect(audioContext.destination);
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
    var degrees = radians * (180 / Math.PI);
    degrees += 90;
    if (degrees > 180) {
      degrees = -360 + degrees;
    }

    this.encoder.azim = degrees * -1;
    this.encoder.updateGains();
  }

  UpdateElev(elevation) {
    this.encoder.elev = elevation;
    this.encoder.updateGains();
  }

  UpdateDistance(distance) {
    // Use inverse square law to simulate distance
    this.distanceNode.gain.value = parseFloat(1 / ((distance) ** 2));
  }

  UpdateVolume(volume) {
    // Normal volume adjustment, should accept a range of 0.25 - 2 or so?
    this.volumeNode.gain.value = parseFloat(volume);
  }

  Play() {
    if (this.audioContext.state === "suspended") {
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
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `

      <link rel="stylesheet" href="styles.css" />
      <div class="AmbiSource">
        <audio crossorigin="anonymous" id="audioelement" src="" loop>
        </audio>
  
        <table>
          <tr>
            <td colspan=2>
              <select name="sourceselect" id="sourceselect">
                <option value="">Select a sound</option>
                <option value="https://cdn.freesound.org/previews/733/733515_13286139-lq.mp3">Waves</option>
                <option value="https://cdn.freesound.org/previews/733/733514_13286139-lq.mp3">Singing Bowl</option>
                <option value="https://cdn.freesound.org/previews/733/733513_13286139-lq.mp3">Rain (Thunder)</option>
                <option value="https://cdn.freesound.org/previews/733/733512_13286139-lq.mp3">Rain (No Thunder)</option>
                <option value="https://cdn.freesound.org/previews/733/733511_13286139-lq.mp3">Creek Flowing</option>
                <option value="https://cdn.freesound.org/previews/733/733510_13286139-lq.mp3">Chimes (Low)</option>
                <option value="https://cdn.freesound.org/previews/733/733509_13286139-lq.mp3">Chimes (High)</option>
                <option value="https://cdn.freesound.org/previews/733/733508_13286139-lq.mp3">Campfire Crackle</option>
                <option value="https://cdn.freesound.org/previews/733/733516_13286139-lq.mp3">Breeze</option>
                <option value="https://cdn.freesound.org/previews/733/733507_13286139-lq.mp3">Birds Chirping</option>
                <option value="https://cdn.freesound.org/previews/730/730753_1648170-lq.mp3">Birds & Breeze</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <label>
                Elevation
              </label>
            </td>
            <td>
              <label>
                Volume
              </label>
            </td>
          </tr>
          <tr>
            <td>
              <input type="range" min="-90" max="90" value="0" class="slider" id="elevslider" name="elevslider">
            </td>
            <td>
              <input type="range" min="0" max="2" value="0" step="0.05" class="slider" id="volumeslider" name="volumeslider">
            </td>
          </tr>
        </table>
      
      </div>
      `;
  };

  connectedCallback() {
    const audioElement = this.shadowRoot.querySelector("#audioelement");

    const ambiSource = new AmbiSource(audioElement, audioContext);

    const div = this.shadowRoot.querySelector(".AmbiSource");

    // Event listeners for sliders and source selector

    this.shadowRoot.querySelector("#elevslider").oninput = function () {
      ambiSource.UpdateElev(this.value, 0);
    }

    this.shadowRoot.querySelector("#volumeslider").oninput = function () {
      ambiSource.UpdateVolume(this.value);
    }

    this.shadowRoot.querySelector("#sourceselect").addEventListener("change", function () {
      audioElement.setAttribute("src", this.value);
      ambiSource.Play();
    });

    // Binaural Filter Assignment (Note: check elevation orientation for different IRs)
    var HOA3soundBuffer;
    var order = 3;
    var filterurl = "IRs/irsOrd3.wav"; // IEM Ambisonics Impulse Response
    // var filterurl = "IRs/HOA3_IRC_1008_virtual.wav"; // JSAmbisonics Impulse Response
    var callbackOnLoad = function (mergedBuffer) {
      HOA3soundBuffer = mergedBuffer;
      ambiSource.decoder.updateFilters(HOA3soundBuffer);
    }
    var HOA3loader = new ambisonics.HOAloader(audioContext, order, filterurl, callbackOnLoad);
    HOA3loader.load();

    // Radar UI

    const canvas = document.createElement("canvas");
    div.appendChild(canvas);
    canvas.classList.add("radar");
    canvas.width = 210;
    canvas.height = 210;
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
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the gridlines
      ctx.beginPath(); // Vertical
      ctx.moveTo(centerX, centerY + radius);
      ctx.lineTo(centerX, centerY - radius);
      ctx.stroke();
      ctx.beginPath(); // Horizontal
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();
      // Draw the outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      // Draw concentric circles
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius / 4, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 4) * 3, 0, 2 * Math.PI);
      ctx.stroke();
      // Draw the draggable point
      ctx.beginPath();
      ctx.arc(pointX, pointY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }

    // Mouse event listeners for dragging
    var isDragging = false;

    function startDragging(event) {
      event.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var mouseX = event.clientX - rect.left;
      var mouseY = event.clientY - rect.top;

      var dx = mouseX - pointX;
      var dy = mouseY - pointY;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        isDragging = true;
      } else {
        // Jump to mouse position if clicked inside the circle
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          pointX = mouseX;
          pointY = mouseY;
          drawPoint();
          isDragging = true;
        }
      }
    };

    function drag(event) {
      event.preventDefault();
      if (isDragging) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = event.clientX - rect.left;
        var mouseY = event.clientY - rect.top;

        // Check if mouse is inside or outside the circle
        var dx = mouseX - centerX;
        var dy = mouseY - centerY;
        var distance = Math.sqrt(dx * dx + dy * dy);
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
        ambiSource.UpdateDistance(distance / 100 + 1); // Converts [0, 100] to [1, 2]

        drawPoint();
      }
    };

    function stopDragging(event) {
      event.preventDefault();
      isDragging = false;
    };

    canvas.addEventListener("mousedown", startDragging);
    canvas.addEventListener("mousemove", drag);
    canvas.addEventListener("mouseup", stopDragging);

    canvas.addEventListener("touchstart", startDragging);
    canvas.addEventListener("touchmove", drag);
    canvas.addEventListener("touchend", stopDragging);
  }
};

customElements.define('ambi-element', AmbiElement);
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());
document.body.appendChild(new AmbiElement());