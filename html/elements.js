let customElementRegistry = window.customElements;

class AmbiElement extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
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
  
        <span class="radar">
          <canvas id="myCanvas" width="210" height="210"></canvas>
        </span>
      
      </div>
      `;
    }
  };
  
  customElements.define('ambi-element', AmbiElement);
  document.body.appendChild(new AmbiElement());
  document.body.appendChild(new AmbiElement());