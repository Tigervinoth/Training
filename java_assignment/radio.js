/**
 * Radio Player with Audio Visualization and Swiper
 * Features:
 * - HLS streaming audio playback
 * - Audio visualization with canvas
 * - Touch/mouse swipeable radio station selector
 * - AES decryption for secure URLs
 */
window.onload = function() {
    // ---------------------------
    // DOM Elements
    // ---------------------------
    // Audio Player elements
    const audio = document.getElementById('audioPlayer');
    const customControls = document.querySelector('.custom-audio-controls');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    const loadingIcon = document.querySelector('.loading-icon');
    const canvas = document.getElementById('audioVisualizer');
    const canvasCtx = canvas.getContext('2d');

    // Swiper elements
    const swiperContainer = document.querySelector('.swiper-container');
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    const slides = document.querySelectorAll('.swiper-slide');
    
    // ---------------------------
    // State Variables
    // ---------------------------
    // Audio state
    let hls;
    let audioContext;
    let analyser;
    let sourceNode;
    let dataArray = new Uint8Array(0); // Initialize with empty array to prevent null reference
    let bufferLength = 0;
    let visualizerFade = 1.0; // 1.0 = full opacity, 0.0 = fully transparent
    let lastAudioState = false; // Track previous audio state (playing or paused)
    
    // Swiper state
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let currentIndex = 0; // Current active slide index (0 to slides.length-1)

    // ---------------------------
    // Application Initialization
    // ---------------------------
    
    // Initial audio load
    loadAudioFromSlide(currentIndex);
    
    // Initialize player UI state
    updatePlayerUI('pause');
    
    // Initialize HLS player based on browser support
    if (!Hls.isSupported() && !audio.canPlayType('application/vnd.apple.mpegurl')) {
        console.error("This browser does not support HLS.");
        canvas.style.display = 'none';
        customControls.innerHTML = "Browser not supported";
        customControls.style.fontSize = "14px";
        customControls.style.width = "auto";
        customControls.style.borderRadius = "5px";
        customControls.style.padding = "5px 10px";
    }
    
    // ---------------------------
    // Event Listeners
    // ---------------------------
    
    // Play/pause toggle on controls click
    customControls.addEventListener('click', function() {
        if (audio.paused || audio.ended) {
            playAudio();
        } else {
            audio.pause();
        }
    });
    
    // Audio event listeners
    audio.addEventListener('playing', () => {
        updatePlayerUI('play');
        visualizerFade = 0.3; // Start at partial visibility and fade in
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    });
    
    audio.addEventListener('pause', () => {
        updatePlayerUI('pause');
        // visualizerFade will gradually decrease in the drawVisualizer function
    });
    audio.addEventListener('waiting', () => updatePlayerUI('loading'));
    audio.addEventListener('stalled', () => updatePlayerUI('loading'));
    
    audio.addEventListener('canplay', () => {
        if (!audio.paused && !audio.ended) {
            updatePlayerUI('play');
        } else if (!loadingIcon.classList.contains('hidden')) {
            updatePlayerUI('pause');
        }
    });
    
    // Swiper event listeners
    
    // Prevent context menu on swiper (disables right-click)
    swiperContainer.addEventListener('contextmenu', e => e.preventDefault());
    
    // Mouse event listeners
    swiperContainer.addEventListener('mousedown', dragStart);
    swiperContainer.addEventListener('mouseup', dragEnd);
    swiperContainer.addEventListener('mousemove', drag);
    swiperContainer.addEventListener('mouseleave', dragEnd);
    
    // Touch event listeners
    swiperContainer.addEventListener('touchstart', dragStart);
    swiperContainer.addEventListener('touchend', dragEnd);
    swiperContainer.addEventListener('touchmove', drag);
    
    // Handle window resize to maintain correct slider positioning
    window.addEventListener('resize', () => {
        // Use debounce/throttle here if resize events cause performance issues
        setPositionByIndex(currentIndex);
    });
    
    // Initialize slider position
    setPositionByIndex(currentIndex);

    // ---------------------------
    // Function Definitions
    // ---------------------------
    
    /**
     * Decrypts an encrypted URL using AES-CBC
     * @param {string} encryptedUrl - Base64 encoded encrypted URL
     * @returns {string} Decrypted URL
     */
    function decrypt(encryptedUrl) {
        if (!encryptedUrl) return '';
        
        try {
            const key = CryptoJS.enc.Utf8.parse("keys_for_encryption_in_projectx".padEnd(32, ' '));
            
            // Decode base64 to raw bytes
            const rawData = CryptoJS.enc.Base64.parse(encryptedUrl);
            
            // Extract IV (first 16 bytes) and ciphertext
            const ivHex = rawData.toString(CryptoJS.enc.Hex).substring(0, 32);
            const cipherHex = rawData.toString(CryptoJS.enc.Hex).substring(32);
        
            const iv = CryptoJS.enc.Hex.parse(ivHex);
            const encrypted = CryptoJS.enc.Hex.parse(cipherHex);
            
            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: encrypted },
                key,
                { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );
            
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error("Decryption failed:", error);
            return '';
        }
    }

    /**
     * Loads audio from the selected slide
     * @param {number} index - Slide index to load audio from
     */
    function loadAudioFromSlide(index) {
        const slide = slides[index];
        if (!slide) return;
        
        const encryptedUrl = slide.getAttribute('data-url');
        const url = decrypt(encryptedUrl);
        
        if (!url) {
            console.error("Failed to get valid URL for slide", index);
            return;
        }
        
        // Clean up existing HLS instance if present
        if (hls) {
            hls.destroy();
        }
        
        // Initialize audio context if not already created
        if (!audioContext) {
            initAudioAnalyzer();
        }
        
        // Load audio based on browser support
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(audio);
            
            // Add error handling for HLS
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    console.error('Fatal HLS error:', data);
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // Try to recover network error
                            console.log('Attempting to recover from network error...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            // Try to recover media error
                            console.log('Attempting to recover from media error...');
                            hls.recoverMediaError();
                            break;
                        default:
                            // Cannot recover
                            hls.destroy();
                            updatePlayerUI('pause');
                            break;
                    }
                } else {
                    // Non-fatal error, just log it
                    console.warn('Non-fatal HLS error:', data);
                }
            });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            audio.src = url;
        }
    }
    
    /**
     * Initializes the Web Audio API analyzer for visualization
     */
    function initAudioAnalyzer() {
        try {
            // Create audio context and analyzer
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            sourceNode = audioContext.createMediaElementSource(audio);

            // Connect audio nodes
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);

            // Configure analyzer settings
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            // Start visualization
            drawVisualizer();
        } catch (error) {
            console.error("Web Audio API is not supported or failed to initialize:", error);
            canvas.style.display = 'none'; // Hide canvas if not supported
        }
    }

    /**
     * Renders audio visualization on canvas based on frequency data
     * Uses requestAnimationFrame for smooth animation
     */
    function drawVisualizer() {
        // Set canvas dimensions to match display size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Schedule next frame
        requestAnimationFrame(drawVisualizer);
        
        // Check current audio state
        const isAudioPlaying = !audio.paused && audioContext && audioContext.state === 'running';
        
        // Adjust fade factor based on audio state
        if (isAudioPlaying) {
            // Audio is playing, increase visualizer visibility (fade in)
            visualizerFade = Math.min(1.0, visualizerFade + 0.05);
            lastAudioState = true;
        } else {
            // Audio is paused, reduce visualizer visibility (fade out)
            visualizerFade = Math.max(0.0, visualizerFade - 0.05);
            
            // If we've fully faded out, clear the canvas and return
            if (visualizerFade <= 0) {
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                lastAudioState = false;
                return;
            }
        }
        
        // If audio is paused but we're still fading out, or if audio is playing,
        // proceed with visualization
        
        // Get frequency data (only if audio is playing)
        if (isAudioPlaying) {
            analyser.getByteFrequencyData(dataArray);
        } else if (!lastAudioState && dataArray) {
            // If audio wasn't playing last frame and still isn't, gradually reduce dataArray values
            // Only attempt this if dataArray has been initialized
            for (let i = 0; i < bufferLength; i++) {
                dataArray[i] = Math.max(0, dataArray[i] - 5);
            }
        }
        
        // Clear previous frame
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Define visualization parameters
        const barWidth = (canvas.width / bufferLength) * 2.5;
        const barSpacing = 1;
        let x = 0;
        
        // Define colors for gradient
        const lightGrayColor = 'rgb(211, 211, 211)'; // Bottom color
        const darkGrayColor = 'rgb(169, 169, 169)';  // Top color

        // Draw frequency bars
        for (let i = 0; i < bufferLength; i++) {
            // Calculate bar height based on frequency data, apply fade factor
            const barHeight = (dataArray[i] / 255) * canvas.height * visualizerFade;
            
            if (barHeight > 0) {  // Only draw bars with data
                // Create gradient for bar
                const gradient = canvasCtx.createLinearGradient(
                    x, canvas.height - barHeight, 
                    x, canvas.height
                );
                
                // Add gradient color stops with opacity based on fade factor
                const fadeOpacity = Math.max(0.1, visualizerFade); // Minimum opacity to ensure visibility during fade
                
                // Apply fade effect to colors
                const topColor = `rgba(169, 169, 169, ${fadeOpacity})`;
                const bottomColor = `rgba(211, 211, 211, ${fadeOpacity})`;
                
                gradient.addColorStop(0, topColor);     // Top of bar
                gradient.addColorStop(1, bottomColor);  // Bottom of bar
                
                // Draw bar
                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            }
            
            // Move to next bar position
            x += barWidth + barSpacing;
        }
    }
    
    /**
     * Updates UI controls to show the specified state
     * @param {string} state - 'play', 'pause', or 'loading'
     */
    function updatePlayerUI(state) {
        // Hide all icons first
        playIcon.classList.add('hidden');
        pauseIcon.classList.add('hidden');
        loadingIcon.classList.add('hidden');
        
        // Show appropriate icon based on state
        switch(state) {
            case 'play':
                pauseIcon.classList.remove('hidden');
                break;
            case 'pause':
                playIcon.classList.remove('hidden');
                break;
            case 'loading':
                loadingIcon.classList.remove('hidden');
                break;
        }
    }
    
    /**
     * Attempts to play audio and handles errors/state changes
     */
    function playAudio() {
        updatePlayerUI('loading');
        
        // Resume audio context if suspended
        const resumeContextPromise = (audioContext && audioContext.state === 'suspended')
            ? audioContext.resume().catch(error => console.error("Failed to resume AudioContext:", error))
            : Promise.resolve();
            
        // Try to play after resuming context
        resumeContextPromise.then(() => {
            return audio.play().catch(error => {
                console.warn("Playback prevented or failed:", error);
                updatePlayerUI('pause');
                throw error; // Re-throw to show we handled it
            });
        });
    }
    
    /**
     * Gets X position from mouse or touch event
     * @param {Event} event - Mouse or touch event
     * @returns {number} X position
     */
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    }
    
    /**
     * Handles the start of a drag/swipe interaction
     * @param {Event} event - Mouse or touch event
     */
    function dragStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        swiperWrapper.style.transition = 'none';
        animationID = requestAnimationFrame(animation);
        swiperContainer.style.cursor = 'grabbing';
    }
    
    /**
     * Handles drag/swipe movement
     * @param {Event} event - Mouse or touch event
     */
    function drag(event) {
        if (!isDragging) return;
        
        // Prevent default behavior for touch events to avoid page scrolling
        if (event.type.includes('touch')) {
            event.preventDefault();
        }
        
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
        setSliderPosition();
    }
    
    /**
     * Handles the end of a drag/swipe interaction
     */
    function dragEnd() {
        if (!isDragging) return;
        
        cancelAnimationFrame(animationID);
        isDragging = false;
        swiperContainer.style.cursor = 'grab';
        
        // Determine if swipe should change slide
        const movedBy = currentTranslate - prevTranslate;
        const threshold = swiperContainer.offsetWidth / 4; // 25% threshold
        let newIndex = currentIndex;
        
        // Calculate new index based on swipe direction and distance
        if (movedBy < -threshold && currentIndex < slides.length - 1) {
            // Swiped left - go to next slide if not at the end
            newIndex = currentIndex + 1;
        } else if (movedBy > threshold && currentIndex > 0) {
            // Swiped right - go to previous slide if not at the beginning
            newIndex = currentIndex - 1;
        }
        
        // Animate transition to new slide
        swiperWrapper.style.transition = 'transform 0.3s ease-out';
        setPositionByIndex(newIndex);
    }
    
    /**
     * Animation frame handler for smooth dragging
     */
    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }
    
    /**
     * Sets slider position within bounds
     */
    function setSliderPosition() {
        // Calculate bounds
        const maxTranslate = 0; // Leftmost position (first slide)
        const minTranslate = -(slides.length - 1) * swiperContainer.offsetWidth; // Rightmost position (last slide)
        
        // Constrain position within bounds
        currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, currentTranslate));
        
        // Apply transform
        swiperWrapper.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    /**
     * Sets slider position to show the slide at the specified index
     * @param {number} newIdx - Index of slide to show
     */
    function setPositionByIndex(newIdx = currentIndex) {
        // Calculate position based on slide index
        currentTranslate = newIdx * -swiperContainer.offsetWidth;
        prevTranslate = currentTranslate;
        setSliderPosition();
        
        // If index changed, load new audio and reset player UI
        if (newIdx !== currentIndex) {
            currentIndex = newIdx;
            loadAudioFromSlide(currentIndex);
            updatePlayerUI('pause');
        }
    }
};