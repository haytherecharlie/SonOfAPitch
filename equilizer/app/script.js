(function() {

    // Globals
    let AudioContext;
    let Distortion;
    let Analyser;
    let InputSource;

    // Initialize the Application To Use Media.
    (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
    .call(navigator, { "audio": true }, initializeStream, failedStream);

    /**
     * Initilize the Audio Stream
     * @param {object} stream 
     */
    function initializeStream(stream) {

        // Assign Window.AudioContext to Global: AudioContext.
        AudioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Assign createWaveShaper and Connect to Output.
        Distortion = AudioContext.createWaveShaper().connect(AudioContext.destination);

        // Create Analyser and connect Distortion.
        Analyser = AudioContext.createAnalyser()
        Analyser.connect(Distortion);    
        Analyser.minDecibels = -90; // Minimum Decibel Input Frequency.
        Analyser.maxDecibels = -10; // Maximum Decibel Input Frequency.
        Analyser.smoothingTimeConstant = 0.85; // Smoothing.

        // Assign Input Source and Connect Analyser.   
        InputSource  = AudioContext.createMediaStreamSource(stream).connect(Analyser);

        // Create Oscilloscope
        createEquilizer();

    }

    /**
     * Failed To Initialize Stream
     * @param {object} err 
     */
    function failedStream(err) {

        // Console log the Error
        console.log(`There was an error: ${err}`);

    }


    /**
     * Create the Equilizer
     */
    function createEquilizer() {

        // Initialize Canvas Values
        const canvas = document.querySelector('.oscilloscope'); // Canvas Element
        const canvasCtx = canvas.getContext("2d"); // 2D Canvas
        const WIDTH  = document.body.clientWidth; // Canvas Width
        const HEIGHT = document.body.clientHeight /2; // Canvas Height

        // Set Default Canvas Values
        canvas.setAttribute('width', WIDTH); // Set Width
        canvas.setAttribute('height', HEIGHT); // Set Height
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        
        // Set Data Buffer
        Analyser.fftSize = 256;// Fast Fourier Transform Limit.
        const bufferLength = Analyser.frequencyBinCount; // Buffer Length
        const dataArray = new Uint8Array(bufferLength); // Data Array

        // Draw Function
        const draw = function() {

            // Variables
            const drawVisual = requestAnimationFrame(draw); // Draw Visualizer      
            let barWidth = (WIDTH / bufferLength) * 2.5; // Bar Width
            let barHeight; // Bar Height
            let x = 0; // Counter

            // Add Data Array for Frequency Data.
            Analyser.getByteFrequencyData(dataArray);

            // Set Initial Canvas Values.
            canvasCtx.fillStyle = 'rgb(0, 0, 0)'; // Fill Style
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT); // Fill Rectangle

            // Iterate Buffer Length
            for(let i = 0; i < bufferLength; i++) {

                // Draw Bars
                barHeight = dataArray[i]*3; // Set Bar Height
                canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)'; // Fill Opacity
                canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2); // Fill Rectangle
                x += barWidth + 1; // Increment Count

            }

        };

        // Draw Equilizer
        draw();

    }
    
})();
