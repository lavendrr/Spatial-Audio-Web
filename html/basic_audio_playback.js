
const audioContext = new AudioContext();

audioContext.onstatechange = () => console.log(audioContext.state); // running


const audioElement = document.querySelector("audio");

const track = audioContext.createMediaElementSource(audioElement);

track.connect(audioContext.destination);

// Event listener for the play button
document.getElementById('playButton').addEventListener('click', function() {

  if (audioContext.state === "suspended")
  {
    audioContext.resume();
  }
  audioElement.play();

});

