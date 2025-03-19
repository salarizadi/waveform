/**
 *  Copyright (c) 2025
 *  @Version : 2.1.0
 *  @Author  : https://salarizadi.ir
 *  @Repository : https://github.com/salarizadi/waveform
 *  @Description: A sleek and interactive audio visualization plugin that creates a customizable waveform player with touch support and real-time updates.
 */

(function ($) {
    "use strict";

    const VERSION = "2.1.0";

    const WaveformPlayer = function (element, options) {
        this.settings = $.extend({}, WaveformPlayer.defaults, options);
        this.element  = $(element);
        this.audioElement = $(this.settings.audioElement)[0];
        this.audioContext = this.settings.audioContext;
        this.isDragging   = false;
        this.tempProgress = 0;
        this.segments = [];
        this.waveformData = null;

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
        onProgressChange: null,
        onSeek: null,
        samplingQuality: "medium", // 'low', 'medium', 'high'
        loadingText: "Loading waveform..." // OR null
    };

    WaveformPlayer.prototype = {
        
        init: function () {
            if (!this.audioContext) {
                console.error("AudioContext is required");
                return;
            }

            this.createContainer();
            this.bindEvents();
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

            this.waveform = $("<div>").addClass("waveform").css({
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                boxSizing: "border-box"
            });

            this.element.append(this.waveform);
        },

        getSamplingRate (totalSamples, quality) {
            const samplesPerSegment = Math.floor(
                totalSamples / this.settings.segments
            );

            switch (quality) {
                case "low":
                    return Math.max(1, Math.floor(samplesPerSegment / 5)); // 5 samples per segment
                case "medium":
                    return Math.max(1, Math.floor(samplesPerSegment / 10)); // 10 samples per segment
                case "high":
                    return Math.max(1, Math.floor(samplesPerSegment / 20)); // 20 samples per segment
                default:
                    return Math.max(1, Math.floor(samplesPerSegment / 10));
            }
        },

        async loadAudioData (arrayBuffer) {
            try {
                // Add loading indicator
                const loadingIndicator = $("<div>")
                    .css({
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#666",
                        fontSize: "12px"
                    })
                    .text(this.settings.loadingText);
                this.element.append(loadingIndicator);

                const audioBuffer = await this.audioContext.decodeAudioData(
                    arrayBuffer
                );
                const channelData = audioBuffer.getChannelData(0);
                const waveformData = [];

                const samplesPerSegment = Math.floor(
                    channelData.length / this.settings.segments
                );
                const sampleStep = this.getSamplingRate(
                    channelData.length,
                    this.settings.samplingQuality
                );

                // Process in chunks for better performance
                const chunkSize = 1000; // Process 1000 segments at a time
                for (let i = 0; i < this.settings.segments; i += chunkSize) {
                    await new Promise((resolve) => setTimeout(resolve, 0)); // Let UI breathe

                    const end = Math.min(i + chunkSize, this.settings.segments);
                    for (let j = i; j < end; j++) {
                        const startSample = j * samplesPerSegment;
                        const endSample = Math.min(
                            startSample + samplesPerSegment,
                            channelData.length
                        );

                        let sum = 0;
                        let sampleCount = 0;

                        for (let k = startSample; k < endSample; k += sampleStep) {
                            sum += Math.abs(channelData[k]);
                            sampleCount++;
                        }

                        const average = sum / sampleCount;
                        waveformData.push(average);
                    }

                    // Update loading progress
                    const progress = Math.round((end / this.settings.segments) * 100);
                    loadingIndicator.text(`${this.settings.loadingText} ${progress}%`);
                }

                // Fast normalization
                const maxPeak = Math.max(...waveformData);
                const scale = 80 / maxPeak;

                this.waveformData = waveformData.map((peak) => 10 + peak * scale);

                // Remove loading indicator
                loadingIndicator.remove();

                this.generateSegments();
            } catch (error) {
                console.error("Error decoding audio data:", error);
            }
        },

        generateSegments: function () {
            if (!this.waveformData) return;

            this.waveform.empty();
            this.segments = [];

            this.waveformData.forEach((height) => {
                const segment = $("<div>").css({
                    flex: "1",
                    margin: `0 ${this.settings.segmentGap}px`,
                    height: height + "%",
                    position: "relative",
                    borderRadius: "1px",
                    overflow: "hidden"
                });

                const background = $("<div>").css({
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    background: this.settings.inactiveColor
                });
                background.addClass('segment');

                const progress = $("<div>").css({
                    position: "absolute",
                    top: "0",
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: this.settings.activeColor,
                    transform: "translateX(-100%)"
                });
                progress.addClass('fill');

                segment.append(background, progress);
                this.segments.push(segment);
                this.waveform.append(segment);
            });
        },

        updateProgress: function (progress) {
            if (!this.segments.length) return;

            const totalProgress = progress * this.segments.length;
            const fullSegments = Math.floor(totalProgress);
            const partialProgress = (totalProgress - fullSegments) * 100;

            this.segments.forEach((segment, index) => {
                const progressDiv = segment.children().last();
                if (index < fullSegments) {
                    progressDiv.css("transform", "translateX(100%)");
                } else if (index === fullSegments) {
                    progressDiv.css("transform", `translateX(${partialProgress}%)`);
                } else {
                    progressDiv.css("transform", "translateX(-100%)");
                }
            });
        },

        bindEvents: function () {
            // Handle file loading
            $(this.audioElement).on("loadeddata", () => {
                if (this.audioElement.src && !this.waveformData) {
                    fetch(this.audioElement.src)
                        .then((response) => response.arrayBuffer())
                        .then((arrayBuffer) => this.loadAudioData(arrayBuffer));
                }
            });

            // Handle progress updates
            $(this.audioElement).on("timeupdate", () => {
                if (!this.isDragging && this.audioElement.duration) {
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
            this.isDragging = true;
            const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
            this.updateVisualProgress(x);
        },

        handleMove: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!this.isDragging) return;
            const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
            this.updateVisualProgress(x);
        },

        handleEnd: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.isDragging) {
                this.isDragging = false;
                if (this.settings.onSeek) {
                    this.settings.onSeek(this.tempProgress);
                }
            }
        },

        updateVisualProgress: function (x) {
            const rect = this.element[0].getBoundingClientRect();
            this.tempProgress = Math.max(
                0,
                Math.min(1, (x - rect.left) / rect.width)
            );
            this.updateProgress(this.tempProgress);

            if (this.settings.onProgressChange) {
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
                    samplingQuality: this.settings.samplingQuality
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

                // Update sampling quality if it exists in the exported data
                if (exportedData.settings && exportedData.settings.samplingQuality) {
                    this.settings.samplingQuality = exportedData.settings.samplingQuality;
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
