/**
 *  Copyright (c) 2025
 *  @Version : 1.0.0
 *  @Author  : https://salarizadi.ir
 *  @Repository : https://github.com/salarizadi/waveform
 *  @Description: A sleek and interactive audio visualization plugin that creates a customizable waveform player with touch support and real-time updates.
 */

(function ($) {
    'use strict';

    const WaveformPlayer = function (element, options) {
        this.settings = $.extend({}, WaveformPlayer.defaults, options);
        this.element = $(element);
        this.audioElement = $(this.settings.audioElement)[0];
        this.isDragging = false;
        this.tempProgress = 0;
        this.segments = [];

        this.init();
    };

    WaveformPlayer.defaults = {
        audioElement: '#audio-element',    // Audio element selector
        segments: 50,                      // Number of segments
        minHeight: 30,                     // Minimum height percentage
        maxHeight: 70,                     // Maximum height percentage
        segmentGap: 1,                     // Gap between segments in pixels
        activeColor: '#2196F3',            // Color for played segments
        inactiveColor: '#ccc',             // Color for unplayed segments
        onProgressChange: null,            // Callback when progress changes
        onSeek: null                       // Callback when seeking ends
    };

    WaveformPlayer.prototype = {
        init: function () {
            this.createContainer();
            this.generateSegments();
            this.bindEvents();
        },

        createContainer: function () {
            this.element.addClass('waveform-container').css({
                position: 'relative',
                height: '36px',
                background: '#f5f5f5',
                borderRadius: '18px',
                overflow: 'hidden',
                cursor: 'pointer',
                touchAction: 'none'
            });

            this.waveform = $('<div>').addClass('waveform').css({
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                boxSizing: 'border-box'
            });

            this.element.append(this.waveform);
        },

        generateSegments: function () {
            this.waveform.empty();
            this.segments = [];

            for (let i = 0; i < this.settings.segments; i++) {
                const height = this.settings.minHeight +
                    Math.random() * (this.settings.maxHeight - this.settings.minHeight);

                const segment = $('<div>').css({
                    flex: '1',
                    margin: `0 ${this.settings.segmentGap}px`,
                    height: height + '%',
                    position: 'relative',
                    borderRadius: '1px',
                    overflow: 'hidden'
                });

                segment.append(
                    $('<div>').css({
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        background: this.settings.inactiveColor
                    })
                );

                segment.append(
                    $('<div>').css({
                        position: 'absolute',
                        top: '0',
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: this.settings.activeColor,
                        transition: 'transform 0.05s linear'
                    })
                );

                this.segments.push(segment);
                this.waveform.append(segment);
            }
        },

        updateSegments: function (progress) {
            const totalProgress = progress * this.settings.segments;
            const fullSegments = Math.floor(totalProgress);
            const partialProgress = (totalProgress - fullSegments) * 100;

            this.segments.forEach((segment, index) => {
                const progressDiv = segment.children().last();
                if (index < fullSegments) {
                    progressDiv.css('transform', 'translateX(100%)');
                } else if (index === fullSegments) {
                    progressDiv.css('transform', `translateX(${partialProgress}%)`);
                } else {
                    progressDiv.css('transform', 'translateX(-100%)');
                }
            });
        },

        bindEvents: function () {
            this.element.on('mousedown touchstart', (e) => this.handleStart(e));
            this.element.on('mousemove touchmove', (e) => this.handleMove(e));
            this.element.on('mouseup mouseleave touchend', (e) => this.handleEnd(e));

            if (this.audioElement) {
                $(this.audioElement).on('timeupdate', () => {
                    if (!this.isDragging) {
                        const progress = this.audioElement.currentTime / this.audioElement.duration;
                        this.updateSegments(progress);

                        if (this.settings.onProgressChange) {
                            this.settings.onProgressChange(progress);
                        }
                    }
                });
            }
        },

        handleStart: function (e) {
            this.isDragging = true;
            const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            this.updateVisualProgress(x);
        },

        handleMove: function (e) {
            if (!this.isDragging) return;
            e.preventDefault();
            const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            this.updateVisualProgress(x);
        },

        handleEnd: function () {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.settings.onSeek) {
                    this.settings.onSeek(this.tempProgress);
                }
            }
        },

        updateVisualProgress: function (x) {
            const rect = this.element[0].getBoundingClientRect();
            this.tempProgress = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
            this.updateSegments(this.tempProgress);

            if (this.settings.onProgressChange) {
                this.settings.onProgressChange(this.tempProgress);
            }
        }
    };

    $.fn.waveform = function (options) {
        return this.each(function () {
            if (!$.data(this, 'waveform')) {
                $.data(this, 'waveform', new WaveformPlayer(this, options));
            }
        });
    };
})(jQuery);
