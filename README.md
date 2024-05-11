Tranquil Tonescape Web

Tranquil Tonescape is a customizable 3D soundscape application that runs in the browser and can be accessed from desktop or mobile. 
The project was originally created in Fall '23 using MaxMSP for the audio processing and TouchOSC for the user interface.
The primary goal of this project was to port that application to a more accessible format so that it could achieve its goal of being an accessible tool for anxiety and stress management, not just a sound art piece that only runs on my laptop.
I tested various ideas, such as building it into a mobile app using Unity, but I had a lot of trouble trying to get Max to work as a backend for an application that wasn't just a plugin.
I also tried PureData, but ran into similar issues packaging it into an application that could run on mobile or other formats besides its original IDE or a plugin.
After attempting to get Max or PureData to run via web and failing, I eventually settled on the idea of recreating the whole project from the ground up using HTML for the interface, JavaScript for the backend, & CSS for styling.
Despite my lack of prior advanced experience with these languages, it wasn't too difficult to start getting some results. The whole project is built on the Web Audio API (https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
Additionally, an essential finding was the JSAmbisonics library (https://github.com/polarch/JSAmbisonics). These two components combined to form the audio backend, and I was successfully able to incorporate 3rd order ambisonics encoding into the site.
JSAmbisonics allows the user to import custom impulse responses for the ambisonic encoding and decoding, so I actually was able to track down and use the original IEM impulse responses that I was using in the previous iteration of the project, which can be found here: https://git.iem.at/audioplugins/IEMPluginSuite/-/tree/master/BinauralDecoder/Source/IRs?ref_type=heads
The backend development actually didn't take too long, so it was moreso the HTML and CSS styling that took a lot of time towards the end of the project. I had to create custom elements to recreate the radar from my original project.
The vertical sliders also required some slightly unconventional styling, and I wanted the whole element to be modular, like a class in an OOP language. To do this in HTML, however, I had to create a custom element that I then appended several times to the webpage.
Each sound source module acts as its own self-contained instance, but they all link to the same audio output and thus create the soundscape together.
All in all, this turned out to be much more of a web development project than a strictly audio project, but I'm very happy with how the result shows off my skills and passion for audio (particularly spatial), programming/development, and user interaction.
Additionally, porting the project to an accessible interface makes it much easier to show off on my website and resume, so I think this will help a lot for my portfolio and potential job opportunities.
Thank you for checking out my project, and I plan to continue iterating on the graphic design and features in my free time as I'm able to get more used to working with HTML and CSS!
