# jQuery Waveform Player
[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/salarizadi/waveform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/salarizadi/waveform/blob/main/LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/gh/salarizadi/swipetoast/badge)](https://www.jsdelivr.com/package/gh/salarizadi/waveform)
[![jQuery](https://img.shields.io/badge/jquery-%3E%3D%201.7-yellow.svg)](https://jquery.com/)
[![CodePen demo](https://img.shields.io/badge/CodePen-demo-blue.svg)](https://codepen.io/salariz/pen/PwoQpXp)

A sleek and interactive audio visualization plugin that creates a customizable waveform player with touch support and real-time updates. This plugin offers an enhanced audio playback experience with detailed waveform visualization and interactive controls.

## Demo

Check out the [live demo on CodePen](https://codepen.io/salariz/pen/PwoQpXp)

## Features

- 🎵 Real-time waveform visualization
- 🎨 Customizable appearance with dynamic theming
- 📱 Mobile-friendly with touch interaction support
- 🔍 Precise seeking functionality
- ⚡ Performance-optimized for large audio files
- 🎚️ Adjustable sampling quality (low, medium, high)
- 📊 Real-time progress tracking
- 🎯 Comprehensive event callbacks
- 💾 Export and restore waveform data
- 🔄 Chunked processing for improved performance
- 📱 Touch-friendly with multi-device support

## Installation

```html
<script src="https://cdn.jsdelivr.net/gh/salarizadi/waveform/jquery.waveform.min.js"></script>
```

## Basic Usage

```html
<div id="waveform"></div>
<audio id="audio-element"></audio>

<script>
$(document).ready(function() {
    $('#waveform').waveform({
        audioElement: '#audio-element',
        audioContext: new (window.AudioContext || window.webkitAudioContext)(),
        segments: 100,
        activeColor: "#2196F3",
        inactiveColor: "#E3F2FD"
    });
});
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `audioElement` | String | "#audio-element" | Selector for the audio element |
| `audioContext` | AudioContext | null | Web Audio API context (required) |
| `segments` | Number | 100 | Number of waveform segments |
| `segmentGap` | Number | 1 | Gap between segments in pixels |
| `activeColor` | String | "#2196F3" | Color of the played portion |
| `inactiveColor` | String | "#ccc" | Color of the unplayed portion |
| `backgroundColor` | String | "#f5f5f5" | Background color of the container |
| `samplingQuality` | String | "medium" | Quality of waveform sampling ("low", "medium", "high") |
| `loadingText` | String | "Loading waveform..." | Text shown while generating waveform (or null) |
| `onProgressChange` | Function | null | Callback for progress changes |
| `onSeek` | Function | null | Callback for seek events |

## Methods

| Method | Description |
|--------|-------------|
| `export()` | Exports the waveform data for later use |
| `restore(exportedData)` | Restores previously exported waveform data |
| `destroy()` | Removes the waveform player and cleans up resources |

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audio Waveform Player</title>
</head>
<body>
    <div class="player-wrapper">
        <input type="file" id="audio-file" accept="audio/*">
        <div class="controls">
            <button class="play-button">▶</button>
            <div id="waveform"></div>
            <div class="time-display">0:00</div>
        </div>
        <audio id="audio-element"></audio>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="waveform.js"></script>
    <script>
        $(document).ready(function() {
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            let waveform = $('#waveform').waveform({
                audioElement: '#audio-element',
                audioContext: audioContext,
                segments: 100,
                samplingQuality: 'medium',
                activeColor: "#2196F3",
                inactiveColor: "#E3F2FD",
                loadingText: "Loading waveform...",
                onProgressChange: function (progress) {
                    // Handle progress change
                },
                onSeek: function (progress) {
                    // Handle seek
                }
            });

            // Example of exporting waveform data
            const exportedData = waveform.data('waveform').export();

            // Example of restoring waveform data
            waveform.data('waveform').restore(exportedData);
        });
    </script>
</body>
</html>
```

## Performance Optimization

- Use `samplingQuality: 'low'` for large audio files
- Adjust `segments` value based on container width
- Consider using a lower number of segments for mobile devices
- Take advantage of the chunked processing feature for large files
- Use the export/restore methods to cache waveform data for frequently used audio files

## Browser Support

- Chrome 34+
- Firefox 25+
- Safari 6+
- Edge 12+
- Opera 21+
- iOS Safari 6+
- Android Browser 4.4+

## Technical Requirements

- jQuery 1.7+
- Web Audio API support in the browser
- Modern browser with ES6+ support

## License

Copyright (c) 2025 - Licensed under the MIT license.

## Support

For issues, feature requests, or questions, please use the [GitHub Issues](https://github.com/salarizadi/waveform/issues) page.
