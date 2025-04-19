/**
 *  Copyright (c) 2025
 *  @Version : 2.2.0
 *  @Author  : https://salarizadi.ir
 *  @Repository : https://github.com/salarizadi/waveform
 *  @Description: A sleek and interactive audio visualization plugin that creates a customizable waveform player with touch support, real-time updates, and RTL support.
 */

(function ($) {
    "use strict";

    const VERSION = "2.2.0";

    const workerFunction = function () {
        self.onmessage = async function (e) {
            const {channelData, segments, samplingQuality} = e.data;

            const waveformData = [];
            const samplesPerSegment = Math.floor(channelData.length / segments);
            const sampleStep = getSamplingRate(channelData.length, samplingQuality, segments);

            // Process in chunks
            const chunkSize = 1000;
            for (let i = 0; i < segments; i += chunkSize) {
                const end = Math.min(i + chunkSize, segments);
                const chunkData = [];

                for (let j = i; j < end; j++) {
                    const startSample = j * samplesPerSegment;
                    const endSample = Math.min(startSample + samplesPerSegment, channelData.length);

                    let sum = 0;
                    let sampleCount = 0;

                    for (let k = startSample; k < endSample; k += sampleStep) {
                        sum += Math.abs(channelData[k]);
                        sampleCount++;
                    }

                    const average = sum / sampleCount;
                    chunkData.push(average);
                }

                // Send progress updates
                const progress = Math.round((end / segments) * 100);
                self.postMessage({type: 'progress', progress});

                waveformData.push(...chunkData);
            }

            // Fast normalization
            const maxPeak = Math.max(...waveformData);
            const scale = 80 / maxPeak;
            const normalizedData = waveformData.map(peak => 10 + peak * scale);

            self.postMessage({type: 'complete', data: normalizedData});
        };

        function getSamplingRate (totalSamples, quality, segments) {
            const samplesPerSegment = Math.floor(totalSamples / segments);

            switch (quality) {
                case "low":
                    return Math.max(1, Math.floor(samplesPerSegment / 5));
                case "medium":
                    return Math.max(1, Math.floor(samplesPerSegment / 10));
                case "high":
                    return Math.max(1, Math.floor(samplesPerSegment / 20));
                default:
                    return Math.max(1, Math.floor(samplesPerSegment / 10));
            }
        }
    };

    const createInlineWorker = func => {
        const functionString = func.toString();

        const blob = new Blob([`(${functionString})()`], {
            type: 'application/javascript'
        });

        const workerURL = URL.createObjectURL(blob);
        const worker = new Worker(workerURL);

        URL.revokeObjectURL(workerURL);

        return worker;
    };

    const WaveformPlayer = function (element, options) {
        this.settings = $.extend({}, WaveformPlayer.defaults, options);
        this.element  = $(element);
        this.audioElement = $(this.settings.audioElement)[0];
        this.audioContext = this.settings.audioContext;
        this.isDragging   = false;
        this.tempProgress = 0;
        this.segments = [];
        this.waveformData = null;
        this.interactionEnabled = false;

        this.init();
    };

    WaveformPlayer.defaults = {
        audioElement: "#audio-element",
        audioContext: null,
        segments: 100,
        segmentGap: 1,
        activeColor: "#2196F3",
        inactiveColor: "#ccc",
        backgroundColor: "#f5f5f5",
        rtl: false,
        onRendered: null, // Callback when waveform is fully rendered
        onProgressChange: null,
        onSeek: null,
        samplingQuality: "medium", // 'low', 'medium', 'high'
        loadingText: "Loading waveform...", // OR null
    };

    WaveformPlayer.prototype = {

        init: function () {
            if (!this.audioContext) {
                console.error("AudioContext is required");
                return;
            }

            this.createContainer();
            this.bindEvents();
            
            // Initially disable interaction until the audio is ready
            this.disableInteraction();
            
            // Add loading indicator
            this.addLoadingIndicator();
            
            // Enable interaction when the audio metadata is loaded
            $(this.audioElement).one('loadedmetadata', () => {
                if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
                    this.enableInteraction();
                    this.removeLoadingIndicator();
                }
            });
        },
        
        addLoadingIndicator: function() {
            if (this.element.find('.waveform-loading-indicator').length === 0) {
                this.loadingIndicator = $("<div>")
                    .addClass('waveform-loading-indicator')
                    .css({
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.05)",
                        borderRadius: "18px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: "10"
                    });
                
                const loadingText = $("<span>")
                    .html(this.settings.loadingText)
                    .css({
                        fontSize: "10px",
                        color: "#666",
                        opacity: "0.7"
                    });
                
                this.loadingIndicator.append(loadingText);
                this.element.append(this.loadingIndicator);
            }
        },
        
        removeLoadingIndicator: function() {
            if (this.loadingIndicator) {
                this.loadingIndicator.fadeOut(300, function() {
                    $(this).remove();
                });
            }
        },
        
        disableInteraction: function() {
            this.interactionEnabled = false;
            this.element.css('cursor', 'not-allowed');
        },
        
        enableInteraction: function() {
            this.interactionEnabled = true;
            this.element.css('cursor', 'pointer');
        },

        createContainer: function () {
            this.element.addClass("waveform-container").css({
                position: "relative",
                height: "36px",
                background: "#f5f5f5",
                borderRadius: "18px",
                overflow: "hidden",
                cursor: "pointer",
                touchAction: "none",
                flexGrow: 1,
                userSelect: "none",
                msUserSelect: "none",
                mozUserSelect: "none",
                WebkitUserDrag: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "transparent"
            });

            const rtlStyle = this.settings.rtl ? 
                { direction: "rtl", flexDirection: "row-reverse" } : 
                { direction: "ltr", flexDirection: "row" };

            this.waveform = $("<div>").addClass("waveform").css({
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                boxSizing: "border-box",
                ...rtlStyle
            });

            this.element.append(this.waveform);
        },

        async loadAudioData (arrayBuffer) {
            try {
                this.addLoadingIndicator();

                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                const channelData = Array.from(audioBuffer.getChannelData(0));

                const worker = createInlineWorker(workerFunction);

                return new Promise((resolve, reject) => {
                    worker.onmessage = (e) => {
                        const { type, data, progress } = e.data;

                        if (type === 'progress') {
                            const loadingIndicator = this.element.find('.waveform-loading-indicator span');
                            loadingIndicator.html(`${this.settings.loadingText} ${progress}%`);
                        } else if (type === 'complete') {
                            this.waveformData = data;
                            this.removeLoadingIndicator();
                            this.generateSegments();

                            if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
                                this.enableInteraction();
                            }

                            worker.terminate();
                            resolve();
                        }
                    };

                    worker.onerror = (error) => {
                        console.error('Worker error:', error);
                        worker.terminate();
                        reject(error);
                    };

                    worker.postMessage({
                        channelData,
                        segments: this.settings.segments,
                        samplingQuality: this.settings.samplingQuality
                    });
                });

            } catch (error) {
                console.error("Error processing audio data:", error);
                this.handleError();
                throw error;
            }
        },

        generateSegments: function () {
            if (!this.waveformData) return;

            // Clear existing content
            this.waveform.empty();

            // Create document fragment for better performance
            const fragment = document.createDocumentFragment();
            this.segments = [];

            // Create elements in batches
            const batchSize = 50;
            const totalSegments = this.waveformData.length;
            let currentBatch = 0;

            const processNextBatch = () => {
                const start = currentBatch * batchSize;
                const end = Math.min(start + batchSize, totalSegments);

                for (let i = start; i < end; i++) {
                    const height = this.waveformData[this.settings.rtl ? totalSegments - 1 - i : i];

                    const segment = $("<div>").css({
                        flex: "1",
                        margin: `0 ${this.settings.segmentGap}px`,
                        height: height + "%",
                        position: "relative",
                        borderRadius: "1px",
                        overflow: "hidden"
                    })[0];

                    const background = $("<div>").css({
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        background: this.settings.inactiveColor
                    }).addClass('segment')[0];

                    const progress = $("<div>").css({
                        position: "absolute",
                        top: "0",
                        height: "100%",
                        background: this.settings.activeColor,
                        [this.settings.rtl ? 'right' : 'left']: "0",
                        [this.settings.rtl ? 'left' : 'right']: "auto",
                        width: "0%"
                    }).addClass('fill')[0];

                    segment.appendChild(background);
                    segment.appendChild(progress);

                    this.segments.push($(segment));
                    fragment.appendChild(segment);
                }

                if (end < totalSegments) {
                    currentBatch++;
                    // Use requestAnimationFrame for smooth rendering
                    requestAnimationFrame(processNextBatch);
                } else {
                    // Append all segments at once
                    this.waveform[0].appendChild(fragment);

                    if (this.settings.onRendered) {
                        this.settings.onRendered(this);
                    }

                    if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
                        this.enableInteraction();
                        this.removeLoadingIndicator();
                    }
                }
            };

            // Start processing batches
            requestAnimationFrame(processNextBatch);
        },

        updateProgress: function (progress) {
            if (!this.segments.length) return;

            const totalProgress = progress * this.segments.length;
            const fullSegments = Math.floor(totalProgress);
            const partialProgress = (totalProgress - fullSegments) * 100;

            if (this.settings.rtl) {
                // RTL mode: fill from right to left
                for (let i = 0; i < this.segments.length; i++) {
                    const segment = this.segments[i];
                    const progressDiv = segment.children().last();

                    // Since display is reversed, we need inverse logic for filling
                    if (i >= this.segments.length - fullSegments) {
                        // Fill completely
                        progressDiv.css("width", "100%");
                    } else if (i === this.segments.length - fullSegments - 1) {
                        // Partial fill
                        progressDiv.css("width", `${partialProgress}%`);
                    } else {
                        // No fill
                        progressDiv.css("width", "0%");
                    }
                }
            } else {
                // LTR mode: fill from left to right
                this.segments.forEach((segment, index) => {
                    const progressDiv = segment.children().last();

                    if (index < fullSegments) {
                        // Fill completely
                        progressDiv.css("width", "100%");
                    } else if (index === fullSegments) {
                        // Partial fill
                        progressDiv.css("width", `${partialProgress}%`);
                    } else {
                        // No fill
                        progressDiv.css("width", "0%");
                    }
                });
            }
        },

        bindEvents: function () {
            // Handle file loading
            $(this.audioElement).on("loadeddata", () => {
                if (this.audioElement.src && !this.waveformData) {
                    this.disableInteraction();
                    this.addLoadingIndicator();
                    fetch(this.audioElement.src)
                        .then((response) => response.arrayBuffer())
                        .then((arrayBuffer) => this.loadAudioData(arrayBuffer));
                }
            });

            // When src changes or audio element is reset
            $(this.audioElement).on("emptied", () => {
                this.disableInteraction();
                this.addLoadingIndicator();
            });

            // Handle progress updates
            $(this.audioElement).on("timeupdate", () => {
                if (!this.isDragging && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
                    const progress =
                        this.audioElement.currentTime / this.audioElement.duration;
                    this.updateProgress(progress);

                    if (this.settings.onProgressChange) {
                        this.settings.onProgressChange(progress);
                    }
                }
            });

            // Handle user interaction
            this.element
                .on("mousedown touchstart", (e) => this.handleStart(e))
                .on("mousemove touchmove", (e) => this.handleMove(e))
                .on("mouseup mouseleave touchend", (e) => this.handleEnd(e));
        },

        handleStart: function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Skip if interaction is not enabled or audio is not ready
            if (!this.interactionEnabled || !this.audioElement.duration || isNaN(this.audioElement.duration)) {
                return;
            }
            
            this.isDragging = true;
            const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
            this.updateVisualProgress(x);
        },

        handleMove: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!this.isDragging || !this.interactionEnabled) return;
            const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
            this.updateVisualProgress(x);
        },

        handleEnd: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.isDragging && this.interactionEnabled) {
                this.isDragging = false;
                if (this.settings.onSeek && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
                    this.settings.onSeek(this.tempProgress);
                }
            }
        },

        updateVisualProgress: function (x) {
            const rect = this.element[0].getBoundingClientRect();
            let progress;
            
            if (this.settings.rtl) {
                progress = Math.max(
                    0,
                    Math.min(1, 1 - ((x - rect.left) / rect.width))
                );
            } else {
                progress = Math.max(
                    0,
                    Math.min(1, (x - rect.left) / rect.width)
                );
            }
            
            this.tempProgress = progress;
            this.updateProgress(this.tempProgress);

            if (this.settings.onProgressChange && this.audioElement && 
                this.audioElement.duration && !isNaN(this.audioElement.duration)) {
                this.settings.onProgressChange(this.tempProgress);
            }
        },

        export: function () {
            if (!this.waveformData) {
                console.warn("No waveform data available to export");
                return null;
            }

            return {
                version: VERSION,
                data: this.waveformData,
                settings: {
                    samplingQuality: this.settings.samplingQuality,
                    rtl: this.settings.rtl
                }
            };
        },

        restore: function (exportedData) {
            if (!exportedData || !exportedData.data || !Array.isArray(exportedData.data)) {
                console.error("Invalid waveform data format");
                return false;
            }

            try {
                // Store the imported data
                this.waveformData = exportedData.data;

                // Update settings if they exist in the exported data
                if (exportedData.settings) {
                    if (exportedData.settings.samplingQuality) {
                        this.settings.samplingQuality = exportedData.settings.samplingQuality;
                    }
                    
                    if (exportedData.settings.rtl !== undefined) {
                        this.settings.rtl = exportedData.settings.rtl;
                    }
                }

                // Generate the visual segments using current settings
                this.generateSegments();

                return true;
            } catch (error) {
                console.error("Error restoring waveform data:", error);
                return false;
            }
        },

        destroy: function () {
            this.element.off();
            this.waveform.remove();
            this.element.removeData("waveform");
        }

    };

    $.fn.waveform = function (options) {
        return this.each(function () {
            if (!$.data(this, "waveform")) {
                $.data(this, "waveform", new WaveformPlayer(this, options));
            }
        });
    };
})(jQuery);
