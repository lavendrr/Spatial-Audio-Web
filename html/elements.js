let customElementRegistry = window.customElements;

class AmbiElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode : "open"});
      this.shadowRoot.innerHTML = `

      <link rel="stylesheet" href="styles.css" />
      <div class="AmbiSource">
        <!-- UI Elements for Source 1 -->
  
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

      const div = this.shadowRoot.querySelector(".AmbiSource");

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

              source1.UpdateAzim2(angle);
              source1.UpdateDistance(distance + 25);

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